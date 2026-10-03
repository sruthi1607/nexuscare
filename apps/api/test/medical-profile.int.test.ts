import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { apiErrorBodySchema, apiSuccessSchema, medicalProfileSchema } from '@nexuscare/shared';
import { buildTestApp, connectTestDatabase, createAdminAgent, registerAgent } from './helpers.js';

const db = connectTestDatabase();
const app = buildTestApp(db);
const BASE = '/api/v1/patients/me/medical-profile';

afterAll(async () => {
  await db.close();
});

const parse = (body: unknown) => apiSuccessSchema(medicalProfileSchema).parse(body).data;
const errorCode = (body: unknown) => apiErrorBodySchema.parse(body).error.code;

describe('patient medical profile', () => {
  it('starts empty for a new patient', async () => {
    const { agent, user } = await registerAgent(app, 'patient');
    const profile = parse((await agent.get(BASE).expect(200)).body);
    expect(profile).toMatchObject({
      patientId: user.id,
      basics: { bloodGroup: null, heightCm: null, weightKg: null },
      emergencyContact: { name: null, phone: null },
      allergies: [],
      conditions: [],
      medications: [],
      history: [],
      updatedAt: null,
    });
  });

  it('saves basics and emergency contact', async () => {
    const { agent } = await registerAgent(app, 'patient');
    await agent
      .put(`${BASE}/basics`)
      .send({ bloodGroup: 'O+', heightCm: 162.5, weightKg: 58 })
      .expect(200);
    const res = await agent
      .put(`${BASE}/emergency-contact`)
      .send({ name: 'Ravi Kumar', relationship: 'Husband', phone: '+91 91234 56789' })
      .expect(200);
    const profile = parse(res.body);
    expect(profile.basics).toEqual({ bloodGroup: 'O+', heightCm: 162.5, weightKg: 58 });
    expect(profile.emergencyContact).toEqual({
      name: 'Ravi Kumar',
      relationship: 'Husband',
      phone: '+91 91234 56789',
    });
    expect(profile.updatedAt).not.toBeNull();
  });

  it('adds, updates and removes list items while keeping ids stable', async () => {
    const { agent } = await registerAgent(app, 'patient');
    const first = parse(
      (
        await agent
          .put(`${BASE}/allergies`)
          .send({
            items: [
              { substance: 'Penicillin', reaction: 'Rash', severity: 'moderate' },
              { substance: 'Peanuts', reaction: '', severity: 'severe' },
            ],
          })
          .expect(200)
      ).body,
    );
    expect(first.allergies).toHaveLength(2);
    const penicillin = first.allergies.find((a) => a.substance === 'Penicillin')!;
    expect(first.allergies.find((a) => a.substance === 'Peanuts')?.reaction).toBeNull();

    const second = parse(
      (
        await agent
          .put(`${BASE}/allergies`)
          .send({
            items: [
              { id: penicillin.id, substance: 'Penicillin', reaction: 'Hives', severity: 'severe' },
              { substance: 'Latex', reaction: null, severity: 'unknown' },
            ],
          })
          .expect(200)
      ).body,
    );
    expect(second.allergies.map((a) => a.substance).sort()).toEqual(['Latex', 'Penicillin']);
    expect(second.allergies.find((a) => a.id === penicillin.id)).toMatchObject({
      reaction: 'Hives',
      severity: 'severe',
    });
  });

  it('saves conditions, medications and history', async () => {
    const { agent } = await registerAgent(app, 'patient');
    await agent
      .put(`${BASE}/conditions`)
      .send({ items: [{ name: 'Type 2 diabetes', status: 'managed', sinceYear: 2019, notes: '' }] })
      .expect(200);
    await agent
      .put(`${BASE}/medications`)
      .send({
        items: [
          {
            name: 'Metformin',
            dose: '500 mg',
            frequency: 'Twice daily',
            notes: null,
            startedOn: '2019-06-01',
            status: 'active',
          },
        ],
      })
      .expect(200);
    const res = await agent
      .put(`${BASE}/history`)
      .send({
        items: [{ kind: 'surgery', description: 'Appendectomy', year: 2010, notes: null }],
      })
      .expect(200);
    const profile = parse(res.body);
    expect(profile.conditions[0]).toMatchObject({ name: 'Type 2 diabetes', sinceYear: 2019 });
    expect(profile.medications[0]).toMatchObject({
      name: 'Metformin',
      source: 'self_reported',
      status: 'active',
      startedOn: '2019-06-01',
    });
    expect(profile.history[0]).toMatchObject({ kind: 'surgery', year: 2010 });
  });

  it('never deletes prescribed medicines when the patient edits their own list', async () => {
    const { agent, user } = await registerAgent(app, 'patient');
    await db.query(
      `insert into medications (patient_id, name, source) values ($1, 'Amoxicillin', 'prescribed')`,
      [user.id],
    );
    const res = await agent.put(`${BASE}/medications`).send({ items: [] }).expect(200);
    expect(parse(res.body).medications.map((m) => m.name)).toEqual(['Amoxicillin']);
  });

  it('cannot touch another patient’s items by id', async () => {
    const alice = await registerAgent(app, 'patient');
    const bob = await registerAgent(app, 'patient');
    const aliceProfile = parse(
      (
        await alice.agent
          .put(`${BASE}/conditions`)
          .send({ items: [{ name: 'Asthma', status: 'active', sinceYear: null, notes: null }] })
          .expect(200)
      ).body,
    );
    const aliceConditionId = aliceProfile.conditions[0]!.id;

    const res = await bob.agent
      .put(`${BASE}/conditions`)
      .send({
        items: [
          {
            id: aliceConditionId,
            name: 'Hijacked',
            status: 'resolved',
            sinceYear: null,
            notes: null,
          },
        ],
      })
      .expect(400);
    expect(errorCode(res.body)).toBe('VALIDATION_FAILED');

    const after = parse((await alice.agent.get(BASE).expect(200)).body);
    expect(after.conditions[0]).toMatchObject({ id: aliceConditionId, name: 'Asthma' });
  });

  it('validates every section on the server', async () => {
    const { agent } = await registerAgent(app, 'patient');
    const cases: [string, object][] = [
      ['basics', { bloodGroup: 'Z+', heightCm: null, weightKg: null }],
      ['basics', { bloodGroup: null, heightCm: 900, weightKg: null }],
      ['emergency-contact', { name: 'Only a name', relationship: null, phone: null }],
      ['allergies', { items: [{ substance: '', reaction: null, severity: 'mild' }] }],
      ['conditions', { items: [{ name: 'X', status: 'active', sinceYear: 3000, notes: null }] }],
      ['history', { items: [{ kind: 'magic', description: 'x', year: null, notes: null }] }],
      [
        'allergies',
        {
          items: Array.from({ length: 51 }, () => ({
            substance: 'x',
            reaction: null,
            severity: 'mild',
          })),
        },
      ],
    ];
    for (const [section, body] of cases) {
      const res = await agent.put(`${BASE}/${section}`).send(body).expect(400);
      expect(errorCode(res.body)).toBe('VALIDATION_FAILED');
    }
  });

  it('is patient-only: other roles get 403, anonymous 401', async () => {
    await request(app).get(BASE).expect(401);
    for (const role of ['doctor', 'caregiver'] as const) {
      const { agent } = await registerAgent(app, role);
      await agent.get(BASE).expect(403);
      await agent
        .put(`${BASE}/basics`)
        .send({ bloodGroup: 'A+', heightCm: null, weightKg: null })
        .expect(403);
    }
    const { agent: admin } = await createAdminAgent(app, db);
    await admin.get(BASE).expect(403);
  });

  it('audits updates by section without storing values', async () => {
    const { agent, user } = await registerAgent(app, 'patient');
    await agent
      .put(`${BASE}/allergies`)
      .send({ items: [{ substance: 'Sulfa drugs', reaction: null, severity: 'mild' }] })
      .expect(200);
    const { rows } = await db.query<{ metadata: unknown }>(
      `select metadata from audit_logs where actor_id = $1 and action = 'medical_profile.updated'`,
      [user.id],
    );
    expect(rows).toEqual([{ metadata: { section: 'allergies' } }]);
    expect(JSON.stringify(rows)).not.toContain('Sulfa');
  });
});
