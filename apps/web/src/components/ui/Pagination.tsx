import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';
import { getPageItems } from './pagination-items';

export interface PaginationProps {
  /** 1-based current page. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const itemClasses =
  'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors';
const stepClasses = cn(
  itemClasses,
  'gap-1 text-slate-700 hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-40',
);

export function Pagination({ page, pageCount, onPageChange, className }: PaginationProps) {
  if (pageCount <= 1) return null;
  const items = getPageItems(page, pageCount);

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-between gap-2 sm:justify-center', className)}
    >
      <p className="text-sm text-slate-600 sm:hidden" aria-live="polite">
        Page {page} of {pageCount}
      </p>
      <ul className="flex items-center gap-1">
        <li>
          <button
            type="button"
            className={stepClasses}
            onClick={() => {
              onPageChange(page - 1);
            }}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Previous</span>
          </button>
        </li>
        {items.map((item, index) =>
          item === 'ellipsis' ? (
            <li
              key={`ellipsis-${String(index)}`}
              className="hidden px-1 text-slate-400 sm:block"
              aria-hidden="true"
            >
              …
            </li>
          ) : (
            <li key={item} className="hidden sm:block">
              <button
                type="button"
                className={cn(
                  itemClasses,
                  item === page ? 'bg-brand-700 text-white' : 'text-slate-700 hover:bg-slate-100',
                )}
                onClick={() => {
                  onPageChange(item);
                }}
                aria-label={`Page ${String(item)}`}
                aria-current={item === page ? 'page' : undefined}
              >
                {item}
              </button>
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            className={stepClasses}
            onClick={() => {
              onPageChange(page + 1);
            }}
            disabled={page >= pageCount}
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
