-- Bảng public.moi_tuan_mot_dieu_luat: mỗi tuần trong tháng một điều luật (ảnh, file, link, người tạo)
-- + Storage bucket moi-tuan-mot-dieu-luat (images/*, files/*)
-- Chạy: supabase db push / SQL Editor

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.moi_tuan_mot_dieu_luat (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nam integer NOT NULL,
  thang integer NOT NULL,
  tuan integer NOT NULL,
  nam_thang text GENERATED ALWAYS AS (
    nam::text || '/' || lpad(thang::text, 2, '0')
  ) STORED,
  nam_thang_tuan text GENERATED ALWAYS AS (
    nam::text || '/' || lpad(thang::text, 2, '0') || ' T' || tuan::text
  ) STORED,
  ten_dieu_luat text NOT NULL,
  hinh_anh text,
  ghi_chu text,
  tep_dinh_kem text,
  link text,
  id_nguoi_tao bigint REFERENCES public.danh_sach_quan_nhan (id) ON DELETE SET NULL,
  tg_tao timestamptz NOT NULL DEFAULT (timezone('utc', now())),
  tg_cap_nhat timestamptz NOT NULL DEFAULT (timezone('utc', now())),
  CONSTRAINT moi_tuan_mot_dieu_luat_thang_chk CHECK (thang >= 1 AND thang <= 12),
  CONSTRAINT moi_tuan_mot_dieu_luat_tuan_chk CHECK (tuan >= 1 AND tuan <= 6),
  CONSTRAINT moi_tuan_mot_dieu_luat_nam_thang_tuan_uniq UNIQUE (nam, thang, tuan)
);

COMMENT ON TABLE public.moi_tuan_mot_dieu_luat IS 'Mỗi tuần 1 điều luật — theo (nam, thang, tuan trong tháng); id_nguoi_tao → danh_sach_quan_nhan.';

CREATE INDEX IF NOT EXISTS idx_moi_tuan_mot_dieu_luat_nam_thang_tuan
  ON public.moi_tuan_mot_dieu_luat USING btree (nam DESC, thang DESC, tuan DESC);

CREATE INDEX IF NOT EXISTS idx_moi_tuan_mot_dieu_luat_id_nguoi_tao
  ON public.moi_tuan_mot_dieu_luat USING btree (id_nguoi_tao);

CREATE INDEX IF NOT EXISTS idx_moi_tuan_mot_dieu_luat_tg_cap_nhat
  ON public.moi_tuan_mot_dieu_luat USING btree (tg_cap_nhat DESC);

CREATE OR REPLACE FUNCTION public.set_moi_tuan_mot_dieu_luat_tg_cap_nhat()
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

DROP TRIGGER IF EXISTS trg_moi_tuan_mot_dieu_luat_set_tg_cap_nhat ON public.moi_tuan_mot_dieu_luat;

CREATE TRIGGER trg_moi_tuan_mot_dieu_luat_set_tg_cap_nhat
  BEFORE UPDATE ON public.moi_tuan_mot_dieu_luat
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_moi_tuan_mot_dieu_luat_tg_cap_nhat();

ALTER TABLE public.moi_tuan_mot_dieu_luat ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "moi_tuan_mot_dieu_luat_select_authenticated" ON public.moi_tuan_mot_dieu_luat;
DROP POLICY IF EXISTS "moi_tuan_mot_dieu_luat_insert_authenticated" ON public.moi_tuan_mot_dieu_luat;
DROP POLICY IF EXISTS "moi_tuan_mot_dieu_luat_update_authenticated" ON public.moi_tuan_mot_dieu_luat;
DROP POLICY IF EXISTS "moi_tuan_mot_dieu_luat_delete_authenticated" ON public.moi_tuan_mot_dieu_luat;

CREATE POLICY "moi_tuan_mot_dieu_luat_select_authenticated"
  ON public.moi_tuan_mot_dieu_luat
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "moi_tuan_mot_dieu_luat_insert_authenticated"
  ON public.moi_tuan_mot_dieu_luat
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "moi_tuan_mot_dieu_luat_update_authenticated"
  ON public.moi_tuan_mot_dieu_luat
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "moi_tuan_mot_dieu_luat_delete_authenticated"
  ON public.moi_tuan_mot_dieu_luat
  FOR DELETE
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- Storage bucket
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'moi-tuan-mot-dieu-luat',
  'moi-tuan-mot-dieu-luat',
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

DROP POLICY IF EXISTS "moi_tuan_mot_dieu_luat_storage_select_public" ON storage.objects;
DROP POLICY IF EXISTS "moi_tuan_mot_dieu_luat_storage_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "moi_tuan_mot_dieu_luat_storage_update_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "moi_tuan_mot_dieu_luat_storage_delete_authenticated" ON storage.objects;

CREATE POLICY "moi_tuan_mot_dieu_luat_storage_select_public"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'moi-tuan-mot-dieu-luat');

CREATE POLICY "moi_tuan_mot_dieu_luat_storage_insert_authenticated"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'moi-tuan-mot-dieu-luat');

CREATE POLICY "moi_tuan_mot_dieu_luat_storage_update_authenticated"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'moi-tuan-mot-dieu-luat')
  WITH CHECK (bucket_id = 'moi-tuan-mot-dieu-luat');

CREATE POLICY "moi_tuan_mot_dieu_luat_storage_delete_authenticated"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'moi-tuan-mot-dieu-luat');
