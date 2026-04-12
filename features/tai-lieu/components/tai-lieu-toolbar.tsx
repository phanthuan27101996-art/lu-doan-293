import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Download, Upload, FolderOpen } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Tooltip from '../../../components/ui/Tooltip';
import { useTaiLieuStore } from '../store/useTaiLieuStore';
import GenericToolbar from '../../../components/shared/GenericToolbar';
import { BTN_ADD } from '../../../lib/button-labels';
import FilterChipMultiSelect from '../../../components/shared/FilterChipMultiSelect';
import type { TaiLieu } from '../core/types';

interface Props {
  items: TaiLieu[];
  onAdd: () => void;
  onExport: () => void;
  onImport: () => void;
  onDeleteMany: (ids: string[]) => void;
}

const TaiLieuToolbar: React.FC<Props> = ({ items, onAdd, onExport, onImport, onDeleteMany }) => {
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
  } = useTaiLieuStore();

  const nhomOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of items) {
      const key = (row.nhom_tai_lieu ?? '').trim() || '__empty__';
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return Object.keys(counts)
      .sort((a, b) => a.localeCompare(b, 'vi'))
      .map((value) => ({
        label: value === '__empty__' ? t('taiLieu.dm.toolbar.nhomEmpty') : value,
        value,
        count: counts[value] ?? 0,
      }));
  }, [items, t]);

  const activeFilterCount = useMemo(
    () => (searchTerm ? 1 : 0) + (filters.nhom_tai_lieu.length > 0 ? 1 : 0),
    [searchTerm, filters.nhom_tai_lieu.length],
  );

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setFilter('nhom_tai_lieu', []);
  };

  const renderFilters = (
    <FilterChipMultiSelect
      options={nhomOptions}
      value={filters.nhom_tai_lieu}
      onChange={(val) => setFilter('nhom_tai_lieu', val)}
      icon={FolderOpen}
      placeholder={t('taiLieu.dm.toolbar.nhom')}
      className="w-full sm:w-[220px]"
    />
  );

  const filterGroups = useMemo(
    () => [
      {
        key: 'nhom_tai_lieu',
        label: t('taiLieu.dm.toolbar.nhom'),
        icon: FolderOpen,
        options: nhomOptions,
        value: filters.nhom_tai_lieu,
        onChange: (val: string[]) => setFilter('nhom_tai_lieu', val),
      },
    ],
    [nhomOptions, filters.nhom_tai_lieu, setFilter, t],
  );

  const mobileActions = useMemo(
    () => [
      {
        key: 'import',
        label: t('taiLieu.dm.toolbar.importData'),
        icon: Upload,
        onClick: onImport,
        description: t('taiLieu.dm.toolbar.importDesc'),
      },
      {
        key: 'export',
        label: t('taiLieu.dm.toolbar.exportData'),
        icon: Download,
        onClick: onExport,
        description: t('taiLieu.dm.toolbar.exportDesc'),
      },
    ],
    [onImport, onExport, t],
  );

  const renderActions = (
    <>
      <Tooltip content={t('taiLieu.dm.toolbar.importData')} placement="bottom">
        <Button
          variant="outline"
          size="sm"
          onClick={onImport}
          className="inline-flex min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 h-8 w-8 p-0 items-center justify-center border-border text-muted-foreground hover:bg-muted"
        >
          <Upload className="w-4 h-4" />
        </Button>
      </Tooltip>
      <Tooltip content={t('taiLieu.dm.toolbar.exportData')} placement="bottom">
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

export default TaiLieuToolbar;
