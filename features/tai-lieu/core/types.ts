/**
 * Tài liệu (danh mục) — khớp bảng public.tai_lieu (Supabase).
 */

export interface TaiLieu {
  id: string;
  nhom_tai_lieu: string;
  ten_tai_lieu: string;
  link: string | null;
  ghi_chu: string | null;
  id_nguoi_tao: string | null;
  ten_nguoi_tao?: string;
  tg_tao: string | null;
  tg_cap_nhat: string | null;
}

export interface TaiLieuFilters {
  nhom_tai_lieu: string[];
}
