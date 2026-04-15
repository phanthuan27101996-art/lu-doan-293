import type { MoiTuanMotDieuLuat } from '../core/types';
import type { MoiTuanMotDieuLuatFormValues } from '../core/schema';
import { createRepository } from '@/lib/data/create-repository';
import { isSupabase } from '@/lib/data/config';
import { getSupabase } from '@/lib/supabase/client';
import i18n from '@/lib/i18n';
import { getEmployees } from '@/features/he-thong/nhan-vien/services/nhan-vien-service';

const STORAGE_BUCKET = 'moi-tuan-mot-dieu-luat';

const MOCK_SEED: MoiTuanMotDieuLuat[] = [
  {
    id: '1',
    nam: 2025,
    thang: 1,
    tuan: 1,
    nam_thang: '2025/01',
    nam_thang_tuan: '2025/01 T1',
    ten_dieu_luat:
      'Điều 6. Xử phạt, trừ điểm giấy phép lái xe của người điều khiển xe ô tô vi phạm quy tắc giao thông đường bộ',
    hinh_anh: null,
    ghi_chu: 'Nghị định 168/2024/NĐ-CP',
    tep_dinh_kem: null,
    link: null,
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-01-01T08:00:00.000Z',
    tg_cap_nhat: '2025-01-01T08:00:00.000Z',
  },
  {
    id: '2',
    nam: 2025,
    thang: 1,
    tuan: 2,
    nam_thang: '2025/01',
    nam_thang_tuan: '2025/01 T2',
    ten_dieu_luat:
      'Điều 7. Xử phạt, trừ điểm giấy phép lái của người điều khiển xe mô tô, xe gắn máy vi phạm quy tắc giao thông đường bộ',
    hinh_anh: null,
    ghi_chu: 'Nghị định 168/2024/NĐ-CP',
    tep_dinh_kem: null,
    link: null,
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-01-08T08:00:00.000Z',
    tg_cap_nhat: '2025-01-08T08:00:00.000Z',
  },
];

const repo = createRepository<MoiTuanMotDieuLuat>({
  tableName: 'moi_tuan_mot_dieu_luat',
  mockData: MOCK_SEED,
  select: '*',
  delay: 400,
});

function toInt(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === 'string' && v.trim() !== '') {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function sortByCalendarDesc(a: MoiTuanMotDieuLuat, b: MoiTuanMotDieuLuat): number {
  if (a.nam !== b.nam) return b.nam - a.nam;
  if (a.thang !== b.thang) return b.thang - a.thang;
  return b.tuan - a.tuan;
}

function flattenRow(row: Record<string, unknown>): MoiTuanMotDieuLuat {
  return {
    id: String(row.id ?? ''),
    nam: toInt(row.nam),
    thang: toInt(row.thang),
    tuan: toInt(row.tuan),
    nam_thang: (row.nam_thang as string) ?? '',
    nam_thang_tuan: (row.nam_thang_tuan as string) ?? '',
    ten_dieu_luat: (row.ten_dieu_luat as string) ?? '',
    hinh_anh:
      row.hinh_anh != null && String(row.hinh_anh).trim() !== '' ? String(row.hinh_anh) : null,
    ghi_chu: row.ghi_chu != null && String(row.ghi_chu).trim() !== '' ? String(row.ghi_chu) : null,
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

function toDbPayload(data: MoiTuanMotDieuLuatFormValues): Record<string, unknown> {
  return {
    nam: data.nam,
    thang: data.thang,
    tuan: data.tuan,
    ten_dieu_luat: data.ten_dieu_luat.trim(),
    ghi_chu: data.ghi_chu?.trim() ? data.ghi_chu.trim() : null,
    hinh_anh: data.hinh_anh?.trim() ? data.hinh_anh.trim() : null,
    tep_dinh_kem: data.tep_dinh_kem?.trim() ? data.tep_dinh_kem.trim() : null,
    link: data.link?.trim() ? data.link.trim() : null,
    id_nguoi_tao: data.id_nguoi_tao?.trim() ? data.id_nguoi_tao.trim() : null,
  };
}

async function enrichTenNguoiTao(items: MoiTuanMotDieuLuat[]): Promise<MoiTuanMotDieuLuat[]> {
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

/** Ảnh minh hoạ điều luật — thư mục `images/` trong bucket */
export async function uploadMoiTuanMotDieuLuatImage(file: File): Promise<string> {
  return uploadToFolder(file, 'images');
}

/**
 * Chuẩn bị URL lưu DB sau form (SingleImageInput): data URL → upload khi Supabase;
 * đã là http(s) thì giữ; mock / không cấu hình Supabase thì giữ data URL.
 */
export async function resolveHinhAnhForSave(hinhAnh: string): Promise<string> {
  const s = hinhAnh.trim();
  if (!s) return '';
  if (!s.startsWith('data:')) return s;
  if (!isSupabase() || !getSupabase()) return s;
  const res = await fetch(s);
  const blob = await res.blob();
  const ext = blob.type.includes('png')
    ? 'png'
    : blob.type.includes('webp')
      ? 'webp'
      : 'jpg';
  const file = new File([blob], `hinh-anh.${ext}`, { type: blob.type || 'image/jpeg' });
  return uploadMoiTuanMotDieuLuatImage(file);
}

/** File đính kèm (.docx, …) — thư mục `files/` */
export async function uploadMoiTuanMotDieuLuatAttachment(file: File): Promise<string> {
  return uploadToFolder(file, 'files');
}

export const getMoiTuanMotDieuLuatList = async (): Promise<MoiTuanMotDieuLuat[]> => {
  const list = await repo.getAll(isSupabase() ? {} : {});
  const rows = isSupabase()
    ? (list as unknown as Record<string, unknown>[]).map(flattenRow)
    : (list as MoiTuanMotDieuLuat[]);
  rows.sort(sortByCalendarDesc);
  return enrichTenNguoiTao(rows);
};

export const getMoiTuanMotDieuLuatById = async (id: string): Promise<MoiTuanMotDieuLuat | undefined> => {
  const row = await repo.getById(id);
  if (!row) return undefined;
  const flat = isSupabase()
    ? flattenRow(row as unknown as Record<string, unknown>)
    : (row as MoiTuanMotDieuLuat);
  const [out] = await enrichTenNguoiTao([flat]);
  return out;
};

export const createMoiTuanMotDieuLuat = async (data: MoiTuanMotDieuLuatFormValues): Promise<MoiTuanMotDieuLuat> => {
  const payload = toDbPayload(data);
  if (isSupabase()) {
    const inserted = await repo.insert(payload as Omit<MoiTuanMotDieuLuat, 'id'> & { id?: string });
    const flat = flattenRow(inserted as unknown as Record<string, unknown>);
    const [out] = await enrichTenNguoiTao([flat]);
    return out!;
  }
  const inserted = await repo.insert({
    ...payload,
    nam_thang: `${payload.nam}/${String(payload.thang).padStart(2, '0')}`,
    nam_thang_tuan: `${payload.nam}/${String(payload.thang).padStart(2, '0')} T${payload.tuan}`,
    tg_tao: new Date().toISOString(),
    tg_cap_nhat: new Date().toISOString(),
  } as Omit<MoiTuanMotDieuLuat, 'id'> & { id?: string });
  const [out] = await enrichTenNguoiTao([inserted as MoiTuanMotDieuLuat]);
  return out!;
};

export const updateMoiTuanMotDieuLuat = async (
  id: string,
  data: MoiTuanMotDieuLuatFormValues,
): Promise<MoiTuanMotDieuLuat> => {
  const existing = await repo.getById(id);
  if (!existing) throw new Error(i18n.t('moiTuanMotDieuLuat.dm.service.notFound'));
  const payload = toDbPayload(data);
  if (isSupabase()) {
    const updated = await repo.update(id, payload as Partial<MoiTuanMotDieuLuat>);
    const flat = flattenRow(updated as unknown as Record<string, unknown>);
    const [out] = await enrichTenNguoiTao([flat]);
    return out!;
  }
  const updated = await repo.update(id, {
    ...payload,
    nam_thang: `${payload.nam}/${String(payload.thang).padStart(2, '0')}`,
    nam_thang_tuan: `${payload.nam}/${String(payload.thang).padStart(2, '0')} T${payload.tuan}`,
    tg_cap_nhat: new Date().toISOString(),
  } as Partial<MoiTuanMotDieuLuat>);
  const [out] = await enrichTenNguoiTao([updated as MoiTuanMotDieuLuat]);
  return out!;
};

export const deleteMoiTuanMotDieuLuatList = async (ids: string[]): Promise<void> => {
  await repo.remove(ids);
};
