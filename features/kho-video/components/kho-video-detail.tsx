import React from 'react';
import { useTranslation } from 'react-i18next';
import { Video, ExternalLink, Edit, Trash2, UserRound } from 'lucide-react';
import type { KhoVideo } from '../core/types';
import GenericDrawer, { DRAWER_WIDTH_DETAIL } from '../../../components/shared/GenericDrawer';
import DetailSection from '../../../components/shared/DetailSection';
import DetailField from '../../../components/shared/DetailField';
import DetailFieldGrid from '../../../components/shared/DetailFieldGrid';
import Button from '../../../components/ui/Button';
import { formatDate } from '@/lib/utils';
import { BTN_CLOSE, BTN_EDIT, BTN_DELETE } from '../../../lib/button-labels';
import { getYoutubeEmbedSrc, isDirectVideoUrl, parseYoutubeVideoId } from '../utils/youtube';

interface Props {
  data: KhoVideo;
  onClose: () => void;
  onEdit: (item: KhoVideo) => void;
  onDelete: (id: string) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

const KhoVideoDetail: React.FC<Props> = ({
  data,
  onClose,
  onEdit,
  onDelete,
  canUpdate = true,
  canDelete = true,
}) => {
  const { t } = useTranslation();
  const ytId = parseYoutubeVideoId(data.link);
  const direct = data.link ? isDirectVideoUrl(data.link) : false;

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
      title={t('khoVideo.dm.detail.title')}
      subtitle={`id ${data.id}`}
      icon={<Video size={18} />}
      onClose={onClose}
      footer={renderFooter}
      maxWidthClass={DRAWER_WIDTH_DETAIL}
    >
      <div className="space-y-5">
        <div className="bg-card p-4 rounded-xl border border-border/50 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">{data.bo_suu_tap || '—'}</p>
          <h2 className="text-base font-bold text-foreground leading-snug">{data.ten_video}</h2>
        </div>

        {data.link && ytId ? (
          <div className="rounded-xl overflow-hidden border border-border bg-black/5 shadow-sm">
            <div className="aspect-video w-full">
              <iframe
                title={`${data.ten_video} — ${t('khoVideo.dm.detail.embedPlayer')}`}
                src={getYoutubeEmbedSrc(ytId)}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        ) : data.link && direct ? (
          <div className="rounded-xl overflow-hidden border border-border bg-black shadow-sm">
            <video src={data.link} controls className="w-full max-h-[min(70vh,520px)]" playsInline />
          </div>
        ) : null}

        {data.ghi_chu?.trim() ? (
          <DetailSection title={t('khoVideo.dm.detail.ghiChu')} icon={<Video size={14} />}>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{data.ghi_chu}</p>
          </DetailSection>
        ) : null}

        <DetailSection title={t('khoVideo.dm.detail.meta')} icon={<Video size={14} />}>
          <DetailFieldGrid>
            {data.link ? (
              <div className="col-span-full">
                <p className="text-xs font-medium text-muted-foreground mb-1">{t('khoVideo.dm.form.link')}</p>
                <a
                  href={data.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline break-all"
                >
                  <ExternalLink size={14} aria-hidden />
                  {data.link}
                </a>
              </div>
            ) : (
              <DetailField label={t('khoVideo.dm.form.link')} value="—" />
            )}
            <DetailField
              label={t('khoVideo.dm.detail.nguoiTao')}
              value={
                data.id_nguoi_tao
                  ? `${data.ten_nguoi_tao ?? '—'} (id ${data.id_nguoi_tao})`
                  : '—'
              }
              icon={<UserRound size={12} />}
            />
            <DetailField label={t('khoVideo.dm.detail.createdAt')} value={data.tg_tao ? formatDate(data.tg_tao) : '—'} />
            <DetailField label={t('khoVideo.dm.detail.updatedAt')} value={data.tg_cap_nhat ? formatDate(data.tg_cap_nhat) : '—'} />
          </DetailFieldGrid>
        </DetailSection>
      </div>
    </GenericDrawer>
  );
};

export default KhoVideoDetail;
