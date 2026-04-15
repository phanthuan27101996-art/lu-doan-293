import type { ImageItem } from '@/components/ui/MultiImageInput';
import type { DoanCoSo } from '../core/types';
import type { DoanCoSoFormValues } from '../core/schema';

export function getDefaultDoanCoSoFormValues(): DoanCoSoFormValues {
  const today = new Date().toISOString().slice(0, 10);
  return {
    ngay: today,
    nhom: '',
    ten: '',
    ghi_chu: '',
    link: '',
    id_nguoi_tao: '',
  };
}

export function doanCoSoToFormValues(t: DoanCoSo): DoanCoSoFormValues {
  return {
    ngay: t.ngay?.slice(0, 10) ?? '',
    nhom: t.nhom ?? '',
    ten: t.ten,
    ghi_chu: t.ghi_chu ?? '',
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
