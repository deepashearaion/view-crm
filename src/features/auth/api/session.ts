import { getAuthToken, http, onSessionExpired, setAuthToken } from '@/services';

import { sessionUserSchema, tokenClaimsSchema } from '../schemas';
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

/** Decodes the JWT payload (`user_id`, `org_id`, `exp`); empty for opaque tokens. The role is not in it: use /api/v1/me. */
export function readTokenClaims(token: string | null = getAuthToken()) {
  const payload = token?.split('.')[1];
  if (!payload) return {};
  try {
    const decoded: unknown = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    const parsed = tokenClaimsSchema.safeParse(decoded);
    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
}

/**
 * True when an access token is stored. An expired token still counts: the first API call gets
 * a 401, refreshes with the httpOnly cookie and retries; if that fails the session ends.
 */
export function hasValidSession(): boolean {
  return getAuthToken() !== null;
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

/** When a token refresh fails, drop the session and go to sign in (returning here after). */
export function installSessionExpiryHandler(signInPath: string): void {
  onSessionExpired(() => {
    clearSession();
    if (window.location.pathname.startsWith(signInPath)) return;
    const here = `${window.location.pathname}${window.location.search}`;
    window.location.assign(`${signInPath}?redirect=${encodeURIComponent(here)}`);
  });
}
