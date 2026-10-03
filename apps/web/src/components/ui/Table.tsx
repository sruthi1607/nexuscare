import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface TableProps extends ComponentProps<'table'> {
  /** Accessible caption; visually hidden unless showCaption is set. */
  caption?: ReactNode;
  showCaption?: boolean;
}

/** Table that scrolls horizontally inside its frame on narrow screens instead of breaking layout. */
export function Table({ caption, showCaption = false, className, children, ...props }: TableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
      <table className={cn('w-full border-collapse text-left text-sm', className)} {...props}>
        {caption ? (
          <caption
            className={
              showCaption
                ? 'border-b border-slate-100 px-4 py-3 text-left font-semibold text-slate-900'
                : 'sr-only'
            }
          >
            {caption}
          </caption>
        ) : null}
        {children}
      </table>
    </div>
  );
}

export function TableHead({ className, ...props }: ComponentProps<'thead'>) {
  return <thead className={cn('bg-slate-50', className)} {...props} />;
}

export function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return <tbody className={cn('divide-y divide-slate-100', className)} {...props} />;
}

export function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return <tr className={cn('transition-colors hover:bg-slate-50/70', className)} {...props} />;
}

export function TableHeaderCell({ className, scope = 'col', ...props }: ComponentProps<'th'>) {
  return (
    <th
      scope={scope}
      className={cn(
        'px-4 py-3 text-xs font-semibold tracking-wide whitespace-nowrap text-slate-600 uppercase',
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return <td className={cn('px-4 py-3 align-middle text-slate-700', className)} {...props} />;
}
