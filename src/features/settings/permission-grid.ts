import {
  minScope,
  type ModuleSpec,
  type PermissionAction,
  type PermissionModule,
  type PermissionScope,
  type Permissions,
} from '@/features/auth';

export const SCOPE_RANK: Record<PermissionScope, number> = { none: 0, own: 1, all: 2 };

export const SCOPE_LABELS: Record<PermissionScope, string> = {
  none: 'None',
  own: 'Own',
  all: 'All',
};

export const ACTION_LABELS: Record<PermissionAction, string> = {
  view: 'View',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
};

export type RowPreset = 'none' | 'read' | 'full';

/** Error key for one grid cell, as the API names it: `permissions.deals.edit`. */
export const cellKey = (module: PermissionModule, action: PermissionAction) =>
  `permissions.${module}.${action}`;

function scopesFor(spec: ModuleSpec, action: PermissionAction): PermissionScope[] | undefined {
  return spec.actions.find((item) => item.action === action)?.scopes;
}

/** The widest scope in `scopes` that doesn't exceed `limit` (`none` if there isn't one). */
function widestWithin(scopes: PermissionScope[], limit: PermissionScope): PermissionScope {
  let best: PermissionScope = 'none';
  for (const scope of scopes) {
    if (SCOPE_RANK[scope] <= SCOPE_RANK[limit] && SCOPE_RANK[scope] > SCOPE_RANK[best]) {
      best = scope;
    }
  }
  return best;
}

/** The narrowest scope in `scopes` that reaches at least `floor`, if any. */
function narrowestFrom(
  scopes: PermissionScope[],
  floor: PermissionScope,
): PermissionScope | undefined {
  let best: PermissionScope | undefined;
  for (const scope of scopes) {
    if (SCOPE_RANK[scope] >= SCOPE_RANK[floor] && (!best || SCOPE_RANK[scope] < SCOPE_RANK[best])) {
      best = scope;
    }
  }
  return best;
}

/**
 * Sets one cell and keeps the module consistent with the API rule that `edit` and `delete`
 * can't reach further than `view`: lowering View lowers Edit/Delete, and raising Edit/Delete
 * above View raises View to match.
 */
export function setCell(
  grid: Permissions,
  spec: ModuleSpec,
  action: PermissionAction,
  scope: PermissionScope,
): Permissions {
  const allowed = scopesFor(spec, action);
  if (!allowed) return grid;
  const row = { ...grid[spec.module] };
  const value = allowed.includes(scope) ? scope : widestWithin(allowed, scope);
  row[action] = value;
  const view = row.view ?? 'none';

  if (action === 'view') {
    for (const dependent of ['edit', 'delete'] as const) {
      const current = row[dependent];
      if (current) row[dependent] = minScope(current, view);
    }
  } else if ((action === 'edit' || action === 'delete') && SCOPE_RANK[value] > SCOPE_RANK[view]) {
    const raised = narrowestFrom(scopesFor(spec, 'view') ?? [], value);
    if (raised) row.view = raised;
    else row[action] = minScope(value, view);
  }
  return { ...grid, [spec.module]: row };
}

/** Applies a quick preset to one module's row. */
export function applyRowPreset(
  grid: Permissions,
  spec: ModuleSpec,
  preset: RowPreset,
): Permissions {
  const row: Partial<Record<PermissionAction, PermissionScope>> = {};
  for (const { action, scopes } of spec.actions) {
    const widest = widestWithin(scopes, 'all');
    row[action] =
      preset === 'full' ? widest : preset === 'read' && action === 'view' ? widest : 'none';
  }
  return { ...grid, [spec.module]: row };
}

/**
 * Sets a whole column: each module gets the widest scope it allows up to `scope` (so "Own" on a
 * module that only offers None/All gives None), with the View rule applied.
 */
export function setColumn(
  grid: Permissions,
  catalog: ModuleSpec[],
  action: PermissionAction,
  scope: PermissionScope,
): Permissions {
  let next = grid;
  for (const spec of catalog) {
    const allowed = scopesFor(spec, action);
    if (!allowed) continue;
    next = setCell(next, spec, action, widestWithin(allowed, scope));
  }
  return next;
}

/** Which preset (if any) a module's row currently matches. */
export function rowPresetOf(grid: Permissions, spec: ModuleSpec): RowPreset | undefined {
  for (const preset of ['none', 'read', 'full'] as const) {
    const expected = applyRowPreset({}, spec, preset)[spec.module] ?? {};
    if (
      spec.actions.every(
        ({ action }) => (grid[spec.module]?.[action] ?? 'none') === (expected[action] ?? 'none'),
      )
    ) {
      return preset;
    }
  }
  return undefined;
}

/** Modules in which the role can view anything. */
export function modulesWithAccess(
  catalog: ModuleSpec[] | undefined,
  permissions: Permissions,
): { module: PermissionModule; label: string; scope: PermissionScope }[] {
  const specs: { module: PermissionModule; label: string }[] =
    catalog ??
    (Object.keys(permissions) as PermissionModule[]).map((module) => ({ module, label: module }));
  return specs
    .map(({ module, label }) => ({ module, label, scope: permissions[module]?.view ?? 'none' }))
    .filter((item) => item.scope !== 'none');
}
