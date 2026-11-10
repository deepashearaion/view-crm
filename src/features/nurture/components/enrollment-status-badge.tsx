import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { ENROLLMENT_STATUSES } from '../constants';
import type { EnrollmentStatus } from '../types';

const STATUS_CLASSES: Record<EnrollmentStatus, string> = {
  active: 'border-success/30 bg-success/10 text-success',
  completed: 'border-transparent bg-secondary text-secondary-foreground',
  stopped: 'border-border text-muted-foreground',
};

export function EnrollmentStatusBadge({ status }: { status: EnrollmentStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_CLASSES[status])}>
      {ENROLLMENT_STATUSES.find((item) => item.value === status)?.label ?? status}
    </Badge>
  );
}
