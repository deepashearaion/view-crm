import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { FormInput } from '@/components/form/form-input';
import { FormSelect } from '@/components/form/form-select';
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
import { useCreateUser } from '@/features/auth';
import { applyProblem, hasProblemCode } from '@/services';

import { OWNER_RULES, settingsErrorMessage } from '../errors';
import { createUserSchema, type CreateUserFormValues } from '../schemas';
import type { RoleOption } from '../types';

import { PasswordField } from './password-field';

const FORM_ID = 'create-user-form';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: RoleOption[];
}

export function CreateUserDialog({ open, onOpenChange, roles }: CreateUserDialogProps) {
  const createUser = useCreateUser();
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: '', email: '', password: '', roleId: '' },
  });
  const roleId = useWatch({ control: form.control, name: 'roleId' });
  const selectedRole = roles.find((role) => role.value === roleId);

  useEffect(() => {
    if (!open) return;
    // Default to Rep when the org still has it, else the first unlocked role.
    const fallback =
      roles.find((role) => role.label.toLowerCase() === 'rep') ??
      roles.find((role) => !role.locked);
    form.reset({ name: '', email: '', password: '', roleId: fallback?.value ?? '' });
    createUser.reset();
    // Reset only when the dialog opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = form.handleSubmit((values) => {
    createUser.mutate(
      {
        name: values.name,
        email: values.email,
        password: values.password,
        role_id: Number(values.roleId),
      },
      {
        onSuccess: (user) => {
          toast.success(`${user.name} can now sign in as ${user.roleName}.`);
          onOpenChange(false);
        },
        onError: (error) => {
          applyProblem(
            error,
            (field, fieldError) => {
              form.setError(field as keyof CreateUserFormValues, fieldError);
            },
            { role_id: 'roleId' },
          );
          if (hasProblemCode(error, 'email_taken')) {
            form.setError('email', {
              type: 'server',
              message: 'Someone with this email already has an account.',
            });
          }
          if (hasProblemCode(error, 'exceeds_own_access')) {
            form.setError('roleId', {
              type: 'server',
              message: 'This role grants more than you have.',
            });
          }
        },
      },
    );
  });

  const error = createUser.error;
  const showAlert =
    createUser.isError &&
    !hasProblemCode(error, 'email_taken') &&
    !hasProblemCode(error, 'validation_failed');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a user</DialogTitle>
          <DialogDescription>
            They can sign in with this password straight away; no email is sent. Share it with them
            yourself.
          </DialogDescription>
        </DialogHeader>
        <form
          id={FORM_ID}
          onSubmit={(event) => void onSubmit(event)}
          noValidate
          className="grid gap-4"
        >
          {showAlert && (
            <InlineAlert>
              {settingsErrorMessage(error, 'Couldn’t create the user.', OWNER_RULES)}
            </InlineAlert>
          )}
          <FormInput control={form.control} name="name" label="Name" autoComplete="off" autoFocus />
          <FormInput
            control={form.control}
            name="email"
            label="Email"
            type="email"
            autoComplete="off"
          />
          <PasswordField
            control={form.control}
            name="password"
            label="Password"
            onGenerate={(password) => {
              form.setValue('password', password, { shouldValidate: true, shouldDirty: true });
            }}
          />
          <FormSelect
            control={form.control}
            name="roleId"
            label="Role"
            placeholder="Choose a role…"
            options={roles}
            description={
              selectedRole?.locked
                ? 'Only owners can make someone an Owner.'
                : selectedRole?.description || undefined
            }
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
          <Button type="submit" form={FORM_ID} disabled={createUser.isPending}>
            <UserPlus aria-hidden />
            {createUser.isPending ? 'Creating…' : 'Create user'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
