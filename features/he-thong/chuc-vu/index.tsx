import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { getLanguage } from '../../../lib/utils';

import PositionForm from './components/chuc-vu-form';
import PositionDetail from './components/chuc-vu-detail';
import PositionToolbar from './components/chuc-vu-toolbar';
import PositionTable from './components/chuc-vu-table';
import ExportDialog from '../../../components/shared/ExportDialog';

import { usePositions, useDeletePosition } from './hooks/use-chuc-vu';
import { usePositionStore } from './store/usePositionStore';
import { useConfirmStore } from '../../../store/useConfirmStore';
import { CONFIRM_DELETE, CONFIRM_DELETE_ALL } from '../../../lib/button-labels';
import { useListWithFilter } from '../../../lib/hooks';
import { useExportData } from '../../../lib/useExportData';
import { Position } from './core/types';
import type { PositionFilters } from './store/usePositionStore';

const PositionPage: React.FC = () => {
  const { t } = useTranslation();
  const confirm = useConfirmStore((s) => s.confirm);

  const [showForm, setShowForm] = useState(false);
  const [editingPos, setEditingPos] = useState<Position | null>(null);
  const [viewingPos, setViewingPos] = useState<Position | null>(null);
  const [formOrigin, setFormOrigin] = useState<'list' | 'detail'>('list');
  const [showExport, setShowExport] = useState(false);

  const { searchTerm, filters, sort, resetState, clearSelection, selectedIds, pagination, columns } =
    usePositionStore();

  const { data: positions = [], isLoading } = usePositions();
  const deleteMutation = useDeletePosition();

  useEffect(() => {
    return () => resetState();
  }, [resetState]);

  useEffect(() => {
    if (!viewingPos) return;
    const fresh = positions.find((p) => p.id === viewingPos.id);
    if (fresh && fresh !== viewingPos) setViewingPos(fresh);
  }, [positions, viewingPos?.id]);

  const filterFn = useCallback((item: Position, term: string, _filters: PositionFilters) => {
    const q = term.toLowerCase();
    if (!term) return true;
    return (
      item.ten_chuc_vu.toLowerCase().includes(q) ||
      item.ma_chuc_vu.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    );
  }, []);

  const filteredPositions = useListWithFilter(positions, searchTerm, filters, filterFn);

  const sortedPositions = useMemo(() => {
    const sorted = [...filteredPositions];
    if (sort.column && sort.direction) {
      sorted.sort((a: Position, b: Position) => {
        const aVal = (a as unknown as Record<string, unknown>)[sort.column!];
        const bVal = (b as unknown as Record<string, unknown>)[sort.column!];
        let cmp = 0;
        if (typeof aVal === 'number' && typeof bVal === 'number') cmp = aVal - bVal;
        else cmp = String(aVal ?? '').localeCompare(String(bVal ?? ''), getLanguage());
        return sort.direction === 'desc' ? -cmp : cmp;
      });
    } else {
      sorted.sort((a, b) => a.ten_chuc_vu.localeCompare(b.ten_chuc_vu, getLanguage()));
    }
    return sorted;
  }, [filteredPositions, sort]);

  const EXPORT_COLUMNS = useMemo(
    () => [
      { key: 'id', label: 'id' },
      { key: 'chuc_vu', label: t('position.exportName') },
      { key: 'tg_tao', label: t('position.detail.createdAt') },
      { key: 'tg_cap_nhat', label: t('position.detail.updated') },
    ],
    [t],
  );

  const exportMapFn = useCallback(
    (item: Position) => ({
      id: item.id,
      chuc_vu: item.chuc_vu ?? '',
      tg_tao: item.tg_tao ?? '',
      tg_cap_nhat: item.tg_cap_nhat ?? '',
    }),
    [],
  );

  const { exportData, paginatedData: paginatedExportData, selectedData: selectedExportData } = useExportData({
    data: filteredPositions,
    isOpen: showExport,
    mapFn: exportMapFn,
    pagination,
    selectedIds,
    keyExtractor: (p) => p.id,
  });

  const visibleColumnKeys = useMemo(() => columns.filter((c) => c.visible).map((c) => c.id), [columns]);

  const handleEdit = (item: Position) => {
    setFormOrigin(viewingPos ? 'detail' : 'list');
    setEditingPos(item);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    confirm({
      title: t('position.deleteTitle'),
      message: t('position.deleteMessage'),
      variant: 'danger',
      confirmText: CONFIRM_DELETE(),
      onConfirm: async () => {
        deleteMutation.mutate([id], {
          onSuccess: () => {
            if (viewingPos && viewingPos.id === id) setViewingPos(null);
          },
        });
      },
    });
  };

  const handleDeleteMany = (ids: string[]) => {
    confirm({
      title: t('position.bulkDeleteTitle'),
      message: t('position.bulkDeleteMessage', { count: ids.length }),
      variant: 'danger',
      confirmText: CONFIRM_DELETE_ALL(),
      onConfirm: () => {
        deleteMutation.mutate(ids, { onSuccess: () => clearSelection() });
      },
    });
  };

  const handleExport = () => {
    if (filteredPositions.length === 0) {
      toast.warning(t('position.noExportData'));
      return;
    }
    setShowExport(true);
  };

  const handleCloseForm = () => {
    const wasEditing = editingPos;
    const origin = formOrigin;
    setShowForm(false);
    setEditingPos(null);
    if (origin === 'detail' && viewingPos && wasEditing && viewingPos.id === wasEditing.id) {
      const fresh = positions.find((p) => p.id === viewingPos.id);
      if (fresh) setViewingPos(fresh);
    }
    setFormOrigin('list');
  };

  return (
    <div className="flex flex-col h-page">
      <div className="flex-1 min-h-0 flex flex-col mt-1.5 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <PositionToolbar
          onAdd={() => setShowForm(true)}
          onExport={handleExport}
          onImport={() => toast.info(t('position.importDeveloping'))}
          onDeleteMany={handleDeleteMany}
        />

        <div className="flex-1 min-h-0">
          <PositionTable
            data={sortedPositions}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={setViewingPos}
          />
        </div>
      </div>

      <AnimatePresence>
        {showForm && <PositionForm initialData={editingPos} onClose={handleCloseForm} />}
      </AnimatePresence>

      <AnimatePresence>
        {viewingPos && !showForm && (
          <PositionDetail data={viewingPos} onClose={() => setViewingPos(null)} onEdit={handleEdit} onDelete={handleDelete} />
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
            fileName="Danh_Sach_Chuc_Vu"
            visibleColumnKeys={visibleColumnKeys}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PositionPage;
