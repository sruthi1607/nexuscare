import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  apiErrorBodySchema,
  apiSuccessSchema,
  availabilitySchema,
  doctorProfileGaps,
  doctorProfileSchema,
  specialtySchema,
} from '@nexuscare/shared';
import { buildTestApp, connectTestDatabase, registerAgent } from './helpers.js';

const db = connectTestDatabase();
const app = buildTestApp(db);

afterAll(async () => {
  await db.close();
});

const parseProfile = (body: unknown) => apiSuccessSchema(doctorProfileSchema).parse(body).data;
const parseAvailability = (body: unknown) => apiSuccessSchema(availabilitySchema).parse(body).data;
const errorCode = (body: unknown) => apiErrorBodySchema.parse(body).error.code;

async function specialtyIds(): Promise<string[]> {
  const res = await request(app).get('/api/v1/specialties').expect(200);
  return apiSuccessSchema(z.array(specialtySchema))
    .parse(res.body)
    .data.map((s) => s.id);
}

async function validProfile() {
  const [first, second] = await specialtyIds();
  return {
    registrationNumber: 'MMC-2011-04567',
    registrationCouncil: 'Maharashtra Medical Council',
    specialtyIds: [first!, second!],
    qualifications: [
      { degree: 'MBBS', institution: 'Grant Medical College', year: 2010 },
      { degree: 'MD (General Medicine)', institution: 'KEM Hospital', year: 2014 },
    ],
    yearsExperience: 12,
    consultationModes: ['video', 'audio'],
    languages: ['en', 'hi', 'mr'],
    clinicName: null,
    clinicAddress: null,
    clinicCity: 'Nashik',
    consultationFee: 300,
    feeCurrency: 'INR',
    bio: 'General physician focused on chronic disease care in rural communities.',
    acceptsNewPatients: true,
  };
}

describe('specialties', () => {
  it('lists the reference specialties publicly', async () => {
    const ids = await specialtyIds();
    expect(ids.length).toBeGreaterThanOrEqual(20);
  });
});

describe('doctor professional profile', () => {
  it('starts incomplete and becomes complete once filled in', async () => {
    const { agent } = await registerAgent(app, 'doctor');
    const empty = parseProfile((await agent.get('/api/v1/doctors/me/profile').expect(200)).body);
    expect(empty).toMatchObject({ verificationStatus: 'pending', specialties: [], languages: [] });
    expect(doctorProfileGaps(empty, false).length).toBeGreaterThan(5);

    const saved = parseProfile(
      (
        await agent
          .put('/api/v1/doctors/me/profile')
          .send(await validProfile())
          .expect(200)
      ).body,
    );
    expect(saved).toMatchObject({
      registrationNumber: 'MMC-2011-04567',
      yearsExperience: 12,
      consultationModes: ['video', 'audio'],
      languages: ['en', 'hi', 'mr'],
      consultationFee: 300,
      feeCurrency: 'INR',
      clinicName: null,
    });
    expect(saved.specialties).toHaveLength(2);
    expect(saved.qualifications.map((q) => q.degree)).toEqual(['MD (General Medicine)', 'MBBS']);
    expect(doctorProfileGaps(saved, true)).toEqual([]);
  });

  it('requires a clinic for in-person consultations and validates fields', async () => {
    const { agent } = await registerAgent(app, 'doctor');
    const base = await validProfile();
    const cases = [
      { ...base, consultationModes: ['in_person'], clinicName: null },
      { ...base, specialtyIds: [] },
      { ...base, qualifications: [] },
      { ...base, languages: [] },
      { ...base, consultationFee: -1 },
      { ...base, specialtyIds: ['00000000-0000-4000-8000-000000000000'] },
    ];
    for (const body of cases) {
      const res = await agent.put('/api/v1/doctors/me/profile').send(body).expect(400);
      expect(errorCode(res.body)).toBe('VALIDATION_FAILED');
    }
  });

  it('locks registration details once verified', async () => {
    const { agent, user } = await registerAgent(app, 'doctor');
    const profile = await validProfile();
    await agent.put('/api/v1/doctors/me/profile').send(profile).expect(200);
    await db.query(`update doctors set verification_status = 'verified' where user_id = $1`, [
      user.id,
    ]);

    // Other fields stay editable…
    await agent
      .put('/api/v1/doctors/me/profile')
      .send({ ...profile, consultationFee: 350 })
      .expect(200);
    // …but the verified registration cannot be changed.
    await agent
      .put('/api/v1/doctors/me/profile')
      .send({ ...profile, registrationNumber: 'OTHER-1' })
      .expect(409);
  });

  it('is doctor-only', async () => {
    await request(app).get('/api/v1/doctors/me/profile').expect(401);
    const { agent } = await registerAgent(app, 'patient');
    await agent.get('/api/v1/doctors/me/profile').expect(403);
    await agent
      .put('/api/v1/doctors/me/availability')
      .send({ slotMinutes: 20, rules: [] })
      .expect(403);
  });
});

describe('doctor availability', () => {
  it('saves a weekly schedule in the doctor’s time zone', async () => {
    const { agent } = await registerAgent(app, 'doctor');
    const empty = parseAvailability(
      (await agent.get('/api/v1/doctors/me/availability').expect(200)).body,
    );
    expect(empty).toEqual({ timezone: 'UTC', slotMinutes: 20, rules: [] });

    const saved = parseAvailability(
      (
        await agent
          .put('/api/v1/doctors/me/availability')
          .send({
            slotMinutes: 30,
            rules: [
              { weekday: 1, startTime: '09:00', endTime: '13:00' },
              { weekday: 1, startTime: '17:00', endTime: '19:00' },
              { weekday: 3, startTime: '10:00', endTime: '12:30' },
            ],
          })
          .expect(200)
      ).body,
    );
    expect(saved.slotMinutes).toBe(30);
    expect(saved.rules).toEqual([
      { weekday: 1, startTime: '09:00', endTime: '13:00' },
      { weekday: 1, startTime: '17:00', endTime: '19:00' },
      { weekday: 3, startTime: '10:00', endTime: '12:30' },
    ]);
  });

  it.each([
    ['end before start', [{ weekday: 2, startTime: '12:00', endTime: '09:00' }]],
    [
      'overlapping ranges',
      [
        { weekday: 2, startTime: '09:00', endTime: '12:00' },
        { weekday: 2, startTime: '11:00', endTime: '14:00' },
      ],
    ],
    ['range shorter than a slot', [{ weekday: 2, startTime: '09:00', endTime: '09:10' }]],
    ['invalid time', [{ weekday: 2, startTime: '25:00', endTime: '26:00' }]],
    ['invalid weekday', [{ weekday: 7, startTime: '09:00', endTime: '10:00' }]],
  ])('rejects %s', async (_label, rules) => {
    const { agent } = await registerAgent(app, 'doctor');
    const res = await agent
      .put('/api/v1/doctors/me/availability')
      .send({ slotMinutes: 20, rules })
      .expect(400);
    expect(errorCode(res.body)).toBe('VALIDATION_FAILED');
  });
});
