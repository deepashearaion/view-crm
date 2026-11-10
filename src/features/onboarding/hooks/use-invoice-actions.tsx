import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { permissions, useSessionRole } from '@/features/auth';
import { errorMessage } from '@/services';

import { invoiceErrorMessage, isStaleInvoiceError } from '../api/errors';
import { downloadInvoicePdf, invoiceIncompleteErrors, openInvoicePdf } from '../api/invoices';
import { CancelInvoiceDialog } from '../components/cancel-invoice-dialog';
import { InvoiceIncompleteDialog } from '../components/invoice-incomplete-dialog';
import { invoiceKeys, invoicePaths } from '../constants';
import type { Invoice, InvoiceIncompleteErrors } from '../types';
import {
  useCancelInvoice,
  useDeleteInvoice,
  useIssueInvoice,
  useSendInvoice,
} from './use-invoices';

type ConfirmKind = 'issue' | 'send' | 'delete';

export interface InvoiceActions {
  issue: (invoice: Invoice) => void;
  send: (invoice: Invoice) => void;
  cancel: (invoice: Invoice) => void;
  remove: (invoice: Invoice, options?: { onDeleted?: () => void }) => void;
  download: (invoice: Invoice) => void;
  openPdf: (invoice: Invoice) => void;
}

const label = (invoice: Invoice) => invoice.number ?? 'this draft';

/**
 * Issue / send / cancel / delete / PDF for invoices, with their confirm dialogs, the
 * missing-details checklist and error toasts. Render `dialogs` once in the page.
 */
export function useInvoiceActions(): { actions: InvoiceActions; dialogs: ReactNode } {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const role = useSessionRole();
  const canEdit = permissions.canEdit(role);
  const canManageSettings = permissions.canManageSettings(role);
  const issueInvoice = useIssueInvoice();
  const sendInvoice = useSendInvoice();
  const cancelInvoice = useCancelInvoice();
  const deleteInvoice = useDeleteInvoice();

  const [confirm, setConfirm] = useState<{
    kind: ConfirmKind;
    invoice: Invoice;
    onDeleted?: () => void;
  } | null>(null);
  const [cancelling, setCancelling] = useState<Invoice | null>(null);
  const [incomplete, setIncomplete] = useState<{
    invoice: Invoice;
    errors: InvoiceIncompleteErrors;
  } | null>(null);

  const fail = useCallback(
    (fallback: string) => (error: Error) => {
      toast.error(invoiceErrorMessage(error, fallback));
      // Someone else changed the invoice: show its current state.
      if (isStaleInvoiceError(error))
        void queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
    [queryClient],
  );

  const actions = useMemo<InvoiceActions>(
    () => ({
      issue: (invoice) => {
        setConfirm({ kind: 'issue', invoice });
      },
      send: (invoice) => {
        setConfirm({ kind: 'send', invoice });
      },
      cancel: (invoice) => {
        setCancelling(invoice);
      },
      remove: (invoice, options) => {
        setConfirm({ kind: 'delete', invoice, onDeleted: options?.onDeleted });
      },
      download: (invoice) => {
        toast.promise(downloadInvoicePdf(invoice.id, invoice.number ?? undefined), {
          loading: 'Preparing the PDF…',
          success: 'PDF downloaded.',
          error: (error: unknown) => errorMessage(error, 'Couldn’t download the PDF.'),
        });
      },
      openPdf: (invoice) => {
        openInvoicePdf(invoice.id).catch((error: unknown) => {
          toast.error(errorMessage(error, 'Couldn’t open the PDF.'));
        });
      },
    }),
    [],
  );

  const runConfirm = () => {
    if (!confirm) return;
    const { kind, invoice, onDeleted } = confirm;
    const close = () => {
      setConfirm(null);
    };
    if (kind === 'issue') {
      issueInvoice.mutate(invoice.id, {
        onSuccess: (issued) => {
          toast.success(`Invoice ${issued.number ?? ''} issued.`);
          close();
        },
        onError: (error) => {
          close();
          const errors = invoiceIncompleteErrors(error);
          if (errors) setIncomplete({ invoice, errors });
          else fail('Couldn’t issue the invoice.')(error);
        },
      });
    } else if (kind === 'send') {
      sendInvoice.mutate(invoice.id, {
        onSuccess: (sent) => {
          toast.success(`Invoice emailed to ${sent.billToEmail}.`);
          close();
        },
        onError: (error) => {
          close();
          fail('Couldn’t send the invoice.')(error);
        },
      });
    } else {
      deleteInvoice.mutate(invoice.id, {
        onSuccess: () => {
          toast.success('Draft deleted.');
          close();
          onDeleted?.();
        },
        onError: (error) => {
          close();
          fail('Couldn’t delete the draft.')(error);
        },
      });
    }
  };

  const confirmCopy: Record<
    ConfirmKind,
    (invoice: Invoice) => { title: string; description: string; label: string }
  > = {
    issue: () => ({
      title: 'Issue this invoice?',
      description:
        'It gets the next invoice number and is frozen: you won’t be able to edit or delete it afterwards, only cancel it.',
      label: 'Issue invoice',
    }),
    send: (invoice) => ({
      title: `Email ${label(invoice)}?`,
      description: `The PDF will be emailed to ${invoice.billToEmail || 'the bill-to email'}.`,
      label: invoice.sentAt ? 'Send again' : 'Send invoice',
    }),
    delete: () => ({
      title: 'Delete this draft?',
      description: 'The draft invoice is permanently removed.',
      label: 'Delete',
    }),
  };
  const copy = confirm ? confirmCopy[confirm.kind](confirm.invoice) : undefined;

  const dialogs = (
    <>
      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
        title={copy?.title}
        description={copy?.description}
        confirmLabel={copy?.label}
        destructive={confirm?.kind === 'delete'}
        pending={issueInvoice.isPending || sendInvoice.isPending || deleteInvoice.isPending}
        onConfirm={runConfirm}
      />
      <CancelInvoiceDialog
        invoice={cancelling}
        pending={cancelInvoice.isPending}
        onOpenChange={(open) => {
          if (!open) setCancelling(null);
        }}
        onConfirm={(reason) => {
          if (!cancelling) return;
          cancelInvoice.mutate(
            { id: cancelling.id, reason },
            {
              onSuccess: (cancelled) => {
                toast.success(`Invoice ${cancelled.number ?? ''} cancelled.`);
                setCancelling(null);
              },
              onError: (error) => {
                setCancelling(null);
                fail('Couldn’t cancel the invoice.')(error);
              },
            },
          );
        }}
      />
      <InvoiceIncompleteDialog
        errors={incomplete?.errors ?? null}
        onOpenChange={(open) => {
          if (!open) setIncomplete(null);
        }}
        onFixInvoice={
          canEdit && incomplete
            ? () => {
                const { invoice, errors } = incomplete;
                setIncomplete(null);
                void navigate(
                  invoicePaths.fix(
                    invoice.id,
                    errors.invoice.map((item) => item.field),
                  ),
                );
              }
            : undefined
        }
        onOpenBillingProfile={
          canManageSettings && incomplete
            ? () => {
                const { errors } = incomplete;
                setIncomplete(null);
                void navigate(
                  invoicePaths.fixProfile(errors.billingProfile.map((item) => item.field)),
                );
              }
            : undefined
        }
      />
    </>
  );

  return { actions, dialogs };
}
