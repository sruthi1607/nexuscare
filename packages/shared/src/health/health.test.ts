import { describe, expect, it } from 'vitest';
import { apiErrorBodySchema, apiSuccessSchema } from '../api/envelope.js';
import { healthReportSchema } from './health.js';

const validReport = {
  status: 'ok',
  service: 'nexuscare-api',
  version: '0.1.0',
  environment: 'development',
  timestamp: '2026-10-03T10:00:00.000Z',
  uptimeSeconds: 12,
  checks: {
    database: { status: 'up', latencyMs: 1.2, serverVersion: 'PostgreSQL 18.0', error: null },
  },
};

describe('healthReportSchema', () => {
  it('accepts a valid report inside a success envelope', () => {
    const parsed = apiSuccessSchema(healthReportSchema).parse({ data: validReport });
    expect(parsed.data.checks.database.status).toBe('up');
  });

  it('rejects unknown statuses and malformed timestamps', () => {
    expect(healthReportSchema.safeParse({ ...validReport, status: 'fine' }).success).toBe(false);
    expect(healthReportSchema.safeParse({ ...validReport, timestamp: 'yesterday' }).success).toBe(
      false,
    );
  });
});

describe('apiErrorBodySchema', () => {
  it('accepts the standard error envelope', () => {
    const parsed = apiErrorBodySchema.parse({
      error: { code: 'NOT_FOUND', message: 'Missing', requestId: 'abc' },
    });
    expect(parsed.error.code).toBe('NOT_FOUND');
  });

  it('rejects bodies without an error object', () => {
    expect(apiErrorBodySchema.safeParse({ message: 'nope' }).success).toBe(false);
  });
});
