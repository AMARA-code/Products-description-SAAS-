-- Production subscription hardening for PayFast + SaaS access checks.
-- Safe to run multiple times.

alter table public.profiles
  add column if not exists plan_type text,
  add column if not exists subscription_start timestamptz,
  add column if not exists subscription_end timestamptz;

update public.profiles
set plan_type = case
  when lower(coalesce(plan_type, '')) in ('basic', 'pro', 'enterprise') then lower(plan_type)
  when plan = 'PRO' then 'pro'
  when plan = 'AGENCY' then 'enterprise'
  else 'basic'
end
where plan_type is null or trim(plan_type) = '';

update public.profiles
set subscription_start = coalesce(subscription_start, now())
where subscription_start is null;

update public.profiles
set subscription_end = coalesce(subscription_end, expiry_date, now() + interval '30 day')
where subscription_end is null;

alter table public.profiles
  alter column plan_type set default 'basic',
  alter column plan_type set not null;

create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists profiles_subscription_status_idx on public.profiles (subscription_status);

-- Optional compatibility view requested as "users table".
-- Skip if a real users table already exists.
do $$
begin
  if not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'users'
      and c.relkind in ('r', 'p')
  ) then
    create or replace view public.users as
    select
      id,
      email,
      plan_type,
      subscription_status,
      subscription_start,
      subscription_end,
      updated_at
    from public.profiles;
  end if;
end$$;

-- Extend payments for PayFast webhook logging + idempotency.
alter table public.payments
  add column if not exists provider text,
  add column if not exists payment_id text,
  add column if not exists event_type text,
  add column if not exists raw_payload jsonb,
  add column if not exists signature_valid boolean default false,
  add column if not exists verified_at timestamptz,
  add column if not exists processed_at timestamptz,
  add column if not exists amount numeric;

update public.payments
set provider = coalesce(provider, 'stripe')
where provider is null;

create unique index if not exists payments_provider_payment_id_uniq
  on public.payments (provider, payment_id)
  where payment_id is not null;

create index if not exists payments_provider_status_idx
  on public.payments (provider, status, created_at desc);
