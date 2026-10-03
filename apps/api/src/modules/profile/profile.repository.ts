import type { AccountStatus, AppRole, Profile, ProfileUpdate, Sex } from '@nexuscare/shared';
import type { Queryable } from '../../lib/database.js';
import { avatarUrl } from '../auth/auth.repository.js';

interface ProfileRow {
  user_id: string;
  email: string;
  role: AppRole;
  status: AccountStatus;
  full_name: string;
  phone: string | null;
  date_of_birth: string | null;
  sex: Sex | null;
  preferred_language: string;
  timezone: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  country: string | null;
  avatar_updated_at: Date | null;
  created_at: Date;
}

function toProfile(row: ProfileRow): Profile {
  return {
    userId: row.user_id,
    email: row.email,
    role: row.role,
    status: row.status,
    fullName: row.full_name,
    phone: row.phone,
    dateOfBirth: row.date_of_birth,
    sex: row.sex,
    preferredLanguage: row.preferred_language as Profile['preferredLanguage'],
    timezone: row.timezone,
    address: {
      line1: row.address_line1,
      line2: row.address_line2,
      city: row.city,
      region: row.region,
      postalCode: row.postal_code,
      country: row.country,
    },
    avatarUrl: avatarUrl(row.avatar_updated_at),
    memberSince: row.created_at.toISOString(),
  };
}

export async function findProfile(db: Queryable, userId: string): Promise<Profile | undefined> {
  const { rows } = await db.query<ProfileRow>(
    `select p.user_id, u.email::text as email, u.role, u.status, p.full_name, p.phone,
            to_char(p.date_of_birth, 'YYYY-MM-DD') as date_of_birth, p.sex, p.preferred_language,
            p.timezone, p.address_line1, p.address_line2, p.city, p.region, p.postal_code,
            p.country, p.avatar_updated_at, u.created_at
       from profiles p join users u on u.id = p.user_id
      where p.user_id = $1`,
    [userId],
  );
  return rows[0] ? toProfile(rows[0]) : undefined;
}

export async function updateProfile(
  db: Queryable,
  userId: string,
  input: ProfileUpdate,
): Promise<void> {
  await db.query(
    `update profiles
        set full_name = $2, phone = $3, date_of_birth = $4, sex = $5, preferred_language = $6,
            timezone = $7, address_line1 = $8, address_line2 = $9, city = $10, region = $11,
            postal_code = $12, country = $13
      where user_id = $1`,
    [
      userId,
      input.fullName,
      input.phone,
      input.dateOfBirth,
      input.sex,
      input.preferredLanguage,
      input.timezone,
      input.address.line1,
      input.address.line2,
      input.address.city,
      input.address.region,
      input.address.postalCode,
      input.address.country,
    ],
  );
}
