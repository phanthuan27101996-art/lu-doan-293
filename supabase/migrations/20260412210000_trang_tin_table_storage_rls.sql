-- Bảng public.trang_tin: tin bài, nhiều ảnh (jsonb), FK người tạo → danh_sach_quan_nhan
-- + Storage bucket trang-tin (ảnh public URL)
-- Chạy: supabase db push / SQL Editor

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trang_tin (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ngay_dang date NOT NULL,
  tieu_de text NOT NULL,
  mo_ta_ngan text NOT NULL,
  hinh_anh jsonb NOT NULL DEFAULT '[]'::jsonb,
  link text,
  id_nguoi_tao bigint REFERENCES public.danh_sach_quan_nhan (id) ON DELETE SET NULL,
  tg_tao timestamptz NOT NULL DEFAULT (timezone('utc', now())),
  tg_cap_nhat timestamptz NOT NULL DEFAULT (timezone('utc', now())),
  CONSTRAINT trang_tin_hinh_anh_is_array CHECK (jsonb_typeof(hinh_anh) = 'array')
);

COMMENT ON TABLE public.trang_tin IS 'Trang tin — danh sách bài viết, nhiều URL ảnh trong hinh_anh (jsonb array).';

-- ---------------------------------------------------------------------------
-- Index
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_trang_tin_ngay_dang ON public.trang_tin USING btree (ngay_dang DESC);

CREATE INDEX IF NOT EXISTS idx_trang_tin_id_nguoi_tao ON public.trang_tin USING btree (id_nguoi_tao);

-- ---------------------------------------------------------------------------
-- Trigger: mỗi UPDATE → tg_cap_nhat = now() UTC
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_trang_tin_tg_cap_nhat()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.tg_cap_nhat := timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_trang_tin_set_tg_cap_nhat ON public.trang_tin;

CREATE TRIGGER trg_trang_tin_set_tg_cap_nhat
  BEFORE UPDATE ON public.trang_tin
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_trang_tin_tg_cap_nhat();

-- ---------------------------------------------------------------------------
-- RLS: authenticated — full CRUD (đồng bộ các bảng nội bộ khác)
-- ---------------------------------------------------------------------------
ALTER TABLE public.trang_tin ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "trang_tin_select_authenticated" ON public.trang_tin;
DROP POLICY IF EXISTS "trang_tin_insert_authenticated" ON public.trang_tin;
DROP POLICY IF EXISTS "trang_tin_update_authenticated" ON public.trang_tin;
DROP POLICY IF EXISTS "trang_tin_delete_authenticated" ON public.trang_tin;

CREATE POLICY "trang_tin_select_authenticated"
  ON public.trang_tin
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "trang_tin_insert_authenticated"
  ON public.trang_tin
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "trang_tin_update_authenticated"
  ON public.trang_tin
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "trang_tin_delete_authenticated"
  ON public.trang_tin
  FOR DELETE
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- Storage bucket (public URL cho getPublicUrl)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trang-tin',
  'trang-tin',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policies trên storage.objects
DROP POLICY IF EXISTS "trang_tin_storage_select_public" ON storage.objects;
DROP POLICY IF EXISTS "trang_tin_storage_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "trang_tin_storage_update_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "trang_tin_storage_delete_authenticated" ON storage.objects;

CREATE POLICY "trang_tin_storage_select_public"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'trang-tin');

CREATE POLICY "trang_tin_storage_insert_authenticated"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'trang-tin');

CREATE POLICY "trang_tin_storage_update_authenticated"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'trang-tin')
  WITH CHECK (bucket_id = 'trang-tin');

CREATE POLICY "trang_tin_storage_delete_authenticated"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'trang-tin');
