import { createGenericStore, ColumnConfig } from '../../../store/createGenericStore';
import type { KhoNhacFilters } from '../core/types';
import i18n from '../../../lib/i18n';

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'bo_suu_tap', label: i18n.t('khoNhac.dm.store.boSuuTapCol'), visible: true, minWidth: 140, maxWidth: 260, order: 0 },
  { id: 'ten_nhac', label: i18n.t('khoNhac.dm.store.tenNhacCol'), visible: true, minWidth: 160, maxWidth: 320, order: 1 },
  { id: 'tac_gia', label: i18n.t('khoNhac.dm.store.tacGiaCol'), visible: true, minWidth: 120, maxWidth: 220, order: 2 },
  { id: 'link', label: i18n.t('khoNhac.dm.store.linkCol'), visible: false, minWidth: 120, maxWidth: 220, order: 3 },
  { id: 'ten_nguoi_tao', label: i18n.t('khoNhac.dm.store.nguoiTaoCol'), visible: true, minWidth: 130, maxWidth: 200, order: 4 },
  { id: 'tg_cap_nhat', label: i18n.t('khoNhac.dm.store.updatedCol'), visible: false, minWidth: 110, maxWidth: 140, order: 5 },
];

const initialFilters: KhoNhacFilters = {
  bo_suu_tap: [],
};

export const useKhoNhacStore = createGenericStore<KhoNhacFilters>(initialFilters, DEFAULT_COLUMNS);
