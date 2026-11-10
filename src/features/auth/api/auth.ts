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

/** POST /api/auth/login → token (+ refresh cookie). Role and org come from the JWT. */
export async function signIn(values: SignInValues): Promise<SessionUser> {
  const parsed = loginResponseSchema.safeParse(await http.post<unknown>('/api/auth/login', values));
  if (!parsed.success) throw new Error('Unexpected response from the server. Please try again.');
  const response = parsed.data;
  const claims = readTokenClaims(response.token);
  const user: SessionUser = {
    id: response.user_id ?? claims.user_id,
    email: values.email,
    name: response.name ?? values.email.split('@')[0],
    role: claims.role,
    orgId: claims.org_id,
  };
  saveSession(response.token, user);
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
