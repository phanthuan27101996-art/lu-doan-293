/**
 * Thương hiệu ứng dụng cố định — không có màn hình chỉnh sửa.
 * Giữ khớp với `index.html` (favicon / og) và `vite.config.ts` (PWA icons).
 */
export const APP_DISPLAY_NAME = 'Lữ đoàn 293';
export const APP_TAGLINE = 'Ứng dụng quản lý';
/** File trong thư mục `public/` */
export const APP_LOGO_PATH = '/app-icon.jpg';

export function resolveAppLogoAbsoluteUrl(): string {
  if (typeof window === 'undefined') return APP_LOGO_PATH;
  if (APP_LOGO_PATH.startsWith('http://') || APP_LOGO_PATH.startsWith('https://')) {
    return APP_LOGO_PATH;
  }
  return new URL(APP_LOGO_PATH, window.location.origin).href;
}
