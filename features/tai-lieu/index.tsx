import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import TaiLieuForm from './components/tai-lieu-form';
import TaiLieuDetail from './components/tai-lieu-detail';
import TaiLieuToolbar from './components/tai-lieu-toolbar';
import TaiLieuTable from './components/tai-lieu-table';
import TaiLieuBrowseLevels from './components/tai-lieu-browse-levels';
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
import { usePositions } from '@/features/he-thong/chuc-vu/hooks/use-chuc-vu';
import { BROWSE_ALL_TAI_LIEU_CHUC_VU, BROWSE_ALL_TAI_LIEU_NHOM } from '@/lib/browse-scope';

type FormOrigin = 'list' | 'detail';
type BrowseStep = 'chuc_vu' | 'nhom' | 'list';

const NHOM_EMPTY = '__empty__';

const TAI_LIEU_SEARCHABLE_KEYS: string[] = [
  'id',
  'id_chuc_vu',
  'ten_chuc_vu',
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
  const navigate = useNavigate();
  const perm = useModulePermission('tai-lieu');

  const IMPORT_COLUMNS = useMemo(
    () => [
      { key: 'id_chuc_vu', label: t('taiLieu.dm.import.columns.chucVu'), required: true },
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
      { key: 'id_chuc_vu', label: 'id_chuc_vu' },
      { key: 'ten_chuc_vu', label: t('taiLieu.dm.store.chucVuCol') },
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
  const [browseStep, setBrowseStep] = useState<BrowseStep>('chuc_vu');
  const [selectedChucVuId, setSelectedChucVuId] = useState<string | null>(null);
  const [selectedNhomKey, setSelectedNhomKey] = useState<string | null>(null);

  const { searchTerm, filters, sort, resetState, clearSelection, selectedIds, pagination, columns } =
    useTaiLieuStore();

  const { data: positions = [] } = usePositions();
  const { data: items = [], isLoading } = useTaiLieuList();
  const deleteMutation = useDeleteTaiLieuList();
  const confirm = useConfirmStore((state) => state.confirm);

  useEffect(() => {
    return () => resetState();
  }, [resetState]);

  useEffect(() => {
    if (items.length === 0 && !isLoading) {
      setBrowseStep('chuc_vu');
      setSelectedChucVuId(null);
      setSelectedNhomKey(null);
    }
  }, [items.length, isLoading]);

  useEffect(() => {
    if (!viewing) return;
    const fresh = items.find((e) => e.id === viewing.id);
    if (fresh && fresh !== viewing) setViewing(fresh);
  }, [items, viewing?.id]);

  const chucVuBrowseEntries = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of items) {
      const id = String(row.id_chuc_vu ?? '').trim();
      if (!id) continue;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([id, count]) => ({
        key: id,
        count,
        label: positions.find((p) => p.id === id)?.ten_chuc_vu ?? `id ${id}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'vi'));
  }, [items, positions]);

  const nhomBrowseEntries = useMemo(() => {
    if (!selectedChucVuId) return [];
    const counts: Record<string, number> = {};
    for (const row of items) {
      if (String(row.id_chuc_vu) !== String(selectedChucVuId)) continue;
      const key = (row.nhom_tai_lieu ?? '').trim() || NHOM_EMPTY;
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return Object.keys(counts)
      .sort((a, b) => a.localeCompare(b, 'vi'))
      .map((key) => ({
        key,
        count: counts[key],
        label: key === NHOM_EMPTY ? t('taiLieu.dm.toolbar.nhomEmpty') : key,
      }));
  }, [items, selectedChucVuId, t]);

  const scopedItems = useMemo(() => {
    if (browseStep !== 'list') return items;
    if (selectedChucVuId === BROWSE_ALL_TAI_LIEU_CHUC_VU) return items;
    if (!selectedChucVuId) return items;
    if (selectedNhomKey === BROWSE_ALL_TAI_LIEU_NHOM) {
      return items.filter((row) => String(row.id_chuc_vu) === String(selectedChucVuId));
    }
    if (selectedNhomKey === null) return items;
    return items.filter((row) => {
      if (String(row.id_chuc_vu) !== String(selectedChucVuId)) return false;
      const key = (row.nhom_tai_lieu ?? '').trim() || NHOM_EMPTY;
      return key === selectedNhomKey;
    });
  }, [items, browseStep, selectedChucVuId, selectedNhomKey]);

  /** Lọc chip « nhóm » chỉ trong phạm vi chức vụ khi đã drill vào danh sách */
  const itemsForNhomFilter = useMemo(() => {
    if (browseStep !== 'list') return items;
    if (!selectedChucVuId || selectedChucVuId === BROWSE_ALL_TAI_LIEU_CHUC_VU) return items;
    return items.filter((row) => String(row.id_chuc_vu) === String(selectedChucVuId));
  }, [items, browseStep, selectedChucVuId]);

  const handleBrowseBack = useCallback(() => {
    if (browseStep === 'chuc_vu') {
      navigate(-1);
      return;
    }
    if (browseStep === 'list') {
      if (selectedChucVuId === BROWSE_ALL_TAI_LIEU_CHUC_VU) {
        setBrowseStep('chuc_vu');
        setSelectedChucVuId(null);
        setSelectedNhomKey(null);
        return;
      }
      setBrowseStep('nhom');
      setSelectedNhomKey(null);
      return;
    }
    if (browseStep === 'nhom') {
      setBrowseStep('chuc_vu');
      setSelectedChucVuId(null);
    }
  }, [browseStep, navigate, selectedChucVuId]);

  const filterFn = useCallback((row: TaiLieu, term: string, f: typeof filters) => {
    const matchesSearch = matchesSearchTerm(row as Record<string, unknown>, term, TAI_LIEU_SEARCHABLE_KEYS);
    const singleNhomDrill =
      browseStep === 'list' &&
      selectedChucVuId &&
      selectedChucVuId !== BROWSE_ALL_TAI_LIEU_CHUC_VU &&
      selectedNhomKey != null &&
      selectedNhomKey !== BROWSE_ALL_TAI_LIEU_NHOM;
    if (singleNhomDrill) {
      return matchesSearch;
    }
    const matchesNhom =
      f.nhom_tai_lieu.length === 0 ||
      f.nhom_tai_lieu.some((v) => {
        if (v === NHOM_EMPTY) return !(row.nhom_tai_lieu ?? '').trim();
        return (row.nhom_tai_lieu ?? '').trim() === v;
      });
    return matchesSearch && matchesNhom;
  }, [browseStep, selectedChucVuId, selectedNhomKey]);

  const filtered = useListWithFilter(scopedItems, searchTerm, filters, filterFn);

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
      id_chuc_vu: row.id_chuc_vu,
      ten_chuc_vu: row.ten_chuc_vu ?? '',
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
          itemsForNhomFilter={itemsForNhomFilter}
          browseStep={browseStep}
          onBrowseBack={handleBrowseBack}
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

        <div className="flex-1 min-h-0 flex flex-col">
          {items.length > 0 && browseStep === 'chuc_vu' ? (
            <TaiLieuBrowseLevels
              entries={chucVuBrowseEntries.map((e) => ({ key: e.key, label: e.label, count: e.count }))}
              viewAllLead={{
                count: items.length,
                onClick: () => {
                  setSelectedChucVuId(BROWSE_ALL_TAI_LIEU_CHUC_VU);
                  setSelectedNhomKey(null);
                  setBrowseStep('list');
                },
              }}
              onSelect={(id) => {
                setSelectedChucVuId(id);
                setBrowseStep('nhom');
              }}
            />
          ) : null}
          {items.length > 0 && browseStep === 'nhom' && selectedChucVuId ? (
            <TaiLieuBrowseLevels
              entries={nhomBrowseEntries.map((e) => ({ key: e.key, label: e.label, count: e.count }))}
              viewAllLead={{
                count: items.filter((row) => String(row.id_chuc_vu) === String(selectedChucVuId)).length,
                onClick: () => {
                  setSelectedNhomKey(BROWSE_ALL_TAI_LIEU_NHOM);
                  setBrowseStep('list');
                },
              }}
              onSelect={(key) => {
                setSelectedNhomKey(key);
                setBrowseStep('list');
              }}
            />
          ) : null}
          {items.length === 0 || browseStep === 'list' ? (
            <TaiLieuTable
              data={sorted}
              isLoading={isLoading}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
              canUpdate={perm.canUpdate}
              canDelete={perm.canDelete}
            />
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {showForm && ((editing != null && perm.canUpdate) || (editing == null && perm.canCreate)) ? (
          <TaiLieuForm
            initialData={editing}
            existingItems={items}
            defaultIdChucVu={
              editing
                ? undefined
                : selectedChucVuId && selectedChucVuId !== BROWSE_ALL_TAI_LIEU_CHUC_VU
                  ? selectedChucVuId
                  : undefined
            }
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
