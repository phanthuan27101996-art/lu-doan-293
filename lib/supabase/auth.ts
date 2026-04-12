import { getSupabase } from '@/lib/supabase/client';
import { isSupabase } from '@/lib/data/config';
import { normalizeVnPhone, phoneFromAuthEmail, phoneToSupabaseEmail } from '@/lib/phone-auth';
import { AUTH_DEMO_ACCOUNT_PHONE } from '@/lib/registered-phones';
import { createEmployee } from '@/features/he-thong/nhan-vien/services/nhan-vien-service';
import { getAvatarUrl } from '@/lib/utils';
import i18n from '@/lib/i18n';
import type { User } from '@/types';

const MOCK_AUTH_PASSWORD =
  (import.meta.env.VITE_MOCK_AUTH_PASSWORD as string | undefined) ?? '123456';

export interface SignInCredentials {
  phone: string;
  password: string;
}

export interface SignUpCredentials {
  phone: string;
  password: string;
  fullName: string;
  chucVuId: string;
}

export interface AuthSession {
  user: User;
}

export interface AuthService {
  signIn(credentials: SignInCredentials): Promise<{ user: User } | { error: string }>;
  signUp(credentials: SignUpCredentials): Promise<{ user?: User; error?: string }>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  onAuthStateChange(callback: (session: AuthSession | null) => void): () => void;
}

/** Chuẩn hóa thông báo lỗi Supabase Auth (tránh hiểu nhầm "sai email" khi thực tế là SĐT/mật khẩu hoặc chưa xác nhận). */
function mapSupabaseAuthError(raw: string): string {
  const m = raw.toLowerCase();
  if (
    m.includes('invalid login credentials') ||
    m.includes('invalid email or password') ||
    m.includes('invalid credentials')
  ) {
    return i18n.t('page.login.supabaseInvalidLogin');
  }
  if (m.includes('email not confirmed') || m.includes('email_not_confirmed')) {
    return i18n.t('page.login.supabaseEmailNotConfirmed');
  }
  if (m.includes('invalid email') && !m.includes('password')) {
    return i18n.t('page.login.supabaseInvalidEmail');
  }
  return raw;
}

function mapSupabaseUserToAppUser(supabaseUser: {
  id: string;
  email?: string;
  phone?: string;
  user_metadata?: Record<string, unknown>;
}): User {
  const meta = supabaseUser.user_metadata ?? {};
  let phone: string | undefined = supabaseUser.phone
    ? normalizeVnPhone(supabaseUser.phone)
    : undefined;
  if (!phone && supabaseUser.email) {
    const fromEmail = phoneFromAuthEmail(supabaseUser.email);
    if (fromEmail) phone = fromEmail;
  }
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? undefined,
    phone,
    full_name: (meta.full_name as string) ?? undefined,
    avatar_url: (meta.avatar_url as string) ?? undefined,
    role: (meta.role as 'admin' | 'user') ?? 'user',
    created_at: new Date().toISOString(),
    id_phong_ban: (meta.id_phong_ban as string) ?? undefined,
    id_chuc_vu: (meta.id_chuc_vu as string[] | null) ?? undefined,
  };
}

const mockUser: User = {
  id: 'emp-000',
  phone: AUTH_DEMO_ACCOUNT_PHONE,
  email: 'admin@5fedu.com',
  full_name: 'Lê Minh Công',
  role: 'admin',
  created_at: new Date().toISOString(),
  id_phong_ban: 'dep-7',
};

const mockAuthService: AuthService = {
  async signIn({ phone, password }) {
    await new Promise((r) => setTimeout(r, 600));
    if (password.length < 6) return { error: i18n.t('page.login.passwordMin') };
    const normalized = normalizeVnPhone(phone);
    const demo = normalizeVnPhone(AUTH_DEMO_ACCOUNT_PHONE);
    if (normalized !== demo || password !== MOCK_AUTH_PASSWORD) {
      return { error: i18n.t('page.login.invalidCredentials') };
    }
    return {
      user: {
        ...mockUser,
        phone: demo,
        email: mockUser.email,
        full_name: mockUser.full_name,
      },
    };
  },

  async signUp(credentials: SignUpCredentials) {
    if (credentials.password.length < 6) return { error: 'Mật khẩu phải có ít nhất 6 ký tự' };
    try {
      await new Promise((r) => setTimeout(r, 600));
      const normalized = normalizeVnPhone(credentials.phone);
      const avatar = getAvatarUrl(credentials.fullName.trim());
      await createEmployee({
        ho_ten: credentials.fullName.trim(),
        so_dien_thoai: normalized,
        chuc_vu_id: credentials.chucVuId.trim(),
        anh_dai_dien: avatar,
      });
      return {};
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Đăng ký thất bại';
      return { error: msg };
    }
  },

  async signOut() {
    await new Promise((r) => setTimeout(r, 200));
  },

  async getSession() {
    return null;
  },

  onAuthStateChange() {
    return () => {};
  },
};

const supabaseAuthService: AuthService = {
  async signIn(credentials) {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Supabase chưa được cấu hình' };
    const { phone, password } = credentials;
    const email = phoneToSupabaseEmail(phone);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: mapSupabaseAuthError(error.message) };
    if (!data.user) return { error: i18n.t('page.login.supabaseInvalidLogin') };
    return { user: mapSupabaseUserToAppUser(data.user) };
  },

  async signUp({ phone, password, fullName, chucVuId }) {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Supabase chưa được cấu hình' };
    const normalized = normalizeVnPhone(phone);
    const email = phoneToSupabaseEmail(phone);
    const avatarUrl = getAvatarUrl(fullName.trim());
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone: normalized,
          full_name: fullName.trim(),
          id_chuc_vu: chucVuId.trim(),
          avatar_url: avatarUrl,
        },
      },
    });
    if (error) return { error: mapSupabaseAuthError(error.message) };
    if (data.user) return { user: mapSupabaseUserToAppUser(data.user) };
    return {};
  },

  async signOut() {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
  },

  async getSession() {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    return { user: mapSupabaseUserToAppUser(session.user) };
  },

  onAuthStateChange(callback) {
    const supabase = getSupabase();
    if (!supabase) return () => {};
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) callback({ user: mapSupabaseUserToAppUser(session.user) });
      else callback(null);
    });
    return () => subscription.unsubscribe();
  },
};

export function getAuthService(): AuthService {
  return isSupabase() ? supabaseAuthService : mockAuthService;
}
