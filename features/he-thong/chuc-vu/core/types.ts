/**
 * Chức vụ — khớp bảng public.chuc_vu (Supabase).
 * PostgREST trả bigint dưới dạng string trong JSON.
 */
export interface Position {
  id: string;
  chuc_vu: string | null;
  tg_tao: string | null;
  tg_cap_nhat: string | null;
  /** Đồng bộ UI/module nhân viên: tên hiển thị = cột chuc_vu */
  ten_chuc_vu: string;
  /** Hiển thị phụ (mã/id) trong combobox */
  ma_chuc_vu: string;
}
