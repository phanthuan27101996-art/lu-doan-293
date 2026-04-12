import { createRepository } from '@/lib/data/create-repository';
import type { TruyenThong } from '../core/types';
import type { TruyenThongFormValues } from '../core/schema';

function normalizeRow(row: Record<string, unknown>): TruyenThong {
  return {
    id: String(row.id ?? ''),
    thong_tin: (row.thong_tin as string | null) ?? null,
    tg_cap_nhat: (row.tg_cap_nhat as string | null) ?? null,
  };
}

const MOCK_TRUYEN_THONG: TruyenThong[] = [
  {
    id: '1',
    thong_tin:
      'Đây là nội dung mẫu khi chạy không kết nối Supabase. Bật VITE_DATA_SOURCE=supabase và cấu hình URL/key để đồng bộ bảng public.truyen_thong.',
    tg_cap_nhat: new Date().toISOString(),
  },
];

const repo = createRepository<TruyenThong>({
  tableName: 'truyen_thong',
  mockData: MOCK_TRUYEN_THONG,
  select: '*',
  delay: 350,
});

/** Bản ghi “chính” dùng cho trang detail đơn (bản ghi id nhỏ nhất). */
export const getPrimaryTruyenThong = async (): Promise<TruyenThong | null> => {
  const rows = await repo.getAll({ orderBy: 'id', ascending: true, limit: 1 });
  const first = rows[0] as unknown as Record<string, unknown> | undefined;
  if (!first) return null;
  return normalizeRow(first);
};

export const upsertPrimaryTruyenThong = async (data: TruyenThongFormValues): Promise<TruyenThong> => {
  const existing = await getPrimaryTruyenThong();
  const thong_tin = data.thong_tin.trim() === '' ? null : data.thong_tin;
  if (existing) {
    const updated = await repo.update(existing.id, { thong_tin } as Partial<TruyenThong>);
    return normalizeRow(updated as unknown as Record<string, unknown>);
  }
  const inserted = await repo.insert({ thong_tin } as Omit<TruyenThong, 'id'>);
  return normalizeRow(inserted as unknown as Record<string, unknown>);
};
