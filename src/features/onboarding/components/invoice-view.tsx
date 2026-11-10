import { Ban, Download, ExternalLink, Send } from 'lucide-react';
import type { ReactNode } from 'react';

import { PageHeader } from '@/components/data/page-header';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { bpToPercent, formatDate, formatDateTime, formatPaise } from '@/lib/format';

import { gstStateName } from '../constants';
import type { InvoiceActions } from '../hooks/use-invoice-actions';
import type { Invoice } from '../types';
import { InvoiceSentBadge, InvoiceStatusBadge } from './invoice-status-badge';
import { InvoiceTotals } from './invoice-totals';

interface InvoiceViewProps {
  invoice: Invoice;
  contactName?: string;
  dealTitle?: string;
  /** False for viewers: hides send / cancel. */
  canEdit: boolean;
  actions: InvoiceActions;
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm whitespace-pre-line">{children || '—'}</dd>
    </div>
  );
}

/** Read-only invoice with the server's totals and per-line taxes. */
export function InvoiceView({
  invoice,
  contactName,
  dealTitle,
  canEdit,
  actions,
}: InvoiceViewProps) {
  const { interState } = invoice;
  const isDraft = invoice.status === 'draft';

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 sm:p-6">
      <PageHeader
        title={invoice.number ?? 'Draft invoice'}
        description={
          [invoice.billToName, invoice.financialYear && `FY ${invoice.financialYear}`]
            .filter(Boolean)
            .join(' · ') || undefined
        }
        badges={
          <>
            <InvoiceStatusBadge status={invoice.status} />
            {invoice.sentAt && <InvoiceSentBadge sentAt={invoice.sentAt} />}
          </>
        }
        actions={
          !isDraft && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  actions.openPdf(invoice);
                }}
              >
                <ExternalLink aria-hidden />
                Open PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  actions.download(invoice);
                }}
              >
                <Download aria-hidden />
                Download
              </Button>
              {canEdit && invoice.status === 'issued' && (
                <>
                  <Button
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      actions.cancel(invoice);
                    }}
                  >
                    <Ban aria-hidden />
                    Cancel invoice
                  </Button>
                  <Button
                    disabled={!invoice.billToEmail}
                    title={invoice.billToEmail ? undefined : 'This invoice has no bill-to email.'}
                    onClick={() => {
                      actions.send(invoice);
                    }}
                  >
                    <Send aria-hidden />
                    {invoice.sentAt ? 'Send again' : 'Send to customer'}
                  </Button>
                </>
              )}
            </>
          )
        }
      />

      {invoice.status === 'cancelled' && (
        <InlineAlert>
          Cancelled {formatDateTime(invoice.cancelledAt)}
          {invoice.cancelReason && `: ${invoice.cancelReason}`}
        </InlineAlert>
      )}
      {invoice.status === 'issued' && !invoice.billToEmail && canEdit && (
        <InlineAlert tone="info">
          This invoice has no bill-to email, so it can’t be emailed from here. Download the PDF and
          send it yourself.
        </InlineAlert>
      )}
      {isDraft && (
        <InlineAlert tone="info">
          This is a draft. Only people who can edit invoices can change or issue it.
        </InlineAlert>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardContent>
              <dl className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold">From</h2>
                  <Detail label="Seller">{invoice.sellerName}</Detail>
                  <Detail label="GSTIN">{invoice.sellerGstin}</Detail>
                  <Detail label="Address">{invoice.sellerAddress}</Detail>
                  <Detail label="State">
                    {invoice.sellerStateCode &&
                      `${gstStateName(invoice.sellerStateCode)} (${invoice.sellerStateCode})`}
                  </Detail>
                </div>
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold">Bill to</h2>
                  <Detail label="Name">{invoice.billToName}</Detail>
                  <Detail label="GSTIN">{invoice.billToGstin}</Detail>
                  <Detail label="Address">{invoice.billToAddress}</Detail>
                  <Detail label="Place of supply">
                    {invoice.placeOfSupply &&
                      `${gstStateName(invoice.placeOfSupply)} (${invoice.placeOfSupply})`}
                  </Detail>
                  <Detail label="Email / phone">
                    {[invoice.billToEmail, invoice.billToPhone].filter(Boolean).join(' · ')}
                  </Detail>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Line items</CardTitle>
              <CardDescription>
                {invoice.pricesIncludeGst ? 'Prices include GST.' : 'Prices exclude GST.'}{' '}
                {interState ? 'Inter-state supply: IGST.' : 'Intra-state supply: CGST + SGST.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Table aria-label="Line items">
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="ps-4">Description</TableHead>
                    <TableHead>SAC</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Taxable</TableHead>
                    <TableHead className="text-right">GST</TableHead>
                    <TableHead className="text-right">
                      {interState ? 'IGST' : 'CGST + SGST'}
                    </TableHead>
                    <TableHead className="pe-4 text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.lines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                        No lines.
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoice.lines.map((line, index) => (
                      <TableRow key={index}>
                        <TableCell className="max-w-72 ps-4 whitespace-normal">
                          {line.description}
                        </TableCell>
                        <TableCell className="tabular-nums">{line.sac || '—'}</TableCell>
                        <TableCell className="text-right tabular-nums">{line.quantity}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatPaise(line.unitPricePaise)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatPaise(line.taxablePaise)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {bpToPercent(line.gstRateBp)}%
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {interState
                            ? formatPaise(line.igstPaise)
                            : `${formatPaise(line.cgstPaise)} + ${formatPaise(line.sgstPaise)}`}
                        </TableCell>
                        <TableCell className="pe-4 text-right font-medium tabular-nums">
                          {formatPaise(line.totalPaise)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="text-sm whitespace-pre-line">{invoice.notes}</CardContent>
            </Card>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20">
          <Card>
            <CardHeader>
              <CardTitle>Totals</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceTotals {...invoice} interState={interState} />
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent>
              <dl className="space-y-3">
                <Detail label="Issue date">{formatDate(invoice.issueDate)}</Detail>
                <Detail label="Due date">{formatDate(invoice.dueDate)}</Detail>
                {invoice.sentAt && (
                  <Detail label="Emailed">{formatDateTime(invoice.sentAt)}</Detail>
                )}
                <Detail label="Contact">{contactName}</Detail>
                <Detail label="Deal">{dealTitle}</Detail>
              </dl>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
