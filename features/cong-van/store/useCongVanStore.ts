import { createGenericStore, ColumnConfig } from '../../../store/createGenericStore';
import type { CongVanFilters } from '../core/types';
import i18n from '../../../lib/i18n';

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'don_vi', label: i18n.t('congVan.dm.store.donViCol'), visible: true, minWidth: 120, maxWidth: 200, order: 0 },
  { id: 'ngay', label: i18n.t('congVan.dm.store.ngayCol'), visible: true, minWidth: 100, maxWidth: 120, order: 1 },
  { id: 'ten_van_ban', label: i18n.t('congVan.dm.store.tenCol'), visible: true, minWidth: 180, maxWidth: 360, order: 2 },
  { id: 'tep_dinh_kem', label: i18n.t('congVan.dm.store.tepCol'), visible: true, minWidth: 80, maxWidth: 120, order: 3 },
  { id: 'link', label: i18n.t('congVan.dm.store.linkCol'), visible: false, minWidth: 120, maxWidth: 220, order: 4 },
  { id: 'ten_nguoi_tao', label: i18n.t('congVan.dm.store.nguoiTaoCol'), visible: true, minWidth: 130, maxWidth: 200, order: 5 },
  { id: 'tg_cap_nhat', label: i18n.t('congVan.dm.store.updatedCol'), visible: false, minWidth: 110, maxWidth: 140, order: 6 },
];

const initialFilters: CongVanFilters = {
  don_vi: [],
};

export const useCongVanStore = createGenericStore<CongVanFilters>(initialFilters, DEFAULT_COLUMNS);
