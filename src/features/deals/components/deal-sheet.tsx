import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { FormDateTimePicker } from '@/components/form/form-date-time-picker';
import { FormInput } from '@/components/form/form-input';
import { FormSelect } from '@/components/form/form-select';
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
import { errorMessage } from '@/services';

import { dealToFormValues, formValuesToDto } from '../api/deals';
import { DEAL_PRIORITIES } from '../constants';
import { useCreateDeal, useUpdateDeal } from '../hooks/use-deals';
import { dealFormSchema } from '../schemas';
import type { Deal, DealFormOutput, DealFormValues, DealStage } from '../types';

export type DealSheetState =
  { mode: 'closed' } | { mode: 'create'; stageId?: string } | { mode: 'edit'; deal: Deal };

interface DealSheetProps {
  state: DealSheetState;
  stages: DealStage[];
  onClose: () => void;
  onDelete: (deal: Deal) => void;
}

const FORM_ID = 'deal-form';

export function DealSheet({ state, stages, onClose, onDelete }: DealSheetProps) {
  const sessionUser = useSessionUser();
  const { data: users = [] } = useUsers();
  const { data: contacts = [] } = useContacts();
  const { data: companies = [] } = useCompanies();
  const createDeal = useCreateDeal();
  const updateDeal = useUpdateDeal();

  const defaults = {
    stageId: (state.mode === 'create' ? state.stageId : undefined) ?? stages[0]?.id ?? '',
    ownerId: sessionUser?.id === undefined ? '' : String(sessionUser.id),
  };
  const editing = state.mode === 'edit' ? state.deal : undefined;

  const form = useForm<DealFormValues, unknown, DealFormOutput>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: dealToFormValues(undefined, defaults),
  });

  useEffect(() => {
    if (state.mode !== 'closed') form.reset(dealToFormValues(editing, defaults));
    // Reset only when the sheet opens or switches record.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.mode, editing?.id]);

  const mutation = state.mode === 'edit' ? updateDeal : createDeal;

  const onSubmit = form.handleSubmit((values) => {
    const body = formValuesToDto(values);
    if (editing) {
      updateDeal.mutate(
        { id: editing.id, body },
        {
          onSuccess: () => {
            toast.success('Deal updated.');
            onClose();
          },
        },
      );
    } else {
      createDeal.mutate(body, {
        onSuccess: (deal) => {
          toast.success(`“${deal.title}” added to the pipeline.`);
          onClose();
        },
      });
    }
  });

  return (
    <Sheet
      open={state.mode !== 'closed'}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b p-6 pr-12">
          <SheetTitle className="text-lg">{editing ? 'Edit deal' : 'New deal'}</SheetTitle>
          <SheetDescription>
            {editing ? 'Update value, stage or ownership.' : 'Add an opportunity to the pipeline.'}
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
              <InlineAlert>{errorMessage(mutation.error, 'Couldn’t save the deal.')}</InlineAlert>
            )}
            <FieldGroup>
              <FormInput
                control={form.control}
                name="title"
                label="Deal name"
                placeholder="e.g. Goa family package, Dec"
                autoFocus
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="value"
                  label="Value (₹)"
                  inputMode="decimal"
                />
                <FormSelect
                  control={form.control}
                  name="stageId"
                  label="Stage"
                  options={stages.map((stage) => ({ value: stage.id, label: stage.name }))}
                />
                <FormSelect
                  control={form.control}
                  name="priority"
                  label="Priority"
                  options={DEAL_PRIORITIES.map((priority) => ({
                    value: priority.value,
                    label: priority.label,
                  }))}
                />
                <FormSelect
                  control={form.control}
                  name="ownerId"
                  label="Owner"
                  options={users.map((user) => ({ value: user.id, label: user.name }))}
                  allowEmpty
                  placeholder="Unassigned"
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
              <FormDateTimePicker
                control={form.control}
                name="expectedClose"
                label="Expected close"
                withTime={false}
              />
            </FieldGroup>
          </form>
        </ScrollArea>
        <SheetFooter className="flex-row justify-between gap-2 border-t p-4">
          {editing ? (
            <Button
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                onDelete(editing);
              }}
            >
              <Trash2 aria-hidden />
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form={FORM_ID} disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : editing ? 'Save deal' : 'Create deal'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
