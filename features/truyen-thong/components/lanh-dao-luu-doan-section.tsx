import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import DetailSection from '../../../components/shared/DetailSection';
import Button from '../../../components/ui/Button';
import { useLanhDaoLuuDoanList, useDeleteLanhDaoLuuDoan } from '../hooks/use-lanh-dao-luu-doan';
import type { LanhDaoLuuDoan } from '../core/lanh-dao-types';
import { nextThuTuFromList } from '../utils/lanh-dao-luu-doan-form';
import LanhDaoLuuDoanForm from './lanh-dao-luu-doan-form';
import LanhDaoLuuDoanDetail from './lanh-dao-luu-doan-detail';
import { useConfirmStore } from '../../../store/useConfirmStore';
import { BTN_ADD, CONFIRM_DELETE } from '../../../lib/button-labels';

const FALLBACK_AVATAR = 'https://cdn-icons-png.flaticon.com/256/6211/6211662.png';

type FormOrigin = 'list' | 'detail';

interface SectionProps {
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

const LanhDaoLuuDoanSection: React.FC<SectionProps> = ({ canCreate, canUpdate, canDelete }) => {
  const { t } = useTranslation();
  const { data: items = [], isLoading, isError, error } = useLanhDaoLuuDoanList();
  const deleteMutation = useDeleteLanhDaoLuuDoan();
  const confirm = useConfirmStore((s) => s.confirm);

  const [formOpen, setFormOpen] = useState(false);
  const [formOrigin, setFormOrigin] = useState<FormOrigin>('list');
  const [editing, setEditing] = useState<LanhDaoLuuDoan | null>(null);
  const [viewing, setViewing] = useState<LanhDaoLuuDoan | null>(null);

  const defaultThuTu = useMemo(() => nextThuTuFromList(items), [items]);

  useEffect(() => {
    if (!viewing) return;
    const fresh = items.find((e) => e.id === viewing.id);
    if (fresh) setViewing(fresh);
  }, [items, viewing?.id]);

  const openCreate = () => {
    setFormOrigin('list');
    setEditing(null);
    setFormOpen(true);
  };

  const openEditFromDetail = (row: LanhDaoLuuDoan) => {
    setFormOrigin('detail');
    setEditing(row);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    if (formOrigin === 'detail' && editing) {
      const fresh = items.find((e) => e.id === editing.id);
      setViewing(fresh ?? null);
    }
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    const row = items.find((e) => e.id === id);
    if (!row) return;
    const name = row.ho_va_ten.slice(0, 80) + (row.ho_va_ten.length > 80 ? '…' : '');
    confirm({
      title: t('truyenThong.lanhDao.deleteTitle'),
      message: t('truyenThong.lanhDao.deleteMessage', { name }),
      variant: 'danger',
      confirmText: CONFIRM_DELETE(),
      onConfirm: async () => {
        await deleteMutation.mutateAsync([id]);
        if (viewing?.id === id) setViewing(null);
        if (editing?.id === id) setFormOpen(false);
      },
    });
  };

  const galleryLabel = t('truyenThong.lanhDao.sectionTitle');

  return (
    <>
      <DetailSection
        title={t('truyenThong.lanhDao.sectionTitle')}
        icon={<Users size={14} aria-hidden />}
        variant="primary"
        headerAction={
          canCreate ? (
            <Button type="button" size="sm" onClick={openCreate}>
              {BTN_ADD()}
            </Button>
          ) : undefined
        }
      >
        {isError ? (
          <p className="text-sm text-destructive" role="alert">
            {(error as Error)?.message ?? t('truyenThong.lanhDao.loadError')}
          </p>
        ) : null}

        {isLoading ? (
          <div className="flex justify-center py-10" aria-busy="true">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('truyenThong.lanhDao.empty')}</p>
        ) : (
          <div className="min-w-0">
            <ul
              role="list"
              aria-label={galleryLabel}
              className="m-0 grid list-none grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7"
            >
              {items.map((row) => {
                const img = (row.hinh_anh ?? '').trim() || FALLBACK_AVATAR;
                const subtitle = [row.cap_bac_hien_tai, row.chuc_vu].filter(Boolean).join(' · ') || '—';
                return (
                  <li key={row.id} className="min-w-0">
                    <button
                      type="button"
                      className="group flex w-full flex-col overflow-hidden rounded-lg border border-border/70 bg-card text-left shadow-sm ring-1 ring-black/[0.03] transition hover:border-primary/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:ring-white/[0.06]"
                      onClick={() => setViewing(row)}
                      aria-label={t('truyenThong.card.openDetail', { name: row.ho_va_ten })}
                    >
                      <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-muted/40">
                        <img
                          src={img}
                          alt=""
                          className="h-full w-full object-cover object-top transition group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex min-h-0 flex-1 flex-col gap-0.5 p-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">TT {row.thu_tu}</span>
                        <span className="line-clamp-2 text-[11px] font-semibold leading-tight text-foreground">{row.ho_va_ten}</span>
                        <span className="line-clamp-2 text-[10px] leading-tight text-muted-foreground">{subtitle}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </DetailSection>

      <AnimatePresence>
        {formOpen && ((editing != null && canUpdate) || (editing == null && canCreate)) ? (
          <LanhDaoLuuDoanForm
            key={editing?.id ?? 'new'}
            initialData={editing}
            defaultThuTu={defaultThuTu}
            onClose={closeForm}
            stackLevel={formOrigin === 'detail' ? 1 : 0}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {viewing && !formOpen ? (
          <LanhDaoLuuDoanDetail
            data={viewing}
            onClose={() => setViewing(null)}
            onEdit={openEditFromDetail}
            onDelete={handleDelete}
            canUpdate={canUpdate}
            canDelete={canDelete}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default LanhDaoLuuDoanSection;
