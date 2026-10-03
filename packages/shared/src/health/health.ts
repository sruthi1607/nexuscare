import { z } from 'zod';

export const dependencyStatusSchema = z.enum(['up', 'down']);
export type DependencyStatus = z.infer<typeof dependencyStatusSchema>;

export const healthStatusSchema = z.enum(['ok', 'degraded']);
export type HealthStatus = z.infer<typeof healthStatusSchema>;

export const databaseCheckSchema = z.object({
  status: dependencyStatusSchema,
  latencyMs: z.number().nonnegative().nullable(),
  /** Server version string (e.g. "PostgreSQL 17.4"), only present when the database is up. */
  serverVersion: z.string().nullable(),
  /** Generic, non-sensitive reason when the database is down. */
  error: z.string().nullable(),
});
export type DatabaseCheck = z.infer<typeof databaseCheckSchema>;

/** Payload of `GET /api/health`. */
export const healthReportSchema = z.object({
  status: healthStatusSchema,
  service: z.string(),
  version: z.string(),
  environment: z.string(),
  timestamp: z.iso.datetime(),
  uptimeSeconds: z.number().nonnegative(),
  checks: z.object({
    database: databaseCheckSchema,
  }),
});
export type HealthReport = z.infer<typeof healthReportSchema>;
