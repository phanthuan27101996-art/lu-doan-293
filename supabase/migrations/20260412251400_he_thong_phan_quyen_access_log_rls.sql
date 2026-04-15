-- Bảng phân quyền theo chức vụ (matrix module × action) + nhật ký truy cập
-- Khớp [features/he-thong/phan-quyen/services/phan-quyen-service.ts](features/he-thong/phan-quyen/services/phan-quyen-service.ts):
--   createRepository(..., tableName: 'he_thong_phan_quyen' | 'he_thong_access_log')
--
-- Cột quyen_han: jsonb mảng object { module_id, module_name, actions[] } — PostgREST trả về đúng shape cho UI.
-- id_chuc_vu: lưu dạng text (id chức vụ dạng string từ app / bigint stringify); có thể thêm FK sau khi chuẩn hoá.

-- ---------------------------------------------------------------------------
-- he_thong_phan_quyen
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.he_thong_phan_quyen (
  id text PRIMARY KEY,
  id_chuc_vu text NOT NULL,
  ten_chuc_vu text NOT NULL DEFAULT '',
  ma_chuc_vu text NOT NULL DEFAULT '',
  ten_phong_ban text NOT NULL DEFAULT '',
  thu_tu_phong_ban integer,
  thu_tu_chuc_vu integer,
  mo_ta text,
  so_nhan_vien integer NOT NULL DEFAULT 0,
  quyen_han jsonb NOT NULL DEFAULT '[]'::jsonb,
  trang_thai text NOT NULL DEFAULT 'Đang hoạt động',
  tg_tao timestamptz NOT NULL DEFAULT (timezone('utc', now())),
  tg_cap_nhat timestamptz NOT NULL DEFAULT (timezone('utc', now())),
  CONSTRAINT he_thong_phan_quyen_quyen_han_is_array CHECK (jsonb_typeof(quyen_han) = 'array'),
  CONSTRAINT he_thong_phan_quyen_trang_thai CHECK (
    trang_thai = ANY (ARRAY['Ngừng hoạt động'::text, 'Đang hoạt động'::text])
  )
);

COMMENT ON TABLE public.he_thong_phan_quyen IS 'Phân quyền theo vai trò/chức vụ: quyen_han = JSON array ModulePermission.';

CREATE INDEX IF NOT EXISTS idx_he_thong_phan_quyen_id_chuc_vu ON public.he_thong_phan_quyen USING btree (id_chuc_vu);

CREATE INDEX IF NOT EXISTS idx_he_thong_phan_quyen_trang_thai ON public.he_thong_phan_quyen USING btree (trang_thai);

CREATE OR REPLACE FUNCTION public.set_he_thong_phan_quyen_tg_cap_nhat()
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

DROP TRIGGER IF EXISTS trg_he_thong_phan_quyen_set_tg_cap_nhat ON public.he_thong_phan_quyen;

CREATE TRIGGER trg_he_thong_phan_quyen_set_tg_cap_nhat
  BEFORE UPDATE ON public.he_thong_phan_quyen
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_he_thong_phan_quyen_tg_cap_nhat();

ALTER TABLE public.he_thong_phan_quyen ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "he_thong_phan_quyen_select_authenticated" ON public.he_thong_phan_quyen;
DROP POLICY IF EXISTS "he_thong_phan_quyen_insert_authenticated" ON public.he_thong_phan_quyen;
DROP POLICY IF EXISTS "he_thong_phan_quyen_update_authenticated" ON public.he_thong_phan_quyen;
DROP POLICY IF EXISTS "he_thong_phan_quyen_delete_authenticated" ON public.he_thong_phan_quyen;

CREATE POLICY "he_thong_phan_quyen_select_authenticated"
  ON public.he_thong_phan_quyen FOR SELECT TO authenticated USING (true);

CREATE POLICY "he_thong_phan_quyen_insert_authenticated"
  ON public.he_thong_phan_quyen FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "he_thong_phan_quyen_update_authenticated"
  ON public.he_thong_phan_quyen FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "he_thong_phan_quyen_delete_authenticated"
  ON public.he_thong_phan_quyen FOR DELETE TO authenticated USING (true);

-- ---------------------------------------------------------------------------
-- he_thong_access_log
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.he_thong_access_log (
  id text PRIMARY KEY,
  id_nguoi_dung text NOT NULL DEFAULT '',
  ten_nguoi_dung text NOT NULL DEFAULT '',
  hanh_dong text NOT NULL DEFAULT '',
  mo_ta text NOT NULL DEFAULT '',
  dia_chi_ip text NOT NULL DEFAULT '',
  thiet_bi text NOT NULL DEFAULT '',
  trang_thai text NOT NULL DEFAULT 'Success',
  tg_thuc_hien timestamptz NOT NULL DEFAULT (timezone('utc', now())),
  CONSTRAINT he_thong_access_log_trang_thai CHECK (
    trang_thai = ANY (ARRAY['Success'::text, 'Failed'::text, 'Warning'::text])
  )
);

COMMENT ON TABLE public.he_thong_access_log IS 'Nhật ký thao tác phân quyền / hệ thống (UI tab Log).';

CREATE INDEX IF NOT EXISTS idx_he_thong_access_log_tg ON public.he_thong_access_log USING btree (tg_thuc_hien DESC);

CREATE INDEX IF NOT EXISTS idx_he_thong_access_log_user ON public.he_thong_access_log USING btree (id_nguoi_dung);

ALTER TABLE public.he_thong_access_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "he_thong_access_log_select_authenticated" ON public.he_thong_access_log;
DROP POLICY IF EXISTS "he_thong_access_log_insert_authenticated" ON public.he_thong_access_log;
DROP POLICY IF EXISTS "he_thong_access_log_update_authenticated" ON public.he_thong_access_log;
DROP POLICY IF EXISTS "he_thong_access_log_delete_authenticated" ON public.he_thong_access_log;

CREATE POLICY "he_thong_access_log_select_authenticated"
  ON public.he_thong_access_log FOR SELECT TO authenticated USING (true);

CREATE POLICY "he_thong_access_log_insert_authenticated"
  ON public.he_thong_access_log FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "he_thong_access_log_update_authenticated"
  ON public.he_thong_access_log FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "he_thong_access_log_delete_authenticated"
  ON public.he_thong_access_log FOR DELETE TO authenticated USING (true);
