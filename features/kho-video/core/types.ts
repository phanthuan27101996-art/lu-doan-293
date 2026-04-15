/**
 * Kho video — khớp bảng public.kho_video (Supabase).
 */

export interface KhoVideo {
  id: string;
  bo_suu_tap: string;
  ten_video: string;
  ghi_chu: string | null;
  link: string | null;
  id_nguoi_tao: string | null;
  ten_nguoi_tao?: string;
  tg_tao: string | null;
  tg_cap_nhat: string | null;
}

export interface KhoVideoFilters {
  bo_suu_tap: string[];
}
