import { useMutation } from '@tanstack/react-query';

import { requestPasswordReset, resetPassword, signIn, signUp } from '../api/auth';

export function useSignIn() {
  return useMutation({ mutationFn: signIn });
}

export function useSignUp() {
  return useMutation({ mutationFn: signUp });
}

export function useRequestPasswordReset() {
  return useMutation({ mutationFn: requestPasswordReset });
}

export function useResetPassword() {
  return useMutation({ mutationFn: resetPassword });
}
