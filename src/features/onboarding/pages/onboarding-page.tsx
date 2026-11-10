import {
  AlertTriangle,
  ArrowRight,
  FilePen,
  FileWarning,
  Handshake,
  MailOpen,
  Plus,
  Receipt,
  Workflow,
} from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { PageHeader } from '@/components/data/page-header';
import { StatCard } from '@/components/data/stat-card';
import { EmptyState } from '@/components/feedback/empty-state';
import { WorkflowBadge } from '@/components/feedback/workflow-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { permissions, useSessionRole } from '@/features/auth';
import { useContacts } from '@/features/contacts';
import { useDeals, type Deal } from '@/features/deals';
import { useNurtureEnrollments, useNurtureSequences } from '@/features/nurture';
import { formatPaise, formatRelativeTime, plural } from '@/lib/format';
import { paths } from '@/routes/paths';
import { errorMessage } from '@/services';

import { InvoiceStatusBadge } from '../components/invoice-status-badge';
import { invoicePaths } from '../constants';
import { useAllInvoices } from '../hooks/use-invoices';
import type { Invoice } from '../types';

const RECENT_WON = 12;
const RECENT_DRAFTS = 8;
const DAY_MS = 24 * 60 * 60 * 1000;

type InvoiceState = 'none' | 'draft' | 'issued' | 'sent' | 'cancelled';

/** The invoice that matters for a deal: a live one over a cancelled one. */
function invoiceState(invoice: Invoice | undefined): InvoiceState {
  if (!invoice) return 'none';
  if (invoice.status === 'issued') return invoice.sentAt ? 'sent' : 'issued';
  return invoice.status;
}

const STATE_BADGES: Record<InvoiceState, ReactNode> = {
  none: (
    <Badge variant="outline" className="text-muted-foreground">
      No invoice
    </Badge>
  ),
  draft: <Badge variant="human">Draft to review</Badge>,
  issued: <Badge variant="outline">Issued, not sent</Badge>,
  sent: (
    <Badge variant="outline" className="border-success/30 text-success">
      Sent
    </Badge>
  ),
  cancelled: <InvoiceStatusBadge status="cancelled" />,
};

function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-11 w-full" />
      ))}
    </div>
  );
}

function SectionError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <EmptyState
      icon={AlertTriangle}
      title="Couldn’t load this list"
      description={errorMessage(error, 'Please try again.')}
      className="border-none py-6"
      actions={
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      }
    />
  );
}

export default function OnboardingPage() {
  const role = useSessionRole();
  const canEdit = permissions.canEdit(role);
  const canManage = permissions.canManageSettings(role);
  const dealsQuery = useDeals();
  const invoicesQuery = useAllInvoices();
  const { data: contacts = [] } = useContacts();
  const sequencesQuery = useNurtureSequences({ enabled: canManage });
  const [now] = useState(() => Date.now());

  const welcomeSequence = useMemo(() => {
    const won = (sequencesQuery.data ?? []).filter((sequence) => sequence.trigger === 'deal_won');
    return won.find((sequence) => sequence.active) ?? won[0];
  }, [sequencesQuery.data]);
  const enrollmentsQuery = useNurtureEnrollments(
    { sequenceId: welcomeSequence?.id, status: 'active', limit: 200 },
    { enabled: canManage && Boolean(welcomeSequence) },
  );

  const contactNames = useMemo(
    () => new Map(contacts.map((contact) => [contact.id, contact.fullName])),
    [contacts],
  );
  const invoices = useMemo(() => invoicesQuery.data ?? [], [invoicesQuery.data]);
  const deals = useMemo(() => dealsQuery.data ?? [], [dealsQuery.data]);
  const dealTitles = useMemo(() => new Map(deals.map((deal) => [deal.id, deal.title])), [deals]);

  const invoiceByDeal = useMemo(() => {
    const map = new Map<string, Invoice>();
    for (const invoice of invoices) {
      if (!invoice.dealId) continue;
      const current = map.get(invoice.dealId);
      if (!current || (current.status === 'cancelled' && invoice.status !== 'cancelled'))
        map.set(invoice.dealId, invoice);
    }
    return map;
  }, [invoices]);

  const wonDeals = useMemo(
    () =>
      deals
        .filter((deal) => deal.status === 'won')
        .sort((a, b) => (b.closedAt ?? b.updatedAt).localeCompare(a.closedAt ?? a.updatedAt)),
    [deals],
  );
  const drafts = useMemo(
    () =>
      invoices
        .filter((invoice) => invoice.status === 'draft')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [invoices],
  );

  const stats = useMemo(() => {
    const since = now - 30 * DAY_MS;
    const wonRecently = wonDeals.filter(
      (deal) => new Date(deal.closedAt ?? deal.updatedAt).getTime() >= since,
    );
    return {
      wonCount: wonRecently.length,
      wonValue: wonRecently.reduce((sum, deal) => sum + deal.valuePaise, 0),
      unsent: invoices.filter((invoice) => invoice.status === 'issued' && !invoice.sentAt).length,
      uninvoiced: wonDeals.filter((deal) => !invoiceByDeal.has(deal.id)).length,
    };
  }, [now, wonDeals, invoices, invoiceByDeal]);

  const loadingTotals = dealsQuery.isPending || invoicesQuery.isPending;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Onboarding"
        description="Won deals automatically receive a welcome message and invoice."
        badges={<WorkflowBadge kind="ai" />}
        actions={
          <Button variant="outline" asChild>
            <Link to={invoicePaths.list}>
              <Receipt aria-hidden />
              All invoices
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Won in the last 30 days"
          icon={Handshake}
          value={stats.wonCount}
          hint={formatPaise(stats.wonValue)}
          loading={dealsQuery.isPending}
        />
        <StatCard
          label="Drafts to review"
          icon={FilePen}
          value={drafts.length}
          hint="Issue them to assign a number"
          loading={invoicesQuery.isPending}
        />
        <StatCard
          label="Issued, not sent"
          icon={MailOpen}
          value={stats.unsent}
          hint="Email the PDF to the customer"
          loading={invoicesQuery.isPending}
        />
        <StatCard
          label="Won without an invoice"
          icon={FileWarning}
          value={stats.uninvoiced}
          hint="Usually means the draft was deleted"
          loading={loadingTotals}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recently won deals</CardTitle>
          <CardDescription>
            Each won deal should end up with an issued, sent invoice.
          </CardDescription>
          <CardAction>
            <Button variant="ghost" size="sm" asChild>
              <Link to={paths.deals}>
                Pipeline
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {loadingTotals ? (
            <ListSkeleton rows={5} />
          ) : dealsQuery.isError || invoicesQuery.isError ? (
            <SectionError
              error={dealsQuery.error ?? invoicesQuery.error}
              onRetry={() => {
                void dealsQuery.refetch();
                void invoicesQuery.refetch();
              }}
            />
          ) : wonDeals.length === 0 ? (
            <EmptyState
              icon={Handshake}
              title="No won deals yet"
              description="When a deal moves to Closed won, its welcome message and draft invoice show up here."
              className="border-none py-8"
            />
          ) : (
            <ul className="divide-y">
              {wonDeals.slice(0, RECENT_WON).map((deal) => (
                <WonDealRow
                  key={deal.id}
                  deal={deal}
                  contactName={deal.contactId ? contactNames.get(deal.contactId) : undefined}
                  invoice={invoiceByDeal.get(deal.id)}
                  canEdit={canEdit}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Drafts awaiting review</CardTitle>
            <CardDescription>Check the lines and bill-to details, then issue.</CardDescription>
            {drafts.length > RECENT_DRAFTS && (
              <CardAction>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={invoicePaths.list}>
                    All {drafts.length}
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
              </CardAction>
            )}
          </CardHeader>
          <CardContent>
            {invoicesQuery.isPending ? (
              <ListSkeleton />
            ) : invoicesQuery.isError ? (
              <SectionError
                error={invoicesQuery.error}
                onRetry={() => void invoicesQuery.refetch()}
              />
            ) : drafts.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="Nothing to review"
                description="All draft invoices have been issued."
                className="border-none py-8"
              />
            ) : (
              <ul className="divide-y">
                {drafts.slice(0, RECENT_DRAFTS).map((invoice) => (
                  <li key={invoice.id} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {invoice.billToName || 'No bill-to name yet'}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[
                          invoice.dealId ? dealTitles.get(invoice.dealId) : undefined,
                          `created ${formatRelativeTime(invoice.createdAt)}`,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    <span className="text-sm font-medium tabular-nums">
                      {formatPaise(invoice.totalPaise)}
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={invoicePaths.detail(invoice.id)}>
                        {canEdit ? 'Review' : 'View'}
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {canManage && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Welcome messages
                <WorkflowBadge kind="ai" label="Automatic" />
              </CardTitle>
              <CardDescription>
                {welcomeSequence
                  ? `Customers currently in “${welcomeSequence.name}”.`
                  : 'The nurture sequence that starts when a deal is won.'}
              </CardDescription>
              <CardAction>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={paths.nurture}>
                    Sequences
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              {sequencesQuery.isPending ||
              (welcomeSequence !== undefined && enrollmentsQuery.isPending) ? (
                <ListSkeleton />
              ) : sequencesQuery.isError || enrollmentsQuery.isError ? (
                <SectionError
                  error={sequencesQuery.error ?? enrollmentsQuery.error}
                  onRetry={() => {
                    void sequencesQuery.refetch();
                    if (welcomeSequence) void enrollmentsQuery.refetch();
                  }}
                />
              ) : !welcomeSequence ? (
                <EmptyState
                  icon={Workflow}
                  title="No welcome sequence"
                  description="Create a nurture sequence with the “Deal won” trigger to greet new customers automatically."
                  className="border-none py-8"
                  actions={
                    <Button variant="outline" size="sm" asChild>
                      <Link to={paths.nurture}>
                        <Plus aria-hidden />
                        Set one up
                      </Link>
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {!welcomeSequence.active && (
                    <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                      This sequence is paused, so newly won customers aren’t enrolled.
                    </p>
                  )}
                  {(enrollmentsQuery.data ?? []).length === 0 ? (
                    <EmptyState
                      icon={Workflow}
                      title="No one in onboarding right now"
                      description="Customers are enrolled automatically when their deal is won."
                      className="border-none py-8"
                    />
                  ) : (
                    <ul className="divide-y">
                      {(enrollmentsQuery.data ?? []).map((enrollment) => (
                        <li key={enrollment.id} className="flex items-center gap-3 py-2.5">
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">
                              {contactNames.get(enrollment.contactId) ?? 'Contact'}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              Step {enrollment.nextStep + 1} of{' '}
                              {plural(welcomeSequence.steps.length, 'step')} · next{' '}
                              {formatRelativeTime(enrollment.nextRunAt)}
                            </p>
                            {enrollment.lastError && (
                              <p className="truncate text-xs text-destructive">
                                Last attempt failed: {enrollment.lastError}
                              </p>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`${paths.contacts}?contact=${enrollment.contactId}`}>
                              Contact
                            </Link>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

interface WonDealRowProps {
  deal: Deal;
  contactName?: string;
  invoice?: Invoice;
  canEdit: boolean;
}

function WonDealRow({ deal, contactName, invoice, canEdit }: WonDealRowProps) {
  const state = invoiceState(invoice);
  const wonAt = deal.closedAt ?? deal.updatedAt;
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
      <div className="min-w-0 flex-1 basis-56">
        <p className="truncate font-medium">{deal.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {[contactName, `won ${formatRelativeTime(wonAt)}`].filter(Boolean).join(' · ')}
        </p>
      </div>
      <span className="w-28 text-right text-sm font-medium tabular-nums">
        {formatPaise(deal.valuePaise)}
      </span>
      <span className="flex w-36 justify-end">{STATE_BADGES[state]}</span>
      <span className="flex w-32 justify-end">
        {invoice ? (
          <Button variant={state === 'draft' ? 'default' : 'outline'} size="sm" asChild>
            <Link to={invoicePaths.detail(invoice.id)}>
              {state === 'draft' && canEdit ? 'Review draft' : 'Open invoice'}
            </Link>
          </Button>
        ) : canEdit ? (
          <Button variant="outline" size="sm" asChild>
            <Link to={invoicePaths.createForDeal(deal.id)}>
              <Plus aria-hidden />
              Create invoice
            </Link>
          </Button>
        ) : null}
      </span>
    </li>
  );
}
