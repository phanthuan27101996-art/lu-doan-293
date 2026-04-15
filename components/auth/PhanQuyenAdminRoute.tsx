import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useStore';
import { useEmployees } from '@/features/he-thong/nhan-vien/hooks/use-nhan-vien';
import { findEmployeeByAuthIdentity } from '@/lib/phone-auth';
import { isPhanQuyenAdmin } from '@/lib/phan-quyen-access';
import { isSupabase } from '@/lib/data/config';

const GateFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[40vh]" aria-busy="true" aria-label="Đang kiểm tra quyền">
    <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
  </div>
);

/**
 * Cờ `is_admin` trên quân nhân (không phải mã `quan_tri` trong ma trận module).
 * Chỉ khi `is_admin === true` mới vào Phân quyền / Danh sách quân nhân / Chức vụ (Supabase).
 */
export const PhanQuyenAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const { data: employees, isLoading, isFetching } = useEmployees();
  const loading = isSupabase() && (isLoading || (isFetching && !employees));

  if (!isSupabase()) return <>{children}</>;
  if (loading) return <GateFallback />;

  const emp = findEmployeeByAuthIdentity(user, employees ?? []);
  if (!isPhanQuyenAdmin(emp)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
