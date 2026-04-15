-- Bucket ảnh module Truyền thống (lãnh đạo / LĐ trưởng / chính ủy)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'truyen-thong',
  'truyen-thong',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "truyen_thong_storage_select_public" ON storage.objects;
DROP POLICY IF EXISTS "truyen_thong_storage_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "truyen_thong_storage_update_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "truyen_thong_storage_delete_authenticated" ON storage.objects;

CREATE POLICY "truyen_thong_storage_select_public"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'truyen-thong');

CREATE POLICY "truyen_thong_storage_insert_authenticated"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'truyen-thong');

CREATE POLICY "truyen_thong_storage_update_authenticated"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'truyen-thong')
  WITH CHECK (bucket_id = 'truyen-thong');

CREATE POLICY "truyen_thong_storage_delete_authenticated"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'truyen-thong');
