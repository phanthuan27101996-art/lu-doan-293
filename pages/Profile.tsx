import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SingleImageInput from '../components/ui/SingleImageInput';
import DashboardToolbar from '../components/shared/DashboardToolbar';
import DetailToolbar from '../components/shared/DetailToolbar';
import DetailSection from '../components/shared/DetailSection';
import DetailField from '../components/shared/DetailField';
import DetailFieldGrid from '../components/shared/DetailFieldGrid';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, User as UserIcon, Mail, Shield, Calendar,
  Camera, Key, X,
  Phone, Briefcase, Clock, FileText,
} from 'lucide-react';
import { formatDate, getAvatarUrl } from '../lib/utils';
import { canEditProfile } from '../lib/profile-permissions';
import type { Employee } from '../features/he-thong/nhan-vien/core/types';
import { findEmployeeByAuthIdentity } from '../lib/phone-auth';
import { useEmployees } from '../features/he-thong/nhan-vien/hooks/use-nhan-vien';
import { useUpdateEmployee } from '../features/he-thong/nhan-vien/hooks/use-nhan-vien';
import { employeeToFormValues } from '../features/he-thong/nhan-vien/utils/employee-to-form';

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, login } = useAuthStore();
  const { data: employees = [] } = useEmployees();
  const updateEmployeeMutation = useUpdateEmployee();

  const currentEmployee = useMemo(
    () => findEmployeeByAuthIdentity(user, employees) ?? null,
    [employees, user?.email, user?.phone],
  );

  const displayData: Employee = useMemo(() => {
    if (currentEmployee) return currentEmployee;
    return {
      id: '',
      ho_ten: user?.full_name ?? '',
      so_dien_thoai: user?.phone ?? '',
      chuc_vu_id: null,
      anh_dai_dien: user?.avatar_url ?? null,
    };
  }, [currentEmployee, user?.full_name, user?.phone, user?.avatar_url]);

  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const editable = canEditProfile(user);

  const displayName = currentEmployee?.ho_ten ?? user?.full_name ?? '';
  const displayEmail = user?.email ?? '';
  const displayAccountPhone = currentEmployee?.so_dien_thoai || user?.phone || '';
  const displayAvatar = currentEmployee?.anh_dai_dien ?? user?.avatar_url ?? null;
  const displayJoinedAt = currentEmployee?.tg_tao ?? user?.created_at;

  const handleAvatarSave = async () => {
    if (!user) return;
    if (avatarPreview === null) return;
    if (currentEmployee) {
      try {
        const payload = employeeToFormValues(currentEmployee);
        await updateEmployeeMutation.mutateAsync({
          id: currentEmployee.id,
          data: { ...payload, anh_dai_dien: avatarPreview },
        });
        login({ ...user, avatar_url: avatarPreview });
        toast.success(t('page.profile.avatarUpdateSuccess'));
      } catch {
        toast.error(t('page.profile.userNotFound'));
      }
    } else {
      login({ ...user, avatar_url: avatarPreview });
      toast.success(t('page.profile.avatarUpdateSuccess'));
    }
    setAvatarModalOpen(false);
    setAvatarPreview(null);
  };

  const roleLabel = user?.role === 'admin' ? t('nav.roleAdmin') : t('page.profile.roleUser');
  const avatarAlt = displayName
    ? t('page.profile.avatarAlt', { name: displayName })
    : t('page.profile.avatarAltFallback');
  const emptyText = t('page.profile.emptyField');

  const toolbarActions = useMemo(() => {
    if (!editable) return [];
    return [
      {
        label: t('page.profile.changeAvatar'),
        icon: <Camera />,
        onClick: () => {
          setAvatarPreview(displayAvatar);
          setAvatarModalOpen(true);
        },
        variant: 'info' as const,
      },
      {
        label: t('page.profile.changePassword'),
        icon: <Key />,
        onClick: () => setPasswordModalOpen(true),
        variant: 'secondary' as const,
      },
    ];
  }, [editable, displayAvatar, t]);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">{t('page.profile.userNotFound')}</p>
      </div>
    );
  }

  const data = displayData;

  return (
    <div className="flex flex-col min-h-0">
      <DashboardToolbar
        onBack={() => navigate(-1)}
        leadingContent={
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <UserIcon className="h-4 w-4" />
            </div>
            <h1 className="text-sm font-semibold text-foreground truncate">
              {t('page.profile.title')}
            </h1>
          </div>
        }
      />
      <div className="px-4 sm:px-6 space-y-4 sm:space-y-6 pb-10 pt-3 md:pt-4 max-w-full">
      {/* View-only banner */}
      {!editable && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-amber-800 dark:text-amber-200"
          role="status"
        >
          {t('page.profile.viewOnlyBanner')}
        </motion.div>
      )}

      {/* ===== Main layout: sidebar + content ===== */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-stretch lg:items-start w-full">
        {/* --- Sidebar: compact horizontal on mobile, vertical card on desktop --- */}
        <motion.aside
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full lg:w-72 lg:shrink-0 lg:sticky lg:top-6"
        >
          <div className="rounded-xl border border-border bg-card shadow-sm relative overflow-hidden">
            {/* Cover gradient – shorter on mobile */}
            <div className="h-16 sm:h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" aria-hidden="true" />

            {/* Avatar + identity: horizontal on mobile, centered on desktop */}
            <div className="px-4 sm:px-6 -mt-8 sm:-mt-12">
              {/* Mobile: flex row | Desktop: text-center stacked */}
              <div className="flex items-end gap-3 sm:block sm:text-center">
                <div className="relative shrink-0 sm:inline-block">
                  <img
                    src={avatarPreview ?? displayAvatar ?? getAvatarUrl(displayName, 128)}
                    alt={avatarAlt}
                    className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-[3px] sm:border-4 border-card shadow-lg object-cover"
                  />
                  <span
                    className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-500 border-2 border-card rounded-full"
                    title={t('page.profile.activeStatus')}
                    aria-hidden="true"
                  />
                </div>
                <div className="pb-1 sm:pb-0 sm:mt-3 min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-foreground leading-tight truncate">{displayName}</h3>
                  <span className="inline-block mt-1 sm:mt-1.5 bg-primary/10 text-primary px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-semibold">
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick info – 2-col grid on mobile, stacked on desktop */}
            <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-5">
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-2.5 sm:gap-3 text-xs sm:text-sm">
                {displayAccountPhone ? (
                  <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground min-w-0">
                    <Phone size={14} className="shrink-0" />
                    <span className="truncate">{displayAccountPhone}</span>
                  </div>
                ) : null}
                {displayEmail ? (
                  <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground min-w-0">
                    <Mail size={14} className="shrink-0" />
                    <span className="truncate">{displayEmail}</span>
                  </div>
                ) : null}
                {displayData.ten_chuc_vu && (
                  <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground">
                    <Briefcase size={14} className="shrink-0" />
                    <span className="truncate">{displayData.ten_chuc_vu}</span>
                  </div>
                )}
                {displayJoinedAt ? (
                  <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground">
                    <Calendar size={14} className="shrink-0" />
                    <span className="truncate">
                      {t('page.profile.joinedAt')} {formatDate(String(displayJoinedAt))}
                    </span>
                  </div>
                ) : null}
                <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground">
                  <Shield size={14} className="shrink-0" />
                  <span>{t('page.profile.verified')}</span>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            {toolbarActions.length > 0 && (
              <div className="border-t border-border">
                <DetailToolbar
                  actions={toolbarActions}
                  columns={2}
                  className="py-3 sm:py-4"
                />
              </div>
            )}
          </div>
        </motion.aside>

        {/* --- Content: sections xếp dọc, full width mobile --- */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="w-full min-w-0 flex-1 space-y-4 sm:space-y-5"
        >
          <DetailSection title={t('employee.detail.personalInfo')} icon={<UserIcon size={14} />} variant="primary">
            <DetailFieldGrid cols={2}>
              <DetailField label={t('employee.detail.fullName')} value={data.ho_ten} icon={<UserIcon size={12} />} emptyText={emptyText} />
              <DetailField label={t('employee.detail.phone')} value={data.so_dien_thoai} icon={<Phone size={12} />} emptyText={emptyText} />
              <DetailField label={t('employee.detail.position')} value={data.ten_chuc_vu} icon={<Briefcase size={12} />} emptyText={emptyText} />
              <DetailField
                label={t('employee.detail.recordId')}
                value={data.id || undefined}
                icon={<FileText size={12} />}
                emptyText={emptyText}
              />
            </DetailFieldGrid>
          </DetailSection>

          {(data.tg_tao || data.tg_cap_nhat) && (
            <DetailSection title={t('employee.detail.systemInfo')} icon={<Clock size={14} />} variant="primary">
              <DetailFieldGrid cols={2}>
                <DetailField
                  label={t('employee.store.createdCol')}
                  value={data.tg_tao ? formatDate(data.tg_tao) : undefined}
                  icon={<Calendar size={12} />}
                  emptyText={emptyText}
                />
                <DetailField
                  label={t('employee.store.updatedCol')}
                  value={data.tg_cap_nhat ? formatDate(data.tg_cap_nhat) : undefined}
                  icon={<Calendar size={12} />}
                  emptyText={emptyText}
                />
              </DetailFieldGrid>
            </DetailSection>
          )}
        </motion.div>
      </div>
      </div>

      {/* ===== Modal: Đổi ảnh đại diện ===== */}
      <AnimatePresence>
        {avatarModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setAvatarModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-card rounded-2xl shadow-xl border border-border w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">{t('page.profile.avatarModalTitle')}</h3>
                <button
                  type="button"
                  onClick={() => setAvatarModalOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={t('common.close')}
                >
                  <X size={18} />
                </button>
              </div>
              <SingleImageInput
                value={avatarPreview ?? displayAvatar ?? null}
                onChange={setAvatarPreview}
                shape="circle"
                aspectRatio="1/1"
                placeholder={t('page.profile.changeAvatar')}
                hint={t('page.profile.avatarModalHint')}
                maxSizeMB={2}
              />
              <div className="flex gap-2 mt-6">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setAvatarModalOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button className="flex-1 rounded-xl" onClick={handleAvatarSave} isLoading={updateEmployeeMutation.isPending}>
                  <Save size={16} className="mr-2" /> {t('common.save')}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===== Modal: Đổi mật khẩu (Coming soon) ===== */}
      <AnimatePresence>
        {passwordModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setPasswordModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-card rounded-2xl shadow-xl border border-border w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">{t('page.profile.changePasswordTitle')}</h3>
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={t('common.close')}
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{t('page.profile.changePasswordDesc')}</p>
              <div className="space-y-4">
                <Input label={t('page.profile.currentPassword')} type="password" placeholder={t('page.profile.passwordPlaceholder')} disabled />
                <Input label={t('page.profile.newPassword')} type="password" placeholder={t('page.profile.passwordPlaceholder')} disabled />
                <Input label={t('page.profile.confirmPassword')} type="password" placeholder={t('page.profile.passwordPlaceholder')} disabled />
              </div>
              <div className="mt-4 p-3 rounded-xl bg-muted/50 text-center">
                <p className="text-xs font-medium text-muted-foreground">{t('page.profile.comingSoon')}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t('page.profile.comingSoonDesc')}</p>
              </div>
              <div className="flex justify-end mt-6">
                <Button variant="outline" className="rounded-xl" onClick={() => setPasswordModalOpen(false)}>
                  {t('common.close')}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
