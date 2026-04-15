import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ConfirmDialog from './components/shared/ConfirmDialog';
import PwaRegister from './components/shared/PwaRegister';

import Home from './pages/Home';
import AppModulePlaceholder from './pages/AppModulePlaceholder';

import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PhanQuyenAdminRoute } from './components/auth/PhanQuyenAdminRoute';
import { SupabaseAuthBinding } from './components/auth/SupabaseAuthBinding';
import {
  ThemeSynchronizer,
  MetadataSynchronizer,
  LanguageSynchronizer,
  useResolvedTheme,
} from './lib/app-sync';

/** Lazy-loaded feature pages — code-split để giảm chunk ban đầu */
const EmployeePage = lazy(() => import('./features/he-thong/nhan-vien/index'));
const SecurityPage = lazy(() => import('./features/he-thong/phan-quyen/index'));
const PositionPage = lazy(() => import('./features/he-thong/chuc-vu/index'));
const EmployeeProfilePreviewPage = lazy(() => import('./features/he-thong/nhan-vien/EmployeeProfilePreviewPage'));
const TruyenThongPage = lazy(() => import('./features/truyen-thong/TruyenThongPage'));
const TrangTinPage = lazy(() => import('./features/trang-tin/index'));
const TaiLieuPage = lazy(() => import('./features/tai-lieu/index'));
const CongVanPage = lazy(() => import('./features/cong-van/index'));
const MoiTuanMotDieuLuatPage = lazy(() => import('./features/moi-tuan-mot-dieu-luat/index'));
const MoiNgayMotLoiDayBacHoPage = lazy(() => import('./features/moi-ngay-mot-loi-day-bac-ho/index'));
const ThiTracNghiemPage = lazy(() => import('./features/thi-trac-nghiem/index'));
const DoanCoSoPage = lazy(() => import('./features/doan-co-so/index'));
const KhoNhacPage = lazy(() => import('./features/kho-nhac/index'));
const KhoVideoPage = lazy(() => import('./features/kho-video/index'));
const GopYPage = lazy(() => import('./features/gop-y/index'));

/** Chỉ spinner primary, không chữ – tránh "đang tải 2 lần" với strip trong trang */
const PageFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[40vh]" aria-busy="true" aria-label="Đang mở trang">
    <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
  </div>
);

const WithPageSuspense = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageFallback />}>{children}</Suspense>
);

const App = () => {
  const resolvedTheme = useResolvedTheme();
  return (
    <>
      <ThemeSynchronizer />
      <MetadataSynchronizer />
      <LanguageSynchronizer />
      <ConfirmDialog />
      <PwaRegister />
      <Toaster position="top-right" richColors theme={resolvedTheme} />
      <SupabaseAuthBinding />
      <Routes>
        <Route path="/dang-nhap" element={<Login />} />
        <Route path="/dang-ky" element={<Register />} />
        <Route path="/login" element={<Navigate to="/dang-nhap" replace />} />
        <Route path="/register" element={<Navigate to="/dang-ky" replace />} />
        <Route path="/ho-so-nhan-vien/:id" element={<ProtectedRoute><WithPageSuspense><EmployeeProfilePreviewPage /></WithPageSuspense></ProtectedRoute>} />
        <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<PageFallback />}>
                  <Routes>
                    <Route path="/" element={<Home />} />

                    {/* Module một cấp */}
                    <Route path="/truyen-thong" element={<WithPageSuspense><TruyenThongPage /></WithPageSuspense>} />
                    <Route path="/trang-tin" element={<WithPageSuspense><TrangTinPage /></WithPageSuspense>} />
                    <Route path="/tai-lieu" element={<WithPageSuspense><TaiLieuPage /></WithPageSuspense>} />
                    <Route path="/cong-van" element={<WithPageSuspense><CongVanPage /></WithPageSuspense>} />
                    <Route path="/moi-tuan-mot-dieu-luat" element={<WithPageSuspense><MoiTuanMotDieuLuatPage /></WithPageSuspense>} />
                    <Route path="/moi-ngay-mot-loi-day-bac-ho" element={<WithPageSuspense><MoiNgayMotLoiDayBacHoPage /></WithPageSuspense>} />
                    <Route path="/thi-trac-nghiem" element={<WithPageSuspense><ThiTracNghiemPage /></WithPageSuspense>} />
                    <Route path="/doan-co-so" element={<WithPageSuspense><DoanCoSoPage /></WithPageSuspense>} />
                    <Route path="/kho-video" element={<WithPageSuspense><KhoVideoPage /></WithPageSuspense>} />
                    <Route path="/kho-nhac" element={<WithPageSuspense><KhoNhacPage /></WithPageSuspense>} />
                    <Route path="/gop-y" element={<WithPageSuspense><GopYPage /></WithPageSuspense>} />

                    <Route
                      path="/danh-sach-quan-nhan"
                      element={
                        <WithPageSuspense>
                          <PhanQuyenAdminRoute>
                            <EmployeePage />
                          </PhanQuyenAdminRoute>
                        </WithPageSuspense>
                      }
                    />
                    <Route
                      path="/chuc-vu"
                      element={
                        <WithPageSuspense>
                          <PhanQuyenAdminRoute>
                            <PositionPage />
                          </PhanQuyenAdminRoute>
                        </WithPageSuspense>
                      }
                    />
                    <Route
                      path="/phan-quyen"
                      element={
                        <WithPageSuspense>
                          <PhanQuyenAdminRoute>
                            <SecurityPage />
                          </PhanQuyenAdminRoute>
                        </WithPageSuspense>
                      }
                    />

                    {/* Chuyển hướng từ URL cũ */}
                    <Route path="/he-thong" element={<Navigate to="/" replace />} />
                    <Route path="/he-thong/nhan-vien" element={<Navigate to="/danh-sach-quan-nhan" replace />} />
                    <Route path="/he-thong/chuc-vu" element={<Navigate to="/chuc-vu" replace />} />
                    <Route path="/he-thong/phan-quyen" element={<Navigate to="/phan-quyen" replace />} />
                    <Route path="/nhan-vien" element={<Navigate to="/danh-sach-quan-nhan" replace />} />
                    <Route path="/thong-tin-cong-ty" element={<Navigate to="/" replace />} />
                    <Route path="/he-thong/thong-tin-cong-ty" element={<Navigate to="/" replace />} />
                    <Route path="/phong-ban" element={<Navigate to="/" replace />} />
                    <Route path="/chuc-nang-nhiem-vu" element={<Navigate to="/" replace />} />
                    <Route path="/cap-bac" element={<Navigate to="/" replace />} />
                    <Route path="/chi-nhanh" element={<Navigate to="/" replace />} />
                    <Route path="/sao-luu" element={<Navigate to="/" replace />} />
                    <Route path="/thiet-bi-dang-nhap" element={<Navigate to="/" replace />} />

                    {/* === CHUNG === */}
                    <Route path="/tro-ly-ai" element={<Navigate to="/" replace />} />
                    <Route path="/thong-tin-ban-quyen" element={<Navigate to="/" replace />} />
                    <Route path="/ho-so" element={<Profile />} />
                    <Route path="/cai-dat" element={<Settings />} />
                    <Route path="/thong-bao" element={<Navigate to="/" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
