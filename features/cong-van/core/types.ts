/**
 * Công văn — khớp bảng public.cong_van (Supabase).
 */

export interface CongVan {
  id: string;
  don_vi: string;
  /** ISO date YYYY-MM-DD */
  ngay: string;
  ten_van_ban: string;
  ghi_chu: string | null;
  tep_dinh_kem: string | null;
  link: string | null;
  id_nguoi_tao: string | null;
  ten_nguoi_tao?: string;
  tg_tao: string | null;
  tg_cap_nhat: string | null;
}

export interface CongVanFilters {
  don_vi: string[];
}
