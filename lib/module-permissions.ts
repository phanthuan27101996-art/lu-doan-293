import type { PositionPermission } from '@/features/he-thong/phan-quyen/core/types';

/** Query key dùng chung cho `getRoles` (ma trận phân quyền). */
export const PHAN_QUYEN_ROLES_QUERY_KEY = ['phan-quyen-roles'] as const;

export type ModuleCrudAction = 'view' | 'create' | 'update' | 'delete';

/**
 * Chuẩn hóa mã lưu ma trận: `admin` (tên cũ) → `quan_tri` (quản trị theo module).
 * Khác với `is_admin` trên bảng quân nhân — hai quyền độc lập.
 */
export function normalizeMatrixActions(actions: readonly string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of actions) {
    const s = String(raw).trim();
    if (!s) continue;
    const n = s === 'admin' ? 'quan_tri' : s;
    if (seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

/** `all` / `quan_tri` (hoặc `admin` cũ) trong ma trận = đủ xem + thêm + sửa + xóa module. */
function actionsGrantFullCrud(set: ReadonlySet<string>): boolean {
  return set.has('all') || set.has('admin') || set.has('quan_tri');
}

/** Quyền điều hành module (vd. Góp ý: xem mọi bản ghi, trả lời, đổi trạng thái): ma trận có `quan_tri` / `all` / `admin` (legacy). */
export function moduleHasQuanTriScope(actions: readonly string[]): boolean {
  const set = new Set(actions.map((a) => String(a).trim()));
  return actionsGrantFullCrud(set);
}

/**
 * Điều hành nội dung module: `is_admin` tài khoản hoặc ma trận `quan_tri`/`all`/`admin`.
 * Khác với chỉ có `view` / `create` / … từng quyền lẻ.
 */
export function canModerateModule(isAccountAdmin: boolean, actionsForModule: readonly string[]): boolean {
  if (isAccountAdmin) return true;
  return moduleHasQuanTriScope(actionsForModule);
}

/** Ma trận: `quan_tri` / `admin` (legacy) / `all` = đủ CRUD module (không dùng cờ `is_admin`). */
export function moduleActionsInclude(actions: readonly string[], action: ModuleCrudAction): boolean {
  const set = new Set(actions.map((a) => String(a).trim()));
  if (actionsGrantFullCrud(set)) return true;
  return set.has(action);
}

export function flagsFromModuleActions(actions: readonly string[]) {
  return {
    canView: moduleActionsInclude(actions, 'view'),
    canCreate: moduleActionsInclude(actions, 'create'),
    canUpdate: moduleActionsInclude(actions, 'update'),
    canDelete: moduleActionsInclude(actions, 'delete'),
  };
}

export type ModuleCrudFlags = ReturnType<typeof flagsFromModuleActions>;

/**
 * Quyền CRUD module trên app (chuẩn dự án):
 * - `is_account_admin` (`danh_sach_quan_nhan.is_admin`): đủ xem / thêm / sửa / xóa mọi module.
 * - Ngược lại: theo ma trận chức vụ — từng mã `view`|`create`|`update`|`delete`, hoặc `quan_tri`/`all`/`admin`(legacy) = full module.
 */
export function resolveModuleCrudFlags(
  isAccountAdmin: boolean,
  actionsForModule: readonly string[],
): ModuleCrudFlags {
  if (isAccountAdmin) {
    return { canView: true, canCreate: true, canUpdate: true, canDelete: true };
  }
  return flagsFromModuleActions(actionsForModule);
}

export function findPositionForChucVu(
  roles: PositionPermission[],
  chucVuId: string | null | undefined,
): PositionPermission | undefined {
  if (chucVuId == null || chucVuId === '') return undefined;
  const id = String(chucVuId);
  return roles.find((r) => r.id === id || r.id_chuc_vu === id);
}

export function getActionsForModule(role: PositionPermission | undefined, moduleId: string): string[] {
  if (!role) return [];
  const mp = role.quyen_han.find((q) => q.module_id === moduleId);
  return mp?.actions ?? [];
}
