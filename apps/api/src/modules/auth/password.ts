import { hash, verify, type Algorithm } from '@node-rs/argon2';

// `Algorithm` is an ambient const enum (not importable as a value under verbatimModuleSyntax);
// 2 is Algorithm.Argon2id. password.test.ts asserts the "$argon2id$" hash prefix, so a wrong value
// fails the build.
// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment -- see comment above
const ARGON2ID = 2 as Algorithm;

/**
 * Argon2id with the OWASP Password Storage Cheat Sheet baseline (19 MiB memory, 2 iterations,
 * parallelism 1). Parameters are encoded in each hash, so they can be raised later without
 * invalidating existing passwords.
 */
const ARGON2_OPTIONS = {
  algorithm: ARGON2ID,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    // A malformed stored hash must never authenticate.
    return false;
  }
}

let dummyHash: Promise<string> | undefined;

/**
 * Burns the same amount of work as a real verification. Used when the email is unknown or the
 * account is locked so response timing does not reveal which accounts exist.
 */
export async function verifyAgainstDummy(password: string): Promise<void> {
  dummyHash ??= hashPassword('nexuscare-timing-equaliser-0');
  await verifyPassword(await dummyHash, password);
}
