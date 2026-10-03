import type { AdminOverview } from '@nexuscare/shared';
import type { Queryable } from '../../lib/database.js';

interface OverviewRow {
  total_users: number;
  patients: number;
  doctors: number;
  caregivers: number;
  admins: number;
  suspended_users: number;
  doctors_pending: number;
  active_sessions: number;
  new_users_7d: number;
}

/** Aggregate counts only — the admin overview never returns individual records. */
export async function getOverview(db: Queryable): Promise<AdminOverview> {
  const { rows } = await db.query<OverviewRow>(`
    select
      (select count(*) from users)::int                                         as total_users,
      (select count(*) from users where role = 'patient')::int                  as patients,
      (select count(*) from users where role = 'doctor')::int                   as doctors,
      (select count(*) from users where role = 'caregiver')::int                as caregivers,
      (select count(*) from users where role = 'admin')::int                    as admins,
      (select count(*) from users where status <> 'active')::int                as suspended_users,
      (select count(*) from doctors where verification_status = 'pending')::int as doctors_pending,
      (select count(*) from sessions
         where revoked_at is null and expires_at > now())::int                  as active_sessions,
      (select count(*) from users
         where created_at > now() - interval '7 days')::int                     as new_users_7d
  `);
  const row = rows[0];
  if (!row) throw new Error('Overview query returned no row');
  return {
    totalUsers: row.total_users,
    usersByRole: {
      patient: row.patients,
      doctor: row.doctors,
      caregiver: row.caregivers,
      admin: row.admins,
    },
    suspendedUsers: row.suspended_users,
    doctorsPendingVerification: row.doctors_pending,
    activeSessions: row.active_sessions,
    newUsersLast7Days: row.new_users_7d,
  };
}
