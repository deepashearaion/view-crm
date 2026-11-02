import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { fetchUsers } from '../api/users';
import type { User } from '../types';

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
