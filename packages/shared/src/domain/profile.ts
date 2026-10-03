import { z } from 'zod';
import { appRoleSchema, accountStatusSchema, fullNameSchema } from '../auth/schemas.js';
import {
  languageCodeSchema,
  optionalPastDate,
  optionalPhone,
  optionalText,
  timeZoneSchema,
} from './common.js';

export const SEX_OPTIONS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;
export type Sex = (typeof SEX_OPTIONS)[number]['value'];
export const sexSchema = z.enum(SEX_OPTIONS.map((o) => o.value) as [Sex, ...Sex[]], {
  message: 'Choose an option',
});

export const addressSchema = z.object({
  line1: optionalText(200, 'Address line 1'),
  line2: optionalText(200, 'Address line 2'),
  city: optionalText(100, 'City / town'),
  region: optionalText(100, 'State / region'),
  postalCode: optionalText(20, 'Postal code'),
  country: optionalText(100, 'Country'),
});
export type Address = z.infer<typeof addressSchema>;

/** Profile fields every role has (contact, demographics, preferences). */
export const profileSchema = z.object({
  userId: z.uuid(),
  email: z.string(),
  role: appRoleSchema,
  status: accountStatusSchema,
  fullName: z.string(),
  phone: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  sex: sexSchema.nullable(),
  preferredLanguage: languageCodeSchema,
  timezone: z.string(),
  address: z.object({
    line1: z.string().nullable(),
    line2: z.string().nullable(),
    city: z.string().nullable(),
    region: z.string().nullable(),
    postalCode: z.string().nullable(),
    country: z.string().nullable(),
  }),
  /** Relative URL of the current avatar (cache-busted), or null when none is set. */
  avatarUrl: z.string().nullable(),
  memberSince: z.string(),
});
export type Profile = z.infer<typeof profileSchema>;

/** PUT /api/v1/me/profile — the editable fields. Email and role are not editable here. */
export const profileUpdateSchema = z.object({
  fullName: fullNameSchema,
  phone: optionalPhone,
  dateOfBirth: optionalPastDate('Date of birth').refine(
    (value) => value === null || value >= '1900-01-01',
    'Enter a realistic date of birth',
  ),
  sex: sexSchema.nullable(),
  preferredLanguage: languageCodeSchema,
  timezone: timeZoneSchema,
  address: addressSchema,
});
export type ProfileUpdateInput = z.input<typeof profileUpdateSchema>;
export type ProfileUpdate = z.output<typeof profileUpdateSchema>;

/** Avatars: accepted upload types and size (the server re-encodes to WebP and strips metadata). */
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

/**
 * The `User` domain model: identity plus profile. (`SessionUser` in auth/schemas is the smaller
 * subset sent on every page load.)
 */
export type User = Profile;
