/**
 * Provisions an administrator account. Admins can never self-register; this script is the only
 * way to create one.
 *
 * Usage:
 *   npm run admin:create -- --email admin@example.org --name "Ada Admin"
 * The password is read from NEXUSCARE_ADMIN_PASSWORD, or prompted for (input is visible in the
 * terminal, so prefer the environment variable on shared screens).
 */
import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';
import { emailSchema, fullNameSchema, newPasswordSchema } from '@nexuscare/shared';
import { databaseConfigFromEnv, loadRuntimeEnv, sessionConfigFromEnv } from '../config/runtime.js';
import { createDatabase } from '../lib/database.js';
import { AppError } from '../lib/errors.js';
import { createLogger } from '../lib/logger.js';
import { createAuthService } from '../modules/auth/auth.service.js';

const { values } = parseArgs({
  options: { email: { type: 'string' }, name: { type: 'string' } },
});

async function readPassword(): Promise<string> {
  const fromEnv = process.env.NEXUSCARE_ADMIN_PASSWORD;
  if (fromEnv) return fromEnv;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return await rl.question('Admin password: ');
  } finally {
    rl.close();
  }
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const email = emailSchema.safeParse(values.email ?? '');
if (!email.success) fail('Provide a valid --email');
const name = fullNameSchema.safeParse(values.name ?? '');
if (!name.success) fail('Provide --name (2–120 characters)');
const password = newPasswordSchema.safeParse(await readPassword());
if (!password.success) fail(`Password rejected: ${password.error.issues[0]?.message ?? 'invalid'}`);

const env = loadRuntimeEnv();
const logger = createLogger({ level: 'warn' });
const db = createDatabase(databaseConfigFromEnv(env), logger);
const auth = createAuthService({ db, logger, session: sessionConfigFromEnv(env) });

try {
  const admin = await auth.createAdmin({
    email: email.data,
    fullName: name.data,
    password: password.data,
  });
  console.warn(`Admin account created: ${admin.email} (${admin.id})`);
} catch (error) {
  if (error instanceof AppError && error.code === 'EMAIL_TAKEN') {
    console.error('An account with this email already exists.');
  } else {
    console.error('Failed to create admin:', error);
  }
  process.exitCode = 1;
} finally {
  await db.close();
}
