import type { ChinhUy } from '../core/chinh-uy-types';
import type { ChinhUyFormValues } from '../core/chinh-uy-schema';

export function getDefaultChinhUyFormValues(nextThuTu: number): ChinhUyFormValues {
  return {
    thu_tu: nextThuTu,
    ho_va_ten: '',
    hinh_anh: null,
    nam_sinh: null,
    thoi_gian_dam_nhiem: '',
    cap_bac_hien_tai: null,
    chuc_vu_cuoi_cung: null,
    ghi_chu: null,
  };
}

export function chinhUyToFormValues(row: ChinhUy): ChinhUyFormValues {
  return {
    thu_tu: row.thu_tu,
    ho_va_ten: row.ho_va_ten,
    hinh_anh: row.hinh_anh,
    nam_sinh: row.nam_sinh,
    thoi_gian_dam_nhiem: row.thoi_gian_dam_nhiem ?? '',
    cap_bac_hien_tai: row.cap_bac_hien_tai,
    chuc_vu_cuoi_cung: row.chuc_vu_cuoi_cung,
    ghi_chu: row.ghi_chu,
  };
}

export function nextThuTuFromChinhUyList(items: ChinhUy[]): number {
  if (items.length === 0) return 1;
  return Math.max(...items.map((i) => i.thu_tu ?? 0), 0) + 1;
}
