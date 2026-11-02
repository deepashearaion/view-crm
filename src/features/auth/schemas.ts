import { z } from 'zod';

/** User persisted in localStorage under `currentUser` after sign-in. */
export const sessionUserSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  email: z.string().optional(),
  name: z.string().optional(),
});

const email = z
  .string()
  .trim()
  .min(1, 'Email address is required.')
  .pipe(z.email('Please enter a valid email address.'));

const newPassword = z
  .string()
  .min(1, 'Password is required.')
  .min(6, 'Password must be at least 6 characters long.');

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required.'),
});

export const signUpSchema = z
  .object({
    name: z.string().trim().min(1, 'Full name is required.'),
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
  name: z.string().optional(),
  message: z.string().optional(),
});
