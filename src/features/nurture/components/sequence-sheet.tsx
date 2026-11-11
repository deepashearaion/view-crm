import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { FormInput } from '@/components/form/form-input';
import { FormSelect } from '@/components/form/form-select';
import { FormSwitch } from '@/components/form/form-switch';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { RecordSheetState } from '@/hooks/use-record-sheet-state';
import { applyProblem, errorMessage, isHttpError } from '@/services';

import { formValuesToSequenceDto, sequenceToFormValues } from '../api/form-mapping';
import {
  NURTURE_PROBLEM_CODES,
  NURTURE_TRIGGERS,
  TRIGGER_DESCRIPTIONS,
  nurtureProblemCode,
} from '../constants';
import {
  useCreateNurtureSequence,
  useNurtureSequence,
  useNurtureSequences,
  useUpdateNurtureSequence,
} from '../hooks/use-nurture';
import { sequenceFormSchema, type SequenceFormOutput, type SequenceFormValues } from '../schemas';
import { SequenceStepsField } from './sequence-steps-field';

const FORM_ID = 'nurture-sequence-form';

const triggerOptions = NURTURE_TRIGGERS.map((trigger) => ({
  value: trigger.value,
  label: trigger.label,
}));

const FIELD_MAP = { stop_on_reply: 'stopOnReply' };

interface SequenceSheetProps {
  state: RecordSheetState;
  onStateChange: (state: RecordSheetState) => void;
}

/** Create / edit a nurture sequence and its ordered steps (org-wide nurture.create / nurture.edit). */
export function SequenceSheet({ state, onStateChange }: SequenceSheetProps) {
  const isCreate = state.mode === 'create';
  const sequenceId = state.mode === 'view' || state.mode === 'edit' ? state.id : undefined;
  const listQuery = useNurtureSequences();
  const listSequence = listQuery.data?.find((item) => item.id === sequenceId);
  // Deep links may point at a sequence before the list has loaded: fetch it on its own.
  const detail = useNurtureSequence(listSequence || listQuery.isPending ? undefined : sequenceId);
  const sequence = listSequence ?? detail.data;
  const notFound = isHttpError(detail.error) && detail.error.status === 404;
  const createSequence = useCreateNurtureSequence();
  const updateSequence = useUpdateNurtureSequence();
  const mutation = isCreate ? createSequence : updateSequence;

  const form = useForm<SequenceFormValues, unknown, SequenceFormOutput>({
    resolver: zodResolver(sequenceFormSchema),
    defaultValues: sequenceToFormValues(undefined),
  });
  const trigger = useWatch({ control: form.control, name: 'trigger' });

  // Reset when the sheet opens on a record (or it first loads), not on background refetches.
  const resetKey = isCreate ? 'create' : sequence ? `${sequence.id}@${sequence.updatedAt}` : null;
  useEffect(() => {
    if (resetKey === null) return;
    form.reset(sequenceToFormValues(isCreate ? undefined : sequence));
    createSequence.reset();
    updateSequence.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const close = () => {
    onStateChange({ mode: 'closed' });
  };

  const onError = (error: Error) => {
    const code = nurtureProblemCode(error);
    if (code === NURTURE_PROBLEM_CODES.nameTaken) {
      form.setError('name', { type: 'server', message: 'Another sequence already has this name.' });
      return;
    }
    if (code === NURTURE_PROBLEM_CODES.triggerTaken) {
      form.setError('trigger', {
        type: 'server',
        message:
          'Another active sequence already uses this trigger. Deactivate that one first, or save this one as inactive.',
      });
      return;
    }
    applyProblem(
      error,
      (field, fieldError) => {
        form.setError(field as keyof SequenceFormValues, fieldError);
      },
      FIELD_MAP,
    );
  };

  const onSubmit = form.handleSubmit((values) => {
    const body = formValuesToSequenceDto(values);
    if (isCreate) {
      createSequence.mutate(body, {
        onSuccess: () => {
          toast.success('Sequence created.');
          close();
        },
        onError,
      });
      return;
    }
    if (!sequence) return;
    updateSequence.mutate(
      { id: sequence.id, body },
      {
        onSuccess: () => {
          toast.success('Sequence saved.');
          close();
        },
        onError,
      },
    );
  });

  const handledCode = nurtureProblemCode(mutation.error);
  const showMutationError =
    mutation.isError &&
    handledCode !== NURTURE_PROBLEM_CODES.nameTaken &&
    handledCode !== NURTURE_PROBLEM_CODES.triggerTaken;

  return (
    <Sheet
      open={state.mode !== 'closed'}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl">
        <SheetHeader className="border-b p-6 pr-12">
          <SheetTitle className="text-lg">{isCreate ? 'New sequence' : 'Edit sequence'}</SheetTitle>
          <SheetDescription>
            A timed cadence of emails and WhatsApp messages. Replies re-score the lead.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <form
            id={FORM_ID}
            onSubmit={(event) => void onSubmit(event)}
            noValidate
            className="space-y-6 p-6"
          >
            {showMutationError && (
              <InlineAlert>
                {errorMessage(mutation.error, 'Couldn’t save the sequence.')}
              </InlineAlert>
            )}
            {!isCreate && !sequence && notFound && (
              <InlineAlert>This sequence no longer exists.</InlineAlert>
            )}
            {!isCreate && !sequence && detail.isError && !notFound && (
              <InlineAlert>{errorMessage(detail.error, 'Couldn’t load the sequence.')}</InlineAlert>
            )}
            <FieldGroup>
              <FormInput
                control={form.control}
                name="name"
                label="Name"
                placeholder="e.g. New lead welcome"
                autoFocus={isCreate}
              />
              <FormSelect
                control={form.control}
                name="trigger"
                label="Enroll contacts"
                options={triggerOptions}
                description={
                  trigger === 'manual'
                    ? TRIGGER_DESCRIPTIONS.manual
                    : `${TRIGGER_DESCRIPTIONS[trigger]} Only one active sequence per automatic trigger.`
                }
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <FormSwitch
                  control={form.control}
                  name="active"
                  label="Active"
                  description="Inactive sequences send nothing."
                />
                <FormSwitch
                  control={form.control}
                  name="stopOnReply"
                  label="Stop on reply"
                  description="End the cadence when the contact replies."
                />
              </div>
            </FieldGroup>
            <Separator />
            <SequenceStepsField form={form} />
          </form>
        </ScrollArea>
        <SheetFooter className="flex-row justify-end gap-2 border-t p-4">
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            disabled={mutation.isPending || (!isCreate && !sequence)}
          >
            {mutation.isPending ? 'Saving…' : isCreate ? 'Create sequence' : 'Save sequence'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
