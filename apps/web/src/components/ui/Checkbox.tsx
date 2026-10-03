import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { FieldError } from './Field';

export const choiceClasses =
  'mt-0.5 size-4 shrink-0 cursor-pointer border-slate-400 accent-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed';

export interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type'> {
  label: ReactNode;
  description?: ReactNode;
  error?: string | undefined;
}

export function Checkbox({ label, description, error, className, id, ...props }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-start gap-3">
        <input
          id={inputId}
          type="checkbox"
          className={cn(choiceClasses, 'rounded')}
          aria-describedby={[descriptionId, errorId].filter(Boolean).join(' ') || undefined}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        <div className="text-sm">
          <label htmlFor={inputId} className="cursor-pointer font-medium text-slate-800">
            {label}
          </label>
          {description ? (
            <p id={descriptionId} className="text-slate-500">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
