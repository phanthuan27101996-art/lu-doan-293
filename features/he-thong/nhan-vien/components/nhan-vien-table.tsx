import React from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2, Phone, Briefcase } from 'lucide-react';
import { Employee } from '../core/types';
import { useEmployeeStore } from '../store/useEmployeeStore';
import { cn, formatDate, getAvatarUrl } from '../../../../lib/utils';
import GenericTable from '../../../../components/shared/GenericTable';

interface Props {
  data: Employee[];
  isLoading: boolean;
  onEdit: (item: Employee) => void;
  onDelete: (id: string) => void;
  onView: (item: Employee) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

const EmployeeTable: React.FC<Props> = ({
  data,
  isLoading,
  onEdit,
  onDelete,
  onView,
  canUpdate = true,
  canDelete = true,
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
  } = useEmployeeStore();

  const renderCell = (colId: string, item: Employee) => {
    switch (colId) {
      case 'ho_ten':
        return (
          <div className="flex items-center gap-2.5">
            <img
              src={item.anh_dai_dien || getAvatarUrl(item.ho_ten ?? '')}
              className="w-8 h-8 rounded-full border border-border shadow-sm object-cover shrink-0"
              alt={item.ho_ten}
            />
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-foreground text-sm truncate">{item.ho_ten}</span>
              <span className="text-xs text-muted-foreground font-mono truncate">id {item.id}</span>
            </div>
          </div>
        );
      case 'lien_he':
        return (
          <div className="flex items-center gap-1.5 text-body-sm text-foreground">
            <Phone size={12} className="text-primary/60 shrink-0" /> {item.so_dien_thoai || '—'}
          </div>
        );
      case 'ten_chuc_vu':
        return (
          <div className="flex items-center gap-1.5 text-body-sm font-semibold text-foreground">
            <Briefcase size={11} className="text-primary shrink-0" />
            <span className="truncate">{item.ten_chuc_vu || t('employee.unassigned')}</span>
          </div>
        );
      case 'tg_tao':
        return item.tg_tao ? (
          <span className="text-body-sm text-muted-foreground tabular-nums">{formatDate(item.tg_tao)}</span>
        ) : (
          <span className="text-xs text-muted-foreground italic">—</span>
        );
      case 'tg_cap_nhat':
        return item.tg_cap_nhat ? (
          <span className="text-body-sm text-muted-foreground tabular-nums">{formatDate(item.tg_cap_nhat)}</span>
        ) : (
          <span className="text-xs text-muted-foreground italic">—</span>
        );
      case 'actions':
        if (!canUpdate && !canDelete) {
          return <span className="text-xs text-muted-foreground">—</span>;
        }
        return (
          <div className="flex items-center justify-center gap-0.5">
            {canUpdate ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
                className="p-2 text-primary hover:bg-primary/10 rounded-md transition-all"
              >
                <Edit size={15} />
              </button>
            ) : null}
            {canDelete ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-all"
              >
                <Trash2 size={15} />
              </button>
            ) : null}
          </div>
        );
      default:
        return null;
    }
  };

  const renderMobileCard = (item: Employee, isSelected: boolean) => (
    <div
      key={item.id}
      onClick={() => onView(item)}
      className={cn(
        'bg-card rounded-xl border p-3.5 shadow-sm transition-all active:scale-[0.98]',
        isSelected ? 'border-primary ring-2 ring-primary/10' : 'border-border',
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <img
          src={item.anh_dai_dien || getAvatarUrl(item.ho_ten ?? '')}
          className="w-11 h-11 rounded-lg border border-border shadow-sm object-cover shrink-0"
          alt={item.ho_ten}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground text-sm truncate">{item.ho_ten}</h4>
            <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelection(item.id)}
                className="w-4 h-4 rounded border-border text-primary accent-primary cursor-pointer"
                aria-label={t('common.select')}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">id {item.id}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 px-3 py-2 bg-muted/30 rounded-lg mb-3 text-body-sm">
        <div>
          <p className="text-muted-foreground mb-0.5">{t('employee.position')}</p>
          <p className="font-medium text-foreground truncate">{item.ten_chuc_vu || '—'}</p>
        </div>
      </div>
      <div className="flex justify-between items-center pt-2.5 border-t border-border">
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <Phone size={12} />
          <span>{item.so_dien_thoai}</span>
        </div>
        {canUpdate || canDelete ? (
          <div className="flex gap-1.5">
            {canUpdate ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
                className="p-2 text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-all active:scale-90"
              >
                <Edit size={14} />
              </button>
            ) : null}
            {canDelete ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 rounded-lg transition-all active:scale-90"
              >
                <Trash2 size={14} />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
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
    />
  );
};

export default EmployeeTable;
