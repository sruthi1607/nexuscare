import { AVATAR_MAX_BYTES, AVATAR_MIME_TYPES } from '@nexuscare/shared';

/** Checks type and size in the browser for instant feedback; the server re-validates everything. */
export function validateAvatarFile(file: File): string | null {
  if (!(AVATAR_MIME_TYPES as readonly string[]).includes(file.type)) {
    return 'Choose a JPEG, PNG or WebP image.';
  }
  if (file.size > AVATAR_MAX_BYTES) return 'Images must be 2 MB or smaller.';
  return null;
}
