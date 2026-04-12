import { normalizeVnPhone } from '@/lib/phone-auth';
import type { User } from '@/types';
import type { Employee } from '@/features/he-thong/nhan-vien/core/types';

/**
 * Lấy `id` bản ghi `danh_sach_quan_nhan` của user đang thao tác:
 * khớp SĐT đăng nhập (`User.phone`) với `so_dien_thoai` trong danh sách quân nhân.
 */
export function resolveQuanNhanIdForUser(user: User | null, employees: Employee[]): string | null {
  if (!user?.phone) return null;
  const n = normalizeVnPhone(user.phone);
  if (!n || n.length < 10) return null;
  const match = employees.find((e) => normalizeVnPhone(e.so_dien_thoai || '') === n);
  return match?.id ?? null;
}
