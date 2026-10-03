import type { z } from 'zod';
import type {
  allergiesUpdateSchema,
  BloodGroup,
  conditionsUpdateSchema,
  emergencyContactUpdateSchema,
  healthBasicsUpdateSchema,
  historyUpdateSchema,
  MedicalProfile,
  medicationsUpdateSchema,
} from '@nexuscare/shared';
import type { Queryable } from '../../lib/database.js';
import { syncList, type ListTable } from '../../lib/sync-list.js';

type Out<T extends z.ZodType> = z.output<T>;
type AllergyItem = Out<typeof allergiesUpdateSchema>['items'][number];
type ConditionItem = Out<typeof conditionsUpdateSchema>['items'][number];
type MedicationItem = Out<typeof medicationsUpdateSchema>['items'][number];
type HistoryItem = Out<typeof historyUpdateSchema>['items'][number];

const num = (value: string | null): number | null => (value === null ? null : Number(value));

/** Full medical profile for one patient (always scoped by the caller's own patient id). */
export async function findMedicalProfile(
  db: Queryable,
  patientId: string,
): Promise<MedicalProfile | undefined> {
  const patient = await db.query<{
    blood_group: BloodGroup | null;
    height_cm: string | null;
    weight_kg: string | null;
    emergency_contact_name: string | null;
    emergency_contact_relationship: string | null;
    emergency_contact_phone: string | null;
    medical_profile_updated_at: Date | null;
  }>(
    `select blood_group, height_cm::text, weight_kg::text, emergency_contact_name,
            emergency_contact_relationship, emergency_contact_phone, medical_profile_updated_at
       from patients where user_id = $1`,
    [patientId],
  );
  const row = patient.rows[0];
  if (!row) return undefined;

  const [allergies, conditions, medications, history] = await Promise.all([
    db.query<{ id: string; substance: string; reaction: string | null; severity: string }>(
      `select id, substance, reaction, severity from patient_allergies
        where patient_id = $1 order by created_at, id`,
      [patientId],
    ),
    db.query<{
      id: string;
      name: string;
      status: string;
      since_year: number | null;
      notes: string | null;
    }>(
      `select id, name, status, since_year, notes from patient_conditions
        where patient_id = $1 order by created_at, id`,
      [patientId],
    ),
    db.query<{
      id: string;
      name: string;
      dose: string | null;
      frequency: string | null;
      notes: string | null;
      started_on: string | null;
      source: string;
      status: string;
      prescription_item_id: string | null;
    }>(
      `select id, name, dose, frequency, notes, to_char(started_on, 'YYYY-MM-DD') as started_on,
              source, status, prescription_item_id
         from medications where patient_id = $1 order by created_at, id`,
      [patientId],
    ),
    db.query<{
      id: string;
      kind: string;
      description: string;
      year: number | null;
      notes: string | null;
    }>(
      `select id, kind, description, year, notes from patient_medical_history
        where patient_id = $1 order by year desc nulls last, created_at`,
      [patientId],
    ),
  ]);

  return {
    patientId,
    basics: {
      bloodGroup: row.blood_group,
      heightCm: num(row.height_cm),
      weightKg: num(row.weight_kg),
    },
    emergencyContact: {
      name: row.emergency_contact_name,
      relationship: row.emergency_contact_relationship,
      phone: row.emergency_contact_phone,
    },
    allergies: allergies.rows as MedicalProfile['allergies'],
    conditions: conditions.rows.map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status as MedicalProfile['conditions'][number]['status'],
      sinceYear: c.since_year,
      notes: c.notes,
    })),
    medications: medications.rows.map((m) => ({
      id: m.id,
      patientId,
      name: m.name,
      dose: m.dose,
      frequency: m.frequency,
      notes: m.notes,
      startedOn: m.started_on,
      source: m.source as MedicalProfile['medications'][number]['source'],
      status: m.status as MedicalProfile['medications'][number]['status'],
      prescriptionItemId: m.prescription_item_id,
    })),
    history: history.rows as MedicalProfile['history'],
    updatedAt: row.medical_profile_updated_at?.toISOString() ?? null,
  };
}

async function touch(tx: Queryable, patientId: string): Promise<void> {
  await tx.query('update patients set medical_profile_updated_at = now() where user_id = $1', [
    patientId,
  ]);
}

export async function updateBasics(
  tx: Queryable,
  patientId: string,
  input: Out<typeof healthBasicsUpdateSchema>,
): Promise<void> {
  await tx.query(
    'update patients set blood_group = $2, height_cm = $3, weight_kg = $4 where user_id = $1',
    [patientId, input.bloodGroup, input.heightCm, input.weightKg],
  );
  await touch(tx, patientId);
}

export async function updateEmergencyContact(
  tx: Queryable,
  patientId: string,
  input: Out<typeof emergencyContactUpdateSchema>,
): Promise<void> {
  await tx.query(
    `update patients set emergency_contact_name = $2, emergency_contact_relationship = $3,
            emergency_contact_phone = $4
      where user_id = $1`,
    [patientId, input.name, input.relationship, input.phone],
  );
  await touch(tx, patientId);
}

const allergiesTable: ListTable<AllergyItem> = {
  table: 'patient_allergies',
  ownerColumn: 'patient_id',
  columns: (a) => ({ substance: a.substance, reaction: a.reaction, severity: a.severity }),
};

const conditionsTable: ListTable<ConditionItem> = {
  table: 'patient_conditions',
  ownerColumn: 'patient_id',
  columns: (c) => ({ name: c.name, status: c.status, since_year: c.sinceYear, notes: c.notes }),
};

const historyTable: ListTable<HistoryItem> = {
  table: 'patient_medical_history',
  ownerColumn: 'patient_id',
  columns: (h) => ({ kind: h.kind, description: h.description, year: h.year, notes: h.notes }),
};

/** Only self-reported medicines are editable here; prescribed ones belong to prescriptions. */
const selfReportedMedications: ListTable<MedicationItem> = {
  table: 'medications',
  ownerColumn: 'patient_id',
  scope: "source = 'self_reported'",
  columns: (m) => ({
    name: m.name,
    dose: m.dose,
    frequency: m.frequency,
    notes: m.notes,
    started_on: m.startedOn,
    status: m.status,
  }),
};

export async function replaceAllergies(tx: Queryable, patientId: string, items: AllergyItem[]) {
  await syncList(tx, allergiesTable, patientId, items);
  await touch(tx, patientId);
}

export async function replaceConditions(tx: Queryable, patientId: string, items: ConditionItem[]) {
  await syncList(tx, conditionsTable, patientId, items);
  await touch(tx, patientId);
}

export async function replaceHistory(tx: Queryable, patientId: string, items: HistoryItem[]) {
  await syncList(tx, historyTable, patientId, items);
  await touch(tx, patientId);
}

export async function replaceMedications(
  tx: Queryable,
  patientId: string,
  items: MedicationItem[],
) {
  await syncList(tx, selfReportedMedications, patientId, items);
  // New self-reported rows are attributed to the patient who entered them.
  await tx.query(
    `update medications set created_by = $1
      where patient_id = $1 and source = 'self_reported' and created_by is null`,
    [patientId],
  );
  await touch(tx, patientId);
}
