import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import KhoNhacForm from './components/kho-nhac-form';
import KhoNhacDetail from './components/kho-nhac-detail';
import KhoNhacToolbar from './components/kho-nhac-toolbar';
import KhoNhacTable from './components/kho-nhac-table';
import ImportDialog from '../../components/shared/ImportDialog';
import ExportDialog from '../../components/shared/ExportDialog';
import BrowseDrillGrid from '../../components/shared/BrowseDrillGrid';

import { useKhoNhacList, useDeleteKhoNhacList } from './hooks/use-kho-nhac';
import { useKhoNhacStore } from './store/useKhoNhacStore';
import type { KhoNhac } from './core/types';
import { useConfirmStore } from '../../store/useConfirmStore';
import { CONFIRM_DELETE, CONFIRM_DELETE_ALL } from '../../lib/button-labels';
import { formatDate, getLanguage } from '../../lib/utils';
import { useListWithFilter } from '../../lib/hooks';
import { matchesSearchTerm } from '../../lib/searchUtils';
import { useExportData } from '../../lib/useExportData';
import { useModulePermission } from '@/hooks/use-module-permission';
import { BROWSE_ALL_BO_SUU_TAP } from '@/lib/browse-scope';

type FormOrigin = 'list' | 'detail';
type BrowseStep = 'bo_suu_tap' | 'list';

const BO_SUU_TAP_EMPTY = '__empty__';

const KHO_NHAC_SEARCHABLE_KEYS: string[] = [
  'id',
  'bo_suu_tap',
  'ten_nhac',
  'tac_gia',
  'ghi_chu',
  'link',
  'ten_nguoi_tao',
  'tg_tao',
  'tg_cap_nhat',
];

const KhoNhacPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const perm = useModulePermission('kho-nhac');

  const IMPORT_COLUMNS = useMemo(
    () => [
      { key: 'bo_suu_tap', label: t('khoNhac.dm.import.columns.boSuuTap'), required: true },
      { key: 'ten_nhac', label: t('khoNhac.dm.import.columns.tenNhac'), required: true },
      { key: 'tac_gia', label: t('khoNhac.dm.import.columns.tacGia'), required: false },
      { key: 'ghi_chu', label: t('khoNhac.dm.import.columns.ghiChu'), required: false },
      { key: 'link', label: t('khoNhac.dm.import.columns.link'), required: false },
    ],
    [t],
  );

  const EXPORT_COLUMNS = useMemo(
    () => [
      { key: 'id', label: 'id' },
      { key: 'bo_suu_tap', label: t('khoNhac.dm.store.boSuuTapCol') },
      { key: 'ten_nhac', label: t('khoNhac.dm.store.tenNhacCol') },
      { key: 'tac_gia', label: t('khoNhac.dm.store.tacGiaCol') },
      { key: 'ghi_chu', label: t('khoNhac.dm.form.ghiChu') },
      { key: 'link', label: t('khoNhac.dm.store.linkCol') },
      { key: 'ten_nguoi_tao', label: t('khoNhac.dm.store.nguoiTaoCol') },
      { key: 'tg_tao_text', label: t('khoNhac.dm.store.createdCol') },
    ],
    [t],
  );

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<KhoNhac | null>(null);
  const [viewing, setViewing] = useState<KhoNhac | null>(null);
  const [formOrigin, setFormOrigin] = useState<FormOrigin>('list');
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [browseStep, setBrowseStep] = useState<BrowseStep>('bo_suu_tap');
  const [selectedBoSuuTapKey, setSelectedBoSuuTapKey] = useState<string | null>(null);

  const { searchTerm, filters, sort, resetState, clearSelection, selectedIds, pagination, columns } =
    useKhoNhacStore();

  const { data: items = [], isLoading } = useKhoNhacList();
  const deleteMutation = useDeleteKhoNhacList();
  const confirm = useConfirmStore((state) => state.confirm);

  useEffect(() => {
    return () => resetState();
  }, [resetState]);

  useEffect(() => {
    if (items.length === 0 && !isLoading) {
      setBrowseStep('list');
      setSelectedBoSuuTapKey(null);
    }
  }, [items.length, isLoading]);

  useEffect(() => {
    if (!viewing) return;
    const fresh = items.find((e) => e.id === viewing.id);
    if (fresh && fresh !== viewing) setViewing(fresh);
  }, [items, viewing?.id]);

  const boSuuTapBrowseEntries = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of items) {
      const key = (row.bo_suu_tap ?? '').trim() || BO_SUU_TAP_EMPTY;
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return Object.keys(counts)
      .sort((a, b) => {
        if (a === BO_SUU_TAP_EMPTY) return 1;
        if (b === BO_SUU_TAP_EMPTY) return -1;
        return a.localeCompare(b, 'vi');
      })
      .map((key) => ({
        key,
        count: counts[key],
        label: key === BO_SUU_TAP_EMPTY ? t('khoNhac.dm.toolbar.boSuuTapEmpty') : key,
      }));
  }, [items, t]);

  const scopedItems = useMemo(() => {
    if (browseStep !== 'list' || selectedBoSuuTapKey === null) return items;
    if (selectedBoSuuTapKey === BROWSE_ALL_BO_SUU_TAP) return items;
    return items.filter((row) => {
      const key = (row.bo_suu_tap ?? '').trim() || BO_SUU_TAP_EMPTY;
      return key === selectedBoSuuTapKey;
    });
  }, [items, browseStep, selectedBoSuuTapKey]);

  const itemsForBoSuuTapFilter = useMemo(() => {
    if (browseStep !== 'list' || !selectedBoSuuTapKey || selectedBoSuuTapKey === BROWSE_ALL_BO_SUU_TAP) {
      return items;
    }
    return items.filter((row) => {
      const key = (row.bo_suu_tap ?? '').trim() || BO_SUU_TAP_EMPTY;
      return key === selectedBoSuuTapKey;
    });
  }, [items, browseStep, selectedBoSuuTapKey]);

  const handleBrowseBack = useCallback(() => {
    if (browseStep === 'bo_suu_tap') {
      navigate(-1);
      return;
    }
    setBrowseStep('bo_suu_tap');
    setSelectedBoSuuTapKey(null);
  }, [browseStep, navigate]);

  const filterFn = useCallback(
    (row: KhoNhac, term: string, f: typeof filters) => {
      const matchesSearch = matchesSearchTerm(row as Record<string, unknown>, term, KHO_NHAC_SEARCHABLE_KEYS);
      const singleCollectionDrill =
        browseStep === 'list' &&
        selectedBoSuuTapKey != null &&
        selectedBoSuuTapKey !== BROWSE_ALL_BO_SUU_TAP;
      if (singleCollectionDrill) {
        return matchesSearch;
      }
      const matchesBoSuuTap =
        f.bo_suu_tap.length === 0 ||
        f.bo_suu_tap.some((v) => {
          if (v === BO_SUU_TAP_EMPTY) return !(row.bo_suu_tap ?? '').trim();
          return (row.bo_suu_tap ?? '').trim() === v;
        });
      return matchesSearch && matchesBoSuuTap;
    },
    [browseStep, selectedBoSuuTapKey],
  );

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
    (row: KhoNhac) => ({
      id: row.id,
      bo_suu_tap: row.bo_suu_tap,
      ten_nhac: row.ten_nhac,
      tac_gia: row.tac_gia ?? '',
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

  const handleEdit = (item: KhoNhac) => {
    if (!perm.canUpdate) return;
    setFormOrigin(viewing ? 'detail' : 'list');
    setEditing(item);
    setShowForm(true);
  };

  const handleView = (item: KhoNhac) => {
    setViewing(item);
  };

  const handleDelete = (id: string) => {
    if (!perm.canDelete) return;
    const row = items.find((e) => e.id === id);
    if (!row) return;
    const titleSnippet = row.ten_nhac.slice(0, 80) + (row.ten_nhac.length > 80 ? '…' : '');
    confirm({
      title: t('khoNhac.dm.deleteConfirmTitle'),
      message: `${t('khoNhac.dm.deleteConfirmMessage')} "${titleSnippet}"? ${t('khoNhac.dm.deleteConfirmNote')}`,
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
      title: t('khoNhac.dm.bulkDeleteTitle'),
      message: t('khoNhac.dm.bulkDeleteMessage', { count: ids.length }),
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
    toast.success(t('khoNhac.dm.importSuccess', { count: data.length }));
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
        <KhoNhacToolbar
          items={items}
          itemsForBoSuuTapFilter={itemsForBoSuuTapFilter}
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
          {items.length > 0 && browseStep === 'bo_suu_tap' ? (
            <BrowseDrillGrid
              entries={boSuuTapBrowseEntries}
              formatRecordCount={(c) => t('khoNhac.dm.browse.recordCount', { count: c })}
              viewAllLead={{
                count: items.length,
                onClick: () => {
                  setSelectedBoSuuTapKey(BROWSE_ALL_BO_SUU_TAP);
                  setBrowseStep('list');
                },
              }}
              onSelect={(key) => {
                setSelectedBoSuuTapKey(key);
                setBrowseStep('list');
              }}
            />
          ) : null}
          {items.length === 0 || browseStep === 'list' ? (
            <KhoNhacTable
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
          <KhoNhacForm
            initialData={editing}
            existingItems={items}
            defaultBoSuuTap={
              editing
                ? undefined
                : browseStep === 'list' &&
                    selectedBoSuuTapKey &&
                    selectedBoSuuTapKey !== BROWSE_ALL_BO_SUU_TAP &&
                    selectedBoSuuTapKey !== BO_SUU_TAP_EMPTY
                  ? selectedBoSuuTapKey
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
          <KhoNhacDetail
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
            templateFileName={t('khoNhac.dm.importTemplateName')}
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
            fileName={t('khoNhac.dm.exportFileName')}
            visibleColumnKeys={visibleColumnKeys}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default KhoNhacPage;
