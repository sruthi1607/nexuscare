/**
 * Vitest global setup: provides a migrated PostgreSQL database for integration tests.
 *
 * - If TEST_DATABASE_URL is set, migrations are applied to it (use a dedicated test database).
 * - Otherwise a throwaway PostgreSQL server is started with `embedded-postgres` in a temp
 *   directory and deleted afterwards, so `npm test` works with no setup and no Docker.
 */
import type { ChildProcess } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import EmbeddedPostgres from 'embedded-postgres';
import type { TestProject } from 'vitest/node';
import { runMigrations } from '../src/db/migrate.js';
import { createDatabase } from '../src/lib/database.js';
import { createLogger } from '../src/lib/logger.js';

declare module 'vitest' {
  export interface ProvidedContext {
    databaseUrl: string;
  }
}

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => {
        if (address && typeof address === 'object') resolve(address.port);
        else reject(new Error('Could not determine a free port'));
      });
    });
  });
}

async function migrate(url: string): Promise<void> {
  const logger = createLogger({ level: 'silent' });
  const db = createDatabase({ url, sslMode: 'disable', maxConnections: 2 }, logger);
  try {
    await runMigrations(db, logger);
  } finally {
    await db.close();
  }
}

export default async function setup(project: TestProject) {
  const externalUrl = process.env.TEST_DATABASE_URL;
  if (externalUrl) {
    await migrate(externalUrl);
    project.provide('databaseUrl', externalUrl);
    return undefined;
  }

  const dataDir = await mkdtemp(path.join(tmpdir(), 'nexuscare-test-db-'));
  const port = await freePort();
  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: 'postgres',
    password: 'postgres',
    port,
    persistent: false,
    onLog: () => undefined,
  });
  await pg.initialise();
  await pg.start();
  await pg.createDatabase('nexuscare_test');

  const url = `postgresql://postgres:postgres@127.0.0.1:${String(port)}/nexuscare_test`;
  await migrate(url);
  project.provide('databaseUrl', url);

  return async () => {
    // On Windows the server is force-killed and its child processes may briefly keep the inherited
    // stdout/stderr pipes open, which keeps Vitest from exiting. Release them explicitly.
    const child = (pg as unknown as { process?: ChildProcess }).process;
    await pg.stop();
    child?.stdout?.destroy();
    child?.stderr?.destroy();
    child?.unref();
    await rm(dataDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  };
}
