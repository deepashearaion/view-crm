import { zodResolver } from '@hookform/resolvers/zod';
import { Ban, CircleCheck, RotateCcw } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { FormDateTimePicker } from '@/components/form/form-date-time-picker';
import { FormInput } from '@/components/form/form-input';
import { FormSelect, type SelectOption } from '@/components/form/form-select';
import { FormTextarea } from '@/components/form/form-textarea';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { WorkflowBadge } from '@/components/feedback/workflow-badge';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAccess, useSessionUser, useUsers } from '@/features/auth';
import { useContacts } from '@/features/contacts';
import type { RecordSheetState } from '@/hooks/use-record-sheet-state';
import { applyProblem, errorMessage, isHttpError } from '@/services';

import {
  formValuesToCreateDto,
  formValuesToPatchDto,
  isAutomatedTask,
  taskStatus,
  taskToFormValues,
} from '../api/tasks';
import { TASK_ORIGIN_LABELS, TASK_PRIORITIES, TASK_TYPES } from '../constants';
import {
  useCreateTask,
  useSetTaskStatus,
  useTask,
  useTasks,
  useUpdateTask,
} from '../hooks/use-tasks';
import { taskFormSchema } from '../schemas';
import type { Task, TaskFormOutput, TaskFormValues, TaskStatus } from '../types';
import { TaskPriorityBadge } from './task-priority-badge';
import { TaskStatusBadge } from './task-status-badge';

const FORM_ID = 'task-form';
const typeOptions: SelectOption[] = TASK_TYPES.map((type) => ({
  value: type.value,
  label: type.label,
}));
const priorityOptions: SelectOption[] = TASK_PRIORITIES.map((priority) => ({
  value: priority.value,
  label: priority.label,
}));

/** API field → form field, for server-side validation errors. */
const FIELD_MAP = {
  due_at: 'dueAt',
  assignee_id: 'assigneeId',
  contact_id: 'contactId',
};

const STATUS_TOASTS: Record<TaskStatus, string> = {
  done: 'Task completed.',
  open: 'Task reopened.',
  cancelled: 'Task cancelled.',
};

interface TaskSheetProps {
  state: RecordSheetState;
  onStateChange: (state: RecordSheetState) => void;
}

/** Create / edit a task. Tasks are simple enough that "view" opens the editor directly. */
export function TaskSheet({ state, onStateChange }: TaskSheetProps) {
  const sessionUser = useSessionUser();
  const access = useAccess();
  const isCreate = state.mode === 'create';
  // Creating needs tasks.create; changing an existing task (incl. completing it) tasks.edit.
  const canEdit = isCreate ? access.can('tasks', 'create') : access.can('tasks', 'edit');
  // Assigning to someone else needs org-wide create (new) or edit (existing) access.
  const canReassign = isCreate ? access.canAll('tasks', 'create') : access.canAll('tasks', 'edit');
  const tasksQuery = useTasks();
  const { data: users = [] } = useUsers();
  const { data: contacts = [] } = useContacts();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const setStatus = useSetTaskStatus();

  const taskId = state.mode === 'view' || state.mode === 'edit' ? state.id : null;
  const listTask = tasksQuery.data?.find((item) => item.id === taskId);
  // Deep links may point at a task outside the loaded list: fetch it on its own.
  const detail = useTask(taskId, { enabled: !listTask && !tasksQuery.isPending });
  const task: Task | undefined = listTask ?? detail.data;
  const notFound = isHttpError(detail.error) && detail.error.status === 404;
  const defaultAssignee = sessionUser?.id === undefined ? '' : String(sessionUser.id);

  const form = useForm<TaskFormValues, unknown, TaskFormOutput>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: taskToFormValues(undefined, defaultAssignee),
  });
  const dueAt = useWatch({ control: form.control, name: 'dueAt' });

  useEffect(() => {
    if (state.mode === 'create') form.reset(taskToFormValues(undefined, defaultAssignee));
    else if (task) form.reset(taskToFormValues(task));
  }, [state.mode, task, defaultAssignee, form]);

  const close = () => {
    onStateChange({ mode: 'closed' });
  };
  const mutation = isCreate ? createTask : updateTask;
  const onError = (error: Error) => {
    applyProblem(
      error,
      (field, fieldError) => {
        form.setError(field as keyof TaskFormValues, fieldError);
      },
      FIELD_MAP,
    );
  };

  const onSubmit = form.handleSubmit((values) => {
    if (isCreate) {
      createTask.mutate(formValuesToCreateDto(values, { canReassign }), {
        onSuccess: () => {
          toast.success('Task created.');
          close();
        },
        onError,
      });
      return;
    }
    if (!task) return;
    const body = formValuesToPatchDto(values, task, { canReassign });
    if (Object.keys(body).length === 0) {
      close();
      return;
    }
    updateTask.mutate(
      { id: task.id, body },
      {
        onSuccess: () => {
          toast.success('Task updated.');
          close();
        },
        onError,
      },
    );
  });

  const changeStatus = (status: TaskStatus) => {
    if (!task) return;
    setStatus.mutate(
      { id: task.id, status },
      {
        onSuccess: () => {
          toast.success(STATUS_TOASTS[status]);
        },
        onError: (error) => {
          toast.error(errorMessage(error, 'Couldn’t update the task.'));
        },
      },
    );
  };

  const readOnly = !canEdit;
  const userOptions = users.map((user) => ({ value: user.id, label: user.name }));

  return (
    <Sheet
      open={state.mode !== 'closed'}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b p-6 pr-12">
          <SheetTitle className="text-lg">
            {isCreate ? 'New task' : readOnly ? 'Task' : 'Edit task'}
          </SheetTitle>
          <SheetDescription>
            Plan a follow-up, call, meeting or to-do for one of your contacts.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <form
            id={FORM_ID}
            onSubmit={(event) => void onSubmit(event)}
            noValidate
            className="space-y-6 p-6"
          >
            {mutation.isError && (
              <InlineAlert>{errorMessage(mutation.error, 'Couldn’t save the task.')}</InlineAlert>
            )}
            {!isCreate && !task && notFound && (
              <InlineAlert>This task no longer exists.</InlineAlert>
            )}
            {!isCreate && !task && detail.isError && !notFound && (
              <InlineAlert>{errorMessage(detail.error, 'Couldn’t load the task.')}</InlineAlert>
            )}
            {task && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 p-3">
                <TaskStatusBadge status={taskStatus(task)} />
                <TaskPriorityBadge priority={task.priority} />
                {isAutomatedTask(task) && (
                  <WorkflowBadge
                    kind="ai"
                    label={`Auto · ${TASK_ORIGIN_LABELS[task.origin]}`}
                    title="Created by the workflow"
                  />
                )}
                {canEdit && (
                  <div className="ms-auto flex gap-1.5">
                    {task.status === 'open' ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={setStatus.isPending}
                          onClick={() => {
                            changeStatus('done');
                          }}
                        >
                          <CircleCheck aria-hidden />
                          Mark done
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={setStatus.isPending}
                          onClick={() => {
                            changeStatus('cancelled');
                          }}
                        >
                          <Ban aria-hidden />
                          Cancel task
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={setStatus.isPending}
                        onClick={() => {
                          changeStatus('open');
                        }}
                      >
                        <RotateCcw aria-hidden />
                        Reopen
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
            <fieldset disabled={readOnly} className="contents">
              <FieldGroup>
                <FormInput
                  control={form.control}
                  name="title"
                  label="Task"
                  placeholder="e.g. Call to confirm Goa itinerary"
                  autoFocus={!readOnly}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormSelect
                    control={form.control}
                    name="type"
                    label="Type"
                    options={typeOptions}
                  />
                  <FormSelect
                    control={form.control}
                    name="priority"
                    label="Priority"
                    options={priorityOptions}
                  />
                </div>
                <FormDateTimePicker
                  control={form.control}
                  name="dueAt"
                  label="Due"
                  description={
                    dueAt && !readOnly ? (
                      <button
                        type="button"
                        className="underline-offset-4 hover:text-foreground hover:underline"
                        onClick={() => {
                          form.setValue('dueAt', null, { shouldDirty: true });
                        }}
                      >
                        Remove due date
                      </button>
                    ) : dueAt ? undefined : (
                      'Optional. Leave empty for a task without a deadline.'
                    )
                  }
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormSelect
                    control={form.control}
                    name="assigneeId"
                    label="Assigned to"
                    options={userOptions}
                    disabled={!canReassign}
                    placeholder="Me"
                    description={
                      canReassign || !isCreate ? undefined : 'Tasks you create are assigned to you.'
                    }
                  />
                  <FormSelect
                    control={form.control}
                    name="contactId"
                    label="Contact"
                    options={contacts.map((contact) => ({
                      value: contact.id,
                      label: contact.fullName,
                    }))}
                    allowEmpty
                    placeholder="No contact"
                    disabled={!isCreate}
                    description={isCreate ? undefined : 'Can’t be changed after creation.'}
                  />
                </div>
                <FormTextarea
                  control={form.control}
                  name="description"
                  label="Notes"
                  rows={4}
                  placeholder="Context for whoever picks this up"
                />
              </FieldGroup>
            </fieldset>
          </form>
        </ScrollArea>
        <SheetFooter className="flex-row justify-end gap-2 border-t p-4">
          <Button variant="ghost" onClick={close}>
            {readOnly ? 'Close' : 'Cancel'}
          </Button>
          {!readOnly && (
            <Button
              type="submit"
              form={FORM_ID}
              disabled={mutation.isPending || (!isCreate && !task)}
            >
              {mutation.isPending ? 'Saving…' : isCreate ? 'Create task' : 'Save task'}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
