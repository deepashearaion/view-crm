import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchCalls, logCall, setCallContact } from '../api/calls';
import type { Call } from '../types';

export const callKeys = { all: ['calls'] as const };

export function useCalls() {
  return useQuery({ queryKey: callKeys.all, queryFn: ({ signal }) => fetchCalls(signal) });
}

export function useLogCall() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logCall,
    onSuccess: (call) => {
      queryClient.setQueryData<Call[]>(callKeys.all, (calls = []) => [call, ...calls]);
    },
  });
}

export function useSetCallContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, contactId }: { id: string; contactId: string | null }) =>
      setCallContact(id, contactId),
    onSuccess: (updated) => {
      queryClient.setQueryData<Call[]>(callKeys.all, (calls) =>
        calls?.map((call) => (call.id === updated.id ? updated : call)),
      );
    },
  });
}
