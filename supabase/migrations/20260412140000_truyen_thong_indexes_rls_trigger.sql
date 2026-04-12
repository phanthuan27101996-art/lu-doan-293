-- Bảng public.truyen_thong (đã tạo sẵn): id, thong_tin, tg_cap_nhat
-- Chạy trên Supabase: SQL Editor hoặc supabase db push

-- ---------------------------------------------------------------------------
-- Index (tuỳ chọn — hỗ trợ sắp xếp / lọc theo thời điểm cập nhật)
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_truyen_thong_tg_cap_nhat ON public.truyen_thong USING btree (tg_cap_nhat DESC);

-- ---------------------------------------------------------------------------
-- Trigger: mỗi lần UPDATE tự đặt tg_cap_nhat = now() UTC
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_truyen_thong_tg_cap_nhat()
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

DROP TRIGGER IF EXISTS trg_truyen_thong_set_tg_cap_nhat ON public.truyen_thong;

CREATE TRIGGER trg_truyen_thong_set_tg_cap_nhat
  BEFORE UPDATE ON public.truyen_thong
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_truyen_thong_tg_cap_nhat();

-- ---------------------------------------------------------------------------
-- RLS: role authenticated — SELECT / INSERT / UPDATE / DELETE
-- ---------------------------------------------------------------------------
ALTER TABLE public.truyen_thong ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "truyen_thong_select_authenticated" ON public.truyen_thong;
DROP POLICY IF EXISTS "truyen_thong_insert_authenticated" ON public.truyen_thong;
DROP POLICY IF EXISTS "truyen_thong_update_authenticated" ON public.truyen_thong;
DROP POLICY IF EXISTS "truyen_thong_delete_authenticated" ON public.truyen_thong;

CREATE POLICY "truyen_thong_select_authenticated"
  ON public.truyen_thong
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "truyen_thong_insert_authenticated"
  ON public.truyen_thong
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "truyen_thong_update_authenticated"
  ON public.truyen_thong
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "truyen_thong_delete_authenticated"
  ON public.truyen_thong
  FOR DELETE
  TO authenticated
  USING (true);
