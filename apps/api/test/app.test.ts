import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { apiErrorBodySchema, apiSuccessSchema, healthReportSchema } from '@nexuscare/shared';
import { buildTestApp, fakeDatabase } from './helpers.js';

describe('GET /api/health', () => {
  it('returns 200 and status ok when the database is reachable', async () => {
    const res = await request(buildTestApp()).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('no-store');
    const body = apiSuccessSchema(healthReportSchema).parse(res.body);
    expect(body.data.status).toBe('ok');
    expect(body.data.service).toBe('nexuscare-api');
    expect(body.data.checks.database).toEqual({
      status: 'up',
      latencyMs: 1.5,
      serverVersion: 'PostgreSQL 17.0',
      error: null,
    });
  });

  it('returns 503 and status degraded without leaking connection details when the database is down', async () => {
    const app = buildTestApp(
      fakeDatabase(new Error('connect ECONNREFUSED postgres://user:secret@db:5432')),
    );
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(503);
    const body = apiSuccessSchema(healthReportSchema).parse(res.body);
    expect(body.data.status).toBe('degraded');
    expect(body.data.checks.database.status).toBe('down');
    expect(body.data.checks.database.error).toBe('Database unreachable');
    expect(JSON.stringify(res.body)).not.toContain('secret');
  });
});

describe('cross-cutting middleware', () => {
  it('assigns a request id and echoes a well-formed incoming one', async () => {
    const generated = await request(buildTestApp()).get('/api/health');
    expect(generated.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);

    const echoed = await request(buildTestApp())
      .get('/api/health')
      .set('x-request-id', 'trace-abc_123');
    expect(echoed.headers['x-request-id']).toBe('trace-abc_123');
  });

  it('replaces malformed incoming request ids', async () => {
    const res = await request(buildTestApp())
      .get('/api/health')
      .set('x-request-id', 'bad id <script>');
    expect(res.headers['x-request-id']).not.toBe('bad id <script>');
  });

  it('sets security headers and hides the framework', async () => {
    const res = await request(buildTestApp()).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('allows configured CORS origins and rejects others', async () => {
    const allowed = await request(buildTestApp())
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');
    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173');

    const blocked = await request(buildTestApp())
      .get('/api/health')
      .set('Origin', 'https://evil.example');
    expect(blocked.status).toBe(403);
    expect(apiErrorBodySchema.parse(blocked.body).error.code).toBe('FORBIDDEN');
  });

  it('rate limits with a RATE_LIMITED error envelope', async () => {
    const app = buildTestApp(fakeDatabase(), { rateLimitPerMinute: 2 });
    await request(app).get('/api/health');
    await request(app).get('/api/health');
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(429);
    expect(apiErrorBodySchema.parse(res.body).error.code).toBe('RATE_LIMITED');
  });
});

describe('error handling', () => {
  it('returns a NOT_FOUND envelope with request id for unknown routes', async () => {
    const res = await request(buildTestApp()).get('/api/does-not-exist');

    expect(res.status).toBe(404);
    const body = apiErrorBodySchema.parse(res.body);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.requestId).toBe(res.headers['x-request-id']);
  });

  it('returns INVALID_JSON for malformed request bodies', async () => {
    const res = await request(buildTestApp())
      .post('/api/v1/anything')
      .set('Content-Type', 'application/json')
      .send('{"broken":');

    expect(res.status).toBe(400);
    expect(apiErrorBodySchema.parse(res.body).error.code).toBe('INVALID_JSON');
  });

  it('returns PAYLOAD_TOO_LARGE for oversized bodies', async () => {
    const res = await request(buildTestApp())
      .post('/api/v1/anything')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ blob: 'x'.repeat(1_100_000) }));

    expect(res.status).toBe(413);
    expect(apiErrorBodySchema.parse(res.body).error.code).toBe('PAYLOAD_TOO_LARGE');
  });
});
