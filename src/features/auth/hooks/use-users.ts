import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  assignUserRole,
  createRole,
  createUser,
  deleteRole,
  fetchPermissionCatalog,
  fetchRoles,
  fetchUsers,
  renameUser,
  setUserPassword,
  updateRole,
} from '../api/users';
import type { RoleWriteRequest, User } from '../types';

import { meKeys, useAccess, useMe } from './use-me';

export const userKeys = { all: ['users'] as const };
export const roleKeys = {
  all: ['roles'] as const,
  catalog: ['roles', 'catalog'] as const,
};

/**
 * Everyone in the org. Only fetched with users.view; without it the list stays empty and owner
 * names don't resolve (the API would answer 403).
 */
export function useUsers(options: { enabled?: boolean } = {}) {
  const access = useAccess();
  return useQuery({
    queryKey: userKeys.all,
    queryFn: ({ signal }) => fetchUsers(signal),
    staleTime: 5 * 60_000,
    enabled: access.ready && access.can('users', 'view') && options.enabled !== false,
  });
}

/**
 * Map of user id → user for resolving owner ids in tables. Always includes the signed-in user
 * (from /me), so their own records show their name even without users.view.
 */
export function useUserLookup(): Map<string, User> {
  const { data } = useUsers();
  const { data: me } = useMe();
  return useMemo(() => {
    const lookup = new Map((data ?? []).map((user) => [user.id, user]));
    if (me && !lookup.has(me.user.id)) lookup.set(me.user.id, me.user);
    return lookup;
  }, [data, me]);
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all });
      // The new user's role gains one in its user count.
      void queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}

export function useRenameUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameUser(id, name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all });
      void queryClient.invalidateQueries({ queryKey: meKeys.all });
    },
  });
}

export function useAssignUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roleId }: { id: string; roleId: string }) => assignUserRole(id, roleId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all });
      // Role user counts change.
      void queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}

export function useSetUserPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      setUserPassword(id, password),
  });
}

export function useRoles(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: roleKeys.all,
    queryFn: ({ signal }) => fetchRoles(signal),
    enabled: options.enabled,
  });
}

/** Every module, action and scope a role can grant (static per backend version). */
export function usePermissionCatalog(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: roleKeys.catalog,
    queryFn: ({ signal }) => fetchPermissionCatalog(signal),
    staleTime: Infinity,
    enabled: options.enabled,
  });
}

function useRoleMutationSettled() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: roleKeys.all, exact: true });
    void queryClient.invalidateQueries({ queryKey: userKeys.all });
    // The caller's own role may be the one that changed.
    void queryClient.invalidateQueries({ queryKey: meKeys.all });
  };
}

export function useCreateRole() {
  const onSuccess = useRoleMutationSettled();
  return useMutation({ mutationFn: createRole, onSuccess });
}

export function useUpdateRole() {
  const onSuccess = useRoleMutationSettled();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<RoleWriteRequest> }) =>
      updateRole(id, body),
    onSuccess,
  });
}

export function useDeleteRole() {
  const onSuccess = useRoleMutationSettled();
  return useMutation({ mutationFn: deleteRole, onSuccess });
}
