import { z } from 'zod';
import { doctorVerificationSchema } from '../auth/schemas.js';
import {
  currencySchema,
  languageCodeSchema,
  optionalText,
  pastYearSchema,
  requiredText,
  timeOfDaySchema,
} from './common.js';

export const CONSULTATION_MODES = [
  { value: 'video', label: 'Video', description: 'Camera and audio' },
  { value: 'audio', label: 'Audio only', description: 'For weak connections' },
  { value: 'in_person', label: 'In person', description: 'At your clinic' },
] as const;
export type ConsultationMode = (typeof CONSULTATION_MODES)[number]['value'];
export const consultationModeSchema = z.enum(['video', 'audio', 'in_person']);

export const SLOT_LENGTHS = [10, 15, 20, 30, 45, 60] as const;
export const slotMinutesSchema = z
  .number()
  .refine((value) => (SLOT_LENGTHS as readonly number[]).includes(value), 'Choose a slot length');

export const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const specialtySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
});
export type Specialty = z.infer<typeof specialtySchema>;

export const qualificationSchema = z.object({
  id: z.uuid(),
  degree: z.string(),
  institution: z.string(),
  year: z.number().int().nullable(),
});
export type Qualification = z.infer<typeof qualificationSchema>;

/** The `Doctor` domain model (professional side; personal details live in Profile). */
export const doctorProfileSchema = z.object({
  doctorId: z.uuid(),
  verificationStatus: doctorVerificationSchema,
  registrationNumber: z.string().nullable(),
  registrationCouncil: z.string().nullable(),
  specialties: z.array(specialtySchema),
  qualifications: z.array(qualificationSchema),
  yearsExperience: z.number().int().nullable(),
  consultationModes: z.array(consultationModeSchema),
  languages: z.array(languageCodeSchema),
  clinicName: z.string().nullable(),
  clinicAddress: z.string().nullable(),
  clinicCity: z.string().nullable(),
  consultationFee: z.number().nullable(),
  feeCurrency: currencySchema.nullable(),
  bio: z.string().nullable(),
  acceptsNewPatients: z.boolean(),
  slotMinutes: z.number().int(),
});
export type DoctorProfile = z.infer<typeof doctorProfileSchema>;
export type Doctor = DoctorProfile;

export const qualificationInputSchema = z.object({
  id: z.uuid().optional(),
  degree: requiredText(120, 'Degree'),
  institution: requiredText(160, 'Institution'),
  year: pastYearSchema.nullable(),
});
export type QualificationInput = z.input<typeof qualificationInputSchema>;

/** PUT /api/v1/doctors/me/profile */
export const doctorProfileUpdateSchema = z
  .object({
    registrationNumber: optionalText(60, 'Registration number'),
    registrationCouncil: optionalText(160, 'Registration council'),
    specialtyIds: z
      .array(z.uuid())
      .min(1, 'Choose at least one specialty')
      .max(3, 'Choose up to three specialties'),
    qualifications: z
      .array(qualificationInputSchema)
      .min(1, 'Add at least one qualification')
      .max(10, 'You can add up to 10 qualifications'),
    yearsExperience: z
      .number({ message: 'Enter your years of experience' })
      .int('Enter whole years')
      .min(0, 'Experience cannot be negative')
      .max(70, 'Enter at most 70 years'),
    consultationModes: z
      .array(consultationModeSchema)
      .min(1, 'Choose at least one consultation type'),
    languages: z
      .array(languageCodeSchema)
      .min(1, 'Choose at least one language')
      .max(10, 'Choose up to 10 languages'),
    clinicName: optionalText(160, 'Hospital / clinic'),
    clinicAddress: optionalText(300, 'Clinic address'),
    clinicCity: optionalText(100, 'City'),
    consultationFee: z
      .number({ message: 'Enter a fee (0 for free consultations)' })
      .min(0, 'Fee cannot be negative')
      .max(100_000, 'Fee looks too high'),
    feeCurrency: currencySchema,
    bio: optionalText(2000, 'Professional bio'),
    acceptsNewPatients: z.boolean(),
  })
  .refine((p) => !p.consultationModes.includes('in_person') || p.clinicName !== null, {
    message: 'Add your hospital or clinic for in-person consultations',
    path: ['clinicName'],
  });
export type DoctorProfileUpdateInput = z.input<typeof doctorProfileUpdateSchema>;

// ---------- Weekly availability ----------

export const availabilityRuleSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  startTime: timeOfDaySchema,
  endTime: timeOfDaySchema,
});
export type AvailabilityRule = z.infer<typeof availabilityRuleSchema>;

export const availabilitySchema = z.object({
  timezone: z.string(),
  slotMinutes: z.number().int(),
  rules: z.array(availabilityRuleSchema),
});
export type Availability = z.infer<typeof availabilitySchema>;

const minutes = (time: string) => {
  const [h = '0', m = '0'] = time.split(':');
  return Number(h) * 60 + Number(m);
};

/**
 * Validates a weekly schedule: each range ends after it starts, fits at least one slot, and ranges
 * on the same day do not overlap. Shared by the editor and the API.
 */
export function availabilityIssues(rules: AvailabilityRule[], slotMinutes: number): string[] {
  const issues: string[] = [];
  rules.forEach((rule, index) => {
    const span = minutes(rule.endTime) - minutes(rule.startTime);
    const day = WEEKDAYS[rule.weekday] ?? 'Day';
    if (span <= 0)
      issues.push(`${day}: end time must be after start time (range ${String(index + 1)})`);
    else if (span < slotMinutes) {
      issues.push(`${day}: each range must fit at least one ${String(slotMinutes)}-minute slot`);
    }
  });
  for (let day = 0; day < 7; day++) {
    const ranges = rules
      .filter((r) => r.weekday === day)
      .map((r) => [minutes(r.startTime), minutes(r.endTime)] as const)
      .sort((a, b) => a[0] - b[0]);
    const overlaps = ranges.some((range, i) => {
      const previous = ranges[i - 1];
      return previous !== undefined && range[0] < previous[1];
    });
    if (overlaps) issues.push(`${WEEKDAYS[day] ?? 'Day'}: time ranges overlap`);
  }
  return issues;
}

/** PUT /api/v1/doctors/me/availability */
export const availabilityUpdateSchema = z
  .object({
    slotMinutes: slotMinutesSchema,
    rules: z.array(availabilityRuleSchema).max(21, 'Add at most three ranges per day'),
  })
  .superRefine((value, ctx) => {
    for (const message of availabilityIssues(value.rules, value.slotMinutes)) {
      ctx.addIssue({ code: 'custom', message, path: ['rules'] });
    }
  });
export type AvailabilityUpdate = z.infer<typeof availabilityUpdateSchema>;

/**
 * What a doctor still needs to complete before verification and listing. Used by the dashboard,
 * the profile page and (later) the admin verification queue.
 */
export function doctorProfileGaps(profile: DoctorProfile, hasAvailability: boolean): string[] {
  const gaps: string[] = [];
  if (!profile.registrationNumber || !profile.registrationCouncil) {
    gaps.push('Medical registration number and council');
  }
  if (profile.specialties.length === 0) gaps.push('At least one specialty');
  if (profile.qualifications.length === 0) gaps.push('At least one qualification');
  if (profile.yearsExperience === null) gaps.push('Years of experience');
  if (profile.consultationModes.length === 0) gaps.push('Consultation types');
  if (profile.languages.length === 0) gaps.push('Languages you consult in');
  if (profile.consultationFee === null || profile.feeCurrency === null)
    gaps.push('Consultation fee');
  if (!hasAvailability) gaps.push('Weekly availability');
  return gaps;
}
