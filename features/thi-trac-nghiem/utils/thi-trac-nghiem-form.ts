import type { ThiTracNghiem } from '../core/types';
import type { ThiTracNghiemFormValues } from '../core/schema';

export function getDefaultThiTracNghiemFormValues(): ThiTracNghiemFormValues {
  return {
    nhom: '',
    ten_de_thi: '',
    link: '',
    id_nguoi_tao: '',
  };
}

export function thiTracNghiemToFormValues(t: ThiTracNghiem): ThiTracNghiemFormValues {
  return {
    nhom: t.nhom ?? '',
    ten_de_thi: t.ten_de_thi,
    link: t.link ?? '',
    id_nguoi_tao: t.id_nguoi_tao ?? '',
  };
}
