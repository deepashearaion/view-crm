import { useMutation, useQueryClient } from '@tanstack/react-query';

import { requestPasswordReset, resetPassword, signIn, signUp } from '../api/auth';

export function useSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signIn,
    // Drop anything cached for a previous user (permissions, records).
    onSuccess: () => {
      queryClient.clear();
    },
  });
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
