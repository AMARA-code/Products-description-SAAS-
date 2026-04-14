-- Add/align plan + billing fields required by PayFast webhook flow.
-- Safe to run multiple times.

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
