import { zodResolver } from '@hookform/resolvers/zod';
import { Repeat } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { FormInput } from '@/components/form/form-input';
import { FormSelect } from '@/components/form/form-select';
import { FormSwitch } from '@/components/form/form-switch';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FieldError, FieldLegend, FieldSet } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { useUsers } from '@/features/auth';
import { cn } from '@/lib/utils';
import { applyProblem, errorMessage } from '@/services';

import { ASSIGNMENT_CRITERIA, automationProblemCode, criterionNeedsValue } from '../constants';
import { useCreateAssignmentRule, useUpdateAssignmentRule } from '../hooks/use-automation';
import {
  assignmentRuleSchema,
  type AssignmentRuleFormOutput,
  type AssignmentRuleFormValues,
} from '../schemas';
import type { AssignmentRule } from '../types';

import { CriterionValueField } from './criterion-value-field';

const FORM_ID = 'assignment-rule-form';

function toFormValues(rule?: AssignmentRule): AssignmentRuleFormValues {
  return {
    name: rule?.name ?? '',
    criterion: rule?.criterion ?? 'any',
    value: rule?.value ?? '',
    active: rule?.active ?? true,
    userIds: rule ? [...rule.userIds] : [],
  };
}

interface AssignmentRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Rule to edit; omitted to create one. */
  rule?: AssignmentRule;
  /** Position for a new rule (after the last one). */
  nextPosition: number;
}

export function AssignmentRuleDialog({
  open,
  onOpenChange,
  rule,
  nextPosition,
}: AssignmentRuleDialogProps) {
  const create = useCreateAssignmentRule();
  const update = useUpdateAssignmentRule();
  const mutation = rule ? update : create;
  const { data: users = [], isPending: usersPending, error: usersError } = useUsers();

  const form = useForm<AssignmentRuleFormValues, unknown, AssignmentRuleFormOutput>({
    resolver: zodResolver(assignmentRuleSchema),
    defaultValues: toFormValues(rule),
  });

  useEffect(() => {
    if (open) {
      form.reset(toFormValues(rule));
      create.reset();
      update.reset();
    }
    // Reset only when the dialog opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onError = (error: unknown) => {
    applyProblem(
      error,
      (field, fieldError) => {
        form.setError(field as keyof AssignmentRuleFormValues, fieldError);
      },
      { user_ids: 'userIds' },
    );
    if (automationProblemCode(error) === 'name_taken') {
      form.setError('name', { type: 'server', message: 'A rule with this name already exists.' });
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    const body = {
      name: values.name,
      criterion: values.criterion,
      value: criterionNeedsValue(values.criterion) ? values.value : '',
      active: values.active,
      user_ids: values.userIds.map(Number),
    };
    const onSuccess = () => {
      toast.success(rule ? 'Routing rule updated.' : 'Routing rule added.');
      onOpenChange(false);
    };
    if (rule) update.mutate({ id: rule.id, body }, { onSuccess, onError });
    else create.mutate({ ...body, position: nextPosition }, { onSuccess, onError });
  });

  const showAlert = mutation.isError && automationProblemCode(mutation.error) !== 'name_taken';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{rule ? 'Edit routing rule' : 'Add routing rule'}</DialogTitle>
          <DialogDescription>
            New leads that match are assigned to the selected users. With several users, leads are
            handed out round-robin.
          </DialogDescription>
        </DialogHeader>
        <form
          id={FORM_ID}
          onSubmit={(event) => void onSubmit(event)}
          noValidate
          className="grid gap-4"
        >
          {showAlert && (
            <InlineAlert>{errorMessage(mutation.error, 'Couldn’t save the rule.')}</InlineAlert>
          )}
          <FormInput
            control={form.control}
            name="name"
            label="Name"
            placeholder="e.g. WhatsApp leads to the inside team"
            autoFocus
          />
          <FormSelect
            control={form.control}
            name="criterion"
            label="Applies to"
            options={ASSIGNMENT_CRITERIA}
          />
          <CriterionValueField control={form.control} setValue={form.setValue} />
          <Controller
            control={form.control}
            name="userIds"
            render={({ field, fieldState }) => (
              <FieldSet data-invalid={fieldState.invalid} className="gap-2">
                <FieldLegend variant="label" className="mb-0 flex items-center gap-2">
                  Assign to
                  {field.value.length > 1 && (
                    <span className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground">
                      <Repeat aria-hidden className="size-3" />
                      Round-robin between {String(field.value.length)} users
                    </span>
                  )}
                </FieldLegend>
                <div
                  className={cn(
                    'max-h-56 overflow-y-auto rounded-lg border',
                    fieldState.invalid && 'border-destructive',
                  )}
                >
                  {usersPending ? (
                    <div className="space-y-2 p-3">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ) : usersError ? (
                    <p className="p-3 text-sm text-destructive">
                      {errorMessage(usersError, 'Couldn’t load users.')}
                    </p>
                  ) : (
                    <ul className="divide-y">
                      {users.map((user) => {
                        const checked = field.value.includes(user.id);
                        return (
                          <li key={user.id}>
                            <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(next) => {
                                  field.onChange(
                                    next === true
                                      ? [...field.value, user.id]
                                      : field.value.filter((id) => id !== user.id),
                                  );
                                }}
                              />
                              <span className="min-w-0 flex-1 truncate">{user.name}</span>
                              <span className="text-xs text-muted-foreground">{user.roleName}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldSet>
            )}
          />
          <FormSwitch
            control={form.control}
            name="active"
            label="Active"
            description="Inactive rules are skipped when routing."
          />
        </form>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : rule ? 'Save rule' : 'Add rule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
