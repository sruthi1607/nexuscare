import { useState } from 'react';
import { cn } from '../../lib/cn';
import { initials } from '../../lib/names';

const sizes = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-16 text-lg',
  xl: 'size-24 text-2xl',
} as const;

export interface AvatarProps {
  name: string;
  src?: string | null | undefined;
  size?: keyof typeof sizes;
  className?: string;
}

/** Profile picture with an initials fallback (also used if the image fails to load). */
export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-700 font-semibold text-white ring-2 ring-white',
        sizes[size],
        className,
      )}
    >
      {showImage ? (
        <img
          src={src ?? undefined}
          alt=""
          className="size-full object-cover"
          onError={() => {
            setFailedSrc(src ?? null);
          }}
        />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </span>
  );
}
