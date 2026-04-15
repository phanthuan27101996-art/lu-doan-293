import { PositionPermission, AccessLog, ModulePermission, ActionType } from '../core/types';
import { RoleFormValues } from '../core/schema';
import i18n from '../../../../lib/i18n';
import { createRepository } from '@/lib/data/create-repository';
import { isSupabase } from '@/lib/data/config';
import { getSupabase } from '@/lib/supabase/client';
import {
  PERMISSION_FUNCTIONS,
  PERMISSION_ACTIONS,
  getAllPermissionModules,
} from '../core/permission-modules-config';
import { normalizeMatrixActions } from '@/lib/module-permissions';

/** Tên bảng Supabase cho ma trận phân quyền (dùng khi query trực tiếp / mở rộng). */
export const PHAN_QUYEN_SUPABASE_TABLE = 'phan_quyen' as const;

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

/**
 * Ghi vào cột `action` (text): JSON array các mã quyền, ví dụ ["view","bao_cao_tuy_chinh"].
 * Chuẩn hóa: trim, bỏ trùng, giữ thứ tự.
 */
export function serializePhanQuyenActions(actions: readonly string[]): string {
  const normalized = normalizeMatrixActions(actions);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of normalized) {
    const s = String(raw).trim();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return JSON.stringify(out);
}

/**
 * Đọc cột `action` từ DB: ưu tiên JSON array; nếu không parse được thì tách theo , ; |
 * (hỗ trợ nhập tay trên Supabase).
 */
export function parsePhanQuyenActionText(raw: string | null | undefined): string[] {
  if (raw == null) return [];
  const t = raw.trim();
  if (!t) return [];
  if (t.startsWith('[')) {
    try {
      const v = JSON.parse(t) as unknown;
      if (Array.isArray(v)) {
        return v.map((x) => String(x).trim()).filter(Boolean);
      }
    } catch {
      /* fall through */
    }
  }
  return t
    .split(/[,;|]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildQuyenHan(actionsByModule: Map<string, string[]>): ModulePermission[] {
  return SYSTEM_MODULES_CONFIG.map((m) => ({
    module_id: m.id,
    module_name: getModuleName(m.id),
    actions: normalizeMatrixActions([...(actionsByModule.get(m.id) ?? [])]),
  }));
}

function mapsFromPhanQuyenRows(
  rows: { id_chuc_vu: number | string; module_key: string; action: string }[],
): Map<string, Map<string, string[]>> {
  const byCv = new Map<string, Map<string, string[]>>();
  for (const r of rows) {
    const cv = String(r.id_chuc_vu);
    const mk = String(r.module_key);
    if (!byCv.has(cv)) byCv.set(cv, new Map());
    byCv.get(cv)!.set(mk, parsePhanQuyenActionText(r.action));
  }
  return byCv;
}

function positionFromChucVu(
  row: { id: number | string; chuc_vu: string | null; tg_tao?: string | null; tg_cap_nhat: string | null },
  actionsByModule: Map<string, string[]>,
  soNhanVien: number,
): PositionPermission {
  const idStr = String(row.id);
  return {
    id: idStr,
    id_chuc_vu: idStr,
    ma_chuc_vu: idStr,
    ten_chuc_vu: row.chuc_vu ?? '',
    ten_phong_ban: i18n.t('permission.module.undefined'),
    mo_ta: null,
    so_nhan_vien: soNhanVien,
    quyen_han: buildQuyenHan(actionsByModule),
    trang_thai: 'Đang hoạt động',
    tg_cap_nhat: row.tg_cap_nhat ?? row.tg_tao ?? new Date().toISOString(),
  };
}

function buildMockRoles(): PositionPermission[] {
  const fullPerms: ModulePermission[] = SYSTEM_MODULES_CONFIG.map((m) => ({
    module_id: m.id,
    module_name: getModuleName(m.id),
    actions: [...PERMISSION_ACTIONS],
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

/** Mock; khi Supabase dùng bảng PHAN_QUYEN_SUPABASE_TABLE + chuc_vu. */
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
  if (!isSupabase()) return roleRepo.getAll();

  const sb = getSupabase()!;
  const [cvRes, pqRes, nvRes] = await Promise.all([
    sb.from('chuc_vu').select('id,chuc_vu,tg_tao,tg_cap_nhat').order('chuc_vu'),
    sb.from(PHAN_QUYEN_SUPABASE_TABLE).select('id_chuc_vu,module_key,action'),
    sb.from('danh_sach_quan_nhan').select('id_chuc_vu'),
  ]);

  if (cvRes.error) throw cvRes.error;
  if (pqRes.error) throw pqRes.error;
  if (nvRes.error) throw nvRes.error;

  const byCv = mapsFromPhanQuyenRows(
    (pqRes.data ?? []) as { id_chuc_vu: number | string; module_key: string; action: string }[],
  );

  const counts = new Map<string, number>();
  for (const row of nvRes.data ?? []) {
    if (row.id_chuc_vu == null) continue;
    const k = String(row.id_chuc_vu);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }

  return (cvRes.data ?? []).map((cv) =>
    positionFromChucVu(cv, byCv.get(String(cv.id)) ?? new Map(), counts.get(String(cv.id)) ?? 0),
  );
};

export const createRole = async (data: RoleFormValues, permissions: ModulePermission[]): Promise<PositionPermission> => {
  if (isSupabase()) {
    const sb = getSupabase()!;
    const { data: row, error } = await sb
      .from('chuc_vu')
      .insert({ chuc_vu: data.ten_vai_tro.trim() })
      .select('id,chuc_vu,tg_tao,tg_cap_nhat')
      .single();
    if (error) throw error;

    const permByMod = new Map(permissions.map((p) => [p.module_id, p.actions]));
    const cvId = Number(row.id);
    const rows = SYSTEM_MODULES_CONFIG.map((m) => ({
      id_chuc_vu: cvId,
      module_key: m.id,
      action: serializePhanQuyenActions(permByMod.get(m.id) ?? []),
    }));
    const { error: pqErr } = await sb.from(PHAN_QUYEN_SUPABASE_TABLE).upsert(rows, {
      onConflict: 'id_chuc_vu,module_key',
    });
    if (pqErr) throw pqErr;

    const modMap = new Map<string, string[]>();
    for (const r of rows) {
      modMap.set(r.module_key, parsePhanQuyenActionText(r.action));
    }
    return positionFromChucVu(row, modMap, 0);
  }

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
  if (isSupabase()) {
    const sb = getSupabase()!;
    const nums = ids.map((id) => Number(id)).filter((n) => !Number.isNaN(n));
    if (nums.length === 0) return;
    const { error } = await sb.from('chuc_vu').delete().in('id', nums);
    if (error) throw error;
    return;
  }
  await roleRepo.remove(ids);
};

export const updateModulePermissions = async (
  moduleId: string,
  updates: { roleId: string; actions: string[] }[],
): Promise<void> => {
  if (isSupabase()) {
    const sb = getSupabase()!;
    const upsertRows = updates.map(({ roleId, actions }) => {
      const idCV = Number(roleId);
      if (Number.isNaN(idCV)) return null;
      return {
        id_chuc_vu: idCV,
        module_key: moduleId,
        action: serializePhanQuyenActions(actions),
      };
    }).filter((r): r is NonNullable<typeof r> => r != null);
    if (upsertRows.length === 0) return;
    const { error } = await sb.from(PHAN_QUYEN_SUPABASE_TABLE).upsert(upsertRows, {
      onConflict: 'id_chuc_vu,module_key',
    });
    if (error) throw error;
    return;
  }

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
