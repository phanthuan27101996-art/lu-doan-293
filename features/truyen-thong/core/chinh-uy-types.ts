/**
 * Chính ủy (lịch sử) — khớp bảng public.chinh_uy (Supabase).
 */

export interface ChinhUy {
  id: string;
  thu_tu: number;
  ho_va_ten: string;
  hinh_anh: string | null;
  nam_sinh: number | null;
  thoi_gian_dam_nhiem: string | null;
  cap_bac_hien_tai: string | null;
  chuc_vu_cuoi_cung: string | null;
  ghi_chu: string | null;
  tg_tao: string | null;
  tg_cap_nhat: string | null;
}
