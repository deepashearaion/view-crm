import type { ColumnDef } from '@tanstack/react-table';
import { Ban, Download, Eye, FileCheck2, Pencil, Send, Trash2 } from 'lucide-react';

import {
  DataTableColumnHeader,
  DataTableRowActions,
  type RowAction,
} from '@/components/data/data-table';
import { formatDate, formatPaise } from '@/lib/format';
import { cn } from '@/lib/utils';

import type { InvoiceActions } from '../hooks/use-invoice-actions';
import type { Invoice } from '../types';
import { InvoiceSentBadge, InvoiceStatusBadge } from './invoice-status-badge';

const dash = <span className="text-muted-foreground">—</span>;

interface ColumnOptions {
  contactName: (id: string | null) => string | undefined;
  dealTitle: (id: string | null) => string | undefined;
  /** invoices.edit: edit / issue drafts, send issued invoices. */
  canEdit: boolean;
  /** invoices.delete: delete drafts. */
  canDelete: boolean;
  /** Org-wide invoices.delete: cancel issued invoices. */
  canCancel: boolean;
  /** Today as YYYY-MM-DD (IST), for overdue highlighting. */
  today: string;
  onOpen: (invoice: Invoice) => void;
  actions: InvoiceActions;
}

export function getInvoiceColumns({
  contactName,
  dealTitle,
  canEdit,
  canDelete,
  canCancel,
  today,
  onOpen,
  actions,
}: ColumnOptions): ColumnDef<Invoice>[] {
  return [
    {
      id: 'number',
      accessorFn: (invoice) => invoice.number ?? 'Draft',
      meta: { label: 'Number', className: 'whitespace-nowrap' },
      enableHiding: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Number" />,
      cell: ({ row }) =>
        row.original.number ? (
          <span className="font-medium tabular-nums">{row.original.number}</span>
        ) : (
          <span className="text-muted-foreground italic">Draft</span>
        ),
    },
    {
      id: 'billTo',
      accessorFn: (invoice) => invoice.billToName,
      meta: { label: 'Bill to', className: 'max-w-64' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Bill to" />,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.billToName || dash}</p>
          {row.original.billToGstin && (
            <p className="truncate text-xs text-muted-foreground tabular-nums">
              {row.original.billToGstin}
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'related',
      accessorFn: (invoice) =>
        [contactName(invoice.contactId), dealTitle(invoice.dealId)].filter(Boolean).join(' '),
      meta: { label: 'Contact / deal', className: 'max-w-64' },
      header: 'Contact / deal',
      enableSorting: false,
      cell: ({ row }) => {
        const contact = contactName(row.original.contactId);
        const deal = dealTitle(row.original.dealId);
        if (!contact && !deal) return dash;
        return (
          <div className="min-w-0">
            {contact && <p className="truncate">{contact}</p>}
            {deal && <p className="truncate text-xs text-muted-foreground">{deal}</p>}
          </div>
        );
      },
    },
    {
      id: 'issueDate',
      accessorFn: (invoice) => invoice.issueDate ?? undefined,
      meta: { label: 'Issued', className: 'whitespace-nowrap' },
      sortUndefined: 'last',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Issued" />,
      cell: ({ row }) => formatDate(row.original.issueDate) || dash,
    },
    {
      id: 'dueDate',
      accessorFn: (invoice) => invoice.dueDate ?? undefined,
      meta: { label: 'Due', className: 'whitespace-nowrap' },
      sortUndefined: 'last',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Due" />,
      cell: ({ row }) => {
        const { dueDate, status } = row.original;
        if (!dueDate) return dash;
        const overdue = status === 'issued' && dueDate < today;
        return (
          <span className={cn(overdue && 'font-medium text-destructive')}>
            {formatDate(dueDate)}
          </span>
        );
      },
    },
    {
      id: 'total',
      accessorFn: (invoice) => invoice.totalPaise,
      meta: { label: 'Total', className: 'text-right whitespace-nowrap' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" className="justify-end" />
      ),
      cell: ({ row }) => (
        <span
          className={cn(
            'font-medium tabular-nums',
            row.original.status === 'cancelled' && 'text-muted-foreground line-through',
          )}
        >
          {formatPaise(row.original.totalPaise)}
        </span>
      ),
    },
    {
      id: 'status',
      accessorFn: (invoice) => invoice.status,
      meta: { label: 'Status' },
      enableSorting: false,
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <InvoiceStatusBadge status={row.original.status} />
          {row.original.sentAt && <InvoiceSentBadge sentAt={row.original.sentAt} />}
        </div>
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      enableSorting: false,
      meta: { className: 'w-12 text-right' },
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const invoice = row.original;
        const name = invoice.number ?? `draft for ${invoice.billToName || 'unnamed customer'}`;
        const list: RowAction[] = [];
        if (invoice.status === 'draft') {
          list.push({
            label: canEdit ? 'Edit' : 'View',
            icon: canEdit ? Pencil : Eye,
            onSelect: () => {
              onOpen(invoice);
            },
          });
          if (canEdit)
            list.push({
              label: 'Issue',
              icon: FileCheck2,
              onSelect: () => {
                actions.issue(invoice);
              },
            });
          if (canDelete)
            list.push({
              label: 'Delete',
              icon: Trash2,
              destructive: true,
              separatorBefore: true,
              onSelect: () => {
                actions.remove(invoice);
              },
            });
        } else {
          list.push(
            {
              label: 'View',
              icon: Eye,
              onSelect: () => {
                onOpen(invoice);
              },
            },
            {
              label: 'Download PDF',
              icon: Download,
              onSelect: () => {
                actions.download(invoice);
              },
            },
          );
          if (invoice.status === 'issued' && canEdit)
            list.push({
              label: invoice.billToEmail
                ? invoice.sentAt
                  ? 'Send again'
                  : 'Send to customer'
                : 'Send (no email)',
              icon: Send,
              disabled: !invoice.billToEmail,
              onSelect: () => {
                actions.send(invoice);
              },
            });
          if (invoice.status === 'issued' && canCancel)
            list.push({
              label: 'Cancel invoice',
              icon: Ban,
              destructive: true,
              separatorBefore: true,
              onSelect: () => {
                actions.cancel(invoice);
              },
            });
        }
        return <DataTableRowActions label={`Actions for ${name}`} actions={list} />;
      },
    },
  ];
}
