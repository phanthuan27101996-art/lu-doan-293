import type { KhoVideo } from '../core/types';
import type { KhoVideoFormValues } from '../core/schema';
import { createRepository } from '@/lib/data/create-repository';
import { isSupabase } from '@/lib/data/config';
import i18n from '@/lib/i18n';
import { getEmployees } from '@/features/he-thong/nhan-vien/services/nhan-vien-service';

const MOCK_SEED: KhoVideo[] = [
  {
    id: '1',
    bo_suu_tap: 'VIDEO 5 VŨ ĐIỆU SINH HOẠT',
    ten_video: 'Bài 5 - Vũ điệu hòa bình',
    ghi_chu: null,
    link: 'https://www.youtube.com/watch?v=7-EojpWbV-Q',
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-04-01T08:00:00.000Z',
    tg_cap_nhat: '2025-04-01T08:00:00.000Z',
  },
  {
    id: '2',
    bo_suu_tap: 'VIDEO 5 VŨ ĐIỆU SINH HOẠT',
    ten_video: 'Bài 4 - Vũ Điệu Lính trẻ',
    ghi_chu: null,
    link: 'https://www.youtube.com/watch?v=4-jX5SrBmZU',
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-04-02T08:00:00.000Z',
    tg_cap_nhat: '2025-04-02T08:00:00.000Z',
  },
  {
    id: '3',
    bo_suu_tap: 'VIDEO 5 VŨ ĐIỆU SINH HOẠT',
    ten_video: 'Bài 3 - Vũ Điệu Hành Quân',
    ghi_chu: null,
    link: 'https://www.youtube.com/watch?v=p2qXe9IfjTk',
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-04-03T08:00:00.000Z',
    tg_cap_nhat: '2025-04-03T08:00:00.000Z',
  },
  {
    id: '4',
    bo_suu_tap: 'VIDEO 5 VŨ ĐIỆU SINH HOẠT',
    ten_video: 'Bài 2 - Vũ điệu quân dân',
    ghi_chu: null,
    link: 'https://www.youtube.com/watch?v=ZB80hf-6iIc',
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-04-04T08:00:00.000Z',
    tg_cap_nhat: '2025-04-04T08:00:00.000Z',
  },
  {
    id: '5',
    bo_suu_tap: 'VIDEO 5 VŨ ĐIỆU SINH HOẠT',
    ten_video: 'Bài 1 - Vũ điệu niềm tin',
    ghi_chu: null,
    link: 'https://www.youtube.com/watch?v=JHM8r15QHP0',
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-04-05T08:00:00.000Z',
    tg_cap_nhat: '2025-04-05T08:00:00.000Z',
  },
];

const repo = createRepository<KhoVideo>({
  tableName: 'kho_video',
  mockData: MOCK_SEED,
  select: '*',
  delay: 400,
});

function flattenRow(row: Record<string, unknown>): KhoVideo {
  return {
    id: String(row.id ?? ''),
    bo_suu_tap: (row.bo_suu_tap as string) ?? '',
    ten_video: (row.ten_video as string) ?? '',
    ghi_chu: row.ghi_chu != null && String(row.ghi_chu).trim() !== '' ? String(row.ghi_chu) : null,
    link: row.link != null && String(row.link).trim() !== '' ? String(row.link) : null,
    id_nguoi_tao:
      row.id_nguoi_tao != null && row.id_nguoi_tao !== '' ? String(row.id_nguoi_tao as string | number) : null,
    tg_tao: (row.tg_tao as string | null) ?? null,
    tg_cap_nhat: (row.tg_cap_nhat as string | null) ?? null,
  };
}

function toDbPayload(data: KhoVideoFormValues): Record<string, unknown> {
  return {
    bo_suu_tap: data.bo_suu_tap.trim(),
    ten_video: data.ten_video.trim(),
    ghi_chu: data.ghi_chu?.trim() ? data.ghi_chu.trim() : null,
    link: data.link?.trim() ? data.link.trim() : null,
    id_nguoi_tao: data.id_nguoi_tao?.trim() ? data.id_nguoi_tao.trim() : null,
  };
}

async function enrichTenNguoiTao(items: KhoVideo[]): Promise<KhoVideo[]> {
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

export const getKhoVideoList = async (): Promise<KhoVideo[]> => {
  const list = await repo.getAll(
    isSupabase() ? { orderBy: 'tg_cap_nhat', ascending: false } : { orderBy: 'tg_cap_nhat', ascending: false },
  );
  const rows = isSupabase()
    ? (list as unknown as Record<string, unknown>[]).map(flattenRow)
    : (list as KhoVideo[]);
  return enrichTenNguoiTao(rows);
};

export const getKhoVideoById = async (id: string): Promise<KhoVideo | undefined> => {
  const row = await repo.getById(id);
  if (!row) return undefined;
  const flat = isSupabase() ? flattenRow(row as unknown as Record<string, unknown>) : (row as KhoVideo);
  const [out] = await enrichTenNguoiTao([flat]);
  return out;
};

export const createKhoVideo = async (data: KhoVideoFormValues): Promise<KhoVideo> => {
  const payload = toDbPayload(data);
  if (isSupabase()) {
    const inserted = await repo.insert(payload as Omit<KhoVideo, 'id'> & { id?: string });
    const flat = flattenRow(inserted as unknown as Record<string, unknown>);
    const [out] = await enrichTenNguoiTao([flat]);
    return out!;
  }
  const inserted = await repo.insert({
    ...payload,
    tg_tao: new Date().toISOString(),
    tg_cap_nhat: new Date().toISOString(),
  } as Omit<KhoVideo, 'id'> & { id?: string });
  const [out] = await enrichTenNguoiTao([inserted as KhoVideo]);
  return out!;
};

export const updateKhoVideo = async (id: string, data: KhoVideoFormValues): Promise<KhoVideo> => {
  const existing = await repo.getById(id);
  if (!existing) throw new Error(i18n.t('khoVideo.dm.service.notFound'));
  const payload = toDbPayload(data);
  if (isSupabase()) {
    const updated = await repo.update(id, payload as Partial<KhoVideo>);
    const flat = flattenRow(updated as unknown as Record<string, unknown>);
    const [out] = await enrichTenNguoiTao([flat]);
    return out!;
  }
  const updated = await repo.update(id, {
    ...payload,
    tg_cap_nhat: new Date().toISOString(),
  } as Partial<KhoVideo>);
  const [out] = await enrichTenNguoiTao([updated as KhoVideo]);
  return out!;
};

export const deleteKhoVideoList = async (ids: string[]): Promise<void> => {
  await repo.remove(ids);
};
