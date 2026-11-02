import type { ReactNode } from 'react';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface SelectOption {
  value: string;
  label: ReactNode;
}

/** Value used for "no selection" since Radix Select cannot use an empty string. */
const NONE = '__none__';

interface FormSelectProps<TValues extends FieldValues> {
  control: Control<TValues>;
  name: FieldPath<TValues>;
  label: ReactNode;
  options: readonly SelectOption[];
  placeholder?: string;
  description?: ReactNode;
  /** Adds a "None" entry that maps to an empty string. */
  allowEmpty?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FormSelect<TValues extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder = 'Select…',
  description,
  allowEmpty = false,
  disabled,
  className,
}: FormSelectProps<TValues>) {
  const id = `field-${name}`;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value: string = typeof field.value === 'string' ? field.value : '';
        return (
          <Field data-invalid={fieldState.invalid} className={className}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <Select
              name={field.name}
              disabled={disabled}
              value={value === '' ? (allowEmpty ? NONE : '') : value}
              onValueChange={(next) => {
                field.onChange(next === NONE ? '' : next);
              }}
            >
              <SelectTrigger
                id={id}
                className="h-9 w-full"
                aria-invalid={fieldState.invalid}
                onBlur={field.onBlur}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {allowEmpty && (
                  <SelectItem value={NONE} className="text-muted-foreground">
                    None
                  </SelectItem>
                )}
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {description && <FieldDescription>{description}</FieldDescription>}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}
