import type { RequestHandler } from 'express';
import type { AuthService } from '../modules/auth/auth.service.js';
import {
  clearSessionCookie,
  readSessionCookie,
  type SessionConfig,
} from '../modules/auth/session-cookie.js';

/**
 * Resolves the session cookie (if any) and attaches `req.auth`. Never rejects on its own — routes
 * opt into protection with requireAuth / requireRole. Invalid or expired cookies are cleared.
 */
export function authenticate(auth: AuthService, session: SessionConfig): RequestHandler {
  return async (req, res, next) => {
    const token = readSessionCookie(req, session);
    if (!token) {
      next();
      return;
    }
    const active = await auth.resolveSession(token);
    if (active) {
      req.auth = active;
    } else {
      clearSessionCookie(res, session);
    }
    next();
  };
}
