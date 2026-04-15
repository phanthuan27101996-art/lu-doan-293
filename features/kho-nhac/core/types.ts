/**
 * Kho nhạc — khớp bảng public.kho_nhac (Supabase).
 */

export interface KhoNhac {
  id: string;
  bo_suu_tap: string;
  ten_nhac: string;
  tac_gia: string | null;
  ghi_chu: string | null;
  link: string | null;
  id_nguoi_tao: string | null;
  ten_nguoi_tao?: string;
  tg_tao: string | null;
  tg_cap_nhat: string | null;
}

export interface KhoNhacFilters {
  bo_suu_tap: string[];
}
