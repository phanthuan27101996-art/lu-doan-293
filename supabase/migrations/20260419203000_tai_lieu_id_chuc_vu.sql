-- Tài liệu: gắn chức vụ (bắt buộc) — lọc/duyệt theo id_chuc_vu → nhóm → danh sách
-- Cần ít nhất một bản ghi public.chuc_vu để gán cho bản ghi tai_lieu hiện có.

ALTER TABLE public.tai_lieu
  ADD COLUMN IF NOT EXISTS id_chuc_vu bigint REFERENCES public.chuc_vu (id) ON UPDATE CASCADE ON DELETE RESTRICT;

COMMENT ON COLUMN public.tai_lieu.id_chuc_vu IS 'FK → chuc_vu(id); bắt buộc khi tạo/sửa tài liệu.';

DO $$
DECLARE
  v_id bigint;
BEGIN
  SELECT id INTO v_id FROM public.chuc_vu ORDER BY id ASC LIMIT 1;
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Migration tai_lieu.id_chuc_vu: cần ít nhất một chức vụ trong public.chuc_vu trước khi chạy (hoặc thêm dữ liệu chuc_vu rồi chạy lại).';
  END IF;
  UPDATE public.tai_lieu SET id_chuc_vu = v_id WHERE id_chuc_vu IS NULL;
END;
$$;

ALTER TABLE public.tai_lieu ALTER COLUMN id_chuc_vu SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tai_lieu_id_chuc_vu ON public.tai_lieu USING btree (id_chuc_vu);

CREATE INDEX IF NOT EXISTS idx_tai_lieu_chuc_vu_nhom ON public.tai_lieu USING btree (id_chuc_vu, nhom_tai_lieu);
