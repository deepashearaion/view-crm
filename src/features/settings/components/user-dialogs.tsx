import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { FormInput } from '@/components/form/form-input';
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
import { useRenameUser, useSetUserPassword, type User } from '@/features/auth';
import { applyProblem, hasProblemCode } from '@/services';

import { OWNER_RULES, settingsErrorMessage } from '../errors';
import {
  renameUserSchema,
  resetPasswordSchema,
  type RenameUserFormValues,
  type ResetPasswordFormValues,
} from '../schemas';

import { PasswordField } from './password-field';

interface UserDialogProps {
  /** The user to act on; the dialog is open while set. */
  user: User | null;
  onClose: () => void;
}

export function RenameUserDialog({ user, onClose }: UserDialogProps) {
  const rename = useRenameUser();
  const form = useForm<RenameUserFormValues>({
    resolver: zodResolver(renameUserSchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (!user) return;
    form.reset({ name: user.name });
    rename.reset();
    // Reset only when a user is picked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const onSubmit = form.handleSubmit((values) => {
    if (!user) return;
    rename.mutate(
      { id: user.id, name: values.name },
      {
        onSuccess: (updated) => {
          toast.success(`Renamed to ${updated.name}.`);
          onClose();
        },
        onError: (error) => {
          applyProblem(error, (field, fieldError) => {
            form.setError(field as keyof RenameUserFormValues, fieldError);
          });
        },
      },
    );
  });

  return (
    <Dialog
      open={user !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename {user?.name}</DialogTitle>
          <DialogDescription>Their email address and sign-in stay the same.</DialogDescription>
        </DialogHeader>
        <form
          id="rename-user-form"
          onSubmit={(event) => void onSubmit(event)}
          noValidate
          className="grid gap-4"
        >
          {rename.isError && !hasProblemCode(rename.error, 'validation_failed') && (
            <InlineAlert>
              {settingsErrorMessage(rename.error, 'Couldn’t rename.', OWNER_RULES)}
            </InlineAlert>
          )}
          <FormInput control={form.control} name="name" label="Name" autoComplete="off" autoFocus />
        </form>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="rename-user-form" disabled={rename.isPending}>
            {rename.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ResetPasswordDialog({ user, onClose }: UserDialogProps) {
  const setPassword = useSetUserPassword();
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '' },
  });

  useEffect(() => {
    if (!user) return;
    form.reset({ password: '' });
    setPassword.reset();
    // Reset only when a user is picked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const onSubmit = form.handleSubmit((values) => {
    if (!user) return;
    setPassword.mutate(
      { id: user.id, password: values.password },
      {
        onSuccess: () => {
          toast.success(`Password changed for ${user.name}. They’ve been signed out everywhere.`);
          onClose();
        },
        onError: (error) => {
          applyProblem(error, (field, fieldError) => {
            form.setError(field as keyof ResetPasswordFormValues, fieldError);
          });
        },
      },
    );
  });

  return (
    <Dialog
      open={user !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset password for {user?.name}</DialogTitle>
          <DialogDescription>
            Set a new password and share it with them. No email is sent.
          </DialogDescription>
        </DialogHeader>
        <form
          id="reset-password-form"
          onSubmit={(event) => void onSubmit(event)}
          noValidate
          className="grid gap-4"
        >
          <InlineAlert tone="info">
            Signs them out everywhere. They’ll need the new password to sign in again.
          </InlineAlert>
          {setPassword.isError && !hasProblemCode(setPassword.error, 'validation_failed') && (
            <InlineAlert>
              {settingsErrorMessage(
                setPassword.error,
                'Couldn’t change the password.',
                OWNER_RULES,
              )}
            </InlineAlert>
          )}
          <PasswordField
            control={form.control}
            name="password"
            label="New password"
            onGenerate={(password) => {
              form.setValue('password', password, { shouldValidate: true, shouldDirty: true });
            }}
          />
        </form>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="reset-password-form" disabled={setPassword.isPending}>
            <KeyRound aria-hidden />
            {setPassword.isPending ? 'Saving…' : 'Set password'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
