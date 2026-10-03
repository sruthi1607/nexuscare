import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { choiceClasses } from './Checkbox';
import { FieldError } from './Field';

export interface RadioOption<V extends string = string> {
  value: V;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps<V extends string = string> extends Omit<
  ComponentProps<'input'>,
  'type' | 'value' | 'defaultValue'
> {
  legend: ReactNode;
  options: RadioOption<V>[];
  error?: string | undefined;
  /** "cards" renders each option as a bordered, selectable tile. */
  variant?: 'plain' | 'cards';
  /** Controlled value; omit when using react-hook-form's register(). */
  value?: V;
  hideLegend?: boolean;
}

/**
 * Accessible radio group (fieldset + legend). Extra input props — including react-hook-form's
 * `register()` result — are spread onto every radio.
 */
export function RadioGroup<V extends string = string>({
  legend,
  options,
  error,
  variant = 'plain',
  value,
  hideLegend = false,
  className,
  name,
  ...inputProps
}: RadioGroupProps<V>) {
  const groupId = useId();
  const errorId = error ? `${groupId}-error` : undefined;

  return (
    <fieldset className={cn('flex flex-col gap-2', className)} aria-describedby={errorId}>
      <legend className={cn('mb-1 text-sm font-medium text-slate-800', hideLegend && 'sr-only')}>
        {legend}
      </legend>
      <div className={cn('grid gap-2', variant === 'cards' && 'sm:grid-cols-3')}>
        {options.map((option) => {
          const optionId = `${groupId}-${option.value}`;
          const descriptionId = option.description ? `${optionId}-description` : undefined;
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                'flex cursor-pointer items-start gap-3 text-sm',
                variant === 'cards' &&
                  'rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:border-slate-300 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50/60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-600/30',
                option.disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              <input
                id={optionId}
                type="radio"
                name={name}
                value={option.value}
                disabled={option.disabled}
                aria-describedby={descriptionId}
                className={choiceClasses}
                {...(value === undefined ? {} : { checked: value === option.value })}
                {...inputProps}
              />
              <span>
                <span className="block font-medium text-slate-800">{option.label}</span>
                {option.description ? (
                  <span id={descriptionId} className="block text-slate-500">
                    {option.description}
                  </span>
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
