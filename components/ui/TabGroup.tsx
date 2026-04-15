import React from 'react';
import { cn } from '../../lib/utils';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ElementType;
}

interface TabGroupProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  /** Tab chia đều chiều ngang (vd. mobile). */
  fullWidth?: boolean;
  /** Nhiều tab: cuộn ngang, không ép flex-1 (vd. Truyền thống). */
  scrollable?: boolean;
  /** Lưới 2×2 (mobile) → 1×4 (sm+), mỗi ô tab full width — nhãn dài vẫn vừa. */
  equalGrid?: boolean;
}

const TabGroup: React.FC<TabGroupProps> = ({ tabs, activeTab, onChange, className, fullWidth, scrollable, equalGrid }) => {
  const tabButtons = tabs.map((tab) => {
    const isActive = tab.id === activeTab;
    const Icon = tab.icon;
    return (
      <button
        key={tab.id}
        type="button"
        role="tab"
        aria-selected={isActive}
        id={`tab-${tab.id}`}
        onClick={() => onChange(tab.id)}
        className={cn(
          'flex shrink-0 items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all select-none sm:px-3',
          equalGrid && 'min-h-[2.75rem] min-w-0 w-full flex-col gap-0.5 py-2 sm:min-h-0 sm:flex-row sm:py-1.5',
          fullWidth && !scrollable && !equalGrid && 'min-w-0 flex-1',
          isActive
            ? 'bg-card text-primary shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        {Icon && <Icon size={14} className="shrink-0" aria-hidden />}
        <span className={cn(equalGrid ? 'line-clamp-2 text-center text-[11px] leading-tight sm:line-clamp-1 sm:text-xs' : !scrollable && 'truncate')}>
          {tab.label}
        </span>
      </button>
    );
  });

  return (
    <div
      role="tablist"
      className={cn(
        'rounded-lg border border-border/50 bg-muted/50 p-0.5',
        equalGrid && 'grid w-full grid-cols-2 gap-0.5 sm:grid-cols-4',
        scrollable && !equalGrid ? 'no-scrollbar w-full max-w-full overflow-x-auto' : !equalGrid ? 'flex gap-0.5' : null,
        !equalGrid && !scrollable && fullWidth && 'w-full',
        !equalGrid && !scrollable && !fullWidth && 'w-fit',
        className,
      )}
    >
      {scrollable && !equalGrid ? <div className="flex w-max min-w-full flex-nowrap gap-0.5">{tabButtons}</div> : tabButtons}
    </div>
  );
};

export default TabGroup;
