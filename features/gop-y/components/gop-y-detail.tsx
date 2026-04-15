import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageSquarePlus,
  Edit,
  Trash2,
  UserRound,
  ImageIcon,
  MessageSquare,
  ArrowRightLeft,
} from 'lucide-react';
import type { GopY, GopYTrangThai } from '../core/types';
import GenericDrawer, { DRAWER_WIDTH_DETAIL } from '../../../components/shared/GenericDrawer';
import DetailSection from '../../../components/shared/DetailSection';
import DetailField from '../../../components/shared/DetailField';
import DetailFieldGrid from '../../../components/shared/DetailFieldGrid';
import DetailToolbar, { type DetailToolbarAction } from '../../../components/shared/DetailToolbar';
import Button from '../../../components/ui/Button';
import Textarea from '../../../components/ui/Textarea';
import { formatDate } from '@/lib/utils';
import { BTN_CLOSE, BTN_EDIT, BTN_DELETE, BTN_CANCEL, BTN_SAVE } from '../../../lib/button-labels';
import { DIALOG_SIZE } from '../../../lib/dialog-sizes';
import { cn } from '../../../lib/utils';
import { usePatchGopY, useUpdateGopYReply } from '../hooks/use-gop-y';

interface Props {
  data: GopY;
  onClose: () => void;
  onEdit: (item: GopY) => void;
  onDelete: (id: string) => void;
  /** Sửa tiêu đề / chi tiết / ảnh (bản thân hoặc quản trị). */
  canEditContent?: boolean;
  /** Trả lời + chuyển trạng thái: chỉ `quan_tri` hoặc `is_admin`. */
  canModerate?: boolean;
  canDelete?: boolean;
}

const GopYDetail: React.FC<Props> = ({
  data,
  onClose,
  onEdit,
  onDelete,
  canEditContent = true,
  canModerate = false,
  canDelete = true,
}) => {
  const { t } = useTranslation();
  const [showReply, setShowReply] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [statusChoice, setStatusChoice] = useState<GopYTrangThai>('chua_tra_loi');
  const [statusReplyText, setStatusReplyText] = useState('');

  const openReply = () => {
    setReplyText(data.tra_loi ?? '');
    setShowReply(true);
  };

  const openStatus = () => {
    setStatusChoice(data.trang_thai);
    setStatusReplyText(data.tra_loi ?? '');
    setShowStatus(true);
  };

  const closeReply = () => setShowReply(false);
  const closeStatus = () => setShowStatus(false);

  const replyMutation = useUpdateGopYReply(closeReply);
  const patchMutation = usePatchGopY(closeStatus);

  const toolbarActions: DetailToolbarAction[] = canModerate
    ? [
        {
          label: t('gopY.dm.detail.replyAction'),
          icon: <MessageSquare />,
          onClick: openReply,
          variant: 'primary',
        },
        {
          label: t('gopY.dm.detail.changeStatusAction'),
          icon: <ArrowRightLeft />,
          onClick: openStatus,
          variant: 'secondary',
        },
      ]
    : [];

  const renderFooter = (
    <div className="flex items-center justify-between w-full">
      <Button variant="ghost" onClick={onClose} className="text-muted-foreground hover:text-foreground border border-border">
        {BTN_CLOSE()}
      </Button>
      {canEditContent || canDelete ? (
        <div className="flex items-center gap-3">
          {canEditContent ? (
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

  const statusBadge = (row: GopY) => {
    const isDa = row.trang_thai === 'da_tra_loi';
    return (
      <span
        className={cn(
          'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
          isDa
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
            : 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
        )}
      >
        {isDa ? t('gopY.dm.status.daTraLoi') : t('gopY.dm.status.chuaTraLoi')}
      </span>
    );
  };

  const handleSaveReply = async () => {
    if (!canModerate) return;
    await replyMutation.mutateAsync({ id: data.id, traLoi: replyText });
  };

  const handleSaveStatus = async () => {
    if (!canModerate) return;
    if (statusChoice === 'da_tra_loi' && !statusReplyText.trim()) {
      return;
    }
    await patchMutation.mutateAsync({
      id: data.id,
      patch:
        statusChoice === 'chua_tra_loi'
          ? { trang_thai: 'chua_tra_loi', tra_loi: null }
          : { trang_thai: 'da_tra_loi', tra_loi: statusReplyText.trim() },
    });
  };

  const replyFooter = (
    <div className="flex items-center justify-end w-full gap-3">
      <Button variant="outline" onClick={closeReply} className="border-border">
        {BTN_CANCEL()}
      </Button>
      <Button
        onClick={() => void handleSaveReply()}
        isLoading={replyMutation.isPending}
        disabled={!replyText.trim()}
        className="bg-primary text-white"
      >
        {BTN_SAVE()}
      </Button>
    </div>
  );

  const statusFooter = (
    <div className="flex items-center justify-end w-full gap-3">
      <Button variant="outline" onClick={closeStatus} className="border-border">
        {BTN_CANCEL()}
      </Button>
      <Button
        onClick={() => void handleSaveStatus()}
        isLoading={patchMutation.isPending}
        disabled={statusChoice === 'da_tra_loi' && !statusReplyText.trim()}
        className="bg-primary text-white"
      >
        {BTN_SAVE()}
      </Button>
    </div>
  );

  return (
    <>
      <GenericDrawer
        title={t('gopY.dm.detail.title')}
        subtitle={`id ${data.id}`}
        icon={<MessageSquarePlus size={18} />}
        onClose={onClose}
        footer={renderFooter}
        maxWidthClass={DRAWER_WIDTH_DETAIL}
      >
        <div className="space-y-5">
          <div className="bg-card p-4 rounded-xl border border-border/50 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-xs text-muted-foreground">{data.ngay ? formatDate(data.ngay) : '—'}</p>
              {statusBadge(data)}
            </div>
            <h2 className="text-base font-bold text-foreground leading-snug">{data.tieu_de_gop_y}</h2>
          </div>

          {toolbarActions.length > 0 ? (
            <DetailToolbar actions={toolbarActions} className="bg-card rounded-xl border border-border" columns={3} />
          ) : null}

          <DetailSection title={t('gopY.dm.detail.chiTiet')} icon={<MessageSquarePlus size={14} />} variant="primary">
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{data.chi_tiet_gop_y}</p>
          </DetailSection>

          {data.tra_loi?.trim() ? (
            <DetailSection title={t('gopY.dm.detail.traLoi')} icon={<MessageSquare size={14} />}>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{data.tra_loi}</p>
            </DetailSection>
          ) : null}

          {(data.hinh_anh?.length ?? 0) > 0 && (
            <DetailSection title={t('gopY.dm.detail.images')} icon={<ImageIcon size={14} />}>
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 list-none p-0 m-0">
                {data.hinh_anh.map((src, idx) => (
                  <li key={`${src}-${idx}`} className="aspect-video rounded-lg border border-border overflow-hidden bg-muted/30">
                    <img
                      src={src}
                      alt={`${data.tieu_de_gop_y} — ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </li>
                ))}
              </ul>
            </DetailSection>
          )}

          <DetailSection title={t('gopY.dm.detail.meta')} icon={<MessageSquarePlus size={14} />}>
            <DetailFieldGrid>
              <DetailField
                label={t('gopY.dm.detail.nguoiTao')}
                value={
                  data.id_nguoi_tao
                    ? `${data.ten_nguoi_tao ?? '—'} (id ${data.id_nguoi_tao})`
                    : '—'
                }
                icon={<UserRound size={12} />}
              />
              <DetailField label={t('gopY.dm.detail.createdAt')} value={data.tg_tao ? formatDate(data.tg_tao) : '—'} />
              <DetailField label={t('gopY.dm.detail.updatedAt')} value={data.tg_cap_nhat ? formatDate(data.tg_cap_nhat) : '—'} />
            </DetailFieldGrid>
          </DetailSection>
        </div>
      </GenericDrawer>

      {showReply && (
        <GenericDrawer
          title={t('gopY.dm.replyPopup.title')}
          subtitle={t('gopY.dm.replyPopup.subtitle')}
          icon={<MessageSquare size={20} />}
          onClose={closeReply}
          footer={replyFooter}
          variant="modal"
          stackLevel={1}
          maxWidthClass={`w-full ${DIALOG_SIZE.MEDIUM}`}
        >
          <div className="space-y-3">
            <Textarea
              label={t('gopY.dm.replyPopup.label')}
              rows={6}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={t('gopY.dm.replyPopup.placeholder')}
            />
          </div>
        </GenericDrawer>
      )}

      {showStatus && (
        <GenericDrawer
          title={t('gopY.dm.statusPopup.title')}
          subtitle={t('gopY.dm.statusPopup.subtitle')}
          icon={<ArrowRightLeft size={20} />}
          onClose={closeStatus}
          footer={statusFooter}
          variant="modal"
          stackLevel={1}
          maxWidthClass={`w-full ${DIALOG_SIZE.MEDIUM}`}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('gopY.dm.statusPopup.pick')}</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setStatusChoice('chua_tra_loi')}
                className={cn(
                  'flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all text-left',
                  statusChoice === 'chua_tra_loi'
                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                    : 'border-border bg-card hover:bg-muted/50',
                )}
              >
                {t('gopY.dm.status.chuaTraLoi')}
              </button>
              <button
                type="button"
                onClick={() => setStatusChoice('da_tra_loi')}
                className={cn(
                  'flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all text-left',
                  statusChoice === 'da_tra_loi'
                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                    : 'border-border bg-card hover:bg-muted/50',
                )}
              >
                {t('gopY.dm.status.daTraLoi')}
              </button>
            </div>
            {statusChoice === 'da_tra_loi' && (
              <div className="space-y-1">
                <Textarea
                  label={t('gopY.dm.statusPopup.traLoiLabel')}
                  rows={5}
                  value={statusReplyText}
                  onChange={(e) => setStatusReplyText(e.target.value)}
                  placeholder={t('gopY.dm.statusPopup.traLoiPlaceholder')}
                  required
                />
                <p className="text-xs text-muted-foreground">{t('gopY.dm.statusPopup.traLoiHint')}</p>
              </div>
            )}
          </div>
        </GenericDrawer>
      )}
    </>
  );
};

export default GopYDetail;
