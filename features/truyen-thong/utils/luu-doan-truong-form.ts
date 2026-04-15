import type { LuuDoanTruong } from '../core/luu-doan-truong-types';
import type { LuuDoanTruongFormValues } from '../core/luu-doan-truong-schema';

export function getDefaultLuuDoanTruongFormValues(nextThuTu: number): LuuDoanTruongFormValues {
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

export function luuDoanTruongToFormValues(row: LuuDoanTruong): LuuDoanTruongFormValues {
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

export function nextThuTuFromLuuDoanTruongList(items: LuuDoanTruong[]): number {
  if (items.length === 0) return 1;
  return Math.max(...items.map((i) => i.thu_tu ?? 0), 0) + 1;
}
