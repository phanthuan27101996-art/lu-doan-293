/**
 * Góp ý — khớp bảng public.gop_y (Supabase).
 */

export type GopYTrangThai = 'chua_tra_loi' | 'da_tra_loi';

export interface GopY {
  id: string;
  ngay: string;
  tieu_de_gop_y: string;
  chi_tiet_gop_y: string;
  hinh_anh: string[];
  trang_thai: GopYTrangThai;
  tra_loi: string | null;
  id_nguoi_tao: string | null;
  ten_nguoi_tao?: string;
  tg_tao: string | null;
  tg_cap_nhat: string | null;
}

export interface GopYFilters {
  trang_thai: string[];
}
