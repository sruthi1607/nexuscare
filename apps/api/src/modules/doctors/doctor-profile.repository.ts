import type { z } from 'zod';
import type {
  Availability,
  ConsultationMode,
  Currency,
  DoctorProfile,
  DoctorVerification,
  LanguageCode,
  Specialty,
  availabilityUpdateSchema,
  doctorProfileUpdateSchema,
} from '@nexuscare/shared';
import type { Queryable } from '../../lib/database.js';
import { AppError } from '../../lib/errors.js';
import { syncList } from '../../lib/sync-list.js';

type ProfileUpdate = z.output<typeof doctorProfileUpdateSchema>;

export async function listSpecialties(db: Queryable): Promise<Specialty[]> {
  const { rows } = await db.query<Specialty>(
    'select id, name, slug from specialties order by name',
  );
  return rows;
}

export async function findDoctorProfile(
  db: Queryable,
  doctorId: string,
): Promise<DoctorProfile | undefined> {
  const { rows } = await db.query<{
    verification_status: DoctorVerification;
    registration_number: string | null;
    registration_council: string | null;
    years_experience: number | null;
    consultation_modes: ConsultationMode[];
    languages: LanguageCode[];
    clinic_name: string | null;
    clinic_address: string | null;
    clinic_city: string | null;
    consultation_fee: string | null;
    fee_currency: Currency | null;
    bio: string | null;
    accepts_new_patients: boolean;
    slot_minutes: number;
  }>(
    `select verification_status, registration_number, registration_council, years_experience,
            consultation_modes::text[] as consultation_modes, languages, clinic_name,
            clinic_address, clinic_city, consultation_fee::text, fee_currency, bio,
            accepts_new_patients, slot_minutes
       from doctors where user_id = $1`,
    [doctorId],
  );
  const row = rows[0];
  if (!row) return undefined;

  const [specialties, qualifications] = await Promise.all([
    db.query<Specialty>(
      `select s.id, s.name, s.slug from doctor_specialties ds
         join specialties s on s.id = ds.specialty_id
        where ds.doctor_id = $1 order by s.name`,
      [doctorId],
    ),
    db.query<{ id: string; degree: string; institution: string; year: number | null }>(
      `select id, degree, institution, year from doctor_qualifications
        where doctor_id = $1 order by year desc nulls last, created_at`,
      [doctorId],
    ),
  ]);

  return {
    doctorId,
    verificationStatus: row.verification_status,
    registrationNumber: row.registration_number,
    registrationCouncil: row.registration_council,
    specialties: specialties.rows,
    qualifications: qualifications.rows,
    yearsExperience: row.years_experience,
    consultationModes: row.consultation_modes,
    languages: row.languages,
    clinicName: row.clinic_name,
    clinicAddress: row.clinic_address,
    clinicCity: row.clinic_city,
    consultationFee: row.consultation_fee === null ? null : Number(row.consultation_fee),
    feeCurrency: row.fee_currency,
    bio: row.bio,
    acceptsNewPatients: row.accepts_new_patients,
    slotMinutes: row.slot_minutes,
  };
}

/**
 * Saves the professional profile. Registration details are locked once verified — changing them
 * would invalidate the verification, so it must go through support (later: admin workflow).
 */
export async function updateDoctorProfile(
  tx: Queryable,
  doctorId: string,
  input: ProfileUpdate,
): Promise<void> {
  const current = await tx.query<{
    verification_status: DoctorVerification;
    registration_number: string | null;
    registration_council: string | null;
  }>(
    `select verification_status, registration_number, registration_council
       from doctors where user_id = $1 for update`,
    [doctorId],
  );
  const doctor = current.rows[0];
  if (!doctor) throw new AppError(404, 'NOT_FOUND', 'Doctor record not found.');
  const registrationChanged =
    doctor.registration_number !== input.registrationNumber ||
    doctor.registration_council !== input.registrationCouncil;
  if (doctor.verification_status === 'verified' && registrationChanged) {
    throw new AppError(
      409,
      'VALIDATION_FAILED',
      'Your registration details are verified and cannot be changed here. Please contact support.',
    );
  }

  const known = await tx.query<{ id: string }>(
    'select id from specialties where id = any($1::uuid[])',
    [input.specialtyIds],
  );
  if (known.rows.length !== new Set(input.specialtyIds).size) {
    throw new AppError(400, 'VALIDATION_FAILED', 'One of the selected specialties does not exist.');
  }

  await tx.query(
    `update doctors
        set registration_number = $2, registration_council = $3, years_experience = $4,
            consultation_modes = $5::consultation_mode[], languages = $6, clinic_name = $7,
            clinic_address = $8, clinic_city = $9, consultation_fee = $10, fee_currency = $11,
            bio = $12, accepts_new_patients = $13, profile_updated_at = now()
      where user_id = $1`,
    [
      doctorId,
      input.registrationNumber,
      input.registrationCouncil,
      input.yearsExperience,
      [...new Set(input.consultationModes)],
      [...new Set(input.languages)],
      input.clinicName,
      input.clinicAddress,
      input.clinicCity,
      input.consultationFee,
      input.feeCurrency,
      input.bio,
      input.acceptsNewPatients,
    ],
  );

  await tx.query('delete from doctor_specialties where doctor_id = $1', [doctorId]);
  await tx.query(
    `insert into doctor_specialties (doctor_id, specialty_id)
     select $1, unnest($2::uuid[]) on conflict do nothing`,
    [doctorId, input.specialtyIds],
  );

  await syncList(
    tx,
    {
      table: 'doctor_qualifications',
      ownerColumn: 'doctor_id',
      columns: (q: ProfileUpdate['qualifications'][number]) => ({
        degree: q.degree,
        institution: q.institution,
        year: q.year,
      }),
    },
    doctorId,
    input.qualifications,
  );
}

export async function findAvailability(db: Queryable, doctorId: string): Promise<Availability> {
  const [settings, rules] = await Promise.all([
    db.query<{ timezone: string; slot_minutes: number }>(
      `select p.timezone, d.slot_minutes from doctors d
         join profiles p on p.user_id = d.user_id where d.user_id = $1`,
      [doctorId],
    ),
    db.query<{ weekday: number; start_time: string; end_time: string }>(
      `select weekday, to_char(start_time, 'HH24:MI') as start_time,
              to_char(end_time, 'HH24:MI') as end_time
         from doctor_availability_rules where doctor_id = $1 order by weekday, start_time`,
      [doctorId],
    ),
  ]);
  const row = settings.rows[0];
  if (!row) throw new AppError(404, 'NOT_FOUND', 'Doctor record not found.');
  return {
    timezone: row.timezone,
    slotMinutes: row.slot_minutes,
    rules: rules.rows.map((r) => ({
      weekday: r.weekday,
      startTime: r.start_time,
      endTime: r.end_time,
    })),
  };
}

/**
 * Replaces the weekly schedule. Appointments do not exist yet; once they do, this must report
 * booked appointments that fall outside the new hours (docs/01 DOC-5) instead of hiding them.
 */
export async function replaceAvailability(
  tx: Queryable,
  doctorId: string,
  input: z.output<typeof availabilityUpdateSchema>,
): Promise<void> {
  await tx.query('update doctors set slot_minutes = $2 where user_id = $1', [
    doctorId,
    input.slotMinutes,
  ]);
  await tx.query('delete from doctor_availability_rules where doctor_id = $1', [doctorId]);
  for (const rule of input.rules) {
    await tx.query(
      `insert into doctor_availability_rules (doctor_id, weekday, start_time, end_time)
       values ($1, $2, $3, $4)`,
      [doctorId, rule.weekday, rule.startTime, rule.endTime],
    );
  }
}
