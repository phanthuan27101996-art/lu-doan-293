import { createGenericStore, ColumnConfig } from '../../../store/createGenericStore';
import type { GopYFilters } from '../core/types';
import i18n from '../../../lib/i18n';

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'ngay', label: i18n.t('gopY.dm.store.ngayCol'), visible: true, minWidth: 110, maxWidth: 120, order: 0 },
  { id: 'tieu_de_gop_y', label: i18n.t('gopY.dm.store.tieuDeCol'), visible: true, minWidth: 160, maxWidth: 320, order: 1 },
  { id: 'trang_thai', label: i18n.t('gopY.dm.store.trangThaiCol'), visible: true, minWidth: 120, maxWidth: 160, order: 2 },
  { id: 'chi_tiet_gop_y', label: i18n.t('gopY.dm.store.chiTietCol'), visible: false, minWidth: 120, maxWidth: 220, order: 3 },
  { id: 'ten_nguoi_tao', label: i18n.t('gopY.dm.store.nguoiTaoCol'), visible: true, minWidth: 130, maxWidth: 200, order: 4 },
  { id: 'tg_cap_nhat', label: i18n.t('gopY.dm.store.updatedCol'), visible: false, minWidth: 110, maxWidth: 140, order: 5 },
];

const initialFilters: GopYFilters = {
  trang_thai: [],
};

export const useGopYStore = createGenericStore<GopYFilters>(initialFilters, DEFAULT_COLUMNS);
