import { createGenericStore, ColumnConfig } from '../../../store/createGenericStore';
import type { ThiTracNghiemFilters } from '../core/types';
import i18n from '../../../lib/i18n';

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'nhom', label: i18n.t('thiTracNghiem.dm.store.nhomCol'), visible: true, minWidth: 120, maxWidth: 200, order: 0 },
  { id: 'ten_de_thi', label: i18n.t('thiTracNghiem.dm.store.tenCol'), visible: true, minWidth: 180, maxWidth: 360, order: 1 },
  { id: 'link', label: i18n.t('thiTracNghiem.dm.store.linkCol'), visible: true, minWidth: 120, maxWidth: 220, order: 2 },
  { id: 'ten_nguoi_tao', label: i18n.t('thiTracNghiem.dm.store.nguoiTaoCol'), visible: true, minWidth: 130, maxWidth: 200, order: 3 },
  { id: 'tg_cap_nhat', label: i18n.t('thiTracNghiem.dm.store.updatedCol'), visible: false, minWidth: 110, maxWidth: 140, order: 4 },
];

const initialFilters: ThiTracNghiemFilters = {
  nhom: [],
};

export const useThiTracNghiemStore = createGenericStore<ThiTracNghiemFilters>(initialFilters, DEFAULT_COLUMNS);
