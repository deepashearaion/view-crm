import type { HttpAdapter, HttpRequest, QueryParams } from '@/types';

import { getAuthToken, setAuthToken } from './auth-token';
import { HttpError, messageFromBody } from './http-error';

export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

function buildUrl(path: string, query?: QueryParams): string {
  const url = new URL(path, API_URL);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '')
      url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get('content-type') ?? '';
  // Matches application/json and application/problem+json.
  if (contentType.includes('json')) return response.json();
  if (contentType.includes('application/pdf') || contentType.includes('octet-stream'))
    return response.blob();
  return response.text();
}

let sessionExpiredHandler: (() => void) | undefined;

/** Called when a 401 can't be fixed by refreshing the token (the user must sign in again). */
export function onSessionExpired(handler: () => void): void {
  sessionExpiredHandler = handler;
}

let refreshing: Promise<string | null> | null = null;

/** POST /api/auth/refresh using the httpOnly cookie; one request shared by concurrent 401s. */
export function refreshAccessToken(): Promise<string | null> {
  refreshing ??= fetch(buildUrl('/api/auth/refresh'), { method: 'POST', credentials: 'include' })
    .then(async (response) =>
      response.ok ? (((await response.json()) as { token?: string }).token ?? null) : null,
    )
    .catch(() => null)
    .then((token) => {
      setAuthToken(token);
      return token;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

async function send(request: HttpRequest): Promise<Response> {
  const { method, path, query, body, signal } = request;
  const token = getAuthToken();
  const isForm = body instanceof FormData;
  const headers: HeadersInit = {
    Accept: 'application/json',
    // FormData sets its own multipart boundary header.
    ...(body !== undefined && !isForm ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(buildUrl(path, query), {
    method,
    headers,
    body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
    signal,
    // The refresh token is an httpOnly cookie scoped to /api/auth.
    credentials: 'include',
  });
}

/** Talks to the real REST backend. Refreshes the access token once on a 401. */
export const fetchAdapter: HttpAdapter = async (request) => {
  let response = await send(request);

  if (response.status === 401 && !request.path.startsWith('/api/auth/')) {
    const token = await refreshAccessToken();
    if (token) response = await send(request);
    else sessionExpiredHandler?.();
  }

  const payload = await readBody(response);
  if (!response.ok) {
    throw new HttpError(
      response.status,
      messageFromBody(payload) ?? `Request failed (${String(response.status)})`,
      payload,
      response.headers.get('x-request-id') ?? undefined,
    );
  }
  return payload;
};
