import type { TaiLieu } from '../core/types';
import type { TaiLieuFormValues } from '../core/schema';
import { createRepository } from '@/lib/data/create-repository';
import { isSupabase } from '@/lib/data/config';
import i18n from '@/lib/i18n';
import { getEmployees } from '@/features/he-thong/nhan-vien/services/nhan-vien-service';
import { getPositions } from '@/features/he-thong/chuc-vu/services/chuc-vu-service';

const MOCK_SEED: TaiLieu[] = [
  {
    id: '1',
    id_chuc_vu: '1',
    nhom_tai_lieu: 'Hướng dẫn nội bộ',
    ten_tai_lieu: 'Quy chế làm việc (mẫu)',
    link: 'https://example.com/quy-che-293',
    ghi_chu: 'Bản cập nhật 2025',
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-04-01T08:00:00.000Z',
    tg_cap_nhat: '2025-04-01T08:00:00.000Z',
  },
  {
    id: '2',
    id_chuc_vu: '1',
    nhom_tai_lieu: 'Tuyên truyền',
    ten_tai_lieu: 'Mẫu slide giới thiệu đơn vị',
    link: null,
    ghi_chu: null,
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-04-05T10:00:00.000Z',
    tg_cap_nhat: '2025-04-05T10:00:00.000Z',
  },
  {
    id: '3',
    id_chuc_vu: '1',
    nhom_tai_lieu: 'Hướng dẫn nội bộ',
    ten_tai_lieu: 'Danh mục biểu mẫu hành chính',
    link: 'https://example.com/bieu-mau',
    ghi_chu: '',
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-04-10T12:00:00.000Z',
    tg_cap_nhat: '2025-04-10T12:00:00.000Z',
  },
];

const repo = createRepository<TaiLieu>({
  tableName: 'tai_lieu',
  mockData: MOCK_SEED,
  select: '*',
  delay: 400,
});

function flattenRow(row: Record<string, unknown>): TaiLieu {
  const idCv = row.id_chuc_vu;
  return {
    id: String(row.id ?? ''),
    id_chuc_vu: idCv != null && String(idCv).trim() !== '' ? String(idCv) : '',
    nhom_tai_lieu: (row.nhom_tai_lieu as string) ?? '',
    ten_tai_lieu: (row.ten_tai_lieu as string) ?? '',
    link: row.link != null && String(row.link).trim() !== '' ? String(row.link) : null,
    ghi_chu: row.ghi_chu != null && String(row.ghi_chu).trim() !== '' ? String(row.ghi_chu) : null,
    id_nguoi_tao:
      row.id_nguoi_tao != null && row.id_nguoi_tao !== '' ? String(row.id_nguoi_tao as string | number) : null,
    tg_tao: (row.tg_tao as string | null) ?? null,
    tg_cap_nhat: (row.tg_cap_nhat as string | null) ?? null,
  };
}

function toDbPayload(data: TaiLieuFormValues): Record<string, unknown> {
  return {
    id_chuc_vu: data.id_chuc_vu.trim(),
    nhom_tai_lieu: data.nhom_tai_lieu.trim(),
    ten_tai_lieu: data.ten_tai_lieu.trim(),
    link: data.link?.trim() ? data.link.trim() : null,
    ghi_chu: data.ghi_chu?.trim() ? data.ghi_chu.trim() : null,
    id_nguoi_tao: data.id_nguoi_tao?.trim() ? data.id_nguoi_tao.trim() : null,
  };
}

async function enrichTenNguoiTao(items: TaiLieu[]): Promise<TaiLieu[]> {
  if (items.length === 0) return items;
  const need = new Set(items.map((i) => i.id_nguoi_tao).filter(Boolean) as string[]);
  if (need.size === 0) return items;
  const employees = await getEmployees();
  const map = new Map(employees.map((e) => [e.id, e.ho_ten]));
  return items.map((row) => ({
    ...row,
    ten_nguoi_tao: row.id_nguoi_tao ? map.get(row.id_nguoi_tao) ?? row.ten_nguoi_tao : row.ten_nguoi_tao,
  }));
}

async function enrichTenChucVu(items: TaiLieu[]): Promise<TaiLieu[]> {
  if (items.length === 0) return items;
  const needCv = new Set(items.map((i) => i.id_chuc_vu).filter(Boolean) as string[]);
  if (needCv.size === 0) return items;
  const positions = await getPositions();
  const map = new Map(positions.map((p) => [p.id, p.ten_chuc_vu]));
  return items.map((row) => ({
    ...row,
    ten_chuc_vu: row.id_chuc_vu ? map.get(row.id_chuc_vu) ?? row.ten_chuc_vu : row.ten_chuc_vu,
  }));
}

async function enrichTaiLieuDisplay(items: TaiLieu[]): Promise<TaiLieu[]> {
  const withCreators = await enrichTenNguoiTao(items);
  return enrichTenChucVu(withCreators);
}

export const getTaiLieuList = async (): Promise<TaiLieu[]> => {
  const list = await repo.getAll(
    isSupabase() ? { orderBy: 'tg_cap_nhat', ascending: false } : { orderBy: 'tg_cap_nhat', ascending: false },
  );
  const rows = isSupabase()
    ? (list as unknown as Record<string, unknown>[]).map(flattenRow)
    : (list as TaiLieu[]);
  return enrichTaiLieuDisplay(rows);
};

export const getTaiLieuById = async (id: string): Promise<TaiLieu | undefined> => {
  const row = await repo.getById(id);
  if (!row) return undefined;
  const flat = isSupabase() ? flattenRow(row as unknown as Record<string, unknown>) : (row as TaiLieu);
  const [out] = await enrichTaiLieuDisplay([flat]);
  return out;
};

export const createTaiLieu = async (data: TaiLieuFormValues): Promise<TaiLieu> => {
  const payload = toDbPayload(data);
  if (isSupabase()) {
    const inserted = await repo.insert(payload as Omit<TaiLieu, 'id'> & { id?: string });
    const flat = flattenRow(inserted as unknown as Record<string, unknown>);
    const [out] = await enrichTaiLieuDisplay([flat]);
    return out!;
  }
  const inserted = await repo.insert({
    ...payload,
    tg_tao: new Date().toISOString(),
    tg_cap_nhat: new Date().toISOString(),
  } as Omit<TaiLieu, 'id'> & { id?: string });
  const [out] = await enrichTaiLieuDisplay([inserted as TaiLieu]);
  return out!;
};

export const updateTaiLieu = async (id: string, data: TaiLieuFormValues): Promise<TaiLieu> => {
  const existing = await repo.getById(id);
  if (!existing) throw new Error(i18n.t('taiLieu.dm.service.notFound'));
  const payload = toDbPayload(data);
  if (isSupabase()) {
    const updated = await repo.update(id, payload as Partial<TaiLieu>);
    const flat = flattenRow(updated as unknown as Record<string, unknown>);
    const [out] = await enrichTaiLieuDisplay([flat]);
    return out!;
  }
  const updated = await repo.update(id, {
    ...payload,
    tg_cap_nhat: new Date().toISOString(),
  } as Partial<TaiLieu>);
  const [out] = await enrichTaiLieuDisplay([updated as TaiLieu]);
  return out!;
};

export const deleteTaiLieuList = async (ids: string[]): Promise<void> => {
  await repo.remove(ids);
};
