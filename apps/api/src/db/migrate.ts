import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Database } from '../lib/database.js';
import type { Logger } from '../lib/logger.js';

/** apps/api/migrations — resolved relative to this file so it works from src/ and dist/. */
export const MIGRATIONS_DIR = fileURLToPath(new URL('../../migrations', import.meta.url));

const MIGRATION_FILE = /^(\d{4})_[a-z0-9_]+\.sql$/;
// Arbitrary constant key so concurrent deploys never apply migrations twice.
const ADVISORY_LOCK_KEY = 4_872_301;

export interface MigrationFile {
  version: string;
  name: string;
  sql: string;
  checksum: string;
}

export async function loadMigrations(dir = MIGRATIONS_DIR): Promise<MigrationFile[]> {
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
  return Promise.all(
    files.map(async (name) => {
      const match = MIGRATION_FILE.exec(name);
      if (!match?.[1]) throw new Error(`Invalid migration file name: ${name}`);
      const sql = await readFile(path.join(dir, name), 'utf8');
      // Normalise line endings so checkouts on Windows and Linux produce the same checksum.
      const checksum = createHash('sha256').update(sql.replace(/\r\n/g, '\n')).digest('hex');
      return { version: match[1], name, sql, checksum };
    }),
  );
}

/**
 * Applies pending migrations in order inside one transaction (PostgreSQL DDL is transactional), so a
 * failure leaves the schema untouched. Refuses to run if an already-applied migration has since
 * been edited — migrations are immutable once applied.
 */
export async function runMigrations(
  db: Database,
  logger: Logger,
  dir = MIGRATIONS_DIR,
): Promise<string[]> {
  const migrations = await loadMigrations(dir);

  return db.transaction(async (lockTx) => {
    // Transaction-scoped lock: released automatically on commit/rollback.
    await lockTx.query('select pg_advisory_xact_lock($1)', [ADVISORY_LOCK_KEY]);
    await lockTx.query(`
      create table if not exists schema_migrations (
        version     text primary key,
        name        text not null,
        checksum    text not null,
        applied_at  timestamptz not null default now()
      )`);

    const { rows } = await lockTx.query<{ version: string; checksum: string; name: string }>(
      'select version, checksum, name from schema_migrations',
    );
    const applied = new Map(rows.map((row) => [row.version, row]));
    const newlyApplied: string[] = [];

    for (const migration of migrations) {
      const existing = applied.get(migration.version);
      if (existing) {
        if (existing.checksum !== migration.checksum) {
          throw new Error(
            `Migration ${migration.name} was modified after being applied. Create a new migration instead.`,
          );
        }
        continue;
      }
      logger.info({ migration: migration.name }, 'Applying migration');
      try {
        await lockTx.query(migration.sql);
        await lockTx.query(
          'insert into schema_migrations (version, name, checksum) values ($1, $2, $3)',
          [migration.version, migration.name, migration.checksum],
        );
      } catch (error) {
        throw new Error(`Migration ${migration.name} failed: ${(error as Error).message}`, {
          cause: error,
        });
      }
      newlyApplied.push(migration.name);
    }
    return newlyApplied;
  });
}
