import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { FormInput } from '@/components/form/form-input';
import { FormSelect } from '@/components/form/form-select';
import { FormSwitch } from '@/components/form/form-switch';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { applyProblem, errorMessage } from '@/services';

import { SCORING_CRITERIA, automationProblemCode, criterionNeedsValue } from '../constants';
import { useCreateScoringRule, useUpdateScoringRule } from '../hooks/use-automation';
import {
  scoringRuleSchema,
  type ScoringRuleFormOutput,
  type ScoringRuleFormValues,
} from '../schemas';
import type { ScoringRule, ScoringRuleCreateDto } from '../types';

import { CriterionValueField } from './criterion-value-field';

const FORM_ID = 'scoring-rule-form';

function toFormValues(rule?: ScoringRule): ScoringRuleFormValues {
  return {
    name: rule?.name ?? '',
    criterion: rule?.criterion ?? 'has_email',
    value: rule?.value ?? '',
    points: rule ? String(rule.points) : '10',
    active: rule?.active ?? true,
  };
}

function toDto(values: ScoringRuleFormOutput): ScoringRuleCreateDto {
  return {
    name: values.name,
    criterion: values.criterion,
    value: criterionNeedsValue(values.criterion) ? values.value : '',
    points: Number(values.points),
    active: values.active,
  };
}

interface ScoringRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Rule to edit; omitted to create one. */
  rule?: ScoringRule;
}

export function ScoringRuleDialog({ open, onOpenChange, rule }: ScoringRuleDialogProps) {
  const create = useCreateScoringRule();
  const update = useUpdateScoringRule();
  const mutation = rule ? update : create;

  const form = useForm<ScoringRuleFormValues, unknown, ScoringRuleFormOutput>({
    resolver: zodResolver(scoringRuleSchema),
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
    applyProblem(error, (field, fieldError) => {
      form.setError(field as keyof ScoringRuleFormValues, fieldError);
    });
    if (automationProblemCode(error) === 'name_taken') {
      form.setError('name', { type: 'server', message: 'A rule with this name already exists.' });
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    const body = toDto(values);
    const onSuccess = () => {
      toast.success(rule ? 'Scoring rule updated.' : 'Scoring rule added.');
      onOpenChange(false);
    };
    if (rule) update.mutate({ id: rule.id, body }, { onSuccess, onError });
    else create.mutate(body, { onSuccess, onError });
  });

  const showAlert = mutation.isError && automationProblemCode(mutation.error) !== 'name_taken';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{rule ? 'Edit scoring rule' : 'Add scoring rule'}</DialogTitle>
          <DialogDescription>
            When a lead matches, the points are added to its score. Use negative points to lower the
            score.
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
            placeholder="e.g. Left an email"
            autoFocus
          />
          <div className="grid items-start gap-4 sm:grid-cols-[1fr_8rem]">
            <FormSelect
              control={form.control}
              name="criterion"
              label="When the lead…"
              options={SCORING_CRITERIA}
            />
            <FormInput
              control={form.control}
              name="points"
              label="Points"
              type="number"
              min={-100}
              max={100}
            />
          </div>
          <CriterionValueField control={form.control} setValue={form.setValue} />
          <FormSwitch
            control={form.control}
            name="active"
            label="Active"
            description="Inactive rules are kept but don’t count towards scores."
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
