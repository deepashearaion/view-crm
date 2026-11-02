import { mockAdapter, mockHandles } from '@/mocks';
import type { HttpAdapter, HttpRequest, QueryParams } from '@/types';

import { fetchAdapter } from './fetch-adapter';

/**
 * - `real`:   every request goes to the backend (VITE_API_URL).
 * - `mock`:   every request is served by src/mocks.
 * - `hybrid`: routes the backend implements go to it; everything else is mocked.
 */
export type ApiMode = 'real' | 'mock' | 'hybrid';

/** Routes the Go backend implements today. Used only in hybrid mode. */
const BACKEND_ROUTES = ['/api/auth/', '/api/contacts', '/api/dashboard/sales', '/api/profile'];

const hybridAdapter: HttpAdapter = (request) =>
  BACKEND_ROUTES.some((prefix) => request.path.startsWith(prefix)) || !mockHandles(request)
    ? fetchAdapter(request)
    : mockAdapter(request);

const adapters: Record<ApiMode, HttpAdapter> = {
  real: fetchAdapter,
  mock: mockAdapter,
  hybrid: hybridAdapter,
};

function resolveMode(value: unknown): ApiMode {
  return value === 'real' || value === 'mock' || value === 'hybrid' ? value : 'hybrid';
}

// Switching to the real backend is this one line (or VITE_API_MODE=real in .env).
export const API_MODE: ApiMode = resolveMode(import.meta.env.VITE_API_MODE);

const adapter = adapters[API_MODE];

interface RequestOptions {
  query?: QueryParams;
  signal?: AbortSignal;
}

// The adapter returns `unknown`; callers state the expected shape via the generic, which
// mirrors the backend contract. Mocks are typed against the same contracts.
function request<T>(req: HttpRequest): Promise<T> {
  return adapter(req) as Promise<T>;
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>({ method: 'GET', path, ...options }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>({ method: 'POST', path, body, ...options }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>({ method: 'PUT', path, body, ...options }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>({ method: 'PATCH', path, body, ...options }),
  delete: <T = void>(path: string, options?: RequestOptions) =>
    request<T>({ method: 'DELETE', path, ...options }),
};
