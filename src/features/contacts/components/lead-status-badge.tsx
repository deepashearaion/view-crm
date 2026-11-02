import { Badge } from '@/components/ui/badge';

import { leadStatusById } from '../constants';

export function LeadStatusBadge({ statusId }: { statusId: number | null }) {
  const status = leadStatusById(statusId);
  if (!status) return <Badge variant="outline">No status</Badge>;
  return (
    <Badge variant={status.variant}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {status.label}
    </Badge>
  );
}
