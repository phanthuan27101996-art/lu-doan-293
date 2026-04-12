/**
 * Parent path theo URL — dùng cho nút Back (mobile bottom nav).
 * Trang chủ (/) trả về undefined.
 */
const PARENT_BY_PATH: Record<string, string | undefined> = {
  '/truyen-thong': '/',
  '/trang-tin': '/',
  '/tai-lieu': '/',
  '/cong-van': '/',
  '/moi-tuan-mot-dieu-luat': '/',
  '/moi-ngay-mot-loi-day-bac-ho': '/',
  '/thi-trac-nghiem': '/',
  '/doan-co-so': '/',
  '/kho-video': '/',
  '/kho-nhac': '/',
  '/gop-y': '/',
  '/danh-sach-quan-nhan': '/',
  '/chuc-vu': '/',
  '/phan-quyen': '/',
};

export function getParentPath(pathname: string): string | undefined {
  if (pathname === '/') return undefined;
  const exact = PARENT_BY_PATH[pathname];
  if (exact !== undefined) return exact;
  if (pathname.endsWith('/huong-dan')) return pathname.replace(/\/huong-dan$/, '');
  return undefined;
}
