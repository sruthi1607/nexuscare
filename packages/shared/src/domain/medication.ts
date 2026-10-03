import { z } from 'zod';
import { optionalPastDate, optionalText, requiredText } from './common.js';

export const MEDICATION_SOURCES = ['self_reported', 'prescribed'] as const;
export const medicationSourceSchema = z.enum(MEDICATION_SOURCES);

export const MEDICATION_STATUSES = ['active', 'paused', 'stopped', 'completed'] as const;
export const medicationStatusSchema = z.enum(MEDICATION_STATUSES);
export type MedicationStatus = z.infer<typeof medicationStatusSchema>;

/**
 * A medicine the patient takes. Phase 4 stores patient-reported medicines; the prescriptions
 * module adds `prescribed` ones and the reminders module schedules doses against the same rows.
 */
export const medicationSchema = z.object({
  id: z.uuid(),
  patientId: z.uuid(),
  name: z.string(),
  dose: z.string().nullable(),
  frequency: z.string().nullable(),
  notes: z.string().nullable(),
  startedOn: z.string().nullable(),
  source: medicationSourceSchema,
  status: medicationStatusSchema,
  /** Present for prescribed medicines (prescriptions module). */
  prescriptionItemId: z.uuid().nullable(),
});
export type Medication = z.infer<typeof medicationSchema>;

/** One self-reported medicine in the medical-profile editor (id present when editing). */
export const medicationInputSchema = z.object({
  id: z.uuid().optional(),
  name: requiredText(120, 'Medicine name'),
  dose: optionalText(60, 'Dose'),
  frequency: optionalText(80, 'Frequency'),
  notes: optionalText(300, 'Notes'),
  startedOn: optionalPastDate('Start date'),
  status: z.enum(['active', 'paused', 'stopped']),
});
export type MedicationInput = z.input<typeof medicationInputSchema>;
