import { existsSync } from 'node:fs';
import type { DatabaseConfig } from '../lib/database.js';
import type { SessionConfig } from '../modules/auth/session-cookie.js';
import { EnvValidationError, loadEnv, type Env } from './env.js';

/**
 * Entry-point helper shared by the server and CLI scripts: loads apps/api/.env when present
 * (local development — deployed environments inject variables), validates it, and exits with a
 * readable message if anything is wrong.
 */
export function loadRuntimeEnv(): Env {
  const envFile = new URL('../../.env', import.meta.url);
  if (existsSync(envFile)) process.loadEnvFile(envFile);
  try {
    return loadEnv();
  } catch (error) {
    if (error instanceof EnvValidationError) {
      console.error(error.message);
      process.exit(1);
    }
    throw error;
  }
}

export function databaseConfigFromEnv(env: Env): DatabaseConfig {
  return {
    url: env.DATABASE_URL,
    sslMode: env.DATABASE_SSL_MODE,
    sslCaFile: env.DATABASE_SSL_CA_FILE,
  };
}

export function sessionConfigFromEnv(env: Env): SessionConfig {
  return {
    idleTimeoutMinutes: env.SESSION_IDLE_TIMEOUT_MINUTES,
    absoluteTimeoutHours: env.SESSION_ABSOLUTE_TIMEOUT_HOURS,
    cookieSecure: env.SESSION_COOKIE_SECURE,
  };
}
