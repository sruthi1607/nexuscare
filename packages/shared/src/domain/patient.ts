import { z } from 'zod';
import { optionalPastYear, optionalPhone, optionalText, requiredText } from './common.js';
import { medicationInputSchema, medicationSchema } from './medication.js';

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export const bloodGroupSchema = z.enum(BLOOD_GROUPS, { message: 'Choose a blood group' });
export type BloodGroup = z.infer<typeof bloodGroupSchema>;

export const ALLERGY_SEVERITIES = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
  { value: 'unknown', label: 'Not sure' },
] as const;
export const allergySeveritySchema = z.enum(['mild', 'moderate', 'severe', 'unknown']);

export const CONDITION_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'managed', label: 'Under control' },
  { value: 'resolved', label: 'Resolved' },
] as const;
export const conditionStatusSchema = z.enum(['active', 'managed', 'resolved']);

export const HISTORY_KINDS = [
  { value: 'surgery', label: 'Surgery' },
  { value: 'hospitalization', label: 'Hospital stay' },
  { value: 'past_condition', label: 'Past illness' },
  { value: 'injury', label: 'Injury' },
  { value: 'other', label: 'Other' },
] as const;
export const historyKindSchema = z.enum([
  'surgery',
  'hospitalization',
  'past_condition',
  'injury',
  'other',
]);

// ---------- Persisted shapes (API responses) ----------

export const allergySchema = z.object({
  id: z.uuid(),
  substance: z.string(),
  reaction: z.string().nullable(),
  severity: allergySeveritySchema,
});
export type Allergy = z.infer<typeof allergySchema>;

export const chronicConditionSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  status: conditionStatusSchema,
  sinceYear: z.number().int().nullable(),
  notes: z.string().nullable(),
});
export type ChronicCondition = z.infer<typeof chronicConditionSchema>;

export const medicalHistoryEntrySchema = z.object({
  id: z.uuid(),
  kind: historyKindSchema,
  description: z.string(),
  year: z.number().int().nullable(),
  notes: z.string().nullable(),
});
export type MedicalHistoryEntry = z.infer<typeof medicalHistoryEntrySchema>;

export const healthBasicsSchema = z.object({
  bloodGroup: bloodGroupSchema.nullable(),
  heightCm: z.number().nullable(),
  weightKg: z.number().nullable(),
});
export type HealthBasics = z.infer<typeof healthBasicsSchema>;

export const emergencyContactSchema = z.object({
  name: z.string().nullable(),
  relationship: z.string().nullable(),
  phone: z.string().nullable(),
});
export type EmergencyContact = z.infer<typeof emergencyContactSchema>;

/**
 * The `Patient` domain model's medical side. Patient-reported information: it supports care but
 * is not a clinical record and is never interpreted by the platform.
 */
export const medicalProfileSchema = z.object({
  patientId: z.uuid(),
  basics: healthBasicsSchema,
  emergencyContact: emergencyContactSchema,
  allergies: z.array(allergySchema),
  conditions: z.array(chronicConditionSchema),
  medications: z.array(medicationSchema),
  history: z.array(medicalHistoryEntrySchema),
  updatedAt: z.string().nullable(),
});
export type MedicalProfile = z.infer<typeof medicalProfileSchema>;
export type Patient = MedicalProfile;

// ---------- Section update payloads (PUT /api/v1/patients/me/medical-profile/<section>) ----------

const nullableNumber = (min: number, max: number, label: string) =>
  z
    .number({ message: `Enter ${label}` })
    .min(min, `${label} must be at least ${String(min)}`)
    .max(max, `${label} must be at most ${String(max)}`)
    .nullable();

export const healthBasicsUpdateSchema = z.object({
  bloodGroup: bloodGroupSchema.nullable(),
  heightCm: nullableNumber(30, 250, 'Height (cm)'),
  weightKg: nullableNumber(1, 400, 'Weight (kg)'),
});

export const emergencyContactUpdateSchema = z
  .object({
    name: optionalText(120, 'Name'),
    relationship: optionalText(60, 'Relationship'),
    phone: optionalPhone,
  })
  .refine((c) => (c.name === null) === (c.phone === null), {
    message: 'Provide both a name and a phone number, or leave both empty',
    path: ['phone'],
  });

export const allergyInputSchema = z.object({
  id: z.uuid().optional(),
  substance: requiredText(120, 'Allergy'),
  reaction: optionalText(200, 'Reaction'),
  severity: allergySeveritySchema,
});
export type AllergyInput = z.input<typeof allergyInputSchema>;

export const conditionInputSchema = z.object({
  id: z.uuid().optional(),
  name: requiredText(120, 'Condition'),
  status: conditionStatusSchema,
  sinceYear: optionalPastYear,
  notes: optionalText(300, 'Notes'),
});
export type ConditionInput = z.input<typeof conditionInputSchema>;

export const historyInputSchema = z.object({
  id: z.uuid().optional(),
  kind: historyKindSchema,
  description: requiredText(200, 'Description'),
  year: optionalPastYear,
  notes: optionalText(300, 'Notes'),
});
export type HistoryInput = z.input<typeof historyInputSchema>;

/** Wraps a list editor payload: the full desired list (items with ids are updated, others added). */
const listOf = <T extends z.ZodType>(item: T, max: number, label: string) =>
  z.object({
    items: z.array(item).max(max, `You can add up to ${String(max)} ${label}`),
  });

export const allergiesUpdateSchema = listOf(allergyInputSchema, 50, 'allergies');
export const conditionsUpdateSchema = listOf(conditionInputSchema, 50, 'conditions');
export const medicationsUpdateSchema = listOf(medicationInputSchema, 50, 'medicines');
export const historyUpdateSchema = listOf(historyInputSchema, 100, 'history entries');

export const MEDICAL_PROFILE_SECTIONS = [
  'basics',
  'emergency-contact',
  'allergies',
  'conditions',
  'medications',
  'history',
] as const;
export type MedicalProfileSection = (typeof MEDICAL_PROFILE_SECTIONS)[number];
