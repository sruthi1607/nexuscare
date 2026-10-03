import { readFileSync } from 'node:fs';
import { createApp } from './app.js';
import { databaseConfigFromEnv, loadRuntimeEnv, sessionConfigFromEnv } from './config/runtime.js';
import { createDatabase } from './lib/database.js';
import { createLogger } from './lib/logger.js';

function readVersion(): string {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
    version?: string;
  };
  return pkg.version ?? '0.0.0';
}

function main(): void {
  const env = loadRuntimeEnv();
  const logger = createLogger({ level: env.LOG_LEVEL, pretty: env.NODE_ENV === 'development' });

  if (env.NODE_ENV === 'production' && !env.SESSION_COOKIE_SECURE) {
    logger.warn(
      'SESSION_COOKIE_SECURE=false in production: session cookies will be sent over HTTP',
    );
  }

  const db = createDatabase(databaseConfigFromEnv(env), logger);
  const app = createApp({
    db,
    logger,
    config: {
      environment: env.NODE_ENV,
      version: readVersion(),
      corsOrigins: env.CORS_ORIGINS,
      session: sessionConfigFromEnv(env),
    },
  });

  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, environment: env.NODE_ENV }, 'Nexus Care API listening');
  });

  let shuttingDown = false;
  const shutdown = (signal: NodeJS.Signals) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, 'Shutting down');
    const forceExit = setTimeout(() => {
      logger.error('Graceful shutdown timed out; forcing exit');
      process.exit(1);
    }, 10_000);
    forceExit.unref();

    server.close(() => {
      db.close()
        .catch((error: unknown) => {
          logger.error({ err: error }, 'Error closing database pool');
        })
        .finally(() => {
          process.exit(0);
        });
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('unhandledRejection', (reason) => {
    logger.error({ err: reason }, 'Unhandled promise rejection');
  });
}

main();
