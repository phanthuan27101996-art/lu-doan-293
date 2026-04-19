import type { TaiLieu } from '../core/types';
import type { TaiLieuFormValues } from '../core/schema';

export function getDefaultTaiLieuFormValues(): TaiLieuFormValues {
  return {
    id_chuc_vu: '',
    nhom_tai_lieu: '',
    ten_tai_lieu: '',
    link: '',
    ghi_chu: '',
    id_nguoi_tao: '',
  };
}

export function taiLieuToFormValues(t: TaiLieu): TaiLieuFormValues {
  return {
    id_chuc_vu: t.id_chuc_vu ?? '',
    nhom_tai_lieu: t.nhom_tai_lieu ?? '',
    ten_tai_lieu: t.ten_tai_lieu,
    link: t.link ?? '',
    ghi_chu: t.ghi_chu ?? '',
    id_nguoi_tao: t.id_nguoi_tao ?? '',
  };
}
