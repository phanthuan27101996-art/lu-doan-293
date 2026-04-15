-- Bảng public.kho_video: kho video (bộ sưu tập, tên video, ghi chú, link, người tạo)
-- Chạy: supabase db push / SQL Editor

CREATE TABLE IF NOT EXISTS public.kho_video (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  bo_suu_tap text NOT NULL DEFAULT '',
  ten_video text NOT NULL,
  ghi_chu text,
  link text,
  id_nguoi_tao bigint REFERENCES public.danh_sach_quan_nhan (id) ON DELETE SET NULL,
  tg_tao timestamptz NOT NULL DEFAULT (timezone('utc', now())),
  tg_cap_nhat timestamptz NOT NULL DEFAULT (timezone('utc', now()))
);

COMMENT ON TABLE public.kho_video IS 'Kho video — bộ sưu tập (text), tên video, ghi chú, link; id_nguoi_tao → danh_sach_quan_nhan.';

CREATE INDEX IF NOT EXISTS idx_kho_video_bo_suu_tap ON public.kho_video USING btree (bo_suu_tap);

CREATE INDEX IF NOT EXISTS idx_kho_video_ten_video ON public.kho_video USING btree (ten_video);

CREATE INDEX IF NOT EXISTS idx_kho_video_id_nguoi_tao ON public.kho_video USING btree (id_nguoi_tao);

CREATE INDEX IF NOT EXISTS idx_kho_video_tg_cap_nhat ON public.kho_video USING btree (tg_cap_nhat DESC);

CREATE OR REPLACE FUNCTION public.set_kho_video_tg_cap_nhat()
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

DROP TRIGGER IF EXISTS trg_kho_video_set_tg_cap_nhat ON public.kho_video;

CREATE TRIGGER trg_kho_video_set_tg_cap_nhat
  BEFORE UPDATE ON public.kho_video
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_kho_video_tg_cap_nhat();

ALTER TABLE public.kho_video ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kho_video_select_authenticated" ON public.kho_video;
DROP POLICY IF EXISTS "kho_video_insert_authenticated" ON public.kho_video;
DROP POLICY IF EXISTS "kho_video_update_authenticated" ON public.kho_video;
DROP POLICY IF EXISTS "kho_video_delete_authenticated" ON public.kho_video;

CREATE POLICY "kho_video_select_authenticated"
  ON public.kho_video
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "kho_video_insert_authenticated"
  ON public.kho_video
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "kho_video_update_authenticated"
  ON public.kho_video
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "kho_video_delete_authenticated"
  ON public.kho_video
  FOR DELETE
  TO authenticated
  USING (true);
