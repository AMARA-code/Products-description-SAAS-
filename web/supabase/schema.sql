-- Describeflow — run in Supabase SQL Editor (PostgreSQL 15+)
-- Creates tables, RLS, and RPCs for usage + auth-linked profiles.

create extension if not exists "pgcrypto";

-- Profiles (1:1 with auth.users)
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

-- Monthly usage (resets by calendar month key YYYY-MM)
create table if not exists public.usage_monthly (
  user_id uuid not null references public.profiles (id) on delete cascade,
  year_month text not null,
  generations_used integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, year_month)
);

-- Generated descriptions history
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

-- Payment records (Stripe Checkout / webhooks)
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

-- New user → profile row
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

-- Consume one generation if under limit (current calendar month)
create or replace function public.try_consume_generation()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  v_limit integer;
  v_used integer;
  v_month text := to_char (timezone('utc', now()), 'YYYY-MM');
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'reason', 'unauthorized');
  end if;

  select monthly_generation_limit into v_limit
  from public.profiles where id = uid;

  if v_limit is null then
    v_limit := 50;
  end if;

  insert into public.usage_monthly (user_id, year_month, generations_used)
  values (uid, v_month, 0)
  on conflict (user_id, year_month) do nothing;

  select generations_used into v_used
  from public.usage_monthly
  where user_id = uid and year_month = v_month
  for update;

  if v_used >= v_limit then
    return jsonb_build_object(
      'ok', false,
      'reason', 'limit',
      'used', v_used,
      'limit', v_limit,
      'month', v_month
    );
  end if;

  update public.usage_monthly
  set
    generations_used = generations_used + 1,
    updated_at = now()
  where user_id = uid and year_month = v_month;

  return jsonb_build_object(
    'ok', true,
    'used', v_used + 1,
    'limit', v_limit,
    'month', v_month
  );
end;
$$;

grant execute on function public.try_consume_generation() to authenticated;

-- Refund one generation if AI failed after consume
create or replace function public.refund_generation()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
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
$$;

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


-- Storage bucket (create bucket "product-images" in Dashboard → Storage; set policies as needed)
-- Public read optional; authenticated upload recommended.
