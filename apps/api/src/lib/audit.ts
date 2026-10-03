import type { Queryable } from './database.js';

export interface AuditEntry {
  actorId: string | null;
  /** Dotted verb, e.g. "auth.login_succeeded". */
  action: string;
  entityType?: string;
  entityId?: string;
  ipAddress?: string | undefined;
  /** Never include passwords, tokens, email addresses or health data. */
  metadata?: Record<string, unknown>;
}

/** Appends to the audit log. Pass the transaction client to keep it atomic with the change. */
export async function recordAudit(db: Queryable, entry: AuditEntry): Promise<void> {
  await db.query(
    `insert into audit_logs (actor_id, action, entity_type, entity_id, ip_address, metadata)
     values ($1, $2, $3, $4, $5::inet, $6::jsonb)`,
    [
      entry.actorId,
      entry.action,
      entry.entityType ?? null,
      entry.entityId ?? null,
      normaliseIp(entry.ipAddress),
      JSON.stringify(entry.metadata ?? {}),
    ],
  );
}

/** Express may report IPv4 clients as "::ffff:1.2.3.4"; both forms are valid inet values. */
export function normaliseIp(ip: string | undefined): string | null {
  if (!ip) return null;
  return /^[0-9a-fA-F:.]+$/.test(ip) ? ip : null;
}
