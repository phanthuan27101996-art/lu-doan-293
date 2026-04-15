-- Bảng public.luu_doan_truong: lịch sử Lữ đoàn trưởng (module Truyền thống)
-- Chạy: supabase db push / SQL Editor

CREATE TABLE IF NOT EXISTS public.luu_doan_truong (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thu_tu integer NOT NULL DEFAULT 0,
  ho_va_ten text NOT NULL,
  hinh_anh text,
  nam_sinh integer,
  thoi_gian_dam_nhiem text,
  cap_bac_hien_tai text,
  chuc_vu_cuoi_cung text,
  ghi_chu text,
  tg_tao timestamptz NOT NULL DEFAULT (timezone('utc', now())),
  tg_cap_nhat timestamptz NOT NULL DEFAULT (timezone('utc', now())),
  CONSTRAINT luu_doan_truong_thu_tu_nonneg CHECK (thu_tu >= 0)
);

COMMENT ON TABLE public.luu_doan_truong IS 'Lữ đoàn trưởng qua các thời kỳ — hiển thị trong module Truyền thống.';

CREATE INDEX IF NOT EXISTS idx_luu_doan_truong_thu_tu ON public.luu_doan_truong USING btree (thu_tu ASC);

CREATE OR REPLACE FUNCTION public.set_luu_doan_truong_tg_cap_nhat()
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

DROP TRIGGER IF EXISTS trg_luu_doan_truong_set_tg_cap_nhat ON public.luu_doan_truong;

CREATE TRIGGER trg_luu_doan_truong_set_tg_cap_nhat
  BEFORE UPDATE ON public.luu_doan_truong
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_luu_doan_truong_tg_cap_nhat();

ALTER TABLE public.luu_doan_truong ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "luu_doan_truong_select_authenticated" ON public.luu_doan_truong;
DROP POLICY IF EXISTS "luu_doan_truong_insert_authenticated" ON public.luu_doan_truong;
DROP POLICY IF EXISTS "luu_doan_truong_update_authenticated" ON public.luu_doan_truong;
DROP POLICY IF EXISTS "luu_doan_truong_delete_authenticated" ON public.luu_doan_truong;

CREATE POLICY "luu_doan_truong_select_authenticated"
  ON public.luu_doan_truong
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "luu_doan_truong_insert_authenticated"
  ON public.luu_doan_truong
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "luu_doan_truong_update_authenticated"
  ON public.luu_doan_truong
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "luu_doan_truong_delete_authenticated"
  ON public.luu_doan_truong
  FOR DELETE
  TO authenticated
  USING (true);
