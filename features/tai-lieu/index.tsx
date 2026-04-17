import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import TaiLieuForm from './components/tai-lieu-form';
import TaiLieuDetail from './components/tai-lieu-detail';
import TaiLieuToolbar from './components/tai-lieu-toolbar';
import TaiLieuTable from './components/tai-lieu-table';
import ImportDialog from '../../components/shared/ImportDialog';
import ExportDialog from '../../components/shared/ExportDialog';

import { useTaiLieuList, useDeleteTaiLieuList } from './hooks/use-tai-lieu';
import { useTaiLieuStore } from './store/useTaiLieuStore';
import type { TaiLieu } from './core/types';
import { useConfirmStore } from '../../store/useConfirmStore';
import { CONFIRM_DELETE, CONFIRM_DELETE_ALL } from '../../lib/button-labels';
import { formatDate, getLanguage } from '../../lib/utils';
import { useListWithFilter } from '../../lib/hooks';
import { matchesSearchTerm } from '../../lib/searchUtils';
import { useExportData } from '../../lib/useExportData';
import { useModulePermission } from '@/hooks/use-module-permission';

type FormOrigin = 'list' | 'detail';

const NHOM_EMPTY = '__empty__';

const TAI_LIEU_SEARCHABLE_KEYS: string[] = [
  'id',
  'nhom_tai_lieu',
  'ten_tai_lieu',
  'link',
  'ghi_chu',
  'ten_nguoi_tao',
  'tg_tao',
  'tg_cap_nhat',
];

const TaiLieuPage: React.FC = () => {
  const { t } = useTranslation();
  const perm = useModulePermission('tai-lieu');

  const IMPORT_COLUMNS = useMemo(
    () => [
      { key: 'nhom_tai_lieu', label: t('taiLieu.dm.import.columns.nhom'), required: true },
      { key: 'ten_tai_lieu', label: t('taiLieu.dm.import.columns.ten'), required: true },
      { key: 'link', label: t('taiLieu.dm.import.columns.link'), required: false },
      { key: 'ghi_chu', label: t('taiLieu.dm.import.columns.ghiChu'), required: false },
    ],
    [t],
  );

  const EXPORT_COLUMNS = useMemo(
    () => [
      { key: 'id', label: 'id' },
      { key: 'nhom_tai_lieu', label: t('taiLieu.dm.store.nhomCol') },
      { key: 'ten_tai_lieu', label: t('taiLieu.dm.store.tenCol') },
      { key: 'link', label: t('taiLieu.dm.store.linkCol') },
      { key: 'ghi_chu', label: t('taiLieu.dm.form.ghiChu') },
      { key: 'ten_nguoi_tao', label: t('taiLieu.dm.store.nguoiTaoCol') },
      { key: 'tg_tao_text', label: t('taiLieu.dm.store.createdCol') },
    ],
    [t],
  );

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TaiLieu | null>(null);
  const [viewing, setViewing] = useState<TaiLieu | null>(null);
  const [formOrigin, setFormOrigin] = useState<FormOrigin>('list');
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const { searchTerm, filters, sort, resetState, clearSelection, selectedIds, pagination, columns } =
    useTaiLieuStore();

  const { data: items = [], isLoading } = useTaiLieuList();
  const deleteMutation = useDeleteTaiLieuList();
  const confirm = useConfirmStore((state) => state.confirm);

  useEffect(() => {
    return () => resetState();
  }, [resetState]);

  useEffect(() => {
    if (!viewing) return;
    const fresh = items.find((e) => e.id === viewing.id);
    if (fresh && fresh !== viewing) setViewing(fresh);
  }, [items, viewing?.id]);

  const filterFn = useCallback((row: TaiLieu, term: string, f: typeof filters) => {
    const matchesSearch = matchesSearchTerm(row as Record<string, unknown>, term, TAI_LIEU_SEARCHABLE_KEYS);
    const matchesNhom =
      f.nhom_tai_lieu.length === 0 ||
      f.nhom_tai_lieu.some((v) => {
        if (v === NHOM_EMPTY) return !(row.nhom_tai_lieu ?? '').trim();
        return (row.nhom_tai_lieu ?? '').trim() === v;
      });
    return matchesSearch && matchesNhom;
  }, []);

  const filtered = useListWithFilter(items, searchTerm, filters, filterFn);

  const sorted = useMemo(() => {
    if (!sort.column || !sort.direction) return filtered;
    const arr = [...filtered];
    arr.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const aVal = a[sort.column!] ?? '';
      const bVal = b[sort.column!] ?? '';
      let cmp = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') cmp = aVal - bVal;
      else cmp = String(aVal).localeCompare(String(bVal), getLanguage());
      return sort.direction === 'desc' ? -cmp : cmp;
    });
    return arr;
  }, [filtered, sort]);

  const exportMapFn = useCallback(
    (row: TaiLieu) => ({
      id: row.id,
      nhom_tai_lieu: row.nhom_tai_lieu,
      ten_tai_lieu: row.ten_tai_lieu,
      link: row.link ?? '',
      ghi_chu: row.ghi_chu ?? '',
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

  const handleEdit = (item: TaiLieu) => {
    if (!perm.canUpdate) return;
    setFormOrigin(viewing ? 'detail' : 'list');
    setEditing(item);
    setShowForm(true);
  };

  const handleView = (item: TaiLieu) => {
    setViewing(item);
  };

  const handleDelete = (id: string) => {
    if (!perm.canDelete) return;
    const row = items.find((e) => e.id === id);
    if (!row) return;
    confirm({
      title: t('taiLieu.dm.deleteConfirmTitle'),
      message: `${t('taiLieu.dm.deleteConfirmMessage')} "${row.ten_tai_lieu.slice(0, 80)}${row.ten_tai_lieu.length > 80 ? '…' : ''}"? ${t('taiLieu.dm.deleteConfirmNote')}`,
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
      title: t('taiLieu.dm.bulkDeleteTitle'),
      message: t('taiLieu.dm.bulkDeleteMessage', { count: ids.length }),
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
    toast.success(t('taiLieu.dm.importSuccess', { count: data.length }));
  };

  if (perm.isLoading) {
    return (
      <div className="flex flex-col h-page relative items-center justify-center min-h-[40vh]" aria-busy="true">
        <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-page relative">
      <div className="flex-1 min-h-0 flex flex-col mt-1.5 rounded-xl border border-border bg-card shadow-sm overflow-hidden relative z-0">
        <TaiLieuToolbar
          items={items}
          onAdd={() => {
            if (!perm.canCreate) return;
            setFormOrigin('list');
            setEditing(null);
            setShowForm(true);
          }}
          onExport={() => {
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
          <TaiLieuTable
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
          <TaiLieuForm
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
        {viewing && !showForm && (
          <TaiLieuDetail
            data={viewing}
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
            templateFileName={t('taiLieu.dm.importTemplateName')}
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
            fileName={t('taiLieu.dm.exportFileName')}
            visibleColumnKeys={visibleColumnKeys}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaiLieuPage;
