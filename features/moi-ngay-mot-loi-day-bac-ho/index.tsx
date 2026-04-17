import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import MoiNgayMotLoiDayBacHoForm from './components/moi-ngay-mot-loi-day-bac-ho-form';
import MoiNgayMotLoiDayBacHoDetail from './components/moi-ngay-mot-loi-day-bac-ho-detail';
import MoiNgayMotLoiDayBacHoToolbar from './components/moi-ngay-mot-loi-day-bac-ho-toolbar';
import MoiNgayMotLoiDayBacHoTable from './components/moi-ngay-mot-loi-day-bac-ho-table';

import { useMoiNgayMotLoiDayBacHoList, useDeleteMoiNgayMotLoiDayBacHoList } from './hooks/use-moi-ngay-mot-loi-day-bac-ho';
import { useMoiNgayMotLoiDayBacHoStore } from './store/useMoiNgayMotLoiDayBacHoStore';
import type { MoiNgayMotLoiDayBacHo } from './core/types';
import { useConfirmStore } from '../../store/useConfirmStore';
import { CONFIRM_DELETE, CONFIRM_DELETE_ALL } from '../../lib/button-labels';
import { getLanguage } from '../../lib/utils';
import { useListWithFilter } from '../../lib/hooks';
import { matchesSearchTerm } from '../../lib/searchUtils';
import { useModulePermission } from '@/hooks/use-module-permission';

type FormOrigin = 'list' | 'detail';

const SEARCHABLE_KEYS: string[] = [
  'id',
  'ngay',
  'ten_tai_lieu',
  'hinh_anh',
  'tep_dinh_kem',
  'ten_nguoi_tao',
  'tg_tao',
  'tg_cap_nhat',
];

const MoiNgayMotLoiDayBacHoPage: React.FC = () => {
  const { t } = useTranslation();
  const perm = useModulePermission('moi-ngay-mot-loi-day-bac-ho');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MoiNgayMotLoiDayBacHo | null>(null);
  const [viewing, setViewing] = useState<MoiNgayMotLoiDayBacHo | null>(null);
  const [formOrigin, setFormOrigin] = useState<FormOrigin>('list');

  const { searchTerm, filters, sort, resetState, clearSelection } = useMoiNgayMotLoiDayBacHoStore();

  const { data: items = [], isLoading } = useMoiNgayMotLoiDayBacHoList();
  const deleteMutation = useDeleteMoiNgayMotLoiDayBacHoList();
  const confirm = useConfirmStore((state) => state.confirm);

  useEffect(() => {
    return () => resetState();
  }, [resetState]);

  useEffect(() => {
    if (!viewing) return;
    const fresh = items.find((e) => e.id === viewing.id);
    if (fresh && fresh !== viewing) {
      setViewing(fresh);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ theo dõi items và id đang xem (không thêm `viewing` để tránh vòng lặp)
  }, [items, viewing?.id]);

  const filterFn = useCallback((row: MoiNgayMotLoiDayBacHo, term: string, f: typeof filters) => {
    const matchesSearch = matchesSearchTerm(row as unknown as Record<string, unknown>, term, SEARCHABLE_KEYS);
    const year = (row.ngay ?? '').slice(0, 4);
    const matchesNam = f.nam.length === 0 || (year && f.nam.includes(year));
    return matchesSearch && matchesNam;
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
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal), getLanguage());
      return sort.direction === 'desc' ? -cmp : cmp;
    });
    return arr;
  }, [filtered, sort]);

  const handleEdit = (item: MoiNgayMotLoiDayBacHo) => {
    if (!perm.canUpdate) return;
    setFormOrigin(viewing ? 'detail' : 'list');
    setEditing(item);
    setShowForm(true);
  };

  const handleView = (item: MoiNgayMotLoiDayBacHo) => {
    setViewing(item);
  };

  const handleDelete = (id: string) => {
    if (!perm.canDelete) return;
    const row = items.find((e) => e.id === id);
    if (!row) return;
    confirm({
      title: t('moiNgayMotLoiDayBacHo.dm.deleteConfirmTitle'),
      message: `${t('moiNgayMotLoiDayBacHo.dm.deleteConfirmMessage')} "${row.ten_tai_lieu.slice(0, 80)}${row.ten_tai_lieu.length > 80 ? '…' : ''}"? ${t('moiNgayMotLoiDayBacHo.dm.deleteConfirmNote')}`,
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
      title: t('moiNgayMotLoiDayBacHo.dm.bulkDeleteTitle'),
      message: t('moiNgayMotLoiDayBacHo.dm.bulkDeleteMessage', { count: ids.length }),
      variant: 'danger',
      confirmText: CONFIRM_DELETE_ALL(),
      onConfirm: async () => {
        await deleteMutation.mutateAsync(ids);
        clearSelection();
        if (viewing && ids.includes(viewing.id)) setViewing(null);
      },
    });
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
        <MoiNgayMotLoiDayBacHoToolbar
          items={items}
          onAdd={() => {
            if (!perm.canCreate) return;
            setFormOrigin('list');
            setEditing(null);
            setShowForm(true);
          }}
          onDeleteMany={handleDeleteMany}
          canCreate={perm.canCreate}
          canDelete={perm.canDelete}
        />

        <div className="flex-1 min-h-0">
          <MoiNgayMotLoiDayBacHoTable
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
          <MoiNgayMotLoiDayBacHoForm
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
          <MoiNgayMotLoiDayBacHoDetail
            data={viewing}
            onClose={() => setViewing(null)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canUpdate={perm.canUpdate}
            canDelete={perm.canDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MoiNgayMotLoiDayBacHoPage;
