-- ============================
-- CREON - Supabase Schema
-- Supabase SQL Editor에서 실행하세요
-- ============================

-- 1. profiles (사용자 프로필)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  is_blocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. api_keys (사용자별 Gemini API 키)
create table if not exists api_keys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  encrypted_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. generations (사용량 로그)
create table if not exists generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null check (type in ('image', 'video', 'svg', 'icon', 'composition')),
  model text,
  prompt text,
  created_at timestamptz not null default now()
);

-- 4. storage_items (생성물 저장)
create table if not exists storage_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  generation_id uuid references generations on delete set null,
  storage_path text not null,
  file_type text not null,
  file_size bigint,
  original_name text,
  created_at timestamptz not null default now()
);

-- ============================
-- RLS (Row Level Security)
-- ============================

alter table profiles enable row level security;
alter table api_keys enable row level security;
alter table generations enable row level security;
alter table storage_items enable row level security;

-- profiles: 본인 조회/수정, 어드민 전체 조회
create policy "profiles: 본인 조회" on profiles for select using (auth.uid() = id);
create policy "profiles: 본인 수정" on profiles for update using (auth.uid() = id);
create policy "profiles: 어드민 전체 조회" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "profiles: 어드민 수정" on profiles for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- api_keys: 본인만 조회/수정
create policy "api_keys: 본인 조회" on api_keys for select using (auth.uid() = user_id);
create policy "api_keys: 본인 삽입" on api_keys for insert with check (auth.uid() = user_id);
create policy "api_keys: 본인 수정" on api_keys for update using (auth.uid() = user_id);
create policy "api_keys: 본인 삭제" on api_keys for delete using (auth.uid() = user_id);

-- generations: 본인 조회/삽입, 어드민 전체 조회
create policy "generations: 본인 조회" on generations for select using (auth.uid() = user_id);
create policy "generations: 본인 삽입" on generations for insert with check (auth.uid() = user_id);
create policy "generations: 어드민 전체 조회" on generations for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- storage_items: 본인 조회/삽입/삭제, 어드민 전체 조회
create policy "storage_items: 본인 조회" on storage_items for select using (auth.uid() = user_id);
create policy "storage_items: 본인 삽입" on storage_items for insert with check (auth.uid() = user_id);
create policy "storage_items: 본인 삭제" on storage_items for delete using (auth.uid() = user_id);
create policy "storage_items: 어드민 전체 조회" on storage_items for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- ============================
-- Trigger: 신규 가입 시 profiles 자동 생성
-- ============================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, is_blocked)
  values (new.id, new.email, 'user', false);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================
-- Storage Bucket
-- ============================

insert into storage.buckets (id, name, public)
values ('generations', 'generations', false)
on conflict (id) do nothing;

-- storage RLS: 본인 파일만 접근
create policy "storage: 본인 업로드" on storage.objects for insert with check (
  bucket_id = 'generations' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "storage: 본인 조회" on storage.objects for select using (
  bucket_id = 'generations' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "storage: 본인 삭제" on storage.objects for delete using (
  bucket_id = 'generations' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "storage: 어드민 전체 조회" on storage.objects for select using (
  bucket_id = 'generations' and
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- ============================
-- Index
-- ============================

create index if not exists idx_generations_user_id on generations(user_id);
create index if not exists idx_generations_created_at on generations(created_at);
create index if not exists idx_storage_items_user_id on storage_items(user_id);
