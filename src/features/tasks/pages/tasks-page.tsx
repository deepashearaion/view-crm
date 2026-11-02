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
import { useUserLookup, useUsers } from '@/features/auth';
import { useCompanyLookup } from '@/features/companies';
import { useContacts } from '@/features/contacts';
import { useRecordSheetState } from '@/hooks/use-record-sheet-state';
import { paths } from '@/routes/paths';

import { taskStatus } from '../api/tasks';
import { getTaskColumns } from '../components/task-columns';
import { TaskSheet } from '../components/task-sheet';
import { TASK_STATUSES, TASK_TYPES } from '../constants';
import { useDeleteTasks, useTasks, useToggleTaskComplete } from '../hooks/use-tasks';
import type { Task, TaskStatus } from '../types';

type Tab = TaskStatus | 'all';

export default function TasksPage({ createOnMount = false }: { createOnMount?: boolean }) {
  const navigate = useNavigate();
  const { data: tasks = [], isPending, error, refetch } = useTasks();
  const { data: userList = [] } = useUsers();
  const users = useUserLookup();
  const companies = useCompanyLookup();
  const { data: contacts = [] } = useContacts();
  const toggle = useToggleTaskComplete();
  const deleteTasks = useDeleteTasks();

  const [tab, setTab] = useState<Tab>('upcoming');
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Task[] | null>(null);
  const [sheetState, setSheetState] = useRecordSheetState({
    param: 'task',
    createOnMount,
    listPath: paths.tasks,
  });

  const contactNames = useMemo(
    () => new Map(contacts.map((contact) => [contact.id, contact.fullName])),
    [contacts],
  );

  const counts = useMemo(() => {
    const result: Record<Tab, number> = {
      all: tasks.length,
      overdue: 0,
      upcoming: 0,
      completed: 0,
    };
    for (const task of tasks) result[taskStatus(task)]++;
    return result;
  }, [tasks]);

  const visible = useMemo(
    () => (tab === 'all' ? tasks : tasks.filter((task) => taskStatus(task) === tab)),
    [tasks, tab],
  );

  const columns = useMemo(
    () =>
      getTaskColumns({
        users,
        contactName: (id) => (id ? contactNames.get(id) : undefined),
        companyName: (id) => (id ? companies.get(id)?.name : undefined),
        onToggle: (task, completed) => {
          toggle.mutate(
            { id: task.id, completed },
            {
              onSuccess: () => {
                toast.success(completed ? 'Task completed.' : 'Task reopened.');
              },
              onError: () => {
                toast.error('Couldn’t update the task.');
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
    [users, contactNames, companies, toggle, setSheetState],
  );

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Tasks"
        description="Follow-ups, meetings and quotations, including tasks created automatically for hot leads."
        actions={
          <Button
            onClick={() => {
              void navigate(`${paths.tasks}/new`);
            }}
          >
            <Plus aria-hidden />
            New task
          </Button>
        }
      />

      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value as Tab);
        }}
      >
        <TabsList>
          {[...TASK_STATUSES, { value: 'all', label: 'All' } as const].map((status) => (
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
        initialSorting={[{ id: 'dueAt', desc: tab === 'completed' }]}
        defaultHidden={['type', 'description']}
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
              column={table.getColumn('owner')}
              title="Assigned to"
              options={userList.map((user) => ({ value: user.id, label: user.name }))}
            />
          </>
        )}
        bulkActions={(rows) => (
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
        )}
        emptyState={
          <EmptyState
            icon={ListChecks}
            title={
              tab === 'overdue'
                ? 'Nothing overdue'
                : tab === 'completed'
                  ? 'No completed tasks yet'
                  : 'No tasks here'
            }
            description={
              tab === 'overdue'
                ? 'Nice work, you’re on top of your follow-ups.'
                : 'Create a task to plan your next follow-up.'
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
