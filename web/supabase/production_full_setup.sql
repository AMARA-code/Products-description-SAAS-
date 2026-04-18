-- Describeflow production full setup (single-run script)
-- Safe to run multiple times.
-- Includes base schema + PayFast/subscription hardening.

create extension if not exists "pgcrypto";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  plan_slug text not null default 'basic'
    check (plan_slug in ('basic', 'pro', 'agency')),
  monthly_generation_limit integer not null default 50,
  stripe_customer_id text unique,
  subscription_status text default 'inactive',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_stripe_customer_id_idx on public.profiles (stripe_customer_id);

-- Usage
create table if not exists public.usage_monthly (
  user_id uuid not null references public.profiles (id) on delete cascade,
  year_month text not null,
  generations_used integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, year_month)
);

-- Generations
create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text,
  source_type text not null check (source_type in ('image', 'text')),
  product_name text,
  category text,
  image_url text,
  description text not null,
  created_at timestamptz not null default now()
);

create index if not exists generations_user_created_idx
  on public.generations (user_id, created_at desc);

-- Payments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  stripe_session_id text unique,
  stripe_subscription_id text,
  amount_cents integer,
  currency text default 'usd',
  status text,
  created_at timestamptz not null default now()
);

-- Auth trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, monthly_generation_limit)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    50
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Usage consume function
create or replace function public.try_consume_generation()
returns jsonb
language plpgsql
security definer
set search_path = public
as $try_consume$
declare
  uid uuid := auth.uid();
  limit_value integer := 50;
  used_value integer := 0;
  current_month text := to_char(timezone('utc', now()), 'YYYY-MM');
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'reason', 'unauthorized');
  end if;

  select coalesce(monthly_generation_limit, 50) into limit_value
  from public.profiles where id = uid;

  insert into public.usage_monthly (user_id, year_month, generations_used)
  values (uid, current_month, 0)
  on conflict (user_id, year_month) do nothing;

  select coalesce(generations_used, 0) into used_value
  from public.usage_monthly
  where user_id = uid and year_month = current_month
  for update;

  if used_value >= limit_value then
    return jsonb_build_object(
      'ok', false,
      'reason', 'limit',
      'used', used_value,
      'limit', limit_value,
      'month', current_month
    );
  end if;

  update public.usage_monthly
  set
    generations_used = generations_used + 1,
    updated_at = now()
  where user_id = uid and year_month = current_month;

  return jsonb_build_object(
    'ok', true,
    'used', used_value + 1,
    'limit', limit_value,
    'month', current_month
  );
end;
$try_consume$;

grant execute on function public.try_consume_generation() to authenticated;

-- Usage refund function
create or replace function public.refund_generation()
returns jsonb
language plpgsql
security definer
set search_path = public
as $refund_generation$
declare
  uid uuid := auth.uid();
  v_month text := to_char (timezone('utc', now()), 'YYYY-MM');
begin
  if uid is null then
    return jsonb_build_object('ok', false);
  end if;

  update public.usage_monthly
  set
    generations_used = greatest(0, generations_used - 1),
    updated_at = now()
  where user_id = uid and year_month = v_month;

  return jsonb_build_object('ok', true);
end;
$refund_generation$;

grant execute on function public.refund_generation() to authenticated;

-- RLS
alter table public.profiles enable row level security;
alter table public.usage_monthly enable row level security;
alter table public.generations enable row level security;
alter table public.payments enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "usage_select_own" on public.usage_monthly;
create policy "usage_select_own" on public.usage_monthly
  for select using (auth.uid() = user_id);

drop policy if exists "generations_select_own" on public.generations;
create policy "generations_select_own" on public.generations
  for select using (auth.uid() = user_id);

drop policy if exists "generations_insert_own" on public.generations;
create policy "generations_insert_own" on public.generations
  for insert with check (auth.uid() = user_id);

drop policy if exists "generations_delete_own" on public.generations;
create policy "generations_delete_own" on public.generations
  for delete using (auth.uid() = user_id);

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own" on public.payments
  for select using (auth.uid() = user_id);

-- PayFast compatibility fields
alter table public.profiles
  add column if not exists plan text,
  add column if not exists ai_requests_used integer,
  add column if not exists ai_requests_limit integer,
  add column if not exists expiry_date timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_plan_check'
  ) then
    alter table public.profiles
      add constraint profiles_plan_check
      check (plan in ('BASIC', 'PRO', 'AGENCY'));
  end if;
end$$;

update public.profiles
set
  plan = case
    when coalesce(plan, '') <> '' then plan
    when plan_slug = 'pro' then 'PRO'
    when plan_slug = 'agency' then 'AGENCY'
    else 'BASIC'
  end,
  ai_requests_used = coalesce(ai_requests_used, 0),
  ai_requests_limit = case
    when ai_requests_limit is not null then ai_requests_limit
    when monthly_generation_limit is not null and monthly_generation_limit > 0 then monthly_generation_limit
    when plan_slug = 'pro' then 2000
    when plan_slug = 'agency' then 10000
    else 60
  end,
  subscription_status = coalesce(nullif(subscription_status, ''), 'inactive'),
  expiry_date = coalesce(expiry_date, now());

alter table public.profiles
  alter column plan set default 'BASIC',
  alter column plan set not null,
  alter column ai_requests_used set default 0,
  alter column ai_requests_used set not null,
  alter column ai_requests_limit set default 60,
  alter column ai_requests_limit set not null,
  alter column subscription_status set default 'inactive',
  alter column subscription_status set not null;

-- Subscription hardening fields
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
