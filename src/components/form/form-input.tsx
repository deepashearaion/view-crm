import type { ComponentProps, ReactNode } from 'react';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface FormInputProps<TValues extends FieldValues> extends Omit<
  ComponentProps<typeof Input>,
  'name' | 'defaultValue' | 'value' | 'onChange'
> {
  control: Control<TValues>;
  name: FieldPath<TValues>;
  label: ReactNode;
  description?: ReactNode;
  /** Classes for the field wrapper (layout, e.g. `sm:col-span-2`). `className` styles the input. */
  fieldClassName?: string;
  /** Renders a custom control instead of <Input>; receives the field props. */
  render?: (field: ComponentProps<'input'> & { 'aria-invalid': boolean }) => ReactNode;
}

/** Text input bound to react-hook-form, with label, description and validation message. */
export function FormInput<TValues extends FieldValues>({
  control,
  name,
  label,
  description,
  render,
  id,
  fieldClassName,
  ...inputProps
}: FormInputProps<TValues>) {
  const inputId = id ?? `field-${name}`;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const props = {
          ...inputProps,
          ...field,
          value: (field.value as string | number | undefined) ?? '',
          id: inputId,
          'aria-invalid': fieldState.invalid,
          'aria-describedby': description ? `${inputId}-description` : undefined,
        };
        return (
          <Field data-invalid={fieldState.invalid} className={fieldClassName}>
            <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
            {render ? render(props) : <Input {...props} />}
            {description && (
              <FieldDescription id={`${inputId}-description`}>{description}</FieldDescription>
            )}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}
