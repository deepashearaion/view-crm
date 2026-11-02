import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { errorMessage } from '@/services';
import { cn } from '@/lib/utils';

import { STAGE_COLORS, stageColorClass } from '../constants';
import { useSaveStages } from '../hooks/use-deals';
import { stageFormSchema } from '../schemas';
import type { DealStage, StageFormOutput, StageFormValues } from '../types';

const kindLabels = { open: 'Open', won: 'Won', lost: 'Lost' } as const;

interface ManageStagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: DealStage[];
}

/** Add, rename, reorder and remove pipeline stages. */
export function ManageStagesDialog({ open, onOpenChange, stages }: ManageStagesDialogProps) {
  const save = useSaveStages();
  const form = useForm<StageFormValues, unknown, StageFormOutput>({
    resolver: zodResolver(stageFormSchema),
    defaultValues: { stages: [] },
  });
  const { fields, append, remove, move } = useFieldArray({ control: form.control, name: 'stages' });

  useEffect(() => {
    if (open) {
      form.reset({
        stages: stages.map((stage) => ({ ...stage, probability: String(stage.probability) })),
      });
    }
  }, [open, stages, form]);

  const onSubmit = form.handleSubmit((values) => {
    save.mutate(
      values.stages.map((stage) => ({ ...stage, probability: Number(stage.probability) })),
      {
        onSuccess: () => {
          toast.success('Pipeline stages saved.');
          onOpenChange(false);
        },
      },
    );
  });

  const rootError =
    form.formState.errors.stages?.root?.message ?? form.formState.errors.stages?.message;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pipeline stages</DialogTitle>
          <DialogDescription>
            Order stages as deals progress. Probability drives the weighted forecast. Deals in a
            removed stage move to the first open stage.
          </DialogDescription>
        </DialogHeader>

        <form
          id="stages-form"
          onSubmit={(event) => void onSubmit(event)}
          noValidate
          className="space-y-3"
        >
          {save.isError && (
            <InlineAlert>{errorMessage(save.error, 'Couldn’t save stages.')}</InlineAlert>
          )}
          {rootError && <InlineAlert>{rootError}</InlineAlert>}
          <ol className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
            {fields.map((field, index) => {
              const nameError = form.formState.errors.stages?.[index]?.name?.message;
              const probabilityError = form.formState.errors.stages?.[index]?.probability?.message;
              return (
                <li
                  key={field.id}
                  className="flex flex-wrap items-start gap-2 rounded-lg border p-2 sm:flex-nowrap"
                >
                  <Controller
                    control={form.control}
                    name={`stages.${index}.color`}
                    render={({ field: colorField }) => (
                      <Select value={colorField.value} onValueChange={colorField.onChange}>
                        <SelectTrigger
                          className="h-9 w-14"
                          aria-label={`Colour for stage ${String(index + 1)}`}
                        >
                          <span
                            aria-hidden
                            className={cn(
                              'size-3 rounded-full',
                              stageColorClass[colorField.value].dot,
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {STAGE_COLORS.map((color) => (
                            <SelectItem key={color} value={color}>
                              <span
                                aria-hidden
                                className={cn('size-3 rounded-full', stageColorClass[color].dot)}
                              />
                              <span className="sr-only">{color}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <div className="min-w-40 flex-1">
                    <Input
                      aria-label={`Stage ${String(index + 1)} name`}
                      aria-invalid={Boolean(nameError)}
                      className="h-9"
                      {...form.register(`stages.${index}.name`)}
                    />
                    {nameError && <p className="mt-1 text-xs text-destructive">{nameError}</p>}
                  </div>
                  <Controller
                    control={form.control}
                    name={`stages.${index}.kind`}
                    render={({ field: kindField }) => (
                      <Select value={kindField.value} onValueChange={kindField.onChange}>
                        <SelectTrigger
                          className="h-9 w-24"
                          aria-label={`Stage ${String(index + 1)} type`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(kindLabels) as (keyof typeof kindLabels)[]).map((kind) => (
                            <SelectItem key={kind} value={kind}>
                              {kindLabels[kind]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <div className="w-20">
                    <div className="relative">
                      <Input
                        aria-label={`Stage ${String(index + 1)} win probability`}
                        aria-invalid={Boolean(probabilityError)}
                        inputMode="numeric"
                        className="h-9 pr-6"
                        {...form.register(`stages.${index}.probability`)}
                      />
                      <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs text-muted-foreground">
                        %
                      </span>
                    </div>
                    {probabilityError && (
                      <p className="mt-1 text-xs text-destructive">{probabilityError}</p>
                    )}
                  </div>
                  <div className="flex">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Move up"
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
                      aria-label="Move down"
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
                      aria-label="Remove stage"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        remove(index);
                      }}
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </div>
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
                id: `stage_${crypto.randomUUID().slice(0, 8)}`,
                name: '',
                kind: 'open',
                probability: '50',
                color: STAGE_COLORS[fields.length % 5] ?? 'chart-1',
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
