import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import {
  adminOverviewSchema,
  apiErrorBodySchema,
  apiSuccessSchema,
  authResponseSchema,
  sessionResponseSchema,
} from '@nexuscare/shared';
import { hashSessionToken } from '../src/modules/auth/session-token.js';
import {
  TEST_ORIGIN,
  TEST_PASSWORD,
  buildTestApp,
  connectTestDatabase,
  createAdminAgent,
  registerAgent,
  registrationBody,
  uniqueEmail,
} from './helpers.js';

const db = connectTestDatabase();
const app = buildTestApp(db, { lockout: { maxFailedAttempts: 3, lockMinutes: 15 } });

afterAll(async () => {
  await db.close();
});

const errorCode = (body: unknown) => apiErrorBodySchema.parse(body).error.code;

function sessionCookie(res: request.Response): string {
  const header = res.headers['set-cookie'] as unknown as string[] | undefined;
  const cookie = header?.find((c) => c.startsWith('nc_session='));
  if (!cookie) throw new Error('No session cookie set');
  return cookie;
}

function tokenFrom(cookie: string): string {
  return cookie.split(';')[0]!.split('=')[1]!;
}

async function getSessionUser(agent: request.Agent) {
  const res = await agent.get('/api/v1/auth/session').expect(200);
  return apiSuccessSchema(sessionResponseSchema).parse(res.body).data.user;
}

describe('1. patient registration', () => {
  it('creates the user, profile and patient record and signs the user in', async () => {
    const body = registrationBody('patient', {
      email: `  New.Patient-${String(Date.now())}@Test.Example `,
    });
    const res = await request(app).post('/api/v1/auth/register').send(body).expect(201);

    const { user } = apiSuccessSchema(authResponseSchema).parse(res.body).data;
    expect(user).toMatchObject({
      role: 'patient',
      fullName: 'Test patient',
      status: 'active',
      doctorVerification: null,
    });
    expect(user.email).toBe(body.email.trim().toLowerCase());

    const cookie = sessionCookie(res);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(cookie).toMatch(/Path=\//);

    const { rows } = await db.query<{ password_hash: string; has_patient: boolean }>(
      `select u.password_hash, exists(select 1 from patients where user_id = u.id) as has_patient
         from users u where u.id = $1`,
      [user.id],
    );
    expect(rows[0]?.has_patient).toBe(true);
    expect(rows[0]?.password_hash).toMatch(/^\$argon2id\$/);
    expect(rows[0]?.password_hash).not.toContain(TEST_PASSWORD);
  });

  it('stores only a hash of the session token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(registrationBody('patient'))
      .expect(201);
    const token = tokenFrom(sessionCookie(res));
    const { rows } = await db.query<{ n: number }>(
      'select count(*)::int as n from sessions where token_hash = $1',
      [hashSessionToken(token)],
    );
    expect(rows[0]?.n).toBe(1);
    const raw = await db.query<{ n: number }>(
      "select count(*)::int as n from sessions where encode(token_hash, 'escape') = $1",
      [token],
    );
    expect(raw.rows[0]?.n).toBe(0);
  });

  it('rejects a duplicate email regardless of case', async () => {
    const body = registrationBody('patient');
    await request(app).post('/api/v1/auth/register').send(body).expect(201);
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...body, email: body.email.toUpperCase() })
      .expect(409);
    expect(errorCode(res.body)).toBe('EMAIL_TAKEN');
  });

  it('never allows self-registration as admin', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(registrationBody('patient', { role: 'admin' }))
      .expect(400);
    expect(errorCode(res.body)).toBe('VALIDATION_FAILED');
  });

  it('enforces the password policy and terms acceptance on the server', async () => {
    for (const overrides of [{ password: 'short1' }, { acceptTerms: false }]) {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(registrationBody('patient', overrides))
        .expect(400);
      expect(errorCode(res.body)).toBe('VALIDATION_FAILED');
    }
  });

  it('creates a family (caregiver) account with no patient or doctor record', async () => {
    const { user } = await registerAgent(app, 'caregiver');
    const { rows } = await db.query<{ p: boolean; d: boolean }>(
      `select exists(select 1 from patients where user_id = $1) as p,
              exists(select 1 from doctors where user_id = $1) as d`,
      [user.id],
    );
    expect(rows[0]).toEqual({ p: false, d: false });
  });
});

describe('2. patient login', () => {
  it('logs in with correct credentials and returns the role', async () => {
    const body = registrationBody('patient');
    await request(app).post('/api/v1/auth/register').send(body).expect(201);

    const agent = request.agent(app);
    const res = await agent
      .post('/api/v1/auth/login')
      .send({ email: body.email.toUpperCase(), password: TEST_PASSWORD })
      .expect(200);
    expect(apiSuccessSchema(authResponseSchema).parse(res.body).data.user.role).toBe('patient');
    expect((await getSessionUser(agent))?.email).toBe(body.email);
  });

  it('gives the same answer for a wrong password and an unknown email', async () => {
    const body = registrationBody('patient');
    await request(app).post('/api/v1/auth/register').send(body).expect(201);

    const wrong = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: body.email, password: 'wrongpassword1' })
      .expect(401);
    const unknown = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: uniqueEmail('ghost'), password: 'wrongpassword1' })
      .expect(401);
    expect(wrong.body).toMatchObject({ error: { code: 'INVALID_CREDENTIALS' } });
    expect((unknown.body as { error: { message: string } }).error.message).toBe(
      (wrong.body as { error: { message: string } }).error.message,
    );
    expect(wrong.headers['set-cookie']).toBeUndefined();
  });

  it('locks the account after repeated failures without revealing it', async () => {
    const body = registrationBody('patient');
    await request(app).post('/api/v1/auth/register').send(body).expect(201);
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: body.email, password: 'wrongpassword1' })
        .expect(401);
    }
    // Even the correct password is refused while locked, with the same generic error.
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: body.email, password: TEST_PASSWORD })
      .expect(401);
    expect(errorCode(res.body)).toBe('INVALID_CREDENTIALS');
  });

  it('refuses suspended accounts after verifying the password', async () => {
    const { email, user } = await registerAgent(app, 'patient');
    await db.query("update users set status = 'suspended' where id = $1", [user.id]);
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: TEST_PASSWORD })
      .expect(403);
    expect(errorCode(res.body)).toBe('ACCOUNT_SUSPENDED');
  });

  it('records security events in the audit log without secrets', async () => {
    const { user } = await registerAgent(app, 'patient');
    const { rows } = await db.query<{ action: string; metadata: unknown }>(
      'select action, metadata from audit_logs where actor_id = $1',
      [user.id],
    );
    expect(rows.map((r) => r.action)).toContain('auth.registered');
    expect(JSON.stringify(rows)).not.toContain(TEST_PASSWORD);
  });
});

describe('3. patient logout', () => {
  it('revokes the session server-side and clears the cookie', async () => {
    const { agent } = await registerAgent(app, 'patient');
    expect(await getSessionUser(agent)).not.toBeNull();

    const res = await agent.post('/api/v1/auth/logout').set('Origin', TEST_ORIGIN).expect(204);
    expect(res.headers['set-cookie']?.[0]).toMatch(/nc_session=;/);
    expect(await getSessionUser(agent)).toBeNull();
    await agent.get('/api/v1/me').expect(401);
  });

  it('cannot be undone by replaying the old cookie', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(registrationBody('patient'))
      .expect(201);
    const cookie = sessionCookie(res).split(';')[0]!;
    await request(app).post('/api/v1/auth/logout').set('Cookie', cookie).expect(204);
    await request(app).get('/api/v1/me').set('Cookie', cookie).expect(401);
  });

  it('is safe to call when not signed in', async () => {
    await request(app).post('/api/v1/auth/logout').expect(204);
  });
});

describe('4. doctor login', () => {
  it('signs in a doctor whose verification is pending', async () => {
    const body = registrationBody('doctor');
    await request(app).post('/api/v1/auth/register').send(body).expect(201);

    const agent = request.agent(app);
    const res = await agent
      .post('/api/v1/auth/login')
      .send({ email: body.email, password: TEST_PASSWORD })
      .expect(200);
    expect(apiSuccessSchema(authResponseSchema).parse(res.body).data.user).toMatchObject({
      role: 'doctor',
      doctorVerification: 'pending',
    });
  });
});

describe('5. admin login', () => {
  it('signs in a provisioned admin who can read the admin overview', async () => {
    const { agent } = await createAdminAgent(app, db);
    expect((await getSessionUser(agent))?.role).toBe('admin');

    const res = await agent.get('/api/v1/admin/overview').expect(200);
    const overview = apiSuccessSchema(adminOverviewSchema).parse(res.body).data;
    expect(overview.usersByRole.admin).toBeGreaterThanOrEqual(1);
    expect(overview.totalUsers).toBeGreaterThanOrEqual(overview.usersByRole.admin);
  });
});

describe('6–7. unauthorized access', () => {
  it('returns 401 for protected endpoints without a session', async () => {
    for (const path of ['/api/v1/me', '/api/v1/admin/overview']) {
      const res = await request(app).get(path).expect(401);
      expect(errorCode(res.body)).toBe('UNAUTHENTICATED');
    }
  });

  it.each(['patient', 'doctor', 'caregiver'] as const)(
    'returns 403 when a %s calls an admin endpoint',
    async (role) => {
      const { agent } = await registerAgent(app, role);
      const res = await agent.get('/api/v1/admin/overview').expect(403);
      expect(errorCode(res.body)).toBe('FORBIDDEN');
    },
  );

  it('treats a forged or tampered cookie as signed out and clears it', async () => {
    const forged = await request(app)
      .get('/api/v1/me')
      .set('Cookie', 'nc_session=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
      .expect(401);
    expect(forged.headers['set-cookie']?.[0]).toMatch(/nc_session=;/);
    await request(app).get('/api/v1/me').set('Cookie', 'nc_session=not-a-token').expect(401);
  });

  it('blocks state-changing requests from untrusted origins (CSRF defence)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .set('Origin', 'https://evil.example')
      .send({ email: uniqueEmail(), password: TEST_PASSWORD })
      .expect(403);
    expect(errorCode(res.body)).toBe('FORBIDDEN');

    await request(app).post('/api/v1/auth/logout').set('Sec-Fetch-Site', 'cross-site').expect(403);
  });

  it('suspending a user ends their existing sessions immediately', async () => {
    const { agent, user } = await registerAgent(app, 'patient');
    await agent.get('/api/v1/me').expect(200);
    await db.query("update users set status = 'suspended' where id = $1", [user.id]);
    await agent.get('/api/v1/me').expect(401);
  });
});

describe('8. session persistence', () => {
  it('keeps the user signed in across requests via the cookie', async () => {
    const { agent, user } = await registerAgent(app, 'patient');
    for (let i = 0; i < 3; i++) {
      expect((await getSessionUser(agent))?.id).toBe(user.id);
    }
    const me = await agent.get('/api/v1/me').expect(200);
    expect(apiSuccessSchema(authResponseSchema).parse(me.body).data.user.id).toBe(user.id);
  });

  it('sets a persistent cookie that survives a browser restart', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(registrationBody('patient'))
      .expect(201);
    expect(sessionCookie(res)).toMatch(/Expires=/);
  });

  it('expires sessions after the idle timeout', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(registrationBody('patient'))
      .expect(201);
    const cookie = sessionCookie(res).split(';')[0]!;
    await db.query(
      `update sessions set last_seen_at = now() - interval '31 minutes' where token_hash = $1`,
      [hashSessionToken(tokenFrom(cookie))],
    );
    await request(app).get('/api/v1/me').set('Cookie', cookie).expect(401);
  });

  it('expires sessions at the absolute lifetime even when active', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(registrationBody('patient'))
      .expect(201);
    const cookie = sessionCookie(res).split(';')[0]!;
    await db.query(
      `update sessions set expires_at = now() - interval '1 second' where token_hash = $1`,
      [hashSessionToken(tokenFrom(cookie))],
    );
    await request(app).get('/api/v1/me').set('Cookie', cookie).expect(401);
  });

  it('rotates the session on login so the previous token stops working', async () => {
    const body = registrationBody('patient');
    const first = await request(app).post('/api/v1/auth/register').send(body).expect(201);
    const oldCookie = sessionCookie(first).split(';')[0]!;

    const second = await request(app)
      .post('/api/v1/auth/login')
      .set('Cookie', oldCookie)
      .send({ email: body.email, password: TEST_PASSWORD })
      .expect(200);
    const newCookie = sessionCookie(second).split(';')[0]!;

    expect(newCookie).not.toBe(oldCookie);
    await request(app).get('/api/v1/me').set('Cookie', oldCookie).expect(401);
    await request(app).get('/api/v1/me').set('Cookie', newCookie).expect(200);
  });
});

describe('rate limiting', () => {
  it('throttles repeated sign-in attempts per IP', async () => {
    const limited = buildTestApp(db, { authAttemptsPerWindow: 2 });
    const attempt = () =>
      request(limited)
        .post('/api/v1/auth/login')
        .send({ email: uniqueEmail(), password: 'wrongpassword1' });
    await attempt().expect(401);
    await attempt().expect(401);
    const res = await attempt().expect(429);
    expect(errorCode(res.body)).toBe('RATE_LIMITED');
  });
});
