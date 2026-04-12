/**
 * Chuẩn hóa & kiểm tra SĐT Việt Nam (đăng nhập / đăng ký).
 * Di động chuẩn: 10 chữ số (0 + 9 chữ số đầu mạng + thuê bao), hiển thị 0xx xxx xxxx.
 */

/** Sau khi chuẩn hóa: đúng 10 chữ số, bắt đầu bằng 0 */
export const VN_PHONE_REGEX = /^0\d{9}$/;

/**
 * Hậu tố email khi đăng nhập Supabase bằng SĐT (local-part = chuỗi số đã chuẩn hóa).
 * Biến env rỗng / chỉ khoảng trắng → dùng mặc định (tránh email dạng `096...@` gây lỗi "invalid email").
 */
const DEFAULT_AUTH_PHONE_EMAIL_SUFFIX = '@gmail.com';

export function getAuthPhoneEmailSuffix(): string {
  const raw = (import.meta.env.VITE_AUTH_PHONE_EMAIL_SUFFIX as string | undefined)?.trim();
  const s = raw && raw.length > 0 ? raw : DEFAULT_AUTH_PHONE_EMAIL_SUFFIX;
  return s.startsWith('@') ? s : `@${s}`;
}

/** Phần domain (không có @), dùng so khớp với email user. */
function getAuthPhoneEmailDomain(): string {
  return getAuthPhoneEmailSuffix().slice(1).toLowerCase();
}

/** Số ô nhập (10 chữ số theo VN_PHONE_REGEX). */
export const VN_PHONE_DIGIT_SLOTS = 10;

/** Ghép SĐT chuẩn hóa thành email dùng cho `signInWithPassword({ email })`. */
export function phoneToSupabaseEmail(rawPhone: string): string {
  const n = normalizeVnPhone(rawPhone);
  return `${n}${getAuthPhoneEmailSuffix()}`.toLowerCase();
}

/** Lấy SĐT từ email đăng nhập kiểu số@domain (nếu khớp cấu hình). */
export function phoneFromAuthEmail(email: string | undefined | null): string | undefined {
  if (!email || !email.includes('@')) return undefined;
  const [local, domainPart] = email.split('@');
  if (!local || !/^\d+$/.test(local)) return undefined;
  if (domainPart.toLowerCase() !== getAuthPhoneEmailDomain()) return undefined;
  const n = normalizeVnPhone(local);
  return isValidVnPhone(n) ? n : undefined;
}

/** Chuẩn hóa để so sánh / validate: bỏ khoảng trắng, +84/84 → 0, chỉ giữ chữ số */
export function normalizeVnPhone(raw: string): string {
  let s = raw.trim().replace(/[\s.-]/g, '');
  if (s.startsWith('+84')) s = '0' + s.slice(3);
  else if (s.startsWith('84') && s.length >= 11) s = '0' + s.slice(2);
  s = s.replace(/\D/g, '');
  if (s.length === 9 && s.startsWith('9')) s = `0${s}`;
  return s;
}

export function isValidVnPhone(raw: string): boolean {
  return VN_PHONE_REGEX.test(normalizeVnPhone(raw));
}

/** Ghép quân nhân đang đăng nhập: khớp SĐT (chuẩn hóa VN). */
export function findEmployeeByAuthIdentity<T extends { so_dien_thoai: string }>(
  user: { phone?: string; email?: string } | null | undefined,
  employees: T[],
): T | undefined {
  if (!user) return undefined;
  if (user.phone) {
    const n = normalizeVnPhone(user.phone);
    const byPhone = employees.find((e) => normalizeVnPhone(e.so_dien_thoai) === n);
    if (byPhone) return byPhone;
  }
  return undefined;
}
