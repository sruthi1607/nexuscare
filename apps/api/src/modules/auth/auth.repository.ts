import type { AccountStatus, AppRole, DoctorVerification, SessionUser } from '@nexuscare/shared';
import type { Queryable } from '../../lib/database.js';

export interface CredentialRow {
  id: string;
  password_hash: string;
  role: AppRole;
  status: AccountStatus;
  failed_login_count: number;
  locked_until: Date | null;
}

interface SessionUserRow {
  id: string;
  email: string;
  role: AppRole;
  status: AccountStatus;
  full_name: string;
  doctor_verification: DoctorVerification | null;
  avatar_updated_at: Date | null;
}

/** Cache-busted URL of the signed-in user's avatar (served only to that user). */
export function avatarUrl(updatedAt: Date | null): string | null {
  return updatedAt ? `/api/v1/me/avatar?v=${String(updatedAt.getTime())}` : null;
}

export function toSessionUser(row: SessionUserRow): SessionUser {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    status: row.status,
    fullName: row.full_name,
    doctorVerification: row.role === 'doctor' ? row.doctor_verification : null,
    avatarUrl: avatarUrl(row.avatar_updated_at),
  };
}

const SESSION_USER_COLUMNS = `
  u.id, u.email::text as email, u.role, u.status, p.full_name, p.avatar_updated_at,
  d.verification_status as doctor_verification`;

const SESSION_USER_JOINS = `
  join profiles p on p.user_id = u.id
  left join doctors d on d.user_id = u.id`;

export async function findCredentialsByEmail(
  db: Queryable,
  email: string,
): Promise<CredentialRow | undefined> {
  const { rows } = await db.query<CredentialRow>(
    `select id, password_hash, role, status, failed_login_count, locked_until
       from users where email = $1`,
    [email],
  );
  return rows[0];
}

export async function insertUser(
  db: Queryable,
  input: { email: string; passwordHash: string; role: AppRole },
): Promise<string> {
  const { rows } = await db.query<{ id: string }>(
    'insert into users (email, password_hash, role) values ($1, $2, $3) returning id',
    [input.email, input.passwordHash, input.role],
  );
  const id = rows[0]?.id;
  if (!id) throw new Error('User insert returned no id');
  return id;
}

/** Creates the profile plus the role-specific extension row in the same transaction. */
export async function insertProfileForRole(
  db: Queryable,
  input: { userId: string; fullName: string; role: AppRole },
): Promise<void> {
  await db.query('insert into profiles (user_id, full_name) values ($1, $2)', [
    input.userId,
    input.fullName,
  ]);
  if (input.role === 'patient') {
    await db.query('insert into patients (user_id) values ($1)', [input.userId]);
  } else if (input.role === 'doctor') {
    await db.query('insert into doctors (user_id) values ($1)', [input.userId]);
  }
}

export async function findSessionUserById(
  db: Queryable,
  userId: string,
): Promise<SessionUser | undefined> {
  const { rows } = await db.query<SessionUserRow>(
    `select ${SESSION_USER_COLUMNS} from users u ${SESSION_USER_JOINS} where u.id = $1`,
    [userId],
  );
  return rows[0] ? toSessionUser(rows[0]) : undefined;
}

/**
 * Counts a failed attempt and locks the account for `lockMinutes` once `maxAttempts` consecutive
 * failures are reached.
 */
export async function recordFailedLogin(
  db: Queryable,
  userId: string,
  maxAttempts: number,
  lockMinutes: number,
): Promise<void> {
  await db.query(
    `update users
        set failed_login_count = failed_login_count + 1,
            locked_until = case when failed_login_count + 1 >= $2
                                then now() + make_interval(mins => $3)
                                else locked_until end
      where id = $1`,
    [userId, maxAttempts, lockMinutes],
  );
}

export async function recordSuccessfulLogin(db: Queryable, userId: string): Promise<void> {
  await db.query(
    `update users set failed_login_count = 0, locked_until = null, last_login_at = now()
      where id = $1`,
    [userId],
  );
}

export async function insertSession(
  db: Queryable,
  input: {
    userId: string;
    tokenHash: Buffer;
    expiresAt: Date;
    ipAddress: string | null;
    userAgent: string | undefined;
  },
): Promise<string> {
  const { rows } = await db.query<{ id: string }>(
    `insert into sessions (user_id, token_hash, expires_at, ip_address, user_agent)
     values ($1, $2, $3, $4::inet, $5) returning id`,
    [
      input.userId,
      input.tokenHash,
      input.expiresAt,
      input.ipAddress,
      input.userAgent?.slice(0, 512) ?? null,
    ],
  );
  const id = rows[0]?.id;
  if (!id) throw new Error('Session insert returned no id');
  return id;
}

export interface ActiveSession {
  sessionId: string;
  user: SessionUser;
}

/**
 * Finds a session that is unrevoked, within its absolute lifetime, recently active, and whose
 * user is still active. Anything else is treated as signed out.
 */
export async function findActiveSession(
  db: Queryable,
  tokenHash: Buffer,
  idleTimeoutMinutes: number,
): Promise<ActiveSession | undefined> {
  const { rows } = await db.query<SessionUserRow & { session_id: string }>(
    `select s.id as session_id, ${SESSION_USER_COLUMNS}
       from sessions s
       join users u on u.id = s.user_id
       ${SESSION_USER_JOINS}
      where s.token_hash = $1
        and s.revoked_at is null
        and s.expires_at > now()
        and s.last_seen_at > now() - make_interval(mins => $2)
        and u.status = 'active'`,
    [tokenHash, idleTimeoutMinutes],
  );
  const row = rows[0];
  return row ? { sessionId: row.session_id, user: toSessionUser(row) } : undefined;
}

/** Sliding idle timeout. Writes at most once a minute per session to limit write load. */
export async function touchSession(db: Queryable, sessionId: string): Promise<void> {
  await db.query(
    `update sessions set last_seen_at = now()
      where id = $1 and last_seen_at < now() - interval '1 minute'`,
    [sessionId],
  );
}

export async function revokeSessionByTokenHash(
  db: Queryable,
  tokenHash: Buffer,
): Promise<{ sessionId: string; userId: string } | undefined> {
  const { rows } = await db.query<{ id: string; user_id: string }>(
    `update sessions set revoked_at = now()
      where token_hash = $1 and revoked_at is null
      returning id, user_id`,
    [tokenHash],
  );
  const row = rows[0];
  return row ? { sessionId: row.id, userId: row.user_id } : undefined;
}
