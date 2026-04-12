import { Position } from '../core/types';
import { PositionFormValues } from '../core/schema';
import { createRepository } from '@/lib/data/create-repository';
import i18n from '../../../../lib/i18n';

const now = () => new Date().toISOString();

const MOCK_POSITIONS: Position[] = [
  {
    id: '1',
    chuc_vu: 'Ví dụ: Trưởng phòng',
    tg_tao: now(),
    tg_cap_nhat: now(),
    ten_chuc_vu: 'Ví dụ: Trưởng phòng',
    ma_chuc_vu: '1',
  },
];

function normalizeRow(row: Record<string, unknown>): Position {
  const id = String(row.id ?? '');
  const name = (row.chuc_vu as string | null) ?? '';
  return {
    id,
    chuc_vu: (row.chuc_vu as string | null) ?? null,
    tg_tao: (row.tg_tao as string | null) ?? null,
    tg_cap_nhat: (row.tg_cap_nhat as string | null) ?? null,
    ten_chuc_vu: name,
    ma_chuc_vu: id,
  };
}

const repo = createRepository<Position>({
  tableName: 'chuc_vu',
  mockData: MOCK_POSITIONS,
  select: '*',
  delay: 400,
});

export const getPositions = async (): Promise<Position[]> => {
  const list = await repo.getAll({ orderBy: 'chuc_vu', ascending: true });
  const rows = list as unknown as Record<string, unknown>[];
  return rows.map((r) => normalizeRow(r));
};

export const createPosition = async (data: PositionFormValues): Promise<Position> => {
  const payload = {
    chuc_vu: data.chuc_vu.trim(),
  };
  const inserted = await repo.insert(payload as Omit<Position, 'id'> & { id?: string });
  return normalizeRow(inserted as unknown as Record<string, unknown>);
};

export const updatePosition = async (id: string, data: PositionFormValues): Promise<Position> => {
  const existing = await repo.getById(id);
  if (!existing) throw new Error(i18n.t('position.service.notFound'));
  const updated = await repo.update(id, {
    chuc_vu: data.chuc_vu.trim(),
  } as Partial<Position>);
  return normalizeRow(updated as unknown as Record<string, unknown>);
};

export const deletePositions = async (ids: string[]): Promise<void> => {
  await repo.remove(ids);
};
