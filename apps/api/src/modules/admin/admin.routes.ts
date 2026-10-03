import { Router } from 'express';
import type { AdminOverview, ApiSuccess } from '@nexuscare/shared';
import type { Database } from '../../lib/database.js';
import { requireRole } from '../../middleware/authorize.js';
import { getOverview } from './admin.repository.js';

/** Platform administration. The whole router is admin-only. */
export function createAdminRouter(deps: { db: Database }): Router {
  const router = Router();
  router.use(requireRole('admin'));

  router.get('/overview', async (_req, res) => {
    const body: ApiSuccess<AdminOverview> = { data: await getOverview(deps.db) };
    res.set('Cache-Control', 'no-store').json(body);
  });

  return router;
}
