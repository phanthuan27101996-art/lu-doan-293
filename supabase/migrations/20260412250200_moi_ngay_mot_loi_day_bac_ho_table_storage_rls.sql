-- Bảng public.moi_ngay_mot_loi_day_bac_ho: mỗi ngày một lời dạy (ngày, ảnh, file, người tạo)
-- + Storage bucket moi-ngay-mot-loi-day-bac-ho (images/*, files/*)
-- Chạy: supabase db push / SQL Editor

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.moi_ngay_mot_loi_day_bac_ho (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ngay date NOT NULL,
  ten_tai_lieu text NOT NULL,
  hinh_anh text,
  tep_dinh_kem text,
  id_nguoi_tao bigint REFERENCES public.danh_sach_quan_nhan (id) ON DELETE SET NULL,
  tg_tao timestamptz NOT NULL DEFAULT (timezone('utc', now())),
  tg_cap_nhat timestamptz NOT NULL DEFAULT (timezone('utc', now())),
  CONSTRAINT moi_ngay_mot_loi_day_bac_ho_ngay_uniq UNIQUE (ngay)
);

COMMENT ON TABLE public.moi_ngay_mot_loi_day_bac_ho IS 'Mỗi ngày 1 lời dạy Bác Hồ — UNIQUE(ngay); id_nguoi_tao → danh_sach_quan_nhan.';

CREATE INDEX IF NOT EXISTS idx_moi_ngay_mot_loi_day_bac_ho_ngay
  ON public.moi_ngay_mot_loi_day_bac_ho USING btree (ngay DESC);

CREATE INDEX IF NOT EXISTS idx_moi_ngay_mot_loi_day_bac_ho_id_nguoi_tao
  ON public.moi_ngay_mot_loi_day_bac_ho USING btree (id_nguoi_tao);

CREATE INDEX IF NOT EXISTS idx_moi_ngay_mot_loi_day_bac_ho_tg_cap_nhat
  ON public.moi_ngay_mot_loi_day_bac_ho USING btree (tg_cap_nhat DESC);

CREATE OR REPLACE FUNCTION public.set_moi_ngay_mot_loi_day_bac_ho_tg_cap_nhat()
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

DROP TRIGGER IF EXISTS trg_moi_ngay_mot_loi_day_bac_ho_set_tg_cap_nhat ON public.moi_ngay_mot_loi_day_bac_ho;

CREATE TRIGGER trg_moi_ngay_mot_loi_day_bac_ho_set_tg_cap_nhat
  BEFORE UPDATE ON public.moi_ngay_mot_loi_day_bac_ho
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_moi_ngay_mot_loi_day_bac_ho_tg_cap_nhat();

ALTER TABLE public.moi_ngay_mot_loi_day_bac_ho ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "moi_ngay_mot_loi_day_bac_ho_select_authenticated" ON public.moi_ngay_mot_loi_day_bac_ho;
DROP POLICY IF EXISTS "moi_ngay_mot_loi_day_bac_ho_insert_authenticated" ON public.moi_ngay_mot_loi_day_bac_ho;
DROP POLICY IF EXISTS "moi_ngay_mot_loi_day_bac_ho_update_authenticated" ON public.moi_ngay_mot_loi_day_bac_ho;
DROP POLICY IF EXISTS "moi_ngay_mot_loi_day_bac_ho_delete_authenticated" ON public.moi_ngay_mot_loi_day_bac_ho;

CREATE POLICY "moi_ngay_mot_loi_day_bac_ho_select_authenticated"
  ON public.moi_ngay_mot_loi_day_bac_ho
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "moi_ngay_mot_loi_day_bac_ho_insert_authenticated"
  ON public.moi_ngay_mot_loi_day_bac_ho
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "moi_ngay_mot_loi_day_bac_ho_update_authenticated"
  ON public.moi_ngay_mot_loi_day_bac_ho
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "moi_ngay_mot_loi_day_bac_ho_delete_authenticated"
  ON public.moi_ngay_mot_loi_day_bac_ho
  FOR DELETE
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- Storage bucket
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'moi-ngay-mot-loi-day-bac-ho',
  'moi-ngay-mot-loi-day-bac-ho',
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

DROP POLICY IF EXISTS "moi_ngay_mot_loi_day_bac_ho_storage_select_public" ON storage.objects;
DROP POLICY IF EXISTS "moi_ngay_mot_loi_day_bac_ho_storage_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "moi_ngay_mot_loi_day_bac_ho_storage_update_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "moi_ngay_mot_loi_day_bac_ho_storage_delete_authenticated" ON storage.objects;

CREATE POLICY "moi_ngay_mot_loi_day_bac_ho_storage_select_public"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'moi-ngay-mot-loi-day-bac-ho');

CREATE POLICY "moi_ngay_mot_loi_day_bac_ho_storage_insert_authenticated"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'moi-ngay-mot-loi-day-bac-ho');

CREATE POLICY "moi_ngay_mot_loi_day_bac_ho_storage_update_authenticated"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'moi-ngay-mot-loi-day-bac-ho')
  WITH CHECK (bucket_id = 'moi-ngay-mot-loi-day-bac-ho');

CREATE POLICY "moi_ngay_mot_loi_day_bac_ho_storage_delete_authenticated"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'moi-ngay-mot-loi-day-bac-ho');
