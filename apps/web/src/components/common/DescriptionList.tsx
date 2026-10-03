import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface DescriptionItem {
  label: string;
  value: ReactNode;
  /** Span both columns on wide screens (long values such as addresses). */
  wide?: boolean;
}

function isEmpty(value: ReactNode): boolean {
  return value === null || value === undefined || value === '' || value === false;
}

/** Read-only label/value pairs; missing values show a muted "Not provided". */
export function DescriptionList({
  items,
  className,
}: {
  items: DescriptionItem[];
  className?: string;
}) {
  return (
    <dl className={cn('grid gap-x-6 gap-y-4 sm:grid-cols-2', className)}>
      {items.map((item) => (
        <div key={item.label} className={cn('min-w-0', item.wide && 'sm:col-span-2')}>
          <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
            {item.label}
          </dt>
          <dd className="mt-1 text-sm break-words text-slate-900">
            {isEmpty(item.value) ? (
              <span className="text-slate-400 italic">Not provided</span>
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
