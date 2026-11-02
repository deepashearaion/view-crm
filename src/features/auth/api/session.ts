import { getAuthToken, http, setAuthToken } from '@/services';

import { sessionUserSchema } from '../schemas';
import type { SessionUser } from '../types';

const CURRENT_USER_KEY = 'currentUser';

export function readSessionUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    const parsed = sessionUserSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: SessionUser): void {
  setAuthToken(token);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  setAuthToken(null);
  localStorage.removeItem(CURRENT_USER_KEY);
}

/** Reads `exp` (seconds) from a JWT payload; undefined for non-JWT tokens. */
function tokenExpiry(token: string): number | undefined {
  const payload = token.split('.')[1];
  if (!payload) return undefined;
  try {
    const decoded: unknown = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    if (typeof decoded === 'object' && decoded !== null && 'exp' in decoded) {
      return typeof decoded.exp === 'number' ? decoded.exp : undefined;
    }
  } catch {
    // Opaque token: the backend decides validity.
  }
  return undefined;
}

/** True when a token is stored and, if it is a JWT, not expired. */
export function hasValidSession(now: number = Date.now()): boolean {
  const token = getAuthToken();
  if (!token) return false;
  const exp = tokenExpiry(token);
  return exp === undefined || exp * 1000 > now;
}

export function displayName(user: SessionUser | null): string {
  const name = user?.name?.trim();
  if (name) return name;
  const localPart = user?.email?.split('@')[0];
  if (localPart) return localPart;
  return 'User';
}

/** Ends the session on the backend (best effort) and always clears local credentials. */
export async function logout(): Promise<void> {
  try {
    await http.post('/api/auth/logout');
  } catch (error) {
    console.warn('Backend logout failed; clearing local session anyway.', error);
  } finally {
    clearSession();
  }
}
