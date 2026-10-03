import { Router } from 'express';
import type { ApiSuccess, DatabaseCheck, HealthReport } from '@nexuscare/shared';
import type { Database } from '../../lib/database.js';
import type { Logger } from '../../lib/logger.js';

export interface HealthRouteDeps {
  db: Database;
  logger: Logger;
  service: string;
  version: string;
  environment: string;
  /** Injectable clock for deterministic tests. */
  now?: () => Date;
}

async function checkDatabase(db: Database, logger: Logger): Promise<DatabaseCheck> {
  try {
    const { latencyMs, serverVersion } = await db.ping();
    return { status: 'up', latencyMs, serverVersion, error: null };
  } catch (error) {
    // Full details go to the logs only; the response never exposes connection info.
    logger.warn({ err: error }, 'Database health check failed');
    return { status: 'down', latencyMs: null, serverVersion: null, error: 'Database unreachable' };
  }
}

export function createHealthRouter(deps: HealthRouteDeps): Router {
  const router = Router();
  const now = deps.now ?? (() => new Date());

  router.get('/', async (_req, res) => {
    const database = await checkDatabase(deps.db, deps.logger);
    const report: HealthReport = {
      status: database.status === 'up' ? 'ok' : 'degraded',
      service: deps.service,
      version: deps.version,
      environment: deps.environment,
      timestamp: now().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      checks: { database },
    };
    const body: ApiSuccess<HealthReport> = { data: report };
    res
      .status(report.status === 'ok' ? 200 : 503)
      .set('Cache-Control', 'no-store')
      .json(body);
  });

  return router;
}
