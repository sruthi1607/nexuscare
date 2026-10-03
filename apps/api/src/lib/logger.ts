import { pino, type Logger, type LoggerOptions } from 'pino';

/**
 * Paths that must never appear in logs. Healthcare data and credentials are redacted by default;
 * extend this list as modules add sensitive fields.
 */
export const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-device-key"]',
  'req.headers["x-internal-token"]',
  'res.headers["set-cookie"]',
  '*.password',
  '*.token',
  '*.accessToken',
  '*.refreshToken',
  '*.apiKey',
  '*.connectionString',
];

export interface CreateLoggerOptions {
  level: LoggerOptions['level'];
  pretty?: boolean;
}

export function createLogger({ level, pretty = false }: CreateLoggerOptions): Logger {
  return pino({
    level,
    base: { service: 'nexuscare-api' },
    redact: { paths: REDACT_PATHS, censor: '[REDACTED]' },
    timestamp: pino.stdTimeFunctions.isoTime,
    ...(pretty
      ? {
          transport: {
            target: 'pino-pretty',
            options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
          },
        }
      : {}),
  });
}

export type { Logger };
