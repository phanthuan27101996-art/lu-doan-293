-- Bảng public.doan_co_so: hoạt động đoàn cơ sở (ngày, nhóm, tên, ghi chú, link, nhiều ảnh jsonb)
-- + Storage bucket doan-co-so
-- Chạy: supabase db push / SQL Editor

CREATE TABLE IF NOT EXISTS public.doan_co_so (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ngay date NOT NULL,
  nhom text NOT NULL DEFAULT '',
  ten text NOT NULL,
  ghi_chu text,
  link text,
  hinh_anh jsonb NOT NULL DEFAULT '[]'::jsonb,
  id_nguoi_tao bigint REFERENCES public.danh_sach_quan_nhan (id) ON DELETE SET NULL,
  tg_tao timestamptz NOT NULL DEFAULT (timezone('utc', now())),
  tg_cap_nhat timestamptz NOT NULL DEFAULT (timezone('utc', now())),
  CONSTRAINT doan_co_so_hinh_anh_is_array CHECK (jsonb_typeof(hinh_anh) = 'array')
);

COMMENT ON TABLE public.doan_co_so IS 'Đoàn cơ sở — nhóm (text), tên, ghi chú, link, nhiều URL ảnh trong hinh_anh (jsonb array).';

CREATE INDEX IF NOT EXISTS idx_doan_co_so_ngay ON public.doan_co_so USING btree (ngay DESC);

CREATE INDEX IF NOT EXISTS idx_doan_co_so_nhom ON public.doan_co_so USING btree (nhom);

CREATE INDEX IF NOT EXISTS idx_doan_co_so_id_nguoi_tao ON public.doan_co_so USING btree (id_nguoi_tao);

CREATE INDEX IF NOT EXISTS idx_doan_co_so_tg_cap_nhat ON public.doan_co_so USING btree (tg_cap_nhat DESC);

CREATE OR REPLACE FUNCTION public.set_doan_co_so_tg_cap_nhat()
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

DROP TRIGGER IF EXISTS trg_doan_co_so_set_tg_cap_nhat ON public.doan_co_so;

CREATE TRIGGER trg_doan_co_so_set_tg_cap_nhat
  BEFORE UPDATE ON public.doan_co_so
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_doan_co_so_tg_cap_nhat();

ALTER TABLE public.doan_co_so ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "doan_co_so_select_authenticated" ON public.doan_co_so;
DROP POLICY IF EXISTS "doan_co_so_insert_authenticated" ON public.doan_co_so;
DROP POLICY IF EXISTS "doan_co_so_update_authenticated" ON public.doan_co_so;
DROP POLICY IF EXISTS "doan_co_so_delete_authenticated" ON public.doan_co_so;

CREATE POLICY "doan_co_so_select_authenticated"
  ON public.doan_co_so
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "doan_co_so_insert_authenticated"
  ON public.doan_co_so
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "doan_co_so_update_authenticated"
  ON public.doan_co_so
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "doan_co_so_delete_authenticated"
  ON public.doan_co_so
  FOR DELETE
  TO authenticated
  USING (true);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'doan-co-so',
  'doan-co-so',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "doan_co_so_storage_select_public" ON storage.objects;
DROP POLICY IF EXISTS "doan_co_so_storage_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "doan_co_so_storage_update_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "doan_co_so_storage_delete_authenticated" ON storage.objects;

CREATE POLICY "doan_co_so_storage_select_public"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'doan-co-so');

CREATE POLICY "doan_co_so_storage_insert_authenticated"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'doan-co-so');

CREATE POLICY "doan_co_so_storage_update_authenticated"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'doan-co-so')
  WITH CHECK (bucket_id = 'doan-co-so');

CREATE POLICY "doan_co_so_storage_delete_authenticated"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'doan-co-so');
