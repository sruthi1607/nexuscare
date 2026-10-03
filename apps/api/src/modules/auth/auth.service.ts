import type { AppRole, LoginInput, RegisterRequest, SessionUser } from '@nexuscare/shared';
import { DatabaseError } from 'pg';
import { normaliseIp, recordAudit } from '../../lib/audit.js';
import type { Database, Queryable } from '../../lib/database.js';
import { AppError } from '../../lib/errors.js';
import type { Logger } from '../../lib/logger.js';
import * as repo from './auth.repository.js';
import { hashPassword, verifyAgainstDummy, verifyPassword } from './password.js';
import type { SessionConfig } from './session-cookie.js';
import { generateSessionToken, hashSessionToken, isWellFormedToken } from './session-token.js';

export interface LockoutPolicy {
  maxFailedAttempts: number;
  lockMinutes: number;
}

export const DEFAULT_LOCKOUT: LockoutPolicy = { maxFailedAttempts: 10, lockMinutes: 15 };

export interface RequestContext {
  ip: string | undefined;
  userAgent: string | undefined;
}

export interface IssuedSession {
  token: string;
  expiresAt: Date;
  user: SessionUser;
}

const UNIQUE_VIOLATION = '23505';

/** Same error for unknown email, wrong password and locked account — no account enumeration. */
const invalidCredentials = () =>
  new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');

export function createAuthService(deps: {
  db: Database;
  logger: Logger;
  session: SessionConfig;
  lockout?: LockoutPolicy;
}) {
  const { db, logger, session } = deps;
  const lockout = deps.lockout ?? DEFAULT_LOCKOUT;

  async function issueSession(
    tx: Queryable,
    userId: string,
    ctx: RequestContext,
  ): Promise<{ token: string; expiresAt: Date }> {
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + session.absoluteTimeoutHours * 3_600_000);
    await repo.insertSession(tx, {
      userId,
      tokenHash: hashSessionToken(token),
      expiresAt,
      ipAddress: normaliseIp(ctx.ip),
      userAgent: ctx.userAgent,
    });
    return { token, expiresAt };
  }

  async function loadUser(tx: Queryable, userId: string): Promise<SessionUser> {
    const user = await repo.findSessionUserById(tx, userId);
    if (!user) throw new Error(`User ${userId} disappeared during authentication`);
    return user;
  }

  /**
   * Creates the user, profile and role record. Used by public sign-up (patient, caregiver,
   * doctor) and by the admin provisioning script — the only path that may create admins.
   */
  async function createAccount(
    tx: Queryable,
    input: { email: string; password: string; fullName: string; role: AppRole },
    passwordHash: string,
  ): Promise<string> {
    try {
      const userId = await repo.insertUser(tx, {
        email: input.email,
        passwordHash,
        role: input.role,
      });
      await repo.insertProfileForRole(tx, { userId, fullName: input.fullName, role: input.role });
      return userId;
    } catch (error) {
      if (error instanceof DatabaseError && error.code === UNIQUE_VIOLATION) {
        throw new AppError(409, 'EMAIL_TAKEN', 'An account with this email already exists.');
      }
      throw error;
    }
  }

  return {
    async register(input: RegisterRequest, ctx: RequestContext): Promise<IssuedSession> {
      // Hash outside the transaction: it is CPU-bound and must not hold a connection.
      const passwordHash = await hashPassword(input.password);
      return db.transaction(async (tx) => {
        const userId = await createAccount(tx, input, passwordHash);
        const { token, expiresAt } = await issueSession(tx, userId, ctx);
        await recordAudit(tx, {
          actorId: userId,
          action: 'auth.registered',
          entityType: 'user',
          entityId: userId,
          ipAddress: ctx.ip,
          metadata: { role: input.role },
        });
        return { token, expiresAt, user: await loadUser(tx, userId) };
      });
    },

    async login(input: LoginInput, ctx: RequestContext): Promise<IssuedSession> {
      const credentials = await repo.findCredentialsByEmail(db, input.email);

      if (!credentials) {
        await verifyAgainstDummy(input.password);
        await recordAudit(db, {
          actorId: null,
          action: 'auth.login_failed',
          ipAddress: ctx.ip,
          metadata: { reason: 'unknown_account' },
        });
        throw invalidCredentials();
      }

      if (credentials.locked_until && credentials.locked_until > new Date()) {
        await verifyAgainstDummy(input.password);
        await recordAudit(db, {
          actorId: credentials.id,
          action: 'auth.login_failed',
          ipAddress: ctx.ip,
          metadata: { reason: 'locked' },
        });
        throw invalidCredentials();
      }

      if (!(await verifyPassword(credentials.password_hash, input.password))) {
        await repo.recordFailedLogin(
          db,
          credentials.id,
          lockout.maxFailedAttempts,
          lockout.lockMinutes,
        );
        await recordAudit(db, {
          actorId: credentials.id,
          action: 'auth.login_failed',
          ipAddress: ctx.ip,
          metadata: { reason: 'bad_password' },
        });
        throw invalidCredentials();
      }

      // Only revealed after a correct password, so it leaks nothing to an attacker.
      if (credentials.status !== 'active') {
        await recordAudit(db, {
          actorId: credentials.id,
          action: 'auth.login_blocked',
          ipAddress: ctx.ip,
          metadata: { status: credentials.status },
        });
        throw new AppError(
          403,
          'ACCOUNT_SUSPENDED',
          'This account is not active. Please contact support.',
        );
      }

      return db.transaction(async (tx) => {
        await repo.recordSuccessfulLogin(tx, credentials.id);
        const { token, expiresAt } = await issueSession(tx, credentials.id, ctx);
        await recordAudit(tx, {
          actorId: credentials.id,
          action: 'auth.login_succeeded',
          ipAddress: ctx.ip,
        });
        return { token, expiresAt, user: await loadUser(tx, credentials.id) };
      });
    },

    /** Revokes the session for this token, if any. Always succeeds. */
    async logout(token: string | undefined, ctx: RequestContext): Promise<void> {
      if (!token || !isWellFormedToken(token)) return;
      const revoked = await repo.revokeSessionByTokenHash(db, hashSessionToken(token));
      if (revoked) {
        await recordAudit(db, {
          actorId: revoked.userId,
          action: 'auth.logged_out',
          entityType: 'session',
          entityId: revoked.sessionId,
          ipAddress: ctx.ip,
        });
      }
    },

    /** Resolves a cookie token to a live session, or undefined when signed out/expired. */
    async resolveSession(token: string): Promise<repo.ActiveSession | undefined> {
      if (!isWellFormedToken(token)) return undefined;
      const active = await repo.findActiveSession(
        db,
        hashSessionToken(token),
        session.idleTimeoutMinutes,
      );
      if (active) {
        await repo.touchSession(db, active.sessionId).catch((error: unknown) => {
          logger.warn({ err: error }, 'Failed to update session activity');
        });
      }
      return active;
    },

    /** Provisioning path for administrators (CLI only — never exposed over HTTP). */
    async createAdmin(input: { email: string; password: string; fullName: string }) {
      const passwordHash = await hashPassword(input.password);
      return db.transaction(async (tx) => {
        const userId = await createAccount(tx, { ...input, role: 'admin' }, passwordHash);
        await recordAudit(tx, {
          actorId: null,
          action: 'auth.admin_provisioned',
          entityType: 'user',
          entityId: userId,
        });
        return loadUser(tx, userId);
      });
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
