import { Router, type Request } from 'express';
import { rateLimit } from 'express-rate-limit';
import {
  loginSchema,
  registerRequestSchema,
  type ApiSuccess,
  type AuthResponse,
  type LoginInput,
  type RegisterRequest,
  type SessionResponse,
} from '@nexuscare/shared';
import { AppError } from '../../lib/errors.js';
import { validateBody } from '../../middleware/validate.js';
import type { AuthService, RequestContext } from './auth.service.js';
import {
  clearSessionCookie,
  readSessionCookie,
  setSessionCookie,
  type SessionConfig,
} from './session-cookie.js';

function requestContext(req: Request): RequestContext {
  return { ip: req.ip, userAgent: req.get('user-agent') };
}

export function createAuthRouter(deps: {
  auth: AuthService;
  session: SessionConfig;
  /** Login + registration attempts per IP per 15 minutes. */
  attemptsPerWindow: number;
}): Router {
  const { auth, session } = deps;
  const router = Router();

  // Brute-force and credential-stuffing throttle, in addition to per-account lockout.
  const attemptLimiter = rateLimit({
    windowMs: 15 * 60_000,
    limit: deps.attemptsPerWindow,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(
        new AppError(
          429,
          'RATE_LIMITED',
          'Too many sign-in attempts. Please wait a few minutes and try again.',
        ),
      );
    },
  });

  router.post(
    '/register',
    attemptLimiter,
    validateBody(registerRequestSchema),
    async (req, res) => {
      const issued = await auth.register(req.body as RegisterRequest, requestContext(req));
      setSessionCookie(res, session, issued.token, issued.expiresAt);
      const body: ApiSuccess<AuthResponse> = { data: { user: issued.user } };
      res.status(201).json(body);
    },
  );

  router.post('/login', attemptLimiter, validateBody(loginSchema), async (req, res) => {
    const ctx = requestContext(req);
    // Rotate: a new login never reuses (or leaves behind) a previous session.
    await auth.logout(readSessionCookie(req, session), ctx);
    const issued = await auth.login(req.body as LoginInput, ctx);
    setSessionCookie(res, session, issued.token, issued.expiresAt);
    const body: ApiSuccess<AuthResponse> = { data: { user: issued.user } };
    res.status(200).json(body);
  });

  router.post('/logout', async (req, res) => {
    await auth.logout(readSessionCookie(req, session), requestContext(req));
    clearSessionCookie(res, session);
    res.status(204).end();
  });

  /** Signed-out is a normal state here, so it returns `{ user: null }` rather than 401. */
  router.get('/session', (req, res) => {
    const body: ApiSuccess<SessionResponse> = { data: { user: req.auth?.user ?? null } };
    res.set('Cache-Control', 'no-store').json(body);
  });

  return router;
}
