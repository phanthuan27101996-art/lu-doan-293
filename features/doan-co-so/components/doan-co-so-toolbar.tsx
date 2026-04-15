import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Download, Upload, FolderOpen } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Tooltip from '../../../components/ui/Tooltip';
import { useDoanCoSoStore } from '../store/useDoanCoSoStore';
import GenericToolbar from '../../../components/shared/GenericToolbar';
import { BTN_ADD } from '../../../lib/button-labels';
import FilterChipMultiSelect from '../../../components/shared/FilterChipMultiSelect';
import type { DoanCoSo } from '../core/types';

interface Props {
  items: DoanCoSo[];
  onAdd: () => void;
  onExport: () => void;
  onImport: () => void;
  onDeleteMany: (ids: string[]) => void;
  canCreate?: boolean;
  canDelete?: boolean;
  canImport?: boolean;
  canExport?: boolean;
}

const DoanCoSoToolbar: React.FC<Props> = ({
  items,
  onAdd,
  onExport,
  onImport,
  onDeleteMany,
  canCreate = true,
  canDelete = true,
  canImport = true,
  canExport = true,
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
  } = useDoanCoSoStore();

  const nhomOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of items) {
      const key = (row.nhom ?? '').trim() || '__empty__';
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return Object.keys(counts)
      .sort((a, b) => a.localeCompare(b, 'vi'))
      .map((value) => ({
        label: value === '__empty__' ? t('doanCoSo.dm.toolbar.nhomEmpty') : value,
        value,
        count: counts[value] ?? 0,
      }));
  }, [items, t]);

  const activeFilterCount = useMemo(
    () => (searchTerm ? 1 : 0) + (filters.nhom.length > 0 ? 1 : 0),
    [searchTerm, filters.nhom.length],
  );

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setFilter('nhom', []);
  };

  const renderFilters = (
    <FilterChipMultiSelect
      options={nhomOptions}
      value={filters.nhom}
      onChange={(val) => setFilter('nhom', val)}
      icon={FolderOpen}
      placeholder={t('doanCoSo.dm.toolbar.nhom')}
      className="w-full sm:w-[220px]"
    />
  );

  const filterGroups = useMemo(
    () => [
      {
        key: 'nhom',
        label: t('doanCoSo.dm.toolbar.nhom'),
        icon: FolderOpen,
        options: nhomOptions,
        value: filters.nhom,
        onChange: (val: string[]) => setFilter('nhom', val),
      },
    ],
    [nhomOptions, filters.nhom, setFilter, t],
  );

  const mobileActions = useMemo(() => {
    const list: { key: string; label: string; icon: typeof Upload; onClick: () => void; description: string }[] = [];
    if (canImport) {
      list.push({
        key: 'import',
        label: t('doanCoSo.dm.toolbar.importData'),
        icon: Upload,
        onClick: onImport,
        description: t('doanCoSo.dm.toolbar.importDesc'),
      });
    }
    if (canExport) {
      list.push({
        key: 'export',
        label: t('doanCoSo.dm.toolbar.exportData'),
        icon: Download,
        onClick: onExport,
        description: t('doanCoSo.dm.toolbar.exportDesc'),
      });
    }
    return list;
  }, [canExport, canImport, onExport, onImport, t]);

  const renderActions = (
    <>
      {canImport ? (
        <Tooltip content={t('doanCoSo.dm.toolbar.importData')} placement="bottom">
          <Button
            variant="outline"
            size="sm"
            onClick={onImport}
            className="inline-flex min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 h-8 w-8 p-0 items-center justify-center border-border text-muted-foreground hover:bg-muted"
          >
            <Upload className="w-4 h-4" />
          </Button>
        </Tooltip>
      ) : null}
      {canExport ? (
        <Tooltip content={t('doanCoSo.dm.toolbar.exportData')} placement="bottom">
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="inline-flex min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 h-8 w-8 p-0 items-center justify-center border-border text-muted-foreground hover:bg-muted"
          >
            <Download className="w-4 h-4" />
          </Button>
        </Tooltip>
      ) : null}
      {canCreate ? (
        <Button onClick={onAdd} size="sm" className="bg-primary text-white hover:bg-primary/90 shadow-sm h-8 px-3">
          <Plus className="w-4 h-4 mr-1.5" />
          <span className="text-xs">{BTN_ADD()}</span>
        </Button>
      ) : null}
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

export default DoanCoSoToolbar;
