import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Download, Upload, FolderOpen } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Tooltip from '../../../components/ui/Tooltip';
import { useKhoVideoStore } from '../store/useKhoVideoStore';
import GenericToolbar from '../../../components/shared/GenericToolbar';
import { BTN_ADD } from '../../../lib/button-labels';
import FilterChipMultiSelect from '../../../components/shared/FilterChipMultiSelect';
import type { KhoVideo } from '../core/types';

export type KhoVideoBrowseStep = 'bo_suu_tap' | 'list';

interface Props {
  items: KhoVideo[];
  itemsForBoSuuTapFilter?: KhoVideo[];
  browseStep?: KhoVideoBrowseStep;
  onBrowseBack?: () => void;
  onAdd: () => void;
  onExport: () => void;
  onImport: () => void;
  onDeleteMany: (ids: string[]) => void;
  canCreate?: boolean;
  canDelete?: boolean;
  canImport?: boolean;
  canExport?: boolean;
}

const KhoVideoToolbar: React.FC<Props> = ({
  items,
  itemsForBoSuuTapFilter,
  browseStep = 'list',
  onBrowseBack,
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
  } = useKhoVideoStore();

  const boSuuTapScope = itemsForBoSuuTapFilter ?? items;

  const boSuuTapOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of boSuuTapScope) {
      const key = (row.bo_suu_tap ?? '').trim() || '__empty__';
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return Object.keys(counts)
      .sort((a, b) => a.localeCompare(b, 'vi'))
      .map((value) => ({
        label: value === '__empty__' ? t('khoVideo.dm.toolbar.boSuuTapEmpty') : value,
        value,
        count: counts[value] ?? 0,
      }));
  }, [boSuuTapScope, t]);

  const drillActive = items.length > 0;
  const atListBrowse = !drillActive || browseStep === 'list';

  const activeFilterCount = useMemo(
    () =>
      atListBrowse ? (searchTerm ? 1 : 0) + (filters.bo_suu_tap.length > 0 ? 1 : 0) : 0,
    [atListBrowse, searchTerm, filters.bo_suu_tap.length],
  );

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setFilter('bo_suu_tap', []);
  };

  const renderFilters = atListBrowse ? (
    <FilterChipMultiSelect
      options={boSuuTapOptions}
      value={filters.bo_suu_tap}
      onChange={(val) => setFilter('bo_suu_tap', val)}
      icon={FolderOpen}
      placeholder={t('khoVideo.dm.toolbar.boSuuTap')}
      className="w-full sm:w-[240px]"
    />
  ) : null;

  const filterGroups = useMemo(
    () =>
      atListBrowse
        ? [
            {
              key: 'bo_suu_tap',
              label: t('khoVideo.dm.toolbar.boSuuTap'),
              icon: FolderOpen,
              options: boSuuTapOptions,
              value: filters.bo_suu_tap,
              onChange: (val: string[]) => setFilter('bo_suu_tap', val),
            },
          ]
        : [],
    [atListBrowse, boSuuTapOptions, filters.bo_suu_tap, setFilter, t],
  );

  const mobileActions = useMemo(() => {
    const list: { key: string; label: string; icon: typeof Upload; onClick: () => void; description: string }[] = [];
    if (canImport) {
      list.push({
        key: 'import',
        label: t('khoVideo.dm.toolbar.importData'),
        icon: Upload,
        onClick: onImport,
        description: t('khoVideo.dm.toolbar.importDesc'),
      });
    }
    if (canExport) {
      list.push({
        key: 'export',
        label: t('khoVideo.dm.toolbar.exportData'),
        icon: Download,
        onClick: onExport,
        description: t('khoVideo.dm.toolbar.exportDesc'),
      });
    }
    return list;
  }, [canExport, canImport, onExport, onImport, t]);

  const renderActions = (
    <>
      {canImport ? (
        <Tooltip content={t('khoVideo.dm.toolbar.importData')} placement="bottom">
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
        <Tooltip content={t('khoVideo.dm.toolbar.exportData')} placement="bottom">
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
      showBack={drillActive}
      onBack={drillActive ? onBrowseBack : undefined}
      hideSearch={!atListBrowse}
      activeFilterCount={activeFilterCount}
      onClearAllFilters={handleClearAllFilters}
    />
  );
};

export default KhoVideoToolbar;
