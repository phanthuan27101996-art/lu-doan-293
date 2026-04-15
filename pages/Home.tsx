import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import ModuleDashboardLayout from '../components/dashboard/ModuleDashboardLayout';
import type { ModuleGroup } from '../components/dashboard/ModuleDashboardLayout';
import type { ModuleItem } from '../components/dashboard/SubModuleCard';
import { filterSidebarMenuByModuleView, getSidebarMenuForUser } from '../lib/phan-quyen-access';
import { useAuthStore } from '../store/useStore';
import { useEmployees } from '../features/he-thong/nhan-vien/hooks/use-nhan-vien';
import { findEmployeeByAuthIdentity } from '../lib/phone-auth';
import { getRoles } from '../features/he-thong/phan-quyen/services/phan-quyen-service';
import { PHAN_QUYEN_ROLES_QUERY_KEY } from '../lib/module-permissions';
import { isSupabase } from '../lib/data/config';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: employees = [], isPending: employeesPending } = useEmployees();
  const currentEmployee = useMemo(
    () => findEmployeeByAuthIdentity(user, employees) ?? null,
    [user, employees],
  );

  const { data: phanQuyenRoles, isPending: phanQuyenRolesPending } = useQuery({
    queryKey: PHAN_QUYEN_ROLES_QUERY_KEY,
    queryFn: getRoles,
    enabled: isSupabase(),
    staleTime: 1000 * 60 * 5,
  });

  const functionItems: ModuleItem[] = useMemo(() => {
    const base = getSidebarMenuForUser(currentEmployee);
    const filtered = filterSidebarMenuByModuleView(
      base,
      currentEmployee,
      phanQuyenRoles,
      phanQuyenRolesPending,
      employeesPending,
    );
    return filtered
      .filter((m) => m.path !== '/')
      .map((m) => ({
        title: t(m.nameKey),
        description: m.descriptionKey ? t(m.descriptionKey) : '',
        icon: m.icon,
        color: m.listColor ?? 'bg-slate-500',
        action: () => navigate(m.path),
      }));
  }, [t, navigate, currentEmployee, phanQuyenRoles, phanQuyenRolesPending, employeesPending]);

  const functionGroups: ModuleGroup[] = useMemo(
    () => [
      {
        groupTitle: t('page.home.modulesGroupTitle'),
        items: functionItems,
      },
    ],
    [t, functionItems]
  );

  return (
    <div className="pb-10 pt-2 shrink-0">
      <ModuleDashboardLayout groups={functionGroups} embedded />
    </div>
  );
};

export default Home;
