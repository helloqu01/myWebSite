-- Run once in the Supabase SQL editor before uploading hospital PDF documents.
-- The bucket remains private and the existing storage.objects RLS policies still apply.

update storage.buckets
set allowed_mime_types = (
  select array_agg(distinct mime_type order by mime_type)
  from unnest(coalesce(allowed_mime_types, array[]::text[]) || array['application/pdf']) as mime_type
)
where id = 'cat-medical-documents';
