import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldOff } from 'lucide-react';

/** Hiển thị khi user không có quyền xem module. */
const ModulePermissionDenied: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] px-4 text-center" role="status">
      <ShieldOff className="h-12 w-12 text-muted-foreground mb-3" aria-hidden />
      <p className="text-sm font-medium text-foreground max-w-md">{t('common.noPermissionView')}</p>
    </div>
  );
};

export default ModulePermissionDenied;
