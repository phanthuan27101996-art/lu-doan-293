import React from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2, Video, Link2, Play } from 'lucide-react';
import type { KhoVideo } from '../core/types';
import { useKhoVideoStore } from '../store/useKhoVideoStore';
import { cn, formatDate } from '../../../lib/utils';
import GenericTable from '../../../components/shared/GenericTable';
import { getYoutubeThumbnailUrl, parseYoutubeVideoId } from '../utils/youtube';

interface Props {
  data: KhoVideo[];
  isLoading: boolean;
  onEdit: (item: KhoVideo) => void;
  onDelete: (id: string) => void;
  onView: (item: KhoVideo) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

const KhoVideoTable: React.FC<Props> = ({
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
  } = useKhoVideoStore();

  const renderCell = (colId: string, item: KhoVideo) => {
    switch (colId) {
      case 'bo_suu_tap':
        return (
          <span className="text-body-sm font-medium text-foreground truncate block max-w-[260px]">
            {item.bo_suu_tap?.trim() || '—'}
          </span>
        );
      case 'ten_video':
        return (
          <div className="flex items-start gap-2 min-w-0">
            <Video size={14} className="text-primary shrink-0 mt-0.5" aria-hidden />
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-foreground text-sm line-clamp-2">{item.ten_video}</span>
              <span className="text-xs text-muted-foreground font-mono truncate">id {item.id}</span>
            </div>
          </div>
        );
      case 'ghi_chu':
        return (
          <span className="text-body-sm text-muted-foreground line-clamp-2 block max-w-[200px] whitespace-pre-wrap">
            {item.ghi_chu?.trim() || '—'}
          </span>
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

  /** Cột trái: preview (thumbnail YouTube hoặc icon); phải: tên + người tạo · ngày */
  const renderKhoVideoCard = (item: KhoVideo, isSelected: boolean) => {
    const ytId = parseYoutubeVideoId(item.link);
    const thumb = ytId ? getYoutubeThumbnailUrl(ytId, 'mq') : null;

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
        <div className="w-36 shrink-0 rounded-lg border border-border/60 overflow-hidden bg-muted/40 aspect-video max-h-[6.75rem] relative flex items-center justify-center">
          {thumb ? (
            <>
              <img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
              <span
                className="relative z-[1] inline-flex items-center justify-center w-11 h-11 rounded-full bg-black/55 text-white shadow-md pointer-events-none"
                aria-hidden
              >
                <Play size={22} className="ml-0.5" fill="currentColor" />
              </span>
            </>
          ) : (
            <Video className="w-12 h-12 text-muted-foreground/45" aria-hidden />
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-foreground text-sm line-clamp-2 flex-1 min-w-0 leading-snug">{item.ten_video}</h4>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleSelection(item.id)}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 rounded border-border text-primary accent-primary cursor-pointer shrink-0 mt-0.5"
              aria-label={t('common.select')}
            />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-foreground/90">{item.ten_nguoi_tao ?? '—'}</span>
            <span className="mx-1.5 text-border select-none" aria-hidden>
              ·
            </span>
            <span className="tabular-nums">{item.tg_tao ? formatDate(item.tg_tao) : '—'}</span>
          </p>
          <p className="text-[11px] text-muted-foreground/90 truncate" title={item.bo_suu_tap ?? undefined}>
            {item.bo_suu_tap?.trim() || '—'}
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
      renderMobileCard={renderKhoVideoCard}
      renderDesktopCard={renderKhoVideoCard}
      onRowClick={onView}
      keyExtractor={(item) => item.id}
      onResizeColumn={resizeColumn}
      stickyLeftCount={1}
      emptyTitle={t('khoVideo.dm.table.empty')}
    />
  );
};

export default KhoVideoTable;
