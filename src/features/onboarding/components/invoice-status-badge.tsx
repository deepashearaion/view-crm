import { MailCheck } from 'lucide-react';
import type { ComponentProps } from 'react';

import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/format';

import { INVOICE_STATUSES } from '../constants';
import type { InvoiceStatus } from '../types';

const styles: Record<
  InvoiceStatus,
  { variant: ComponentProps<typeof Badge>['variant']; className?: string }
> = {
  draft: { variant: 'outline', className: 'border-dashed text-muted-foreground' },
  issued: { variant: 'outline', className: 'border-success/30 text-success' },
  cancelled: { variant: 'outline', className: 'text-muted-foreground line-through' },
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const label = INVOICE_STATUSES.find((item) => item.value === status)?.label ?? status;
  return (
    <Badge variant={styles[status].variant} className={styles[status].className}>
      {label}
    </Badge>
  );
}

/** "Sent" marker for invoices emailed to the customer. */
export function InvoiceSentBadge({ sentAt }: { sentAt: string }) {
  return (
    <Badge variant="secondary" title={`Emailed ${formatDateTime(sentAt)}`}>
      <MailCheck aria-hidden data-icon="inline-start" />
      Sent
    </Badge>
  );
}
