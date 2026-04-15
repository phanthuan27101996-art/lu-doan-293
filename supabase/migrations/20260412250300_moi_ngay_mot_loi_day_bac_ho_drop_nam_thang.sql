-- Gỡ cột nam_thang nếu đã tạo từ migration cũ (generated từ ngay)
ALTER TABLE public.moi_ngay_mot_loi_day_bac_ho
  DROP COLUMN IF EXISTS nam_thang;
