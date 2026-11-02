import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface FormDateTimePickerProps<TValues extends FieldValues> {
  control: Control<TValues>;
  name: FieldPath<TValues>;
  label: ReactNode;
  description?: ReactNode;
  /** Show a time input next to the date. */
  withTime?: boolean;
}

function withTimeOf(date: Date, time: string): Date {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

/** Date (and optional time) picker bound to a `Date` form value. */
export function FormDateTimePicker<TValues extends FieldValues>({
  control,
  name,
  label,
  description,
  withTime = true,
}: FormDateTimePickerProps<TValues>) {
  const [open, setOpen] = useState(false);
  const id = `field-${name}`;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const raw: unknown = field.value;
        const value = raw instanceof Date ? raw : undefined;
        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <div className="flex gap-2">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id={id}
                    variant="outline"
                    aria-invalid={fieldState.invalid}
                    className={cn(
                      'h-9 flex-1 justify-start font-normal',
                      !value && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon aria-hidden />
                    {value ? format(value, 'd MMM yyyy') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={value}
                    defaultMonth={value}
                    onSelect={(day) => {
                      if (!day) return;
                      field.onChange(
                        value ? withTimeOf(day, format(value, 'HH:mm')) : withTimeOf(day, '10:00'),
                      );
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
              {withTime && (
                <Input
                  type="time"
                  aria-label="Time"
                  className="h-9 w-32"
                  disabled={!value}
                  value={value ? format(value, 'HH:mm') : ''}
                  onChange={(event) => {
                    if (value && event.target.value)
                      field.onChange(withTimeOf(value, event.target.value));
                  }}
                  onBlur={field.onBlur}
                />
              )}
            </div>
            {description && <FieldDescription>{description}</FieldDescription>}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}
