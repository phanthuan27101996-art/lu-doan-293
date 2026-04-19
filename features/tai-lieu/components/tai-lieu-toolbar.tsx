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
  /** Nguồn để tính mục lọc nhóm (mặc định = items); khi drill theo chức vụ nên thu hẹp theo scope */
  itemsForNhomFilter?: TaiLieu[];
  /** Khi duyệt theo cấp: ẩn tìm kiếm / bộ lọc nhóm; nút Back gọi onBrowseBack */
  browseStep?: 'chuc_vu' | 'nhom' | 'list';
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

const TaiLieuToolbar: React.FC<Props> = ({
  items,
  itemsForNhomFilter,
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
  } = useTaiLieuStore();

  const nhomScope = itemsForNhomFilter ?? items;

  const nhomOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of nhomScope) {
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
  }, [nhomScope, t]);

  /** Chỉ khi đã có bản ghi mới dùng luồng duyệt chức vụ → nhóm → danh sách */
  const drillActive = items.length > 0;
  const atListBrowse = !drillActive || browseStep === 'list';

  const activeFilterCount = useMemo(
    () =>
      atListBrowse ? (searchTerm ? 1 : 0) + (filters.nhom_tai_lieu.length > 0 ? 1 : 0) : 0,
    [atListBrowse, searchTerm, filters.nhom_tai_lieu.length],
  );

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setFilter('nhom_tai_lieu', []);
  };

  const renderFilters = atListBrowse ? (
    <FilterChipMultiSelect
      options={nhomOptions}
      value={filters.nhom_tai_lieu}
      onChange={(val) => setFilter('nhom_tai_lieu', val)}
      icon={FolderOpen}
      placeholder={t('taiLieu.dm.toolbar.nhom')}
      className="w-full sm:w-[220px]"
    />
  ) : null;

  const filterGroups = useMemo(
    () =>
      atListBrowse
        ? [
            {
              key: 'nhom_tai_lieu',
              label: t('taiLieu.dm.toolbar.nhom'),
              icon: FolderOpen,
              options: nhomOptions,
              value: filters.nhom_tai_lieu,
              onChange: (val: string[]) => setFilter('nhom_tai_lieu', val),
            },
          ]
        : [],
    [atListBrowse, nhomOptions, filters.nhom_tai_lieu, setFilter, t],
  );

  const mobileActions = useMemo(() => {
    const list: { key: string; label: string; icon: typeof Upload; onClick: () => void; description: string }[] = [];
    if (canImport) {
      list.push({
        key: 'import',
        label: t('taiLieu.dm.toolbar.importData'),
        icon: Upload,
        onClick: onImport,
        description: t('taiLieu.dm.toolbar.importDesc'),
      });
    }
    if (canExport) {
      list.push({
        key: 'export',
        label: t('taiLieu.dm.toolbar.exportData'),
        icon: Download,
        onClick: onExport,
        description: t('taiLieu.dm.toolbar.exportDesc'),
      });
    }
    return list;
  }, [canExport, canImport, onExport, onImport, t]);

  const renderActions = (
    <>
      {canImport ? (
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
      ) : null}
      {canExport ? (
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
      showBack={drillActive}
      onBack={drillActive ? onBrowseBack : undefined}
      hideSearch={!atListBrowse}
      mobileActions={mobileActions}
      onAdd={canCreate ? onAdd : undefined}
      onDeleteMany={canDelete ? () => onDeleteMany(Array.from(selectedIds)) : undefined}
      columns={columns}
      onToggleColumn={toggleColumn}
      onReorderColumns={reorderColumns}
      onResetColumns={resetColumns}
      activeFilterCount={activeFilterCount}
      onClearAllFilters={handleClearAllFilters}
    />
  );
};

export default TaiLieuToolbar;
