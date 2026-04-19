import { createGenericStore, ColumnConfig } from '../../../store/createGenericStore';
import type { TaiLieuFilters } from '../core/types';
import i18n from '../../../lib/i18n';

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'ten_chuc_vu', label: i18n.t('taiLieu.dm.store.chucVuCol'), visible: true, minWidth: 130, maxWidth: 200, order: 0 },
  { id: 'nhom_tai_lieu', label: i18n.t('taiLieu.dm.store.nhomCol'), visible: true, minWidth: 120, maxWidth: 180, order: 1 },
  { id: 'ten_tai_lieu', label: i18n.t('taiLieu.dm.store.tenCol'), visible: true, minWidth: 180, maxWidth: 360, order: 2 },
  { id: 'link', label: i18n.t('taiLieu.dm.store.linkCol'), visible: true, minWidth: 120, maxWidth: 220, order: 3 },
  { id: 'ten_nguoi_tao', label: i18n.t('taiLieu.dm.store.nguoiTaoCol'), visible: true, minWidth: 130, maxWidth: 200, order: 4 },
  { id: 'tg_cap_nhat', label: i18n.t('taiLieu.dm.store.updatedCol'), visible: false, minWidth: 110, maxWidth: 140, order: 5 },
];

const initialFilters: TaiLieuFilters = {
  nhom_tai_lieu: [],
};

export const useTaiLieuStore = createGenericStore<TaiLieuFilters>(initialFilters, DEFAULT_COLUMNS);
