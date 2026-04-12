import type { TrangThaiNhanVien } from '../core/constants';
import type { Employee } from '../core/types';
import { EmployeeFormValues } from '../core/schema';
import type { Position } from '../../chuc-vu/core/types';
import { getPositions } from '../../chuc-vu/services/chuc-vu-service';
import { createRepository } from '@/lib/data/create-repository';
import { isSupabase } from '@/lib/data/config';
import i18n from '../../../../lib/i18n';
import { getAvatarUrl } from '../../../../lib/utils';

const mockSeedEmployees: Employee[] = [];

/** Không dùng embed `chuc_vu(...)` — PostgREST cần FK trong DB; app liên kết logic qua `id_chuc_vu` + bảng `chuc_vu`. */
const repo = createRepository<Employee>({
  tableName: 'danh_sach_quan_nhan',
  mockData: mockSeedEmployees,
  select: '*',
  delay: 600,
});

function toDbInsertPayload(data: EmployeeFormValues): Record<string, unknown> {
  return {
    ho_va_ten: data.ho_ten.trim(),
    so_dien_thoai: data.so_dien_thoai?.trim() || null,
    avatar: data.anh_dai_dien?.trim() || getAvatarUrl(data.ho_ten.trim()) || null,
    id_chuc_vu: data.chuc_vu_id?.trim() ? data.chuc_vu_id.trim() : null,
  };
}

function toDbUpdatePayload(data: EmployeeFormValues): Record<string, unknown> {
  return toDbInsertPayload(data);
}

function flattenSupabaseQuanNhanRow(row: Record<string, unknown>): Employee {
  const id = String(row.id ?? '');
  const hoTen = (row.ho_va_ten as string | null) ?? '';
  const chucVuId =
    row.id_chuc_vu != null && row.id_chuc_vu !== '' ? String(row.id_chuc_vu) : null;

  return {
    id,
    ho_ten: hoTen,
    so_dien_thoai: (row.so_dien_thoai as string | null) ?? '',
    chuc_vu_id: chucVuId,
    ten_chuc_vu: undefined,
    anh_dai_dien: (row.avatar as string | null) || undefined,
    tg_tao: (row.tg_tao as string | null) ?? null,
    tg_cap_nhat: (row.tg_cap_nhat as string | null) ?? null,
  };
}

function flattenSupabaseRow(row: Record<string, unknown>): Employee {
  if ('ho_va_ten' in row) {
    return flattenSupabaseQuanNhanRow(row);
  }
  const { chuc_vu: _rel, ...rest } = row;
  return {
    ...(rest as unknown as Employee),
    ten_chuc_vu: (rest as { ten_chuc_vu?: string }).ten_chuc_vu,
  };
}

function chucVuNameById(positions: Position[]): Map<string, string | undefined> {
  return new Map(
    positions.map((p) => {
      const label = (p.ten_chuc_vu ?? p.chuc_vu ?? '').trim();
      return [p.id, label || undefined];
    }),
  );
}

/** Gắn `ten_chuc_vu` theo `chuc_vu_id` — không cần FK PostgREST. */
async function enrichWithChucVu(employees: Employee[]): Promise<Employee[]> {
  if (employees.length === 0) return employees;
  const positions = await getPositions();
  const names = chucVuNameById(positions);
  return employees.map((e) => ({
    ...e,
    ten_chuc_vu: e.chuc_vu_id ? names.get(e.chuc_vu_id) ?? e.ten_chuc_vu : e.ten_chuc_vu,
  }));
}

export const getEmployees = async (): Promise<Employee[]> => {
  const list = await repo.getAll(
    isSupabase() ? { orderBy: 'id', ascending: false } : undefined,
  );
  const flattened: Employee[] = isSupabase()
    ? (list as unknown as Record<string, unknown>[]).map(flattenSupabaseRow)
    : (list as Employee[]);
  return enrichWithChucVu(flattened);
};

export const getEmployeeById = async (id: string): Promise<Employee | undefined> => {
  const row = await repo.getById(id);
  if (!row) return undefined;
  const flat: Employee = isSupabase()
    ? flattenSupabaseRow(row as unknown as Record<string, unknown>)
    : (row as Employee);
  const [out] = await enrichWithChucVu([flat]);
  return out;
};

export const createEmployee = async (data: EmployeeFormValues): Promise<Employee> => {
  if (isSupabase()) {
    const inserted = await repo.insert(
      toDbInsertPayload(data) as Omit<Employee, 'id'> & { id?: string },
    );
    const flat = flattenSupabaseRow(inserted as unknown as Record<string, unknown>);
    const [out] = await enrichWithChucVu([flat]);
    return out!;
  }

  const id = `EMP-${Date.now()}`;
  const inserted = await repo.insert({
    id,
    ho_ten: data.ho_ten.trim(),
    so_dien_thoai: data.so_dien_thoai.trim(),
    chuc_vu_id: data.chuc_vu_id?.trim() ? data.chuc_vu_id.trim() : null,
    anh_dai_dien: data.anh_dai_dien?.trim() || getAvatarUrl(data.ho_ten.trim()) || null,
  } as Omit<Employee, 'id'> & { id: string });
  const [out] = await enrichWithChucVu([inserted as Employee]);
  return out!;
};

export const updateEmployee = async (id: string, data: EmployeeFormValues): Promise<Employee> => {
  const existing = await repo.getById(id);
  if (!existing) throw new Error(i18n.t('employee.service.notFound'));

  if (isSupabase()) {
    const updated = await repo.update(id, toDbUpdatePayload(data) as Partial<Employee>);
    const flat = flattenSupabaseRow(updated as unknown as Record<string, unknown>);
    const [out] = await enrichWithChucVu([flat]);
    return out!;
  }

  const updated = await repo.update(id, {
    ho_ten: data.ho_ten.trim(),
    so_dien_thoai: data.so_dien_thoai.trim(),
    chuc_vu_id: data.chuc_vu_id?.trim() ? data.chuc_vu_id.trim() : null,
    anh_dai_dien: data.anh_dai_dien?.trim() || null,
  });
  const [out] = await enrichWithChucVu([updated as Employee]);
  return out!;
};

/** Bảng danh_sach_quan_nhan không có trạng thái — trên Supabase không cập nhật DB. */
export const updateEmployeeStatus = async (_ids: string[], _status: TrangThaiNhanVien): Promise<void> => {
  if (isSupabase()) return;
};

function bulkFieldsToDbPatch(fields: Record<string, unknown>): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  if ('chuc_vu_id' in fields) {
    const v = fields.chuc_vu_id;
    patch.id_chuc_vu = v != null && String(v).trim() !== '' ? String(v) : null;
  }
  if ('ho_ten' in fields) patch.ho_va_ten = fields.ho_ten;
  if ('so_dien_thoai' in fields) patch.so_dien_thoai = fields.so_dien_thoai;
  if ('anh_dai_dien' in fields) patch.avatar = fields.anh_dai_dien;
  return patch;
}

export const bulkUpdateEmployees = async (ids: string[], fields: Record<string, unknown>): Promise<void> => {
  if (isSupabase()) {
    const patch = bulkFieldsToDbPatch(fields);
    if (Object.keys(patch).length === 0) return;
    for (const id of ids) {
      const existing = await repo.getById(id);
      if (!existing) continue;
      await repo.update(id, patch as Partial<Employee>);
    }
    return;
  }

  const positions = await getPositions();
  for (const id of ids) {
    const existing = await repo.getById(id);
    if (!existing) continue;
    const updated: Employee = {
      ...existing,
      ...(fields.ho_ten != null ? { ho_ten: String(fields.ho_ten) } : {}),
      ...(fields.so_dien_thoai != null ? { so_dien_thoai: String(fields.so_dien_thoai) } : {}),
      ...(fields.chuc_vu_id != null
        ? {
            chuc_vu_id: String(fields.chuc_vu_id),
            ten_chuc_vu: positions.find((p) => p.id === String(fields.chuc_vu_id))?.ten_chuc_vu,
          }
        : {}),
      ...(fields.anh_dai_dien != null ? { anh_dai_dien: String(fields.anh_dai_dien) } : {}),
    };
    await repo.update(id, updated);
  }
};

export const deleteEmployee = async (id: string): Promise<void> => {
  await repo.remove([id]);
};

export const deleteEmployees = async (ids: string[]): Promise<void> => {
  await repo.remove(ids);
};

export const restoreEmployees = async (employees: Employee[]): Promise<void> => {
  for (const emp of employees) {
    const { ten_chuc_vu: _tenChucVu, ...row } = emp;
    if (isSupabase()) {
      await repo.insert({
        id: emp.id,
        ho_va_ten: emp.ho_ten,
        so_dien_thoai: emp.so_dien_thoai || null,
        avatar: emp.anh_dai_dien ?? null,
        id_chuc_vu: emp.chuc_vu_id?.trim() ? emp.chuc_vu_id : null,
      } as Omit<Employee, 'id'> & { id?: string });
      continue;
    }
    await repo.insert(row as Omit<Employee, 'id'> & { id: string });
  }
};
