import type { MoiNgayMotLoiDayBacHo } from '../core/types';
import type { MoiNgayMotLoiDayBacHoFormValues } from '../core/schema';
import { formatDateForInput } from '@/lib/utils';

export function getDefaultMoiNgayMotLoiDayBacHoFormValues(todayIso: string): MoiNgayMotLoiDayBacHoFormValues {
  return {
    ngay: todayIso,
    ten_tai_lieu: '',
    hinh_anh: '',
    tep_dinh_kem: '',
    id_nguoi_tao: '',
  };
}

export function moiNgayMotLoiDayBacHoToFormValues(t: MoiNgayMotLoiDayBacHo): MoiNgayMotLoiDayBacHoFormValues {
  return {
    ngay: t.ngay ? formatDateForInput(t.ngay) : '',
    ten_tai_lieu: t.ten_tai_lieu,
    hinh_anh: t.hinh_anh ?? '',
    tep_dinh_kem: t.tep_dinh_kem ?? '',
    id_nguoi_tao: t.id_nguoi_tao ?? '',
  };
}
