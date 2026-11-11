import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { StageSyncError, stageSyncErrorMessage } from '../api/stages';
import {
  STAGE_KINDS,
  STAGE_KIND_LABELS,
  STAGE_REQUIRED_FIELDS,
  STAGE_REQUIRED_FIELD_LABELS,
  stageColor,
  stageColorClass,
} from '../constants';
import { useSaveStages } from '../hooks/use-deals';
import { stageFormSchema } from '../schemas';
import type { DealStage, StageFormOutput, StageFormValues } from '../types';

interface ManageStagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: DealStage[];
}

function toRows(stages: DealStage[]): StageFormValues['stages'] {
  return stages.map((stage) => ({
    stageId: stage.id,
    name: stage.name,
    kind: stage.kind,
    probability: String(stage.probability),
    guidance: stage.guidance,
    requiredFields: [...stage.requiredFields],
  }));
}

/** Add, rename, reorder, guide and remove pipeline stages (settings.edit). */
export function ManageStagesDialog({ open, onOpenChange, stages }: ManageStagesDialogProps) {
  const save = useSaveStages();
  const form = useForm<StageFormValues, unknown, StageFormOutput>({
    resolver: zodResolver(stageFormSchema),
    defaultValues: { stages: [] },
  });
  const { fields, append, remove, move } = useFieldArray({ control: form.control, name: 'stages' });
  const rows = useWatch({ control: form.control, name: 'stages' });

  useEffect(() => {
    if (open) {
      form.reset({ stages: toRows(stages) });
      save.reset();
    }
    // Reset only when the dialog opens: stages refetch after a partial save and must not
    // wipe the edits still to be applied.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = form.handleSubmit((values) => {
    save.mutate(
      {
        original: stages,
        stages: values.stages,
        onCreated: (index, id) => {
          form.setValue(`stages.${index}.stageId`, id);
        },
      },
      {
        onSuccess: () => {
          toast.success('Pipeline stages saved.');
          onOpenChange(false);
        },
        onError: (error) => {
          if (
            error instanceof StageSyncError &&
            error.code === 'name_taken' &&
            error.rowIndex !== undefined
          ) {
            form.setError(`stages.${error.rowIndex}.name`, {
              type: 'server',
              message: 'Name already used.',
            });
          }
        },
      },
    );
  });

  const rootError =
    form.formState.errors.stages?.root?.message ?? form.formState.errors.stages?.message;

  let openIndex = 0;
  const colors = rows.map((row) => stageColor(row.kind, row.kind === 'open' ? openIndex++ : 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pipeline stages</DialogTitle>
          <DialogDescription>
            Order stages as deals progress. Probability feeds the forecast, guidance shows on the
            board, and required fields must be filled before a deal can enter the stage. A stage can
            only be removed once no deals are in it.
          </DialogDescription>
        </DialogHeader>

        <form
          id="stages-form"
          onSubmit={(event) => void onSubmit(event)}
          noValidate
          className="space-y-3"
        >
          {save.isError && <InlineAlert>{stageSyncErrorMessage(save.error)}</InlineAlert>}
          {rootError && <InlineAlert>{rootError}</InlineAlert>}
          <ol className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
            {fields.map((field, index) => {
              const label = `Stage ${String(index + 1)}`;
              const errors = form.formState.errors.stages?.[index];
              const isNew = !rows[index]?.stageId;
              const color = colors[index] ?? 'chart-1';
              return (
                <li key={field.id} className="space-y-2 rounded-lg border p-2">
                  <div className="flex flex-wrap items-start gap-2 sm:flex-nowrap">
                    <span className="flex h-9 w-4 items-center justify-center">
                      <span
                        aria-hidden
                        className={cn('size-3 rounded-full', stageColorClass[color].dot)}
                      />
                    </span>
                    <div className="min-w-40 flex-1">
                      <Input
                        aria-label={`${label} name`}
                        aria-invalid={Boolean(errors?.name)}
                        className="h-9"
                        {...form.register(`stages.${index}.name`)}
                      />
                      {errors?.name && (
                        <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
                      )}
                    </div>
                    <Controller
                      control={form.control}
                      name={`stages.${index}.kind`}
                      render={({ field: kindField }) => (
                        <Select
                          value={kindField.value}
                          onValueChange={kindField.onChange}
                          disabled={!isNew}
                        >
                          <SelectTrigger
                            className="h-9 w-24"
                            aria-label={`${label} type`}
                            title={isNew ? undefined : 'An existing stage’s type can’t change.'}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STAGE_KINDS.map((kind) => (
                              <SelectItem key={kind} value={kind}>
                                {STAGE_KIND_LABELS[kind]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <div className="w-20">
                      <div className="relative">
                        <Input
                          aria-label={`${label} win probability`}
                          aria-invalid={Boolean(errors?.probability)}
                          inputMode="numeric"
                          className="h-9 pr-6"
                          {...form.register(`stages.${index}.probability`)}
                        />
                        <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs text-muted-foreground">
                          %
                        </span>
                      </div>
                      {errors?.probability && (
                        <p className="mt-1 text-xs text-destructive">
                          {errors.probability.message}
                        </p>
                      )}
                    </div>
                    <div className="flex">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Move ${label.toLowerCase()} up`}
                        disabled={index === 0}
                        onClick={() => {
                          move(index, index - 1);
                        }}
                      >
                        <ArrowUp aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Move ${label.toLowerCase()} down`}
                        disabled={index === fields.length - 1}
                        onClick={() => {
                          move(index, index + 1);
                        }}
                      >
                        <ArrowDown aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove ${label.toLowerCase()}`}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => {
                          remove(index);
                        }}
                      >
                        <Trash2 aria-hidden />
                      </Button>
                    </div>
                  </div>
                  <div className="pl-6">
                    <Input
                      aria-label={`${label} guidance`}
                      aria-invalid={Boolean(errors?.guidance)}
                      placeholder="Guidance for reps in this stage (optional)"
                      className="h-8 text-sm"
                      {...form.register(`stages.${index}.guidance`)}
                    />
                    {errors?.guidance && (
                      <p className="mt-1 text-xs text-destructive">{errors.guidance.message}</p>
                    )}
                  </div>
                  <Controller
                    control={form.control}
                    name={`stages.${index}.requiredFields`}
                    render={({ field: requiredField }) => (
                      <fieldset className="flex flex-wrap items-center gap-x-4 gap-y-1 pl-6 text-xs text-muted-foreground">
                        <legend className="sr-only">{label} required fields</legend>
                        <span aria-hidden>Required to enter:</span>
                        {STAGE_REQUIRED_FIELDS.map((key) => {
                          const checked = requiredField.value.includes(key);
                          return (
                            <label key={key} className="flex items-center gap-1.5">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(next) => {
                                  requiredField.onChange(
                                    next === true
                                      ? [...requiredField.value, key]
                                      : requiredField.value.filter((item) => item !== key),
                                  );
                                }}
                              />
                              {STAGE_REQUIRED_FIELD_LABELS[key]}
                            </label>
                          );
                        })}
                      </fieldset>
                    )}
                  />
                </li>
              );
            })}
          </ol>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              append({
                stageId: '',
                name: '',
                kind: 'open',
                probability: '50',
                guidance: '',
                requiredFields: [],
              });
            }}
          >
            <Plus aria-hidden />
            Add stage
          </Button>
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
          <Button type="submit" form="stages-form" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : 'Save stages'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
