import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Quote, ExternalLink, Edit, Trash2, UserRound, Paperclip, X } from 'lucide-react';
import type { MoiNgayMotLoiDayBacHo } from '../core/types';
import GenericDrawer, { DRAWER_WIDTH_DETAIL } from '../../../components/shared/GenericDrawer';
import DetailSection from '../../../components/shared/DetailSection';
import DetailField from '../../../components/shared/DetailField';
import DetailFieldGrid from '../../../components/shared/DetailFieldGrid';
import Button from '../../../components/ui/Button';
import { formatDate } from '@/lib/utils';
import { BTN_CLOSE, BTN_EDIT, BTN_DELETE } from '../../../lib/button-labels';

interface Props {
  data: MoiNgayMotLoiDayBacHo;
  onClose: () => void;
  onEdit: (item: MoiNgayMotLoiDayBacHo) => void;
  onDelete: (id: string) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

const MoiNgayMotLoiDayBacHoDetail: React.FC<Props> = ({
  data,
  onClose,
  onEdit,
  onDelete,
  canUpdate = true,
  canDelete = true,
}) => {
  const { t } = useTranslation();
  const [imgBroken, setImgBroken] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setLightboxOpen(false);
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [lightboxOpen]);

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
    <>
    <GenericDrawer
      title={t('moiNgayMotLoiDayBacHo.dm.detail.title')}
      subtitle={`${data.ngay ? formatDate(data.ngay) : '—'} · id ${data.id}`}
      icon={<Quote size={18} />}
      onClose={onClose}
      footer={renderFooter}
      maxWidthClass={DRAWER_WIDTH_DETAIL}
    >
      <div className="space-y-5">
        <div className="bg-card p-4 rounded-xl border border-border/50 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">{data.ngay ? formatDate(data.ngay) : '—'}</p>
          <h2 className="text-base font-bold text-foreground leading-snug">{data.ten_tai_lieu}</h2>
        </div>

        <DetailSection title={t('moiNgayMotLoiDayBacHo.dm.detail.basicInfo')} icon={<Quote size={14} />} variant="primary">
          <DetailFieldGrid>
            <DetailField label={t('moiNgayMotLoiDayBacHo.dm.form.ngay')} value={data.ngay ? formatDate(data.ngay) : '—'} />
            {data.hinh_anh && !imgBroken ? (
              <div className="col-span-full">
                <p className="text-xs font-medium text-muted-foreground mb-2">{t('moiNgayMotLoiDayBacHo.dm.form.hinhAnh')}</p>
                <button
                  type="button"
                  className="block p-0 border-0 bg-transparent rounded-lg cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => setLightboxOpen(true)}
                  aria-label={t('moiNgayMotLoiDayBacHo.dm.detail.viewImageFull')}
                >
                  {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- onError: fallback khi ảnh lỗi */}
                  <img
                    src={data.hinh_anh}
                    alt=""
                    className="max-h-48 rounded-lg border border-border object-contain pointer-events-none"
                    onError={() => setImgBroken(true)}
                  />
                </button>
              </div>
            ) : data.hinh_anh ? (
              <div className="col-span-full">
                <p className="text-xs font-medium text-muted-foreground mb-1">{t('moiNgayMotLoiDayBacHo.dm.form.hinhAnh')}</p>
                <a
                  href={data.hinh_anh}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline break-all"
                >
                  <ExternalLink size={14} aria-hidden />
                  {data.hinh_anh}
                </a>
              </div>
            ) : (
              <DetailField label={t('moiNgayMotLoiDayBacHo.dm.form.hinhAnh')} value="—" />
            )}
            {data.tep_dinh_kem ? (
              <div className="col-span-full">
                <p className="text-xs font-medium text-muted-foreground mb-1">{t('moiNgayMotLoiDayBacHo.dm.form.tepDinhKem')}</p>
                <a
                  href={data.tep_dinh_kem}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline break-all"
                >
                  <Paperclip size={14} aria-hidden />
                  {data.tep_dinh_kem}
                </a>
              </div>
            ) : (
              <DetailField label={t('moiNgayMotLoiDayBacHo.dm.form.tepDinhKem')} value="—" />
            )}
            <DetailField
              label={t('moiNgayMotLoiDayBacHo.dm.detail.nguoiTao')}
              value={
                data.id_nguoi_tao
                  ? `${data.ten_nguoi_tao ?? '—'} (id ${data.id_nguoi_tao})`
                  : '—'
              }
              icon={<UserRound size={12} />}
            />
            <DetailField label={t('moiNgayMotLoiDayBacHo.dm.detail.createdAt')} value={data.tg_tao ? formatDate(data.tg_tao) : '—'} />
            <DetailField label={t('moiNgayMotLoiDayBacHo.dm.detail.updatedAt')} value={data.tg_cap_nhat ? formatDate(data.tg_cap_nhat) : '—'} />
          </DetailFieldGrid>
        </DetailSection>
      </div>
    </GenericDrawer>

    {lightboxOpen && data.hinh_anh && !imgBroken
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t('moiNgayMotLoiDayBacHo.dm.detail.imageLightboxTitle')}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 sm:p-8"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              className="absolute top-3 right-3 z-[102] rounded-full bg-background/95 p-2 text-foreground shadow-lg border border-border hover:bg-accent transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxOpen(false);
              }}
              aria-label={t('common.close')}
            >
              <X size={20} aria-hidden />
            </button>
            <img
              src={data.hinh_anh}
              alt=""
              className="max-w-full max-h-[min(90vh,100%)] w-auto h-auto object-contain rounded-md shadow-2xl select-none"
              onClick={(e) => e.stopPropagation()}
              draggable={false}
            />
          </div>,
          document.body,
        )
      : null}
    </>
  );
};

export default MoiNgayMotLoiDayBacHoDetail;
