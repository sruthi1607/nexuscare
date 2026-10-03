import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '../../lib/cn';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

const tones: Record<AlertTone, { container: string; icon: ReactNode }> = {
  info: {
    container: 'border-info-600/25 bg-info-50 text-info-700',
    icon: <Info aria-hidden="true" />,
  },
  success: {
    container: 'border-success-600/25 bg-success-50 text-success-700',
    icon: <CheckCircle2 aria-hidden="true" />,
  },
  warning: {
    container: 'border-warning-600/30 bg-warning-50 text-warning-700',
    icon: <AlertTriangle aria-hidden="true" />,
  },
  danger: {
    container: 'border-danger-600/25 bg-danger-50 text-danger-700',
    icon: <XCircle aria-hidden="true" />,
  },
};

export interface AlertProps {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  /** Extra content such as action buttons, rendered under the message. */
  actions?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Inline, persistent message. Danger/warning alerts use role="alert" so they are announced
 * immediately; info/success use role="status".
 */
export function Alert({
  tone = 'info',
  title,
  children,
  actions,
  onDismiss,
  className,
}: AlertProps) {
  const { container, icon } = tones[tone];
  return (
    <div
      role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-lg border p-4 text-sm', container, className)}
    >
      <span className="mt-0.5 shrink-0 [&_svg]:size-5">{icon}</span>
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? (
          <div className={cn('text-slate-700', title ? 'mt-1' : undefined)}>{children}</div>
        ) : null}
        {actions ? <div className="mt-3 flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="-m-1 h-fit rounded-md p-1 opacity-70 hover:opacity-100"
          aria-label="Dismiss"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
