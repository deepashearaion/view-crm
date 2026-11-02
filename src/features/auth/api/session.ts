import { http, setAuthToken } from '@/services';

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
    setAuthToken(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}
