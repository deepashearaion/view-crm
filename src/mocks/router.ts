import { HttpError } from '@/services/http-error';
import type { HttpMethod, HttpRequest, QueryParams } from '@/types';

export interface MockContext {
  params: Record<string, string>;
  query: QueryParams;
  body: unknown;
}

export type MockHandler = (ctx: MockContext) => unknown;

interface Route {
  method: HttpMethod;
  pattern: RegExp;
  keys: string[];
  handler: MockHandler;
}

const routes: Route[] = [];

function compile(path: string): { pattern: RegExp; keys: string[] } {
  const keys: string[] = [];
  const source = path.replace(/:([A-Za-z_]+)/g, (_match, key: string) => {
    keys.push(key);
    return '([^/]+)';
  });
  return { pattern: new RegExp(`^${source}/?$`), keys };
}

/** Registers a mock endpoint, e.g. `mock('GET', '/api/alerts/:id', ({ params }) => ...)`. */
export function mock(method: HttpMethod, path: string, handler: MockHandler): void {
  routes.push({ method, handler, ...compile(path) });
}

function match(request: HttpRequest): { route: Route; params: Record<string, string> } | undefined {
  for (const route of routes) {
    if (route.method !== request.method) continue;
    const found = route.pattern.exec(request.path);
    if (!found) continue;
    const params: Record<string, string> = {};
    route.keys.forEach((key, index) => {
      params[key] = decodeURIComponent(found[index + 1] ?? '');
    });
    return { route, params };
  }
  return undefined;
}

export function hasRoute(request: HttpRequest): boolean {
  return match(request) !== undefined;
}

const LATENCY_MS = 250;

export async function dispatch(request: HttpRequest): Promise<unknown> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
  request.signal?.throwIfAborted();

  const found = match(request);
  if (!found) {
    throw new HttpError(404, `No mock for ${request.method} ${request.path}`);
  }
  // Clone so callers can never mutate the in-memory db through a response.
  return structuredClone(
    found.route.handler({ params: found.params, query: request.query ?? {}, body: request.body }),
  );
}

/** Throw from a handler to produce an HTTP error response. */
export function mockError(status: number, message: string): never {
  throw new HttpError(status, message, { message });
}
