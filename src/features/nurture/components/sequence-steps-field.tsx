import { ArrowDown, ArrowUp, Mail, MessageCircle, Plus, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import {
  Controller,
  useFieldArray,
  useWatch,
  type FieldError as RhfFieldError,
  type UseFormReturn,
} from 'react-hook-form';

import { FormInput } from '@/components/form/form-input';
import { FormSelect } from '@/components/form/form-select';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { emptyStep, formatDelay } from '../api/form-mapping';
import { NURTURE_LIMITS, NURTURE_PLACEHOLDERS, NURTURE_STEP_CHANNELS } from '../constants';
import { stepDelayMinutes, type SequenceFormOutput, type SequenceFormValues } from '../schemas';

type SequenceForm = UseFormReturn<SequenceFormValues, unknown, SequenceFormOutput>;

const channelOptions = NURTURE_STEP_CHANNELS.map((channel) => ({
  value: channel.value,
  label: channel.label,
}));

const DELAY_PARTS = [
  { key: 'days', unit: 'd', label: 'days' },
  { key: 'hours', unit: 'h', label: 'hours' },
  { key: 'minutes', unit: 'min', label: 'minutes' },
] as const;

/** Message body with clickable placeholder chips inserted at the cursor. */
function StepBodyField({
  form,
  index,
  label,
  description,
  placeholder,
}: {
  form: SequenceForm;
  index: number;
  label: string;
  description: string;
  placeholder: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const name = `steps.${index}.body` as const;
  const id = `field-${name}`;

  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => {
        const insert = (token: string) => {
          const element = textareaRef.current;
          const start = element?.selectionStart ?? field.value.length;
          const end = element?.selectionEnd ?? field.value.length;
          const next = field.value.slice(0, start) + token + field.value.slice(end);
          field.onChange(next);
          requestAnimationFrame(() => {
            element?.focus();
            element?.setSelectionRange(start + token.length, start + token.length);
          });
        };
        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <Textarea
              {...field}
              ref={(element) => {
                field.ref(element);
                textareaRef.current = element;
              }}
              id={id}
              rows={4}
              placeholder={placeholder}
              aria-invalid={fieldState.invalid}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Insert:</span>
              {NURTURE_PLACEHOLDERS.map((token) => (
                <Button
                  key={token}
                  type="button"
                  variant="outline"
                  size="xs"
                  className="font-mono"
                  onClick={() => {
                    insert(token);
                  }}
                >
                  {token}
                </Button>
              ))}
            </div>
            <FieldDescription>{description}</FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}

function StepDelay({
  form,
  index,
  isFirst,
}: {
  form: SequenceForm;
  index: number;
  isFirst: boolean;
}) {
  const errors = form.formState.errors.steps?.[index];
  const error: RhfFieldError | undefined = errors?.days ?? errors?.hours ?? errors?.minutes;
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={`field-steps.${String(index)}.days`}>
        {isFirst ? 'Wait after enrollment' : 'Wait after the previous step'}
      </FieldLabel>
      <div className="flex flex-wrap gap-2">
        {DELAY_PARTS.map((part) => (
          <div key={part.key} className="relative w-24">
            <Input
              id={`field-steps.${String(index)}.${part.key}`}
              aria-label={
                part.key === 'days' ? undefined : `Step ${String(index + 1)} ${part.label}`
              }
              aria-invalid={Boolean(errors?.[part.key] ?? (part.key === 'days' && error))}
              inputMode="numeric"
              className="h-9 pr-10 tabular-nums"
              {...form.register(`steps.${index}.${part.key}`)}
            />
            <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-muted-foreground">
              {part.unit}
            </span>
          </div>
        ))}
      </div>
      {error && <FieldError errors={[error]} />}
    </Field>
  );
}

function StepItem({
  form,
  index,
  count,
  onMove,
  onRemove,
}: {
  form: SequenceForm;
  index: number;
  count: number;
  onMove: (to: number) => void;
  onRemove: () => void;
}) {
  const step = useWatch({ control: form.control, name: `steps.${index}` });
  const label = `Step ${String(index + 1)}`;
  const isEmail = step.channel === 'email';
  const ChannelIcon = isEmail ? Mail : MessageCircle;
  const delay = stepDelayMinutes(step);

  return (
    <li className="space-y-4 rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <ChannelIcon aria-hidden className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{label}</p>
          <p className="truncate text-xs text-muted-foreground">
            {isEmail ? 'Email' : 'WhatsApp'} ·{' '}
            {delay > 0
              ? `${formatDelay(delay)} after ${index === 0 ? 'enrollment' : 'step ' + String(index)}`
              : index === 0
                ? 'right after enrollment'
                : 'right after the previous step'}
          </p>
        </div>
        <div className="flex">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Move ${label.toLowerCase()} up`}
            disabled={index === 0}
            onClick={() => {
              onMove(index - 1);
            }}
          >
            <ArrowUp aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Move ${label.toLowerCase()} down`}
            disabled={index === count - 1}
            onClick={() => {
              onMove(index + 1);
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
            disabled={count === 1}
            onClick={onRemove}
          >
            <Trash2 aria-hidden />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
        <StepDelay form={form} index={index} isFirst={index === 0} />
        <FormSelect
          control={form.control}
          name={`steps.${index}.channel`}
          label="Channel"
          options={channelOptions}
        />
      </div>

      {isEmail ? (
        <>
          <FormInput
            control={form.control}
            name={`steps.${index}.subject`}
            label="Subject"
            placeholder="e.g. Ideas for your Goa trip"
          />
          <StepBodyField
            form={form}
            index={index}
            label="Email body"
            placeholder="Hi {{first_name}}, …"
            description="Plain text. Placeholders are filled in for each contact."
          />
        </>
      ) : (
        <>
          <InlineAlert tone="info">
            WhatsApp only allows free-form messages within 24 hours of the contact’s last message.
            The message below is sent inside that window; outside it, the approved template is sent
            instead. Fill in both so the step always goes out.
          </InlineAlert>
          <StepBodyField
            form={form}
            index={index}
            label="Message (inside the 24-hour window)"
            placeholder="Hi {{first_name}}, …"
            description="Placeholders are filled in for each contact."
          />
          <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
            <FormInput
              control={form.control}
              name={`steps.${index}.whatsappTemplate`}
              label="Template name (outside the window)"
              placeholder="e.g. trip_follow_up"
              description="An approved WhatsApp template."
            />
            <FormInput
              control={form.control}
              name={`steps.${index}.whatsappLanguage`}
              label="Language"
              placeholder="en"
            />
          </div>
          <FormInput
            control={form.control}
            name={`steps.${index}.whatsappTemplateParams`}
            label="Template parameters"
            placeholder="e.g. {{first_name}}, Goa"
            description="In order, separated by commas: {{1}}, {{2}}, …"
          />
        </>
      )}
    </li>
  );
}

/** Ordered, reorderable list of sequence steps (max 20). */
export function SequenceStepsField({ form }: { form: SequenceForm }) {
  const { fields, append, remove, move } = useFieldArray({ control: form.control, name: 'steps' });
  const rootError =
    form.formState.errors.steps?.root?.message ?? form.formState.errors.steps?.message;
  const full = fields.length >= NURTURE_LIMITS.maxSteps;

  return (
    <section className="space-y-3" aria-labelledby="sequence-steps-heading">
      <div className="flex items-center justify-between gap-2">
        <h3 id="sequence-steps-heading" className="font-heading text-sm font-semibold">
          Steps
        </h3>
        <Badge variant="secondary" className="tabular-nums">
          {fields.length} / {NURTURE_LIMITS.maxSteps}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        Messages are held overnight (21:00–09:00 IST) and go out the next morning.
      </p>
      {rootError && <InlineAlert>{rootError}</InlineAlert>}
      <ol className="space-y-3">
        {fields.map((field, index) => (
          <StepItem
            key={field.id}
            form={form}
            index={index}
            count={fields.length}
            onMove={(to) => {
              move(index, to);
            }}
            onRemove={() => {
              remove(index);
            }}
          />
        ))}
      </ol>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={full}
        onClick={() => {
          const last = fields.length
            ? form.getValues(`steps.${fields.length - 1}.channel`)
            : 'email';
          append(emptyStep(last));
        }}
      >
        <Plus aria-hidden />
        {full ? `Up to ${String(NURTURE_LIMITS.maxSteps)} steps` : 'Add step'}
      </Button>
    </section>
  );
}
