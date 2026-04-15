import React from 'react';
import { cn } from '../../lib/utils';

interface SectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Mặc định 'primary' – tiêu đề section luôn màu primary. Dùng 'muted' chỉ khi section phụ, ít nhấn mạnh. */
  variant?: 'primary' | 'muted';
  /** Id cho anchor link (vd. TOC nhảy tới section) */
  id?: string;
  /** Cùng hàng tiêu đề, căn phải (vd. nút Thêm). */
  headerAction?: React.ReactNode;
}

/**
 * Section chung cho form và detail: card trắng, tiêu đề uppercase + icon, border-bottom.
 * FormSection và DetailSection dùng chung component này.
 * Quy ước: tiêu đề section luôn màu primary (variant mặc định 'primary'). Xem docs/UI-CONVENTIONS.md.
 */
const Section: React.FC<SectionProps> = ({ title, icon, children, className, variant = 'primary', id, headerAction }) => {
  const isPrimary = variant === 'primary';

  return (
    <div
      id={id}
      className={cn(
        'w-full bg-card p-3.5 sm:p-4 md:p-5 rounded-xl border border-border shadow-sm space-y-2.5 sm:space-y-3',
        id && 'scroll-mt-24',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-2 pb-2 sm:pb-2.5 border-b',
          isPrimary ? 'border-primary/20' : 'border-border',
        )}
      >
        <h4
          className={cn(
            'flex min-w-0 flex-1 items-center gap-1.5 text-xs font-semibold uppercase tracking-wider sm:gap-2',
            isPrimary ? 'font-bold text-primary' : 'text-muted-foreground',
          )}
        >
          {icon}
          <span className="truncate">{title}</span>
        </h4>
        {headerAction ? <div className="flex shrink-0 items-center">{headerAction}</div> : null}
      </div>
      {children}
    </div>
  );
};

export default Section;
