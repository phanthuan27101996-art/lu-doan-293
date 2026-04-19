import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutList } from 'lucide-react';

export interface MoiNgayBrowseGridEntry {
  key: string;
  label: string;
  count: number;
}

export interface MoiNgayViewAllLead {
  count: number;
  onClick: () => void;
}

interface Props {
  entries: MoiNgayBrowseGridEntry[];
  onSelect: (key: string) => void;
  viewAllLead?: MoiNgayViewAllLead | null;
}

const MoiNgayMotLoiDayBacHoBrowseGrid: React.FC<Props> = ({ entries, onSelect, viewAllLead }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-0 flex-1 overflow-auto p-4">
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 list-none p-0 m-0">
        {viewAllLead ? (
          <li key="__view_all__">
            <button
              type="button"
              onClick={viewAllLead.onClick}
              className="group w-full flex flex-col items-start gap-2 rounded-xl border border-dashed border-primary/35 bg-primary/5 p-4 text-left shadow-sm transition-all hover:border-primary/50 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 min-h-[44px]"
              aria-label={t('common.browseViewAll')}
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <LayoutList className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                {t('common.browseViewAll')}
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {t('common.browseViewAllCount', { count: viewAllLead.count })}
              </span>
            </button>
          </li>
        ) : null}
        {entries.map((e) => (
          <li key={e.key}>
            <button
              type="button"
              onClick={() => onSelect(e.key)}
              className="group w-full flex flex-col items-start gap-1 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:border-primary/40 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 min-h-[44px]"
            >
              <span className="text-sm font-medium text-foreground font-mono tabular-nums">{e.label}</span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {t('moiNgayMotLoiDayBacHo.dm.browse.recordCount', { count: e.count })}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MoiNgayMotLoiDayBacHoBrowseGrid;
