import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2, Scale, Link2, Paperclip, ImageIcon } from 'lucide-react';
import type { MoiTuanMotDieuLuat } from '../core/types';
import { useMoiTuanMotDieuLuatStore } from '../store/useMoiTuanMotDieuLuatStore';
import { cn, formatDate } from '../../../lib/utils';
import GenericTable from '../../../components/shared/GenericTable';

interface Props {
  data: MoiTuanMotDieuLuat[];
  isLoading: boolean;
  onEdit: (item: MoiTuanMotDieuLuat) => void;
  onDelete: (id: string) => void;
  onView: (item: MoiTuanMotDieuLuat) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

const MoiTuanMotDieuLuatTable: React.FC<Props> = ({
  data,
  isLoading,
  onEdit,
  onDelete,
  onView,
  canUpdate = true,
  canDelete = true,
}) => {
  const { t } = useTranslation();
  const [brokenImg, setBrokenImg] = useState<Record<string, boolean>>({});
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
  } = useMoiTuanMotDieuLuatStore();

  const renderCell = (colId: string, item: MoiTuanMotDieuLuat) => {
    switch (colId) {
      case 'nam_thang_tuan':
        return (
          <span className="text-body-sm font-medium text-foreground tabular-nums">
            {item.nam_thang_tuan?.trim() || '—'}
          </span>
        );
      case 'ten_dieu_luat':
        return (
          <div className="flex items-start gap-2 min-w-0">
            <Scale size={14} className="text-primary shrink-0 mt-0.5" aria-hidden />
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-foreground text-sm line-clamp-2">{item.ten_dieu_luat}</span>
              <span className="text-xs text-muted-foreground font-mono truncate">id {item.id}</span>
            </div>
          </div>
        );
      case 'hinh_anh': {
        if (item.hinh_anh && !brokenImg[item.id]) {
          return (
            <>
              {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- onError: fallback khi URL ảnh lỗi */}
              <img
                src={item.hinh_anh}
                alt=""
                className="h-10 w-10 rounded-md object-cover border border-border"
                onError={() => setBrokenImg((prev) => ({ ...prev, [item.id]: true }))}
              />
            </>
          );
        }
        if (item.hinh_anh) {
          return (
            <a
              href={item.hinh_anh}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ImageIcon size={12} aria-hidden />
              <span className="truncate max-w-[80px]">{t('moiTuanMotDieuLuat.dm.table.openImage')}</span>
            </a>
          );
        }
        return <span className="text-xs text-muted-foreground italic">—</span>;
      }
      case 'tep_dinh_kem':
        return item.tep_dinh_kem ? (
          <a
            href={item.tep_dinh_kem}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline truncate max-w-[140px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Paperclip size={12} className="shrink-0" aria-hidden />
            <span className="truncate">{t('moiTuanMotDieuLuat.dm.table.openFile')}</span>
          </a>
        ) : (
          <span className="text-xs text-muted-foreground italic">—</span>
        );
      case 'link':
        return item.link ? (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline truncate max-w-[200px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Link2 size={12} className="shrink-0" aria-hidden />
            <span className="truncate">{item.link}</span>
          </a>
        ) : (
          <span className="text-xs text-muted-foreground italic">—</span>
        );
      case 'ten_nguoi_tao':
        return (
          <span className="text-body-sm text-foreground truncate block max-w-[180px]">
            {item.ten_nguoi_tao ?? '—'}
          </span>
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
                aria-label={t('common.edit')}
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
                aria-label={t('common.delete')}
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

  /** Thẻ 2 cột: ảnh minh họa | tên điều luật + (người tạo · ngày tạo) */
  const renderDieuLuatCard = (item: MoiTuanMotDieuLuat, isSelected: boolean) => {
    const src = item.hinh_anh?.trim() || null;
    const showThumb = Boolean(src && !brokenImg[item.id]);
    return (
      <div
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
          'bg-card rounded-xl border p-3.5 shadow-sm transition-all active:scale-[0.98] flex gap-3 min-h-[5.75rem]',
          isSelected ? 'border-primary ring-2 ring-primary/10' : 'border-border',
        )}
      >
        <div className="w-28 shrink-0 rounded-lg border border-border/60 overflow-hidden bg-muted/40 aspect-[4/3] max-h-[6.5rem] flex items-center justify-center">
          {showThumb ? (
            <>
              {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- onError: đổi sang placeholder */}
              <img
                src={src!}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => setBrokenImg((prev) => ({ ...prev, [item.id]: true }))}
              />
            </>
          ) : (
            <ImageIcon className="w-10 h-10 text-muted-foreground/50" aria-hidden />
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-foreground text-sm line-clamp-2 flex-1 min-w-0 leading-snug">{item.ten_dieu_luat}</h4>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleSelection(item.id)}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 rounded border-border text-primary accent-primary cursor-pointer shrink-0 mt-0.5"
              aria-label={t('common.select')}
            />
          </div>
          <p className="text-xs font-mono text-muted-foreground tabular-nums">{item.nam_thang_tuan?.trim() || '—'}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-foreground/90">{item.ten_nguoi_tao ?? '—'}</span>
            <span className="mx-1.5 text-border select-none" aria-hidden>
              ·
            </span>
            <span className="tabular-nums">{item.tg_tao ? formatDate(item.tg_tao) : '—'}</span>
          </p>

          {canUpdate || canDelete ? (
            <div className="flex justify-end gap-1.5 pt-1 border-t border-border/60 -mx-0.5">
              {canUpdate ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(item);
                  }}
                  className="p-2 text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-all"
                  aria-label={t('common.edit')}
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
                  className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 rounded-lg transition-all"
                  aria-label={t('common.delete')}
                >
                  <Trash2 size={14} />
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    );
  };

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
      renderMobileCard={renderDieuLuatCard}
      onRowClick={onView}
      keyExtractor={(item) => item.id}
      onResizeColumn={resizeColumn}
      stickyLeftCount={1}
      emptyTitle={t('moiTuanMotDieuLuat.dm.table.empty')}
    />
  );
};

export default MoiTuanMotDieuLuatTable;
