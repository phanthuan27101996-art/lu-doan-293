import { createGenericStore, ColumnConfig } from '../../../../store/createGenericStore';
import i18n from '../../../../lib/i18n';

/** Module đơn giản — không có chip lọc */
export type PositionFilters = Record<string, never>;

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'chuc_vu', label: i18n.t('position.store.nameCol'), visible: true, minWidth: 220, order: 0 },
  { id: 'tg_tao', label: i18n.t('position.detail.createdAt'), visible: true, minWidth: 140, order: 1 },
  { id: 'tg_cap_nhat', label: i18n.t('position.store.updatedCol'), visible: true, minWidth: 140, order: 2 },
];

const initialFilters = {} as PositionFilters;

export const usePositionStore = createGenericStore<PositionFilters>(initialFilters, DEFAULT_COLUMNS);
