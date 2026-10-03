import sharp from 'sharp';
import { AVATAR_MAX_BYTES } from '@nexuscare/shared';
import type { Queryable } from '../../lib/database.js';
import { AppError } from '../../lib/errors.js';

const AVATAR_SIZE = 256;

/** Identifies the image type from its first bytes — the client's Content-Type is not trusted. */
export function sniffImageType(buffer: Buffer): 'jpeg' | 'png' | 'webp' | undefined {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpeg';
  }
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return 'png';
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp';
  }
  return undefined;
}

/**
 * Validates and re-encodes an uploaded avatar: square 256×256 WebP with all metadata (including
 * GPS/EXIF) removed. Re-encoding also neutralises files that merely look like images.
 */
export async function processAvatar(upload: Buffer): Promise<Buffer> {
  if (upload.length === 0) {
    throw new AppError(400, 'VALIDATION_FAILED', 'The uploaded file is empty.');
  }
  if (upload.length > AVATAR_MAX_BYTES) {
    throw new AppError(413, 'PAYLOAD_TOO_LARGE', 'Images must be 2 MB or smaller.');
  }
  if (!sniffImageType(upload)) {
    throw new AppError(400, 'VALIDATION_FAILED', 'Upload a JPEG, PNG or WebP image.');
  }
  try {
    return await sharp(upload, { limitInputPixels: 40_000_000, failOn: 'error' })
      .rotate() // apply EXIF orientation before metadata is dropped
      .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: 'cover', position: 'attention' })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    throw new AppError(400, 'VALIDATION_FAILED', 'The image could not be read. Try another file.');
  }
}

/**
 * Avatar persistence. Stored in PostgreSQL for the prototype (no object storage available); the
 * interface lets a Supabase Storage / S3 implementation replace it without touching routes.
 */
export interface AvatarStore {
  get(userId: string): Promise<{ data: Buffer; mimeType: string; updatedAt: Date } | undefined>;
  put(tx: Queryable, userId: string, data: Buffer): Promise<Date>;
  remove(tx: Queryable, userId: string): Promise<boolean>;
}

export function createDbAvatarStore(db: Queryable): AvatarStore {
  return {
    async get(userId) {
      const { rows } = await db.query<{ data: Buffer; mime_type: string; updated_at: Date }>(
        'select data, mime_type, updated_at from user_avatars where user_id = $1',
        [userId],
      );
      const row = rows[0];
      return row
        ? { data: row.data, mimeType: row.mime_type, updatedAt: row.updated_at }
        : undefined;
    },
    async put(tx, userId, data) {
      const { rows } = await tx.query<{ updated_at: Date }>(
        `insert into user_avatars (user_id, mime_type, data, byte_size)
         values ($1, 'image/webp', $2, $3)
         on conflict (user_id) do update
           set data = excluded.data, byte_size = excluded.byte_size, updated_at = now()
         returning updated_at`,
        [userId, data, data.length],
      );
      const updatedAt = rows[0]?.updated_at ?? new Date();
      await tx.query('update profiles set avatar_updated_at = $2 where user_id = $1', [
        userId,
        updatedAt,
      ]);
      return updatedAt;
    },
    async remove(tx, userId) {
      const result = await tx.query('delete from user_avatars where user_id = $1', [userId]);
      await tx.query('update profiles set avatar_updated_at = null where user_id = $1', [userId]);
      return (result.rowCount ?? 0) > 0;
    },
  };
}
