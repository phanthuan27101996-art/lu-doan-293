import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useStore';
import { useEmployees } from '@/features/he-thong/nhan-vien/hooks/use-nhan-vien';
import { findEmployeeByAuthIdentity } from '@/lib/phone-auth';
import { isSupabase } from '@/lib/data/config';
import { getRoles } from '@/features/he-thong/phan-quyen/services/phan-quyen-service';
import {
  PHAN_QUYEN_ROLES_QUERY_KEY,
  findPositionForChucVu,
  getActionsForModule,
  canModerateModule,
} from '@/lib/module-permissions';
import { useModulePermission } from '@/hooks/use-module-permission';
import { resolveQuanNhanIdForUser } from '@/lib/resolve-quan-nhan-for-auth-user';

/**
 * Quyền module Góp ý + phạm vi danh sách:
 * - `canModerate`: `is_admin` hoặc ma trận `quan_tri`/`all` — xem mọi góp ý, trả lời, đổi trạng thái.
 * - Chỉ `view` (không quản trị): xem / sửa / xóa theo ma trận nhưng chỉ bản ghi `id_nguoi_tao` = quân nhân đăng nhập.
 */
export function useGopYAccess() {
  const perm = useModulePermission('gop-y');
  const user = useAuthStore((s) => s.user);
  const { data: employees = [] } = useEmployees();
  const employee = useMemo(
    () => findEmployeeByAuthIdentity(user, employees) ?? null,
    [user, employees],
  );
  const currentCreatorId = useMemo(
    () => resolveQuanNhanIdForUser(user, employees),
    [user, employees],
  );

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: PHAN_QUYEN_ROLES_QUERY_KEY,
    queryFn: getRoles,
    enabled: isSupabase(),
    staleTime: 1000 * 60 * 5,
  });

  const actsForGopY = useMemo(() => {
    if (!isSupabase()) return [] as string[];
    if (perm.isAdmin) return [] as string[];
    const pos = findPositionForChucVu(roles, employee?.chuc_vu_id);
    return getActionsForModule(pos, 'gop-y');
  }, [perm.isAdmin, roles, employee?.chuc_vu_id]);

  const canModerate = useMemo(() => {
    if (!isSupabase()) return true;
    if (perm.isAdmin) return true;
    if (perm.isLoading || rolesLoading) return false;
    return canModerateModule(false, actsForGopY);
  }, [perm.isAdmin, perm.isLoading, rolesLoading, actsForGopY]);

  return {
    ...perm,
    canModerate,
    currentCreatorId,
  };
}
