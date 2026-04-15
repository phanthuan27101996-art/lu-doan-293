import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Calendar } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useMoiTuanMotDieuLuatStore } from '../store/useMoiTuanMotDieuLuatStore';
import GenericToolbar from '../../../components/shared/GenericToolbar';
import { BTN_ADD } from '../../../lib/button-labels';
import FilterChipMultiSelect from '../../../components/shared/FilterChipMultiSelect';
import type { MoiTuanMotDieuLuat } from '../core/types';

interface Props {
  items: MoiTuanMotDieuLuat[];
  onAdd: () => void;
  onDeleteMany: (ids: string[]) => void;
  canCreate?: boolean;
  canDelete?: boolean;
}

const MoiTuanMotDieuLuatToolbar: React.FC<Props> = ({
  items,
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
  } = useMoiTuanMotDieuLuatStore();

  const namOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of items) {
      const key = String(row.nam ?? '');
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return Object.keys(counts)
      .filter((k) => k !== '' && k !== '0')
      .sort((a, b) => Number(b) - Number(a))
      .map((value) => ({
        label: value,
        value,
        count: counts[value] ?? 0,
      }));
  }, [items]);

  const activeFilterCount = useMemo(
    () => (searchTerm ? 1 : 0) + (filters.nam.length > 0 ? 1 : 0),
    [searchTerm, filters.nam.length],
  );

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setFilter('nam', []);
  };

  const renderFilters = (
    <FilterChipMultiSelect
      options={namOptions}
      value={filters.nam}
      onChange={(val) => setFilter('nam', val)}
      icon={Calendar}
      placeholder={t('moiTuanMotDieuLuat.dm.toolbar.nam')}
      className="w-full sm:w-[200px]"
    />
  );

  const filterGroups = useMemo(
    () => [
      {
        key: 'nam',
        label: t('moiTuanMotDieuLuat.dm.toolbar.nam'),
        icon: Calendar,
        options: namOptions,
        value: filters.nam,
        onChange: (val: string[]) => setFilter('nam', val),
      },
    ],
    [namOptions, filters.nam, setFilter, t],
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
      showBack
      activeFilterCount={activeFilterCount}
      onClearAllFilters={handleClearAllFilters}
    />
  );
};

export default MoiTuanMotDieuLuatToolbar;
