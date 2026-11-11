import type { z } from 'zod';

import type {
  forgotPasswordSchema,
  loginResponseSchema,
  resetPasswordSchema,
  sessionUserSchema,
  signInSchema,
  signUpSchema,
} from './schemas';

export type SessionUser = z.infer<typeof sessionUserSchema>;

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export type LoginResponse = z.infer<typeof loginResponseSchema>;

/** POST /api/auth/register. Creates a new org with this user as its owner. */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  organization_name?: string;
}

/** POST /api/auth/forgot-password response. `reset_token` is only returned by dev backends. */
export interface ForgotPasswordResponse {
  message?: string;
  reset_token?: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

// ── Permissions ──────────────────────────────────────────────────────────────

export const PERMISSION_MODULES = [
  'contacts',
  'deals',
  'tasks',
  'nurture',
  'invoices',
  'reports',
  'settings',
  'users',
  'roles',
] as const;
export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export const PERMISSION_ACTIONS = ['view', 'create', 'edit', 'delete'] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

/** `own` = records the user owns (or tasks assigned to them); `all` = every record in the org. */
export const PERMISSION_SCOPES = ['none', 'own', 'all'] as const;
export type PermissionScope = (typeof PERMISSION_SCOPES)[number];

export type Permissions = Partial<
  Record<PermissionModule, Partial<Record<PermissionAction, PermissionScope>>>
>;

/** GET /api/v1/permissions item: what a role editor can grant for one module. */
export interface ModuleSpec {
  module: PermissionModule;
  label: string;
  actions: { action: PermissionAction; scopes: PermissionScope[]; description: string }[];
}

// ── Users ────────────────────────────────────────────────────────────────────

/** /api/v1/users item. */
export interface UserDto {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role_name: string;
  created_at: string;
}

/** User as used in the UI (string ids, so they can key selects and lookups). */
export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  createdAt: string;
}

/** POST /api/v1/users. The user can sign in with this password straight away. */
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role_id: number;
}

// ── Roles ────────────────────────────────────────────────────────────────────

export interface RoleDto {
  id: number;
  name: string;
  description: string;
  /** The Owner role: can't be edited or deleted. */
  locked: boolean;
  permissions: Permissions;
  user_count: number;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  locked: boolean;
  permissions: Permissions;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

/** POST /api/v1/roles. Send the full grid: modules or actions left out become `none`. */
export interface RoleWriteRequest {
  name: string;
  description?: string;
  permissions: Permissions;
}

// ── Me ───────────────────────────────────────────────────────────────────────

export interface MeDto {
  user: UserDto;
  role: { id: number; name: string; locked: boolean };
  permissions: Permissions;
}

export interface Me {
  user: User;
  role: { id: string; name: string; locked: boolean };
  permissions: Permissions;
}
