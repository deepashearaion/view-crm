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

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
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

export const USER_ROLES = ['admin', 'manager', 'rep'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}
