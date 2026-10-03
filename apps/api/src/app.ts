import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { pinoHttp } from 'pino-http';
import type { Database } from './lib/database.js';
import type { Logger } from './lib/logger.js';
import { AppError } from './lib/errors.js';
import { requestId } from './middleware/request-id.js';
import { createErrorHandler, notFoundHandler } from './middleware/error-handler.js';
import { createHealthRouter } from './modules/health/health.routes.js';
import cookieParser from 'cookie-parser';
import { authenticate } from './middleware/authenticate.js';
import { requireTrustedOrigin } from './middleware/origin-check.js';
import { createAdminRouter } from './modules/admin/admin.routes.js';
import { createAuthRouter } from './modules/auth/auth.routes.js';
import { createAuthService, type LockoutPolicy } from './modules/auth/auth.service.js';
import type { SessionConfig } from './modules/auth/session-cookie.js';
import { createMeRouter } from './modules/me/me.routes.js';
import {
  createDoctorSelfRouter,
  createSpecialtiesRouter,
} from './modules/doctors/doctor-profile.routes.js';
import { createMedicalProfileRouter } from './modules/patients/medical-profile.routes.js';
import { createProfileRouter } from './modules/profile/profile.routes.js';

export interface AppDeps {
  db: Database;
  logger: Logger;
  config: {
    environment: string;
    version: string;
    corsOrigins: string[];
    /** Requests per minute per IP across the API. */
    rateLimitPerMinute?: number;
    session: SessionConfig;
    /** Login + registration attempts per IP per 15 minutes (default 20). */
    authAttemptsPerWindow?: number;
    lockout?: LockoutPolicy;
  };
}

export function createApp({ db, logger, config }: AppDeps): Express {
  const app = express();

  app.disable('x-powered-by');
  // Behind one proxy hop (load balancer) in deployed environments so rate limiting sees client IPs.
  app.set('trust proxy', config.environment === 'production' ? 1 : false);

  app.use(requestId);
  app.use(
    pinoHttp({
      logger,
      // Reuse the ID assigned by the requestId middleware.
      genReqId: (req) => req.id,
      customLogLevel: (_req, res, error) => {
        if (error || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
      // Log method, URL and status only — never bodies, which may contain health data.
      serializers: {
        req: (req: { id: unknown; method: string; url: string }) => ({
          id: req.id,
          method: req.method,
          url: req.url,
        }),
        res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
      },
    }),
  );
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        // Same-origin and non-browser requests have no Origin header.
        if (!origin || config.corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new AppError(403, 'FORBIDDEN', 'Origin not allowed.'));
      },
      credentials: true,
      exposedHeaders: ['x-request-id'],
    }),
  );
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: config.rateLimitPerMinute ?? 300,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      handler: (_req, _res, next) => {
        next(new AppError(429, 'RATE_LIMITED', 'Too many requests. Please try again shortly.'));
      },
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  app.use(
    '/api/health',
    createHealthRouter({
      db,
      logger,
      service: 'nexuscare-api',
      version: config.version,
      environment: config.environment,
    }),
  );

  const auth = createAuthService({
    db,
    logger,
    session: config.session,
    ...(config.lockout ? { lockout: config.lockout } : {}),
  });

  // Versioned business API. Order matters: parse cookies → reject untrusted origins → resolve the
  // session → route. Protection itself is declared per router (requireAuth / requireRole).
  const v1 = express.Router();
  v1.use(cookieParser());
  v1.use(requireTrustedOrigin(config.corsOrigins));
  v1.use(authenticate(auth, config.session));
  v1.use(
    '/auth',
    createAuthRouter({
      auth,
      session: config.session,
      attemptsPerWindow: config.authAttemptsPerWindow ?? 20,
    }),
  );
  v1.use('/me', createMeRouter(), createProfileRouter({ db }));
  v1.use('/patients/me/medical-profile', createMedicalProfileRouter({ db }));
  v1.use('/doctors/me', createDoctorSelfRouter({ db }));
  v1.use('/specialties', createSpecialtiesRouter({ db }));
  v1.use('/admin', createAdminRouter({ db }));
  app.use('/api/v1', v1);

  app.use(notFoundHandler);
  app.use(createErrorHandler(logger));

  return app;
}
