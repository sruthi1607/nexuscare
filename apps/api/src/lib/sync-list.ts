import type { Queryable } from './database.js';
import { AppError } from './errors.js';

/**
 * Describes a child table edited as a whole list (allergies, conditions, qualifications …).
 * Table and column names come from code, never from requests.
 */
export interface ListTable<Item> {
  table: string;
  /** Foreign-key column scoping rows to their owner, e.g. "patient_id". */
  ownerColumn: string;
  /** Column → value for each editable field. */
  columns: (item: Item) => Record<string, unknown>;
  /**
   * Extra SQL predicate limiting which rows this editor may touch (e.g. only self-reported
   * medications, so prescribed ones are never deleted from the medical-profile editor).
   */
  scope?: string;
}

const IDENTIFIER = /^[a-z_][a-z0-9_]*$/;
function ident(name: string): string {
  if (!IDENTIFIER.test(name)) throw new Error(`Unsafe SQL identifier: ${name}`);
  return name;
}

/**
 * Makes the stored list match `items` inside the caller's transaction:
 * items with an `id` are updated (and must belong to the owner), items without one are inserted,
 * and rows missing from the list are deleted. Stable ids let other modules reference rows.
 */
export async function syncList<Item extends { id?: string | undefined }>(
  tx: Queryable,
  spec: ListTable<Item>,
  ownerId: string,
  items: Item[],
): Promise<void> {
  const table = ident(spec.table);
  const owner = ident(spec.ownerColumn);
  const scope = spec.scope ? ` and (${spec.scope})` : '';

  const keptIds = items.map((item) => item.id).filter((id): id is string => id !== undefined);
  if (new Set(keptIds).size !== keptIds.length) {
    throw new AppError(400, 'VALIDATION_FAILED', 'The same item appears more than once.');
  }

  await tx.query(
    `delete from ${table} where ${owner} = $1${scope} and not (id = any($2::uuid[]))`,
    [ownerId, keptIds],
  );

  for (const item of items) {
    const values = spec.columns(item);
    const names = Object.keys(values).map(ident);
    const params = Object.values(values);

    if (item.id) {
      const assignments = names.map((name, i) => `${name} = $${String(i + 3)}`).join(', ');
      const result = await tx.query(
        `update ${table} set ${assignments} where id = $1 and ${owner} = $2${scope}`,
        [item.id, ownerId, ...params],
      );
      if (result.rowCount !== 1) {
        // Unknown id or one belonging to someone else — never reveal which.
        throw new AppError(
          400,
          'VALIDATION_FAILED',
          'One of the items no longer exists. Reload and try again.',
        );
      }
    } else {
      const placeholders = names.map((_, i) => `$${String(i + 2)}`).join(', ');
      await tx.query(
        `insert into ${table} (${owner}, ${names.join(', ')}) values ($1, ${placeholders})`,
        [ownerId, ...params],
      );
    }
  }
}
