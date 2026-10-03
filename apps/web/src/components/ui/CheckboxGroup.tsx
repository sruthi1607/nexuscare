import { useId, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { choiceClasses } from './Checkbox';
import { FieldError } from './Field';

export interface CheckboxGroupOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
}

export interface CheckboxGroupProps {
  legend: ReactNode;
  hint?: ReactNode;
  options: readonly CheckboxGroupOption[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string | undefined;
  required?: boolean;
  /** Grid columns on wider screens. */
  columns?: 1 | 2 | 3 | 4;
  /** Limit how many can be chosen (others are disabled once reached). */
  max?: number;
}

const columnClasses = {
  1: '',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
} as const;

/** Multi-select as an accessible group of checkboxes (controlled; use with RHF's Controller). */
export function CheckboxGroup({
  legend,
  hint,
  options,
  value,
  onChange,
  error,
  required = false,
  columns = 2,
  max,
}: CheckboxGroupProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const atMax = max !== undefined && value.length >= max;

  const toggle = (optionValue: string, checked: boolean) => {
    onChange(checked ? [...value, optionValue] : value.filter((v) => v !== optionValue));
  };

  return (
    <fieldset
      aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
      aria-invalid={error ? true : undefined}
      className="flex flex-col gap-2"
    >
      <legend className="mb-1 text-sm font-medium text-slate-800">
        {legend}
        {required ? (
          <span className="ml-0.5 text-danger-700" aria-hidden="true">
            *
          </span>
        ) : null}
      </legend>
      {hint ? (
        <p id={hintId} className="-mt-1 text-sm text-slate-500">
          {hint}
        </p>
      ) : null}
      <div className={cn('grid gap-2', columnClasses[columns])}>
        {options.map((option) => {
          const optionId = `${id}-${option.value}`;
          const checked = value.includes(option.value);
          const disabled = !checked && atMax;
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm transition-colors hover:border-slate-300 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50/60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-600/30',
                disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              <input
                id={optionId}
                type="checkbox"
                className={cn(choiceClasses, 'rounded')}
                checked={checked}
                disabled={disabled}
                onChange={(event) => {
                  toggle(option.value, event.target.checked);
                }}
              />
              <span>
                <span className="block font-medium text-slate-800">{option.label}</span>
                {option.description ? (
                  <span className="block text-slate-500">{option.description}</span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </fieldset>
  );
}
