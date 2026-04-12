import type { ImageItem } from '@/components/ui/MultiImageInput';
import type { TrangTin } from '../core/types';
import type { TrangTinFormValues } from '../core/schema';
import { createRepository } from '@/lib/data/create-repository';
import { isSupabase } from '@/lib/data/config';
import { getSupabase } from '@/lib/supabase/client';
import i18n from '@/lib/i18n';
import { getEmployees } from '@/features/he-thong/nhan-vien/services/nhan-vien-service';

const STORAGE_BUCKET = 'trang-tin';

const MOCK_SEED: TrangTin[] = [
  {
    id: '1',
    ngay_dang: '2025-06-02',
    tieu_de:
      'Binh chủng Công binh tổ chức Hội thi “Đơn vị nuôi quân giỏi, quản lý quân nhu tốt” năm 2025',
    mo_ta_ngan:
      'Sáng 2-6, tại Lữ đoàn Công binh 229, Binh chủng Công binh đã khai mạc Hội thi “Đơn vị nuôi quân giỏi, quản lý quân nhu tốt”, kiểm tra thực hiện chính quy công tác hậu cần, kỹ thuật và an toàn vệ sinh lao động, phòng, chống cháy nổ năm 2025.',
    hinh_anh: ['Trang tin_Images/954bf928.Hình ảnh.135603.jpg'],
    link: null,
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-06-02T00:00:00.000Z',
    tg_cap_nhat: '2025-06-02T00:00:00.000Z',
  },
  {
    id: '2',
    ngay_dang: '2025-06-09',
    tieu_de: 'Hội thi “Đơn vị nuôi quân giỏi, quản lý quân nhu tốt” tại Lữ đoàn 293',
    mo_ta_ngan: 'Hội thi',
    hinh_anh: ['Trang tin_Images/1.Hình ảnh.125825.jpg'],
    link:
      'https://baokhanhhoa.vn/xa-hoi/202506/hoi-thi-don-vi-nuoi-quan-gioi-quan-ly-quan-nhu-tot-tai-lu-doan-293-0fd40ce/?zarsrc=30&utm_source=zalo&utm_medium=zalo&utm_campaign=zalo&gidzl=WOXAQ49avqM7aarlHNFYHO2UG6fOVxv7dvuLRL5rwqJ2bH8wLY_e4v7EH6fV9hv4cfj1FMJss9iTHMRZHW',
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-06-09T00:00:00.000Z',
    tg_cap_nhat: '2025-06-09T00:00:00.000Z',
  },
  {
    id: '3',
    ngay_dang: '2025-06-25',
    tieu_de: 'Lữ đoàn Công binh 293: Đẩy mạnh phong trào tăng gia sản xuất',
    mo_ta_ngan: 'Kết quả Công tác tăng gia của Lữ đoàn 293 thời gian qua',
    hinh_anh: ['Trang tin_Images/ba867efd.Hình ảnh.155825.jpg'],
    link:
      'https://baokhanhhoa.vn/xa-hoi/202506/lu-doan-cong-binh-293day-manh-phong-traotang-gia-san-xuat-70326e6/',
    id_nguoi_tao: null,
    ten_nguoi_tao: undefined,
    tg_tao: '2025-06-25T00:00:00.000Z',
    tg_cap_nhat: '2025-06-25T00:00:00.000Z',
  },
];

const repo = createRepository<TrangTin>({
  tableName: 'trang_tin',
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

function flattenRow(row: Record<string, unknown>): TrangTin {
  return {
    id: String(row.id ?? ''),
    ngay_dang: typeof row.ngay_dang === 'string' ? row.ngay_dang : String(row.ngay_dang ?? ''),
    tieu_de: (row.tieu_de as string) ?? '',
    mo_ta_ngan: (row.mo_ta_ngan as string) ?? '',
    hinh_anh: parseHinhAnh(row.hinh_anh),
    link: (() => {
      const raw = row.link ?? row.link_ngoai;
      return raw != null && String(raw).trim() !== '' ? String(raw) : null;
    })(),
    id_nguoi_tao:
      row.id_nguoi_tao != null && row.id_nguoi_tao !== '' ? String(row.id_nguoi_tao as string | number) : null,
    tg_tao: (row.tg_tao as string | null) ?? null,
    tg_cap_nhat: (row.tg_cap_nhat as string | null) ?? null,
  };
}

function toDbPayload(
  data: TrangTinFormValues,
  hinhAnhUrls: string[],
): Record<string, unknown> {
  return {
    ngay_dang: data.ngay_dang,
    tieu_de: data.tieu_de.trim(),
    mo_ta_ngan: data.mo_ta_ngan.trim(),
    hinh_anh: hinhAnhUrls,
    link: data.link?.trim() ? data.link.trim() : null,
    id_nguoi_tao: data.id_nguoi_tao?.trim() ? data.id_nguoi_tao.trim() : null,
  };
}

async function enrichTenNguoiTao(items: TrangTin[]): Promise<TrangTin[]> {
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

/**
 * Theo thứ tự `items`: file mới → upload (Supabase) hoặc giữ data URL (mock);
 * URL http(s) hoặc đường dẫn tĩnh → giữ nguyên.
 */
export async function collectImageUrlsFromItems(items: ImageItem[]): Promise<string[]> {
  const files = items.map((i) => i.file).filter((f): f is File => !!f);
  const uploaded =
    files.length > 0 && isSupabase() ? await uploadTrangTinImageFiles(files) : [];
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

export async function uploadTrangTinImageFiles(files: File[]): Promise<string[]> {
  const supabase = getSupabase();
  if (!supabase || files.length === 0) return [];
  const urls: string[] = [];
  for (const file of files) {
    const safeName = file.name.replace(/[^\w.\-]/g, '_');
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${safeName}`;
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

export const getTrangTinList = async (): Promise<TrangTin[]> => {
  const list = await repo.getAll(
    isSupabase() ? { orderBy: 'ngay_dang', ascending: false } : { orderBy: 'ngay_dang', ascending: false },
  );
  const rows = isSupabase()
    ? (list as unknown as Record<string, unknown>[]).map(flattenRow)
    : (list as TrangTin[]);
  return enrichTenNguoiTao(rows);
};

export const getTrangTinById = async (id: string): Promise<TrangTin | undefined> => {
  const row = await repo.getById(id);
  if (!row) return undefined;
  const flat = isSupabase() ? flattenRow(row as unknown as Record<string, unknown>) : (row as TrangTin);
  const [out] = await enrichTenNguoiTao([flat]);
  return out;
};

export const createTrangTin = async (data: TrangTinFormValues, hinhAnhUrls: string[]): Promise<TrangTin> => {
  const payload = toDbPayload(data, hinhAnhUrls);
  if (isSupabase()) {
    const inserted = await repo.insert(payload as Omit<TrangTin, 'id'> & { id?: string });
    const flat = flattenRow(inserted as unknown as Record<string, unknown>);
    const [out] = await enrichTenNguoiTao([flat]);
    return out!;
  }
  const inserted = await repo.insert({
    ...payload,
    tg_tao: new Date().toISOString(),
    tg_cap_nhat: new Date().toISOString(),
  } as Omit<TrangTin, 'id'> & { id?: string });
  const [out] = await enrichTenNguoiTao([inserted as TrangTin]);
  return out!;
};

export const updateTrangTin = async (
  id: string,
  data: TrangTinFormValues,
  hinhAnhUrls: string[],
): Promise<TrangTin> => {
  const existing = await repo.getById(id);
  if (!existing) throw new Error(i18n.t('trangTin.service.notFound'));
  const payload = toDbPayload(data, hinhAnhUrls);
  if (isSupabase()) {
    const updated = await repo.update(id, payload as Partial<TrangTin>);
    const flat = flattenRow(updated as unknown as Record<string, unknown>);
    const [out] = await enrichTenNguoiTao([flat]);
    return out!;
  }
  const updated = await repo.update(id, {
    ...payload,
    tg_cap_nhat: new Date().toISOString(),
  } as Partial<TrangTin>);
  const [out] = await enrichTenNguoiTao([updated as TrangTin]);
  return out!;
};

export const deleteTrangTinList = async (ids: string[]): Promise<void> => {
  await repo.remove(ids);
};
