import type { ColumnDef } from '@tanstack/react-table';
import { Circle, CircleCheck, Pencil, Trash2 } from 'lucide-react';

import {
  DataTableColumnHeader,
  DataTableRowActions,
  facetFilterFn,
} from '@/components/data/data-table';
import { UserChip } from '@/components/data/user-chip';
import { WorkflowBadge } from '@/components/feedback/workflow-badge';
import type { User } from '@/features/auth';
import { formatDateTime, formatRelativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';

import { taskStatus } from '../api/tasks';
import { taskTypeByValue } from '../constants';
import type { Task } from '../types';

const dash = <span className="text-muted-foreground">—</span>;

interface ColumnOptions {
  users: Map<string, User>;
  contactName: (id: string | null) => string | undefined;
  companyName: (id: string | null) => string | undefined;
  onToggle: (task: Task, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function getTaskColumns({
  users,
  contactName,
  companyName,
  onToggle,
  onEdit,
  onDelete,
}: ColumnOptions): ColumnDef<Task>[] {
  return [
    {
      id: 'done',
      enableHiding: false,
      enableSorting: false,
      meta: { className: 'w-10' },
      header: () => <span className="sr-only">Done</span>,
      cell: ({ row }) => {
        const done = Boolean(row.original.completedAt);
        return (
          <button
            type="button"
            aria-pressed={done}
            aria-label={`Mark “${row.original.title}” as ${done ? 'not done' : 'done'}`}
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-success focus-visible:outline-2 focus-visible:outline-ring"
            onClick={() => {
              onToggle(row.original, !done);
            }}
          >
            {done ? (
              <CircleCheck aria-hidden className="size-5 fill-success text-background" />
            ) : (
              <Circle aria-hidden className="size-5" />
            )}
          </button>
        );
      },
    },
    {
      id: 'title',
      accessorKey: 'title',
      meta: { label: 'Task' },
      enableHiding: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Task" />,
      cell: ({ row }) => {
        const type = taskTypeByValue(row.original.type);
        const done = Boolean(row.original.completedAt);
        return (
          <div className="flex min-w-0 items-start gap-2.5">
            {type && (
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <type.icon aria-hidden className="size-3.5" />
              </span>
            )}
            <div className="min-w-0">
              <p
                className={cn('truncate font-medium', done && 'text-muted-foreground line-through')}
              >
                {row.original.title}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {type?.label}
                {row.original.origin === 'automation' && <WorkflowBadge kind="ai" label="Auto" />}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      id: 'type',
      accessorKey: 'type',
      meta: { label: 'Type' },
      filterFn: facetFilterFn,
      header: 'Type',
      cell: ({ row }) => taskTypeByValue(row.original.type)?.label,
    },
    {
      id: 'dueAt',
      accessorKey: 'dueAt',
      meta: { label: 'Due', className: 'whitespace-nowrap' },
      sortingFn: 'datetime',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Due" />,
      cell: ({ row }) => {
        const status = taskStatus(row.original);
        return (
          <div>
            <p className={cn(status === 'overdue' && 'font-medium text-destructive')}>
              {formatDateTime(row.original.dueAt)}
            </p>
            {status !== 'completed' && (
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(row.original.dueAt)}
              </p>
            )}
          </div>
        );
      },
    },
    {
      id: 'contact',
      accessorFn: (task) => contactName(task.contactId) ?? '',
      meta: { label: 'Contact' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" />,
      cell: ({ getValue }) => getValue<string>() || dash,
    },
    {
      id: 'company',
      accessorFn: (task) => companyName(task.companyId) ?? '',
      meta: { label: 'Company' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Company" />,
      cell: ({ getValue }) => getValue<string>() || dash,
    },
    {
      id: 'owner',
      accessorFn: (task) => task.ownerId ?? '',
      meta: { label: 'Assigned to' },
      filterFn: facetFilterFn,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Assigned to" />,
      cell: ({ row }) => (
        <UserChip name={row.original.ownerId ? users.get(row.original.ownerId)?.name : undefined} />
      ),
    },
    {
      id: 'description',
      accessorKey: 'description',
      meta: { label: 'Notes', className: 'max-w-64' },
      header: 'Notes',
      enableSorting: false,
      cell: ({ getValue }) => (
        <p className="truncate text-muted-foreground">{getValue<string>()}</p>
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      enableSorting: false,
      meta: { className: 'w-12 text-right' },
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <DataTableRowActions
          label={`Actions for ${row.original.title}`}
          actions={[
            {
              label: 'Edit',
              icon: Pencil,
              onSelect: () => {
                onEdit(row.original);
              },
            },
            {
              label: 'Delete',
              icon: Trash2,
              destructive: true,
              separatorBefore: true,
              onSelect: () => {
                onDelete(row.original);
              },
            },
          ]}
        />
      ),
    },
  ];
}
