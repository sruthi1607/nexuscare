import { describe, expect, it } from 'vitest';
import { EnvValidationError, loadEnv } from '../src/config/env.js';

const base = { DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/nexuscare' };

describe('loadEnv', () => {
  it('applies safe defaults', () => {
    const env = loadEnv(base);
    expect(env).toMatchObject({
      NODE_ENV: 'development',
      PORT: 4000,
      LOG_LEVEL: 'info',
      CORS_ORIGINS: ['http://localhost:5173'],
      DATABASE_SSL_MODE: 'verify-full',
    });
    expect(env.DATABASE_SSL_CA_FILE).toBeUndefined();
  });

  it('treats a blank DATABASE_SSL_CA_FILE as unset', () => {
    expect(loadEnv({ ...base, DATABASE_SSL_CA_FILE: '  ' }).DATABASE_SSL_CA_FILE).toBeUndefined();
  });

  it('parses comma-separated CORS origins and coerces the port', () => {
    const env = loadEnv({
      ...base,
      PORT: '8080',
      CORS_ORIGINS: 'http://localhost:5173, https://app.nexuscare.example',
    });
    expect(env.PORT).toBe(8080);
    expect(env.CORS_ORIGINS).toEqual(['http://localhost:5173', 'https://app.nexuscare.example']);
  });

  it('fails fast when DATABASE_URL is missing', () => {
    expect(() => loadEnv({})).toThrow(EnvValidationError);
    expect(() => loadEnv({})).toThrow(/DATABASE_URL/);
  });

  it('reports an empty DATABASE_URL once, as required', () => {
    try {
      loadEnv({ DATABASE_URL: '' });
      expect.unreachable();
    } catch (error) {
      expect((error as EnvValidationError).issues).toEqual([
        'DATABASE_URL: DATABASE_URL is required',
      ]);
    }
  });

  it('rejects non-postgres connection strings and invalid values without echoing them', () => {
    try {
      loadEnv({ DATABASE_URL: 'mysql://root:topsecret@db/app', PORT: 'abc' });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);
      const message = (error as Error).message;
      expect(message).toMatch(/DATABASE_URL/);
      expect(message).toMatch(/PORT/);
      expect(message).not.toContain('topsecret');
    }
  });

  it('rejects invalid CORS origins', () => {
    expect(() => loadEnv({ ...base, CORS_ORIGINS: 'not-a-url' })).toThrow(/CORS_ORIGINS/);
  });
});
