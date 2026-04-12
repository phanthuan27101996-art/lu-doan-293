import { PositionPermission, AccessLog, ModulePermission, ActionType } from '../core/types';
import { RoleFormValues } from '../core/schema';
import i18n from '../../../../lib/i18n';
import { createRepository } from '@/lib/data/create-repository';
import {
  PERMISSION_FUNCTIONS,
  PERMISSION_ACTIONS,
  getAllPermissionModules,
} from '../core/permission-modules-config';

/** Danh sách phẳng module: id, nameKey (UI dùng t(nameKey)), allowedActions = 6 quyền. */
export const SYSTEM_MODULES_CONFIG = getAllPermissionModules().map((m) => ({
  id: m.id,
  nameKey: m.nameKey,
  allowedActions: [...PERMISSION_ACTIONS] as ActionType[],
}));

export function getModuleName(moduleId: string): string {
  const m = SYSTEM_MODULES_CONFIG.find((x) => x.id === moduleId);
  return m?.nameKey ?? moduleId;
}

function buildMockRoles(): PositionPermission[] {
  const fullPerms = SYSTEM_MODULES_CONFIG.map((m) => ({
    module_id: m.id,
    module_name: getModuleName(m.id),
    actions: [...PERMISSION_ACTIONS] as ActionType[],
  }));
  return [
    {
      id: 'pos-1',
      id_chuc_vu: 'pos-1',
      ma_chuc_vu: 'CEO',
      ten_chuc_vu: 'Tổng Giám Đốc',
      ten_phong_ban: 'Ban Giám Đốc',
      thu_tu_phong_ban: 0,
      thu_tu_chuc_vu: 1,
      mo_ta: i18n.t('permission.module.fullSystemDesc'),
      so_nhan_vien: 1,
      quyen_han: fullPerms,
      trang_thai: 'Đang hoạt động',
      tg_cap_nhat: '2024-01-01T00:00:00Z',
    },
    {
      id: 'pos-3',
      id_chuc_vu: 'pos-3',
      ma_chuc_vu: 'HR_MANAGER',
      ten_chuc_vu: 'Trưởng Phòng Nhân Sự',
      ten_phong_ban: 'Phòng Hành Chính Nhân Sự',
      thu_tu_phong_ban: 1,
      thu_tu_chuc_vu: 2,
      mo_ta: i18n.t('permission.module.hrManagerDesc'),
      so_nhan_vien: 2,
      quyen_han: fullPerms,
      trang_thai: 'Đang hoạt động',
      tg_cap_nhat: '2024-02-15T09:30:00Z',
    },
  ];
}

const roleRepo = createRepository<PositionPermission>({
  tableName: 'he_thong_phan_quyen',
  mockData: buildMockRoles(),
  delay: 500,
});

const seedAccessLogs: AccessLog[] = [
  {
    id: 'log-1',
    id_nguoi_dung: 'user-123',
    ten_nguoi_dung: 'Nguyễn Văn Admin',
    hanh_dong: 'Phê duyệt',
    mo_ta: 'Duyệt yêu cầu sao lưu hệ thống',
    dia_chi_ip: '14.226.15.112',
    thiet_bi: 'Desktop / Chrome 122',
    trang_thai: 'Success',
    tg_thuc_hien: new Date().toISOString(),
  },
];

const logRepo = createRepository<AccessLog>({
  tableName: 'he_thong_access_log',
  mockData: JSON.parse(JSON.stringify(seedAccessLogs)),
  delay: 300,
});

export const getRoles = async (): Promise<PositionPermission[]> => {
  return roleRepo.getAll();
};

export const createRole = async (data: RoleFormValues, permissions: ModulePermission[]): Promise<PositionPermission> => {
  const id = `perm-${Date.now()}`;
  const now = new Date().toISOString();
  return roleRepo.insert({
    id,
    id_chuc_vu: `pos-custom-${Date.now()}`,
    ma_chuc_vu: data.ma_vai_tro,
    ten_chuc_vu: data.ten_vai_tro,
    ten_phong_ban: i18n.t('permission.module.undefined'),
    mo_ta: data.mo_ta || null,
    so_nhan_vien: 0,
    quyen_han: permissions,
    trang_thai: data.trang_thai,
    tg_cap_nhat: now,
  } as Omit<PositionPermission, 'id'> & { id: string });
};

export const deleteRoles = async (ids: string[]): Promise<void> => {
  await roleRepo.remove(ids);
};

export const updateModulePermissions = async (moduleId: string, updates: { roleId: string; actions: ActionType[] }[]): Promise<void> => {
  const moduleName = getModuleName(moduleId);
  for (const { roleId, actions } of updates) {
    const role = await roleRepo.getById(roleId);
    if (!role) continue;
    const otherPerms = role.quyen_han.filter((p) => p.module_id !== moduleId);
    await roleRepo.update(roleId, {
      quyen_han: [...otherPerms, { module_id: moduleId, module_name: moduleName, actions }],
      tg_cap_nhat: new Date().toISOString(),
    });
  }
};

export const getLogs = async (): Promise<AccessLog[]> => {
  return logRepo.getAll({ orderBy: 'tg_thuc_hien', ascending: false });
};

export { PERMISSION_FUNCTIONS, PERMISSION_ACTIONS, getAllPermissionModules };
export type { PermissionFunction } from '../core/permission-modules-config';
