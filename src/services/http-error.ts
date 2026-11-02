export class HttpError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

/** Best-effort human readable message from any thrown value. */
export function errorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/** Pulls `message`/`error` out of an unknown JSON error body. */
export function messageFromBody(body: unknown): string | undefined {
  if (typeof body === 'string' && body.trim()) return body.trim();
  if (typeof body === 'object' && body !== null) {
    for (const key of ['message', 'error'] as const) {
      const value: unknown = (body as Record<string, unknown>)[key];
      if (typeof value === 'string' && value) return value;
    }
  }
  return undefined;
}
