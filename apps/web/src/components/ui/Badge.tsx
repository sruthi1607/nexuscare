import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type BadgeTone = 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'danger';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-700/10',
  brand: 'bg-brand-50 text-brand-800 ring-brand-700/20',
  info: 'bg-info-50 text-info-700 ring-info-700/20',
  success: 'bg-success-50 text-success-700 ring-success-700/20',
  warning: 'bg-warning-50 text-warning-700 ring-warning-700/20',
  danger: 'bg-danger-50 text-danger-700 ring-danger-700/20',
};

export interface BadgeProps {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Status label. Always includes text so meaning never depends on colour alone. */
export function Badge({ tone = 'neutral', icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset [&_svg]:size-3.5',
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
