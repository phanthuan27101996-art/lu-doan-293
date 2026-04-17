import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import GopYForm from './components/gop-y-form';
import GopYDetail from './components/gop-y-detail';
import GopYToolbar from './components/gop-y-toolbar';
import GopYTable from './components/gop-y-table';
import ImportDialog from '../../components/shared/ImportDialog';
import ExportDialog from '../../components/shared/ExportDialog';

import { useGopYList, useDeleteGopYList } from './hooks/use-gop-y';
import { useGopYAccess } from './hooks/use-gop-y-access';
import { useGopYStore } from './store/useGopYStore';
import type { GopY } from './core/types';
import { useConfirmStore } from '../../store/useConfirmStore';
import { CONFIRM_DELETE, CONFIRM_DELETE_ALL } from '../../lib/button-labels';
import { formatDate, getLanguage } from '../../lib/utils';
import { useListWithFilter } from '../../lib/hooks';
import { matchesSearchTerm } from '../../lib/searchUtils';
import { useExportData } from '../../lib/useExportData';

type FormOrigin = 'list' | 'detail';

const GOP_Y_SEARCHABLE_KEYS: string[] = [
  'id',
  'ngay',
  'tieu_de_gop_y',
  'chi_tiet_gop_y',
  'trang_thai',
  'tra_loi',
  'ten_nguoi_tao',
  'tg_tao',
  'tg_cap_nhat',
];

function isOwnGopY(row: GopY, creatorId: string | null): boolean {
  if (creatorId == null || row.id_nguoi_tao == null) return false;
  return String(row.id_nguoi_tao) === String(creatorId);
}

const GopYPage: React.FC = () => {
  const { t } = useTranslation();
  const perm = useGopYAccess();
  const { canModerate, currentCreatorId } = perm;

  const IMPORT_COLUMNS = useMemo(
    () => [
      { key: 'ngay', label: t('gopY.dm.import.columns.ngay'), required: true },
      { key: 'tieu_de_gop_y', label: t('gopY.dm.import.columns.tieuDe'), required: true },
      { key: 'chi_tiet_gop_y', label: t('gopY.dm.import.columns.chiTiet'), required: true },
    ],
    [t],
  );

  const EXPORT_COLUMNS = useMemo(
    () => [
      { key: 'id', label: 'id' },
      { key: 'ngay', label: t('gopY.dm.store.ngayCol') },
      { key: 'tieu_de_gop_y', label: t('gopY.dm.store.tieuDeCol') },
      { key: 'chi_tiet_gop_y', label: t('gopY.dm.store.chiTietCol') },
      { key: 'trang_thai', label: t('gopY.dm.store.trangThaiCol') },
      { key: 'tra_loi', label: t('gopY.dm.store.traLoiCol') },
      { key: 'hinh_anh_text', label: 'hinh_anh' },
      { key: 'ten_nguoi_tao', label: t('gopY.dm.store.nguoiTaoCol') },
      { key: 'tg_tao_text', label: t('gopY.dm.store.createdCol') },
    ],
    [t],
  );

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GopY | null>(null);
  const [viewing, setViewing] = useState<GopY | null>(null);
  const [formOrigin, setFormOrigin] = useState<FormOrigin>('list');
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const { searchTerm, filters, sort, resetState, clearSelection, selectedIds, pagination, columns } =
    useGopYStore();

  const { data: itemsAll = [], isLoading } = useGopYList();
  const deleteMutation = useDeleteGopYList();
  const confirm = useConfirmStore((state) => state.confirm);

  const scopedItems = useMemo(() => {
    if (canModerate) return itemsAll;
    if (!currentCreatorId) return [];
    return itemsAll.filter((row) => isOwnGopY(row, currentCreatorId));
  }, [itemsAll, canModerate, currentCreatorId]);

  const viewingResolved = useMemo(() => {
    if (!viewing) return null;
    return scopedItems.find((e) => e.id === viewing.id) ?? viewing;
  }, [scopedItems, viewing]);

  const canEditRow = useCallback(
    (row: GopY) => perm.canUpdate && (canModerate || isOwnGopY(row, currentCreatorId)),
    [perm.canUpdate, canModerate, currentCreatorId],
  );

  const canDeleteRow = useCallback(
    (row: GopY) => perm.canDelete && (canModerate || isOwnGopY(row, currentCreatorId)),
    [perm.canDelete, canModerate, currentCreatorId],
  );

  useEffect(() => {
    return () => resetState();
  }, [resetState]);

  const filterFn = useCallback((row: GopY, term: string, f: typeof filters) => {
    const matchesSearch = matchesSearchTerm(row as Record<string, unknown>, term, GOP_Y_SEARCHABLE_KEYS);
    const matchesStatus =
      f.trang_thai.length === 0 || (row.trang_thai != null && f.trang_thai.includes(row.trang_thai));
    return matchesSearch && matchesStatus;
  }, []);

  const filtered = useListWithFilter(scopedItems, searchTerm, filters, filterFn);

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
    (row: GopY) => ({
      id: row.id,
      ngay: row.ngay,
      tieu_de_gop_y: row.tieu_de_gop_y,
      chi_tiet_gop_y: row.chi_tiet_gop_y,
      trang_thai: row.trang_thai,
      tra_loi: row.tra_loi ?? '',
      hinh_anh_text: JSON.stringify(row.hinh_anh ?? []),
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

  const handleEdit = (item: GopY) => {
    if (!canEditRow(item)) return;
    setFormOrigin(viewingResolved ? 'detail' : 'list');
    setEditing(item);
    setShowForm(true);
  };

  const handleView = (item: GopY) => {
    setViewing(item);
  };

  const handleDelete = (id: string) => {
    const row = scopedItems.find((e) => e.id === id);
    if (!row || !canDeleteRow(row)) return;
    if (!row) return;
    const titleSnippet = row.tieu_de_gop_y.slice(0, 80) + (row.tieu_de_gop_y.length > 80 ? '…' : '');
    confirm({
      title: t('gopY.dm.deleteConfirmTitle'),
      message: `${t('gopY.dm.deleteConfirmMessage')} "${titleSnippet}"? ${t('gopY.dm.deleteConfirmNote')}`,
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
    const allowedIds = canModerate
      ? ids
      : ids.filter((id) => {
          const row = scopedItems.find((e) => e.id === id);
          return row != null && canDeleteRow(row);
        });
    if (allowedIds.length === 0) return;
    confirm({
      title: t('gopY.dm.bulkDeleteTitle'),
      message: t('gopY.dm.bulkDeleteMessage', { count: allowedIds.length }),
      variant: 'danger',
      confirmText: CONFIRM_DELETE_ALL(),
      onConfirm: async () => {
        await deleteMutation.mutateAsync(allowedIds);
        clearSelection();
        if (viewing && allowedIds.includes(viewing.id)) setViewing(null);
      },
    });
  };

  const handleImportData = async (data: Record<string, unknown>[]) => {
    if (!perm.canCreate) return;
    toast.success(t('gopY.dm.importSuccess', { count: data.length }));
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
        <GopYToolbar
          items={scopedItems}
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
          <GopYTable
            data={sorted}
            isLoading={isLoading}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            canUpdateRow={canEditRow}
            canDeleteRow={canDeleteRow}
          />
        </div>
      </div>

      <AnimatePresence>
        {showForm && ((editing != null && canEditRow(editing)) || (editing == null && perm.canCreate)) ? (
          <GopYForm
            key={editing?.id ?? 'new'}
            initialData={editing}
            onClose={() => {
              setShowForm(false);
              if (formOrigin === 'detail' && editing) {
                const freshData = scopedItems.find((e) => e.id === editing.id);
                setViewing(freshData ?? null);
              }
              setEditing(null);
            }}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {viewingResolved && !showForm && (
          <GopYDetail
            data={viewingResolved}
            onClose={() => setViewing(null)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canEditContent={canEditRow(viewingResolved)}
            canModerate={canModerate}
            canDelete={canDeleteRow(viewingResolved)}
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
            templateFileName={t('gopY.dm.importTemplateName')}
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
            fileName={t('gopY.dm.exportFileName')}
            visibleColumnKeys={visibleColumnKeys}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GopYPage;
