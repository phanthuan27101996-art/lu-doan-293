import type { KhoNhac } from '../core/types';
import type { KhoNhacFormValues } from '../core/schema';
import { createRepository } from '@/lib/data/create-repository';
import { isSupabase } from '@/lib/data/config';
import i18n from '@/lib/i18n';
import { getEmployees } from '@/features/he-thong/nhan-vien/services/nhan-vien-service';

const MOCK_SEED: KhoNhac[] = [
  {
    id: '1',
    bo_suu_tap: 'Bài hát về Lữ đoàn',
    ten_nhac: 'Tiếng hát Đoàn Công binh Thăng Long',
    tac_gia: 'Sáng tác: Tố Hải',
    ghi_chu: null,
    link: null,
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-04-01T08:00:00.000Z',
    tg_cap_nhat: '2025-04-01T08:00:00.000Z',
  },
  {
    id: '2',
    bo_suu_tap: 'Bài hát về Lữ đoàn',
    ten_nhac: 'Tình yêu người chiến sĩ Công binh',
    tac_gia: 'Nhạc: Phan Tuấn Uyên\nLời: Lê Xuân Hưng (Phó Chính ủy Lữ đoàn)',
    ghi_chu: null,
    link: null,
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-04-02T08:00:00.000Z',
    tg_cap_nhat: '2025-04-02T08:00:00.000Z',
  },
  {
    id: '3',
    bo_suu_tap: 'Bài hát về Binh chủng Công binh',
    ten_nhac: 'Công binh Việt Nam Anh hùng',
    tac_gia: 'Sáng tác: Thuận Yến',
    ghi_chu: null,
    link: null,
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-04-03T08:00:00.000Z',
    tg_cap_nhat: '2025-04-03T08:00:00.000Z',
  },
  {
    id: '4',
    bo_suu_tap: 'Bài hát về Binh chủng Công binh',
    ten_nhac: 'Chiến sĩ Công binh làm theo lời Bác',
    tac_gia: 'Nhạc: Nguyễn Đức Thực\nLời: Nguyễn Bá Hiểu',
    ghi_chu: null,
    link: null,
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-04-04T08:00:00.000Z',
    tg_cap_nhat: '2025-04-04T08:00:00.000Z',
  },
  {
    id: '5',
    bo_suu_tap: '15 bài hát quy định trong QĐND Việt Nam',
    ten_nhac: 'Tiến quân ca (Quốc ca)',
    tac_gia: 'Nhạc và lời: Văn Cao',
    ghi_chu: null,
    link: null,
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-04-05T08:00:00.000Z',
    tg_cap_nhat: '2025-04-05T08:00:00.000Z',
  },
  {
    id: '6',
    bo_suu_tap: '15 bài hát quy định trong QĐND Việt Nam',
    ten_nhac: 'Quốc tế ca',
    tac_gia: 'Nhạc: Pi - e Đờ - gây - tê\nThơ: Ơ - gien Pốt - chi - e',
    ghi_chu: null,
    link: null,
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-04-06T08:00:00.000Z',
    tg_cap_nhat: '2025-04-06T08:00:00.000Z',
  },
  {
    id: '7',
    bo_suu_tap: '15 bài hát quy định trong QĐND Việt Nam',
    ten_nhac: 'Chào mừng Đảng Cộng sản Việt Nam',
    tac_gia: 'Nhạc và lời: Đỗ Minh',
    ghi_chu: null,
    link: null,
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-04-07T08:00:00.000Z',
    tg_cap_nhat: '2025-04-07T08:00:00.000Z',
  },
  {
    id: '8',
    bo_suu_tap: '15 bài hát quy định trong QĐND Việt Nam',
    ten_nhac: 'Ca ngợi Hồ Chủ Tịch',
    tac_gia: 'Nhạc: Lưu Hữu Phước\nLời: Lưu Hữu Phước - Nguyễn Đình Thi',
    ghi_chu: null,
    link: null,
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-04-08T08:00:00.000Z',
    tg_cap_nhat: '2025-04-08T08:00:00.000Z',
  },
  {
    id: '9',
    bo_suu_tap: '15 bài hát quy định trong QĐND Việt Nam',
    ten_nhac: 'Vì nhân dân quên mình',
    tac_gia: 'Nhạc và lời: Doãn Quang Khải',
    ghi_chu: null,
    link: null,
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-04-09T08:00:00.000Z',
    tg_cap_nhat: '2025-04-09T08:00:00.000Z',
  },
  {
    id: '10',
    bo_suu_tap: '15 bài hát quy định trong QĐND Việt Nam',
    ten_nhac: 'Tiến bước dưới quân kỳ',
    tac_gia: 'Nhạc và lời: Doãn Nho',
    ghi_chu: null,
    link: null,
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-04-10T08:00:00.000Z',
    tg_cap_nhat: '2025-04-10T08:00:00.000Z',
  },
  {
    id: '11',
    bo_suu_tap: '15 bài hát quy định trong QĐND Việt Nam',
    ten_nhac: 'Giải phóng Điện Biên',
    tac_gia: 'Nhạc và lời: Đỗ Nhuận',
    ghi_chu: null,
    link: null,
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-04-11T08:00:00.000Z',
    tg_cap_nhat: '2025-04-11T08:00:00.000Z',
  },
];

const repo = createRepository<KhoNhac>({
  tableName: 'kho_nhac',
  mockData: MOCK_SEED,
  select: '*',
  delay: 400,
});

function flattenRow(row: Record<string, unknown>): KhoNhac {
  return {
    id: String(row.id ?? ''),
    bo_suu_tap: (row.bo_suu_tap as string) ?? '',
    ten_nhac: (row.ten_nhac as string) ?? '',
    tac_gia: row.tac_gia != null && String(row.tac_gia).trim() !== '' ? String(row.tac_gia) : null,
    ghi_chu: row.ghi_chu != null && String(row.ghi_chu).trim() !== '' ? String(row.ghi_chu) : null,
    link: row.link != null && String(row.link).trim() !== '' ? String(row.link) : null,
    id_nguoi_tao:
      row.id_nguoi_tao != null && row.id_nguoi_tao !== '' ? String(row.id_nguoi_tao as string | number) : null,
    tg_tao: (row.tg_tao as string | null) ?? null,
    tg_cap_nhat: (row.tg_cap_nhat as string | null) ?? null,
  };
}

function toDbPayload(data: KhoNhacFormValues): Record<string, unknown> {
  return {
    bo_suu_tap: data.bo_suu_tap.trim(),
    ten_nhac: data.ten_nhac.trim(),
    tac_gia: data.tac_gia?.trim() ? data.tac_gia.trim() : null,
    ghi_chu: data.ghi_chu?.trim() ? data.ghi_chu.trim() : null,
    link: data.link?.trim() ? data.link.trim() : null,
    id_nguoi_tao: data.id_nguoi_tao?.trim() ? data.id_nguoi_tao.trim() : null,
  };
}

async function enrichTenNguoiTao(items: KhoNhac[]): Promise<KhoNhac[]> {
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

export const getKhoNhacList = async (): Promise<KhoNhac[]> => {
  const list = await repo.getAll(
    isSupabase() ? { orderBy: 'tg_cap_nhat', ascending: false } : { orderBy: 'tg_cap_nhat', ascending: false },
  );
  const rows = isSupabase()
    ? (list as unknown as Record<string, unknown>[]).map(flattenRow)
    : (list as KhoNhac[]);
  return enrichTenNguoiTao(rows);
};

export const getKhoNhacById = async (id: string): Promise<KhoNhac | undefined> => {
  const row = await repo.getById(id);
  if (!row) return undefined;
  const flat = isSupabase() ? flattenRow(row as unknown as Record<string, unknown>) : (row as KhoNhac);
  const [out] = await enrichTenNguoiTao([flat]);
  return out;
};

export const createKhoNhac = async (data: KhoNhacFormValues): Promise<KhoNhac> => {
  const payload = toDbPayload(data);
  if (isSupabase()) {
    const inserted = await repo.insert(payload as Omit<KhoNhac, 'id'> & { id?: string });
    const flat = flattenRow(inserted as unknown as Record<string, unknown>);
    const [out] = await enrichTenNguoiTao([flat]);
    return out!;
  }
  const inserted = await repo.insert({
    ...payload,
    tg_tao: new Date().toISOString(),
    tg_cap_nhat: new Date().toISOString(),
  } as Omit<KhoNhac, 'id'> & { id?: string });
  const [out] = await enrichTenNguoiTao([inserted as KhoNhac]);
  return out!;
};

export const updateKhoNhac = async (id: string, data: KhoNhacFormValues): Promise<KhoNhac> => {
  const existing = await repo.getById(id);
  if (!existing) throw new Error(i18n.t('khoNhac.dm.service.notFound'));
  const payload = toDbPayload(data);
  if (isSupabase()) {
    const updated = await repo.update(id, payload as Partial<KhoNhac>);
    const flat = flattenRow(updated as unknown as Record<string, unknown>);
    const [out] = await enrichTenNguoiTao([flat]);
    return out!;
  }
  const updated = await repo.update(id, {
    ...payload,
    tg_cap_nhat: new Date().toISOString(),
  } as Partial<KhoNhac>);
  const [out] = await enrichTenNguoiTao([updated as KhoNhac]);
  return out!;
};

export const deleteKhoNhacList = async (ids: string[]): Promise<void> => {
  await repo.remove(ids);
};
