import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Calendar } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useMoiNgayMotLoiDayBacHoStore } from '../store/useMoiNgayMotLoiDayBacHoStore';
import GenericToolbar from '../../../components/shared/GenericToolbar';
import { BTN_ADD } from '../../../lib/button-labels';
import FilterChipMultiSelect from '../../../components/shared/FilterChipMultiSelect';
import type { MoiNgayMotLoiDayBacHo } from '../core/types';
import { ngayISOToNamThangKey } from '../utils/ngay-nam-thang';

export type MoiNgayBrowseStep = 'nam' | 'thang' | 'list';

interface Props {
  items: MoiNgayMotLoiDayBacHo[];
  itemsForNamThangFilter?: MoiNgayMotLoiDayBacHo[];
  browseStep?: MoiNgayBrowseStep;
  onBrowseBack?: () => void;
  onAdd: () => void;
  onDeleteMany: (ids: string[]) => void;
  canCreate?: boolean;
  canDelete?: boolean;
}

const MoiNgayMotLoiDayBacHoToolbar: React.FC<Props> = ({
  items,
  itemsForNamThangFilter,
  browseStep = 'list',
  onBrowseBack,
  onAdd,
  onDeleteMany,
  canCreate = true,
  canDelete = true,
}) => {
  const { t } = useTranslation();
  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    columns,
    toggleColumn,
    reorderColumns,
    resetColumns,
    selectedIds,
    clearSelection,
  } = useMoiNgayMotLoiDayBacHoStore();

  const namThangScope = itemsForNamThangFilter ?? items;

  const namThangOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of namThangScope) {
      const key = ngayISOToNamThangKey(row.ngay ?? '');
      if (!key) continue;
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return Object.keys(counts)
      .sort((a, b) => b.localeCompare(a, 'vi'))
      .map((value) => ({
        label: value,
        value,
        count: counts[value] ?? 0,
      }));
  }, [namThangScope]);

  const drillActive = items.length > 0;
  const atListBrowse = !drillActive || browseStep === 'list';

  const activeFilterCount = useMemo(
    () =>
      atListBrowse ? (searchTerm ? 1 : 0) + (filters.nam_thang.length > 0 ? 1 : 0) : 0,
    [atListBrowse, searchTerm, filters.nam_thang.length],
  );

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setFilter('nam_thang', []);
  };

  const renderFilters = atListBrowse ? (
    <FilterChipMultiSelect
      options={namThangOptions}
      value={filters.nam_thang}
      onChange={(val) => setFilter('nam_thang', val)}
      icon={Calendar}
      placeholder={t('moiNgayMotLoiDayBacHo.dm.toolbar.namThang')}
      className="w-full sm:w-[220px]"
    />
  ) : null;

  const filterGroups = useMemo(
    () =>
      atListBrowse
        ? [
            {
              key: 'nam_thang',
              label: t('moiNgayMotLoiDayBacHo.dm.toolbar.namThang'),
              icon: Calendar,
              options: namThangOptions,
              value: filters.nam_thang,
              onChange: (val: string[]) => setFilter('nam_thang', val),
            },
          ]
        : [],
    [atListBrowse, namThangOptions, filters.nam_thang, setFilter, t],
  );

  const renderActions = canCreate ? (
    <Button onClick={onAdd} size="sm" className="bg-primary text-white hover:bg-primary/90 shadow-sm h-8 px-3">
      <Plus className="w-4 h-4 mr-1.5" />
      <span className="text-xs">{BTN_ADD()}</span>
    </Button>
  ) : null;

  return (
    <GenericToolbar
      selectedCount={selectedIds.size}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      onClearSelection={clearSelection}
      actions={renderActions}
      filters={renderFilters}
      filterGroups={filterGroups}
      mobileActions={[]}
      onAdd={canCreate ? onAdd : undefined}
      onDeleteMany={canDelete ? () => onDeleteMany(Array.from(selectedIds)) : undefined}
      columns={columns}
      onToggleColumn={toggleColumn}
      onReorderColumns={reorderColumns}
      onResetColumns={resetColumns}
      showBack={drillActive}
      onBack={drillActive ? onBrowseBack : undefined}
      hideSearch={!atListBrowse}
      activeFilterCount={activeFilterCount}
      onClearAllFilters={handleClearAllFilters}
    />
  );
};

export default MoiNgayMotLoiDayBacHoToolbar;
