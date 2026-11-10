import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle2, MailCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { FormInput } from '@/components/form/form-input';
import { PasswordInput } from '@/components/form/password-input';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { paths } from '@/routes/paths';
import { errorMessage } from '@/services';

import { AuthLayout } from '../components/auth-layout';
import { useRequestPasswordReset, useResetPassword } from '../hooks/use-auth-mutations';
import { forgotPasswordSchema, resetPasswordSchema } from '../schemas';
import type { ForgotPasswordValues, ResetPasswordValues } from '../types';

const backToSignIn = (
  <Link
    to={paths.signIn}
    className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
  >
    <ArrowLeft aria-hidden className="size-4" />
    Back to sign in
  </Link>
);

function RequestResetForm({ onToken }: { onToken: (token: string) => void }) {
  const request = useRequestPasswordReset();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = form.handleSubmit(({ email }) => {
    request.mutate(email, {
      onSuccess: (response) => {
        setSentTo(email);
        setDevToken(response.reset_token ?? null);
      },
    });
  });

  if (sentTo) {
    return (
      <AuthLayout title="Check your email" footer={backToSignIn}>
        <div className="space-y-4 rounded-xl border bg-card p-5 text-center">
          <MailCheck aria-hidden className="mx-auto size-10 text-primary" />
          <p className="text-sm text-muted-foreground">
            If an account exists for <strong className="text-foreground">{sentTo}</strong>, we’ve
            sent a link to reset your password.
          </p>
          {devToken && (
            <InlineAlert tone="info" className="text-left">
              Development backend returned a reset token directly.{' '}
              <button
                type="button"
                className="font-semibold underline underline-offset-4"
                onClick={() => {
                  onToken(devToken);
                }}
              >
                Reset password now
              </button>
            </InlineAlert>
          )}
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      description="Enter your email and we’ll send you a reset link."
      footer={backToSignIn}
    >
      <form onSubmit={(event) => void onSubmit(event)} noValidate className="space-y-5">
        {request.isError && (
          <InlineAlert>{errorMessage(request.error, 'Password reset request failed.')}</InlineAlert>
        )}
        <FormInput
          control={form.control}
          name="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
          className="h-10"
          autoFocus
        />
        <Button type="submit" className="h-10 w-full" disabled={request.isPending}>
          {request.isPending ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
    </AuthLayout>
  );
}

function ResetPasswordForm({ token }: { token: string }) {
  const navigate = useNavigate();
  const reset = useResetPassword();
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = form.handleSubmit(({ password }) => {
    reset.mutate(
      { token, new_password: password },
      {
        onSuccess: () => {
          toast.success('Password reset. Sign in with your new password.', {
            icon: <CheckCircle2 aria-hidden className="size-4" />,
          });
          void navigate(paths.signIn, { replace: true });
        },
      },
    );
  });

  return (
    <AuthLayout
      title="Set a new password"
      description="Choose a password you haven’t used before."
      footer={backToSignIn}
    >
      <form onSubmit={(event) => void onSubmit(event)} noValidate className="space-y-5">
        {reset.isError && (
          <InlineAlert>
            {errorMessage(reset.error, 'Password reset failed. The link may have expired.')}
          </InlineAlert>
        )}
        <FieldGroup>
          <FormInput
            control={form.control}
            name="password"
            label="New password"
            description="8 to 72 characters."
            autoComplete="new-password"
            autoFocus
            render={(field) => <PasswordInput {...field} />}
          />
          <FormInput
            control={form.control}
            name="confirmPassword"
            label="Confirm new password"
            autoComplete="new-password"
            render={(field) => <PasswordInput {...field} />}
          />
        </FieldGroup>
        <Button type="submit" className="h-10 w-full" disabled={reset.isPending}>
          {reset.isPending ? 'Saving…' : 'Reset password'}
        </Button>
      </form>
    </AuthLayout>
  );
}

/** Serves both /forgot-password and /reset-password?token=… */
export default function ForgotPasswordPage() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState<string | null>(() => searchParams.get('token'));
  return token ? <ResetPasswordForm token={token} /> : <RequestResetForm onToken={setToken} />;
}
