/** `application/problem+json` error body returned by `/api/v1`. */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  /** Human-readable message to show. */
  detail?: string;
  /** Machine-readable reason, e.g. `validation_failed`, `stage_requirements`, `last_owner`. */
  code?: string;
  /** Field name → `required` | `invalid` | `taken` (or another short reason). */
  errors?: Record<string, string>;
  request_id?: string;
}

export class HttpError extends Error {
  readonly status: number;
  readonly body: unknown;
  /** `X-Request-ID` of the failed response; show it in error toasts for support. */
  readonly requestId: string | undefined;

  constructor(status: number, message: string, body?: unknown, requestId?: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
    this.requestId = requestId;
  }

  /** The problem+json body, or undefined for plain-text (legacy) errors. */
  get problem(): ProblemDetails | undefined {
    return typeof this.body === 'object' && this.body !== null ? this.body : undefined;
  }

  /** Problem `code`, e.g. `validation_failed`. */
  get code(): string | undefined {
    return this.problem?.code;
  }
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

/** True when `error` is an HttpError carrying the given problem code. */
export function hasProblemCode(error: unknown, code: string): boolean {
  return isHttpError(error) && error.code === code;
}

/** Best-effort human readable message from any thrown value. */
export function errorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/** Pulls `detail`/`message`/`error` out of an unknown error body (problem+json or legacy). */
export function messageFromBody(body: unknown): string | undefined {
  if (typeof body === 'string' && body.trim()) return body.trim();
  if (typeof body === 'object' && body !== null) {
    for (const key of ['detail', 'message', 'error'] as const) {
      const value: unknown = (body as Record<string, unknown>)[key];
      if (typeof value === 'string' && value) return value;
    }
  }
  return undefined;
}

const FIELD_REASONS: Record<string, string> = {
  required: 'This field is required.',
  invalid: 'This value is invalid.',
  taken: 'This value is already in use.',
};

/** Turns a problem field reason (`required`) into a sentence for a form error. */
export function fieldReasonMessage(reason: string): string {
  return FIELD_REASONS[reason] ?? reason;
}

/**
 * Copies a problem's field `errors` onto a react-hook-form via `setError`.
 * `fieldMap` renames API fields (snake_case) to form fields. Returns the problem code.
 */
export function applyProblem(
  error: unknown,
  setError: (field: string, error: { type: string; message: string }) => void,
  fieldMap: Record<string, string> = {},
): string | undefined {
  if (!isHttpError(error)) return undefined;
  for (const [field, reason] of Object.entries(error.problem?.errors ?? {})) {
    setError(fieldMap[field] ?? field, { type: 'server', message: fieldReasonMessage(reason) });
  }
  return error.code;
}
