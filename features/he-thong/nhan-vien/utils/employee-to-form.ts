import type { Employee } from '../core/types';
import type { EmployeeFormValues } from '../core/schema';

export function getDefaultEmployeeFormValues(): EmployeeFormValues {
  return {
    ho_ten: '',
    so_dien_thoai: '',
    chuc_vu_id: '',
    anh_dai_dien: '',
  };
}

export function employeeToFormValues(emp: Employee): EmployeeFormValues {
  return {
    ho_ten: emp.ho_ten,
    so_dien_thoai: emp.so_dien_thoai ?? '',
    chuc_vu_id: emp.chuc_vu_id ?? '',
    anh_dai_dien: emp.anh_dai_dien ?? '',
  };
}
