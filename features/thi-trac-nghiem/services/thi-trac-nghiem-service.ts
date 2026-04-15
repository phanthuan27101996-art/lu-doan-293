import type { ThiTracNghiem } from '../core/types';
import type { ThiTracNghiemFormValues } from '../core/schema';
import { createRepository } from '@/lib/data/create-repository';
import { isSupabase } from '@/lib/data/config';
import i18n from '@/lib/i18n';
import { getEmployees } from '@/features/he-thong/nhan-vien/services/nhan-vien-service';

const MOCK_SEED: ThiTracNghiem[] = [
  {
    id: '1',
    nhom: 'CHIẾN SĨ MỚI',
    ten_de_thi: 'KIỂM TRA NHẬN THỨC SAU MỘT THÁNG HUẤN  LUYỆN',
    link: 'https://myaloha.vn/cuoc-thi/kiem-tra-nhan-thuc-chinh-tri-chien-si-moi-nam-2025-100244',
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-04-01T08:00:00.000Z',
    tg_cap_nhat: '2025-04-01T08:00:00.000Z',
  },
  {
    id: '2',
    nhom: 'CÁN BỘ, ĐOÀN VIÊN',
    ten_de_thi:
      '“Tự hào Việt Nam” kỷ niệm 50 năm Ngày Giải phóng miền Nam, thống nhất đất nước; 80 năm Cách mạng tháng Tám thành công và Quốc khánh nước Cộng hòa xã hội chủ nghĩa Việt Nam',
    link: 'https://thitructuyen.baocaovien.vn/lam-bai-kiem-tra/cuoc-thi-truc-tuyen-tu-hao-viet-nam',
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-04-05T10:00:00.000Z',
    tg_cap_nhat: '2025-04-05T10:00:00.000Z',
  },
];

const repo = createRepository<ThiTracNghiem>({
  tableName: 'thi_trac_nghiem',
  mockData: MOCK_SEED,
  select: '*',
  delay: 400,
});

function flattenRow(row: Record<string, unknown>): ThiTracNghiem {
  return {
    id: String(row.id ?? ''),
    nhom: (row.nhom as string) ?? '',
    ten_de_thi: (row.ten_de_thi as string) ?? '',
    link: row.link != null && String(row.link).trim() !== '' ? String(row.link) : null,
    id_nguoi_tao:
      row.id_nguoi_tao != null && row.id_nguoi_tao !== '' ? String(row.id_nguoi_tao as string | number) : null,
    tg_tao: (row.tg_tao as string | null) ?? null,
    tg_cap_nhat: (row.tg_cap_nhat as string | null) ?? null,
  };
}

function toDbPayload(data: ThiTracNghiemFormValues): Record<string, unknown> {
  return {
    nhom: data.nhom.trim(),
    ten_de_thi: data.ten_de_thi.trim(),
    link: data.link?.trim() ? data.link.trim() : null,
    id_nguoi_tao: data.id_nguoi_tao?.trim() ? data.id_nguoi_tao.trim() : null,
  };
}

async function enrichTenNguoiTao(items: ThiTracNghiem[]): Promise<ThiTracNghiem[]> {
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

export const getThiTracNghiemList = async (): Promise<ThiTracNghiem[]> => {
  const list = await repo.getAll(
    isSupabase() ? { orderBy: 'tg_cap_nhat', ascending: false } : { orderBy: 'tg_cap_nhat', ascending: false },
  );
  const rows = isSupabase()
    ? (list as unknown as Record<string, unknown>[]).map(flattenRow)
    : (list as ThiTracNghiem[]);
  return enrichTenNguoiTao(rows);
};

export const getThiTracNghiemById = async (id: string): Promise<ThiTracNghiem | undefined> => {
  const row = await repo.getById(id);
  if (!row) return undefined;
  const flat = isSupabase() ? flattenRow(row as unknown as Record<string, unknown>) : (row as ThiTracNghiem);
  const [out] = await enrichTenNguoiTao([flat]);
  return out;
};

export const createThiTracNghiem = async (data: ThiTracNghiemFormValues): Promise<ThiTracNghiem> => {
  const payload = toDbPayload(data);
  if (isSupabase()) {
    const inserted = await repo.insert(payload as Omit<ThiTracNghiem, 'id'> & { id?: string });
    const flat = flattenRow(inserted as unknown as Record<string, unknown>);
    const [out] = await enrichTenNguoiTao([flat]);
    return out!;
  }
  const inserted = await repo.insert({
    ...payload,
    tg_tao: new Date().toISOString(),
    tg_cap_nhat: new Date().toISOString(),
  } as Omit<ThiTracNghiem, 'id'> & { id?: string });
  const [out] = await enrichTenNguoiTao([inserted as ThiTracNghiem]);
  return out!;
};

export const updateThiTracNghiem = async (id: string, data: ThiTracNghiemFormValues): Promise<ThiTracNghiem> => {
  const existing = await repo.getById(id);
  if (!existing) throw new Error(i18n.t('thiTracNghiem.dm.service.notFound'));
  const payload = toDbPayload(data);
  if (isSupabase()) {
    const updated = await repo.update(id, payload as Partial<ThiTracNghiem>);
    const flat = flattenRow(updated as unknown as Record<string, unknown>);
    const [out] = await enrichTenNguoiTao([flat]);
    return out!;
  }
  const updated = await repo.update(id, {
    ...payload,
    tg_cap_nhat: new Date().toISOString(),
  } as Partial<ThiTracNghiem>);
  const [out] = await enrichTenNguoiTao([updated as ThiTracNghiem]);
  return out!;
};

export const deleteThiTracNghiemList = async (ids: string[]): Promise<void> => {
  await repo.remove(ids);
};
