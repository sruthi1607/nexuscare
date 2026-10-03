import type { RequestHandler } from 'express';
import { AppError } from '../lib/errors.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF defence in depth (alongside SameSite=Lax cookies): state-changing requests from a browser
 * must come from an allowed origin. Requests without browser origin metadata (curl, devices,
 * server-to-server) carry no ambient cookies from a victim's browser and are allowed through.
 */
export function requireTrustedOrigin(allowedOrigins: string[]): RequestHandler {
  return (req, _res, next) => {
    if (SAFE_METHODS.has(req.method)) {
      next();
      return;
    }
    const origin = req.get('origin');
    const fetchSite = req.get('sec-fetch-site');
    const untrustedOrigin = origin !== undefined && !allowedOrigins.includes(origin);
    const crossSite = origin === undefined && fetchSite === 'cross-site';
    if (untrustedOrigin || crossSite) {
      next(new AppError(403, 'FORBIDDEN', 'Request origin not allowed.'));
      return;
    }
    next();
  };
}
