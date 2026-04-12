import { normalizeVnPhone } from './phone-auth';
import { isMock } from './data/config';

/** Số gắn tài khoản demo đăng nhập (chỉ chế độ mock — không áp dụng khi dùng Supabase). */
export const AUTH_DEMO_ACCOUNT_PHONE = '0901234567';

const STORAGE_KEY = 'auth-registered-phone-numbers';

function parseStored(): Set<string> {
  if (typeof localStorage === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.map((p) => normalizeVnPhone(String(p))).filter(Boolean));
  } catch {
    return new Set();
  }
}

/** Số đã đăng ký qua app (chế độ mock / bổ sung client). */
export function getRegisteredPhones(): Set<string> {
  return parseStored();
}

export function addRegisteredPhone(rawPhone: string): void {
  if (typeof localStorage === 'undefined') return;
  const next = parseStored();
  next.add(normalizeVnPhone(rawPhone));
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
}

/**
 * Số đã được dùng khi đăng ký:
 * - **Mock**: số demo, danh sách localStorage (đăng ký mock cũ), hoặc trùng quân nhân.
 * - **Supabase**: chỉ trùng `so_dien_thoai` trong `danh_sach_quan_nhan` (auth trùng do API signUp báo).
 */
export function isPhoneTakenForRegister(
  rawPhone: string,
  employees: readonly { so_dien_thoai: string }[],
): boolean {
  const n = normalizeVnPhone(rawPhone);
  if (!n) return false;
  if (isMock()) {
    if (n === AUTH_DEMO_ACCOUNT_PHONE) return true;
    if (getRegisteredPhones().has(n)) return true;
  }
  return employees.some((e) => normalizeVnPhone(e.so_dien_thoai) === n);
}
