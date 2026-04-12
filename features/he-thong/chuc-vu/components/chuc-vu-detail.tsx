import React from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2, Briefcase, Calendar, Clock } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import { Position } from '../core/types';
import { formatDate, formatDateTimeShort } from '../../../../lib/utils';
import GenericDrawer, { DRAWER_WIDTH_DETAIL } from '../../../../components/shared/GenericDrawer';
import DetailSection from '../../../../components/shared/DetailSection';
import DetailField from '../../../../components/shared/DetailField';
import DetailFieldGrid from '../../../../components/shared/DetailFieldGrid';
import { BTN_CLOSE, BTN_EDIT, BTN_DELETE } from '../../../../lib/button-labels';

interface Props {
  data: Position;
  onClose: () => void;
  onEdit: (item: Position) => void;
  onDelete: (id: string) => void;
}

const PositionDetail: React.FC<Props> = ({ data, onClose, onEdit, onDelete }) => {
  const { t } = useTranslation();

  const renderFooter = (
    <div className="flex items-center justify-between w-full">
      <Button variant="ghost" onClick={onClose} className="text-muted-foreground hover:text-foreground border border-border">
        {BTN_CLOSE()}
      </Button>
      <div className="flex items-center gap-3">
        <Button
          onClick={() => {
            onEdit(data);
            onClose();
          }}
          className="bg-primary text-white shadow-lg hover:bg-primary/90"
        >
          <Edit size={16} className="mr-2" /> {BTN_EDIT()}
        </Button>
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
      </div>
    </div>
  );

  return (
    <GenericDrawer
      title={t('position.detail.title')}
      subtitle={data.ma_chuc_vu}
      icon={<Briefcase size={18} />}
      onClose={onClose}
      footer={renderFooter}
      maxWidthClass={DRAWER_WIDTH_DETAIL}
    >
      <div className="space-y-5">
        <div className="bg-card p-4 rounded-xl border border-border/50 shadow-sm flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white shadow-primary/20 shadow-lg shrink-0">
            <Briefcase size={24} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-foreground leading-tight truncate">{data.ten_chuc_vu}</h2>
            <p className="text-body-sm text-muted-foreground font-mono mt-0.5">id: {data.id}</p>
          </div>
        </div>

        <DetailSection title={t('position.detail.basicInfo')} icon={<Briefcase size={14} />} variant="primary">
          <DetailFieldGrid>
            <DetailField label={t('position.form.name')} value={data.chuc_vu ?? ''} icon={<Briefcase size={12} />} />
          </DetailFieldGrid>
        </DetailSection>

        <DetailSection title={t('position.detail.systemInfo')} icon={<Clock size={14} />} variant="primary">
          <DetailFieldGrid>
            <DetailField label={t('position.detail.createdAt')} value={formatDateTimeShort(data.tg_tao)} icon={<Calendar size={12} />} />
            <DetailField label={t('position.detail.updated')} value={formatDate(data.tg_cap_nhat)} icon={<Calendar size={12} />} />
          </DetailFieldGrid>
        </DetailSection>
      </div>
    </GenericDrawer>
  );
};

export default PositionDetail;
