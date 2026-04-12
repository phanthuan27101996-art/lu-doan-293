import React from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2, Briefcase } from 'lucide-react';
import { Position } from '../core/types';
import { usePositionStore } from '../store/usePositionStore';
import GenericTable from '../../../../components/shared/GenericTable';
import { formatDateShort } from '../../../../lib/utils';

interface Props {
  data: Position[];
  isLoading: boolean;
  onEdit: (item: Position) => void;
  onDelete: (id: string) => void;
  onView?: (item: Position) => void;
}

const PositionTable: React.FC<Props> = ({ data, isLoading, onEdit, onDelete, onView }) => {
  const { t } = useTranslation();
  const {
    columns,
    pagination,
    setPage,
    setPageSize,
    selectedIds,
    toggleSelection,
    toggleAllSelection,
    sort,
    setSort,
  } = usePositionStore();

  const renderCell = (colId: string, item: Position) => {
    switch (colId) {
      case 'chuc_vu':
        return (
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
              <Briefcase size={14} />
            </div>
            <span className="font-semibold text-foreground text-sm truncate">{item.ten_chuc_vu || '—'}</span>
          </div>
        );
      case 'tg_tao':
        return <span className="text-xs text-muted-foreground">{formatDateShort(item.tg_tao)}</span>;
      case 'tg_cap_nhat':
        return <span className="text-xs text-muted-foreground">{formatDateShort(item.tg_cap_nhat)}</span>;
      case 'actions':
        return (
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"
              aria-label={t('common.edit')}
            >
              <Edit size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
              aria-label={t('common.delete')}
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const handleRowAction = onView ?? onEdit;

  const renderMobileCard = (item: Position, isSelected: boolean) => (
    <div
      key={item.id}
      onClick={(e) => {
        e.stopPropagation();
        handleRowAction(item);
      }}
      className={`bg-card rounded-xl border p-4 shadow-sm transition-all ${isSelected ? 'border-primary ring-2 ring-primary/10' : 'border-border'}`}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
          <Briefcase size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-semibold text-foreground truncate">{item.ten_chuc_vu}</h4>
            <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelection(item.id)}
                className="w-5 h-5 rounded border-border text-primary accent-primary"
                aria-label={t('common.select')}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-mono mb-3">id: {item.id}</p>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              className="p-2 text-primary bg-primary/10 rounded-xl"
            >
              <Edit size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="p-2 text-red-500 bg-red-50 dark:bg-red-950/30 rounded-xl"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <GenericTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      loadingText={t('position.loading')}
      selectedIds={selectedIds}
      onToggleSelection={toggleSelection}
      onToggleAll={toggleAllSelection}
      page={pagination.page}
      pageSize={pagination.pageSize}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      sort={sort}
      onSort={setSort}
      renderCell={renderCell}
      renderMobileCard={renderMobileCard}
      onRowClick={(item) => handleRowAction(item)}
      keyExtractor={(item) => item.id}
    />
  );
};

export default PositionTable;
