import express, { Router } from 'express';
import {
  AVATAR_MAX_BYTES,
  profileUpdateSchema,
  type ApiSuccess,
  type Profile,
  type ProfileUpdate,
} from '@nexuscare/shared';
import { recordAudit } from '../../lib/audit.js';
import type { Database } from '../../lib/database.js';
import { AppError, NotFoundError } from '../../lib/errors.js';
import { currentUser, requireAuth } from '../../middleware/authorize.js';
import { validateBody } from '../../middleware/validate.js';
import { createDbAvatarStore, processAvatar } from './avatar.js';
import { findProfile, updateProfile } from './profile.repository.js';

/**
 * The signed-in user's own profile and avatar (every role). Mounted under /api/v1/me.
 * Users can only ever read or change their own profile here — the id comes from the session.
 */
export function createProfileRouter(deps: { db: Database }): Router {
  const { db } = deps;
  const avatars = createDbAvatarStore(db);
  const router = Router();
  router.use(requireAuth);

  async function loadProfile(userId: string): Promise<Profile> {
    const profile = await findProfile(db, userId);
    if (!profile) throw new NotFoundError('Profile not found.');
    return profile;
  }

  router.get('/profile', async (req, res) => {
    const body: ApiSuccess<Profile> = { data: await loadProfile(currentUser(req).id) };
    res.set('Cache-Control', 'no-store').json(body);
  });

  router.put('/profile', validateBody(profileUpdateSchema), async (req, res) => {
    const user = currentUser(req);
    await db.transaction(async (tx) => {
      await updateProfile(tx, user.id, req.body as ProfileUpdate);
      await recordAudit(tx, {
        actorId: user.id,
        action: 'profile.updated',
        entityType: 'profile',
        entityId: user.id,
        ipAddress: req.ip,
      });
    });
    const body: ApiSuccess<Profile> = { data: await loadProfile(user.id) };
    res.json(body);
  });

  router.get('/avatar', async (req, res) => {
    const avatar = await avatars.get(currentUser(req).id);
    if (!avatar) throw new NotFoundError('No avatar has been uploaded.');
    res
      .set({
        'Content-Type': avatar.mimeType,
        // Private to this user's browser; the URL changes (?v=) whenever the avatar does.
        'Cache-Control': 'private, max-age=86400',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'",
      })
      .send(avatar.data);
  });

  // Raw image body (not multipart): simpler, and the size limit is enforced before buffering.
  router.put(
    '/avatar',
    express.raw({
      type: ['image/jpeg', 'image/png', 'image/webp'],
      limit: AVATAR_MAX_BYTES,
    }),
    async (req, res) => {
      if (!Buffer.isBuffer(req.body)) {
        throw new AppError(400, 'VALIDATION_FAILED', 'Upload a JPEG, PNG or WebP image.');
      }
      const user = currentUser(req);
      const image = await processAvatar(req.body);
      await db.transaction(async (tx) => {
        await avatars.put(tx, user.id, image);
        await recordAudit(tx, {
          actorId: user.id,
          action: 'profile.avatar_updated',
          entityType: 'profile',
          entityId: user.id,
          ipAddress: req.ip,
        });
      });
      const body: ApiSuccess<Profile> = { data: await loadProfile(user.id) };
      res.json(body);
    },
  );

  router.delete('/avatar', async (req, res) => {
    const user = currentUser(req);
    await db.transaction(async (tx) => {
      if (await avatars.remove(tx, user.id)) {
        await recordAudit(tx, {
          actorId: user.id,
          action: 'profile.avatar_removed',
          entityType: 'profile',
          entityId: user.id,
          ipAddress: req.ip,
        });
      }
    });
    const body: ApiSuccess<Profile> = { data: await loadProfile(user.id) };
    res.json(body);
  });

  return router;
}
