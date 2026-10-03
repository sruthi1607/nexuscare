import { Router, type Request, type Response } from 'express';
import type { z } from 'zod';
import {
  allergiesUpdateSchema,
  conditionsUpdateSchema,
  emergencyContactUpdateSchema,
  healthBasicsUpdateSchema,
  historyUpdateSchema,
  medicationsUpdateSchema,
  type ApiSuccess,
  type MedicalProfile,
  type MedicalProfileSection,
} from '@nexuscare/shared';
import { recordAudit } from '../../lib/audit.js';
import type { Database, Queryable } from '../../lib/database.js';
import { NotFoundError } from '../../lib/errors.js';
import { currentUser, requireRole } from '../../middleware/authorize.js';
import { validateBody } from '../../middleware/validate.js';
import * as repo from './medical-profile.repository.js';

/**
 * The patient's own medical profile: GET the whole profile, PUT one section at a time.
 * Patient-only for now; doctor (care relationship) and family (scoped) read access arrive with the
 * appointments and family modules, through their own policy checks.
 */
export function createMedicalProfileRouter(deps: { db: Database }): Router {
  const { db } = deps;
  const router = Router();
  router.use(requireRole('patient'));

  async function respondWithProfile(req: Request, res: Response): Promise<void> {
    const profile = await repo.findMedicalProfile(db, currentUser(req).id);
    if (!profile) throw new NotFoundError('Patient record not found.');
    const body: ApiSuccess<MedicalProfile> = { data: profile };
    res.set('Cache-Control', 'no-store').json(body);
  }

  router.get('/', respondWithProfile);

  /** Registers PUT /<section>: validate → write in a transaction → audit (no values) → respond. */
  function section<S extends z.ZodType>(
    name: MedicalProfileSection,
    schema: S,
    write: (tx: Queryable, patientId: string, input: z.output<S>) => Promise<void>,
  ) {
    router.put(`/${name}`, validateBody(schema), async (req, res) => {
      const patientId = currentUser(req).id;
      await db.transaction(async (tx) => {
        await write(tx, patientId, req.body as z.output<S>);
        await recordAudit(tx, {
          actorId: patientId,
          action: 'medical_profile.updated',
          entityType: 'patient',
          entityId: patientId,
          ipAddress: req.ip,
          metadata: { section: name },
        });
      });
      await respondWithProfile(req, res);
    });
  }

  section('basics', healthBasicsUpdateSchema, repo.updateBasics);
  section('emergency-contact', emergencyContactUpdateSchema, repo.updateEmergencyContact);
  section('allergies', allergiesUpdateSchema, (tx, id, input) =>
    repo.replaceAllergies(tx, id, input.items),
  );
  section('conditions', conditionsUpdateSchema, (tx, id, input) =>
    repo.replaceConditions(tx, id, input.items),
  );
  section('medications', medicationsUpdateSchema, (tx, id, input) =>
    repo.replaceMedications(tx, id, input.items),
  );
  section('history', historyUpdateSchema, (tx, id, input) =>
    repo.replaceHistory(tx, id, input.items),
  );

  return router;
}
