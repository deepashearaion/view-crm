import type { ComponentProps, ReactNode } from 'react';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';

interface FormTextareaProps<TValues extends FieldValues> extends Omit<
  ComponentProps<typeof Textarea>,
  'name' | 'value' | 'onChange' | 'defaultValue'
> {
  control: Control<TValues>;
  name: FieldPath<TValues>;
  label: ReactNode;
  description?: ReactNode;
}

export function FormTextarea<TValues extends FieldValues>({
  control,
  name,
  label,
  description,
  ...props
}: FormTextareaProps<TValues>) {
  const id = `field-${name}`;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Textarea
            {...props}
            {...field}
            value={typeof field.value === 'string' ? field.value : ''}
            id={id}
            aria-invalid={fieldState.invalid}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
