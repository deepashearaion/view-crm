import type { Role } from '@/features/auth';

/** A role in a select: `value` is the role id. */
export interface RoleOption {
  value: string;
  label: string;
  description?: string;
  locked?: boolean;
}

export type SettingsTab = 'users' | 'roles';

/** Open state of the role editor. `source` prefills a new role (Duplicate). */
export type RoleEditorState =
  { mode: 'closed' } | { mode: 'create'; source?: Role } | { mode: 'edit' | 'view'; role: Role };
