import { createGenericStore, ColumnConfig } from '../../../../store/createGenericStore';
import { EmployeeFilters } from '../core/types';
import i18n from '../../../../lib/i18n';

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'ho_ten', label: i18n.t('employee.store.nameCol'), visible: true, minWidth: 200, order: 0 },
  { id: 'id', label: i18n.t('employee.store.recordIdCol'), visible: true, minWidth: 108, maxWidth: 140, order: 1 },
  { id: 'ten_chuc_vu', label: i18n.t('employee.store.positionDeptCol'), visible: true, minWidth: 150, order: 2 },
  { id: 'is_admin', label: i18n.t('employee.store.adminCol'), visible: true, minWidth: 112, maxWidth: 130, order: 3 },
  { id: 'lien_he', label: i18n.t('employee.store.phoneCol'), visible: true, minWidth: 128, order: 4 },
  { id: 'tg_tao', label: i18n.t('employee.store.createdCol'), visible: true, minWidth: 108, maxWidth: 128, order: 5 },
  { id: 'tg_cap_nhat', label: i18n.t('employee.store.updatedCol'), visible: true, minWidth: 108, maxWidth: 128, order: 6 },
];

const initialFilters: EmployeeFilters = {
  position: [],
};

export const useEmployeeStore = createGenericStore<EmployeeFilters>(initialFilters, DEFAULT_COLUMNS);
