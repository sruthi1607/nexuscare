import type { ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { DialogOverlay } from './Dialog';

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accessible title (visually hidden unless showTitle). */
  title: string;
  showTitle?: boolean;
  side?: 'left' | 'right';
  children: ReactNode;
  className?: string;
}

/** Slide-in panel for mobile navigation and side drawers. A dialog under the hood. */
export function Sheet({
  open,
  onOpenChange,
  title,
  showTitle = false,
  side = 'left',
  children,
  className,
}: SheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogOverlay />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            'fixed inset-y-0 z-50 flex w-[min(20rem,85vw)] flex-col bg-white shadow-overlay focus:outline-none',
            side === 'left'
              ? 'left-0 data-[state=open]:animate-slide-in-left'
              : 'right-0 data-[state=open]:animate-slide-in-right',
            className,
          )}
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-4">
            <DialogPrimitive.Title
              className={showTitle ? 'font-semibold text-slate-900' : 'sr-only'}
            >
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              className="ml-auto rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close menu"
            >
              <X className="size-5" aria-hidden="true" />
            </DialogPrimitive.Close>
          </div>
          <div className="flex-1 overflow-y-auto">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
