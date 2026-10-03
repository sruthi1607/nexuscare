import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center',
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-700 [&_svg]:size-6">
        {icon ?? <Inbox aria-hidden="true" />}
      </div>
      <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
      {description ? (
        <div className="mt-1 max-w-md text-sm text-slate-600">{description}</div>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
