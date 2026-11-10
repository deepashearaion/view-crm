import { Plus, Receipt, Settings2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { DataTable } from '@/components/data/data-table';
import { PageHeader } from '@/components/data/page-header';
import { SearchInput } from '@/components/data/search-input';
import { EmptyState } from '@/components/feedback/empty-state';
import { WorkflowBadge } from '@/components/feedback/workflow-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { permissions, useSessionRole } from '@/features/auth';
import { useContacts } from '@/features/contacts';
import { useDeals } from '@/features/deals';
import { toIstDate } from '@/lib/format';

import { getInvoiceColumns } from '../components/invoice-columns';
import { invoicePaths } from '../constants';
import { useInvoiceActions } from '../hooks/use-invoice-actions';
import { useAllInvoices } from '../hooks/use-invoices';
import type { InvoiceStatus } from '../types';

type Tab = InvoiceStatus | 'all';

const TABS: { value: Tab; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'issued', label: 'Issued' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'all', label: 'All' },
];

const EMPTY: Record<Tab, { title: string; description: string }> = {
  draft: {
    title: 'No drafts to review',
    description: 'When a deal is won, its draft invoice shows up here for review.',
  },
  issued: {
    title: 'No issued invoices yet',
    description: 'Issue a draft to give it a number and send it to the customer.',
  },
  cancelled: { title: 'No cancelled invoices', description: 'Cancelled invoices are kept here.' },
  all: {
    title: 'No invoices yet',
    description: 'Won deals get a draft invoice automatically, or you can create one yourself.',
  },
};

export default function InvoicesPage() {
  const navigate = useNavigate();
  const role = useSessionRole();
  const canEdit = permissions.canEdit(role);
  const { data: invoices = [], isPending, error, refetch } = useAllInvoices();
  const { data: contacts = [] } = useContacts();
  const { data: deals = [] } = useDeals();
  const { actions, dialogs } = useInvoiceActions();
  const [tab, setTab] = useState<Tab>('draft');
  const [search, setSearch] = useState('');

  const contactNames = useMemo(
    () => new Map(contacts.map((contact) => [contact.id, contact.fullName])),
    [contacts],
  );
  const dealTitles = useMemo(() => new Map(deals.map((deal) => [deal.id, deal.title])), [deals]);

  const counts = useMemo(() => {
    const result: Record<Tab, number> = { draft: 0, issued: 0, cancelled: 0, all: 0 };
    for (const invoice of invoices) {
      result[invoice.status]++;
      result.all++;
    }
    return result;
  }, [invoices]);

  const visible = useMemo(
    () => (tab === 'all' ? invoices : invoices.filter((invoice) => invoice.status === tab)),
    [invoices, tab],
  );

  const columns = useMemo(
    () =>
      getInvoiceColumns({
        contactName: (id) => (id ? contactNames.get(id) : undefined),
        dealTitle: (id) => (id ? dealTitles.get(id) : undefined),
        canEdit,
        today: toIstDate(new Date()),
        onOpen: (invoice) => {
          void navigate(invoicePaths.detail(invoice.id));
        },
        actions,
      }),
    [contactNames, dealTitles, canEdit, navigate, actions],
  );

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Invoices"
        description="GST invoices for your customers. Review drafts, issue them and email the PDF."
        badges={
          <WorkflowBadge
            kind="ai"
            label="Automatic"
            title="Won deals get a draft invoice automatically."
          />
        }
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to={invoicePaths.settings}>
                <Settings2 aria-hidden />
                Billing profile
              </Link>
            </Button>
            {canEdit && (
              <Button asChild>
                <Link to={invoicePaths.create}>
                  <Plus aria-hidden />
                  New invoice
                </Link>
              </Button>
            )}
          </>
        }
      />

      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value as Tab);
        }}
      >
        <TabsList>
          {TABS.map((item) => (
            <TabsTrigger key={item.value} value={item.value} className="gap-2">
              {item.label}
              <Badge variant="secondary" className="h-4.5 min-w-5 px-1.5 tabular-nums">
                {counts[item.value]}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DataTable
        key={tab}
        label="Invoices"
        storageKey="invoices"
        columns={columns}
        data={visible}
        getRowId={(invoice) => invoice.id}
        globalFilter={search}
        isLoading={isPending}
        error={error}
        onRetry={() => void refetch()}
        initialSorting={[{ id: tab === 'draft' ? 'dueDate' : 'issueDate', desc: tab !== 'draft' }]}
        onRowClick={(invoice) => {
          void navigate(invoicePaths.detail(invoice.id));
        }}
        toolbar={() => (
          <SearchInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search number, customer, deal…"
          />
        )}
        emptyState={
          <EmptyState
            icon={Receipt}
            title={EMPTY[tab].title}
            description={EMPTY[tab].description}
            className="border-none"
            actions={
              canEdit &&
              (tab === 'draft' || tab === 'all') && (
                <Button variant="outline" asChild>
                  <Link to={invoicePaths.create}>
                    <Plus aria-hidden />
                    New invoice
                  </Link>
                </Button>
              )
            }
          />
        }
      />

      {dialogs}
    </div>
  );
}
