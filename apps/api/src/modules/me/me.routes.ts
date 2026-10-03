import { Router } from 'express';
import type { ApiSuccess, AuthResponse } from '@nexuscare/shared';
import { currentUser, requireAuth } from '../../middleware/authorize.js';

/** Endpoints about the signed-in user. Every route here requires a session. */
export function createMeRouter(): Router {
  const router = Router();
  router.use(requireAuth);

  router.get('/', (req, res) => {
    const body: ApiSuccess<AuthResponse> = { data: { user: currentUser(req) } };
    res.set('Cache-Control', 'no-store').json(body);
  });

  return router;
}
