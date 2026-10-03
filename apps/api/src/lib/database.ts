import { readFileSync } from 'node:fs';
import pg, { type QueryResult, type QueryResultRow } from 'pg';
import type { Env } from '../config/env.js';
import type { Logger } from './logger.js';

export interface DatabasePing {
  latencyMs: number;
  serverVersion: string;
}

/** Anything that can run a parameterised query: the pool or a transaction client. */
export interface Queryable {
  query<R extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<R>>;
}

/**
 * The API's PostgreSQL access. Always use parameterised queries ($1, $2 …) — never interpolate
 * values into SQL text.
 */
export interface Database extends Queryable {
  /** Runs `fn` in a transaction; commits on success, rolls back on any thrown error. */
  transaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T>;
  ping(): Promise<DatabasePing>;
  close(): Promise<void>;
}

export interface DatabaseConfig {
  url: string;
  sslMode: Env['DATABASE_SSL_MODE'];
  sslCaFile?: string | undefined;
  /** Max pool connections (default 10). */
  maxConnections?: number;
}

type SslConfig = false | { rejectUnauthorized: boolean; ca?: string };

export function buildSslConfig(
  mode: Env['DATABASE_SSL_MODE'],
  caFile: string | undefined,
): SslConfig {
  switch (mode) {
    case 'disable':
      return false;
    case 'require':
      return { rejectUnauthorized: false };
    case 'verify-full':
      return caFile
        ? { rejectUnauthorized: true, ca: readFileSync(caFile, 'utf8') }
        : { rejectUnauthorized: true };
  }
}

/** Removes any sslmode query parameter so `buildSslConfig` is the single source of SSL settings. */
function stripSslParams(connectionString: string): string {
  const url = new URL(connectionString);
  for (const key of ['sslmode', 'sslrootcert', 'sslcert', 'sslkey']) url.searchParams.delete(key);
  return url.toString();
}

const CONNECT_TIMEOUT_MS = 3_000;

export function createDatabase(config: DatabaseConfig, logger: Logger): Database {
  const pool = new pg.Pool({
    connectionString: stripSslParams(config.url),
    ssl: buildSslConfig(config.sslMode, config.sslCaFile),
    max: config.maxConnections ?? 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: CONNECT_TIMEOUT_MS,
    statement_timeout: 10_000,
    application_name: 'nexuscare-api',
  });

  // An idle client erroring (e.g. the server restarted) must not crash the process.
  pool.on('error', (error) => {
    logger.error({ err: error }, 'Unexpected error on idle database client');
  });

  return {
    query<R extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]) {
      return pool.query<R>(text, params);
    },

    async transaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T> {
      const client = await pool.connect();
      try {
        await client.query('begin');
        const result = await fn(client);
        await client.query('commit');
        return result;
      } catch (error) {
        await client.query('rollback').catch((rollbackError: unknown) => {
          logger.error({ err: rollbackError }, 'Transaction rollback failed');
        });
        throw error;
      } finally {
        client.release();
      }
    },

    async ping() {
      const startedAt = performance.now();
      const result = await pool.query<{ version: string }>(
        "select current_setting('server_version') as version",
      );
      const latencyMs = Math.round((performance.now() - startedAt) * 100) / 100;
      return { latencyMs, serverVersion: `PostgreSQL ${result.rows[0]?.version ?? 'unknown'}` };
    },

    async close() {
      await pool.end();
    },
  };
}
