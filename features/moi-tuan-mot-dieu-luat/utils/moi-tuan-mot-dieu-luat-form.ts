import type { MoiTuanMotDieuLuat } from '../core/types';
import type { MoiTuanMotDieuLuatFormValues } from '../core/schema';

export function getDefaultMoiTuanMotDieuLuatFormValues(): MoiTuanMotDieuLuatFormValues {
  const y = new Date().getFullYear();
  return {
    nam: y,
    thang: 1,
    tuan: 1,
    ten_dieu_luat: '',
    ghi_chu: '',
    hinh_anh: '',
    tep_dinh_kem: '',
    link: '',
    id_nguoi_tao: '',
  };
}

export function moiTuanMotDieuLuatToFormValues(t: MoiTuanMotDieuLuat): MoiTuanMotDieuLuatFormValues {
  return {
    nam: t.nam,
    thang: t.thang,
    tuan: t.tuan,
    ten_dieu_luat: t.ten_dieu_luat,
    ghi_chu: t.ghi_chu ?? '',
    hinh_anh: t.hinh_anh ?? '',
    tep_dinh_kem: t.tep_dinh_kem ?? '',
    link: t.link ?? '',
    id_nguoi_tao: t.id_nguoi_tao ?? '',
  };
}
