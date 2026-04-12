-- Bảng public.cong_van: công văn (đơn vị, ngày, tên, ghi chú, file, link, người tạo)
-- + Storage bucket cong-van (file đính kèm, public URL)
-- Chạy: supabase db push / SQL Editor

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cong_van (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  don_vi text NOT NULL DEFAULT '',
  ngay date NOT NULL,
  ten_van_ban text NOT NULL,
  ghi_chu text,
  tep_dinh_kem text,
  link text,
  id_nguoi_tao bigint REFERENCES public.danh_sach_quan_nhan (id) ON DELETE SET NULL,
  tg_tao timestamptz NOT NULL DEFAULT (timezone('utc', now())),
  tg_cap_nhat timestamptz NOT NULL DEFAULT (timezone('utc', now()))
);

COMMENT ON TABLE public.cong_van IS 'Công văn — đơn vị, ngày, tên văn bản, file/link; id_nguoi_tao → danh_sach_quan_nhan.';

CREATE INDEX IF NOT EXISTS idx_cong_van_don_vi ON public.cong_van USING btree (don_vi);

CREATE INDEX IF NOT EXISTS idx_cong_van_ngay ON public.cong_van USING btree (ngay DESC);

CREATE INDEX IF NOT EXISTS idx_cong_van_ten ON public.cong_van USING btree (ten_van_ban);

CREATE INDEX IF NOT EXISTS idx_cong_van_id_nguoi_tao ON public.cong_van USING btree (id_nguoi_tao);

CREATE INDEX IF NOT EXISTS idx_cong_van_tg_cap_nhat ON public.cong_van USING btree (tg_cap_nhat DESC);

CREATE OR REPLACE FUNCTION public.set_cong_van_tg_cap_nhat()
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

DROP TRIGGER IF EXISTS trg_cong_van_set_tg_cap_nhat ON public.cong_van;

CREATE TRIGGER trg_cong_van_set_tg_cap_nhat
  BEFORE UPDATE ON public.cong_van
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_cong_van_tg_cap_nhat();

ALTER TABLE public.cong_van ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cong_van_select_authenticated" ON public.cong_van;
DROP POLICY IF EXISTS "cong_van_insert_authenticated" ON public.cong_van;
DROP POLICY IF EXISTS "cong_van_update_authenticated" ON public.cong_van;
DROP POLICY IF EXISTS "cong_van_delete_authenticated" ON public.cong_van;

CREATE POLICY "cong_van_select_authenticated"
  ON public.cong_van
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "cong_van_insert_authenticated"
  ON public.cong_van
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "cong_van_update_authenticated"
  ON public.cong_van
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "cong_van_delete_authenticated"
  ON public.cong_van
  FOR DELETE
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- Storage bucket
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cong-van',
  'cong-van',
  true,
  20971520,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "cong_van_storage_select_public" ON storage.objects;
DROP POLICY IF EXISTS "cong_van_storage_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "cong_van_storage_update_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "cong_van_storage_delete_authenticated" ON storage.objects;

CREATE POLICY "cong_van_storage_select_public"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'cong-van');

CREATE POLICY "cong_van_storage_insert_authenticated"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'cong-van');

CREATE POLICY "cong_van_storage_update_authenticated"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'cong-van')
  WITH CHECK (bucket_id = 'cong-van');

CREATE POLICY "cong_van_storage_delete_authenticated"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'cong-van');
