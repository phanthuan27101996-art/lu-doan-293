import type { MoiNgayMotLoiDayBacHo } from '../core/types';
import type { MoiNgayMotLoiDayBacHoFormValues } from '../core/schema';
import { createRepository } from '@/lib/data/create-repository';
import { isSupabase } from '@/lib/data/config';
import { getSupabase } from '@/lib/supabase/client';
import i18n from '@/lib/i18n';
import { getEmployees } from '@/features/he-thong/nhan-vien/services/nhan-vien-service';

const STORAGE_BUCKET = 'moi-ngay-mot-loi-day-bac-ho';

const MOCK_SEED: MoiNgayMotLoiDayBacHo[] = [
  {
    id: '1',
    ngay: '2025-04-01',
    ten_tai_lieu: '“Trí tuệ và sáng kiến của quần chúng là vô cùng tận”.',
    hinh_anh: null,
    tep_dinh_kem: null,
    link: null,
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-04-01T08:00:00.000Z',
    tg_cap_nhat: '2025-04-01T08:00:00.000Z',
  },
  {
    id: '2',
    ngay: '2025-05-01',
    ten_tai_lieu:
      '"Thi đua là yêu nước, yêu nước thì phải thi đua. Và những người thi đua là những người yêu nước nhất"',
    hinh_anh: null,
    tep_dinh_kem: null,
    link: null,
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-05-01T08:00:00.000Z',
    tg_cap_nhat: '2025-05-01T08:00:00.000Z',
  },
];

const repo = createRepository<MoiNgayMotLoiDayBacHo>({
  tableName: 'moi_ngay_mot_loi_day_bac_ho',
  mockData: MOCK_SEED,
  select: '*',
  delay: 400,
});

function formatNgay(raw: unknown): string {
  if (raw == null || raw === '') return '';
  const s = typeof raw === 'string' ? raw : String(raw);
  return s.slice(0, 10);
}

function sortByNgayDesc(a: MoiNgayMotLoiDayBacHo, b: MoiNgayMotLoiDayBacHo): number {
  return b.ngay.localeCompare(a.ngay);
}

function flattenRow(row: Record<string, unknown>): MoiNgayMotLoiDayBacHo {
  return {
    id: String(row.id ?? ''),
    ngay: formatNgay(row.ngay),
    ten_tai_lieu: (row.ten_tai_lieu as string) ?? '',
    hinh_anh:
      row.hinh_anh != null && String(row.hinh_anh).trim() !== '' ? String(row.hinh_anh) : null,
    tep_dinh_kem:
      row.tep_dinh_kem != null && String(row.tep_dinh_kem).trim() !== ''
        ? String(row.tep_dinh_kem)
        : null,
    link: row.link != null && String(row.link).trim() !== '' ? String(row.link) : null,
    id_nguoi_tao:
      row.id_nguoi_tao != null && row.id_nguoi_tao !== ''
        ? String(row.id_nguoi_tao as string | number)
        : null,
    tg_tao: (row.tg_tao as string | null) ?? null,
    tg_cap_nhat: (row.tg_cap_nhat as string | null) ?? null,
  };
}

function toDbPayload(data: MoiNgayMotLoiDayBacHoFormValues): Record<string, unknown> {
  return {
    ngay: data.ngay.trim(),
    ten_tai_lieu: data.ten_tai_lieu.trim(),
    hinh_anh: data.hinh_anh?.trim() ? data.hinh_anh.trim() : null,
    tep_dinh_kem: data.tep_dinh_kem?.trim() ? data.tep_dinh_kem.trim() : null,
    link: data.link?.trim() ? data.link.trim() : null,
    id_nguoi_tao: data.id_nguoi_tao?.trim() ? data.id_nguoi_tao.trim() : null,
  };
}

async function enrichTenNguoiTao(items: MoiNgayMotLoiDayBacHo[]): Promise<MoiNgayMotLoiDayBacHo[]> {
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

async function uploadToFolder(file: File, folder: 'images' | 'files'): Promise<string> {
  if (!isSupabase()) {
    return readFileAsDataUrl(file);
  }
  const supabase = getSupabase();
  if (!supabase) return readFileAsDataUrl(file);
  const safeName = file.name.replace(/[^\w.-]/g, '_');
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${safeName}`;
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);
  return pub.publicUrl;
}

export async function uploadMoiNgayMotLoiDayBacHoImage(file: File): Promise<string> {
  return uploadToFolder(file, 'images');
}

export async function resolveHinhAnhForSave(hinhAnh: string): Promise<string> {
  const s = hinhAnh.trim();
  if (!s) return '';
  if (!s.startsWith('data:')) return s;
  if (!isSupabase() || !getSupabase()) return s;
  const res = await fetch(s);
  const blob = await res.blob();
  const ext = blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg';
  const file = new File([blob], `hinh-anh.${ext}`, { type: blob.type || 'image/jpeg' });
  return uploadMoiNgayMotLoiDayBacHoImage(file);
}

export async function uploadMoiNgayMotLoiDayBacHoAttachment(file: File): Promise<string> {
  return uploadToFolder(file, 'files');
}

export const getMoiNgayMotLoiDayBacHoList = async (): Promise<MoiNgayMotLoiDayBacHo[]> => {
  const list = await repo.getAll({});
  const rows = isSupabase()
    ? (list as unknown as Record<string, unknown>[]).map(flattenRow)
    : (list as MoiNgayMotLoiDayBacHo[]);
  rows.sort(sortByNgayDesc);
  return enrichTenNguoiTao(rows);
};

export const getMoiNgayMotLoiDayBacHoById = async (id: string): Promise<MoiNgayMotLoiDayBacHo | undefined> => {
  const row = await repo.getById(id);
  if (!row) return undefined;
  const flat = isSupabase()
    ? flattenRow(row as unknown as Record<string, unknown>)
    : (row as MoiNgayMotLoiDayBacHo);
  const [out] = await enrichTenNguoiTao([flat]);
  return out;
};

export const createMoiNgayMotLoiDayBacHo = async (data: MoiNgayMotLoiDayBacHoFormValues): Promise<MoiNgayMotLoiDayBacHo> => {
  const payload = toDbPayload(data);
  if (isSupabase()) {
    const inserted = await repo.insert(payload as Omit<MoiNgayMotLoiDayBacHo, 'id'> & { id?: string });
    const flat = flattenRow(inserted as unknown as Record<string, unknown>);
    const [out] = await enrichTenNguoiTao([flat]);
    return out!;
  }
  const inserted = await repo.insert({
    ...payload,
    tg_tao: new Date().toISOString(),
    tg_cap_nhat: new Date().toISOString(),
  } as Omit<MoiNgayMotLoiDayBacHo, 'id'> & { id?: string });
  const [out] = await enrichTenNguoiTao([inserted as MoiNgayMotLoiDayBacHo]);
  return out!;
};

export const updateMoiNgayMotLoiDayBacHo = async (
  id: string,
  data: MoiNgayMotLoiDayBacHoFormValues,
): Promise<MoiNgayMotLoiDayBacHo> => {
  const existing = await repo.getById(id);
  if (!existing) throw new Error(i18n.t('moiNgayMotLoiDayBacHo.dm.service.notFound'));
  const payload = toDbPayload(data);
  if (isSupabase()) {
    const updated = await repo.update(id, payload as Partial<MoiNgayMotLoiDayBacHo>);
    const flat = flattenRow(updated as unknown as Record<string, unknown>);
    const [out] = await enrichTenNguoiTao([flat]);
    return out!;
  }
  const updated = await repo.update(id, {
    ...payload,
    tg_cap_nhat: new Date().toISOString(),
  } as Partial<MoiNgayMotLoiDayBacHo>);
  const [out] = await enrichTenNguoiTao([updated as MoiNgayMotLoiDayBacHo]);
  return out!;
};

export const deleteMoiNgayMotLoiDayBacHoList = async (ids: string[]): Promise<void> => {
  await repo.remove(ids);
};
