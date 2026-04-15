import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Phone, Briefcase, Edit, Trash2, Clock, Calendar, Printer } from 'lucide-react';
import { Employee } from '../core/types';
import GenericDrawer, { DRAWER_WIDTH_DETAIL } from '../../../../components/shared/GenericDrawer';
import DetailSection from '../../../../components/shared/DetailSection';
import DetailField from '../../../../components/shared/DetailField';
import DetailFieldGrid from '../../../../components/shared/DetailFieldGrid';
import DetailToolbar, { DetailToolbarAction } from '../../../../components/shared/DetailToolbar';
import Button from '../../../../components/ui/Button';
import { formatDate, formatDateTimeShort, getAvatarUrl } from '@/lib/utils';
import { BTN_CLOSE, BTN_EDIT, BTN_DELETE } from '../../../../lib/button-labels';

interface Props {
  data: Employee;
  onClose: () => void;
  onEdit: (item: Employee) => void;
  onDelete: (id: string) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

const EmployeeDetail: React.FC<Props> = ({
  data,
  onClose,
  onEdit,
  onDelete,
  canUpdate = true,
  canDelete = true,
}) => {
  const { t } = useTranslation();

  const toolbarActions: DetailToolbarAction[] = [
    {
      label: t('employee.detail.print'),
      icon: <Printer />,
      onClick: () =>
        window.open(
          `${window.location.origin}/ho-so-nhan-vien/${encodeURIComponent(data.id)}`,
          '_blank',
          'noopener,noreferrer',
        ),
      variant: 'secondary',
    },
    {
      label: t('employee.detail.callPhone'),
      icon: <Phone />,
      onClick: () => {
        window.location.href = `tel:${data.so_dien_thoai}`;
      },
      variant: 'success',
    },
  ];

  const renderFooter = (
    <div className="flex items-center justify-between w-full">
      <Button variant="ghost" onClick={onClose} className="text-muted-foreground hover:text-foreground border border-border">
        {BTN_CLOSE()}
      </Button>
      {canUpdate || canDelete ? (
        <div className="flex items-center gap-3">
          {canUpdate ? (
            <Button onClick={() => onEdit(data)} className="bg-primary text-white shadow-lg hover:bg-primary/90">
              <Edit size={16} className="mr-2" /> {BTN_EDIT()}
            </Button>
          ) : null}
          {canDelete ? (
            <Button
              variant="ghost"
              onClick={() => {
                onDelete(data.id);
                onClose();
              }}
              className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/50 dark:text-rose-400 border border-rose-200 hover:border-rose-300 dark:border-rose-800 dark:hover:border-rose-700"
            >
              <Trash2 size={16} className="mr-2" /> {BTN_DELETE()}
            </Button>
          ) : null}
        </div>
      ) : (
        <div />
      )}
    </div>
  );

  return (
    <GenericDrawer
      title={t('employee.detail.title')}
      subtitle={`id ${data.id}`}
      icon={<User size={18} />}
      onClose={onClose}
      footer={renderFooter}
      maxWidthClass={DRAWER_WIDTH_DETAIL}
    >
      <div className="space-y-5">
        <div className="bg-card p-4 rounded-xl border border-border/50 shadow-sm flex items-center gap-4">
          <img
            src={data.anh_dai_dien || getAvatarUrl(data.ho_ten)}
            alt={data.ho_ten}
            className="h-16 w-16 rounded-xl object-cover border border-border shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-foreground leading-tight truncate">{data.ho_ten}</h2>
            <p className="text-body-sm text-muted-foreground mt-0.5">{data.so_dien_thoai}</p>
          </div>
        </div>

        <DetailToolbar actions={toolbarActions} className="bg-card rounded-xl border border-border" />

        <DetailSection title={t('employee.detail.basicInfo')} icon={<User size={14} />} variant="primary">
          <DetailFieldGrid>
            <DetailField label={t('employee.name')} value={data.ho_ten} icon={<User size={12} />} />
            <DetailField label={t('employee.phone')} value={data.so_dien_thoai} icon={<Phone size={12} />} />
            <DetailField label={t('employee.position')} value={data.ten_chuc_vu ?? '—'} icon={<Briefcase size={12} />} />
          </DetailFieldGrid>
        </DetailSection>

        <DetailSection title={t('employee.detail.systemInfo')} icon={<Clock size={14} />} variant="primary">
          <DetailFieldGrid>
            <DetailField label={t('employee.store.createdCol')} value={formatDateTimeShort(data.tg_tao)} icon={<Calendar size={12} />} />
            <DetailField
              label={t('employee.store.updatedCol')}
              value={data.tg_cap_nhat ? formatDate(data.tg_cap_nhat) : '—'}
              icon={<Calendar size={12} />}
            />
          </DetailFieldGrid>
        </DetailSection>
      </div>
    </GenericDrawer>
  );
};

export default EmployeeDetail;
