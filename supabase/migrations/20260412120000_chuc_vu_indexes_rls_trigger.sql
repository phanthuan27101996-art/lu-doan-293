-- Bảng public.chuc_vu (đã tạo sẵn): id, chuc_vu, tg_tao, tg_cap_nhat
-- Chạy trên Supabase: SQL Editor hoặc supabase db push

-- ---------------------------------------------------------------------------
-- Index: tra cứu / sắp xếp theo tên chức vụ
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_chuc_vu_chuc_vu ON public.chuc_vu USING btree (chuc_vu);

-- (Tuỳ chọn) GIN pg_trgm để ILIKE %% nhanh — bật extension trước:
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX IF NOT EXISTS idx_chuc_vu_chuc_vu_trgm ON public.chuc_vu USING gin (chuc_vu gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- Trigger: mỗi lần UPDATE tự đặt tg_cap_nhat = now() UTC
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_chuc_vu_tg_cap_nhat()
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

DROP TRIGGER IF EXISTS trg_chuc_vu_set_tg_cap_nhat ON public.chuc_vu;

CREATE TRIGGER trg_chuc_vu_set_tg_cap_nhat
  BEFORE UPDATE ON public.chuc_vu
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_chuc_vu_tg_cap_nhat();

-- ---------------------------------------------------------------------------
-- RLS: mọi user đã đăng nhập (role authenticated) — SELECT/INSERT/UPDATE/DELETE
-- ---------------------------------------------------------------------------
ALTER TABLE public.chuc_vu ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chuc_vu_select_authenticated" ON public.chuc_vu;
DROP POLICY IF EXISTS "chuc_vu_insert_authenticated" ON public.chuc_vu;
DROP POLICY IF EXISTS "chuc_vu_update_authenticated" ON public.chuc_vu;
DROP POLICY IF EXISTS "chuc_vu_delete_authenticated" ON public.chuc_vu;

CREATE POLICY "chuc_vu_select_authenticated"
  ON public.chuc_vu
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "chuc_vu_insert_authenticated"
  ON public.chuc_vu
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "chuc_vu_update_authenticated"
  ON public.chuc_vu
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "chuc_vu_delete_authenticated"
  ON public.chuc_vu
  FOR DELETE
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- Gợi ý FK để PostgREST embed: select=*,chuc_vu(chuc_vu) từ bảng nhân viên
-- (Chỉ bật khi bạn đã có cột chuc_vu_id kiểu bigint trùng với chuc_vu.id)
-- ---------------------------------------------------------------------------
-- ALTER TABLE public.he_thong_nhan_vien
--   ADD CONSTRAINT he_thong_nhan_vien_chuc_vu_id_fkey
--   FOREIGN KEY (chuc_vu_id) REFERENCES public.chuc_vu(id) ON UPDATE CASCADE ON DELETE SET NULL;
