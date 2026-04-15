import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Download, Upload, UserRound } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Tooltip from '../../../components/ui/Tooltip';
import { useTrangTinStore } from '../store/useTrangTinStore';
import GenericToolbar from '../../../components/shared/GenericToolbar';
import { BTN_ADD } from '../../../lib/button-labels';
import FilterChipMultiSelect from '../../../components/shared/FilterChipMultiSelect';
import type { TrangTin } from '../core/types';
import { useEmployees } from '../../he-thong/nhan-vien/hooks/use-nhan-vien';

interface Props {
  items: TrangTin[];
  onAdd: () => void;
  onExport: () => void;
  onImport: () => void;
  onDeleteMany: (ids: string[]) => void;
  /** Mặc định true — tắt theo ma trận phân quyền. */
  canCreate?: boolean;
  canDelete?: boolean;
  canImport?: boolean;
  canExport?: boolean;
}

const TrangTinToolbar: React.FC<Props> = ({
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
  } = useTrangTinStore();

  const { data: employees = [] } = useEmployees();

  const creatorCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const row of items) {
      if (!row.id_nguoi_tao) continue;
      m[row.id_nguoi_tao] = (m[row.id_nguoi_tao] ?? 0) + 1;
    }
    return m;
  }, [items]);

  const creatorOptions = useMemo(
    () =>
      employees.map((e) => ({
        label: e.ho_ten,
        value: e.id,
        count: creatorCounts[e.id] ?? 0,
      })),
    [employees, creatorCounts],
  );

  const activeFilterCount = useMemo(
    () => (searchTerm ? 1 : 0) + (filters.id_nguoi_tao.length > 0 ? 1 : 0),
    [searchTerm, filters.id_nguoi_tao.length],
  );

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setFilter('id_nguoi_tao', []);
  };

  const renderFilters = (
    <FilterChipMultiSelect
      options={creatorOptions}
      value={filters.id_nguoi_tao}
      onChange={(val) => setFilter('id_nguoi_tao', val)}
      icon={UserRound}
      placeholder={t('trangTin.toolbar.creator')}
      className="w-full sm:w-[200px]"
    />
  );

  const filterGroups = useMemo(
    () => [
      {
        key: 'id_nguoi_tao',
        label: t('trangTin.toolbar.creator'),
        icon: UserRound,
        options: creatorOptions,
        value: filters.id_nguoi_tao,
        onChange: (val: string[]) => setFilter('id_nguoi_tao', val),
      },
    ],
    [creatorOptions, filters.id_nguoi_tao, setFilter, t],
  );

  const mobileActions = useMemo(() => {
    const list: { key: string; label: string; icon: typeof Upload; onClick: () => void; description: string }[] = [];
    if (canImport) {
      list.push({
        key: 'import',
        label: t('trangTin.toolbar.importData'),
        icon: Upload,
        onClick: onImport,
        description: t('trangTin.toolbar.importDesc'),
      });
    }
    if (canExport) {
      list.push({
        key: 'export',
        label: t('trangTin.toolbar.exportData'),
        icon: Download,
        onClick: onExport,
        description: t('trangTin.toolbar.exportDesc'),
      });
    }
    return list;
  }, [canExport, canImport, onExport, onImport, t]);

  const renderActions = (
    <>
      {canImport ? (
        <Tooltip content={t('trangTin.toolbar.importData')} placement="bottom">
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
        <Tooltip content={t('trangTin.toolbar.exportData')} placement="bottom">
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

export default TrangTinToolbar;
