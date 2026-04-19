import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import MoiNgayMotLoiDayBacHoForm from './components/moi-ngay-mot-loi-day-bac-ho-form';
import MoiNgayMotLoiDayBacHoDetail from './components/moi-ngay-mot-loi-day-bac-ho-detail';
import MoiNgayMotLoiDayBacHoToolbar from './components/moi-ngay-mot-loi-day-bac-ho-toolbar';
import MoiNgayMotLoiDayBacHoTable from './components/moi-ngay-mot-loi-day-bac-ho-table';
import MoiNgayMotLoiDayBacHoBrowseGrid from './components/moi-ngay-mot-loi-day-bac-ho-browse-grid';

import { useMoiNgayMotLoiDayBacHoList, useDeleteMoiNgayMotLoiDayBacHoList } from './hooks/use-moi-ngay-mot-loi-day-bac-ho';
import { useMoiNgayMotLoiDayBacHoStore } from './store/useMoiNgayMotLoiDayBacHoStore';
import type { MoiNgayMotLoiDayBacHo } from './core/types';
import { useConfirmStore } from '../../store/useConfirmStore';
import { CONFIRM_DELETE, CONFIRM_DELETE_ALL } from '../../lib/button-labels';
import { getLanguage } from '../../lib/utils';
import { useListWithFilter } from '../../lib/hooks';
import { matchesSearchTerm } from '../../lib/searchUtils';
import { useModulePermission } from '@/hooks/use-module-permission';
import { BROWSE_ALL_MONTHS_IN_YEAR, BROWSE_ALL_YEARS_SENTINEL } from '@/lib/browse-scope';
import { ngayISOToNamThangKey } from './utils/ngay-nam-thang';

type FormOrigin = 'list' | 'detail';
type BrowseStep = 'nam' | 'thang' | 'list';

const SEARCHABLE_KEYS: string[] = [
  'id',
  'ngay',
  'ten_tai_lieu',
  'hinh_anh',
  'tep_dinh_kem',
  'link',
  'ten_nguoi_tao',
  'tg_tao',
  'tg_cap_nhat',
];

function namFromNgay(ngay: string | undefined): number | null {
  const y = Number((ngay ?? '').trim().slice(0, 4));
  return Number.isFinite(y) && y >= 1900 && y <= 2100 ? y : null;
}

const MoiNgayMotLoiDayBacHoPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const perm = useModulePermission('moi-ngay-mot-loi-day-bac-ho');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MoiNgayMotLoiDayBacHo | null>(null);
  const [viewing, setViewing] = useState<MoiNgayMotLoiDayBacHo | null>(null);
  const [formOrigin, setFormOrigin] = useState<FormOrigin>('list');
  const [browseStep, setBrowseStep] = useState<BrowseStep>('nam');
  const [selectedNam, setSelectedNam] = useState<number | null>(null);
  const [selectedNamThang, setSelectedNamThang] = useState<string | null>(null);

  const { searchTerm, filters, sort, resetState, clearSelection } = useMoiNgayMotLoiDayBacHoStore();

  const { data: items = [], isLoading } = useMoiNgayMotLoiDayBacHoList();
  const deleteMutation = useDeleteMoiNgayMotLoiDayBacHoList();
  const confirm = useConfirmStore((state) => state.confirm);

  useEffect(() => {
    return () => resetState();
  }, [resetState]);

  useEffect(() => {
    if (items.length === 0 && !isLoading) {
      setBrowseStep('list');
      setSelectedNam(null);
      setSelectedNamThang(null);
    }
  }, [items.length, isLoading]);

  useEffect(() => {
    if (!viewing) return;
    const fresh = items.find((e) => e.id === viewing.id);
    if (fresh && fresh !== viewing) {
      setViewing(fresh);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ theo dõi items và id đang xem (không thêm `viewing` để tránh vòng lặp)
  }, [items, viewing?.id]);

  const namBrowseEntries = useMemo(() => {
    const counts = new Map<number, number>();
    for (const row of items) {
      const y = namFromNgay(row.ngay);
      if (y == null) continue;
      counts.set(y, (counts.get(y) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([y, count]) => ({ key: String(y), label: String(y), count }))
      .sort((a, b) => Number(b.key) - Number(a.key));
  }, [items]);

  const thangBrowseEntries = useMemo(() => {
    if (selectedNam == null) return [];
    const counts = new Map<string, number>();
    for (const row of items) {
      if (namFromNgay(row.ngay) !== selectedNam) continue;
      const key = ngayISOToNamThangKey(row.ngay);
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([key, count]) => ({ key, label: key, count }))
      .sort((a, b) => b.key.localeCompare(a.key, 'vi'));
  }, [items, selectedNam]);

  const scopedItems = useMemo(() => {
    if (browseStep !== 'list') return items;
    if (selectedNam === BROWSE_ALL_YEARS_SENTINEL) return items;
    if (selectedNamThang === BROWSE_ALL_MONTHS_IN_YEAR && selectedNam != null) {
      return items.filter((row) => namFromNgay(row.ngay) === selectedNam);
    }
    if (!selectedNamThang) return items;
    return items.filter((row) => ngayISOToNamThangKey(row.ngay) === selectedNamThang);
  }, [items, browseStep, selectedNam, selectedNamThang]);

  const itemsForNamThangFilter = useMemo(() => {
    if (browseStep !== 'list') return items;
    if (selectedNam === BROWSE_ALL_YEARS_SENTINEL) return items;
    if (selectedNamThang === BROWSE_ALL_MONTHS_IN_YEAR && selectedNam != null) {
      return items.filter((row) => namFromNgay(row.ngay) === selectedNam);
    }
    if (!selectedNamThang) return items;
    return items.filter((row) => ngayISOToNamThangKey(row.ngay) === selectedNamThang);
  }, [items, browseStep, selectedNam, selectedNamThang]);

  const handleBrowseBack = useCallback(() => {
    if (browseStep === 'nam') {
      navigate(-1);
      return;
    }
    if (browseStep === 'list') {
      if (selectedNam === BROWSE_ALL_YEARS_SENTINEL) {
        setBrowseStep('nam');
        setSelectedNam(null);
        setSelectedNamThang(null);
        return;
      }
      if (selectedNamThang === BROWSE_ALL_MONTHS_IN_YEAR) {
        setBrowseStep('thang');
        setSelectedNamThang(null);
        return;
      }
      setBrowseStep('thang');
      setSelectedNamThang(null);
      return;
    }
    if (browseStep === 'thang') {
      setBrowseStep('nam');
      setSelectedNam(null);
    }
  }, [browseStep, navigate, selectedNam, selectedNamThang]);

  const filterFn = useCallback(
    (row: MoiNgayMotLoiDayBacHo, term: string, f: typeof filters) => {
      const matchesSearch = matchesSearchTerm(row as unknown as Record<string, unknown>, term, SEARCHABLE_KEYS);
      const singleMonthDrill =
        browseStep === 'list' &&
        selectedNamThang != null &&
        selectedNamThang !== BROWSE_ALL_MONTHS_IN_YEAR &&
        selectedNam !== BROWSE_ALL_YEARS_SENTINEL;
      if (singleMonthDrill) {
        return matchesSearch;
      }
      const key = ngayISOToNamThangKey(row.ngay);
      const matchesThang = f.nam_thang.length === 0 || (key && f.nam_thang.includes(key));
      return matchesSearch && matchesThang;
    },
    [browseStep, selectedNam, selectedNamThang],
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
          itemsForNamThangFilter={itemsForNamThangFilter}
          browseStep={browseStep}
          onBrowseBack={handleBrowseBack}
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

        <div className="flex-1 min-h-0 flex flex-col">
          {items.length > 0 && browseStep === 'nam' ? (
            <MoiNgayMotLoiDayBacHoBrowseGrid
              entries={namBrowseEntries}
              viewAllLead={{
                count: items.length,
                onClick: () => {
                  setSelectedNam(BROWSE_ALL_YEARS_SENTINEL);
                  setSelectedNamThang(null);
                  setBrowseStep('list');
                },
              }}
              onSelect={(key) => {
                setSelectedNam(Number(key));
                setBrowseStep('thang');
              }}
            />
          ) : null}
          {items.length > 0 && browseStep === 'thang' && selectedNam != null ? (
            <MoiNgayMotLoiDayBacHoBrowseGrid
              entries={thangBrowseEntries}
              viewAllLead={{
                count: items.filter((row) => namFromNgay(row.ngay) === selectedNam).length,
                onClick: () => {
                  setSelectedNamThang(BROWSE_ALL_MONTHS_IN_YEAR);
                  setBrowseStep('list');
                },
              }}
              onSelect={(key) => {
                setSelectedNamThang(key);
                setBrowseStep('list');
              }}
            />
          ) : null}
          {items.length === 0 || browseStep === 'list' ? (
            <MoiNgayMotLoiDayBacHoTable
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
          <MoiNgayMotLoiDayBacHoForm
            initialData={editing}
            existingItems={items}
            defaultNamThang={
              editing
                ? undefined
                : browseStep === 'list' &&
                    selectedNamThang &&
                    selectedNamThang !== BROWSE_ALL_MONTHS_IN_YEAR
                  ? selectedNamThang
                  : undefined
            }
            defaultNam={
              editing
                ? undefined
                : browseStep === 'thang'
                  ? selectedNam ?? undefined
                  : browseStep === 'list' &&
                      selectedNam != null &&
                      selectedNam !== BROWSE_ALL_YEARS_SENTINEL &&
                      (selectedNamThang === BROWSE_ALL_MONTHS_IN_YEAR || !selectedNamThang)
                    ? selectedNam
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
