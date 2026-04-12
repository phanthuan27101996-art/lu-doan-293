import type { CongVan } from '../core/types';
import type { CongVanFormValues } from '../core/schema';
import { formatDateForInput } from '@/lib/utils';

export function getDefaultCongVanFormValues(todayIso: string): CongVanFormValues {
  return {
    don_vi: '',
    ngay: todayIso,
    ten_van_ban: '',
    ghi_chu: '',
    tep_dinh_kem: '',
    link: '',
    id_nguoi_tao: '',
  };
}

export function congVanToFormValues(t: CongVan): CongVanFormValues {
  return {
    don_vi: t.don_vi ?? '',
    ngay: t.ngay ? formatDateForInput(t.ngay) : '',
    ten_van_ban: t.ten_van_ban,
    ghi_chu: t.ghi_chu ?? '',
    tep_dinh_kem: t.tep_dinh_kem ?? '',
    link: t.link ?? '',
    id_nguoi_tao: t.id_nguoi_tao ?? '',
  };
}
