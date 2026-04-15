/**
 * Đoàn cơ sở — khớp bảng public.doan_co_so (Supabase).
 */

export interface DoanCoSo {
  id: string;
  ngay: string;
  nhom: string;
  ten: string;
  ghi_chu: string | null;
  link: string | null;
  hinh_anh: string[];
  id_nguoi_tao: string | null;
  ten_nguoi_tao?: string;
  tg_tao: string | null;
  tg_cap_nhat: string | null;
}

export interface DoanCoSoFilters {
  nhom: string[];
}
