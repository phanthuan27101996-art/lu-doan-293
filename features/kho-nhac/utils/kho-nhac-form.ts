import type { KhoNhac } from '../core/types';
import type { KhoNhacFormValues } from '../core/schema';

export function getDefaultKhoNhacFormValues(): KhoNhacFormValues {
  return {
    bo_suu_tap: '',
    ten_nhac: '',
    tac_gia: '',
    ghi_chu: '',
    link: '',
    id_nguoi_tao: '',
  };
}

export function khoNhacToFormValues(t: KhoNhac): KhoNhacFormValues {
  return {
    bo_suu_tap: t.bo_suu_tap ?? '',
    ten_nhac: t.ten_nhac,
    tac_gia: t.tac_gia ?? '',
    ghi_chu: t.ghi_chu ?? '',
    link: t.link ?? '',
    id_nguoi_tao: t.id_nguoi_tao ?? '',
  };
}
