-- Run once in the Supabase SQL editor before enabling observation video uploads.
-- The bucket remains private; existing RLS policies continue to call the helper below.

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
