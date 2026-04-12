export interface User {
  id: string;
  email?: string;
  /** Số điện thoại đăng nhập (ưu tiên khớp với nhân viên). */
  phone?: string;
  full_name?: string;
  avatar_url?: string;
  role: 'admin' | 'user';
  created_at: string;
  /** Id phòng ban (để tự chọn phòng trong Chức năng nhiệm vụ, v.v.) */
  id_phong_ban?: string | null;
  /** Id chức vụ (để lọc khóa mở đăng ký theo phân quyền đào tạo) */
  id_chuc_vu?: string[] | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  /** Chỉ dùng nội bộ: true khi đã đọc xong state từ localStorage/sessionStorage (tránh redirect về login khi reload). */
  _hasHydrated?: boolean;
  /**
   * Supabase: true sau lần đầu gọi getSession() đồng bộ với JWT.
   * Mock: true ngay sau hydrate. ProtectedRoute chờ cờ này để không vào app bằng persist giả.
   */
  _authBound: boolean;
  login: (user: User) => void;
  logout: () => void;
  setAuthBound: (bound: boolean) => void;
}

export interface ProfileFormValues {
  fullName: string;
  email: string;
  bio?: string;
}

export * from './crud';