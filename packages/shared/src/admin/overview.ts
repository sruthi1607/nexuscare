import { z } from 'zod';

/** GET /api/v1/admin/overview — aggregate counts only, no personal data. */
export const adminOverviewSchema = z.object({
  totalUsers: z.number().int().nonnegative(),
  usersByRole: z.object({
    patient: z.number().int().nonnegative(),
    doctor: z.number().int().nonnegative(),
    caregiver: z.number().int().nonnegative(),
    admin: z.number().int().nonnegative(),
  }),
  suspendedUsers: z.number().int().nonnegative(),
  doctorsPendingVerification: z.number().int().nonnegative(),
  activeSessions: z.number().int().nonnegative(),
  newUsersLast7Days: z.number().int().nonnegative(),
});
export type AdminOverview = z.infer<typeof adminOverviewSchema>;
