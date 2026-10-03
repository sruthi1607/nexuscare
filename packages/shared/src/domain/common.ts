import { z } from 'zod';

/*
 * Reusable field schemas. API request schemas and browser forms use the same definitions, so a
 * value accepted in the UI is always accepted by the server (and vice versa).
 */

export const uuidSchema = z.uuid();

/** Optional free text: trims, turns '' into null, enforces a max length. */
export const optionalText = (max: number, label = 'This field') =>
  z
    .string()
    .trim()
    .max(max, `${label} must be ${String(max)} characters or fewer`)
    .nullable()
    .transform((value) => (value === null || value === '' ? null : value));

/** Required free text with sensible limits. */
export const requiredText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${String(max)} characters or fewer`);

/** International phone number: digits with optional +, spaces, dashes and brackets. */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9][0-9 ()-]{5,18}[0-9]$/, 'Enter a valid phone number, e.g. +91 98765 43210');

export const optionalPhone = z
  .union([z.literal(''), phoneSchema])
  .nullable()
  .transform((value) => (value === null || value === '' ? null : value));

/** Calendar date as YYYY-MM-DD (no time zone). */
export const isoDateSchema = z.iso.date('Enter a valid date');

export const optionalPastDate = (label = 'Date') =>
  z
    .union([z.literal(''), isoDateSchema])
    .nullable()
    .transform((value) => (value === null || value === '' ? null : value))
    .refine((value) => value === null || value <= new Date().toISOString().slice(0, 10), {
      message: `${label} cannot be in the future`,
    });

/** 24-hour wall-clock time, HH:MM. */
export const timeOfDaySchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use the 24-hour format HH:MM');

/** A year between 1900 and the current year (validated when parsed). */
export const pastYearSchema = z
  .number({ message: 'Enter a year' })
  .int('Enter a whole year')
  .min(1900, 'Enter a year after 1900')
  .refine((year) => year <= new Date().getFullYear(), 'Year cannot be in the future');

export const optionalPastYear = pastYearSchema.nullable();

/**
 * Languages a person can choose as their preference (profile, doctor languages). This is not
 * the UI translation list — it describes who someone can communicate with.
 */
export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'ur', name: 'Urdu' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'or', name: 'Odia' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'as', name: 'Assamese' },
  { code: 'ne', name: 'Nepali' },
  { code: 'ar', name: 'Arabic' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'sw', name: 'Swahili' },
  { code: 'zh', name: 'Chinese' },
] as const;
export type LanguageCode = (typeof LANGUAGES)[number]['code'];
const LANGUAGE_CODES = LANGUAGES.map((l) => l.code) as [LanguageCode, ...LanguageCode[]];
export const languageCodeSchema = z.enum(LANGUAGE_CODES, { message: 'Choose a language' });

export function languageName(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.name ?? code;
}

/** Currencies offered for consultation fees (ISO 4217). */
export const CURRENCIES = [
  'INR',
  'USD',
  'EUR',
  'GBP',
  'BDT',
  'NPR',
  'LKR',
  'PKR',
  'KES',
  'NGN',
] as const;
export const currencySchema = z.enum(CURRENCIES, { message: 'Choose a currency' });
export type Currency = z.infer<typeof currencySchema>;

/**
 * IANA time zone such as "Asia/Kolkata". Validated with the runtime's own time-zone database so
 * the list never goes stale.
 */
export const timeZoneSchema = z
  .string()
  .min(1, 'Choose a time zone')
  .refine((tz) => {
    try {
      new Intl.DateTimeFormat('en', { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  }, 'Choose a valid time zone');
