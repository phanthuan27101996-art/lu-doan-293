import type { LanhDaoLuuDoan } from '../core/lanh-dao-types';
import type { LanhDaoLuuDoanFormValues } from '../core/lanh-dao-schema';

export function getDefaultLanhDaoLuuDoanFormValues(nextThuTu: number): LanhDaoLuuDoanFormValues {
  return {
    thu_tu: nextThuTu,
    ho_va_ten: '',
    hinh_anh: null,
    nam_sinh: null,
    cap_bac_hien_tai: null,
    chuc_vu: null,
    lich_su_cong_tac: null,
    ghi_chu: null,
  };
}

export function lanhDaoLuuDoanToFormValues(row: LanhDaoLuuDoan): LanhDaoLuuDoanFormValues {
  return {
    thu_tu: row.thu_tu,
    ho_va_ten: row.ho_va_ten,
    hinh_anh: row.hinh_anh,
    nam_sinh: row.nam_sinh,
    cap_bac_hien_tai: row.cap_bac_hien_tai,
    chuc_vu: row.chuc_vu,
    lich_su_cong_tac: row.lich_su_cong_tac,
    ghi_chu: row.ghi_chu,
  };
}

export function nextThuTuFromList(items: LanhDaoLuuDoan[]): number {
  if (items.length === 0) return 1;
  return Math.max(...items.map((i) => i.thu_tu ?? 0), 0) + 1;
}
