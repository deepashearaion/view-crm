import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { hasValidSession } from '../api/session';
import { fetchMe } from '../api/users';
import { can, canAll, scopeOf } from '../permissions';
import type { PermissionAction, PermissionModule } from '../types';

export const meKeys = { all: ['me'] as const };

/**
 * GET /api/v1/me: the signed-in user, their role and permissions. Role changes apply on the
 * user's next request, so this is refetched after any 403 (see src/app/providers.tsx).
 */
export function useMe() {
  return useQuery({
    queryKey: meKeys.all,
    queryFn: ({ signal }) => fetchMe(signal),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    enabled: hasValidSession(),
  });
}

export interface Access {
  /** False until /me has loaded; everything is denied meanwhile. */
  ready: boolean;
  /** /me failed and nothing is cached: permissions are unknown, so screens can say so. */
  failed: boolean;
  /** Allowed at any scope (`own` or `all`). */
  can: (module: PermissionModule, action: PermissionAction) => boolean;
  /** Allowed org-wide (`all`): reassign owners, manage sequences, see everyone's figures. */
  canAll: (module: PermissionModule, action: PermissionAction) => boolean;
  scope: (module: PermissionModule, action: PermissionAction) => 'none' | 'own' | 'all';
}

/**
 * What the signed-in user may do, from /api/v1/me. Use it only to show or hide screens and
 * buttons; the server enforces every rule anyway.
 */
export function useAccess(): Access {
  const { data, isError } = useMe();
  const permissions = data?.permissions;
  const failed = data === undefined && isError;
  return useMemo(
    () => ({
      ready: data !== undefined,
      failed,
      can: (module, action) => can(permissions, module, action),
      canAll: (module, action) => canAll(permissions, module, action),
      scope: (module, action) => scopeOf(permissions, module, action),
    }),
    [data, failed, permissions],
  );
}
