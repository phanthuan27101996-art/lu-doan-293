import type { CongVan } from '../core/types';
import type { CongVanFormValues } from '../core/schema';
import { createRepository } from '@/lib/data/create-repository';
import { isSupabase } from '@/lib/data/config';
import { getSupabase } from '@/lib/supabase/client';
import i18n from '@/lib/i18n';
import { getEmployees } from '@/features/he-thong/nhan-vien/services/nhan-vien-service';

const STORAGE_BUCKET = 'cong-van';

const MOCK_SEED: CongVan[] = [
  {
    id: '1',
    don_vi: 'Phòng Tham mưu',
    ngay: '2025-03-15',
    ten_van_ban: 'Công văn triển khai nhiệm vụ quý II',
    ghi_chu: 'Gửi các đại đội',
    tep_dinh_kem: null,
    link: 'https://example.com/cv-001',
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-03-15T08:00:00.000Z',
    tg_cap_nhat: '2025-03-15T08:00:00.000Z',
  },
  {
    id: '2',
    don_vi: 'Ban CHQS',
    ngay: '2025-04-02',
    ten_van_ban: 'Báo cáo tình hình an ninh tháng 3',
    ghi_chu: null,
    tep_dinh_kem: null,
    link: null,
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-04-02T10:00:00.000Z',
    tg_cap_nhat: '2025-04-02T10:00:00.000Z',
  },
  {
    id: '3',
    don_vi: 'Phòng Tham mưu',
    ngay: '2025-04-10',
    ten_van_ban: 'Hướng dẫn soạn văn bản hành chính',
    ghi_chu: 'Bản nháp',
    tep_dinh_kem: null,
    link: null,
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-04-10T12:00:00.000Z',
    tg_cap_nhat: '2025-04-10T12:00:00.000Z',
  },
];

const repo = createRepository<CongVan>({
  tableName: 'cong_van',
  mockData: MOCK_SEED,
  select: '*',
  delay: 400,
});

function formatNgay(raw: unknown): string {
  if (raw == null || raw === '') return '';
  const s = typeof raw === 'string' ? raw : String(raw);
  return s.slice(0, 10);
}

function flattenRow(row: Record<string, unknown>): CongVan {
  return {
    id: String(row.id ?? ''),
    don_vi: (row.don_vi as string) ?? '',
    ngay: formatNgay(row.ngay),
    ten_van_ban: (row.ten_van_ban as string) ?? '',
    ghi_chu: row.ghi_chu != null && String(row.ghi_chu).trim() !== '' ? String(row.ghi_chu) : null,
    tep_dinh_kem:
      row.tep_dinh_kem != null && String(row.tep_dinh_kem).trim() !== '' ? String(row.tep_dinh_kem) : null,
    link: row.link != null && String(row.link).trim() !== '' ? String(row.link) : null,
    id_nguoi_tao:
      row.id_nguoi_tao != null && row.id_nguoi_tao !== '' ? String(row.id_nguoi_tao as string | number) : null,
    tg_tao: (row.tg_tao as string | null) ?? null,
    tg_cap_nhat: (row.tg_cap_nhat as string | null) ?? null,
  };
}

function toDbPayload(data: CongVanFormValues): Record<string, unknown> {
  return {
    don_vi: data.don_vi.trim(),
    ngay: data.ngay.trim(),
    ten_van_ban: data.ten_van_ban.trim(),
    ghi_chu: data.ghi_chu?.trim() ? data.ghi_chu.trim() : null,
    tep_dinh_kem: data.tep_dinh_kem?.trim() ? data.tep_dinh_kem.trim() : null,
    link: data.link?.trim() ? data.link.trim() : null,
    id_nguoi_tao: data.id_nguoi_tao?.trim() ? data.id_nguoi_tao.trim() : null,
  };
}

async function enrichTenNguoiTao(items: CongVan[]): Promise<CongVan[]> {
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

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error ?? new Error('FileReader'));
    r.readAsDataURL(file);
  });
}

/** Upload một file lên bucket `cong-van` (Supabase) hoặc data URL (mock). */
export async function uploadCongVanFile(file: File): Promise<string> {
  if (!isSupabase()) {
    return readFileAsDataUrl(file);
  }
  const supabase = getSupabase();
  if (!supabase) return readFileAsDataUrl(file);
  const safeName = file.name.replace(/[^\w.\-]/g, '_');
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${safeName}`;
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);
  return pub.publicUrl;
}

export const getCongVanList = async (): Promise<CongVan[]> => {
  const list = await repo.getAll(
    isSupabase() ? { orderBy: 'tg_cap_nhat', ascending: false } : { orderBy: 'tg_cap_nhat', ascending: false },
  );
  const rows = isSupabase()
    ? (list as unknown as Record<string, unknown>[]).map(flattenRow)
    : (list as CongVan[]);
  return enrichTenNguoiTao(rows);
};

export const getCongVanById = async (id: string): Promise<CongVan | undefined> => {
  const row = await repo.getById(id);
  if (!row) return undefined;
  const flat = isSupabase() ? flattenRow(row as unknown as Record<string, unknown>) : (row as CongVan);
  const [out] = await enrichTenNguoiTao([flat]);
  return out;
};

export const createCongVan = async (data: CongVanFormValues): Promise<CongVan> => {
  const payload = toDbPayload(data);
  if (isSupabase()) {
    const inserted = await repo.insert(payload as Omit<CongVan, 'id'> & { id?: string });
    const flat = flattenRow(inserted as unknown as Record<string, unknown>);
    const [out] = await enrichTenNguoiTao([flat]);
    return out!;
  }
  const inserted = await repo.insert({
    ...payload,
    tg_tao: new Date().toISOString(),
    tg_cap_nhat: new Date().toISOString(),
  } as Omit<CongVan, 'id'> & { id?: string });
  const [out] = await enrichTenNguoiTao([inserted as CongVan]);
  return out!;
};

export const updateCongVan = async (id: string, data: CongVanFormValues): Promise<CongVan> => {
  const existing = await repo.getById(id);
  if (!existing) throw new Error(i18n.t('congVan.dm.service.notFound'));
  const payload = toDbPayload(data);
  if (isSupabase()) {
    const updated = await repo.update(id, payload as Partial<CongVan>);
    const flat = flattenRow(updated as unknown as Record<string, unknown>);
    const [out] = await enrichTenNguoiTao([flat]);
    return out!;
  }
  const updated = await repo.update(id, {
    ...payload,
    tg_cap_nhat: new Date().toISOString(),
  } as Partial<CongVan>);
  const [out] = await enrichTenNguoiTao([updated as CongVan]);
  return out!;
};

export const deleteCongVanList = async (ids: string[]): Promise<void> => {
  await repo.remove(ids);
};
