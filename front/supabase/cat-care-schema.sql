-- Supabase SQL Editor 또는 마이그레이션에서 한 번 실행합니다.
-- 브라우저에는 publishable/anon key만 사용하고 service_role key는 절대 넣지 마세요.

create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table if not exists public.cat_care_households (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  invite_code text not null unique,
  care_data jsonb not null default '{}'::jsonb
    check (jsonb_typeof(care_data) = 'object'),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cat_care_members (
  household_id uuid not null references public.cat_care_households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (household_id, user_id),
  unique (user_id)
);

-- user_id의 unique 인덱스와 (household_id, user_id) 기본키 인덱스는
-- 구성원 조회에 그대로 사용됩니다. 생성자 외래키만 별도 인덱스를 둡니다.
create index if not exists cat_care_households_created_by_idx
  on public.cat_care_households(created_by);

alter table public.cat_care_households enable row level security;
alter table public.cat_care_members enable row level security;

drop policy if exists "members read household" on public.cat_care_households;
drop policy if exists "editors update household" on public.cat_care_households;
drop policy if exists "members read memberships" on public.cat_care_members;

-- 이전 버전에서 공개 스키마에 만들었던 보조 함수가 있으면 제거합니다.
drop function if exists public.is_cat_care_member(uuid);
drop function if exists public.can_edit_cat_care(uuid);

-- RLS 재귀를 피하는 내부 보조 함수입니다. private 스키마는 Data API에 노출하지 않습니다.
create or replace function private.is_cat_care_member(target_household uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.cat_care_members
    where household_id = target_household
      and user_id = (select auth.uid())
  );
$$;

create or replace function private.can_edit_cat_care(target_household uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.cat_care_members
    where household_id = target_household
      and user_id = (select auth.uid())
      and role in ('owner', 'editor')
  );
$$;

revoke all on function private.is_cat_care_member(uuid) from public, anon, authenticated;
revoke all on function private.can_edit_cat_care(uuid) from public, anon, authenticated;
grant execute on function private.is_cat_care_member(uuid) to authenticated;
grant execute on function private.can_edit_cat_care(uuid) to authenticated;

create policy "members read household"
  on public.cat_care_households
  for select
  to authenticated
  using (private.is_cat_care_member(id));

create policy "editors update household"
  on public.cat_care_households
  for update
  to authenticated
  using (private.can_edit_cat_care(id))
  with check (private.can_edit_cat_care(id));

create policy "members read memberships"
  on public.cat_care_members
  for select
  to authenticated
  using (private.is_cat_care_member(household_id));

-- 공개 테이블은 필요한 동작과 열만 허용합니다. RLS가 행 범위를 추가로 제한합니다.
revoke all on table public.cat_care_households from public, anon, authenticated;
revoke all on table public.cat_care_members from public, anon, authenticated;
grant select on table public.cat_care_households to authenticated;
grant update (care_data, updated_at) on table public.cat_care_households to authenticated;
grant select on table public.cat_care_members to authenticated;

create or replace function public.get_my_cat_care_household()
returns table (
  id uuid,
  name text,
  invite_code text,
  role text,
  care_data jsonb,
  updated_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select h.id, h.name, h.invite_code, m.role, h.care_data, h.updated_at
  from public.cat_care_members as m
  join public.cat_care_households as h on h.id = m.household_id
  where m.user_id = (select auth.uid())
  limit 1;
$$;

-- 쓰기 권한이 필요한 로직은 비공개 스키마에 두고, 공개 RPC는 invoker 래퍼로 둡니다.
create or replace function private.create_cat_care_household_internal(
  p_name text,
  p_care_data jsonb
)
returns table (
  id uuid,
  name text,
  invite_code text,
  role text,
  care_data jsonb,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception '로그인이 필요합니다.';
  end if;

  if exists (
    select 1 from public.cat_care_members
    where user_id = (select auth.uid())
  ) then
    raise exception '이미 참여 중인 가족 공간이 있습니다.';
  end if;

  insert into public.cat_care_households as h (
    name,
    invite_code,
    care_data,
    created_by
  )
  values (
    coalesce(nullif(btrim(p_name), ''), '우리 고양이 가족'),
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 20)),
    case
      when jsonb_typeof(coalesce(p_care_data, '{}'::jsonb)) = 'object'
        then coalesce(p_care_data, '{}'::jsonb)
      else '{}'::jsonb
    end,
    (select auth.uid())
  )
  returning h.id into new_id;

  insert into public.cat_care_members (household_id, user_id, role)
  values (new_id, (select auth.uid()), 'owner');

  return query
  select h.id, h.name, h.invite_code, 'owner'::text, h.care_data, h.updated_at
  from public.cat_care_households as h
  where h.id = new_id;
end;
$$;

create or replace function private.join_cat_care_household_internal(p_invite_code text)
returns table (
  id uuid,
  name text,
  invite_code text,
  role text,
  care_data jsonb,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception '로그인이 필요합니다.';
  end if;

  if exists (
    select 1 from public.cat_care_members
    where user_id = (select auth.uid())
  ) then
    raise exception '이미 참여 중인 가족 공간이 있습니다.';
  end if;

  select h.id
  into target_id
  from public.cat_care_households as h
  where h.invite_code = upper(btrim(p_invite_code));

  if target_id is null then
    raise exception '공유 코드를 찾을 수 없습니다.';
  end if;

  insert into public.cat_care_members (household_id, user_id, role)
  values (target_id, (select auth.uid()), 'editor');

  return query
  select h.id, h.name, h.invite_code, 'editor'::text, h.care_data, h.updated_at
  from public.cat_care_households as h
  where h.id = target_id;
end;
$$;

revoke all on function private.create_cat_care_household_internal(text, jsonb)
  from public, anon, authenticated;
revoke all on function private.join_cat_care_household_internal(text)
  from public, anon, authenticated;
grant execute on function private.create_cat_care_household_internal(text, jsonb)
  to authenticated;
grant execute on function private.join_cat_care_household_internal(text)
  to authenticated;

create or replace function public.create_cat_care_household(
  p_name text,
  p_care_data jsonb
)
returns table (
  id uuid,
  name text,
  invite_code text,
  role text,
  care_data jsonb,
  updated_at timestamptz
)
language sql
volatile
security invoker
set search_path = ''
as $$
  select *
  from private.create_cat_care_household_internal(p_name, p_care_data);
$$;

create or replace function public.join_cat_care_household(p_invite_code text)
returns table (
  id uuid,
  name text,
  invite_code text,
  role text,
  care_data jsonb,
  updated_at timestamptz
)
language sql
volatile
security invoker
set search_path = ''
as $$
  select *
  from private.join_cat_care_household_internal(p_invite_code);
$$;

revoke all on function public.get_my_cat_care_household() from public, anon, authenticated;
revoke all on function public.create_cat_care_household(text, jsonb) from public, anon, authenticated;
revoke all on function public.join_cat_care_household(text) from public, anon, authenticated;
grant execute on function public.get_my_cat_care_household() to authenticated;
grant execute on function public.create_cat_care_household(text, jsonb) to authenticated;
grant execute on function public.join_cat_care_household(text) to authenticated;

-- 프로젝트에 설치된 RLS 자동 활성화 이벤트 함수는 직접 RPC 호출할 이유가 없습니다.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end;
$$;

-- 병원 차트·검사결과 원본은 공개 URL이 없는 전용 Storage 버킷에 저장합니다.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cat-medical-documents',
  'cat-medical-documents',
  false,
  31457280,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create or replace function private.can_access_cat_medical_object(
  object_name text,
  require_edit boolean
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  path_parts text[] := storage.foldername(object_name);
  target_household_id uuid;
begin
  if current_user_id is null
     or coalesce(array_length(path_parts, 1), 0) < 4
     or path_parts[3] not in ('chart', 'examination', 'observation', 'food-label') then
    return false;
  end if;

  begin
    target_household_id := path_parts[1]::uuid;
  exception when invalid_text_representation then
    return false;
  end;

  return exists (
    select 1
    from public.cat_care_members as member
    where member.household_id = target_household_id
      and member.user_id = current_user_id
      and (not require_edit or member.role in ('owner', 'editor'))
  );
end;
$$;

revoke all on function private.can_access_cat_medical_object(text, boolean)
  from public, anon, authenticated;
grant execute on function private.can_access_cat_medical_object(text, boolean)
  to authenticated;

drop policy if exists "cat medical members read" on storage.objects;
create policy "cat medical members read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'cat-medical-documents'
  and private.can_access_cat_medical_object(name, false)
);

drop policy if exists "cat medical editors insert" on storage.objects;
create policy "cat medical editors insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'cat-medical-documents'
  and private.can_access_cat_medical_object(name, true)
);

drop policy if exists "cat medical editors update" on storage.objects;
create policy "cat medical editors update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'cat-medical-documents'
  and private.can_access_cat_medical_object(name, true)
)
with check (
  bucket_id = 'cat-medical-documents'
  and private.can_access_cat_medical_object(name, true)
);

drop policy if exists "cat medical editors delete" on storage.objects;
create policy "cat medical editors delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'cat-medical-documents'
  and private.can_access_cat_medical_object(name, true)
);
