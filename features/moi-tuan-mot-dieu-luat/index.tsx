import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import MoiTuanMotDieuLuatForm from './components/moi-tuan-mot-dieu-luat-form';
import MoiTuanMotDieuLuatDetail from './components/moi-tuan-mot-dieu-luat-detail';
import MoiTuanMotDieuLuatToolbar from './components/moi-tuan-mot-dieu-luat-toolbar';
import MoiTuanMotDieuLuatTable from './components/moi-tuan-mot-dieu-luat-table';
import MoiTuanMotDieuLuatBrowseGrid from './components/moi-tuan-mot-dieu-luat-browse-grid';

import { useMoiTuanMotDieuLuatList, useDeleteMoiTuanMotDieuLuatList } from './hooks/use-moi-tuan-mot-dieu-luat';
import { useMoiTuanMotDieuLuatStore } from './store/useMoiTuanMotDieuLuatStore';
import type { MoiTuanMotDieuLuat } from './core/types';
import { useConfirmStore } from '../../store/useConfirmStore';
import { CONFIRM_DELETE, CONFIRM_DELETE_ALL } from '../../lib/button-labels';
import { getLanguage } from '../../lib/utils';
import { useListWithFilter } from '../../lib/hooks';
import { matchesSearchTerm } from '../../lib/searchUtils';
import { useModulePermission } from '@/hooks/use-module-permission';
import { BROWSE_ALL_MONTHS_IN_YEAR, BROWSE_ALL_YEARS_SENTINEL } from '@/lib/browse-scope';

type FormOrigin = 'list' | 'detail';
type BrowseStep = 'nam' | 'thang' | 'list';

const SEARCHABLE_KEYS: string[] = [
  'id',
  'nam',
  'thang',
  'tuan',
  'nam_thang',
  'nam_thang_tuan',
  'ten_dieu_luat',
  'ghi_chu',
  'hinh_anh',
  'tep_dinh_kem',
  'link',
  'ten_nguoi_tao',
  'tg_tao',
  'tg_cap_nhat',
];

const MoiTuanMotDieuLuatPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const perm = useModulePermission('moi-tuan-mot-dieu-luat');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MoiTuanMotDieuLuat | null>(null);
  const [viewing, setViewing] = useState<MoiTuanMotDieuLuat | null>(null);
  const [formOrigin, setFormOrigin] = useState<FormOrigin>('list');
  const [browseStep, setBrowseStep] = useState<BrowseStep>('nam');
  const [selectedNam, setSelectedNam] = useState<number | null>(null);
  const [selectedNamThang, setSelectedNamThang] = useState<string | null>(null);

  const { searchTerm, filters, sort, resetState, clearSelection } = useMoiTuanMotDieuLuatStore();

  const { data: items = [], isLoading } = useMoiTuanMotDieuLuatList();
  const deleteMutation = useDeleteMoiTuanMotDieuLuatList();
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

  /** Cấp 1: các năm có dữ liệu */
  const namBrowseEntries = useMemo(() => {
    const counts = new Map<number, number>();
    for (const row of items) {
      const y = row.nam;
      if (y == null || !Number.isFinite(y)) continue;
      counts.set(y, (counts.get(y) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([y, count]) => ({ key: String(y), label: String(y), count }))
      .sort((a, b) => Number(b.key) - Number(a.key));
  }, [items]);

  /** Cấp 2: các tháng yyyy/mm trong năm đã chọn */
  const thangBrowseEntries = useMemo(() => {
    if (selectedNam == null) return [];
    const counts = new Map<string, number>();
    for (const row of items) {
      if (row.nam !== selectedNam) continue;
      const key = (row.nam_thang ?? '').trim();
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
      return items.filter((row) => row.nam === selectedNam);
    }
    if (!selectedNamThang) return items;
    return items.filter((row) => (row.nam_thang ?? '').trim() === selectedNamThang);
  }, [items, browseStep, selectedNam, selectedNamThang]);

  const itemsForNamThangFilter = useMemo(() => {
    if (browseStep !== 'list') return items;
    if (selectedNam === BROWSE_ALL_YEARS_SENTINEL) return items;
    if (selectedNamThang === BROWSE_ALL_MONTHS_IN_YEAR && selectedNam != null) {
      return items.filter((row) => row.nam === selectedNam);
    }
    if (!selectedNamThang) return items;
    return items.filter((row) => (row.nam_thang ?? '').trim() === selectedNamThang);
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
    (row: MoiTuanMotDieuLuat, term: string, f: typeof filters) => {
      const matchesSearch = matchesSearchTerm(row as unknown as Record<string, unknown>, term, SEARCHABLE_KEYS);
      const singleMonthDrill =
        browseStep === 'list' &&
        selectedNamThang != null &&
        selectedNamThang !== BROWSE_ALL_MONTHS_IN_YEAR &&
        selectedNam !== BROWSE_ALL_YEARS_SENTINEL;
      if (singleMonthDrill) {
        return matchesSearch;
      }
      const key = (row.nam_thang ?? '').trim();
      const matchesThang = f.nam_thang.length === 0 || f.nam_thang.includes(key);
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

  const handleEdit = (item: MoiTuanMotDieuLuat) => {
    if (!perm.canUpdate) return;
    setFormOrigin(viewing ? 'detail' : 'list');
    setEditing(item);
    setShowForm(true);
  };

  const handleView = (item: MoiTuanMotDieuLuat) => {
    setViewing(item);
  };

  const handleDelete = (id: string) => {
    if (!perm.canDelete) return;
    const row = items.find((e) => e.id === id);
    if (!row) return;
    confirm({
      title: t('moiTuanMotDieuLuat.dm.deleteConfirmTitle'),
      message: `${t('moiTuanMotDieuLuat.dm.deleteConfirmMessage')} "${row.ten_dieu_luat.slice(0, 80)}${row.ten_dieu_luat.length > 80 ? '…' : ''}"? ${t('moiTuanMotDieuLuat.dm.deleteConfirmNote')}`,
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
      title: t('moiTuanMotDieuLuat.dm.bulkDeleteTitle'),
      message: t('moiTuanMotDieuLuat.dm.bulkDeleteMessage', { count: ids.length }),
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
        <MoiTuanMotDieuLuatToolbar
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
            <MoiTuanMotDieuLuatBrowseGrid
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
            <MoiTuanMotDieuLuatBrowseGrid
              entries={thangBrowseEntries}
              viewAllLead={{
                count: items.filter((row) => row.nam === selectedNam).length,
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
            <MoiTuanMotDieuLuatTable
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
          <MoiTuanMotDieuLuatForm
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
          <MoiTuanMotDieuLuatDetail
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

export default MoiTuanMotDieuLuatPage;
