import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    globalSetup: ['test/global-setup.ts'],
    // Integration tests hash passwords (Argon2id) and hit a real database.
    testTimeout: 20_000,
    hookTimeout: 60_000,
  },
});
