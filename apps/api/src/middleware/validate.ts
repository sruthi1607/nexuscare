import type { RequestHandler } from 'express';
import type { z } from 'zod';
import { ValidationError } from '../lib/errors.js';

/**
 * Validates and normalises the JSON body against a shared Zod schema. Unknown fields are dropped,
 * so handlers only ever see validated data.
 */
export function validateBody(schema: z.ZodType): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      next(
        new ValidationError(
          result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        ),
      );
      return;
    }
    req.body = result.data;
    next();
  };
}
