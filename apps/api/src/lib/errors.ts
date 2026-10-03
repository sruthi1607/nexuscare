import type { ErrorCode } from '@nexuscare/shared';

/**
 * Base class for expected, client-facing errors. Anything that is not an AppError is treated as an
 * unexpected failure and reported as a generic 500 without leaking internals.
 */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'The requested resource was not found.') {
    super(404, 'NOT_FOUND', message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(details: unknown, message = 'The request is invalid.') {
    super(400, 'VALIDATION_FAILED', message, details);
    this.name = 'ValidationError';
  }
}

export class DependencyUnavailableError extends AppError {
  constructor(message = 'A required service is temporarily unavailable.') {
    super(503, 'DEPENDENCY_UNAVAILABLE', message);
    this.name = 'DependencyUnavailableError';
  }
}
