import type { MoiTuanMotDieuLuat } from '../core/types';
import type { MoiTuanMotDieuLuatFormValues } from '../core/schema';

/** Khóa `yyyy/mm` khớp `nam_thang` (DB). */
export function parseNamThangKey(s: string): { nam: number; thang: number } | null {
  const m = /^(\d{4})\/(\d{1,2})$/.exec(s.trim());
  if (!m) return null;
  const nam = Number(m[1]);
  const thang = Number(m[2]);
  if (thang < 1 || thang > 12 || nam < 2000 || nam > 2100) return null;
  return { nam, thang };
}

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
