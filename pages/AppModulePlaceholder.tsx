import React from 'react';
import { useTranslation } from 'react-i18next';
import Section from '../components/shared/Section';

export interface AppModulePlaceholderProps {
  /** i18n key for the module title (e.g. nav.module.truyenThong) */
  titleKey: string;
}

/**
 * Trang module một cấp — nội dung nghiệp vụ sẽ gắn sau; hiện tiêu đề và trạng thái đang phát triển.
 */
const AppModulePlaceholder: React.FC<AppModulePlaceholderProps> = ({ titleKey }) => {
  const { t } = useTranslation();
  return (
    <div className="pb-8 pt-2 max-w-3xl">
      <h1 className="text-xl font-semibold text-foreground tracking-tight mb-2">{t(titleKey)}</h1>
      <Section title={t('page.modulePlaceholder.sectionTitle')} variant="muted">
        <p className="text-sm text-muted-foreground leading-relaxed">{t('page.modulePlaceholder.body')}</p>
      </Section>
    </div>
  );
};

export default AppModulePlaceholder;
