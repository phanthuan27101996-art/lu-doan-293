import React from 'react';
import { useTranslation } from 'react-i18next';
import { Newspaper, ExternalLink, Edit, Trash2, UserRound, ImageIcon } from 'lucide-react';
import type { TrangTin } from '../core/types';
import GenericDrawer, { DRAWER_WIDTH_DETAIL } from '../../../components/shared/GenericDrawer';
import DetailSection from '../../../components/shared/DetailSection';
import DetailField from '../../../components/shared/DetailField';
import DetailFieldGrid from '../../../components/shared/DetailFieldGrid';
import Button from '../../../components/ui/Button';
import { formatDate } from '@/lib/utils';
import { BTN_CLOSE, BTN_EDIT, BTN_DELETE } from '../../../lib/button-labels';

interface Props {
  data: TrangTin;
  onClose: () => void;
  onEdit: (item: TrangTin) => void;
  onDelete: (id: string) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

const TrangTinDetail: React.FC<Props> = ({
  data,
  onClose,
  onEdit,
  onDelete,
  canUpdate = true,
  canDelete = true,
}) => {
  const { t } = useTranslation();

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
      title={t('trangTin.detail.title')}
      subtitle={`id ${data.id}`}
      icon={<Newspaper size={18} />}
      onClose={onClose}
      footer={renderFooter}
      maxWidthClass={DRAWER_WIDTH_DETAIL}
    >
      <div className="space-y-5">
        <div className="bg-card p-4 rounded-xl border border-border/50 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">{formatDate(data.ngay_dang)}</p>
          <h2 className="text-base font-bold text-foreground leading-snug">{data.tieu_de}</h2>
        </div>

        {/*
          Thứ tự hiển thị khớp cột bảng: ngay_dang & tieu_de (header), mo_ta_ngan, hinh_anh, link, id_nguoi_tao
        */}
        <DetailSection title={t('trangTin.detail.moTa')} icon={<Newspaper size={14} />} variant="primary">
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{data.mo_ta_ngan}</p>
        </DetailSection>

        {(data.hinh_anh?.length ?? 0) > 0 && (
          <DetailSection title={t('trangTin.detail.images')} icon={<ImageIcon size={14} />}>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 list-none p-0 m-0">
              {data.hinh_anh.map((src, idx) => (
                <li key={`${src}-${idx}`} className="aspect-video rounded-lg border border-border overflow-hidden bg-muted/30">
                  <img
                    src={src}
                    alt={`${data.tieu_de} — ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </li>
              ))}
            </ul>
          </DetailSection>
        )}

        <DetailSection title={t('trangTin.detail.basicInfo')} icon={<Newspaper size={14} />}>
          <DetailFieldGrid>
            {data.link ? (
              <div className="col-span-full">
                <p className="text-xs font-medium text-muted-foreground mb-1">{t('trangTin.detail.link')}</p>
                <a
                  href={data.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline break-all"
                >
                  <ExternalLink size={14} aria-hidden />
                  {t('trangTin.detail.openLink')}
                </a>
              </div>
            ) : (
              <DetailField label={t('trangTin.detail.link')} value="—" />
            )}
            <DetailField
              label={t('trangTin.detail.nguoiTao')}
              value={
                data.id_nguoi_tao
                  ? `${data.ten_nguoi_tao ?? '—'} (id ${data.id_nguoi_tao})`
                  : '—'
              }
              icon={<UserRound size={12} />}
            />
          </DetailFieldGrid>
        </DetailSection>
      </div>
    </GenericDrawer>
  );
};

export default TrangTinDetail;
