-- Cột link (URL tham chiếu) cho mỗi ngày 1 lời dạy — cùng ý nghĩa với moi_tuan_mot_dieu_luat.link
ALTER TABLE public.moi_ngay_mot_loi_day_bac_ho
  ADD COLUMN IF NOT EXISTS link text;

COMMENT ON COLUMN public.moi_ngay_mot_loi_day_bac_ho.link IS 'URL tùy chọn (http/https).';
