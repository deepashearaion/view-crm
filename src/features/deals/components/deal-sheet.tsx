import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch, type Path } from 'react-hook-form';
import { toast } from 'sonner';

import { FormDateTimePicker } from '@/components/form/form-date-time-picker';
import { FormInput } from '@/components/form/form-input';
import { FormSelect } from '@/components/form/form-select';
import { FormTextarea } from '@/components/form/form-textarea';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useSessionUser, useUsers } from '@/features/auth';
import { useContacts } from '@/features/contacts';
import { cn } from '@/lib/utils';
import { applyProblem, errorMessage, fieldReasonMessage } from '@/services';

import { dealToFormValues, formValuesToCreateDto, formValuesToUpdateDto } from '../api/deals';
import {
  BILLING_PERIODS,
  BILLING_PERIOD_LABELS,
  BILLING_TYPES,
  BILLING_TYPE_LABELS,
  stageColorClass,
} from '../constants';
import { useCreateDeal, useUpdateDeal } from '../hooks/use-deals';
import { dealFormSchema } from '../schemas';
import type { Deal, DealFormOutput, DealFormValues, DealStage } from '../types';
import { DealHistory } from './deal-history';

/** A move that answered `422 stage_requirements`; it is retried once the deal is saved. */
export interface StageRequirements {
  stageId: string;
  stageName: string;
  lostReason?: string;
  /** API field → reason, e.g. `{ amount: 'required' }`. */
  errors: Record<string, string>;
}

export type DealSheetState =
  | { mode: 'closed' }
  | { mode: 'create'; stageId?: string }
  | { mode: 'edit'; deal: Deal; requirements?: StageRequirements };

interface DealSheetProps {
  state: DealSheetState;
  stages: DealStage[];
  /** False for viewers: the sheet is read-only. */
  canEdit: boolean;
  /** Owner select is shown only to roles that can reassign. */
  canReassign: boolean;
  onClose: () => void;
  /** Called after a successful create or update. */
  onSaved: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
  /** Stage changes go through POST /deals/{id}/stage, never the PATCH. */
  onMove: (deal: Deal, stageId: string) => void;
}

/** API field names (problem `errors`, stage requirements) → form fields. */
const FIELD_MAP: Record<string, Path<DealFormValues>> = {
  title: 'title',
  description: 'description',
  amount: 'amount',
  amount_paise: 'amount',
  billing_type: 'billingType',
  billing_period: 'billingPeriod',
  stage_id: 'stageId',
  owner_id: 'ownerId',
  contact: 'contactId',
  contact_id: 'contactId',
  expected_close_date: 'expectedClose',
};

function isBlank(values: DealFormValues, field: Path<DealFormValues>): boolean {
  const value: unknown = values[field];
  if (field === 'amount') return value === '' || Number(value) === 0;
  return value === '' || value === undefined;
}

const FORM_ID = 'deal-form';

export function DealSheet({
  state,
  stages,
  canEdit,
  canReassign,
  onClose,
  onSaved,
  onDelete,
  onMove,
}: DealSheetProps) {
  const sessionUser = useSessionUser();
  const { data: users = [] } = useUsers();
  const { data: contacts = [] } = useContacts();
  const createDeal = useCreateDeal();
  const updateDeal = useUpdateDeal();

  const openStages = stages.filter((stage) => stage.kind === 'open');
  const defaults = {
    stageId: (state.mode === 'create' ? state.stageId : undefined) ?? openStages[0]?.id ?? '',
    ownerId: sessionUser?.id === undefined ? '' : String(sessionUser.id),
  };
  const editing = state.mode === 'edit' ? state.deal : undefined;
  const requirements = state.mode === 'edit' ? state.requirements : undefined;
  const currentStage = editing ? stages.find((stage) => stage.id === editing.stageId) : undefined;

  const form = useForm<DealFormValues, unknown, DealFormOutput>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: dealToFormValues(undefined, defaults),
  });
  const billingType = useWatch({ control: form.control, name: 'billingType' });
  const expectedClose = useWatch({ control: form.control, name: 'expectedClose' });

  useEffect(() => {
    if (state.mode !== 'closed') {
      form.reset(dealToFormValues(editing, defaults));
      createDeal.reset();
      updateDeal.reset();
    }
    // Reset only when the sheet opens or switches record.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.mode, editing?.id]);

  // Highlight what the target stage needs (runs after the reset above).
  useEffect(() => {
    if (!requirements) return;
    for (const [field, reason] of Object.entries(requirements.errors)) {
      const name = FIELD_MAP[field];
      if (!name) continue;
      form.setError(name, {
        type: 'server',
        message:
          reason === 'required'
            ? `Required for ${requirements.stageName}.`
            : fieldReasonMessage(reason),
      });
    }
  }, [requirements, form]);

  const mutation = state.mode === 'edit' ? updateDeal : createDeal;

  const onServerError = (error: unknown) => {
    applyProblem(error, (field, fieldError) => {
      const name = FIELD_MAP[field];
      if (name) form.setError(name, fieldError);
    });
  };

  const onSubmit = form.handleSubmit((values) => {
    if (requirements) {
      let missing = false;
      for (const field of Object.keys(requirements.errors)) {
        const name = FIELD_MAP[field];
        if (name && isBlank(values, name)) {
          missing = true;
          form.setError(name, {
            type: 'required',
            message: `Required for ${requirements.stageName}.`,
          });
        }
      }
      if (missing) return;
    }

    if (editing) {
      const body = formValuesToUpdateDto(values, editing, { canReassign });
      if (Object.keys(body).length === 0) {
        onSaved(editing);
        return;
      }
      updateDeal.mutate(
        { id: editing.id, body },
        {
          onSuccess: (deal) => {
            toast.success('Deal updated.');
            onSaved(deal);
          },
          onError: onServerError,
        },
      );
    } else {
      createDeal.mutate(formValuesToCreateDto(values, { canReassign }), {
        onSuccess: (deal) => {
          toast.success(`“${deal.title}” added to the pipeline.`);
          onSaved(deal);
        },
        onError: onServerError,
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
          <SheetTitle className="text-lg">
            {editing ? (canEdit ? 'Edit deal' : editing.title) : 'New deal'}
          </SheetTitle>
          <SheetDescription>
            {editing
              ? canEdit
                ? 'Update value, stage or ownership.'
                : 'You have read-only access.'
              : 'Add an opportunity to the pipeline.'}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-6 p-6">
            {requirements && (
              <InlineAlert tone="info">
                Moving to {requirements.stageName} needs the highlighted details. Save the deal and
                it moves automatically.
              </InlineAlert>
            )}
            {mutation.isError && (
              <InlineAlert>{errorMessage(mutation.error, 'Couldn’t save the deal.')}</InlineAlert>
            )}

            {editing && (
              <div className="space-y-3 rounded-lg border p-3">
                <Field>
                  <FieldLabel htmlFor="deal-stage">Stage</FieldLabel>
                  <Select
                    value={editing.stageId}
                    disabled={!canEdit}
                    onValueChange={(stageId) => {
                      onMove(editing, stageId);
                    }}
                  >
                    <SelectTrigger id="deal-stage" className="h-9 w-full">
                      <SelectValue placeholder={editing.stageName} />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          <span
                            aria-hidden
                            className={cn('size-2 rounded-full', stageColorClass[stage.color].dot)}
                          />
                          {stage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                {currentStage?.guidance && (
                  <p className="text-xs text-muted-foreground">{currentStage.guidance}</p>
                )}
                {editing.status === 'lost' && editing.lostReason && (
                  <p className="text-sm">
                    <span className="font-medium text-destructive">Lost reason:</span>{' '}
                    {editing.lostReason}
                  </p>
                )}
                {editing.status === 'open' && (
                  <div className="text-sm">
                    <p>
                      <span className="font-medium">{editing.winProbability}%</span>{' '}
                      <span className="text-muted-foreground">win probability</span>
                    </p>
                    {editing.probabilityNotes.length > 0 && (
                      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
                        {editing.probabilityNotes.map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}

            <form id={FORM_ID} onSubmit={(event) => void onSubmit(event)} noValidate>
              <fieldset disabled={!canEdit} className="contents">
                <FieldGroup>
                  <FormInput
                    control={form.control}
                    name="title"
                    label="Deal name"
                    placeholder="e.g. Goa family package, Dec"
                    autoFocus={canEdit && !requirements}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      control={form.control}
                      name="amount"
                      label={billingType === 'recurring' ? 'Amount per period (₹)' : 'Amount (₹)'}
                      inputMode="decimal"
                    />
                    <FormSelect
                      control={form.control}
                      name="billingType"
                      label="Billing"
                      disabled={!canEdit}
                      options={BILLING_TYPES.map((type) => ({
                        value: type,
                        label: BILLING_TYPE_LABELS[type],
                      }))}
                    />
                    {billingType === 'recurring' && (
                      <FormSelect
                        control={form.control}
                        name="billingPeriod"
                        label="Billed"
                        disabled={!canEdit}
                        placeholder="Choose period"
                        options={BILLING_PERIODS.map((period) => ({
                          value: period,
                          label: BILLING_PERIOD_LABELS[period],
                        }))}
                      />
                    )}
                    {!editing && (
                      <FormSelect
                        control={form.control}
                        name="stageId"
                        label="Stage"
                        options={openStages.map((stage) => ({
                          value: stage.id,
                          label: stage.name,
                        }))}
                      />
                    )}
                    {canReassign && (
                      <FormSelect
                        control={form.control}
                        name="ownerId"
                        label="Owner"
                        options={users.map((user) => ({ value: user.id, label: user.name }))}
                        placeholder="Unassigned"
                      />
                    )}
                    <FormSelect
                      control={form.control}
                      name="contactId"
                      label="Contact"
                      disabled={!canEdit}
                      options={contacts.map((contact) => ({
                        value: contact.id,
                        label: contact.fullName,
                      }))}
                      allowEmpty
                      placeholder="No contact"
                    />
                  </div>
                  <div className="space-y-1">
                    <FormDateTimePicker
                      control={form.control}
                      name="expectedClose"
                      label="Expected close"
                      withTime={false}
                    />
                    {expectedClose && canEdit && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-muted-foreground"
                        onClick={() => {
                          form.setValue('expectedClose', undefined, { shouldDirty: true });
                        }}
                      >
                        <X aria-hidden />
                        Clear date
                      </Button>
                    )}
                  </div>
                  <FormTextarea
                    control={form.control}
                    name="description"
                    label="Description"
                    rows={3}
                    placeholder="Scope, requirements, next steps…"
                  />
                </FieldGroup>
              </fieldset>
            </form>

            {editing && (
              <>
                <Separator />
                <DealHistory dealId={editing.id} />
              </>
            )}
          </div>
        </ScrollArea>
        <SheetFooter className="flex-row justify-between gap-2 border-t p-4">
          {editing && canEdit ? (
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
              {canEdit ? 'Cancel' : 'Close'}
            </Button>
            {canEdit && (
              <Button type="submit" form={FORM_ID} disabled={mutation.isPending}>
                {mutation.isPending
                  ? 'Saving…'
                  : requirements
                    ? `Save and move to ${requirements.stageName}`
                    : editing
                      ? 'Save deal'
                      : 'Create deal'}
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
