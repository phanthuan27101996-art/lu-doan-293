import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Puzzle } from 'lucide-react';
import DashboardToolbar from '../shared/DashboardToolbar';
import SubModuleCard, { ModuleItem } from './SubModuleCard';
import ComingSoonLayout from '../placeholder/ComingSoonLayout';

export interface ModuleGroup {
  groupTitle: string;
  items: ModuleItem[];
}

/**
 * Layout dashboard cho danh sách nhóm module (toolbar: nút Back).
 * Khi groups rỗng và không embedded: placeholder "Sắp ra mắt".
 */
interface ModuleDashboardLayoutProps {
  groups: ModuleGroup[];
  /** Đường dẫn quay lại (mặc định "/") */
  backTo?: string;
  /** Khi true: ẩn toolbar (dùng khi nhúng trong Trang chủ) */
  embedded?: boolean;
  /** Tên submenu khi groups rỗng – dùng cho placeholder "Sắp ra mắt" */
  submenuTitle?: string;
  /** Icon submenu khi groups rỗng */
  submenuIcon?: LucideIcon;
}

const ModuleDashboardLayout: React.FC<ModuleDashboardLayoutProps> = ({
  groups,
  backTo = '/',
  embedded = false,
  submenuTitle,
  submenuIcon: SubmenuIcon,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (groups.length === 0 && !embedded) {
    const title = submenuTitle ?? t('page.placeholder.title');
    const description = submenuTitle
      ? t('page.placeholder.descriptionWithModule', { name: submenuTitle })
      : t('page.placeholder.description');
    return (
      <ComingSoonLayout
        title={title}
        description={description}
        icon={SubmenuIcon ?? Puzzle}
        backLabel={t('page.placeholder.backToHome')}
        backTo={backTo}
        titlePrimary={!!submenuTitle}
      />
    );
  }

  return (
    <div className={embedded ? 'pb-0 pt-0 shrink-0' : 'pb-10 pt-2 shrink-0'}>
      {!embedded && (
        <DashboardToolbar
          className="-mx-1.5 -mt-2 md:-mx-2 md:-mt-2 mb-4"
          onBack={() => navigate(backTo)}
        />
      )}

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6 md:space-y-8"
      >
        {groups.map((group, idx) => (
          <div key={idx} className="space-y-4 md:space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full bg-primary/80" aria-hidden />
              <h3 className="text-sm font-semibold text-primary">{group.groupTitle}</h3>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {group.items.map((item, itemIdx) => (
                <SubModuleCard
                  key={`${group.groupTitle}-${itemIdx}-${item.title}`}
                  {...item}
                />
              ))}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default ModuleDashboardLayout;
