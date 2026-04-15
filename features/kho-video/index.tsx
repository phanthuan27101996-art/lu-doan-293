import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import KhoVideoForm from './components/kho-video-form';
import KhoVideoDetail from './components/kho-video-detail';
import KhoVideoToolbar from './components/kho-video-toolbar';
import KhoVideoTable from './components/kho-video-table';
import ImportDialog from '../../components/shared/ImportDialog';
import ExportDialog from '../../components/shared/ExportDialog';

import { useKhoVideoList, useDeleteKhoVideoList } from './hooks/use-kho-video';
import { useKhoVideoStore } from './store/useKhoVideoStore';
import type { KhoVideo } from './core/types';
import { useConfirmStore } from '../../store/useConfirmStore';
import { CONFIRM_DELETE, CONFIRM_DELETE_ALL } from '../../lib/button-labels';
import { formatDate, getLanguage } from '../../lib/utils';
import { useListWithFilter } from '../../lib/hooks';
import { matchesSearchTerm } from '../../lib/searchUtils';
import { useExportData } from '../../lib/useExportData';
import { useModulePermission } from '@/hooks/use-module-permission';
import ModulePermissionDenied from '@/components/shared/ModulePermissionDenied';

type FormOrigin = 'list' | 'detail';

const BO_SUU_TAP_EMPTY = '__empty__';

const KHO_VIDEO_SEARCHABLE_KEYS: string[] = [
  'id',
  'bo_suu_tap',
  'ten_video',
  'ghi_chu',
  'link',
  'ten_nguoi_tao',
  'tg_tao',
  'tg_cap_nhat',
];

const KhoVideoPage: React.FC = () => {
  const { t } = useTranslation();
  const perm = useModulePermission('kho-video');

  const IMPORT_COLUMNS = useMemo(
    () => [
      { key: 'bo_suu_tap', label: t('khoVideo.dm.import.columns.boSuuTap'), required: true },
      { key: 'ten_video', label: t('khoVideo.dm.import.columns.tenVideo'), required: true },
      { key: 'ghi_chu', label: t('khoVideo.dm.import.columns.ghiChu'), required: false },
      { key: 'link', label: t('khoVideo.dm.import.columns.link'), required: false },
    ],
    [t],
  );

  const EXPORT_COLUMNS = useMemo(
    () => [
      { key: 'id', label: 'id' },
      { key: 'bo_suu_tap', label: t('khoVideo.dm.store.boSuuTapCol') },
      { key: 'ten_video', label: t('khoVideo.dm.store.tenVideoCol') },
      { key: 'ghi_chu', label: t('khoVideo.dm.store.ghiChuCol') },
      { key: 'link', label: t('khoVideo.dm.store.linkCol') },
      { key: 'ten_nguoi_tao', label: t('khoVideo.dm.store.nguoiTaoCol') },
      { key: 'tg_tao_text', label: t('khoVideo.dm.store.createdCol') },
    ],
    [t],
  );

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<KhoVideo | null>(null);
  const [viewing, setViewing] = useState<KhoVideo | null>(null);
  const [formOrigin, setFormOrigin] = useState<FormOrigin>('list');
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const { searchTerm, filters, sort, resetState, clearSelection, selectedIds, pagination, columns } =
    useKhoVideoStore();

  const { data: items = [], isLoading } = useKhoVideoList();
  const deleteMutation = useDeleteKhoVideoList();
  const confirm = useConfirmStore((state) => state.confirm);

  const viewingResolved = useMemo(() => {
    if (!viewing) return null;
    return items.find((e) => e.id === viewing.id) ?? viewing;
  }, [items, viewing]);

  useEffect(() => {
    return () => resetState();
  }, [resetState]);

  const filterFn = useCallback((row: KhoVideo, term: string, f: typeof filters) => {
    const matchesSearch = matchesSearchTerm(row as Record<string, unknown>, term, KHO_VIDEO_SEARCHABLE_KEYS);
    const matchesBoSuuTap =
      f.bo_suu_tap.length === 0 ||
      f.bo_suu_tap.some((v) => {
        if (v === BO_SUU_TAP_EMPTY) return !(row.bo_suu_tap ?? '').trim();
        return (row.bo_suu_tap ?? '').trim() === v;
      });
    return matchesSearch && matchesBoSuuTap;
  }, []);

  const filtered = useListWithFilter(items, searchTerm, filters, filterFn);

  const sorted = useMemo(() => {
    if (!sort.column || !sort.direction) return filtered;
    const arr = [...filtered];
    arr.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const aVal = a[sort.column!] ?? '';
      const bVal = b[sort.column!] ?? '';
      const cmp =
        typeof aVal === 'number' && typeof bVal === 'number'
          ? (aVal as number) - (bVal as number)
          : String(aVal).localeCompare(String(bVal), getLanguage());
      return sort.direction === 'desc' ? -cmp : cmp;
    });
    return arr;
  }, [filtered, sort]);

  const exportMapFn = useCallback(
    (row: KhoVideo) => ({
      id: row.id,
      bo_suu_tap: row.bo_suu_tap,
      ten_video: row.ten_video,
      ghi_chu: row.ghi_chu ?? '',
      link: row.link ?? '',
      ten_nguoi_tao: row.ten_nguoi_tao ?? '',
      tg_tao_text: row.tg_tao ? formatDate(row.tg_tao) : '',
    }),
    [],
  );

  const { exportData, paginatedData: paginatedExportData, selectedData: selectedExportData } = useExportData({
    data: filtered,
    isOpen: showExport,
    mapFn: exportMapFn,
    pagination,
    selectedIds,
    keyExtractor: (row) => row.id,
  });

  const visibleColumnKeys = useMemo(() => columns.filter((c) => c.visible).map((c) => c.id), [columns]);

  const handleEdit = (item: KhoVideo) => {
    if (!perm.canUpdate) return;
    setFormOrigin(viewingResolved ? 'detail' : 'list');
    setEditing(item);
    setShowForm(true);
  };

  const handleView = (item: KhoVideo) => {
    setViewing(item);
  };

  const handleDelete = (id: string) => {
    if (!perm.canDelete) return;
    const row = items.find((e) => e.id === id);
    if (!row) return;
    const titleSnippet = row.ten_video.slice(0, 80) + (row.ten_video.length > 80 ? '…' : '');
    confirm({
      title: t('khoVideo.dm.deleteConfirmTitle'),
      message: `${t('khoVideo.dm.deleteConfirmMessage')} "${titleSnippet}"? ${t('khoVideo.dm.deleteConfirmNote')}`,
      variant: 'danger',
      confirmText: CONFIRM_DELETE(),
      onConfirm: async () => {
        await deleteMutation.mutateAsync([id]);
        if (viewing?.id === id) setViewing(null);
        if (editing?.id === id) setShowForm(false);
      },
    });
  };

  const handleDeleteMany = (ids: string[]) => {
    if (!perm.canDelete) return;
    confirm({
      title: t('khoVideo.dm.bulkDeleteTitle'),
      message: t('khoVideo.dm.bulkDeleteMessage', { count: ids.length }),
      variant: 'danger',
      confirmText: CONFIRM_DELETE_ALL(),
      onConfirm: async () => {
        await deleteMutation.mutateAsync(ids);
        clearSelection();
        if (viewing && ids.includes(viewing.id)) setViewing(null);
      },
    });
  };

  const handleImportData = async (data: Record<string, unknown>[]) => {
    if (!perm.canCreate) return;
    toast.success(t('khoVideo.dm.importSuccess', { count: data.length }));
  };

  if (perm.isLoading) {
    return (
      <div className="flex flex-col h-page relative items-center justify-center min-h-[40vh]" aria-busy="true">
        <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!perm.canView) {
    return (
      <div className="flex flex-col h-page relative">
        <ModulePermissionDenied />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-page relative">
      <div className="flex-1 min-h-0 flex flex-col mt-1.5 rounded-xl border border-border bg-card shadow-sm overflow-hidden relative z-0">
        <KhoVideoToolbar
          items={items}
          onAdd={() => {
            if (!perm.canCreate) return;
            setFormOrigin('list');
            setEditing(null);
            setShowForm(true);
          }}
          onExport={() => {
            if (!perm.canView) return;
            setShowExport(true);
          }}
          onImport={() => {
            if (!perm.canCreate) return;
            setShowImport(true);
          }}
          onDeleteMany={handleDeleteMany}
          canCreate={perm.canCreate}
          canDelete={perm.canDelete}
          canImport={perm.canCreate}
          canExport={perm.canView}
        />

        <div className="flex-1 min-h-0">
          <KhoVideoTable
            data={sorted}
            isLoading={isLoading}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            canUpdate={perm.canUpdate}
            canDelete={perm.canDelete}
          />
        </div>
      </div>

      <AnimatePresence>
        {showForm && ((editing != null && perm.canUpdate) || (editing == null && perm.canCreate)) ? (
          <KhoVideoForm
            initialData={editing}
            existingItems={items}
            onClose={() => {
              setShowForm(false);
              if (formOrigin === 'detail' && editing) {
                const freshData = items.find((e) => e.id === editing.id);
                setViewing(freshData ?? null);
              }
              setEditing(null);
            }}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {viewingResolved && !showForm && (
          <KhoVideoDetail
            data={viewingResolved}
            onClose={() => setViewing(null)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canUpdate={perm.canUpdate}
            canDelete={perm.canDelete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showImport && (
          <ImportDialog
            open={showImport}
            onClose={() => setShowImport(false)}
            columns={IMPORT_COLUMNS}
            onImport={handleImportData}
            templateFileName={t('khoVideo.dm.importTemplateName')}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExport && (
          <ExportDialog
            open={showExport}
            onClose={() => setShowExport(false)}
            columns={EXPORT_COLUMNS}
            data={exportData}
            paginatedData={paginatedExportData}
            selectedData={selectedExportData}
            fileName={t('khoVideo.dm.exportFileName')}
            visibleColumnKeys={visibleColumnKeys}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default KhoVideoPage;
