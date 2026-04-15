import type { Employee } from '@/features/he-thong/nhan-vien/core/types';
import type { PositionPermission } from '@/features/he-thong/phan-quyen/core/types';
import { isSupabase } from '@/lib/data/config';
import { findPositionForChucVu, getActionsForModule, moduleActionsInclude } from '@/lib/module-permissions';
import { SIDEBAR_MENU, type MenuItem } from '@/lib/sidebar-menu';

export const PHAN_QUYEN_ROUTE_PATH = '/phan-quyen' as const;
export const DANH_SACH_QUAN_NHAN_ROUTE_PATH = '/danh-sach-quan-nhan' as const;
export const CHUC_VU_ROUTE_PATH = '/chuc-vu' as const;

/** Chỉ quân nhân `is_admin` mới thấy / vào được (khi Supabase). */
const ADMIN_ONLY_HE_THONG_PATHS: ReadonlySet<string> = new Set([
  PHAN_QUYEN_ROUTE_PATH,
  DANH_SACH_QUAN_NHAN_ROUTE_PATH,
  CHUC_VU_ROUTE_PATH,
]);

/** Segment đầu của path → module_key ma trận (vd. `/tai-lieu` → `tai-lieu`). Trang chủ `/` → null. */
export function routePathToPermissionModuleId(path: string): string | null {
  if (path == null || path === '' || path === '/') return null;
  const seg = path.replace(/^\//, '').split('/')[0];
  return seg && seg.length > 0 ? seg : null;
}

function userCanViewModuleForMenu(
  employee: Employee | null | undefined,
  roles: PositionPermission[],
  moduleId: string,
): boolean {
  if (isPhanQuyenAdmin(employee)) return true;
  const pos = findPositionForChucVu(roles, employee?.chuc_vu_id);
  const acts = getActionsForModule(pos, moduleId);
  return moduleActionsInclude(acts, 'view');
}

/**
 * Ẩn mục menu (sidebar / thẻ Home) khi không đủ quyền xem module: `is_admin` hoặc ma trận `view`/`quan_tri`/…
 * (cùng quy tắc `useModulePermission`). Mục Phân quyền / DSQN / Chức vụ vẫn do `getSidebarMenuForUser`.
 */
export function filterSidebarMenuByModuleView(
  items: MenuItem[],
  employee: Employee | null | undefined,
  roles: PositionPermission[] | undefined,
  isRolesPending: boolean,
  isEmployeesPending: boolean,
): MenuItem[] {
  if (!isSupabase()) return items;
  if (isRolesPending || roles === undefined) return items;
  if (isEmployeesPending) return items;
  return items.filter((item) => {
    const mid = routePathToPermissionModuleId(item.path);
    if (mid == null) return true;
    return userCanViewModuleForMenu(employee, roles, mid);
  });
}

/** Quân nhân khớp user đăng nhập và có cờ admin trên bảng danh_sach_quan_nhan. */
export function isPhanQuyenAdmin(employee: Pick<Employee, 'is_admin'> | null | undefined): boolean {
  return employee?.is_admin === true;
}

/** Menu sidebar / trang chủ: ẩn Phân quyền, Danh sách quân nhân, Chức vụ nếu không phải admin (Supabase). */
export function getSidebarMenuForUser(employee: Employee | null | undefined): MenuItem[] {
  if (!isSupabase()) return SIDEBAR_MENU;
  if (isPhanQuyenAdmin(employee)) return SIDEBAR_MENU;
  return SIDEBAR_MENU.filter((m) => !ADMIN_ONLY_HE_THONG_PATHS.has(m.path));
}
