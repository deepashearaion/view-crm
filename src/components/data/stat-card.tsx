import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  /** Secondary line, e.g. "12 deals" or a comparison. */
  hint?: ReactNode;
  /** Badge or marker next to the label (e.g. an AIBadge for forecasts). */
  badge?: ReactNode;
  loading?: boolean;
  className?: string;
}

/** Compact KPI tile. */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  badge,
  loading,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('gap-0 py-4', className)}>
      <CardContent className="space-y-2 px-4">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            {label}
            {badge}
          </p>
          {Icon && <Icon aria-hidden className="size-4 text-muted-foreground" />}
        </div>
        {loading ? (
          <Skeleton className="h-7 w-28" />
        ) : (
          <p className="font-heading text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
        )}
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
