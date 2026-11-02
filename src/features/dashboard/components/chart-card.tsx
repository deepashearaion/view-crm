import type { ReactNode } from 'react';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyText?: string;
  children: ReactNode;
  className?: string;
}

/** Card shell for dashboard widgets with loading and empty states. */
export function ChartCard({
  title,
  description,
  action,
  loading,
  empty,
  emptyText = 'No data yet.',
  children,
  className,
}: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-56 w-full" />
        ) : empty ? (
          <p className="flex h-56 items-center justify-center text-sm text-muted-foreground">
            {emptyText}
          </p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
