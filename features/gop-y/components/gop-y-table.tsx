import React from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2, MessageSquarePlus } from 'lucide-react';
import type { GopY } from '../core/types';
import { useGopYStore } from '../store/useGopYStore';
import { cn, formatDate } from '../../../lib/utils';
import GenericTable from '../../../components/shared/GenericTable';

interface Props {
  data: GopY[];
  isLoading: boolean;
  onEdit: (item: GopY) => void;
  onDelete: (id: string) => void;
  onView: (item: GopY) => void;
  canUpdateRow: (item: GopY) => boolean;
  canDeleteRow: (item: GopY) => boolean;
}

const GopYTable: React.FC<Props> = ({
  data,
  isLoading,
  onEdit,
  onDelete,
  onView,
  canUpdateRow,
  canDeleteRow,
}) => {
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
    resizeColumn,
  } = useGopYStore();

  const statusBadge = (row: GopY) => {
    const isDa = row.trang_thai === 'da_tra_loi';
    return (
      <span
        className={cn(
          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
          isDa
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
            : 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
        )}
      >
        {isDa ? t('gopY.dm.status.daTraLoi') : t('gopY.dm.status.chuaTraLoi')}
      </span>
    );
  };

  const renderCell = (colId: string, item: GopY) => {
    switch (colId) {
      case 'ngay':
        return item.ngay ? (
          <span className="text-body-sm text-muted-foreground tabular-nums">{formatDate(item.ngay)}</span>
        ) : (
          <span className="text-xs text-muted-foreground italic">—</span>
        );
      case 'tieu_de_gop_y':
        return (
          <div className="flex items-start gap-2 min-w-0">
            <MessageSquarePlus size={14} className="text-primary shrink-0 mt-0.5" aria-hidden />
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-foreground text-sm line-clamp-2">{item.tieu_de_gop_y}</span>
              <span className="text-xs text-muted-foreground font-mono truncate">id {item.id}</span>
            </div>
          </div>
        );
      case 'trang_thai':
        return statusBadge(item);
      case 'chi_tiet_gop_y':
        return (
          <span className="text-body-sm text-muted-foreground line-clamp-2 block max-w-[220px] whitespace-pre-wrap">
            {item.chi_tiet_gop_y?.trim() || '—'}
          </span>
        );
      case 'ten_nguoi_tao':
        return (
          <span className="text-body-sm text-foreground truncate block max-w-[200px]">
            {item.ten_nguoi_tao ?? '—'}
          </span>
        );
      case 'tg_cap_nhat':
        return item.tg_cap_nhat ? (
          <span className="text-body-sm text-muted-foreground tabular-nums">{formatDate(item.tg_cap_nhat)}</span>
        ) : (
          <span className="text-xs text-muted-foreground italic">—</span>
        );
      case 'actions': {
        const canUp = canUpdateRow(item);
        const canDel = canDeleteRow(item);
        if (!canUp && !canDel) {
          return <span className="text-xs text-muted-foreground">—</span>;
        }
        return (
          <div className="flex items-center justify-center gap-0.5">
            {canUp ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
                className="p-2 text-primary hover:bg-primary/10 rounded-md transition-all"
                aria-label={t('common.edit')}
              >
                <Edit size={15} />
              </button>
            ) : null}
            {canDel ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-all"
                aria-label={t('common.delete')}
              >
                <Trash2 size={15} />
              </button>
            ) : null}
          </div>
        );
      }
      default:
        return null;
    }
  };

  const renderMobileCard = (item: GopY, isSelected: boolean) => (
    <div
      key={item.id}
      onClick={() => onView(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onView(item);
        }
      }}
      role="button"
      tabIndex={0}
      className={cn(
        'bg-card rounded-xl border p-3.5 shadow-sm transition-all active:scale-[0.98]',
        isSelected ? 'border-primary ring-2 ring-primary/10' : 'border-border',
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-foreground text-sm line-clamp-2 flex-1">{item.tieu_de_gop_y}</h4>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleSelection(item.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-border text-primary accent-primary cursor-pointer shrink-0"
          aria-label={t('common.select')}
        />
      </div>
      <div className="flex items-center gap-2 mb-2">{statusBadge(item)}</div>
      <p className="text-xs text-muted-foreground mb-2">{item.ngay ? formatDate(item.ngay) : '—'}</p>
      {canUpdateRow(item) || canDeleteRow(item) ? (
        <div className="flex justify-end gap-1.5 pt-2 border-t border-border">
          {canUpdateRow(item) ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              className="p-2 text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-all"
            >
              <Edit size={14} />
            </button>
          ) : null}
          {canDeleteRow(item) ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 rounded-lg transition-all"
            >
              <Trash2 size={14} />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  return (
    <GenericTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      loadingText={t('common.loadingData')}
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
      onRowClick={onView}
      keyExtractor={(item) => item.id}
      onResizeColumn={resizeColumn}
      stickyLeftCount={1}
      emptyTitle={t('gopY.dm.table.empty')}
    />
  );
};

export default GopYTable;
