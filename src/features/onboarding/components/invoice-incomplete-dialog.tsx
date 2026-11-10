import { Building2, CircleAlert, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { fieldReasonMessage } from '@/services';

import { incompleteFieldLabel } from '../constants';
import type { IncompleteField, InvoiceIncompleteErrors } from '../types';

interface InvoiceIncompleteDialogProps {
  errors: InvoiceIncompleteErrors | null;
  onOpenChange: (open: boolean) => void;
  /** Hidden for viewers, who can't edit the invoice. */
  onFixInvoice?: () => void;
  /** Undefined when the user can't edit the billing profile. */
  onOpenBillingProfile?: () => void;
}

function Checklist({ fields }: { fields: IncompleteField[] }) {
  return (
    <ul className="space-y-1.5">
      {fields.map(({ field, reason }) => (
        <li key={field} className="flex items-start gap-2 text-sm">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-destructive" />
          <span>
            <span className="font-medium">{incompleteFieldLabel(field)}</span>
            {reason !== 'required' && (
              <span className="text-muted-foreground"> · {fieldReasonMessage(reason)}</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Checklist shown when issuing answers `422 invoice_incomplete`. */
export function InvoiceIncompleteDialog({
  errors,
  onOpenChange,
  onFixInvoice,
  onOpenBillingProfile,
}: InvoiceIncompleteDialogProps) {
  const invoiceFields = errors?.invoice ?? [];
  const profileFields = errors?.billingProfile ?? [];
  return (
    <Dialog open={errors !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>A few details are missing</DialogTitle>
          <DialogDescription>
            A GST invoice needs these before it can be issued. Fill them in, then issue again.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {invoiceFields.length > 0 && (
            <section className="space-y-2 rounded-lg border p-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <FileText aria-hidden className="size-4 text-muted-foreground" />
                On this invoice
              </h3>
              <Checklist fields={invoiceFields} />
              {onFixInvoice && (
                <Button size="sm" variant="outline" onClick={onFixInvoice}>
                  Fix on invoice
                </Button>
              )}
            </section>
          )}
          {profileFields.length > 0 && (
            <section className="space-y-2 rounded-lg border p-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Building2 aria-hidden className="size-4 text-muted-foreground" />
                In your billing profile
              </h3>
              <Checklist fields={profileFields} />
              {onOpenBillingProfile ? (
                <Button size="sm" variant="outline" onClick={onOpenBillingProfile}>
                  Open billing profile
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Ask an owner, admin or manager to complete the billing profile.
                </p>
              )}
            </section>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
