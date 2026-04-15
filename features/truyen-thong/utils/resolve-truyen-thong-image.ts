const FALLBACK = 'https://cdn-icons-png.flaticon.com/256/6211/6211662.png';

/** Chuỗi ảnh: URL tuyệt đối hoặc đường dẫn tương đối (encode segment) dưới BASE_URL. */
export function resolveTruyenThongImageSrc(hinhAnh: string | null | undefined): string {
  const raw = (hinhAnh ?? '').trim();
  if (!raw) return FALLBACK;
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const parts = raw.split('/').filter(Boolean);
  const encoded = parts.map((p) => encodeURIComponent(p)).join('/');
  return `${base}/${encoded}`;
}
