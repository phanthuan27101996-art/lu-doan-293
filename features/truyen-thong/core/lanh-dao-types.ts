/**
 * Lãnh đạo Lữ đoàn — khớp bảng public.lanh_dao_luu_doan (Supabase).
 */

export interface LanhDaoLuuDoan {
  id: string;
  thu_tu: number;
  ho_va_ten: string;
  hinh_anh: string | null;
  nam_sinh: number | null;
  cap_bac_hien_tai: string | null;
  chuc_vu: string | null;
  lich_su_cong_tac: string | null;
  ghi_chu: string | null;
  tg_tao: string | null;
  tg_cap_nhat: string | null;
}
