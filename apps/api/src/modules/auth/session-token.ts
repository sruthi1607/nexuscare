import { createHash, randomBytes } from 'node:crypto';

/** 256 bits of randomness, URL-safe. This value lives only in the user's cookie. */
export function generateSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

/** What the database stores: SHA-256 of the token (fast lookup; useless if leaked). */
export function hashSessionToken(token: string): Buffer {
  return createHash('sha256').update(token, 'utf8').digest();
}

/** Rejects obviously malformed cookie values before touching the database. */
export function isWellFormedToken(token: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/.test(token);
}
