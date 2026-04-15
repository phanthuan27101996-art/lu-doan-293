export type Gender = 'Nam' | 'Nữ' | 'Khác';

/**
 * Quân nhân — khớp bảng public.danh_sach_quan_nhan (Supabase).
 * PostgREST trả bigint id dưới dạng string.
 */
export interface Employee {
  id: string;
  ho_ten: string;
  so_dien_thoai: string;
  chuc_vu_id: string | null;
  ten_chuc_vu?: string;
  anh_dai_dien?: string | null;
  /** Bảng danh_sach_quan_nhan — TRUE: được dùng module Phân quyền. */
  is_admin?: boolean;
  tg_tao?: string | null;
  tg_cap_nhat?: string | null;
}

export interface EmployeeFilters {
  /** Lọc theo id chức vụ (chuc_vu.id) */
  position: string[];
}
