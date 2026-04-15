/**
 * Mỗi ngày 1 lời dạy Bác Hồ — khớp bảng public.moi_ngay_mot_loi_day_bac_ho (Supabase).
 */

export interface MoiNgayMotLoiDayBacHo {
  id: string;
  /** ISO date YYYY-MM-DD */
  ngay: string;
  ten_tai_lieu: string;
  hinh_anh: string | null;
  tep_dinh_kem: string | null;
  id_nguoi_tao: string | null;
  ten_nguoi_tao?: string;
  tg_tao: string | null;
  tg_cap_nhat: string | null;
}

export interface MoiNgayMotLoiDayBacHoFilters {
  /** Năm dạng '2025' lấy từ ngay (YYYY-MM-DD) */
  nam: string[];
}
