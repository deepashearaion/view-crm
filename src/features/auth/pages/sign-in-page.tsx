import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { FormInput } from '@/components/form/form-input';
import { PasswordInput } from '@/components/form/password-input';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { paths } from '@/routes/paths';
import { errorMessage } from '@/services';

import { AuthLayout } from '../components/auth-layout';
import { useSignIn } from '../hooks/use-auth-mutations';
import { signInSchema } from '../schemas';
import type { SignInValues } from '../types';

/** Only allow in-app redirects to avoid open-redirects via ?redirect=. */
function safeRedirect(value: string | null): string {
  return value?.startsWith('/dashboard') ? value : paths.dashboard;
}

export default function SignInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const signIn = useSignIn();
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = form.handleSubmit((values) => {
    signIn.mutate(values, {
      onSuccess: () => {
        void navigate(safeRedirect(searchParams.get('redirect')), { replace: true });
      },
    });
  });

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue to Climetavere CRM."
      footer={
        <>
          Don’t have an account?{' '}
          <Link
            to={paths.signUp}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={(event) => void onSubmit(event)} noValidate className="space-y-5">
        {signIn.isError && (
          <InlineAlert>
            {errorMessage(signIn.error, 'Login failed. Please check your credentials.')}
          </InlineAlert>
        )}
        <FieldGroup>
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
          <div className="space-y-2">
            <FormInput
              control={form.control}
              name="password"
              label="Password"
              autoComplete="current-password"
              placeholder="Enter your password"
              render={(field) => <PasswordInput {...field} />}
            />
            <div className="flex justify-end">
              <Link
                to={paths.forgotPassword}
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </FieldGroup>
        <Button type="submit" className="h-10 w-full" disabled={signIn.isPending}>
          {signIn.isPending ? 'Signing in…' : 'Sign in'}
          <ArrowRight aria-hidden data-icon="inline-end" />
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>
    </AuthLayout>
  );
}
