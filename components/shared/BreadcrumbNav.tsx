import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { BreadcrumbSegment } from '../../lib/breadcrumb-routes';

export type BreadcrumbNavProps = {
  segments: BreadcrumbSegment[];
  className?: string;
};

const resolveLabel = (seg: BreadcrumbSegment, t: (key: string, options?: Record<string, string>) => string) =>
  seg.interpolation != null ? t(seg.labelKey, seg.interpolation) : t(seg.labelKey);

const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ segments, className }) => {
  const { t } = useTranslation();

  return (
    <nav aria-label={t('nav.breadcrumb')} className={cn('min-w-0', className)}>
      <ol className="flex list-none items-center gap-1 min-w-0 p-0 m-0 text-xs text-muted-foreground">
        {segments.map((seg, index) => {
          const isLast = index === segments.length - 1;
          const label = resolveLabel(seg, t);
          return (
            <li key={`${seg.to}-${seg.labelKey}-${index}`} className="flex items-center gap-1 min-w-0">
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" aria-hidden />
              )}
              {isLast ? (
                <span className="font-semibold text-foreground truncate" aria-current="page">
                  {label}
                </span>
              ) : (
                <Link
                  to={seg.to}
                  className={cn(
                    'truncate font-medium text-muted-foreground hover:text-primary',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm'
                  )}
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default BreadcrumbNav;
