import type { CookieOptions, Request, Response } from 'express';

export interface SessionConfig {
  idleTimeoutMinutes: number;
  absoluteTimeoutHours: number;
  /** HTTPS-only cookie with the __Host- prefix. Disable only for http://localhost development. */
  cookieSecure: boolean;
}

/**
 * The __Host- prefix makes browsers reject the cookie unless it is Secure, has Path=/ and no
 * Domain — so it cannot be set or overridden by a sibling subdomain.
 */
export function sessionCookieName(config: SessionConfig): string {
  return config.cookieSecure ? '__Host-nc_session' : 'nc_session';
}

function baseCookieOptions(config: SessionConfig): CookieOptions {
  return {
    httpOnly: true, // not readable from JavaScript, so XSS cannot steal it
    secure: config.cookieSecure,
    sameSite: 'lax', // not sent on cross-site POSTs (CSRF defence)
    path: '/',
  };
}

export function setSessionCookie(
  res: Response,
  config: SessionConfig,
  token: string,
  expiresAt: Date,
): void {
  res.cookie(sessionCookieName(config), token, {
    ...baseCookieOptions(config),
    expires: expiresAt,
  });
}

export function clearSessionCookie(res: Response, config: SessionConfig): void {
  res.clearCookie(sessionCookieName(config), baseCookieOptions(config));
}

export function readSessionCookie(req: Request, config: SessionConfig): string | undefined {
  const cookies = req.cookies as Record<string, unknown> | undefined;
  const value = cookies?.[sessionCookieName(config)];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
