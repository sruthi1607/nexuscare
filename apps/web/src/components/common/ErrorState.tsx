import { AlertTriangle, RotateCw } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from '../ui/Button';

export interface ErrorStateProps {
  title: string;
  message: string;
  requestId?: string | undefined;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}

export function ErrorState({
  title,
  message,
  requestId,
  onRetry,
  retrying,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center gap-3 rounded-xl border border-danger-700/20 bg-danger-50 px-6 py-10 text-center',
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-white text-danger-700">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </div>
      <div>
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 max-w-md text-sm text-slate-700">{message}</p>
        {requestId ? (
          <p className="mt-2 font-mono text-xs text-slate-500">Reference: {requestId}</p>
        ) : null}
      </div>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry} disabled={retrying}>
          <RotateCw className={retrying ? 'animate-spin' : undefined} aria-hidden="true" />
          {retrying ? 'Retrying…' : 'Try again'}
        </Button>
      ) : null}
    </div>
  );
}
