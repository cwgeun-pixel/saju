-- ============================================
-- Trinity of Destiny — Supabase DB 스키마
-- SQL Editor에서 전체 실행
-- ============================================

-- ── 1. profiles 테이블 (회원 기본 정보) ──────────
create table if not exists public.profiles (
  id            uuid references auth.users on delete cascade primary key,
  email         text not null,
  full_name     text,
  avatar_url    text,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

-- 회원 가입 시 자동으로 profiles 생성
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── 2. subscriptions 테이블 (구독/결제 상태) ──────
create table if not exists public.subscriptions (
  id                       uuid default gen_random_uuid() primary key,
  user_id                  uuid references auth.users on delete cascade not null unique,
  stripe_customer_id       text unique,
  stripe_subscription_id   text unique,
  stripe_price_id          text,
  status                   text not null default 'inactive',
  -- status: active | inactive | canceled | past_due | trialing
  current_period_start     timestamptz,
  current_period_end       timestamptz,
  cancel_at_period_end     boolean default false,
  created_at               timestamptz default now() not null,
  updated_at               timestamptz default now() not null
);


-- ── 3. readings_log 테이블 (계산 이용 기록) ───────
create table if not exists public.readings_log (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users on delete cascade not null,
  type        text not null, -- saju | ziwei | natal
  input_data  jsonb,
  created_at  timestamptz default now() not null
);


-- ── 4. updated_at 자동 갱신 함수 ─────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.set_updated_at();


-- ── 5. Row Level Security (RLS) ───────────────────
alter table public.profiles      enable row level security;
alter table public.subscriptions enable row level security;
alter table public.readings_log  enable row level security;

-- profiles: 본인 데이터만 읽기/수정
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- subscriptions: 본인 데이터만 읽기 (쓰기는 서버에서만)
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);

-- readings_log: 본인 데이터 읽기/추가
create policy "readings_select_own" on public.readings_log
  for select using (auth.uid() = user_id);
create policy "readings_insert_own" on public.readings_log
  for insert with check (auth.uid() = user_id);


-- ── 6. 구독 여부 확인 함수 ────────────────────────
create or replace function public.is_subscribed()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = auth.uid()
      and status = 'active'
      and current_period_end > now()
  );
$$;
