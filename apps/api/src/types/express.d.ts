import type { SessionUser } from '@nexuscare/shared';

declare global {
  namespace Express {
    interface Request {
      /** Set by the authenticate middleware when the request carries a valid session. */
      auth?: {
        sessionId: string;
        user: SessionUser;
      };
    }
  }
}

export {};
