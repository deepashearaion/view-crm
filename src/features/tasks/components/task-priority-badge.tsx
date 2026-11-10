import { Badge } from '@/components/ui/badge';

import { taskPriorityByValue } from '../constants';
import type { TaskPriority } from '../types';

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  const meta = taskPriorityByValue(priority);
  return <Badge variant={meta?.variant ?? 'secondary'}>{meta?.label ?? priority}</Badge>;
}
