import type { ImageItem } from '@/components/ui/MultiImageInput';
import type { TrangTin } from '../core/types';
import type { TrangTinFormValues } from '../core/schema';

export function getDefaultTrangTinFormValues(): TrangTinFormValues {
  const today = new Date().toISOString().slice(0, 10);
  return {
    ngay_dang: today,
    tieu_de: '',
    mo_ta_ngan: '',
    link: '',
    id_nguoi_tao: '',
  };
}

export function trangTinToFormValues(t: TrangTin): TrangTinFormValues {
  return {
    ngay_dang: t.ngay_dang?.slice(0, 10) ?? '',
    tieu_de: t.tieu_de,
    mo_ta_ngan: t.mo_ta_ngan,
    link: t.link ?? '',
    id_nguoi_tao: t.id_nguoi_tao ?? '',
  };
}

export function hinhAnhToImageItems(urls: string[]): ImageItem[] {
  return urls.map((src, i) => ({
    id: `img-${i}-${src.slice(-24).replace(/\W/g, '') || i}`,
    src,
  }));
}
