import { Badge } from '@/components/ui/badge';

import { companyStatusByValue } from '../constants';

export function CompanyStatusBadge({ status }: { status: string }) {
  const meta = companyStatusByValue(status);
  return (
    <Badge variant={meta?.variant ?? 'outline'}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {meta?.label ?? status}
    </Badge>
  );
}
