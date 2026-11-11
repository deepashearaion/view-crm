import { z } from 'zod';

const name = (label: string, max = 120) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} can be at most ${String(max)} characters.`);

const email = z
  .string()
  .trim()
  .min(1, 'Email address is required.')
  .pipe(z.email('Please enter a valid email address.'));

/** The API accepts 8 to 72 characters. */
const password = z
  .string()
  .min(1, 'Password is required.')
  .min(8, 'Password must be at least 8 characters long.')
  .max(72, 'Password must be at most 72 characters long.');

export const createUserSchema = z.object({
  name: name('Name'),
  email,
  password,
  roleId: z.string().min(1, 'Choose a role.'),
});
export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const renameUserSchema = z.object({ name: name('Name') });
export type RenameUserFormValues = z.infer<typeof renameUserSchema>;

export const resetPasswordSchema = z.object({ password });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const roleDetailsSchema = z.object({
  name: name('Role name', 60),
  description: z.string().trim().max(500, 'Description can be at most 500 characters.'),
});
export type RoleDetailsFormValues = z.infer<typeof roleDetailsSchema>;
