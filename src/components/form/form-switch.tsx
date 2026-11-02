import type { ReactNode } from 'react';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';

interface FormSwitchProps<TValues extends FieldValues> {
  control: Control<TValues>;
  name: FieldPath<TValues>;
  label: ReactNode;
  description?: ReactNode;
}

/** Boolean field rendered as a labelled switch row. */
export function FormSwitch<TValues extends FieldValues>({
  control,
  name,
  label,
  description,
}: FormSwitchProps<TValues>) {
  const id = `field-${name}`;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field orientation="horizontal" className="rounded-lg border p-3">
          <FieldContent>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            {description && <FieldDescription>{description}</FieldDescription>}
          </FieldContent>
          <Switch
            id={id}
            name={field.name}
            checked={field.value === true}
            onCheckedChange={field.onChange}
            onBlur={field.onBlur}
          />
        </Field>
      )}
    />
  );
}
