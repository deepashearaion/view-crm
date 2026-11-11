import { ListChecks, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { DataTable, DataTableFacetedFilter } from '@/components/data/data-table';
import { PageHeader } from '@/components/data/page-header';
import { SearchInput } from '@/components/data/search-input';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { EmptyState } from '@/components/feedback/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccess, useUserLookup, useUsers } from '@/features/auth';
import { useContacts } from '@/features/contacts';
import { useRecordSheetState } from '@/hooks/use-record-sheet-state';
import { paths } from '@/routes/paths';
import { errorMessage } from '@/services';

import { taskStatus } from '../api/tasks';
import { getTaskColumns } from '../components/task-columns';
import { TaskSheet } from '../components/task-sheet';
import { TASK_PRIORITIES, TASK_TYPES } from '../constants';
import { useDeleteTasks, useSetTaskStatus, useTasks } from '../hooks/use-tasks';
import type { Task, TaskDisplayStatus, TaskStatus } from '../types';

/** Status filter: "open" groups overdue, upcoming and undated open tasks. */
type Tab = 'open' | 'overdue' | 'upcoming' | 'done' | 'cancelled' | 'all';

const TABS: { value: Tab; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'done', label: 'Done' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'all', label: 'All' },
];

const STATUS_TOASTS: Record<TaskStatus, string> = {
  done: 'Task completed.',
  open: 'Task reopened.',
  cancelled: 'Task cancelled.',
};

function inTab(status: TaskDisplayStatus, tab: Tab): boolean {
  if (tab === 'all') return true;
  if (tab === 'open')
    return status === 'overdue' || status === 'upcoming' || status === 'no_due_date';
  return status === tab;
}

const EMPTY_TITLES: Record<Tab, string> = {
  open: 'No open tasks',
  overdue: 'Nothing overdue',
  upcoming: 'Nothing coming up',
  done: 'No completed tasks yet',
  cancelled: 'No cancelled tasks',
  all: 'No tasks here',
};

export default function TasksPage({ createOnMount = false }: { createOnMount?: boolean }) {
  const navigate = useNavigate();
  const access = useAccess();
  const canCreate = access.can('tasks', 'create');
  const canEdit = access.can('tasks', 'edit');
  const canDelete = access.can('tasks', 'delete');
  const { data: tasks = [], isPending, error, refetch } = useTasks();
  const { data: userList = [] } = useUsers();
  const users = useUserLookup();
  const { data: contacts = [] } = useContacts();
  const setStatus = useSetTaskStatus();
  const deleteTasks = useDeleteTasks();

  const [tab, setTab] = useState<Tab>('open');
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Task[] | null>(null);
  const [sheetState, setSheetState] = useRecordSheetState({
    param: 'task',
    createOnMount: createOnMount && canCreate,
    listPath: paths.tasks,
  });

  const contactNames = useMemo(
    () => new Map(contacts.map((contact) => [contact.id, contact.fullName])),
    [contacts],
  );

  const counts = useMemo(() => {
    const result: Record<Tab, number> = {
      open: 0,
      overdue: 0,
      upcoming: 0,
      done: 0,
      cancelled: 0,
      all: 0,
    };
    for (const task of tasks) {
      const status = taskStatus(task);
      for (const { value } of TABS) if (inTab(status, value)) result[value]++;
    }
    return result;
  }, [tasks]);

  const visible = useMemo(() => tasks.filter((task) => inTab(taskStatus(task), tab)), [tasks, tab]);

  const columns = useMemo(
    () =>
      getTaskColumns({
        users,
        canEdit,
        canDelete,
        contactName: (id) => (id ? contactNames.get(id) : undefined),
        onSetStatus: (task, status) => {
          setStatus.mutate(
            { id: task.id, status },
            {
              onSuccess: () => {
                toast.success(STATUS_TOASTS[status]);
              },
              onError: (mutationError) => {
                toast.error(errorMessage(mutationError, 'Couldn’t update the task.'));
              },
            },
          );
        },
        onEdit: (task) => {
          setSheetState({ mode: 'edit', id: task.id });
        },
        onDelete: (task) => {
          setPendingDelete([task]);
        },
      }),
    [users, canEdit, canDelete, contactNames, setStatus, setSheetState],
  );

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Tasks"
        description="Follow-ups, calls and meetings, including tasks created automatically for hot leads."
        actions={
          canCreate && (
            <Button
              onClick={() => {
                void navigate(`${paths.tasks}/new`);
              }}
            >
              <Plus aria-hidden />
              New task
            </Button>
          )
        }
      />

      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value as Tab);
        }}
      >
        <TabsList>
          {TABS.map((status) => (
            <TabsTrigger key={status.value} value={status.value} className="gap-2">
              {status.label}
              <Badge
                variant={
                  status.value === 'overdue' && counts.overdue > 0 ? 'destructive' : 'secondary'
                }
                className="h-4.5 min-w-5 px-1.5 tabular-nums"
              >
                {counts[status.value]}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DataTable
        label="Tasks"
        storageKey="tasks"
        columns={columns}
        data={visible}
        getRowId={(task) => task.id}
        globalFilter={search}
        isLoading={isPending}
        error={error}
        onRetry={() => void refetch()}
        initialSorting={[{ id: 'dueAt', desc: tab === 'done' || tab === 'cancelled' }]}
        defaultHidden={['type', 'status', 'description']}
        onRowClick={(task) => {
          setSheetState({ mode: 'edit', id: task.id });
        }}
        toolbar={(table) => (
          <>
            <SearchInput value={search} onValueChange={setSearch} placeholder="Search tasks…" />
            <DataTableFacetedFilter
              column={table.getColumn('type')}
              title="Type"
              options={TASK_TYPES.map((type) => ({
                value: type.value,
                label: type.label,
                icon: type.icon,
              }))}
            />
            <DataTableFacetedFilter
              column={table.getColumn('priority')}
              title="Priority"
              options={TASK_PRIORITIES.map((priority) => ({
                value: priority.value,
                label: priority.label,
              }))}
            />
            <DataTableFacetedFilter
              column={table.getColumn('assignee')}
              title="Assigned to"
              options={userList.map((user) => ({ value: user.id, label: user.name }))}
            />
          </>
        )}
        bulkActions={
          canDelete
            ? (rows) => (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    setPendingDelete(rows);
                  }}
                >
                  <Trash2 aria-hidden />
                  Delete
                </Button>
              )
            : undefined
        }
        emptyState={
          <EmptyState
            icon={ListChecks}
            title={EMPTY_TITLES[tab]}
            description={
              tab === 'overdue'
                ? 'Nice work, you’re on top of your follow-ups.'
                : canCreate
                  ? 'Create a task to plan your next follow-up.'
                  : 'Tasks your team creates will show up here.'
            }
            className="border-none"
          />
        }
      />

      <TaskSheet state={sheetState} onStateChange={setSheetState} />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title={
          pendingDelete?.length === 1
            ? 'Delete this task?'
            : `Delete ${String(pendingDelete?.length ?? 0)} tasks?`
        }
        description="Deleted tasks are permanently removed."
        confirmLabel="Delete"
        destructive
        pending={deleteTasks.isPending}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteTasks.mutate(
            pendingDelete.map((task) => task.id),
            {
              onSuccess: ({ succeeded, failed }) => {
                if (failed.length)
                  toast.warning(
                    `Deleted ${String(succeeded.length)}; ${String(failed.length)} failed.`,
                  );
                else
                  toast.success(
                    succeeded.length === 1
                      ? 'Task deleted.'
                      : `Deleted ${String(succeeded.length)} tasks.`,
                  );
                setPendingDelete(null);
              },
            },
          );
        }}
      />
    </div>
  );
}
