import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Download, Upload, Briefcase, Pencil, type LucideIcon } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Tooltip from '../../../../components/ui/Tooltip';
import { useEmployeeStore } from '../store/useEmployeeStore';
import GenericToolbar from '../../../../components/shared/GenericToolbar';
import { BTN_ADD } from '../../../../lib/button-labels';
import { usePositions } from '../../chuc-vu/hooks/use-chuc-vu';
import FilterChipMultiSelect from '../../../../components/shared/FilterChipMultiSelect';
import { useFilterCounts } from '../hooks/use-filter-counts';
import type { Employee } from '../core/types';

interface Props {
  employees: Employee[];
  onAdd: () => void;
  onExport: () => void;
  onImport: () => void;
  onDeleteMany: (ids: string[]) => void;
  onBulkEdit?: () => void;
  canCreate?: boolean;
  canDelete?: boolean;
  canImport?: boolean;
  canExport?: boolean;
  canUpdate?: boolean;
}

const EmployeeToolbar: React.FC<Props> = ({
  employees,
  onAdd,
  onExport,
  onImport,
  onDeleteMany,
  onBulkEdit,
  canCreate = true,
  canDelete = true,
  canImport = true,
  canExport = true,
  canUpdate = true,
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
  } = useEmployeeStore();

  const { data: positions = [] } = usePositions();

  const { posCounts } = useFilterCounts(employees, searchTerm, filters);

  const positionOptions = useMemo(
    () => positions.map((p) => ({ label: p.ten_chuc_vu, value: p.id, count: posCounts[p.id] || 0 })),
    [positions, posCounts],
  );

  const activeFilterCount = useMemo(() => {
    return (searchTerm ? 1 : 0) + (filters.position.length > 0 ? 1 : 0);
  }, [searchTerm, filters.position.length]);

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setFilter('position', []);
  };

  const renderFilters = (
    <FilterChipMultiSelect
      options={positionOptions}
      value={filters.position}
      onChange={(val) => setFilter('position', val)}
      icon={Briefcase}
      placeholder={t('employee.toolbar.position')}
      className="w-full sm:w-[160px]"
    />
  );

  const filterGroups = useMemo(
    () => [
      {
        key: 'position',
        label: t('employee.toolbar.position'),
        icon: Briefcase,
        options: positionOptions,
        value: filters.position,
        onChange: (val: string[]) => setFilter('position', val),
      },
    ],
    [positionOptions, filters.position, setFilter, t],
  );

  const mobileActions = useMemo(() => {
    const list: { key: string; label: string; icon: LucideIcon; onClick: () => void; description: string }[] = [];
    if (canUpdate && onBulkEdit && selectedIds.size > 0) {
      list.push({
        key: 'bulk-edit',
        label: t('employee.toolbar.bulkEdit'),
        icon: Pencil,
        onClick: onBulkEdit,
        description: t('employee.toolbar.bulkEditDesc', { count: selectedIds.size }),
      });
    }
    if (canImport) {
      list.push({
        key: 'import',
        label: t('employee.toolbar.importData'),
        icon: Upload,
        onClick: onImport,
        description: t('employee.toolbar.importDesc'),
      });
    }
    if (canExport) {
      list.push({
        key: 'export',
        label: t('employee.toolbar.exportData'),
        icon: Download,
        onClick: onExport,
        description: t('employee.toolbar.exportDesc'),
      });
    }
    return list;
  }, [canExport, canImport, canUpdate, onBulkEdit, onExport, onImport, selectedIds.size, t]);

  const renderActions = (
    <>
      {canUpdate && onBulkEdit && selectedIds.size > 0 ? (
        <Tooltip content={t('employee.toolbar.bulkEdit')} placement="bottom">
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkEdit}
            className="inline-flex h-8 px-2.5 items-center gap-1.5 border-primary/30 text-primary bg-primary/5 hover:bg-primary/10"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{t('employee.toolbar.editCount', { count: selectedIds.size })}</span>
          </Button>
        </Tooltip>
      ) : null}
      {canImport ? (
        <Tooltip content={t('employee.toolbar.importData')} placement="bottom">
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
        <Tooltip content={t('employee.toolbar.exportData')} placement="bottom">
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

export default EmployeeToolbar;
