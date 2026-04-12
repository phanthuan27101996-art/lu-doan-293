import { useEffect } from 'react';
import { useAuthStore } from '@/store/useStore';
import { isSupabase } from '@/lib/data/config';
import { getAuthService } from '@/lib/supabase/auth';

/**
 * Đồng bộ Zustand với phiên Supabase sau khi persist hydrate:
 * - Xóa trạng thái đăng nhập giả nếu không còn session JWT.
 * - Lắng nghe SIGNED_OUT / TOKEN_REFRESHED.
 * Không chặn UI công khai (đăng nhập / đăng ký); `ProtectedRoute` chờ `_authBound`.
 */
export function SupabaseAuthBinding() {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const setAuthBound = useAuthStore((s) => s.setAuthBound);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isSupabase()) {
      setAuthBound(true);
      return;
    }
    let cancelled = false;
    void getAuthService()
      .getSession()
      .then((session) => {
        if (cancelled) return;
        if (session) login(session.user);
        else logout();
      })
      .catch(() => {
        if (!cancelled) logout();
      })
      .finally(() => {
        if (!cancelled) setAuthBound(true);
      });
    return () => {
      cancelled = true;
    };
  }, [hasHydrated, login, logout, setAuthBound]);

  useEffect(() => {
    if (!isSupabase() || !hasHydrated) return () => {};
    return getAuthService().onAuthStateChange((session) => {
      if (session) login(session.user);
      else logout();
    });
  }, [hasHydrated, login, logout]);

  return null;
}
