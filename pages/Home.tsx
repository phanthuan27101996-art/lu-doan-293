import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ModuleDashboardLayout from '../components/dashboard/ModuleDashboardLayout';
import type { ModuleGroup } from '../components/dashboard/ModuleDashboardLayout';
import type { ModuleItem } from '../components/dashboard/SubModuleCard';
import { SIDEBAR_MENU } from '../lib/sidebar-menu';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const functionItems: ModuleItem[] = useMemo(
    () =>
      SIDEBAR_MENU.filter((m) => m.path !== '/').map((m) => ({
        title: t(m.nameKey),
        description: m.descriptionKey ? t(m.descriptionKey) : '',
        icon: m.icon,
        color: m.listColor ?? 'bg-slate-500',
        action: () => navigate(m.path),
      })),
    [t, navigate]
  );

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
