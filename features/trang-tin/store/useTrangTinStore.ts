import { createGenericStore, ColumnConfig } from '../../../store/createGenericStore';
import type { TrangTinFilters } from '../core/types';
import i18n from '../../../lib/i18n';

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'ngay_dang', label: i18n.t('trangTin.store.ngayCol'), visible: true, minWidth: 110, maxWidth: 120, order: 0 },
  { id: 'tieu_de', label: i18n.t('trangTin.store.tieuDeCol'), visible: true, minWidth: 200, maxWidth: 420, order: 1 },
  { id: 'ten_nguoi_tao', label: i18n.t('trangTin.store.nguoiTaoCol'), visible: true, minWidth: 140, maxWidth: 200, order: 2 },
  { id: 'tg_cap_nhat', label: i18n.t('trangTin.store.updatedCol'), visible: false, minWidth: 110, maxWidth: 140, order: 3 },
];

const initialFilters: TrangTinFilters = {
  id_nguoi_tao: [],
};

export const useTrangTinStore = createGenericStore<TrangTinFilters>(initialFilters, DEFAULT_COLUMNS);
