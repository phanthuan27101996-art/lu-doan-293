-- Bảng public.kho_nhac: kho nhạc (bộ sưu tập, tên nhạc, tác giả, ghi chú, link, người tạo)
-- Chạy: supabase db push / SQL Editor

CREATE TABLE IF NOT EXISTS public.kho_nhac (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  bo_suu_tap text NOT NULL DEFAULT '',
  ten_nhac text NOT NULL,
  tac_gia text,
  ghi_chu text,
  link text,
  id_nguoi_tao bigint REFERENCES public.danh_sach_quan_nhan (id) ON DELETE SET NULL,
  tg_tao timestamptz NOT NULL DEFAULT (timezone('utc', now())),
  tg_cap_nhat timestamptz NOT NULL DEFAULT (timezone('utc', now()))
);

COMMENT ON TABLE public.kho_nhac IS 'Kho nhạc — bộ sưu tập (text), tên nhạc, tác giả, ghi chú, link; id_nguoi_tao → danh_sach_quan_nhan.';

CREATE INDEX IF NOT EXISTS idx_kho_nhac_bo_suu_tap ON public.kho_nhac USING btree (bo_suu_tap);

CREATE INDEX IF NOT EXISTS idx_kho_nhac_ten_nhac ON public.kho_nhac USING btree (ten_nhac);

CREATE INDEX IF NOT EXISTS idx_kho_nhac_id_nguoi_tao ON public.kho_nhac USING btree (id_nguoi_tao);

CREATE INDEX IF NOT EXISTS idx_kho_nhac_tg_cap_nhat ON public.kho_nhac USING btree (tg_cap_nhat DESC);

CREATE OR REPLACE FUNCTION public.set_kho_nhac_tg_cap_nhat()
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

DROP TRIGGER IF EXISTS trg_kho_nhac_set_tg_cap_nhat ON public.kho_nhac;

CREATE TRIGGER trg_kho_nhac_set_tg_cap_nhat
  BEFORE UPDATE ON public.kho_nhac
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_kho_nhac_tg_cap_nhat();

ALTER TABLE public.kho_nhac ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kho_nhac_select_authenticated" ON public.kho_nhac;
DROP POLICY IF EXISTS "kho_nhac_insert_authenticated" ON public.kho_nhac;
DROP POLICY IF EXISTS "kho_nhac_update_authenticated" ON public.kho_nhac;
DROP POLICY IF EXISTS "kho_nhac_delete_authenticated" ON public.kho_nhac;

CREATE POLICY "kho_nhac_select_authenticated"
  ON public.kho_nhac
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "kho_nhac_insert_authenticated"
  ON public.kho_nhac
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "kho_nhac_update_authenticated"
  ON public.kho_nhac
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "kho_nhac_delete_authenticated"
  ON public.kho_nhac
  FOR DELETE
  TO authenticated
  USING (true);
