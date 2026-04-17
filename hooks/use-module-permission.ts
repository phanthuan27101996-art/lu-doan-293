import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useStore';
import { useEmployees } from '@/features/he-thong/nhan-vien/hooks/use-nhan-vien';
import { findEmployeeByAuthIdentity } from '@/lib/phone-auth';
import { isPhanQuyenAdmin } from '@/lib/phan-quyen-access';
import { isSupabase } from '@/lib/data/config';
import { getRoles } from '@/features/he-thong/phan-quyen/services/phan-quyen-service';
import {
  PHAN_QUYEN_ROLES_QUERY_KEY,
  findPositionForChucVu,
  getActionsForModule,
  resolveModuleCrudFlags,
} from '@/lib/module-permissions';

const FULL = {
  canView: true,
  canCreate: true,
  canUpdate: true,
  canDelete: true,
};

export type ModulePermissionState = {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  isLoading: boolean;
  /** Cờ `danh_sach_quan_nhan.is_admin` — bật full CRUD mọi module + route hệ thống admin. */
  isAdmin: boolean;
  /** Có trong danh sách nhưng không có chức vụ / không khớp vai trò trong ma trận. */
  noPosition: boolean;
};

/**
 * Quyền UI theo module (module_key = id trong permission-modules-config).
 * - Mock: full CRUD.
 * - `is_admin` (tài khoản): full xem / thêm / sửa / xóa mọi module (kể cả Truyền thống).
 * - Khác: ma trận theo `chuc_vu_id` — `view`|`create`|`update`|`delete` hoặc `quan_tri`|`all` (full module).
 *
 * `canView` dùng cho nút/toolbar và ẩn mục trên trang chủ / sidebar — **không** dùng để chặn cả trang module
 * (đã vào từ menu thì xem nội dung; ma trận + RLS vẫn bảo vệ dữ liệu phía server).
 */
export function useModulePermission(moduleId: string): ModulePermissionState {
  const user = useAuthStore((s) => s.user);
  const { data: employees = [], isPending: employeesPending } = useEmployees();
  const employee = useMemo(
    () => findEmployeeByAuthIdentity(user, employees) ?? null,
    [user, employees],
  );
  const isAdmin = isPhanQuyenAdmin(employee);
  const mock = !isSupabase();

  const { data: roles = [], isPending: rolesPending } = useQuery({
    queryKey: PHAN_QUYEN_ROLES_QUERY_KEY,
    queryFn: getRoles,
    enabled: isSupabase(),
    staleTime: 1000 * 60 * 5,
  });

  return useMemo(() => {
    if (mock) {
      return {
        ...FULL,
        isLoading: false,
        isAdmin: false,
        noPosition: false,
      };
    }

    /**
     * Chờ cả ma trận và DS quân nhân: nếu chỉ roles xong mà employees chưa có,
     * `employee` vẫn null → tưởng nhầm không có quyền (nháy "không được phép").
     */
    if (rolesPending || employeesPending) {
      return {
        canView: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        isLoading: true,
        isAdmin: false,
        noPosition: false,
      };
    }

    // is_admin: full CRUD mọi module (đã có employee từ DS)
    if (isAdmin) {
      return {
        ...FULL,
        isLoading: false,
        isAdmin: true,
        noPosition: false,
      };
    }

    const pos = findPositionForChucVu(roles, employee?.chuc_vu_id);
    if (!pos) {
      return {
        canView: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        isLoading: false,
        isAdmin: false,
        noPosition: true,
      };
    }

    const acts = getActionsForModule(pos, moduleId);
    return {
      ...resolveModuleCrudFlags(false, acts),
      isLoading: false,
      isAdmin: false,
      noPosition: false,
    };
  }, [mock, isAdmin, rolesPending, employeesPending, roles, employee?.chuc_vu_id, moduleId]);
}
