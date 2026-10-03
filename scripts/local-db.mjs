#!/usr/bin/env node
/**
 * Local PostgreSQL server for development and integration tests when Docker/Supabase are not
 * available. Runs real PostgreSQL binaries (via `embedded-postgres`); data persists in .local/postgres.
 *
 * This is NOT Supabase: it has no Auth, Storage, Realtime or PostgREST. It exists so the API's
 * database connection can be developed and verified locally. Use a Supabase project for anything
 * that depends on Supabase features.
 *
 * Usage: npm run db:local          (Ctrl+C to stop)
 * Env:   LOCAL_DB_PORT (default 54329)
 */
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import EmbeddedPostgres from 'embedded-postgres';

const port = Number(process.env.LOCAL_DB_PORT ?? 54329);
const databaseDir = fileURLToPath(new URL('../.local/postgres', import.meta.url));
const user = 'postgres';
// Local-only credentials for a server bound to localhost; never used outside development.
const password = 'postgres';
const database = 'nexuscare';

const pg = new EmbeddedPostgres({ databaseDir, user, password, port, persistent: true });

async function main() {
  if (!existsSync(`${databaseDir}/PG_VERSION`)) {
    console.log(`Initialising local PostgreSQL cluster in ${databaseDir} ...`);
    await pg.initialise();
  }
  await pg.start();

  const client = pg.getPgClient();
  await client.connect();
  const { rowCount } = await client.query('select 1 from pg_database where datname = $1', [
    database,
  ]);
  if (rowCount === 0) await pg.createDatabase(database);
  await client.end();

  console.log('\nLocal PostgreSQL is running.');
  console.log(`  DATABASE_URL=postgresql://${user}:${password}@localhost:${port}/${database}`);
  console.log('  DATABASE_SSL_MODE=disable');
  console.log('\nPress Ctrl+C to stop.');
}

let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  console.log('\nStopping local PostgreSQL ...');
  await pg.stop();
  process.exit(0);
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);

main().catch(async (error) => {
  console.error('Failed to start local PostgreSQL:', error);
  await pg.stop().catch(() => undefined);
  process.exit(1);
});
