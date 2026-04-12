import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '../types';

const AUTH_REMEMBER_KEY = 'auth-remember';

/** Storage cho auth: nếu "Ghi nhớ đăng nhập" bật thì dùng localStorage, tắt thì dùng sessionStorage (đóng tab là thoát). Không có key thì mặc định dùng localStorage. */
function getAuthStorage(): { getItem: (name: string) => string | null; setItem: (name: string, value: string) => void; removeItem: (name: string) => void } | null {
  const remembered = typeof window !== 'undefined' && localStorage.getItem(AUTH_REMEMBER_KEY) !== 'false';
  const storage = typeof window !== 'undefined' ? (remembered ? localStorage : sessionStorage) : null;
  if (!storage) return null;
  return {
    getItem: (name: string) => storage.getItem(name),
    setItem: (name: string, value: string) => { storage.setItem(name, value); },
    removeItem: (name: string) => {
      localStorage.removeItem(name);
      sessionStorage.removeItem(name);
    },
  };
}

/** Storage adapter cho zustand persist: phải trả về object { state, version }, lưu dạng JSON. */
function createAuthPersistStorage() {
  const base = getAuthStorage();
  if (!base) return null;
  return {
    getItem: (name: string) => {
      const raw = base.getItem(name);
      return raw ? JSON.parse(raw) : null;
    },
    setItem: (name: string, value: { state: unknown; version: number }) => {
      base.setItem(name, JSON.stringify(value));
    },
    removeItem: (name: string) => base.removeItem(name),
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,
      _authBound: false,
      login: (user: User) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      setAuthBound: (bound: boolean) => set({ _authBound: bound }),
    }),
    {
      name: 'auth-storage',
      version: 4,
      storage: createAuthPersistStorage() ?? undefined,
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ _hasHydrated: true });
      },
      migrate: (persisted: any, version: number) => {
        if (!persisted || typeof persisted !== 'object') return persisted as AuthState;
        const state = persisted as AuthState;
        /** v4: buộc đăng nhập lại — không tin persist khi chưa xác thực JWT Supabase */
        if (version < 4) {
          return { ...state, user: null, isAuthenticated: false };
        }
        return state;
      },
    }
  )
);

interface ThemeState {
  primaryColor: 'blue' | 'violet' | 'emerald' | 'rose' | 'amber' | 'orange' | 'cyan' | 'slate';
  colorScheme: 'light' | 'dark' | 'system';
  setTheme: (settings: Partial<Omit<ThemeState, 'setTheme'>>) => void;
}

interface UIState extends ThemeState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  skipRedirectConfirmation: boolean;
  setSkipRedirectConfirmation: (skip: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      primaryColor: 'blue',
      colorScheme: 'light',
      setTheme: (settings) => {
        set((state) => ({ ...state, ...settings }));
      },

      skipRedirectConfirmation: false,
      setSkipRedirectConfirmation: (skip) => set({ skipRedirectConfirmation: skip }),
    }),
    {
      name: 'ui-storage',
      version: 4,
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        primaryColor: state.primaryColor,
        colorScheme: state.colorScheme,
        skipRedirectConfirmation: state.skipRedirectConfirmation,
      }),
      migrate: (persisted: any, version: number) => {
        if (!persisted || typeof persisted !== 'object') return persisted as UIState;
        const state = persisted as Record<string, any>;
        if (version < 2) {
          delete state.language;
        }
        if (version < 3) {
          delete state.fontFamily;
          delete state.fontSize;
          delete state.timezone;
        }
        if (version < 4) {
          delete state.companyInfo;
          delete state.setCompanyInfo;
        }
        return state as UIState;
      },
    }
  )
);
