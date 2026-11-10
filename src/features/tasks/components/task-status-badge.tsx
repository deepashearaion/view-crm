import type { ComponentProps } from 'react';

import { Badge } from '@/components/ui/badge';

import { TASK_STATUSES } from '../constants';
import type { TaskDisplayStatus } from '../types';

const styles: Record<
  TaskDisplayStatus,
  { variant: ComponentProps<typeof Badge>['variant']; className?: string }
> = {
  overdue: { variant: 'destructive' },
  upcoming: { variant: 'secondary' },
  no_due_date: { variant: 'outline', className: 'text-muted-foreground' },
  done: { variant: 'outline', className: 'border-success/30 text-success' },
  cancelled: { variant: 'outline', className: 'text-muted-foreground' },
};

export function TaskStatusBadge({ status }: { status: TaskDisplayStatus }) {
  const label = TASK_STATUSES.find((item) => item.value === status)?.label ?? status;
  return (
    <Badge variant={styles[status].variant} className={styles[status].className}>
      {label}
    </Badge>
  );
}
