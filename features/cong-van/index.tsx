import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

import CongVanForm from './components/cong-van-form';
import CongVanDetail from './components/cong-van-detail';
import CongVanToolbar from './components/cong-van-toolbar';
import CongVanTable from './components/cong-van-table';
import ImportDialog from '../../components/shared/ImportDialog';
import ExportDialog from '../../components/shared/ExportDialog';

import { useCongVanList, useDeleteCongVanList, CONG_VAN_QUERY_KEY } from './hooks/use-cong-van';
import { createCongVan } from './services/cong-van-service';
import { rowToCongVanImportPayload } from './utils/import-rows';
import { useEmployees } from '../he-thong/nhan-vien/hooks/use-nhan-vien';
import { useAuthStore } from '../../store/useStore';
import { resolveQuanNhanIdForUser } from '@/lib/resolve-quan-nhan-for-auth-user';
import { useCongVanStore } from './store/useCongVanStore';
import type { CongVan } from './core/types';
import { useConfirmStore } from '../../store/useConfirmStore';
import { CONFIRM_DELETE, CONFIRM_DELETE_ALL } from '../../lib/button-labels';
import { formatDate, getLanguage } from '../../lib/utils';
import { useListWithFilter } from '../../lib/hooks';
import { matchesSearchTerm } from '../../lib/searchUtils';
import { useExportData } from '../../lib/useExportData';
import { useModulePermission } from '@/hooks/use-module-permission';

type FormOrigin = 'list' | 'detail';

const DON_VI_EMPTY = '__empty__';

const CONG_VAN_SEARCHABLE_KEYS: string[] = [
  'id',
  'don_vi',
  'ngay',
  'ten_van_ban',
  'ghi_chu',
  'tep_dinh_kem',
  'link',
  'ten_nguoi_tao',
  'tg_tao',
  'tg_cap_nhat',
];

const CongVanPage: React.FC = () => {
  const { t } = useTranslation();
  const perm = useModulePermission('cong-van');
  const queryClient = useQueryClient();
  const { data: employees = [] } = useEmployees();
  const authUser = useAuthStore((s) => s.user);

  const IMPORT_COLUMNS = useMemo(
    () => [
      { key: 'don_vi', label: t('congVan.dm.import.columns.donVi'), required: true },
      { key: 'ngay', label: t('congVan.dm.import.columns.ngay'), required: true },
      { key: 'ten_van_ban', label: t('congVan.dm.import.columns.ten'), required: true },
      { key: 'ghi_chu', label: t('congVan.dm.import.columns.ghiChu'), required: false },
      { key: 'tep_dinh_kem', label: t('congVan.dm.import.columns.tep'), required: false },
      { key: 'link', label: t('congVan.dm.import.columns.link'), required: false },
    ],
    [t],
  );

  const EXPORT_COLUMNS = useMemo(
    () => [
      { key: 'id', label: 'id' },
      { key: 'don_vi', label: t('congVan.dm.store.donViCol') },
      { key: 'ngay', label: t('congVan.dm.store.ngayCol') },
      { key: 'ten_van_ban', label: t('congVan.dm.store.tenCol') },
      { key: 'ghi_chu', label: t('congVan.dm.form.ghiChu') },
      { key: 'tep_dinh_kem', label: t('congVan.dm.store.tepCol') },
      { key: 'link', label: t('congVan.dm.store.linkCol') },
      { key: 'ten_nguoi_tao', label: t('congVan.dm.store.nguoiTaoCol') },
      { key: 'tg_tao_text', label: t('congVan.dm.store.createdCol') },
    ],
    [t],
  );

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CongVan | null>(null);
  const [viewing, setViewing] = useState<CongVan | null>(null);
  const [formOrigin, setFormOrigin] = useState<FormOrigin>('list');
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const { searchTerm, filters, sort, resetState, clearSelection, selectedIds, pagination, columns } =
    useCongVanStore();

  const { data: items = [], isLoading } = useCongVanList();
  const deleteMutation = useDeleteCongVanList();
  const confirm = useConfirmStore((state) => state.confirm);

  useEffect(() => {
    return () => resetState();
  }, [resetState]);

  useEffect(() => {
    if (!viewing) return;
    const fresh = items.find((e) => e.id === viewing.id);
    if (fresh && fresh !== viewing) setViewing(fresh);
  }, [items, viewing?.id]);

  const filterFn = useCallback((row: CongVan, term: string, f: typeof filters) => {
    const matchesSearch = matchesSearchTerm(row as Record<string, unknown>, term, CONG_VAN_SEARCHABLE_KEYS);
    const matchesDonVi =
      f.don_vi.length === 0 ||
      f.don_vi.some((v) => {
        if (v === DON_VI_EMPTY) return !(row.don_vi ?? '').trim();
        return (row.don_vi ?? '').trim() === v;
      });
    return matchesSearch && matchesDonVi;
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
    (row: CongVan) => ({
      id: row.id,
      don_vi: row.don_vi,
      ngay: row.ngay,
      ten_van_ban: row.ten_van_ban,
      ghi_chu: row.ghi_chu ?? '',
      tep_dinh_kem: row.tep_dinh_kem ?? '',
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

  const handleEdit = (item: CongVan) => {
    if (!perm.canUpdate) return;
    setFormOrigin(viewing ? 'detail' : 'list');
    setEditing(item);
    setShowForm(true);
  };

  const handleView = (item: CongVan) => {
    setViewing(item);
  };

  const handleDelete = (id: string) => {
    if (!perm.canDelete) return;
    const row = items.find((e) => e.id === id);
    if (!row) return;
    confirm({
      title: t('congVan.dm.deleteConfirmTitle'),
      message: `${t('congVan.dm.deleteConfirmMessage')} "${row.ten_van_ban.slice(0, 80)}${row.ten_van_ban.length > 80 ? '…' : ''}"? ${t('congVan.dm.deleteConfirmNote')}`,
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
      title: t('congVan.dm.bulkDeleteTitle'),
      message: t('congVan.dm.bulkDeleteMessage', { count: ids.length }),
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
    if (data.length === 0) {
      toast.message(t('congVan.dm.importEmpty'));
      return;
    }
    const creatorId = resolveQuanNhanIdForUser(authUser, employees) ?? '';
    let ok = 0;
    let fail = 0;
    for (const row of data) {
      const payload = rowToCongVanImportPayload(row, creatorId);
      if (!payload) {
        fail += 1;
        continue;
      }
      try {
        await createCongVan(payload);
        ok += 1;
      } catch {
        fail += 1;
      }
    }
    await queryClient.invalidateQueries({ queryKey: CONG_VAN_QUERY_KEY });
    if (ok === 0 && fail > 0) {
      toast.error(t('congVan.dm.importNoneValid', { total: data.length }));
    } else if (fail > 0) {
      toast.success(t('congVan.dm.importDonePartial', { ok, fail }));
    } else {
      toast.success(t('congVan.dm.importDone', { count: ok }));
    }
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
        <CongVanToolbar
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
          <CongVanTable
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
          <CongVanForm
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
          <CongVanDetail
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
            templateFileName={t('congVan.dm.importTemplateName')}
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
            fileName={t('congVan.dm.exportFileName')}
            visibleColumnKeys={visibleColumnKeys}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CongVanPage;
