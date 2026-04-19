/** Khóa `yyyy/mm` suy ra từ ngày ISO `YYYY-MM-DD`. */
export function ngayISOToNamThangKey(ngay: string): string {
  const d = (ngay ?? '').trim().slice(0, 10);
  if (d.length < 7) return '';
  const y = d.slice(0, 4);
  const m = d.slice(5, 7);
  if (!/^\d{4}$/.test(y) || !/^\d{2}$/.test(m)) return '';
  return `${y}/${m}`;
}

/** Khóa `yyyy/mm` khớp cách hiển thị mô-đun « mỗi tuần ». */
export function parseNamThangKey(s: string): { nam: number; thang: number } | null {
  const m = /^(\d{4})\/(\d{1,2})$/.exec(s.trim());
  if (!m) return null;
  const nam = Number(m[1]);
  const thang = Number(m[2]);
  if (thang < 1 || thang > 12 || nam < 2000 || nam > 2100) return null;
  return { nam, thang };
}
