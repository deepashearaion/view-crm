import { z } from 'zod';

import { USER_ROLES } from './types';

/** User persisted in localStorage under `currentUser` after sign-in. */
export const sessionUserSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  email: z.string().optional(),
  name: z.string().optional(),
  /** From the JWT; used only to hide controls (the server enforces every rule). */
  role: z.enum(USER_ROLES).optional(),
  orgId: z.union([z.number(), z.string()]).optional(),
});

const email = z
  .string()
  .trim()
  .min(1, 'Email address is required.')
  .pipe(z.email('Please enter a valid email address.'));

/** The API accepts 8 to 72 characters. */
const newPassword = z
  .string()
  .min(1, 'Password is required.')
  .min(8, 'Password must be at least 8 characters long.')
  .max(72, 'Password must be at most 72 characters long.');

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required.'),
});

export const signUpSchema = z
  .object({
    name: z.string().trim().min(1, 'Full name is required.'),
    organizationName: z.string().trim(),
    email,
    password: newPassword,
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    password: newPassword,
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

/** POST /api/auth/login response. */
export const loginResponseSchema = z.object({
  token: z.string().min(1),
  user_id: z.union([z.number(), z.string()]).optional(),
  expires_in: z.number().optional(),
  name: z.string().optional(),
  message: z.string().optional(),
});

/** Claims the API puts in the access token. */
export const tokenClaimsSchema = z.object({
  user_id: z.union([z.number(), z.string()]).optional(),
  org_id: z.union([z.number(), z.string()]).optional(),
  role: z.enum(USER_ROLES).optional(),
  exp: z.number().optional(),
});
