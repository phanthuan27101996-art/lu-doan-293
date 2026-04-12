/**
 * Trang tin — khớp bảng public.trang_tin (Supabase).
 * id int8 → string trong JSON / TypeScript.
 */

export interface TrangTin {
  id: string;
  ngay_dang: string;
  tieu_de: string;
  mo_ta_ngan: string;
  /** URL ảnh (public storage hoặc link ngoài), thứ tự hiển thị */
  hinh_anh: string[];
  link: string | null;
  id_nguoi_tao: string | null;
  /** Enriched từ danh_sach_quan_nhan */
  ten_nguoi_tao?: string;
  tg_tao: string | null;
  tg_cap_nhat: string | null;
}

export interface TrangTinFilters {
  /** Lọc theo id quân nhân (người tạo) */
  id_nguoi_tao: string[];
}
