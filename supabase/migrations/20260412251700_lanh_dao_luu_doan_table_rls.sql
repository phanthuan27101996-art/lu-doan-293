-- Bảng public.lanh_dao_luu_doan: lãnh đạo Lữ đoàn (module Truyền thống)
-- Chạy: supabase db push / SQL Editor

CREATE TABLE IF NOT EXISTS public.lanh_dao_luu_doan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thu_tu integer NOT NULL DEFAULT 0,
  ho_va_ten text NOT NULL,
  hinh_anh text,
  nam_sinh integer,
  cap_bac_hien_tai text,
  chuc_vu text,
  lich_su_cong_tac text,
  ghi_chu text,
  tg_tao timestamptz NOT NULL DEFAULT (timezone('utc', now())),
  tg_cap_nhat timestamptz NOT NULL DEFAULT (timezone('utc', now())),
  CONSTRAINT lanh_dao_luu_doan_thu_tu_nonneg CHECK (thu_tu >= 0)
);

COMMENT ON TABLE public.lanh_dao_luu_doan IS 'Lãnh đạo Lữ đoàn — hiển thị trong module Truyền thống.';

CREATE INDEX IF NOT EXISTS idx_lanh_dao_luu_doan_thu_tu ON public.lanh_dao_luu_doan USING btree (thu_tu ASC);

CREATE OR REPLACE FUNCTION public.set_lanh_dao_luu_doan_tg_cap_nhat()
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

DROP TRIGGER IF EXISTS trg_lanh_dao_luu_doan_set_tg_cap_nhat ON public.lanh_dao_luu_doan;

CREATE TRIGGER trg_lanh_dao_luu_doan_set_tg_cap_nhat
  BEFORE UPDATE ON public.lanh_dao_luu_doan
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_lanh_dao_luu_doan_tg_cap_nhat();

ALTER TABLE public.lanh_dao_luu_doan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lanh_dao_luu_doan_select_authenticated" ON public.lanh_dao_luu_doan;
DROP POLICY IF EXISTS "lanh_dao_luu_doan_insert_authenticated" ON public.lanh_dao_luu_doan;
DROP POLICY IF EXISTS "lanh_dao_luu_doan_update_authenticated" ON public.lanh_dao_luu_doan;
DROP POLICY IF EXISTS "lanh_dao_luu_doan_delete_authenticated" ON public.lanh_dao_luu_doan;

CREATE POLICY "lanh_dao_luu_doan_select_authenticated"
  ON public.lanh_dao_luu_doan
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "lanh_dao_luu_doan_insert_authenticated"
  ON public.lanh_dao_luu_doan
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "lanh_dao_luu_doan_update_authenticated"
  ON public.lanh_dao_luu_doan
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "lanh_dao_luu_doan_delete_authenticated"
  ON public.lanh_dao_luu_doan
  FOR DELETE
  TO authenticated
  USING (true);
