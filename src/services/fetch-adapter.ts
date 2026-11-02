import type { HttpAdapter, QueryParams } from '@/types';

import { getAuthToken } from './auth-token';
import { HttpError, messageFromBody } from './http-error';

const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

function buildUrl(path: string, query?: QueryParams): string {
  const url = new URL(path, API_URL);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get('content-type') ?? '';
  return contentType.includes('application/json') ? response.json() : response.text();
}

/** Talks to the real REST backend. */
export const fetchAdapter: HttpAdapter = async ({ method, path, query, body, signal }) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    Accept: 'application/json',
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });
  const payload = await readBody(response);

  if (!response.ok) {
    throw new HttpError(
      response.status,
      messageFromBody(payload) ?? `Request failed (${String(response.status)})`,
      payload,
    );
  }
  return payload;
};
