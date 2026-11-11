import type { ColumnDef } from '@tanstack/react-table';
import { Ban, Circle, CircleCheck, Eye, Pencil, RotateCcw, Trash2 } from 'lucide-react';

import {
  DataTableColumnHeader,
  DataTableRowActions,
  facetFilterFn,
  type RowAction,
} from '@/components/data/data-table';
import { UserChip } from '@/components/data/user-chip';
import { WorkflowBadge } from '@/components/feedback/workflow-badge';
import type { User } from '@/features/auth';
import { formatDateTime, formatRelativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';

import { isAutomatedTask, taskStatus } from '../api/tasks';
import { TASK_PRIORITIES, TASK_ORIGIN_LABELS, taskTypeByValue } from '../constants';
import type { Task, TaskStatus } from '../types';
import { TaskPriorityBadge } from './task-priority-badge';
import { TaskStatusBadge } from './task-status-badge';

const dash = <span className="text-muted-foreground">—</span>;
const priorityRank = new Map<string, number>(
  TASK_PRIORITIES.map((priority, index) => [priority.value, index]),
);

interface ColumnOptions {
  users: Map<string, User>;
  contactName: (id: string | null) => string | undefined;
  /** tasks.edit: edit, complete, cancel and reopen. */
  canEdit: boolean;
  /** tasks.delete. */
  canDelete: boolean;
  onSetStatus: (task: Task, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function getTaskColumns({
  users,
  contactName,
  canEdit,
  canDelete,
  onSetStatus,
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
        const { status, title } = row.original;
        const done = status === 'done';
        if (status === 'cancelled')
          return (
            <span className="flex size-7 items-center justify-center text-muted-foreground">
              <Ban aria-label="Cancelled" className="size-4" />
            </span>
          );
        return (
          <button
            type="button"
            aria-pressed={done}
            aria-label={`Mark “${title}” as ${done ? 'not done' : 'done'}`}
            disabled={!canEdit}
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-success focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none"
            onClick={(event) => {
              event.stopPropagation();
              onSetStatus(row.original, done ? 'open' : 'done');
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
        const closed = row.original.status !== 'open';
        return (
          <div className="flex min-w-0 items-start gap-2.5">
            {type && (
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <type.icon aria-hidden className="size-3.5" />
              </span>
            )}
            <div className="min-w-0">
              <p
                className={cn(
                  'truncate font-medium',
                  closed && 'text-muted-foreground line-through',
                )}
              >
                {row.original.title}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {type?.label}
                {isAutomatedTask(row.original) && (
                  <WorkflowBadge
                    kind="ai"
                    label="Auto"
                    title={`Created by the workflow: ${TASK_ORIGIN_LABELS[row.original.origin]}`}
                  />
                )}
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
      id: 'priority',
      accessorKey: 'priority',
      meta: { label: 'Priority' },
      filterFn: facetFilterFn,
      sortingFn: (a, b) =>
        (priorityRank.get(a.original.priority) ?? 0) - (priorityRank.get(b.original.priority) ?? 0),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
      cell: ({ row }) => <TaskPriorityBadge priority={row.original.priority} />,
    },
    {
      id: 'status',
      accessorFn: (task) => taskStatus(task),
      meta: { label: 'Status' },
      enableSorting: false,
      header: 'Status',
      cell: ({ row }) => <TaskStatusBadge status={taskStatus(row.original)} />,
    },
    {
      id: 'dueAt',
      accessorFn: (task) => (task.dueAt ? new Date(task.dueAt) : undefined),
      meta: { label: 'Due', className: 'whitespace-nowrap' },
      sortingFn: 'datetime',
      sortUndefined: 'last',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Due" />,
      cell: ({ row }) => {
        const { dueAt } = row.original;
        if (!dueAt) return dash;
        const status = taskStatus(row.original);
        return (
          <div>
            <p className={cn(status === 'overdue' && 'font-medium text-destructive')}>
              {formatDateTime(dueAt)}
            </p>
            {(status === 'overdue' || status === 'upcoming') && (
              <p className="text-xs text-muted-foreground">{formatRelativeTime(dueAt)}</p>
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
      id: 'assignee',
      accessorFn: (task) => task.assigneeId,
      meta: { label: 'Assigned to' },
      filterFn: facetFilterFn,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Assigned to" />,
      cell: ({ row }) => <UserChip name={users.get(row.original.assigneeId)?.name} />,
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
      cell: ({ row }) => {
        const task = row.original;
        const actions: RowAction[] = [
          {
            label: canEdit ? 'Edit' : 'View',
            icon: canEdit ? Pencil : Eye,
            onSelect: () => {
              onEdit(task);
            },
          },
        ];
        if (canEdit) {
          if (task.status === 'open') {
            actions.push(
              {
                label: 'Mark done',
                icon: CircleCheck,
                onSelect: () => {
                  onSetStatus(task, 'done');
                },
              },
              {
                label: 'Cancel task',
                icon: Ban,
                onSelect: () => {
                  onSetStatus(task, 'cancelled');
                },
              },
            );
          } else {
            actions.push({
              label: 'Reopen',
              icon: RotateCcw,
              onSelect: () => {
                onSetStatus(task, 'open');
              },
            });
          }
        }
        if (canDelete) {
          actions.push({
            label: 'Delete',
            icon: Trash2,
            destructive: true,
            separatorBefore: true,
            onSelect: () => {
              onDelete(task);
            },
          });
        }
        return <DataTableRowActions label={`Actions for ${task.title}`} actions={actions} />;
      },
    },
  ];
}
