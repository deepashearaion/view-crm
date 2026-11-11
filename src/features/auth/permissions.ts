import type {
  ModuleSpec,
  PermissionAction,
  PermissionModule,
  PermissionScope,
  Permissions,
} from './types';

/** The scope a permission map grants; anything missing is `none`. */
export function scopeOf(
  permissions: Permissions | undefined,
  module: PermissionModule,
  action: PermissionAction,
): PermissionScope {
  return permissions?.[module]?.[action] ?? 'none';
}

/** True when the action is allowed at any scope (`own` or `all`). */
export function can(
  permissions: Permissions | undefined,
  module: PermissionModule,
  action: PermissionAction,
): boolean {
  return scopeOf(permissions, module, action) !== 'none';
}

/** True only for org-wide access (`all`), e.g. reassigning owners or managing sequences. */
export function canAll(
  permissions: Permissions | undefined,
  module: PermissionModule,
  action: PermissionAction,
): boolean {
  return scopeOf(permissions, module, action) === 'all';
}

const SCOPE_RANK: Record<PermissionScope, number> = { none: 0, own: 1, all: 2 };

/** The narrower of two scopes. */
export function minScope(a: PermissionScope, b: PermissionScope): PermissionScope {
  return SCOPE_RANK[a] <= SCOPE_RANK[b] ? a : b;
}

/**
 * Builds a full grid from the catalog (every module and action, `none` when unset) and applies
 * the API rule that `edit` and `delete` can't reach further than `view`.
 */
export function normalisePermissions(catalog: ModuleSpec[], input: Permissions): Permissions {
  const result: Permissions = {};
  for (const spec of catalog) {
    const view = input[spec.module]?.view ?? 'none';
    const grid: Partial<Record<PermissionAction, PermissionScope>> = {};
    for (const { action, scopes } of spec.actions) {
      let scope = input[spec.module]?.[action] ?? 'none';
      if (!scopes.includes(scope)) scope = 'none';
      if (action === 'edit' || action === 'delete') scope = minScope(scope, view);
      grid[action] = scope;
    }
    result[spec.module] = grid;
  }
  return result;
}
