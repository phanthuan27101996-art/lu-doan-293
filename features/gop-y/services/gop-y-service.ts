import type { ImageItem } from '@/components/ui/MultiImageInput';
import type { GopY, GopYTrangThai } from '../core/types';
import type { GopYFormValues } from '../core/schema';
import { createRepository } from '@/lib/data/create-repository';
import { isSupabase } from '@/lib/data/config';
import { getSupabase } from '@/lib/supabase/client';
import i18n from '@/lib/i18n';
import { getEmployees } from '@/features/he-thong/nhan-vien/services/nhan-vien-service';

const STORAGE_BUCKET = 'gop-y';

const MOCK_SEED: GopY[] = [
  {
    id: '1',
    ngay: '2025-05-26',
    tieu_de_gop_y: 'mục đoàn cơ sở',
    chi_tiet_gop_y: 'tài liệu còn ít',
    hinh_anh: [],
    trang_thai: 'da_tra_loi',
    tra_loi: 'cảm ơn bạn đã đóng góp tôi sẽ up tài liệu lên cho bạn bây giờ',
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-05-26T08:00:00.000Z',
    tg_cap_nhat: '2025-05-26T08:00:00.000Z',
  },
];

const repo = createRepository<GopY>({
  tableName: 'gop_y',
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

function normalizeTrangThai(v: unknown): GopYTrangThai {
  const s = String(v ?? '');
  return s === 'da_tra_loi' ? 'da_tra_loi' : 'chua_tra_loi';
}

function flattenRow(row: Record<string, unknown>): GopY {
  return {
    id: String(row.id ?? ''),
    ngay: typeof row.ngay === 'string' ? row.ngay.slice(0, 10) : String(row.ngay ?? '').slice(0, 10),
    tieu_de_gop_y: (row.tieu_de_gop_y as string) ?? '',
    chi_tiet_gop_y: (row.chi_tiet_gop_y as string) ?? '',
    hinh_anh: parseHinhAnh(row.hinh_anh),
    trang_thai: normalizeTrangThai(row.trang_thai),
    tra_loi: row.tra_loi != null && String(row.tra_loi).trim() !== '' ? String(row.tra_loi) : null,
    id_nguoi_tao:
      row.id_nguoi_tao != null && row.id_nguoi_tao !== '' ? String(row.id_nguoi_tao as string | number) : null,
    tg_tao: (row.tg_tao as string | null) ?? null,
    tg_cap_nhat: (row.tg_cap_nhat as string | null) ?? null,
  };
}

function toDbPayload(data: GopYFormValues, hinhAnhUrls: string[]): Record<string, unknown> {
  return {
    ngay: data.ngay,
    tieu_de_gop_y: data.tieu_de_gop_y.trim(),
    chi_tiet_gop_y: data.chi_tiet_gop_y.trim(),
    hinh_anh: hinhAnhUrls,
    id_nguoi_tao: data.id_nguoi_tao?.trim() ? data.id_nguoi_tao.trim() : null,
  };
}

async function enrichTenNguoiTao(items: GopY[]): Promise<GopY[]> {
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

export async function uploadGopYImageFiles(files: File[], folderId: string): Promise<string[]> {
  const supabase = getSupabase();
  if (!supabase || files.length === 0) return [];
  const prefix = (folderId || 'new').replace(/[^\w-]/g, '_');
  const urls: string[] = [];
  for (const file of files) {
    const safeName = file.name.replace(/[^\w.-]/g, '_');
    const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${safeName}`;
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

/**
 * Giữ thứ tự `items`: file mới → upload (Supabase) hoặc giữ data URL (mock);
 * URL http(s) hoặc đường dẫn tĩnh → giữ nguyên.
 */
export async function collectImageUrlsFromItems(items: ImageItem[], folderId: string): Promise<string[]> {
  const files = items.map((i) => i.file).filter((f): f is File => !!f);
  const uploaded =
    files.length > 0 && isSupabase() ? await uploadGopYImageFiles(files, folderId) : [];
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

export const getGopYList = async (): Promise<GopY[]> => {
  const list = await repo.getAll(
    isSupabase() ? { orderBy: 'tg_cap_nhat', ascending: false } : { orderBy: 'tg_cap_nhat', ascending: false },
  );
  const rows = isSupabase()
    ? (list as unknown as Record<string, unknown>[]).map(flattenRow)
    : (list as GopY[]);
  return enrichTenNguoiTao(rows);
};

export const getGopYById = async (id: string): Promise<GopY | undefined> => {
  const row = await repo.getById(id);
  if (!row) return undefined;
  const flat = isSupabase() ? flattenRow(row as unknown as Record<string, unknown>) : (row as GopY);
  const [out] = await enrichTenNguoiTao([flat]);
  return out;
};

export const createGopY = async (data: GopYFormValues, hinhAnhUrls: string[]): Promise<GopY> => {
  const base = toDbPayload(data, hinhAnhUrls);
  const payload = {
    ...base,
    trang_thai: 'chua_tra_loi' as const,
    tra_loi: null,
  };
  if (isSupabase()) {
    const inserted = await repo.insert(payload as Omit<GopY, 'id'> & { id?: string });
    const flat = flattenRow(inserted as unknown as Record<string, unknown>);
    const [out] = await enrichTenNguoiTao([flat]);
    return out!;
  }
  const inserted = await repo.insert({
    ...payload,
    tg_tao: new Date().toISOString(),
    tg_cap_nhat: new Date().toISOString(),
  } as Omit<GopY, 'id'> & { id?: string });
  const [out] = await enrichTenNguoiTao([inserted as GopY]);
  return out!;
};

export const updateGopY = async (id: string, data: GopYFormValues, hinhAnhUrls: string[]): Promise<GopY> => {
  const existing = await repo.getById(id);
  if (!existing) throw new Error(i18n.t('gopY.dm.service.notFound'));
  const flatEx = isSupabase() ? flattenRow(existing as unknown as Record<string, unknown>) : (existing as GopY);
  const payload = {
    ...toDbPayload(data, hinhAnhUrls),
    trang_thai: flatEx.trang_thai,
    tra_loi: flatEx.tra_loi,
  };
  if (isSupabase()) {
    const updated = await repo.update(id, payload as Partial<GopY>);
    const flat = flattenRow(updated as unknown as Record<string, unknown>);
    const [out] = await enrichTenNguoiTao([flat]);
    return out!;
  }
  const updated = await repo.update(id, {
    ...payload,
    tg_cap_nhat: new Date().toISOString(),
  } as Partial<GopY>);
  const [out] = await enrichTenNguoiTao([updated as GopY]);
  return out!;
};

export type GopYPatch = Partial<Pick<GopY, 'tra_loi' | 'trang_thai'>>;

export const patchGopY = async (id: string, patch: GopYPatch): Promise<GopY> => {
  const row = await getGopYById(id);
  if (!row) throw new Error(i18n.t('gopY.dm.service.notFound'));

  const trang_thai = (patch.trang_thai ?? row.trang_thai) as GopYTrangThai;
  const tra_loi = patch.tra_loi !== undefined ? patch.tra_loi : row.tra_loi;

  if (trang_thai === 'da_tra_loi' && (!tra_loi || !String(tra_loi).trim())) {
    throw new Error(i18n.t('gopY.dm.validation.traLoiRequiredWhenDaTraLoi'));
  }

  const nextPayload: Record<string, unknown> = {
    trang_thai,
    tra_loi: trang_thai === 'chua_tra_loi' ? null : tra_loi?.trim() ? String(tra_loi).trim() : null,
  };

  if (isSupabase()) {
    const updated = await repo.update(id, nextPayload as Partial<GopY>);
    const flat = flattenRow(updated as unknown as Record<string, unknown>);
    const [out] = await enrichTenNguoiTao([flat]);
    return out!;
  }
  const updated = await repo.update(id, {
    ...nextPayload,
    tg_cap_nhat: new Date().toISOString(),
  } as Partial<GopY>);
  const [out] = await enrichTenNguoiTao([updated as GopY]);
  return out!;
};

export const updateGopYReply = async (id: string, traLoi: string): Promise<GopY> => {
  const row = await getGopYById(id);
  if (!row) throw new Error(i18n.t('gopY.dm.service.notFound'));
  const trimmed = traLoi.trim();
  if (!trimmed) throw new Error(i18n.t('gopY.dm.validation.traLoiEmpty'));

  const trang_thai: GopYTrangThai =
    row.trang_thai === 'chua_tra_loi' ? 'da_tra_loi' : row.trang_thai;

  return patchGopY(id, { tra_loi: trimmed, trang_thai });
};

export const deleteGopYList = async (ids: string[]): Promise<void> => {
  await repo.remove(ids);
};
