import { useId, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/cn';

/** Props a Field hands to its control so label, hint and error are wired up accessibly. */
export interface FieldControlProps {
  id: string;
  'aria-describedby': string | undefined;
  'aria-invalid': boolean | undefined;
  'aria-required': boolean | undefined;
}

export interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | undefined;
  required?: boolean;
  /** Visually hide the label (still announced by screen readers). */
  hideLabel?: boolean;
  className?: string;
  children: ReactNode | ((control: FieldControlProps) => ReactNode);
}

export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="flex items-center gap-1.5 text-sm text-danger-700">
      <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

/**
 * Label + control + hint + error. The control is rendered via a render prop so it receives the
 * generated id and aria attributes, e.g. `<Field label="Email">{(p) => <Input {...p} />}</Field>`,
 * or directly as JSX children `<Field label="Email"><Input /></Field>`.
 */
export function Field({
  label,
  hint,
  error,
  required = false,
  hideLabel = false,
  className,
  children,
}: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={id}
        className={cn('text-sm font-medium text-slate-800', hideLabel && 'sr-only')}
      >
        {label}
        {required ? (
          <span className="ml-0.5 text-danger-700" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {typeof children === 'function'
        ? children({
            id,
            'aria-describedby': describedBy,
            'aria-invalid': error ? true : undefined,
            'aria-required': required || undefined,
          })
        : children}
      {hint ? (
        <p id={hintId} className="text-sm text-slate-500">
          {hint}
        </p>
      ) : null}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}

