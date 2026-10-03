import type { Request, RequestHandler } from 'express';
import type { AppRole, SessionUser } from '@nexuscare/shared';
import { AppError } from '../lib/errors.js';

/** Rejects requests without a valid session (401). */
export const requireAuth: RequestHandler = (req, _res, next) => {
  if (!req.auth) {
    next(new AppError(401, 'UNAUTHENTICATED', 'Please sign in to continue.'));
    return;
  }
  next();
};

/**
 * Allows only the listed roles (401 if signed out, 403 if signed in with another role). Use after
 * any route-level checks for resource ownership are also in place — role alone is not ownership.
 */
export function requireRole(...roles: [AppRole, ...AppRole[]]): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth) {
      next(new AppError(401, 'UNAUTHENTICATED', 'Please sign in to continue.'));
      return;
    }
    if (!roles.includes(req.auth.user.role)) {
      next(new AppError(403, 'FORBIDDEN', 'You do not have permission to access this resource.'));
      return;
    }
    next();
  };
}

/** The signed-in user; only call in handlers mounted behind requireAuth/requireRole. */
export function currentUser(req: Request): SessionUser {
  if (!req.auth) throw new AppError(401, 'UNAUTHENTICATED', 'Please sign in to continue.');
  return req.auth.user;
}
