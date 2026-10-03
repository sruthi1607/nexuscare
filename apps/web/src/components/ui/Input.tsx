import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../lib/cn';

/** Shared look for text-like controls; invalid state comes from aria-invalid. */
export const controlClasses =
  'block w-full rounded-lg border border-slate-300 bg-white text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 aria-[invalid=true]:border-danger-600 aria-[invalid=true]:focus:ring-danger-600/20';

export interface InputProps extends ComponentProps<'input'> {
  /** Decorative icon shown inside the field on the left. */
  leadingIcon?: ReactNode;
}

export function Input({ className, leadingIcon, ...props }: InputProps) {
  if (!leadingIcon) {
    return <input className={cn(controlClasses, 'h-10 px-3', className)} {...props} />;
  }
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400 [&_svg]:size-4">
        {leadingIcon}
      </span>
      <input className={cn(controlClasses, 'h-10 pr-3 pl-9', className)} {...props} />
    </div>
  );
}

export function Textarea({ className, rows = 4, ...props }: ComponentProps<'textarea'>) {
  return <textarea rows={rows} className={cn(controlClasses, 'px-3 py-2', className)} {...props} />;
}
