import { isSupabase } from '@/lib/data/config';
import { getSupabase } from '@/lib/supabase/client';

const STORAGE_BUCKET = 'truyen-thong';

export type TruyenThongImageFolder = 'lanh-dao-luu-doan' | 'luu-doan-truong' | 'chinh-uy';

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error ?? new Error('FileReader'));
    r.readAsDataURL(file);
  });
}

export async function uploadTruyenThongImage(file: File, folder: TruyenThongImageFolder): Promise<string> {
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

/** Chuỗi lưu DB: URL có sẵn giữ nguyên; data URL → upload Supabase (mock giữ data URL). */
export async function resolveTruyenThongHinhAnhForSave(
  hinhAnh: string | null | undefined,
  folder: TruyenThongImageFolder,
): Promise<string> {
  const s = (hinhAnh ?? '').trim();
  if (!s) return '';
  if (!s.startsWith('data:')) return s;
  if (!isSupabase() || !getSupabase()) return s;
  const res = await fetch(s);
  const blob = await res.blob();
  const ext = blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg';
  const file = new File([blob], `hinh-anh.${ext}`, { type: blob.type || 'image/jpeg' });
  return uploadTruyenThongImage(file, folder);
}
