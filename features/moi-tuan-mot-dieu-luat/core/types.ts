/**
 * Mỗi tuần 1 điều luật — khớp bảng public.moi_tuan_mot_dieu_luat (Supabase).
 */

export interface MoiTuanMotDieuLuat {
  id: string;
  nam: number;
  thang: number;
  /** Tuần trong tháng (1…6) */
  tuan: number;
  /** Sinh từ DB: YYYY/MM */
  nam_thang: string;
  /** Sinh từ DB: YYYY/MM T{n} */
  nam_thang_tuan: string;
  ten_dieu_luat: string;
  hinh_anh: string | null;
  ghi_chu: string | null;
  tep_dinh_kem: string | null;
  link: string | null;
  id_nguoi_tao: string | null;
  ten_nguoi_tao?: string;
  tg_tao: string | null;
  tg_cap_nhat: string | null;
}

export interface MoiTuanMotDieuLuatFilters {
  /** Năm dạng chuỗi '2025' để khớp FilterChip */
  nam: string[];
}
