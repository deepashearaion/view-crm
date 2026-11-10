import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { fetchUsers, inviteUser, updateUserRole } from '../api/users';
import type { User, UserRole } from '../types';

export const userKeys = { all: ['users'] as const };

export function useUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: ({ signal }) => fetchUsers(signal),
    staleTime: 5 * 60_000,
  });
}

/** Map of user id → user for resolving owner ids in tables. */
export function useUserLookup(): Map<string, User> {
  const { data } = useUsers();
  return useMemo(() => new Map((data ?? []).map((user) => [user.id, user])), [data]);
}

export function useInviteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inviteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => updateUserRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}
