import { describe, expect, it } from 'vitest';
import { buildSslConfig } from './database.js';

describe('buildSslConfig', () => {
  it('disables SSL only when explicitly requested', () => {
    expect(buildSslConfig('disable', undefined)).toBe(false);
  });

  it('encrypts without verification in require mode', () => {
    expect(buildSslConfig('require', undefined)).toEqual({ rejectUnauthorized: false });
  });

  it('verifies certificates in verify-full mode', () => {
    expect(buildSslConfig('verify-full', undefined)).toEqual({ rejectUnauthorized: true });
  });
});
