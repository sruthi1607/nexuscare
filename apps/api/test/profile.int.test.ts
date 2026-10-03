import request from 'supertest';
import sharp from 'sharp';
import { afterAll, describe, expect, it } from 'vitest';
import {
  apiErrorBodySchema,
  apiSuccessSchema,
  profileSchema,
  sessionResponseSchema,
} from '@nexuscare/shared';
import { buildTestApp, connectTestDatabase, createAdminAgent, registerAgent } from './helpers.js';

const db = connectTestDatabase();
const app = buildTestApp(db);

afterAll(async () => {
  await db.close();
});

const parseProfile = (body: unknown) => apiSuccessSchema(profileSchema).parse(body).data;
const errorCode = (body: unknown) => apiErrorBodySchema.parse(body).error.code;

const validUpdate = {
  fullName: 'Asha Kumari',
  phone: '+91 98765 43210',
  dateOfBirth: '1988-04-12',
  sex: 'female',
  preferredLanguage: 'hi',
  timezone: 'Asia/Kolkata',
  address: {
    line1: '12 Station Road',
    line2: '',
    city: 'Nashik',
    region: 'Maharashtra',
    postalCode: '422001',
    country: 'India',
  },
};

describe('own profile (all roles)', () => {
  it.each(['patient', 'doctor', 'caregiver'] as const)(
    'a %s can read and update their profile',
    async (role) => {
      const { agent, email } = await registerAgent(app, role);
      const initial = parseProfile((await agent.get('/api/v1/me/profile').expect(200)).body);
      expect(initial).toMatchObject({ email, role, phone: null, avatarUrl: null });

      const updated = parseProfile(
        (await agent.put('/api/v1/me/profile').send(validUpdate).expect(200)).body,
      );
      expect(updated).toMatchObject({
        fullName: 'Asha Kumari',
        phone: '+91 98765 43210',
        dateOfBirth: '1988-04-12',
        sex: 'female',
        preferredLanguage: 'hi',
        timezone: 'Asia/Kolkata',
        address: { line1: '12 Station Road', line2: null, city: 'Nashik' },
      });

      // The session (used by the top bar) reflects the new name immediately.
      const session = await agent.get('/api/v1/auth/session').expect(200);
      expect(apiSuccessSchema(sessionResponseSchema).parse(session.body).data.user?.fullName).toBe(
        'Asha Kumari',
      );
    },
  );

  it('works for admins too', async () => {
    const { agent } = await createAdminAgent(app, db);
    await agent.put('/api/v1/me/profile').send(validUpdate).expect(200);
  });

  it('validates input on the server', async () => {
    const { agent } = await registerAgent(app, 'patient');
    for (const bad of [
      { ...validUpdate, phone: 'call me' },
      { ...validUpdate, dateOfBirth: '2999-01-01' },
      { ...validUpdate, timezone: 'Mars/Olympus' },
      { ...validUpdate, preferredLanguage: 'xx' },
      { ...validUpdate, fullName: 'A' },
    ]) {
      const res = await agent.put('/api/v1/me/profile').send(bad).expect(400);
      expect(errorCode(res.body)).toBe('VALIDATION_FAILED');
    }
  });

  it('ignores attempts to change email or role through the profile', async () => {
    const { agent, email } = await registerAgent(app, 'patient');
    const res = await agent
      .put('/api/v1/me/profile')
      .send({ ...validUpdate, email: 'hijack@example.com', role: 'admin' })
      .expect(200);
    expect(parseProfile(res.body)).toMatchObject({ email, role: 'patient' });
  });

  it('requires a session', async () => {
    await request(app).get('/api/v1/me/profile').expect(401);
    await request(app).put('/api/v1/me/profile').send(validUpdate).expect(401);
  });
});

describe('avatar', () => {
  async function photoWithGps(): Promise<Buffer> {
    return sharp({ create: { width: 640, height: 480, channels: 3, background: '#0f766e' } })
      .withExif({ IFD0: { Copyright: 'GPS 19.99N 73.78E' } })
      .jpeg()
      .toBuffer();
  }

  it('re-encodes uploads to a 256px WebP without metadata and serves it only to the owner', async () => {
    const { agent } = await registerAgent(app, 'patient');
    const res = await agent
      .put('/api/v1/me/avatar')
      .set('Content-Type', 'image/jpeg')
      .send(await photoWithGps())
      .expect(200);
    const url = parseProfile(res.body).avatarUrl;
    expect(url).toMatch(/^\/api\/v1\/me\/avatar\?v=\d+$/);

    const image = await agent.get(url!).buffer(true).expect(200);
    expect(image.headers['content-type']).toBe('image/webp');
    const meta = await sharp(image.body as Buffer).metadata();
    expect(meta).toMatchObject({ format: 'webp', width: 256, height: 256 });
    expect(meta.exif).toBeUndefined();

    const session = await agent.get('/api/v1/auth/session');
    expect(apiSuccessSchema(sessionResponseSchema).parse(session.body).data.user?.avatarUrl).toBe(
      url,
    );
    await request(app).get('/api/v1/me/avatar').expect(401);
  });

  it('rejects non-images even when labelled as images', async () => {
    const { agent } = await registerAgent(app, 'patient');
    const res = await agent
      .put('/api/v1/me/avatar')
      .set('Content-Type', 'image/png')
      .send(Buffer.from('<script>alert(1)</script>'))
      .expect(400);
    expect(errorCode(res.body)).toBe('VALIDATION_FAILED');

    await agent
      .put('/api/v1/me/avatar')
      .set('Content-Type', 'text/plain')
      .send('hello')
      .expect(400);
  });

  it('rejects files over 2 MB', async () => {
    const { agent } = await registerAgent(app, 'patient');
    const big = Buffer.alloc(2 * 1024 * 1024 + 10, 0xff);
    const res = await agent
      .put('/api/v1/me/avatar')
      .set('Content-Type', 'image/jpeg')
      .send(big)
      .expect(413);
    expect(errorCode(res.body)).toBe('PAYLOAD_TOO_LARGE');
  });

  it('removes the avatar', async () => {
    const { agent } = await registerAgent(app, 'doctor');
    await agent
      .put('/api/v1/me/avatar')
      .set('Content-Type', 'image/jpeg')
      .send(await photoWithGps())
      .expect(200);
    const res = await agent.delete('/api/v1/me/avatar').expect(200);
    expect(parseProfile(res.body).avatarUrl).toBeNull();
    await agent.get('/api/v1/me/avatar').expect(404);
  });
});
