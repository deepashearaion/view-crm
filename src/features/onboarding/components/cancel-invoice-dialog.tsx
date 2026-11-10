import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { FormTextarea } from '@/components/form/form-textarea';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { cancelInvoiceSchema } from '../schemas';
import type { Invoice } from '../types';

const FORM_ID = 'cancel-invoice-form';

interface CancelInvoiceDialogProps {
  invoice: Invoice | null;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
}

/** Asks for the cancellation reason printed on the cancelled invoice. */
export function CancelInvoiceDialog({
  invoice,
  pending,
  onOpenChange,
  onConfirm,
}: CancelInvoiceDialogProps) {
  const form = useForm<{ reason: string }>({
    resolver: zodResolver(cancelInvoiceSchema),
    defaultValues: { reason: '' },
  });

  useEffect(() => {
    if (invoice) form.reset({ reason: '' });
  }, [invoice, form]);

  const onSubmit = form.handleSubmit(({ reason }) => {
    onConfirm(reason);
  });

  return (
    <Dialog
      open={invoice !== null}
      onOpenChange={(open) => {
        if (!pending) onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel invoice {invoice?.number ?? ''}?</DialogTitle>
          <DialogDescription>
            The invoice stays on record as cancelled and its number is not reused. This can’t be
            undone.
          </DialogDescription>
        </DialogHeader>
        <form id={FORM_ID} onSubmit={(event) => void onSubmit(event)} noValidate>
          <FormTextarea
            control={form.control}
            name="reason"
            label="Reason"
            rows={3}
            placeholder="e.g. Raised in error, customer cancelled the booking"
            autoFocus
          />
        </form>
        <DialogFooter>
          <Button
            variant="ghost"
            disabled={pending}
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Keep invoice
          </Button>
          <Button type="submit" form={FORM_ID} variant="destructive" disabled={pending}>
            {pending ? 'Cancelling…' : 'Cancel invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
