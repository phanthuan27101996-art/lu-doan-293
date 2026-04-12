import { useMemo } from 'react';
import type { Employee, EmployeeFilters } from '../core/types';

/** Đếm theo chức vụ (bộ lọc trạng thái đã bỏ khỏi module đơn giản). */
export function useFilterCounts(employees: Employee[], searchTerm: string, filters: EmployeeFilters) {
  return useMemo(() => {
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch = (emp: Employee) =>
      !searchTerm ||
      emp.ho_ten.toLowerCase().includes(searchLower) ||
      emp.so_dien_thoai.includes(searchLower) ||
      (emp.ten_chuc_vu && emp.ten_chuc_vu.toLowerCase().includes(searchLower)) ||
      emp.id.toLowerCase().includes(searchLower);

    const matchesPosition = (emp: Employee) =>
      filters.position.length === 0 ||
      (emp.chuc_vu_id != null && filters.position.includes(emp.chuc_vu_id));

    const posCounts: Record<string, number> = {};

    for (const emp of employees) {
      if (!matchesSearch(emp)) continue;
      if (matchesPosition(emp) && emp.chuc_vu_id) {
        posCounts[emp.chuc_vu_id] = (posCounts[emp.chuc_vu_id] || 0) + 1;
      }
    }

    return { posCounts, statusCounts: {} as Record<string, number> };
  }, [employees, searchTerm, filters]);
}
