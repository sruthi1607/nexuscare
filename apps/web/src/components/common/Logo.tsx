import { cn } from '../../lib/cn';

export interface LogoProps {
  className?: string;
  /** White wordmark for dark backgrounds. */
  inverted?: boolean;
}

export function Logo({ className, inverted = false }: LogoProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-semibold',
        inverted ? 'text-white' : 'text-slate-900',
        className,
      )}
    >
      <svg viewBox="0 0 32 32" className="size-7 shrink-0" aria-hidden="true">
        <rect
          width="32"
          height="32"
          rx="8"
          className={inverted ? 'fill-white' : 'fill-brand-700'}
        />
        <path
          d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z"
          className={inverted ? 'fill-brand-800' : 'fill-white'}
        />
      </svg>
      <span className="text-lg tracking-tight">Nexus Care</span>
    </span>
  );
}
