import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { inject } from 'vitest';
import type { SignupRole } from '@nexuscare/shared';
import { createApp, type AppDeps } from '../src/app.js';
import { createDatabase, type Database, type DatabasePing } from '../src/lib/database.js';
import { createLogger } from '../src/lib/logger.js';
import { createAuthService, type LockoutPolicy } from '../src/modules/auth/auth.service.js';
import type { SessionConfig } from '../src/modules/auth/session-cookie.js';

export const silentLogger = createLogger({ level: 'silent' });

export const TEST_ORIGIN = 'http://localhost:5173';

export const testSessionConfig: SessionConfig = {
  idleTimeoutMinutes: 30,
  absoluteTimeoutHours: 24,
  cookieSecure: false,
};

/**
 * Database double for route tests that never touch data (health checks, middleware). Any query
 * fails loudly so a test cannot silently depend on it.
 */
export function fakeDatabase(
  behaviour: DatabasePing | Error = { latencyMs: 1.5, serverVersion: 'PostgreSQL 17.0' },
): Database {
  const noQueries = () => Promise.reject(new Error('fakeDatabase does not support queries'));
  return {
    query: noQueries,
    transaction: noQueries,
    ping: () =>
      behaviour instanceof Error ? Promise.reject(behaviour) : Promise.resolve(behaviour),
    close: () => Promise.resolve(),
  };
}

export interface TestAppOptions {
  rateLimitPerMinute?: number;
  authAttemptsPerWindow?: number;
  lockout?: LockoutPolicy;
  session?: SessionConfig;
}

export function buildTestApp(db: Database = fakeDatabase(), options: TestAppOptions = {}) {
  const config: AppDeps['config'] = {
    environment: 'test',
    version: '0.1.0-test',
    corsOrigins: [TEST_ORIGIN],
    session: options.session ?? testSessionConfig,
    authAttemptsPerWindow: options.authAttemptsPerWindow ?? 1_000,
    ...(options.rateLimitPerMinute === undefined
      ? {}
      : { rateLimitPerMinute: options.rateLimitPerMinute }),
    ...(options.lockout ? { lockout: options.lockout } : {}),
  };
  return createApp({ db, logger: silentLogger, config });
}

/** Real, migrated database from the global setup. Close it in afterAll. */
export function connectTestDatabase(): Database {
  return createDatabase(
    { url: inject('databaseUrl'), sslMode: 'disable', maxConnections: 5 },
    silentLogger,
  );
}

export const TEST_PASSWORD = 'correcthorse42';

/** Unique address per call so test files can share one database without collisions. */
export function uniqueEmail(label = 'user'): string {
  return `${label}-${randomUUID()}@test.nexuscare.example`;
}

export function registrationBody(role: SignupRole, overrides: Record<string, unknown> = {}) {
  return {
    fullName: `Test ${role}`,
    email: uniqueEmail(role),
    role,
    password: TEST_PASSWORD,
    acceptTerms: true,
    ...overrides,
  };
}

/** Registers through the real HTTP endpoint and returns a cookie-carrying agent. */
export async function registerAgent(app: ReturnType<typeof buildTestApp>, role: SignupRole) {
  const agent = request.agent(app);
  const body = registrationBody(role);
  const res = await agent.post('/api/v1/auth/register').send(body).expect(201);
  return {
    agent,
    email: body.email,
    user: (res.body as { data: { user: { id: string } } }).data.user,
  };
}

/** Admins cannot self-register; tests provision them the same way the CLI does. */
export async function createAdminAgent(app: ReturnType<typeof buildTestApp>, db: Database) {
  const email = uniqueEmail('admin');
  await createAuthService({ db, logger: silentLogger, session: testSessionConfig }).createAdmin({
    email,
    fullName: 'Test Admin',
    password: TEST_PASSWORD,
  });
  const agent = request.agent(app);
  await agent.post('/api/v1/auth/login').send({ email, password: TEST_PASSWORD }).expect(200);
  return { agent, email };
}
