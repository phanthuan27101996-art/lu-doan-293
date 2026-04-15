import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Edit, Trash2, ListOrdered, StickyNote, Calendar } from 'lucide-react';
import type { LuuDoanTruong } from '../core/luu-doan-truong-types';
import { resolveTruyenThongImageSrc } from '../utils/resolve-truyen-thong-image';
import GenericDrawer, { DRAWER_WIDTH_DETAIL } from '../../../components/shared/GenericDrawer';
import DetailSection from '../../../components/shared/DetailSection';
import DetailField from '../../../components/shared/DetailField';
import DetailFieldGrid from '../../../components/shared/DetailFieldGrid';
import Button from '../../../components/ui/Button';
import { BTN_CLOSE, BTN_EDIT, BTN_DELETE } from '../../../lib/button-labels';
import { formatDateTimeShort } from '../../../lib/utils';

interface Props {
  data: LuuDoanTruong;
  onClose: () => void;
  onEdit: (item: LuuDoanTruong) => void;
  onDelete: (id: string) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

const LuuDoanTruongDetail: React.FC<Props> = ({
  data,
  onClose,
  onEdit,
  onDelete,
  canUpdate = true,
  canDelete = true,
}) => {
  const { t } = useTranslation();
  const img = resolveTruyenThongImageSrc(data.hinh_anh);
  const period = (data.thoi_gian_dam_nhiem ?? '').trim() || '—';
  const roleLine = (data.chuc_vu_cuoi_cung ?? '').trim() || '—';

  const renderFooter = (
    <div className="flex w-full items-center justify-between">
      <Button variant="ghost" onClick={onClose} className="border border-border text-muted-foreground hover:text-foreground">
        {BTN_CLOSE()}
      </Button>
      {canUpdate || canDelete ? (
        <div className="flex items-center gap-3">
          {canUpdate ? (
            <Button onClick={() => onEdit(data)} className="bg-primary text-white shadow-lg hover:bg-primary/90">
              <Edit size={16} className="mr-2" aria-hidden />
              {BTN_EDIT()}
            </Button>
          ) : null}
          {canDelete ? (
            <Button
              variant="ghost"
              onClick={() => {
                onDelete(data.id);
                onClose();
              }}
              className="border border-rose-200 text-rose-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-800 dark:text-rose-400 dark:hover:border-rose-700 dark:hover:bg-rose-950/50"
            >
              <Trash2 size={16} className="mr-2" aria-hidden />
              {BTN_DELETE()}
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
      title={t('truyenThong.luuDoanTruong.detail.title')}
      subtitle={`TT ${data.thu_tu} · id ${data.id}`}
      icon={<Star size={18} aria-hidden />}
      onClose={onClose}
      footer={renderFooter}
      maxWidthClass={DRAWER_WIDTH_DETAIL}
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="mx-auto w-full max-w-[14rem] shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted/30 shadow-inner sm:mx-0">
              <img
                src={img}
                alt={data.ho_va_ten}
                className="aspect-[3/4] w-full object-cover object-top"
                loading="lazy"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs text-muted-foreground">{period}</p>
              <h2 className="text-base font-bold leading-snug text-foreground">{data.ho_va_ten}</h2>
              <p className="mt-1 text-sm text-primary/90">{roleLine}</p>
            </div>
          </div>
        </div>

        <DetailSection title={t('truyenThong.luuDoanTruong.detail.basic')} icon={<ListOrdered size={14} aria-hidden />} variant="primary">
          <DetailFieldGrid>
            <DetailField label={t('truyenThong.luuDoanTruong.field.hoVaTen')} value={data.ho_va_ten} />
            <DetailField
              label={t('truyenThong.luuDoanTruong.field.namSinh')}
              value={data.nam_sinh != null ? String(data.nam_sinh) : '—'}
            />
            <DetailField label={t('truyenThong.luuDoanTruong.field.thoiGianDamNhiem')} value={period} />
            <DetailField label={t('truyenThong.luuDoanTruong.field.chucVuCuoiCung')} value={roleLine} />
            <DetailField label={t('truyenThong.luuDoanTruong.field.capBac')} value={data.cap_bac_hien_tai?.trim() ? data.cap_bac_hien_tai : '—'} />
          </DetailFieldGrid>
        </DetailSection>

        {(data.ghi_chu ?? '').trim() ? (
          <DetailSection title={t('truyenThong.luuDoanTruong.field.ghiChu')} icon={<StickyNote size={14} aria-hidden />} variant="muted">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{data.ghi_chu}</p>
          </DetailSection>
        ) : null}

        <DetailSection title={t('truyenThong.luuDoanTruong.detail.meta')} icon={<Calendar size={14} aria-hidden />} variant="muted">
          <DetailFieldGrid>
            <DetailField
              label={t('truyenThong.field.updatedAt')}
              value={data.tg_cap_nhat ? formatDateTimeShort(data.tg_cap_nhat) : '—'}
            />
          </DetailFieldGrid>
        </DetailSection>
      </div>
    </GenericDrawer>
  );
};

export default LuuDoanTruongDetail;
