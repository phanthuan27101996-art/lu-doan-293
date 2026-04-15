/**
 * Thi trắc nghiệm — khớp bảng public.thi_trac_nghiem (Supabase).
 */

export interface ThiTracNghiem {
  id: string;
  nhom: string;
  ten_de_thi: string;
  link: string | null;
  id_nguoi_tao: string | null;
  ten_nguoi_tao?: string;
  tg_tao: string | null;
  tg_cap_nhat: string | null;
}

export interface ThiTracNghiemFilters {
  nhom: string[];
}
