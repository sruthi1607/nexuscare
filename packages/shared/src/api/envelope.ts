import { z } from 'zod';

/**
 * Error codes returned in the `error.code` field of every API error response.
 * Later phases extend this list; codes are never renamed once published.
 */
export const ERROR_CODES = [
  'VALIDATION_FAILED',
  'INVALID_JSON',
  'PAYLOAD_TOO_LARGE',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
  'RATE_LIMITED',
  'DEPENDENCY_UNAVAILABLE',
  'INTERNAL_ERROR',
  // Authentication (Phase 3)
  'INVALID_CREDENTIALS',
  'EMAIL_TAKEN',
  'ACCOUNT_SUSPENDED',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export const apiErrorBodySchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
    requestId: z.string().optional(),
  }),
});

export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;

/** Successful responses wrap their payload as `{ data, meta? }`. */
export const apiSuccessSchema = <T extends z.ZodType>(data: T) =>
  z.object({
    data,
    meta: z.record(z.string(), z.unknown()).optional(),
  });

export interface ApiSuccess<T> {
  data: T;
  meta?: Record<string, unknown>;
}
