import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { apiSuccessSchema, healthReportSchema } from '@nexuscare/shared';
import { loadMigrations, runMigrations } from '../src/db/migrate.js';
import { buildTestApp, connectTestDatabase, silentLogger } from './helpers.js';

/** Real PostgreSQL (started by test/global-setup.ts, or TEST_DATABASE_URL). */
describe('PostgreSQL integration', () => {
  const db = connectTestDatabase();

  afterAll(async () => {
    await db.close();
  });

  it('pings the database and reports it through GET /api/health', async () => {
    const ping = await db.ping();
    expect(ping.serverVersion).toMatch(/^PostgreSQL \d+/);

    const res = await request(buildTestApp(db)).get('/api/health');
    expect(res.status).toBe(200);
    const body = apiSuccessSchema(healthReportSchema).parse(res.body);
    expect(body.data.checks.database.status).toBe('up');
  });

  it('has applied every migration and re-running is a no-op', async () => {
    const files = await loadMigrations();
    const { rows } = await db.query<{ version: string }>(
      'select version from schema_migrations order by version',
    );
    expect(rows.map((r) => r.version)).toEqual(files.map((f) => f.version));
    expect(await runMigrations(db, silentLogger)).toEqual([]);
  });

  it('rolls back a failing transaction completely', async () => {
    const table = `rollback_probe_${randomUUID().replaceAll('-', '')}`;
    await expect(
      db.transaction(async (tx) => {
        await tx.query(`create table ${table} (id int)`);
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');
    const { rows } = await db.query<{ exists: boolean }>(
      'select to_regclass($1) is not null as exists',
      [`public.${table}`],
    );
    expect(rows[0]?.exists).toBe(false);
  });
});
