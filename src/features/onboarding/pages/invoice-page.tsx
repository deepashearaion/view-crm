import { AlertTriangle, FileQuestion } from 'lucide-react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/empty-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccess } from '@/features/auth';
import { useContacts } from '@/features/contacts';
import { useDeals } from '@/features/deals';
import { errorMessage, isHttpError } from '@/services';

import { InvoiceEditor } from '../components/invoice-editor';
import { InvoiceView } from '../components/invoice-view';
import { invoicePaths } from '../constants';
import { useBillingProfile } from '../hooks/use-billing-profile';
import { useInvoiceActions } from '../hooks/use-invoice-actions';
import { useInvoice } from '../hooks/use-invoices';

function InvoiceSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 sm:p-6" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

/** `/invoices/new` (create) and `/invoices/:invoiceId` (edit a draft, or view). */
export default function InvoicePage({ create = false }: { create?: boolean }) {
  const navigate = useNavigate();
  const { invoiceId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const access = useAccess();
  const canCreate = access.can('invoices', 'create');
  const canEdit = access.can('invoices', 'edit');
  const canDelete = access.can('invoices', 'delete');
  const profileQuery = useBillingProfile();
  const invoiceQuery = useInvoice(create ? undefined : invoiceId);
  const { data: contacts = [] } = useContacts();
  const { data: deals = [] } = useDeals();
  const { actions, dialogs } = useInvoiceActions();

  const backToList = () => {
    void navigate(invoicePaths.list, { replace: true });
  };
  const profileReady = !profileQuery.isPending;

  if (create) {
    if (!canCreate) {
      return (
        <div className="p-4 sm:p-6">
          <EmptyState
            icon={FileQuestion}
            title="You can’t create invoices"
            description="Your role doesn’t allow creating invoices. Ask an admin if you need to raise them."
            actions={
              <Button variant="outline" asChild>
                <Link to={invoicePaths.list}>Back to invoices</Link>
              </Button>
            }
          />
        </div>
      );
    }
    return (
      <>
        <InvoiceEditor
          profile={profileQuery.data}
          profileReady={profileReady}
          initialDealId={searchParams.get('deal') ?? undefined}
          initialContactId={searchParams.get('contact') ?? undefined}
          onCreated={(invoice) => {
            void navigate(invoicePaths.detail(invoice.id), { replace: true });
          }}
          onSaved={() => undefined}
          onDeleted={backToList}
          canDelete={canDelete}
          actions={actions}
        />
        {dialogs}
      </>
    );
  }

  if (invoiceQuery.isPending) return <InvoiceSkeleton />;

  if (invoiceQuery.isError) {
    const notFound = isHttpError(invoiceQuery.error) && invoiceQuery.error.status === 404;
    return (
      <div className="p-4 sm:p-6">
        <EmptyState
          icon={notFound ? FileQuestion : AlertTriangle}
          title={notFound ? 'Invoice not found' : 'Couldn’t load the invoice'}
          description={
            notFound
              ? 'It may have been deleted, or you don’t have access to it.'
              : errorMessage(invoiceQuery.error, 'Please try again.')
          }
          actions={
            <>
              {!notFound && (
                <Button variant="outline" onClick={() => void invoiceQuery.refetch()}>
                  Try again
                </Button>
              )}
              <Button variant={notFound ? 'outline' : 'ghost'} asChild>
                <Link to={invoicePaths.list}>Back to invoices</Link>
              </Button>
            </>
          }
        />
      </div>
    );
  }

  const invoice = invoiceQuery.data;
  const contactName = contacts.find((contact) => contact.id === invoice.contactId)?.fullName;
  const dealTitle = deals.find((deal) => deal.id === invoice.dealId)?.title;

  return (
    <>
      {invoice.status === 'draft' && canEdit ? (
        <InvoiceEditor
          invoice={invoice}
          profile={profileQuery.data}
          profileReady={profileReady}
          fix={searchParams.get('fix') ?? ''}
          onCreated={() => undefined}
          onSaved={() => {
            if (searchParams.has('fix'))
              setSearchParams(
                (params) => {
                  params.delete('fix');
                  return params;
                },
                { replace: true },
              );
          }}
          onDeleted={backToList}
          canDelete={canDelete}
          actions={actions}
        />
      ) : (
        <InvoiceView
          invoice={invoice}
          contactName={contactName}
          dealTitle={dealTitle}
          canSend={canEdit}
          canCancel={access.canAll('invoices', 'delete')}
          actions={actions}
        />
      )}
      {dialogs}
    </>
  );
}
