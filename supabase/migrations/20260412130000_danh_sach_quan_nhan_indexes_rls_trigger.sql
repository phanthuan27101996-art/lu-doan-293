-- Bảng public.danh_sach_quan_nhan (đã tạo sẵn):
--   id, ho_va_ten, so_dien_thoai, avatar, id_chuc_vu, tg_tao, tg_cap_nhat
-- Chạy trên Supabase: SQL Editor hoặc supabase db push

-- ---------------------------------------------------------------------------
-- Index
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_dsqn_ho_va_ten ON public.danh_sach_quan_nhan USING btree (ho_va_ten);

CREATE INDEX IF NOT EXISTS idx_dsqn_so_dien_thoai ON public.danh_sach_quan_nhan USING btree (so_dien_thoai);

CREATE INDEX IF NOT EXISTS idx_dsqn_id_chuc_vu ON public.danh_sach_quan_nhan USING btree (id_chuc_vu);

-- ---------------------------------------------------------------------------
-- Trigger: mỗi lần UPDATE tự đặt tg_cap_nhat = now() UTC
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_danh_sach_quan_nhan_tg_cap_nhat()
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

DROP TRIGGER IF EXISTS trg_dsqn_set_tg_cap_nhat ON public.danh_sach_quan_nhan;

CREATE TRIGGER trg_dsqn_set_tg_cap_nhat
  BEFORE UPDATE ON public.danh_sach_quan_nhan
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_danh_sach_quan_nhan_tg_cap_nhat();

-- ---------------------------------------------------------------------------
-- RLS: role authenticated — SELECT / INSERT / UPDATE / DELETE
-- ---------------------------------------------------------------------------
ALTER TABLE public.danh_sach_quan_nhan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dsqn_select_authenticated" ON public.danh_sach_quan_nhan;
DROP POLICY IF EXISTS "dsqn_insert_authenticated" ON public.danh_sach_quan_nhan;
DROP POLICY IF EXISTS "dsqn_update_authenticated" ON public.danh_sach_quan_nhan;
DROP POLICY IF EXISTS "dsqn_delete_authenticated" ON public.danh_sach_quan_nhan;

CREATE POLICY "dsqn_select_authenticated"
  ON public.danh_sach_quan_nhan
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "dsqn_insert_authenticated"
  ON public.danh_sach_quan_nhan
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "dsqn_update_authenticated"
  ON public.danh_sach_quan_nhan
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "dsqn_delete_authenticated"
  ON public.danh_sach_quan_nhan
  FOR DELETE
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- FK tới public.chuc_vu(id) — bật khi đã có bảng chuc_vu
-- ---------------------------------------------------------------------------
-- ALTER TABLE public.danh_sach_quan_nhan
--   ADD CONSTRAINT danh_sach_quan_nhan_id_chuc_vu_fkey
--   FOREIGN KEY (id_chuc_vu) REFERENCES public.chuc_vu(id) ON UPDATE CASCADE ON DELETE SET NULL;
