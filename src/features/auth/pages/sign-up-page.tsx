import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { FormInput } from '@/components/form/form-input';
import { PasswordInput } from '@/components/form/password-input';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { paths } from '@/routes/paths';
import { errorMessage } from '@/services';

import { AuthLayout } from '../components/auth-layout';
import { useSignUp } from '../hooks/use-auth-mutations';
import { signUpSchema } from '../schemas';
import type { SignUpValues } from '../types';

export default function SignUpPage() {
  const navigate = useNavigate();
  const signUp = useSignUp();
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', organizationName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = form.handleSubmit(({ name, organizationName, email, password }) => {
    signUp.mutate(
      {
        name,
        email,
        password,
        ...(organizationName ? { organization_name: organizationName } : {}),
      },
      {
        onSuccess: () => {
          toast.success('Account created. Please sign in.');
          void navigate(paths.signIn, { replace: true });
        },
      },
    );
  });

  return (
    <AuthLayout
      title="Create your account"
      description="Start converting more deals with Climetavere."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to={paths.signIn}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={(event) => void onSubmit(event)} noValidate className="space-y-5">
        {signUp.isError && (
          <InlineAlert>{errorMessage(signUp.error, 'Registration failed.')}</InlineAlert>
        )}
        <FieldGroup>
          <FormInput
            control={form.control}
            name="name"
            label="Full name"
            autoComplete="name"
            placeholder="Your name"
            className="h-10"
            autoFocus
          />
          <FormInput
            control={form.control}
            name="organizationName"
            label="Organization name"
            description="Optional. You become the owner of this new workspace."
            autoComplete="organization"
            placeholder="Your company"
            className="h-10"
          />
          <FormInput
            control={form.control}
            name="email"
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            className="h-10"
          />
          <FormInput
            control={form.control}
            name="password"
            label="Password"
            description="8 to 72 characters."
            autoComplete="new-password"
            render={(field) => <PasswordInput {...field} />}
          />
          <FormInput
            control={form.control}
            name="confirmPassword"
            label="Confirm password"
            autoComplete="new-password"
            render={(field) => <PasswordInput {...field} />}
          />
        </FieldGroup>
        <Button type="submit" className="h-10 w-full" disabled={signUp.isPending}>
          {signUp.isPending ? 'Creating account…' : 'Create account'}
          <ArrowRight aria-hidden data-icon="inline-end" />
        </Button>
      </form>
    </AuthLayout>
  );
}
