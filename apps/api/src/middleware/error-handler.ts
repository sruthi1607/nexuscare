import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { ApiErrorBody } from '@nexuscare/shared';
import { ZodError } from 'zod';
import { AppError, NotFoundError } from '../lib/errors.js';
import type { Logger } from '../lib/logger.js';

/** Errors raised by express.json() carry a `type` and `status`. */
interface BodyParserError extends Error {
  type?: string;
  status?: number;
}

function isBodyParserError(error: unknown): error is BodyParserError {
  return error instanceof Error && typeof (error as BodyParserError).type === 'string';
}

function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof ZodError) {
    return new AppError(
      400,
      'VALIDATION_FAILED',
      'The request is invalid.',
      error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
    );
  }

  if (isBodyParserError(error)) {
    if (error.type === 'entity.parse.failed') {
      return new AppError(400, 'INVALID_JSON', 'The request body is not valid JSON.');
    }
    if (error.type === 'entity.too.large') {
      return new AppError(413, 'PAYLOAD_TOO_LARGE', 'The request body is too large.');
    }
  }

  return new AppError(500, 'INTERNAL_ERROR', 'An unexpected error occurred.');
}

/** 404 for any unmatched route. */
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.path} does not exist.`));
};

export function createErrorHandler(logger: Logger): ErrorRequestHandler {
  return (error: unknown, req, res, next) => {
    if (res.headersSent) {
      next(error);
      return;
    }

    const appError = normalizeError(error);

    if (appError.status >= 500) {
      logger.error({ err: error, requestId: req.id }, 'Request failed');
    } else {
      logger.debug({ code: appError.code, requestId: req.id }, 'Request rejected');
    }

    const body: ApiErrorBody = {
      error: {
        code: appError.code,
        message: appError.message,
        ...(appError.details === undefined ? {} : { details: appError.details }),
        ...(typeof req.id === 'string' ? { requestId: req.id } : {}),
      },
    };
    res.status(appError.status).json(body);
  };
}
