import type { ForgotPasswordResponse, LoginResponse } from '@/features/auth';

import { mock, mockError } from '../router';

/** Unsigned JWT-shaped token so the client can read `exp` like a real one. */
function fakeToken(userId: number): string {
  const encode = (value: object) => btoa(JSON.stringify(value)).replace(/=+$/, '');
  const exp = Math.floor(Date.now() / 1000) + 8 * 60 * 60;
  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ user_id: userId, org_id: 1, role: 'admin', exp })}.mock`;
}

function bodyField(body: unknown, key: string): string {
  if (typeof body === 'object' && body !== null && key in body) {
    const value: unknown = (body as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : '';
  }
  return '';
}

mock('POST', '/api/auth/login', ({ body }): LoginResponse => {
  if (!bodyField(body, 'email') || bodyField(body, 'password').length < 6) {
    mockError(401, 'Invalid email or password');
  }
  return { token: fakeToken(7), user_id: 7, message: 'Login successful' };
});

mock('POST', '/api/auth/register', () => ({ message: 'User registered successfully' }));
mock('POST', '/api/auth/logout', () => ({ message: 'Logged out' }));

mock('POST', '/api/auth/forgot-password', (): ForgotPasswordResponse => ({
  message: 'If the account exists, a reset link has been sent.',
  reset_token: 'mock-reset-token',
}));

mock('POST', '/api/auth/reset-password', ({ body }) => {
  if (bodyField(body, 'token') !== 'mock-reset-token') mockError(400, 'Invalid or expired token');
  return { message: 'Password reset successfully' };
});
