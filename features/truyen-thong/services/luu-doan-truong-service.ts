import { createRepository } from '@/lib/data/create-repository';
import type { LuuDoanTruong } from '../core/luu-doan-truong-types';
import type { LuuDoanTruongFormValues } from '../core/luu-doan-truong-schema';

function toInt(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function normalizeRow(row: Record<string, unknown>): LuuDoanTruong {
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

const MOCK_LUU_DOAN_TRUONG: LuuDoanTruong[] = [
  {
    id: 'mock-ldt-1',
    thu_tu: 1,
    ho_va_ten: 'Cao Văn Hậu',
    hinh_anh: PLACEHOLDER_IMG,
    nam_sinh: null,
    thoi_gian_dam_nhiem: '1993 - 1998',
    cap_bac_hien_tai: null,
    chuc_vu_cuoi_cung: 'Trung đoàn trưởng',
    ghi_chu: null,
    tg_tao: new Date().toISOString(),
    tg_cap_nhat: new Date().toISOString(),
  },
];

const repo = createRepository<LuuDoanTruong>({
  tableName: 'luu_doan_truong',
  mockData: MOCK_LUU_DOAN_TRUONG,
  select: '*',
  delay: 300,
});

export async function listLuuDoanTruong(): Promise<LuuDoanTruong[]> {
  const rows = await repo.getAll({ orderBy: 'thu_tu', ascending: true });
  return rows.map((r) => normalizeRow(r as unknown as Record<string, unknown>));
}

function formToInsertPayload(data: LuuDoanTruongFormValues) {
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

export async function createLuuDoanTruong(data: LuuDoanTruongFormValues): Promise<LuuDoanTruong> {
  const inserted = await repo.insert(formToInsertPayload(data) as Omit<LuuDoanTruong, 'id'> & Record<string, unknown>);
  return normalizeRow(inserted as unknown as Record<string, unknown>);
}

export async function updateLuuDoanTruong(id: string, data: LuuDoanTruongFormValues): Promise<LuuDoanTruong> {
  const updated = await repo.update(id, formToInsertPayload(data) as Partial<LuuDoanTruong> & Record<string, unknown>);
  return normalizeRow(updated as unknown as Record<string, unknown>);
}

export async function deleteLuuDoanTruong(ids: string[]): Promise<void> {
  await repo.remove(ids);
}
