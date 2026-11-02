import { useSyncExternalStore } from 'react';

import { readSessionUser } from '../api/session';
import type { SessionUser } from '../types';

function subscribe(onChange: () => void): () => void {
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener('storage', onChange);
  };
}

let cachedRaw: string | null | undefined;
let cachedUser: SessionUser | null = null;

function getSnapshot(): SessionUser | null {
  const raw = localStorage.getItem('currentUser');
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedUser = readSessionUser();
  }
  return cachedUser;
}

/** Signed-in user from localStorage, kept in sync across tabs. */
export function useSessionUser(): SessionUser | null {
  return useSyncExternalStore(subscribe, getSnapshot);
}
