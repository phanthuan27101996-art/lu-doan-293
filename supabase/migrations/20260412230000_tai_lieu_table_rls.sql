-- Bảng public.tai_lieu: danh mục tài liệu (nhóm, tên, link, ghi chú, người tạo)
-- Chạy: supabase db push / SQL Editor

CREATE TABLE IF NOT EXISTS public.tai_lieu (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nhom_tai_lieu text NOT NULL DEFAULT '',
  ten_tai_lieu text NOT NULL,
  link text,
  ghi_chu text,
  id_nguoi_tao bigint REFERENCES public.danh_sach_quan_nhan (id) ON DELETE SET NULL,
  tg_tao timestamptz NOT NULL DEFAULT (timezone('utc', now())),
  tg_cap_nhat timestamptz NOT NULL DEFAULT (timezone('utc', now()))
);

COMMENT ON TABLE public.tai_lieu IS 'Tài liệu — nhóm (text), tên, link, ghi chú; id_nguoi_tao → danh_sach_quan_nhan.';

CREATE INDEX IF NOT EXISTS idx_tai_lieu_nhom ON public.tai_lieu USING btree (nhom_tai_lieu);

CREATE INDEX IF NOT EXISTS idx_tai_lieu_ten ON public.tai_lieu USING btree (ten_tai_lieu);

CREATE INDEX IF NOT EXISTS idx_tai_lieu_id_nguoi_tao ON public.tai_lieu USING btree (id_nguoi_tao);

CREATE INDEX IF NOT EXISTS idx_tai_lieu_tg_cap_nhat ON public.tai_lieu USING btree (tg_cap_nhat DESC);

CREATE OR REPLACE FUNCTION public.set_tai_lieu_tg_cap_nhat()
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

DROP TRIGGER IF EXISTS trg_tai_lieu_set_tg_cap_nhat ON public.tai_lieu;

CREATE TRIGGER trg_tai_lieu_set_tg_cap_nhat
  BEFORE UPDATE ON public.tai_lieu
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_tai_lieu_tg_cap_nhat();

ALTER TABLE public.tai_lieu ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tai_lieu_select_authenticated" ON public.tai_lieu;
DROP POLICY IF EXISTS "tai_lieu_insert_authenticated" ON public.tai_lieu;
DROP POLICY IF EXISTS "tai_lieu_update_authenticated" ON public.tai_lieu;
DROP POLICY IF EXISTS "tai_lieu_delete_authenticated" ON public.tai_lieu;

CREATE POLICY "tai_lieu_select_authenticated"
  ON public.tai_lieu
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "tai_lieu_insert_authenticated"
  ON public.tai_lieu
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "tai_lieu_update_authenticated"
  ON public.tai_lieu
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "tai_lieu_delete_authenticated"
  ON public.tai_lieu
  FOR DELETE
  TO authenticated
  USING (true);
