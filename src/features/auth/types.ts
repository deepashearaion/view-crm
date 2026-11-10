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

export const USER_ROLES = ['owner', 'admin', 'manager', 'rep', 'viewer'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  rep: 'Sales rep',
  viewer: 'Viewer',
};

/** GET /api/v1/users item. */
export interface UserDto {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

/** User as used in the UI (string id, so it can key selects and lookups). */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  avatarUrl?: string;
}

export interface InviteUserRequest {
  name: string;
  email: string;
  role: UserRole;
}
