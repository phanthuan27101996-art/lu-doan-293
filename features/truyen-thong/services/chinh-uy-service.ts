import { createRepository } from '@/lib/data/create-repository';
import type { ChinhUy } from '../core/chinh-uy-types';
import type { ChinhUyFormValues } from '../core/chinh-uy-schema';

function toInt(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function normalizeRow(row: Record<string, unknown>): ChinhUy {
  return {
    id: String(row.id ?? ''),
    thu_tu: toInt(row.thu_tu) ?? 0,
    ho_va_ten: String(row.ho_va_ten ?? ''),
    hinh_anh: (row.hinh_anh as string | null) ?? null,
    nam_sinh: toInt(row.nam_sinh),
    thoi_gian_dam_nhiem: (row.thoi_gian_dam_nhiem as string | null) ?? null,
    cap_bac_hien_tai: (row.cap_bac_hien_tai as string | null) ?? null,
    chuc_vu_cuoi_cung: (row.chuc_vu_cuoi_cung as string | null) ?? null,
    ghi_chu: (row.ghi_chu as string | null) ?? null,
    tg_tao: (row.tg_tao as string | null) ?? null,
    tg_cap_nhat: (row.tg_cap_nhat as string | null) ?? null,
  };
}

const PLACEHOLDER_IMG = 'https://cdn-icons-png.flaticon.com/256/6211/6211662.png';

const MOCK_CHINH_UY: ChinhUy[] = [
  {
    id: 'mock-cu-1',
    thu_tu: 1,
    ho_va_ten: 'Nguyễn Kim Tân',
    hinh_anh: PLACEHOLDER_IMG,
    nam_sinh: null,
    thoi_gian_dam_nhiem: '1993 - 1998',
    cap_bac_hien_tai: null,
    chuc_vu_cuoi_cung: 'Phó Trung đoàn trưởng về Chính trị',
    ghi_chu: null,
    tg_tao: new Date().toISOString(),
    tg_cap_nhat: new Date().toISOString(),
  },
];

const repo = createRepository<ChinhUy>({
  tableName: 'chinh_uy',
  mockData: MOCK_CHINH_UY,
  select: '*',
  delay: 300,
});

export async function listChinhUy(): Promise<ChinhUy[]> {
  const rows = await repo.getAll({ orderBy: 'thu_tu', ascending: true });
  return rows.map((r) => normalizeRow(r as unknown as Record<string, unknown>));
}

function formToInsertPayload(data: ChinhUyFormValues) {
  return {
    thu_tu: data.thu_tu,
    ho_va_ten: data.ho_va_ten.trim(),
    hinh_anh: data.hinh_anh?.trim() ? data.hinh_anh.trim() : null,
    nam_sinh: data.nam_sinh != null && !Number.isNaN(data.nam_sinh) ? data.nam_sinh : null,
    thoi_gian_dam_nhiem: data.thoi_gian_dam_nhiem.trim(),
    cap_bac_hien_tai: data.cap_bac_hien_tai?.trim() ? data.cap_bac_hien_tai.trim() : null,
    chuc_vu_cuoi_cung: data.chuc_vu_cuoi_cung?.trim() ? data.chuc_vu_cuoi_cung.trim() : null,
    ghi_chu: data.ghi_chu?.trim() ? data.ghi_chu.trim() : null,
  };
}

export async function createChinhUy(data: ChinhUyFormValues): Promise<ChinhUy> {
  const inserted = await repo.insert(formToInsertPayload(data) as Omit<ChinhUy, 'id'> & Record<string, unknown>);
  return normalizeRow(inserted as unknown as Record<string, unknown>);
}

export async function updateChinhUy(id: string, data: ChinhUyFormValues): Promise<ChinhUy> {
  const updated = await repo.update(id, formToInsertPayload(data) as Partial<ChinhUy> & Record<string, unknown>);
  return normalizeRow(updated as unknown as Record<string, unknown>);
}

export async function deleteChinhUy(ids: string[]): Promise<void> {
  await repo.remove(ids);
}
