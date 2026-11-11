import { WandSparkles } from 'lucide-react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { toast } from 'sonner';

import { FormInput } from '@/components/form/form-input';
import { PasswordInput } from '@/components/form/password-input';
import { Button } from '@/components/ui/button';

import { generatePassword } from '../password';

interface PasswordFieldProps<TValues extends FieldValues> {
  control: Control<TValues>;
  name: FieldPath<TValues>;
  label: string;
  description?: string;
  /** Receives a freshly generated password to put in the field. */
  onGenerate: (password: string) => void;
}

/** Password input with show/hide and a "Generate" button (8–72 characters). */
export function PasswordField<TValues extends FieldValues>({
  control,
  name,
  label,
  description = '8 to 72 characters.',
  onGenerate,
}: PasswordFieldProps<TValues>) {
  return (
    <FormInput
      control={control}
      name={name}
      label={label}
      description={description}
      autoComplete="new-password"
      render={(field) => (
        <div className="flex items-center gap-2">
          <PasswordInput {...field} className="h-9 flex-1" />
          <Button
            type="button"
            variant="outline"
            className="h-9"
            onClick={() => {
              const password = generatePassword();
              onGenerate(password);
              navigator.clipboard.writeText(password).then(
                () => toast.success('Generated a strong password and copied it.'),
                () => toast.success('Generated a strong password. Use the eye icon to see it.'),
              );
            }}
          >
            <WandSparkles aria-hidden />
            Generate
          </Button>
        </div>
      )}
    />
  );
}
