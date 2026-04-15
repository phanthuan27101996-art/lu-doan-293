-- Bảng public.gop_y: góp ý (ngày, tiêu đề, chi tiết, nhiều ảnh jsonb, trạng thái, trả lời)
-- + Storage bucket gop-y (ảnh public URL)
-- Chạy: supabase db push / SQL Editor

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gop_y (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ngay date NOT NULL,
  tieu_de_gop_y text NOT NULL,
  chi_tiet_gop_y text NOT NULL,
  hinh_anh jsonb NOT NULL DEFAULT '[]'::jsonb,
  trang_thai text NOT NULL DEFAULT 'chua_tra_loi',
  tra_loi text,
  id_nguoi_tao bigint REFERENCES public.danh_sach_quan_nhan (id) ON DELETE SET NULL,
  tg_tao timestamptz NOT NULL DEFAULT (timezone('utc', now())),
  tg_cap_nhat timestamptz NOT NULL DEFAULT (timezone('utc', now())),
  CONSTRAINT gop_y_hinh_anh_is_array CHECK (jsonb_typeof(hinh_anh) = 'array'),
  CONSTRAINT gop_y_trang_thai_allowed CHECK (trang_thai = ANY (ARRAY['chua_tra_loi'::text, 'da_tra_loi'::text])),
  CONSTRAINT gop_y_tra_loi_when_da_tra_loi CHECK (
    trang_thai = 'chua_tra_loi'
    OR (trang_thai = 'da_tra_loi' AND tra_loi IS NOT NULL AND btrim(tra_loi) <> '')
  )
);

COMMENT ON TABLE public.gop_y IS 'Góp ý — ngày, tiêu đề, chi tiết, hinh_anh (jsonb URL), trạng thái chua_tra_loi/da_tra_loi, tra_loi.';

CREATE INDEX IF NOT EXISTS idx_gop_y_ngay ON public.gop_y USING btree (ngay DESC);

CREATE INDEX IF NOT EXISTS idx_gop_y_trang_thai ON public.gop_y USING btree (trang_thai);

CREATE INDEX IF NOT EXISTS idx_gop_y_id_nguoi_tao ON public.gop_y USING btree (id_nguoi_tao);

CREATE INDEX IF NOT EXISTS idx_gop_y_tg_cap_nhat ON public.gop_y USING btree (tg_cap_nhat DESC);

CREATE OR REPLACE FUNCTION public.set_gop_y_tg_cap_nhat()
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

DROP TRIGGER IF EXISTS trg_gop_y_set_tg_cap_nhat ON public.gop_y;

CREATE TRIGGER trg_gop_y_set_tg_cap_nhat
  BEFORE UPDATE ON public.gop_y
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_gop_y_tg_cap_nhat();

ALTER TABLE public.gop_y ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gop_y_select_authenticated" ON public.gop_y;
DROP POLICY IF EXISTS "gop_y_insert_authenticated" ON public.gop_y;
DROP POLICY IF EXISTS "gop_y_update_authenticated" ON public.gop_y;
DROP POLICY IF EXISTS "gop_y_delete_authenticated" ON public.gop_y;

CREATE POLICY "gop_y_select_authenticated"
  ON public.gop_y
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "gop_y_insert_authenticated"
  ON public.gop_y
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "gop_y_update_authenticated"
  ON public.gop_y
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "gop_y_delete_authenticated"
  ON public.gop_y
  FOR DELETE
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- Storage bucket
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gop-y',
  'gop-y',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "gop_y_storage_select_public" ON storage.objects;
DROP POLICY IF EXISTS "gop_y_storage_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "gop_y_storage_update_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "gop_y_storage_delete_authenticated" ON storage.objects;

CREATE POLICY "gop_y_storage_select_public"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'gop-y');

CREATE POLICY "gop_y_storage_insert_authenticated"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'gop-y');

CREATE POLICY "gop_y_storage_update_authenticated"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'gop-y')
  WITH CHECK (bucket_id = 'gop-y');

CREATE POLICY "gop_y_storage_delete_authenticated"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'gop-y');
