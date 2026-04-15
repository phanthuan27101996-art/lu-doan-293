import { createGenericStore, ColumnConfig } from '../../../store/createGenericStore';
import type { DoanCoSoFilters } from '../core/types';
import i18n from '../../../lib/i18n';

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'ngay', label: i18n.t('doanCoSo.dm.store.ngayCol'), visible: true, minWidth: 110, maxWidth: 120, order: 0 },
  { id: 'nhom', label: i18n.t('doanCoSo.dm.store.nhomCol'), visible: true, minWidth: 120, maxWidth: 200, order: 1 },
  { id: 'ten', label: i18n.t('doanCoSo.dm.store.tenCol'), visible: true, minWidth: 180, maxWidth: 360, order: 2 },
  { id: 'hinh_anh', label: i18n.t('doanCoSo.dm.store.hinhAnhCol'), visible: true, minWidth: 80, maxWidth: 120, order: 3 },
  { id: 'link', label: i18n.t('doanCoSo.dm.store.linkCol'), visible: false, minWidth: 120, maxWidth: 220, order: 4 },
  { id: 'ten_nguoi_tao', label: i18n.t('doanCoSo.dm.store.nguoiTaoCol'), visible: true, minWidth: 130, maxWidth: 200, order: 5 },
  { id: 'tg_cap_nhat', label: i18n.t('doanCoSo.dm.store.updatedCol'), visible: false, minWidth: 110, maxWidth: 140, order: 6 },
];

const initialFilters: DoanCoSoFilters = {
  nhom: [],
};

export const useDoanCoSoStore = createGenericStore<DoanCoSoFilters>(initialFilters, DEFAULT_COLUMNS);
