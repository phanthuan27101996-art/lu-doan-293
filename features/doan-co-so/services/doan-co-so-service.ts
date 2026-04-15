import type { ImageItem } from '@/components/ui/MultiImageInput';
import type { DoanCoSo } from '../core/types';
import type { DoanCoSoFormValues } from '../core/schema';
import { createRepository } from '@/lib/data/create-repository';
import { isSupabase } from '@/lib/data/config';
import { getSupabase } from '@/lib/supabase/client';
import i18n from '@/lib/i18n';
import { getEmployees } from '@/features/he-thong/nhan-vien/services/nhan-vien-service';

const STORAGE_BUCKET = 'doan-co-so';

const MOCK_SEED: DoanCoSo[] = [
  {
    id: '1',
    ngay: '2025-05-03',
    nhom: 'Tài liệu đoàn',
    ten: 'hshshs',
    ghi_chu: 'hshshs',
    link: null,
    hinh_anh: [],
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-05-03T08:00:00.000Z',
    tg_cap_nhat: '2025-05-03T08:00:00.000Z',
  },
  {
    id: '2',
    ngay: '2025-05-05',
    nhom: 'Hoạt động đoàn',
    ten: 'LIÊN CHI ĐOÀN TIỂU ĐOÀN 32',
    ghi_chu: 'Phát động thi đua đột kích chào mừng đại hội đại biểu đảng bộ Lữ đoàn nhiệm kỳ 2025-2030',
    link: null,
    hinh_anh: [],
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-05-05T10:00:00.000Z',
    tg_cap_nhat: '2025-05-05T10:00:00.000Z',
  },
];

const repo = createRepository<DoanCoSo>({
  tableName: 'doan_co_so',
  mockData: MOCK_SEED,
  select: '*',
  delay: 400,
});

function parseHinhAnh(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((x) => String(x)).filter(Boolean);
  }
  if (raw && typeof raw === 'string') {
    try {
      const p = JSON.parse(raw) as unknown;
      return Array.isArray(p) ? p.map((x) => String(x)).filter(Boolean) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function flattenRow(row: Record<string, unknown>): DoanCoSo {
  return {
    id: String(row.id ?? ''),
    ngay: typeof row.ngay === 'string' ? row.ngay : String(row.ngay ?? ''),
    nhom: (row.nhom as string) ?? '',
    ten: (row.ten as string) ?? '',
    ghi_chu: row.ghi_chu != null && String(row.ghi_chu).trim() !== '' ? String(row.ghi_chu) : null,
    link: row.link != null && String(row.link).trim() !== '' ? String(row.link) : null,
    hinh_anh: parseHinhAnh(row.hinh_anh),
    id_nguoi_tao:
      row.id_nguoi_tao != null && row.id_nguoi_tao !== '' ? String(row.id_nguoi_tao as string | number) : null,
    tg_tao: (row.tg_tao as string | null) ?? null,
    tg_cap_nhat: (row.tg_cap_nhat as string | null) ?? null,
  };
}

function toDbPayload(data: DoanCoSoFormValues, hinhAnhUrls: string[]): Record<string, unknown> {
  return {
    ngay: data.ngay,
    nhom: data.nhom.trim(),
    ten: data.ten.trim(),
    ghi_chu: data.ghi_chu?.trim() ? data.ghi_chu.trim() : null,
    link: data.link?.trim() ? data.link.trim() : null,
    hinh_anh: hinhAnhUrls,
    id_nguoi_tao: data.id_nguoi_tao?.trim() ? data.id_nguoi_tao.trim() : null,
  };
}

async function enrichTenNguoiTao(items: DoanCoSo[]): Promise<DoanCoSo[]> {
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

export async function collectImageUrlsFromItems(items: ImageItem[]): Promise<string[]> {
  const files = items.map((i) => i.file).filter((f): f is File => !!f);
  const uploaded =
    files.length > 0 && isSupabase() ? await uploadDoanCoSoImageFiles(files) : [];
  let ui = 0;
  const out: string[] = [];
  for (const it of items) {
    if (it.file) {
      if (isSupabase()) {
        const url = uploaded[ui++];
        if (url) out.push(url);
      } else {
        out.push(it.src);
      }
    } else if (/^https?:\/\//i.test(it.src) || it.src.startsWith('/')) {
      out.push(it.src);
    } else if (!isSupabase() && it.src.startsWith('data:')) {
      out.push(it.src);
    }
  }
  return out;
}

export async function uploadDoanCoSoImageFiles(files: File[]): Promise<string[]> {
  const supabase = getSupabase();
  if (!supabase || files.length === 0) return [];
  const urls: string[] = [];
  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const path = `images/${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${safeName}`;
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw error;
    const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);
    urls.push(pub.publicUrl);
  }
  return urls;
}

export const getDoanCoSoList = async (): Promise<DoanCoSo[]> => {
  const list = await repo.getAll(
    isSupabase() ? { orderBy: 'ngay', ascending: false } : { orderBy: 'ngay', ascending: false },
  );
  const rows = isSupabase()
    ? (list as unknown as Record<string, unknown>[]).map(flattenRow)
    : (list as DoanCoSo[]);
  return enrichTenNguoiTao(rows);
};

export const getDoanCoSoById = async (id: string): Promise<DoanCoSo | undefined> => {
  const row = await repo.getById(id);
  if (!row) return undefined;
  const flat = isSupabase() ? flattenRow(row as unknown as Record<string, unknown>) : (row as DoanCoSo);
  const [out] = await enrichTenNguoiTao([flat]);
  return out;
};

export const createDoanCoSo = async (data: DoanCoSoFormValues, hinhAnhUrls: string[]): Promise<DoanCoSo> => {
  const payload = toDbPayload(data, hinhAnhUrls);
  if (isSupabase()) {
    const inserted = await repo.insert(payload as Omit<DoanCoSo, 'id'> & { id?: string });
    const flat = flattenRow(inserted as unknown as Record<string, unknown>);
    const [out] = await enrichTenNguoiTao([flat]);
    return out!;
  }
  const inserted = await repo.insert({
    ...payload,
    tg_tao: new Date().toISOString(),
    tg_cap_nhat: new Date().toISOString(),
  } as Omit<DoanCoSo, 'id'> & { id?: string });
  const [out] = await enrichTenNguoiTao([inserted as DoanCoSo]);
  return out!;
};

export const updateDoanCoSo = async (
  id: string,
  data: DoanCoSoFormValues,
  hinhAnhUrls: string[],
): Promise<DoanCoSo> => {
  const existing = await repo.getById(id);
  if (!existing) throw new Error(i18n.t('doanCoSo.dm.service.notFound'));
  const payload = toDbPayload(data, hinhAnhUrls);
  if (isSupabase()) {
    const updated = await repo.update(id, payload as Partial<DoanCoSo>);
    const flat = flattenRow(updated as unknown as Record<string, unknown>);
    const [out] = await enrichTenNguoiTao([flat]);
    return out!;
  }
  const updated = await repo.update(id, {
    ...payload,
    tg_cap_nhat: new Date().toISOString(),
  } as Partial<DoanCoSo>);
  const [out] = await enrichTenNguoiTao([updated as DoanCoSo]);
  return out!;
};

export const deleteDoanCoSoList = async (ids: string[]): Promise<void> => {
  await repo.remove(ids);
};
