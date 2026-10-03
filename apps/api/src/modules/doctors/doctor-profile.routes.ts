import { Router } from 'express';
import type { z } from 'zod';
import {
  availabilityUpdateSchema,
  doctorProfileUpdateSchema,
  type ApiSuccess,
  type Availability,
  type DoctorProfile,
  type Specialty,
} from '@nexuscare/shared';
import { recordAudit } from '../../lib/audit.js';
import type { Database } from '../../lib/database.js';
import { NotFoundError } from '../../lib/errors.js';
import { currentUser, requireRole } from '../../middleware/authorize.js';
import { validateBody } from '../../middleware/validate.js';
import * as repo from './doctor-profile.repository.js';

/** Public reference data. Mounted at /api/v1/specialties. */
export function createSpecialtiesRouter(deps: { db: Database }): Router {
  const router = Router();
  router.get('/', async (_req, res) => {
    const body: ApiSuccess<Specialty[]> = { data: await repo.listSpecialties(deps.db) };
    res.set('Cache-Control', 'public, max-age=3600').json(body);
  });
  return router;
}

/** The signed-in doctor's own professional profile and availability. Mounted at /doctors/me. */
export function createDoctorSelfRouter(deps: { db: Database }): Router {
  const { db } = deps;
  const router = Router();
  router.use(requireRole('doctor'));

  async function loadProfile(doctorId: string): Promise<DoctorProfile> {
    const profile = await repo.findDoctorProfile(db, doctorId);
    if (!profile) throw new NotFoundError('Doctor record not found.');
    return profile;
  }

  router.get('/profile', async (req, res) => {
    const body: ApiSuccess<DoctorProfile> = { data: await loadProfile(currentUser(req).id) };
    res.set('Cache-Control', 'no-store').json(body);
  });

  router.put('/profile', validateBody(doctorProfileUpdateSchema), async (req, res) => {
    const doctorId = currentUser(req).id;
    await db.transaction(async (tx) => {
      await repo.updateDoctorProfile(
        tx,
        doctorId,
        req.body as z.output<typeof doctorProfileUpdateSchema>,
      );
      await recordAudit(tx, {
        actorId: doctorId,
        action: 'doctor_profile.updated',
        entityType: 'doctor',
        entityId: doctorId,
        ipAddress: req.ip,
      });
    });
    const body: ApiSuccess<DoctorProfile> = { data: await loadProfile(doctorId) };
    res.json(body);
  });

  router.get('/availability', async (req, res) => {
    const body: ApiSuccess<Availability> = {
      data: await repo.findAvailability(db, currentUser(req).id),
    };
    res.set('Cache-Control', 'no-store').json(body);
  });

  router.put('/availability', validateBody(availabilityUpdateSchema), async (req, res) => {
    const doctorId = currentUser(req).id;
    await db.transaction(async (tx) => {
      await repo.replaceAvailability(
        tx,
        doctorId,
        req.body as z.output<typeof availabilityUpdateSchema>,
      );
      await recordAudit(tx, {
        actorId: doctorId,
        action: 'doctor_availability.updated',
        entityType: 'doctor',
        entityId: doctorId,
        ipAddress: req.ip,
      });
    });
    const body: ApiSuccess<Availability> = { data: await repo.findAvailability(db, doctorId) };
    res.json(body);
  });

  return router;
}
