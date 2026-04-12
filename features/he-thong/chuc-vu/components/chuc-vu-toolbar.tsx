import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Download, Upload } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Tooltip from '../../../../components/ui/Tooltip';
import { usePositionStore } from '../store/usePositionStore';
import GenericToolbar from '../../../../components/shared/GenericToolbar';

interface Props {
  onAdd: () => void;
  onExport: () => void;
  onImport: () => void;
  onDeleteMany: (ids: string[]) => void;
}

const PositionToolbar: React.FC<Props> = ({ onAdd, onExport, onImport, onDeleteMany }) => {
  const { t } = useTranslation();
  const { searchTerm, setSearchTerm, columns, toggleColumn, reorderColumns, resetColumns, selectedIds, clearSelection } =
    usePositionStore();

  const selectedCount = selectedIds.size;

  const mobileActions = useMemo(
    () => [
      { key: 'import', label: t('common.import'), icon: Upload, onClick: onImport, description: '' },
      { key: 'export', label: t('common.export'), icon: Download, onClick: onExport, description: '' },
    ],
    [onImport, onExport, t],
  );

  const renderActions = (
    <>
      <div className="hidden sm:flex items-center gap-2">
        <Tooltip content={t('common.import')} placement="bottom">
          <Button
            variant="outline"
            size="sm"
            onClick={onImport}
            className="inline-flex min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 h-9 w-9 p-0 items-center justify-center border-border text-muted-foreground hover:bg-muted/50"
          >
            <Upload className="w-4 h-4" />
          </Button>
        </Tooltip>
        <Tooltip content={t('common.export')} placement="bottom">
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="inline-flex min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 h-9 w-9 p-0 items-center justify-center border-border text-muted-foreground hover:bg-muted/50"
          >
            <Download className="w-4 h-4" />
          </Button>
        </Tooltip>
      </div>
      <Button
        onClick={onAdd}
        size="sm"
        className="bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20 h-9 px-3 sm:px-4"
      >
        <Plus className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-2" />
        <span className="hidden sm:inline">{t('common.addNew')}</span>
      </Button>
    </>
  );

  return (
    <GenericToolbar
      selectedCount={selectedCount}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      onClearSelection={clearSelection}
      actions={renderActions}
      mobileActions={mobileActions}
      onAdd={onAdd}
      activeFilterCount={0}
      onClearAllFilters={() => {}}
      onDeleteMany={() => onDeleteMany(Array.from(selectedIds))}
      columns={columns}
      onToggleColumn={toggleColumn}
      onReorderColumns={reorderColumns}
      onResetColumns={resetColumns}
      showBack
    />
  );
};

export default PositionToolbar;
