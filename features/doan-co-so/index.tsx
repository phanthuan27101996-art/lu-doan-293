import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import DoanCoSoForm from './components/doan-co-so-form';
import DoanCoSoDetail from './components/doan-co-so-detail';
import DoanCoSoToolbar from './components/doan-co-so-toolbar';
import DoanCoSoTable from './components/doan-co-so-table';
import ImportDialog from '../../components/shared/ImportDialog';
import ExportDialog from '../../components/shared/ExportDialog';

import { useDoanCoSoList, useDeleteDoanCoSoList } from './hooks/use-doan-co-so';
import { useDoanCoSoStore } from './store/useDoanCoSoStore';
import type { DoanCoSo } from './core/types';
import { useConfirmStore } from '../../store/useConfirmStore';
import { CONFIRM_DELETE, CONFIRM_DELETE_ALL } from '../../lib/button-labels';
import { formatDate, getLanguage } from '../../lib/utils';
import { useListWithFilter } from '../../lib/hooks';
import { matchesSearchTerm } from '../../lib/searchUtils';
import { useExportData } from '../../lib/useExportData';
import { useModulePermission } from '@/hooks/use-module-permission';
import ModulePermissionDenied from '@/components/shared/ModulePermissionDenied';

type FormOrigin = 'list' | 'detail';

const NHOM_EMPTY = '__empty__';

const DOAN_CO_SO_SEARCHABLE_KEYS: string[] = [
  'id',
  'ngay',
  'nhom',
  'ten',
  'ghi_chu',
  'link',
  'ten_nguoi_tao',
  'tg_tao',
  'tg_cap_nhat',
];

const DoanCoSoPage: React.FC = () => {
  const { t } = useTranslation();
  const perm = useModulePermission('doan-co-so');

  const IMPORT_COLUMNS = useMemo(
    () => [
      { key: 'ngay', label: t('doanCoSo.dm.import.columns.ngay'), required: true },
      { key: 'nhom', label: t('doanCoSo.dm.import.columns.nhom'), required: true },
      { key: 'ten', label: t('doanCoSo.dm.import.columns.ten'), required: true },
      { key: 'ghi_chu', label: t('doanCoSo.dm.import.columns.ghiChu'), required: false },
      { key: 'link', label: t('doanCoSo.dm.import.columns.link'), required: false },
    ],
    [t],
  );

  const EXPORT_COLUMNS = useMemo(
    () => [
      { key: 'id', label: 'id' },
      { key: 'ngay', label: t('doanCoSo.dm.store.ngayCol') },
      { key: 'nhom', label: t('doanCoSo.dm.store.nhomCol') },
      { key: 'ten', label: t('doanCoSo.dm.store.tenCol') },
      { key: 'ghi_chu', label: t('doanCoSo.dm.form.ghiChu') },
      { key: 'hinh_anh_text', label: 'hinh_anh' },
      { key: 'link', label: t('doanCoSo.dm.store.linkCol') },
      { key: 'ten_nguoi_tao', label: t('doanCoSo.dm.store.nguoiTaoCol') },
      { key: 'tg_tao_text', label: t('doanCoSo.dm.store.createdCol') },
    ],
    [t],
  );

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DoanCoSo | null>(null);
  const [viewing, setViewing] = useState<DoanCoSo | null>(null);
  const [formOrigin, setFormOrigin] = useState<FormOrigin>('list');
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const { searchTerm, filters, sort, resetState, clearSelection, selectedIds, pagination, columns } =
    useDoanCoSoStore();

  const { data: items = [], isLoading } = useDoanCoSoList();
  const deleteMutation = useDeleteDoanCoSoList();
  const confirm = useConfirmStore((state) => state.confirm);

  useEffect(() => {
    return () => resetState();
  }, [resetState]);

  useEffect(() => {
    if (!viewing) return;
    const fresh = items.find((e) => e.id === viewing.id);
    if (fresh && fresh !== viewing) setViewing(fresh);
  }, [items, viewing?.id]);

  const filterFn = useCallback((row: DoanCoSo, term: string, f: typeof filters) => {
    const matchesSearch = matchesSearchTerm(row as Record<string, unknown>, term, DOAN_CO_SO_SEARCHABLE_KEYS);
    const matchesNhom =
      f.nhom.length === 0 ||
      f.nhom.some((v) => {
        if (v === NHOM_EMPTY) return !(row.nhom ?? '').trim();
        return (row.nhom ?? '').trim() === v;
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
      const cmp =
        typeof aVal === 'number' && typeof bVal === 'number'
          ? (aVal as number) - (bVal as number)
          : String(aVal).localeCompare(String(bVal), getLanguage());
      return sort.direction === 'desc' ? -cmp : cmp;
    });
    return arr;
  }, [filtered, sort]);

  const exportMapFn = useCallback(
    (row: DoanCoSo) => ({
      id: row.id,
      ngay: row.ngay,
      nhom: row.nhom,
      ten: row.ten,
      ghi_chu: row.ghi_chu ?? '',
      hinh_anh_text: JSON.stringify(row.hinh_anh ?? []),
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

  const handleEdit = (item: DoanCoSo) => {
    if (!perm.canUpdate) return;
    setFormOrigin(viewing ? 'detail' : 'list');
    setEditing(item);
    setShowForm(true);
  };

  const handleView = (item: DoanCoSo) => {
    setViewing(item);
  };

  const handleDelete = (id: string) => {
    if (!perm.canDelete) return;
    const row = items.find((e) => e.id === id);
    if (!row) return;
    const titleSnippet = row.ten.slice(0, 80) + (row.ten.length > 80 ? '…' : '');
    confirm({
      title: t('doanCoSo.dm.deleteConfirmTitle'),
      message: `${t('doanCoSo.dm.deleteConfirmMessage')} "${titleSnippet}"? ${t('doanCoSo.dm.deleteConfirmNote')}`,
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
      title: t('doanCoSo.dm.bulkDeleteTitle'),
      message: t('doanCoSo.dm.bulkDeleteMessage', { count: ids.length }),
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
    toast.success(t('doanCoSo.dm.importSuccess', { count: data.length }));
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
        <DoanCoSoToolbar
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
          <DoanCoSoTable
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
          <DoanCoSoForm
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
          <DoanCoSoDetail
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
            templateFileName={t('doanCoSo.dm.importTemplateName')}
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
            fileName={t('doanCoSo.dm.exportFileName')}
            visibleColumnKeys={visibleColumnKeys}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoanCoSoPage;
