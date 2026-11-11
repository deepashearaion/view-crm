import { errorMessage, hasProblemCode } from '@/services';

/** Messages for the user/role problem codes in the API contract. */
const MESSAGES: Record<string, string> = {
  own_role: 'You can’t change your own role.',
  last_owner: 'The organisation needs at least one owner. Make someone else Owner first.',
  exceeds_own_access: 'This role grants more than you have.',
  email_taken: 'Someone with this email already has an account.',
  name_taken: 'Another role already has this name.',
  role_locked: 'The Owner role can’t be changed or deleted.',
  role_in_use: 'People still have this role. Move them to another role first.',
};

/**
 * On user writes, 403 forbidden means the Owner rule (a plain missing permission refetches /me
 * and hides the button anyway).
 */
export const OWNER_RULES = {
  forbidden: 'Only owners can give or take the Owner role, or change an owner.',
};

/** A friendly message for a known problem code, else the server's detail or `fallback`. */
export function settingsErrorMessage(
  error: unknown,
  fallback: string,
  extra: Record<string, string> = {},
): string {
  for (const [code, message] of Object.entries({ ...MESSAGES, ...extra })) {
    if (hasProblemCode(error, code)) return message;
  }
  return errorMessage(error, fallback);
}
