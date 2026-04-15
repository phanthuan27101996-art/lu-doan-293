-- Bảng public.thi_trac_nghiem: đề thi trắc nghiệm (nhóm text, tên đề, link, người tạo)
-- Chạy: supabase db push / SQL Editor

CREATE TABLE IF NOT EXISTS public.thi_trac_nghiem (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nhom text NOT NULL DEFAULT '',
  ten_de_thi text NOT NULL,
  link text,
  id_nguoi_tao bigint REFERENCES public.danh_sach_quan_nhan (id) ON DELETE SET NULL,
  tg_tao timestamptz NOT NULL DEFAULT (timezone('utc', now())),
  tg_cap_nhat timestamptz NOT NULL DEFAULT (timezone('utc', now()))
);

COMMENT ON TABLE public.thi_trac_nghiem IS 'Thi trắc nghiệm — nhóm (text), tên đề, link; id_nguoi_tao → danh_sach_quan_nhan.';

CREATE INDEX IF NOT EXISTS idx_thi_trac_nghiem_nhom ON public.thi_trac_nghiem USING btree (nhom);

CREATE INDEX IF NOT EXISTS idx_thi_trac_nghiem_ten_de_thi ON public.thi_trac_nghiem USING btree (ten_de_thi);

CREATE INDEX IF NOT EXISTS idx_thi_trac_nghiem_id_nguoi_tao ON public.thi_trac_nghiem USING btree (id_nguoi_tao);

CREATE INDEX IF NOT EXISTS idx_thi_trac_nghiem_tg_cap_nhat ON public.thi_trac_nghiem USING btree (tg_cap_nhat DESC);

CREATE OR REPLACE FUNCTION public.set_thi_trac_nghiem_tg_cap_nhat()
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

DROP TRIGGER IF EXISTS trg_thi_trac_nghiem_set_tg_cap_nhat ON public.thi_trac_nghiem;

CREATE TRIGGER trg_thi_trac_nghiem_set_tg_cap_nhat
  BEFORE UPDATE ON public.thi_trac_nghiem
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_thi_trac_nghiem_tg_cap_nhat();

ALTER TABLE public.thi_trac_nghiem ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "thi_trac_nghiem_select_authenticated" ON public.thi_trac_nghiem;
DROP POLICY IF EXISTS "thi_trac_nghiem_insert_authenticated" ON public.thi_trac_nghiem;
DROP POLICY IF EXISTS "thi_trac_nghiem_update_authenticated" ON public.thi_trac_nghiem;
DROP POLICY IF EXISTS "thi_trac_nghiem_delete_authenticated" ON public.thi_trac_nghiem;

CREATE POLICY "thi_trac_nghiem_select_authenticated"
  ON public.thi_trac_nghiem
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "thi_trac_nghiem_insert_authenticated"
  ON public.thi_trac_nghiem
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "thi_trac_nghiem_update_authenticated"
  ON public.thi_trac_nghiem
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "thi_trac_nghiem_delete_authenticated"
  ON public.thi_trac_nghiem
  FOR DELETE
  TO authenticated
  USING (true);
