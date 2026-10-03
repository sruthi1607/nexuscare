import { describe, expect, it } from 'vitest';
import { hashPassword, verifyAgainstDummy, verifyPassword } from './password.js';
import { generateSessionToken, hashSessionToken, isWellFormedToken } from './session-token.js';

describe('password hashing', () => {
  it('produces Argon2id hashes with OWASP parameters and verifies them', async () => {
    const hash = await hashPassword('correcthorse42');
    expect(hash).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
    expect(await verifyPassword(hash, 'correcthorse42')).toBe(true);
    expect(await verifyPassword(hash, 'correcthorse43')).toBe(false);
  });

  it('uses a unique salt per hash', async () => {
    expect(await hashPassword('same-password1')).not.toBe(await hashPassword('same-password1'));
  });

  it('never authenticates against a malformed stored hash', async () => {
    expect(await verifyPassword('not-a-hash', 'anything')).toBe(false);
  });

  it('runs the dummy verification without throwing', async () => {
    await expect(verifyAgainstDummy('whatever')).resolves.toBeUndefined();
  });
});

describe('session tokens', () => {
  it('generates 256-bit URL-safe tokens that are unique', () => {
    const a = generateSessionToken();
    expect(isWellFormedToken(a)).toBe(true);
    expect(a).not.toBe(generateSessionToken());
  });

  it('hashes deterministically to 32 bytes', () => {
    const token = generateSessionToken();
    expect(hashSessionToken(token)).toEqual(hashSessionToken(token));
    expect(hashSessionToken(token)).toHaveLength(32);
  });

  it('rejects malformed tokens', () => {
    expect(isWellFormedToken('short')).toBe(false);
    expect(isWellFormedToken(`${'a'.repeat(42)}!`)).toBe(false);
  });
});
