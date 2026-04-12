import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import TrangTinForm from './components/trang-tin-form';
import TrangTinDetail from './components/trang-tin-detail';
import TrangTinToolbar from './components/trang-tin-toolbar';
import TrangTinTable from './components/trang-tin-table';
import ImportDialog from '../../components/shared/ImportDialog';
import ExportDialog from '../../components/shared/ExportDialog';

import { useTrangTinList, useDeleteTrangTinList } from './hooks/use-trang-tin';
import { useTrangTinStore } from './store/useTrangTinStore';
import type { TrangTin } from './core/types';
import { useConfirmStore } from '../../store/useConfirmStore';
import { CONFIRM_DELETE, CONFIRM_DELETE_ALL } from '../../lib/button-labels';
import { formatDate, getLanguage } from '../../lib/utils';
import { useListWithFilter } from '../../lib/hooks';
import { matchesSearchTerm } from '../../lib/searchUtils';
import { useExportData } from '../../lib/useExportData';

type FormOrigin = 'list' | 'detail';

const TRANG_TIN_SEARCHABLE_KEYS: string[] = [
  'id',
  'ngay_dang',
  'tieu_de',
  'mo_ta_ngan',
  'link',
  'ten_nguoi_tao',
  'tg_tao',
  'tg_cap_nhat',
];

const TrangTinPage: React.FC = () => {
  const { t } = useTranslation();

  const IMPORT_COLUMNS = useMemo(
    () => [
      { key: 'ngay_dang', label: t('trangTin.import.columns.ngay'), required: true },
      { key: 'tieu_de', label: t('trangTin.import.columns.tieuDe'), required: true },
      { key: 'mo_ta_ngan', label: t('trangTin.import.columns.moTa'), required: true },
      { key: 'link', label: t('trangTin.import.columns.link'), required: false },
    ],
    [t],
  );

  const EXPORT_COLUMNS = useMemo(
    () => [
      { key: 'id', label: 'id' },
      { key: 'ngay_dang', label: t('trangTin.store.ngayCol') },
      { key: 'tieu_de', label: t('trangTin.store.tieuDeCol') },
      { key: 'mo_ta_ngan', label: t('trangTin.form.moTaNgan') },
      { key: 'hinh_anh_text', label: 'hinh_anh' },
      { key: 'link', label: t('trangTin.form.link') },
      { key: 'ten_nguoi_tao', label: t('trangTin.store.nguoiTaoCol') },
      { key: 'tg_tao_text', label: t('trangTin.store.createdCol') },
    ],
    [t],
  );

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TrangTin | null>(null);
  const [viewing, setViewing] = useState<TrangTin | null>(null);
  const [formOrigin, setFormOrigin] = useState<FormOrigin>('list');
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const { searchTerm, filters, sort, resetState, clearSelection, selectedIds, pagination, columns } =
    useTrangTinStore();

  const { data: items = [], isLoading } = useTrangTinList();
  const deleteMutation = useDeleteTrangTinList();
  const confirm = useConfirmStore((state) => state.confirm);

  useEffect(() => {
    return () => resetState();
  }, [resetState]);

  useEffect(() => {
    if (!viewing) return;
    const fresh = items.find((e) => e.id === viewing.id);
    if (fresh && fresh !== viewing) setViewing(fresh);
  }, [items, viewing?.id]);

  const filterFn = useCallback((row: TrangTin, term: string, f: typeof filters) => {
    const matchesSearch = matchesSearchTerm(row as Record<string, unknown>, term, TRANG_TIN_SEARCHABLE_KEYS);
    const matchesCreator =
      f.id_nguoi_tao.length === 0 ||
      (row.id_nguoi_tao != null && f.id_nguoi_tao.includes(row.id_nguoi_tao));
    return matchesSearch && matchesCreator;
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
    (row: TrangTin) => ({
      id: row.id,
      ngay_dang: row.ngay_dang,
      tieu_de: row.tieu_de,
      mo_ta_ngan: row.mo_ta_ngan,
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

  const handleEdit = (item: TrangTin) => {
    setFormOrigin(viewing ? 'detail' : 'list');
    setEditing(item);
    setShowForm(true);
  };

  const handleView = (item: TrangTin) => {
    setViewing(item);
  };

  const handleDelete = (id: string) => {
    const row = items.find((e) => e.id === id);
    if (!row) return;
    confirm({
      title: t('trangTin.deleteConfirmTitle'),
      message: `${t('trangTin.deleteConfirmMessage')} "${row.tieu_de.slice(0, 80)}${row.tieu_de.length > 80 ? '…' : ''}"? ${t('trangTin.deleteConfirmNote')}`,
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
    confirm({
      title: t('trangTin.bulkDeleteTitle'),
      message: t('trangTin.bulkDeleteMessage', { count: ids.length }),
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
    toast.success(t('trangTin.importSuccess', { count: data.length }));
  };

  return (
    <div className="flex flex-col h-page relative">
      <div className="flex-1 min-h-0 flex flex-col mt-1.5 rounded-xl border border-border bg-card shadow-sm overflow-hidden relative z-0">
        <TrangTinToolbar
          items={items}
          onAdd={() => {
            setFormOrigin('list');
            setEditing(null);
            setShowForm(true);
          }}
          onExport={() => setShowExport(true)}
          onImport={() => setShowImport(true)}
          onDeleteMany={handleDeleteMany}
        />

        <div className="flex-1 min-h-0">
          <TrangTinTable
            data={sorted}
            isLoading={isLoading}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <TrangTinForm
            initialData={editing}
            onClose={() => {
              setShowForm(false);
              if (formOrigin === 'detail' && editing) {
                const freshData = items.find((e) => e.id === editing.id);
                setViewing(freshData ?? null);
              }
              setEditing(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewing && !showForm && (
          <TrangTinDetail
            data={viewing}
            onClose={() => setViewing(null)}
            onEdit={handleEdit}
            onDelete={handleDelete}
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
            templateFileName={t('trangTin.importTemplateName')}
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
            fileName={t('trangTin.exportFileName')}
            visibleColumnKeys={visibleColumnKeys}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrangTinPage;
