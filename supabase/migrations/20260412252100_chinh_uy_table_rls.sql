-- Bảng public.chinh_uy: lịch sử Chính ủy Lữ đoàn (module Truyền thống)
-- Chạy: supabase db push / SQL Editor

CREATE TABLE IF NOT EXISTS public.chinh_uy (
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
  CONSTRAINT chinh_uy_thu_tu_nonneg CHECK (thu_tu >= 0)
);

COMMENT ON TABLE public.chinh_uy IS 'Chính ủy Lữ đoàn qua các thời kỳ — module Truyền thống.';

CREATE INDEX IF NOT EXISTS idx_chinh_uy_thu_tu ON public.chinh_uy USING btree (thu_tu ASC);

CREATE OR REPLACE FUNCTION public.set_chinh_uy_tg_cap_nhat()
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

DROP TRIGGER IF EXISTS trg_chinh_uy_set_tg_cap_nhat ON public.chinh_uy;

CREATE TRIGGER trg_chinh_uy_set_tg_cap_nhat
  BEFORE UPDATE ON public.chinh_uy
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_chinh_uy_tg_cap_nhat();

ALTER TABLE public.chinh_uy ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chinh_uy_select_authenticated" ON public.chinh_uy;
DROP POLICY IF EXISTS "chinh_uy_insert_authenticated" ON public.chinh_uy;
DROP POLICY IF EXISTS "chinh_uy_update_authenticated" ON public.chinh_uy;
DROP POLICY IF EXISTS "chinh_uy_delete_authenticated" ON public.chinh_uy;

CREATE POLICY "chinh_uy_select_authenticated"
  ON public.chinh_uy
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "chinh_uy_insert_authenticated"
  ON public.chinh_uy
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "chinh_uy_update_authenticated"
  ON public.chinh_uy
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "chinh_uy_delete_authenticated"
  ON public.chinh_uy
  FOR DELETE
  TO authenticated
  USING (true);
