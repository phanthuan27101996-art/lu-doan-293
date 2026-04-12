import { createGenericStore, ColumnConfig } from '../../../../store/createGenericStore';
import { EmployeeFilters } from '../core/types';
import i18n from '../../../../lib/i18n';

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'ho_ten', label: i18n.t('employee.store.nameCol'), visible: true, minWidth: 220, order: 0 },
  { id: 'ten_chuc_vu', label: i18n.t('employee.store.positionDeptCol'), visible: true, minWidth: 160, order: 1 },
  { id: 'lien_he', label: i18n.t('employee.store.phoneCol'), visible: true, minWidth: 130, order: 2 },
  { id: 'tg_tao', label: i18n.t('employee.store.createdCol'), visible: true, minWidth: 110, maxWidth: 140, order: 3 },
  { id: 'tg_cap_nhat', label: i18n.t('employee.store.updatedCol'), visible: false, minWidth: 110, maxWidth: 140, order: 4 },
];

const initialFilters: EmployeeFilters = {
  position: [],
};

export const useEmployeeStore = createGenericStore<EmployeeFilters>(initialFilters, DEFAULT_COLUMNS);
