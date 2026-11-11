import { http } from '@/services';

import { loginResponseSchema } from '../schemas';
import type {
  ForgotPasswordResponse,
  RegisterRequest,
  ResetPasswordRequest,
  SessionUser,
  SignInValues,
} from '../types';

import { readTokenClaims, saveSession } from './session';
import { fetchMe } from './users';

/**
 * POST /api/auth/login → token (+ refresh cookie), then GET /api/v1/me for the user's name.
 * The role and permissions are not stored: they come live from /me (useMe / useAccess).
 */
export async function signIn(values: SignInValues): Promise<SessionUser> {
  const parsed = loginResponseSchema.safeParse(await http.post<unknown>('/api/auth/login', values));
  if (!parsed.success) throw new Error('Unexpected response from the server. Please try again.');
  const response = parsed.data;
  const claims = readTokenClaims(response.token);
  let user: SessionUser = {
    id: response.user_id ?? claims.user_id,
    email: values.email,
    name: response.name ?? values.email.split('@')[0],
    orgId: claims.org_id,
  };
  saveSession(response.token, user);
  try {
    const me = await fetchMe();
    user = { ...user, id: me.user.id, name: me.user.name, email: me.user.email };
    saveSession(response.token, user);
  } catch {
    // The profile is a nicety here; the app loads /me again on its own.
  }
  return user;
}

export async function signUp(request: RegisterRequest): Promise<void> {
  await http.post('/api/auth/register', request);
}

export function requestPasswordReset(email: string): Promise<ForgotPasswordResponse> {
  return http.post<ForgotPasswordResponse>('/api/auth/forgot-password', { email });
}

export async function resetPassword(request: ResetPasswordRequest): Promise<void> {
  await http.post('/api/auth/reset-password', request);
}
