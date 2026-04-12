import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Download, Upload, Building2 } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Tooltip from '../../../components/ui/Tooltip';
import { useCongVanStore } from '../store/useCongVanStore';
import GenericToolbar from '../../../components/shared/GenericToolbar';
import { BTN_ADD } from '../../../lib/button-labels';
import FilterChipMultiSelect from '../../../components/shared/FilterChipMultiSelect';
import type { CongVan } from '../core/types';

interface Props {
  items: CongVan[];
  onAdd: () => void;
  onExport: () => void;
  onImport: () => void;
  onDeleteMany: (ids: string[]) => void;
}

const CongVanToolbar: React.FC<Props> = ({ items, onAdd, onExport, onImport, onDeleteMany }) => {
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
  } = useCongVanStore();

  const donViOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of items) {
      const key = (row.don_vi ?? '').trim() || '__empty__';
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return Object.keys(counts)
      .sort((a, b) => a.localeCompare(b, 'vi'))
      .map((value) => ({
        label: value === '__empty__' ? t('congVan.dm.toolbar.donViEmpty') : value,
        value,
        count: counts[value] ?? 0,
      }));
  }, [items, t]);

  const activeFilterCount = useMemo(
    () => (searchTerm ? 1 : 0) + (filters.don_vi.length > 0 ? 1 : 0),
    [searchTerm, filters.don_vi.length],
  );

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setFilter('don_vi', []);
  };

  const renderFilters = (
    <FilterChipMultiSelect
      options={donViOptions}
      value={filters.don_vi}
      onChange={(val) => setFilter('don_vi', val)}
      icon={Building2}
      placeholder={t('congVan.dm.toolbar.donVi')}
      className="w-full sm:w-[220px]"
    />
  );

  const filterGroups = useMemo(
    () => [
      {
        key: 'don_vi',
        label: t('congVan.dm.toolbar.donVi'),
        icon: Building2,
        options: donViOptions,
        value: filters.don_vi,
        onChange: (val: string[]) => setFilter('don_vi', val),
      },
    ],
    [donViOptions, filters.don_vi, setFilter, t],
  );

  const mobileActions = useMemo(
    () => [
      {
        key: 'import',
        label: t('congVan.dm.toolbar.importData'),
        icon: Upload,
        onClick: onImport,
        description: t('congVan.dm.toolbar.importDesc'),
      },
      {
        key: 'export',
        label: t('congVan.dm.toolbar.exportData'),
        icon: Download,
        onClick: onExport,
        description: t('congVan.dm.toolbar.exportDesc'),
      },
    ],
    [onImport, onExport, t],
  );

  const renderActions = (
    <>
      <Tooltip content={t('congVan.dm.toolbar.importData')} placement="bottom">
        <Button
          variant="outline"
          size="sm"
          onClick={onImport}
          className="inline-flex min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 h-8 w-8 p-0 items-center justify-center border-border text-muted-foreground hover:bg-muted"
        >
          <Upload className="w-4 h-4" />
        </Button>
      </Tooltip>
      <Tooltip content={t('congVan.dm.toolbar.exportData')} placement="bottom">
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="inline-flex min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 h-8 w-8 p-0 items-center justify-center border-border text-muted-foreground hover:bg-muted"
        >
          <Download className="w-4 h-4" />
        </Button>
      </Tooltip>
      <Button onClick={onAdd} size="sm" className="bg-primary text-white hover:bg-primary/90 shadow-sm h-8 px-3">
        <Plus className="w-4 h-4 mr-1.5" />
        <span className="text-xs">{BTN_ADD()}</span>
      </Button>
    </>
  );

  return (
    <GenericToolbar
      selectedCount={selectedIds.size}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      onClearSelection={clearSelection}
      actions={renderActions}
      filters={renderFilters}
      filterGroups={filterGroups}
      mobileActions={mobileActions}
      onAdd={onAdd}
      onDeleteMany={() => onDeleteMany(Array.from(selectedIds))}
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

export default CongVanToolbar;
