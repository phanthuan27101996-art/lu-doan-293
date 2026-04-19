import { createGenericStore, ColumnConfig } from '../../../store/createGenericStore';
import type { MoiTuanMotDieuLuatFilters } from '../core/types';
import i18n from '../../../lib/i18n';

const DEFAULT_COLUMNS: ColumnConfig[] = [
  {
    id: 'nam_thang_tuan',
    label: i18n.t('moiTuanMotDieuLuat.dm.store.kyCol'),
    visible: true,
    minWidth: 100,
    maxWidth: 130,
    order: 0,
  },
  {
    id: 'ten_dieu_luat',
    label: i18n.t('moiTuanMotDieuLuat.dm.store.tenCol'),
    visible: true,
    minWidth: 200,
    maxWidth: 400,
    order: 1,
  },
  {
    id: 'hinh_anh',
    label: i18n.t('moiTuanMotDieuLuat.dm.store.hinhCol'),
    visible: true,
    minWidth: 72,
    maxWidth: 100,
    order: 2,
  },
  {
    id: 'tep_dinh_kem',
    label: i18n.t('moiTuanMotDieuLuat.dm.store.tepCol'),
    visible: true,
    minWidth: 80,
    maxWidth: 120,
    order: 3,
  },
  {
    id: 'link',
    label: i18n.t('moiTuanMotDieuLuat.dm.store.linkCol'),
    visible: false,
    minWidth: 120,
    maxWidth: 220,
    order: 4,
  },
  {
    id: 'ten_nguoi_tao',
    label: i18n.t('moiTuanMotDieuLuat.dm.store.nguoiTaoCol'),
    visible: true,
    minWidth: 130,
    maxWidth: 200,
    order: 5,
  },
  {
    id: 'tg_cap_nhat',
    label: i18n.t('moiTuanMotDieuLuat.dm.store.updatedCol'),
    visible: false,
    minWidth: 110,
    maxWidth: 140,
    order: 6,
  },
];

const initialFilters: MoiTuanMotDieuLuatFilters = {
  nam_thang: [],
};

export const useMoiTuanMotDieuLuatStore = createGenericStore<MoiTuanMotDieuLuatFilters>(
  initialFilters,
  DEFAULT_COLUMNS,
);
