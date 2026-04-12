import { congVanFormSchema, type CongVanFormValues } from '../core/schema';

/** Chuẩn hoá ô ngày từ Excel (serial / chuỗi DD/MM/YYYY / ISO). */
export function normalizeNgayForImport(raw: unknown): string {
  if (raw == null || raw === '') return '';
  if (typeof raw === 'number' && !Number.isNaN(raw)) {
    const utcMs = (raw - 25569) * 86400 * 1000;
    const d = new Date(utcMs);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  }
  const s = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/);
  if (m) {
    const dd = m[1].padStart(2, '0');
    const mm = m[2].padStart(2, '0');
    const yyyy = m[3];
    return `${yyyy}-${mm}-${dd}`;
  }
  return '';
}

export function rowToCongVanImportPayload(
  row: Record<string, unknown>,
  idNguoiTao: string,
): CongVanFormValues | null {
  const values: CongVanFormValues = {
    don_vi: String(row.don_vi ?? '').trim(),
    ngay: normalizeNgayForImport(row.ngay),
    ten_van_ban: String(row.ten_van_ban ?? '').trim(),
    ghi_chu: String(row.ghi_chu ?? '').trim(),
    tep_dinh_kem: String(row.tep_dinh_kem ?? '').trim(),
    link: String(row.link ?? '').trim(),
    id_nguoi_tao: idNguoiTao,
  };
  const r = congVanFormSchema.safeParse(values);
  return r.success ? r.data : null;
}
