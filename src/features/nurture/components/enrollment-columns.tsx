import type { ColumnDef } from '@tanstack/react-table';
import { CircleStop } from 'lucide-react';

import { DataTableColumnHeader, DataTableRowActions } from '@/components/data/data-table';
import { UserChip } from '@/components/data/user-chip';

import type { User } from '@/features/auth';
import { formatDateTime, formatRelativeTime } from '@/lib/format';

import { stopReasonLabel } from '../constants';
import type { NurtureEnrollment } from '../types';
import { EnrollmentStatusBadge } from './enrollment-status-badge';

const dash = <span className="text-muted-foreground">—</span>;

interface ColumnOptions {
  contactName: (id: string) => string | undefined;
  /** Number of steps in a sequence, when known (from the sequence list). */
  stepCount: (sequenceId: string) => number | undefined;
  users: Map<string, User>;
  canEdit: boolean;
  onStop: (enrollment: NurtureEnrollment) => void;
}

export function getEnrollmentColumns({
  contactName,
  stepCount,
  users,
  canEdit,
  onStop,
}: ColumnOptions): ColumnDef<NurtureEnrollment>[] {
  const columns: ColumnDef<NurtureEnrollment>[] = [
    {
      id: 'contact',
      accessorFn: (row) => contactName(row.contactId) ?? `Contact #${row.contactId}`,
      meta: { label: 'Contact' },
      enableHiding: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" />,
      cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
    },
    {
      id: 'sequence',
      accessorKey: 'sequenceName',
      meta: { label: 'Sequence' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Sequence" />,
    },
    {
      id: 'status',
      accessorKey: 'status',
      meta: { label: 'Status' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <div className="space-y-1">
          <EnrollmentStatusBadge status={row.original.status} />
          {row.original.stopReason && (
            <p className="text-xs text-muted-foreground">
              {stopReasonLabel(row.original.stopReason)}
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'nextRun',
      accessorFn: (row) => (row.status === 'active' ? row.nextRunAt : ''),
      meta: { label: 'Next step' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Next step" />,
      cell: ({ row }) => {
        const { status, nextStep, nextRunAt, sequenceId } = row.original;
        if (status !== 'active') return dash;
        const total = stepCount(sequenceId);
        return (
          <div className="text-sm">
            <p>
              Step {nextStep + 1}
              {total ? ` of ${String(total)}` : ''}
            </p>
            {nextRunAt && (
              <p className="text-xs text-muted-foreground" title={formatDateTime(nextRunAt)}>
                {formatRelativeTime(nextRunAt)}
              </p>
            )}
          </div>
        );
      },
    },
    {
      id: 'attempts',
      accessorKey: 'attempts',
      meta: { label: 'Delivery' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Delivery" />,
      cell: ({ row }) => {
        const { attempts, lastError } = row.original;
        if (!attempts && !lastError) return dash;
        return (
          <div className="max-w-56 text-sm">
            <p className="tabular-nums">
              {attempts} {attempts === 1 ? 'attempt' : 'attempts'}
            </p>
            {lastError && (
              <p className="truncate text-xs text-destructive" title={lastError}>
                {lastError}
              </p>
            )}
          </div>
        );
      },
    },
    {
      id: 'enrolledAt',
      accessorKey: 'enrolledAt',
      meta: { label: 'Enrolled' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Enrolled" />,
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap" title={formatDateTime(row.original.enrolledAt)}>
          {formatRelativeTime(row.original.enrolledAt)}
        </span>
      ),
    },
    {
      id: 'enrolledBy',
      accessorFn: (row) => (row.enrolledById ? (users.get(row.enrolledById)?.name ?? '') : ''),
      meta: { label: 'Enrolled by' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Enrolled by" />,
      cell: ({ row }) => {
        const user = row.original.enrolledById ? users.get(row.original.enrolledById) : undefined;
        if (!row.original.enrolledById)
          return <span className="text-sm text-muted-foreground">Automatic</span>;
        return user ? <UserChip name={user.name} /> : dash;
      },
    },
    {
      id: 'finishedAt',
      accessorFn: (row) => row.finishedAt ?? '',
      meta: { label: 'Finished' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Finished" />,
      cell: ({ row }) =>
        row.original.finishedAt ? (
          <span className="text-sm whitespace-nowrap">
            {formatDateTime(row.original.finishedAt)}
          </span>
        ) : (
          dash
        ),
    },
  ];

  if (canEdit)
    columns.push({
      id: 'actions',
      enableHiding: false,
      enableSorting: false,
      meta: { className: 'w-12' },
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) =>
        row.original.status === 'active' ? (
          <DataTableRowActions
            label={`Actions for this enrollment`}
            actions={[
              {
                label: 'Stop',
                icon: CircleStop,
                destructive: true,
                onSelect: () => {
                  onStop(row.original);
                },
              },
            ]}
          />
        ) : null,
    });

  return columns;
}
