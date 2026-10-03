import { z } from 'zod';

/**
 * Public, build-time configuration. Only VITE_-prefixed variables reach the browser bundle, so
 * nothing secret may ever be added here.
 */
const publicEnvSchema = z.object({
  VITE_API_BASE_URL: z
    .union([z.literal(''), z.url()])
    .default('')
    .transform((value) => value.replace(/\/+$/, '')),
  /** Public contact address used by the contact page's mailto form. Optional. */
  VITE_CONTACT_EMAIL: z.union([z.literal(''), z.email()]).default(''),
});

const parsed = publicEnvSchema.safeParse(import.meta.env);

if (!parsed.success) {
  throw new Error(
    `Invalid web configuration: ${parsed.error.issues.map((issue) => issue.path.join('.')).join(', ')}`,
  );
}

export const env = {
  /** Empty string means same-origin requests (proxied to the API in development). */
  apiBaseUrl: parsed.data.VITE_API_BASE_URL,
  /** Empty string when not configured; the contact form then explains it cannot send. */
  contactEmail: parsed.data.VITE_CONTACT_EMAIL,
};
