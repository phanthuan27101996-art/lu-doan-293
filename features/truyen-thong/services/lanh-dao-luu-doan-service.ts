import { createRepository } from '@/lib/data/create-repository';
import type { LanhDaoLuuDoan } from '../core/lanh-dao-types';
import type { LanhDaoLuuDoanFormValues } from '../core/lanh-dao-schema';

function toInt(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function normalizeRow(row: Record<string, unknown>): LanhDaoLuuDoan {
  return {
    id: String(row.id ?? ''),
    thu_tu: toInt(row.thu_tu) ?? 0,
    ho_va_ten: String(row.ho_va_ten ?? ''),
    hinh_anh: (row.hinh_anh as string | null) ?? null,
    nam_sinh: toInt(row.nam_sinh),
    cap_bac_hien_tai: (row.cap_bac_hien_tai as string | null) ?? null,
    chuc_vu: (row.chuc_vu as string | null) ?? null,
    lich_su_cong_tac: (row.lich_su_cong_tac as string | null) ?? null,
    ghi_chu: (row.ghi_chu as string | null) ?? null,
    tg_tao: (row.tg_tao as string | null) ?? null,
    tg_cap_nhat: (row.tg_cap_nhat as string | null) ?? null,
  };
}

const PLACEHOLDER_IMG = 'https://cdn-icons-png.flaticon.com/256/6211/6211662.png';

const MOCK_LANH_DAO: LanhDaoLuuDoan[] = [
  {
    id: 'mock-ld-1',
    thu_tu: 1,
    ho_va_ten: 'Phạm Văn Chuyên',
    hinh_anh: PLACEHOLDER_IMG,
    nam_sinh: 1974,
    cap_bac_hien_tai: 'Đại tá',
    chuc_vu: 'Lữ đoàn trưởng',
    lich_su_cong_tac: '',
    ghi_chu: 'Giữ chức vụ Lữ đoàn trưởng từ năm 2023 đến nay',
    tg_tao: new Date().toISOString(),
    tg_cap_nhat: new Date().toISOString(),
  },
  {
    id: 'mock-ld-2',
    thu_tu: 2,
    ho_va_ten: 'Đinh Trần Y',
    hinh_anh: PLACEHOLDER_IMG,
    nam_sinh: 1971,
    cap_bac_hien_tai: 'Đại tá',
    chuc_vu: 'Chính ủy Lữ đoàn',
    lich_su_cong_tac: '',
    ghi_chu: 'Giữ chức vụ Chính ủy Lữ đoàn từ năm 2023 đến nay',
    tg_tao: new Date().toISOString(),
    tg_cap_nhat: new Date().toISOString(),
  },
];

const repo = createRepository<LanhDaoLuuDoan>({
  tableName: 'lanh_dao_luu_doan',
  mockData: MOCK_LANH_DAO,
  select: '*',
  delay: 300,
});

export async function listLanhDaoLuuDoan(): Promise<LanhDaoLuuDoan[]> {
  const rows = await repo.getAll({ orderBy: 'thu_tu', ascending: true });
  return rows.map((r) => normalizeRow(r as unknown as Record<string, unknown>));
}

function formToInsertPayload(data: LanhDaoLuuDoanFormValues) {
  return {
    thu_tu: data.thu_tu,
    ho_va_ten: data.ho_va_ten.trim(),
    hinh_anh: data.hinh_anh?.trim() ? data.hinh_anh.trim() : null,
    nam_sinh: data.nam_sinh != null && !Number.isNaN(data.nam_sinh) ? data.nam_sinh : null,
    cap_bac_hien_tai: data.cap_bac_hien_tai?.trim() ? data.cap_bac_hien_tai.trim() : null,
    chuc_vu: data.chuc_vu?.trim() ? data.chuc_vu.trim() : null,
    lich_su_cong_tac: data.lich_su_cong_tac?.trim() ? data.lich_su_cong_tac.trim() : null,
    ghi_chu: data.ghi_chu?.trim() ? data.ghi_chu.trim() : null,
  };
}

export async function createLanhDaoLuuDoan(data: LanhDaoLuuDoanFormValues): Promise<LanhDaoLuuDoan> {
  const inserted = await repo.insert(formToInsertPayload(data) as Omit<LanhDaoLuuDoan, 'id'> & Record<string, unknown>);
  return normalizeRow(inserted as unknown as Record<string, unknown>);
}

export async function updateLanhDaoLuuDoan(id: string, data: LanhDaoLuuDoanFormValues): Promise<LanhDaoLuuDoan> {
  const updated = await repo.update(id, formToInsertPayload(data) as Partial<LanhDaoLuuDoan> & Record<string, unknown>);
  return normalizeRow(updated as unknown as Record<string, unknown>);
}

export async function deleteLanhDaoLuuDoan(ids: string[]): Promise<void> {
  await repo.remove(ids);
}
