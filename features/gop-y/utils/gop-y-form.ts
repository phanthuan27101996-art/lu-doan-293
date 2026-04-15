import type { ImageItem } from '@/components/ui/MultiImageInput';
import type { GopY } from '../core/types';
import type { GopYFormValues } from '../core/schema';

export function getDefaultGopYFormValues(): GopYFormValues {
  const today = new Date().toISOString().slice(0, 10);
  return {
    ngay: today,
    tieu_de_gop_y: '',
    chi_tiet_gop_y: '',
    id_nguoi_tao: '',
  };
}

export function gopYToFormValues(t: GopY): GopYFormValues {
  return {
    ngay: t.ngay?.slice(0, 10) ?? '',
    tieu_de_gop_y: t.tieu_de_gop_y,
    chi_tiet_gop_y: t.chi_tiet_gop_y,
    id_nguoi_tao: t.id_nguoi_tao ?? '',
  };
}

export function hinhAnhToImageItems(urls: string[]): ImageItem[] {
  return urls.map((src, i) => ({
    id: `img-${i}-${src.slice(-24).replace(/\W/g, '') || i}`,
    src,
  }));
}
