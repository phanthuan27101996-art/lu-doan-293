import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { BookOpen, Calendar, Clock, Edit, Save, ScrollText, Shield, Star, Users, X } from 'lucide-react';
import DashboardToolbar from '../../components/shared/DashboardToolbar';
import DetailSection from '../../components/shared/DetailSection';
import DetailField from '../../components/shared/DetailField';
import DetailFieldGrid from '../../components/shared/DetailFieldGrid';
import Button from '../../components/ui/Button';
import TabGroup from '../../components/ui/TabGroup';
import RichTextEditor from '../../components/shared/RichTextEditor';
import { formatDateTimeShort } from '../../lib/utils';
import { sanitizeHtml, isLikelyHtml } from '../../lib/sanitize-html';
import { truyenThongFormSchema, type TruyenThongFormValues } from './core/schema';
import { usePrimaryTruyenThong, useUpsertPrimaryTruyenThong } from './hooks/use-truyen-thong';
import { useModulePermission } from '@/hooks/use-module-permission';
import ModulePermissionDenied from '@/components/shared/ModulePermissionDenied';
import LanhDaoLuuDoanSection from './components/lanh-dao-luu-doan-section';
import LuuDoanTruongSection from './components/luu-doan-truong-section';
import ChinhUySection from './components/chinh-uy-section';

type TruyenThongTabId = 'noi-dung' | 'lanh-dao' | 'luu-doan-truong' | 'chinh-uy';

const TruyenThongPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const perm = useModulePermission('truyen-thong');
  const canEdit = perm.canUpdate || perm.canCreate;
  const { data: record, isLoading, isError, error } = usePrimaryTruyenThong();

  const [editing, setEditing] = useState(false);
  const [editSession, setEditSession] = useState(0);
  const [draft, setDraft] = useState('');
  const [activeTab, setActiveTab] = useState<TruyenThongTabId>('noi-dung');
  const upsertMutation = useUpsertPrimaryTruyenThong(() => setEditing(false));

  const handleRichChange = useCallback((html: string) => {
    setDraft(html);
  }, []);

  const startEdit = useCallback(() => {
    if (!canEdit) return;
    setEditSession((s) => s + 1);
    setDraft(record?.thong_tin ?? '');
    setEditing(true);
  }, [record?.thong_tin, canEdit]);

  const cancelEdit = useCallback(() => {
    setDraft(record?.thong_tin ?? '');
    setEditing(false);
  }, [record?.thong_tin]);

  const handleSave = useCallback(async () => {
    if (!canEdit) return;
    const parsed = truyenThongFormSchema.safeParse({ thong_tin: draft });
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors.thong_tin?.[0] ?? parsed.error.issues[0]?.message;
      if (msg) toast.error(msg);
      return;
    }
    await upsertMutation.mutateAsync(parsed.data as TruyenThongFormValues);
  }, [draft, upsertMutation, canEdit]);

  const headerActions = useMemo(() => {
    if (isLoading || perm.isLoading || !canEdit) return null;
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
  }, [cancelEdit, canEdit, editing, handleSave, isLoading, perm.isLoading, startEdit, t, upsertMutation.isPending]);

  const updatedLabel = record?.tg_cap_nhat ? formatDateTimeShort(record.tg_cap_nhat) : '—';

  const bodyRaw = record?.thong_tin?.trim() ?? '';
  const bodyHtml = useMemo(() => (bodyRaw && isLikelyHtml(bodyRaw) ? sanitizeHtml(bodyRaw) : ''), [bodyRaw]);

  const mainTabs = useMemo(
    () => [
      { id: 'noi-dung' as const, label: t('truyenThong.tab.content'), icon: ScrollText },
      { id: 'lanh-dao' as const, label: t('truyenThong.lanhDao.sectionTitle'), icon: Users },
      { id: 'luu-doan-truong' as const, label: t('truyenThong.luuDoanTruong.sectionTitle'), icon: Star },
      { id: 'chinh-uy' as const, label: t('truyenThong.chinhUy.sectionTitle'), icon: Shield },
    ],
    [t],
  );

  if (perm.isLoading) {
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
        />
        <div className="flex flex-col items-center justify-center py-16" aria-busy="true">
          <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (!perm.canView) {
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
        />
        <ModulePermissionDenied />
      </div>
    );
  }

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

      <div className="w-full min-w-0 space-y-4 px-3 pb-10 pt-3 sm:space-y-6 sm:px-4 md:pt-4 lg:mx-0 lg:max-w-none lg:px-4 xl:px-6">
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
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-5">
            <TabGroup
              equalGrid
              tabs={mainTabs}
              activeTab={activeTab}
              onChange={(id) => setActiveTab(id as TruyenThongTabId)}
            />

            {activeTab === 'noi-dung' ? (
              <div
                role="tabpanel"
                id="truyen-thong-panel-noi-dung"
                aria-labelledby="tab-noi-dung"
                className="min-w-0 space-y-4 sm:space-y-5"
              >
                <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-sm sm:gap-4 sm:p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-white shadow-md sm:h-12 sm:w-12 sm:rounded-xl">
                    <BookOpen className="h-[18px] w-[18px] text-white sm:h-[22px] sm:w-[22px]" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-bold text-foreground sm:text-base">{t('truyenThong.heroTitle')}</h2>
                    <p className="mt-0.5 text-xs leading-snug text-muted-foreground sm:text-body-sm">{t('truyenThong.heroDesc')}</p>
                  </div>
                </div>
                <DetailSection title={t('truyenThong.section.content')} icon={<ScrollText size={14} />} variant="primary">
                  <div className="max-w-none lg:max-w-prose">
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
                        className="rich-text-content min-h-[100px] rounded-lg border border-border/50 bg-muted/20 px-3 py-3 sm:min-h-[120px]"
                        role="region"
                        aria-label={t('truyenThong.previewRegion')}
                        dangerouslySetInnerHTML={{ __html: bodyHtml }}
                      />
                    ) : (
                      <div
                        className="min-h-[100px] rounded-lg border border-border/50 bg-muted/20 px-3 py-3 text-sm leading-relaxed text-foreground whitespace-pre-wrap sm:min-h-[120px]"
                        role="region"
                        aria-label={t('truyenThong.previewRegion')}
                      >
                        {bodyRaw || t('truyenThong.emptyBody')}
                      </div>
                    )}
                  </div>
                </DetailSection>
                <DetailSection title={t('truyenThong.section.meta')} icon={<Clock size={14} />} variant="muted">
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
              </div>
            ) : null}

            {activeTab === 'lanh-dao' ? (
              <div role="tabpanel" id="truyen-thong-panel-lanh-dao" aria-labelledby="tab-lanh-dao" className="min-w-0">
                <LanhDaoLuuDoanSection canCreate={perm.canCreate} canUpdate={perm.canUpdate} canDelete={perm.canDelete} />
              </div>
            ) : null}

            {activeTab === 'luu-doan-truong' ? (
              <div role="tabpanel" id="truyen-thong-panel-luu-doan-truong" aria-labelledby="tab-luu-doan-truong" className="min-w-0">
                <LuuDoanTruongSection canCreate={perm.canCreate} canUpdate={perm.canUpdate} canDelete={perm.canDelete} />
              </div>
            ) : null}

            {activeTab === 'chinh-uy' ? (
              <div role="tabpanel" id="truyen-thong-panel-chinh-uy" aria-labelledby="tab-chinh-uy" className="min-w-0">
                <ChinhUySection canCreate={perm.canCreate} canUpdate={perm.canUpdate} canDelete={perm.canDelete} />
              </div>
            ) : null}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TruyenThongPage;
