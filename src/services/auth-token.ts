const TOKEN_KEY = 'token';

export function getAuthToken(): string | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    return token && token !== 'undefined' && token !== 'null' ? token : null;
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage unavailable (private mode); the session just won't persist.
  }
}
