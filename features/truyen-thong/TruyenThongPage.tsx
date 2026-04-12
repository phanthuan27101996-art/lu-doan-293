import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { BookOpen, Calendar, Clock, Edit, Save, ScrollText, X } from 'lucide-react';
import DashboardToolbar from '../../components/shared/DashboardToolbar';
import DetailSection from '../../components/shared/DetailSection';
import DetailField from '../../components/shared/DetailField';
import DetailFieldGrid from '../../components/shared/DetailFieldGrid';
import Button from '../../components/ui/Button';
import RichTextEditor from '../../components/shared/RichTextEditor';
import { formatDateTimeShort } from '../../lib/utils';
import { sanitizeHtml, isLikelyHtml } from '../../lib/sanitize-html';
import { truyenThongFormSchema, type TruyenThongFormValues } from './core/schema';
import { usePrimaryTruyenThong, useUpsertPrimaryTruyenThong } from './hooks/use-truyen-thong';

const TruyenThongPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: record, isLoading, isError, error } = usePrimaryTruyenThong();

  const [editing, setEditing] = useState(false);
  const [editSession, setEditSession] = useState(0);
  const [draft, setDraft] = useState('');
  const upsertMutation = useUpsertPrimaryTruyenThong(() => setEditing(false));

  const handleRichChange = useCallback((html: string) => {
    setDraft(html);
  }, []);

  const startEdit = useCallback(() => {
    setEditSession((s) => s + 1);
    setDraft(record?.thong_tin ?? '');
    setEditing(true);
  }, [record?.thong_tin]);

  const cancelEdit = useCallback(() => {
    setDraft(record?.thong_tin ?? '');
    setEditing(false);
  }, [record?.thong_tin]);

  const handleSave = useCallback(async () => {
    const parsed = truyenThongFormSchema.safeParse({ thong_tin: draft });
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors.thong_tin?.[0] ?? parsed.error.issues[0]?.message;
      if (msg) toast.error(msg);
      return;
    }
    await upsertMutation.mutateAsync(parsed.data as TruyenThongFormValues);
  }, [draft, upsertMutation]);

  const headerActions = useMemo(() => {
    if (isLoading) return null;
    if (editing) {
      return (
        <div className="flex items-center gap-2 shrink-0">
          <Button type="button" size="sm" variant="outline" onClick={cancelEdit} disabled={upsertMutation.isPending}>
            <X size={16} className="mr-1.5 sm:mr-1.5" aria-hidden />
            <span className="text-xs sm:text-sm">{t('truyenThong.action.cancel')}</span>
          </Button>
          <Button type="button" size="sm" onClick={() => void handleSave()} disabled={upsertMutation.isPending}>
            <Save size={16} className="mr-1.5 sm:mr-1.5" aria-hidden />
            <span className="text-xs sm:text-sm">
              {upsertMutation.isPending ? t('truyenThong.action.saving') : t('truyenThong.action.save')}
            </span>
          </Button>
        </div>
      );
    }
    return (
      <Button type="button" size="sm" onClick={startEdit} className="shrink-0">
        <Edit size={16} className="mr-1.5" aria-hidden />
        <span className="text-xs sm:text-sm">{t('truyenThong.action.edit')}</span>
      </Button>
    );
  }, [cancelEdit, editing, handleSave, isLoading, startEdit, t, upsertMutation.isPending]);

  const updatedLabel = record?.tg_cap_nhat ? formatDateTimeShort(record.tg_cap_nhat) : '—';

  const bodyRaw = record?.thong_tin?.trim() ?? '';
  const bodyHtml = useMemo(() => (bodyRaw && isLikelyHtml(bodyRaw) ? sanitizeHtml(bodyRaw) : ''), [bodyRaw]);

  return (
    <div className="flex flex-col min-h-0">
      <DashboardToolbar
        onBack={() => navigate(-1)}
        leadingContent={
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ScrollText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-foreground truncate">{t('nav.module.truyenThong')}</h1>
              <p className="text-xs text-muted-foreground truncate">{t('truyenThong.subtitle')}</p>
            </div>
          </div>
        }
        actions={headerActions ?? undefined}
        mobileActions={headerActions ?? undefined}
      />

      <div className="px-4 sm:px-6 space-y-4 sm:space-y-6 pb-10 pt-3 md:pt-4 max-w-3xl w-full mx-auto">
        {isError ? (
          <p className="text-sm text-destructive" role="alert">
            {(error as Error)?.message ?? t('truyenThong.loadError')}
          </p>
        ) : null}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16" aria-busy="true" aria-label={t('truyenThong.loading')}>
            <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white shadow-md shrink-0">
                <BookOpen size={22} className="text-white" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-foreground">{t('truyenThong.heroTitle')}</h2>
                <p className="text-body-sm text-muted-foreground mt-0.5">{t('truyenThong.heroDesc')}</p>
              </div>
            </div>

            <DetailSection title={t('truyenThong.section.content')} icon={<ScrollText size={14} />} variant="primary">
              {editing ? (
                <div className="space-y-3">
                  <RichTextEditor
                    key={`${record?.id ?? 'new'}-${editSession}`}
                    initialHtml={record?.thong_tin ?? ''}
                    onChange={handleRichChange}
                    disabled={upsertMutation.isPending}
                  />
                </div>
              ) : bodyRaw && isLikelyHtml(bodyRaw) ? (
                <div
                  className="rounded-lg border border-border/50 bg-muted/20 px-3 py-3 rich-text-content min-h-[120px]"
                  role="region"
                  aria-label={t('truyenThong.previewRegion')}
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
              ) : (
                <div
                  className="rounded-lg border border-border/50 bg-muted/20 px-3 py-3 text-sm text-foreground whitespace-pre-wrap leading-relaxed min-h-[120px]"
                  role="region"
                  aria-label={t('truyenThong.previewRegion')}
                >
                  {bodyRaw || t('truyenThong.emptyBody')}
                </div>
              )}
            </DetailSection>

            <DetailSection title={t('truyenThong.section.meta')} icon={<Clock size={14} />} variant="primary">
              <DetailFieldGrid>
                <DetailField
                  label={t('truyenThong.field.updatedAt')}
                  value={updatedLabel}
                  icon={<Calendar size={12} />}
                />
                {record?.id ? (
                  <DetailField label={t('truyenThong.field.id')} value={record.id} icon={<Clock size={12} />} />
                ) : null}
              </DetailFieldGrid>
            </DetailSection>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TruyenThongPage;
