/** Envelope used by endpoints that wrap their payload. */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PageParams {
  page?: number;
  pageSize?: number;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export interface HttpRequest {
  method: HttpMethod;
  /** Path starting with `/api/...`. */
  path: string;
  query?: QueryParams;
  body?: unknown;
  signal?: AbortSignal;
}

/** Transport used by `http`. A real fetch adapter and the mock adapter both implement it. */
export type HttpAdapter = (request: HttpRequest) => Promise<unknown>;
