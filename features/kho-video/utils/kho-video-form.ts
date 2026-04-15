import type { KhoVideo } from '../core/types';
import type { KhoVideoFormValues } from '../core/schema';

export function getDefaultKhoVideoFormValues(): KhoVideoFormValues {
  return {
    bo_suu_tap: '',
    ten_video: '',
    ghi_chu: '',
    link: '',
    id_nguoi_tao: '',
  };
}

export function khoVideoToFormValues(t: KhoVideo): KhoVideoFormValues {
  return {
    bo_suu_tap: t.bo_suu_tap ?? '',
    ten_video: t.ten_video,
    ghi_chu: t.ghi_chu ?? '',
    link: t.link ?? '',
    id_nguoi_tao: t.id_nguoi_tao ?? '',
  };
}
