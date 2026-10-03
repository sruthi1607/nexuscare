/**
 * Applies pending database migrations.
 * Usage: npm run db:migrate
 */
import { databaseConfigFromEnv, loadRuntimeEnv } from '../config/runtime.js';
import { runMigrations } from '../db/migrate.js';
import { createDatabase } from '../lib/database.js';
import { createLogger } from '../lib/logger.js';

const env = loadRuntimeEnv();
const logger = createLogger({ level: env.LOG_LEVEL, pretty: env.NODE_ENV === 'development' });
const db = createDatabase(databaseConfigFromEnv(env), logger);

try {
  const applied = await runMigrations(db, logger);
  logger.info(
    { applied },
    applied.length > 0
      ? `Applied ${String(applied.length)} migration(s)`
      : 'Database schema is up to date',
  );
} catch (error) {
  logger.error({ err: error }, 'Migration failed');
  process.exitCode = 1;
} finally {
  await db.close();
}
