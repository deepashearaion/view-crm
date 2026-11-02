import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { FormDateTimePicker } from '@/components/form/form-date-time-picker';
import { FormInput } from '@/components/form/form-input';
import { FormSelect, type SelectOption } from '@/components/form/form-select';
import { FormTextarea } from '@/components/form/form-textarea';
import { InlineAlert } from '@/components/feedback/inline-alert';
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
import { useSessionUser, useUsers } from '@/features/auth';
import { useCompanies } from '@/features/companies';
import { useContacts } from '@/features/contacts';
import type { RecordSheetState } from '@/hooks/use-record-sheet-state';
import { errorMessage } from '@/services';

import { formValuesToDto, taskToFormValues } from '../api/tasks';
import { TASK_TYPES } from '../constants';
import { useCreateTask, useTasks, useUpdateTask } from '../hooks/use-tasks';
import { taskFormSchema } from '../schemas';
import type { TaskFormOutput, TaskFormValues } from '../types';

const FORM_ID = 'task-form';
const typeOptions: SelectOption[] = TASK_TYPES.map((type) => ({
  value: type.value,
  label: type.label,
}));

interface TaskSheetProps {
  state: RecordSheetState;
  onStateChange: (state: RecordSheetState) => void;
}

/** Create / edit a task. Tasks are simple enough that "view" opens the editor directly. */
export function TaskSheet({ state, onStateChange }: TaskSheetProps) {
  const sessionUser = useSessionUser();
  const { data: tasks } = useTasks();
  const { data: users = [] } = useUsers();
  const { data: contacts = [] } = useContacts();
  const { data: companies = [] } = useCompanies();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const taskId = state.mode === 'view' || state.mode === 'edit' ? state.id : null;
  const task = tasks?.find((item) => item.id === taskId);
  const defaultOwner = sessionUser?.id === undefined ? '' : String(sessionUser.id);

  const form = useForm<TaskFormValues, unknown, TaskFormOutput>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: taskToFormValues(undefined, defaultOwner),
  });

  useEffect(() => {
    if (state.mode === 'create') form.reset(taskToFormValues(undefined, defaultOwner));
    else if (task) form.reset(taskToFormValues(task));
  }, [state.mode, task, defaultOwner, form]);

  const close = () => {
    onStateChange({ mode: 'closed' });
  };
  const mutation = state.mode === 'create' ? createTask : updateTask;

  const onSubmit = form.handleSubmit((values) => {
    const body = formValuesToDto(values);
    if (state.mode === 'create') {
      createTask.mutate(body, {
        onSuccess: () => {
          toast.success('Task created.');
          close();
        },
      });
    } else if (taskId) {
      updateTask.mutate(
        { id: taskId, body },
        {
          onSuccess: () => {
            toast.success('Task updated.');
            close();
          },
        },
      );
    }
  });

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
            {state.mode === 'create' ? 'New task' : 'Edit task'}
          </SheetTitle>
          <SheetDescription>
            Plan a follow-up, meeting or quotation for one of your contacts.
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
            {state.mode !== 'create' && !task && tasks && (
              <InlineAlert>This task no longer exists.</InlineAlert>
            )}
            <FieldGroup>
              <FormInput
                control={form.control}
                name="title"
                label="Task"
                placeholder="e.g. Call to confirm Goa itinerary"
                autoFocus
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect control={form.control} name="type" label="Type" options={typeOptions} />
                <FormSelect
                  control={form.control}
                  name="ownerId"
                  label="Assigned to"
                  options={users.map((user) => ({ value: user.id, label: user.name }))}
                  allowEmpty
                  placeholder="Unassigned"
                />
              </div>
              <FormDateTimePicker control={form.control} name="dueAt" label="Due" />
              <div className="grid gap-4 sm:grid-cols-2">
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
                />
                <FormSelect
                  control={form.control}
                  name="companyId"
                  label="Company"
                  options={companies.map((company) => ({ value: company.id, label: company.name }))}
                  allowEmpty
                  placeholder="No company"
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
          </form>
        </ScrollArea>
        <SheetFooter className="flex-row justify-end gap-2 border-t p-4">
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : state.mode === 'create' ? 'Create task' : 'Save task'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
