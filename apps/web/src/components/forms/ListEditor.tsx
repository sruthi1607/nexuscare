import { useState } from 'react';
import { useFieldArray, useForm, type FieldErrors, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { ApiError } from '../../lib/api-client';
import { cn } from '../../lib/cn';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Field, FieldError } from '../ui/Field';
import { Input, Textarea } from '../ui/Input';
import { Select } from '../ui/Select';

export type ListFieldKind = 'text' | 'textarea' | 'select' | 'year' | 'date';

export interface ListField {
  name: string;
  label: string;
  kind: ListFieldKind;
  options?: readonly { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  hint?: string;
  /** Take the full row width. */
  wide?: boolean;
}

/** Form-side value of one list item. `id` is present for items that already exist. */
export type ListItemValues = Record<string, string | number | null | undefined> & { id?: string };

interface FormShape extends FieldValues {
  items: ListItemValues[];
}

export interface ListEditorProps {
  /** Singular noun used in buttons and messages, e.g. "allergy". */
  itemLabel: string;
  fields: ListField[];
  /** Zod schema of `{ items: [...] }` — the same one the API validates with. */
  schema: z.ZodType<unknown, FormShape>;
  initialItems: ListItemValues[];
  emptyItem: ListItemValues;
  maxItems: number;
  /** Receives the validated, normalised items. Throw (ApiError) to show a server error. */
  onSave: (items: unknown[]) => Promise<void>;
  onCancel: () => void;
}

const yearOrNull = (value: unknown) =>
  value === '' || value === null || value === undefined ? null : Number(value);

function fieldError(errors: FieldErrors<FormShape>, index: number, name: string) {
  const itemErrors = errors.items?.[index] as
    | Record<string, { message?: string } | undefined>
    | undefined;
  return itemErrors?.[name]?.message;
}

/**
 * Edits a list of structured items (allergies, conditions, medicines, qualifications …) from a
 * field configuration. Items keep their ids so the server updates rather than recreates them.
 */
export function ListEditor({
  itemLabel,
  fields,
  schema,
  initialItems,
  emptyItem,
  maxItems,
  onSave,
  onCancel,
}: ListEditorProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormShape, unknown, { items: unknown[] }>({
    resolver: zodResolver(schema) as never,
    defaultValues: { items: initialItems },
  });
  // keyName avoids clashing with the items' own database `id`.
  const list = useFieldArray({ control, name: 'items', keyName: 'rowKey' });

  const submit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await onSave(values.items);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'Could not save. Please try again.');
    }
  });

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="space-y-4">
      {serverError ? (
        <Alert tone="danger" title="Not saved">
          {serverError}
        </Alert>
      ) : null}
      {errors.items?.message ? <FieldError>{errors.items.message}</FieldError> : null}

      {list.fields.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
          No {itemLabel} entries. Use “Add {itemLabel}” to add one.
        </p>
      ) : null}

      <ol className="space-y-3">
        {list.fields.map((row, index) => (
          <li key={row.rowKey} className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                {itemLabel} {index + 1}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  list.remove(index);
                }}
                aria-label={`Remove ${itemLabel} ${String(index + 1)}`}
              >
                <Trash2 aria-hidden="true" />
                <span className="hidden sm:inline">Remove</span>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => {
                const name = `items.${String(index)}.${field.name}` as const;
                const error = fieldError(errors, index, field.name);
                return (
                  <Field
                    key={field.name}
                    label={field.label}
                    required={field.required}
                    hint={field.hint}
                    error={error}
                    className={cn(field.wide && 'sm:col-span-2')}
                  >
                    {(p) => {
                      switch (field.kind) {
                        case 'select':
                          return (
                            <Select options={field.options ?? []} {...p} {...register(name)} />
                          );
                        case 'textarea':
                          return (
                            <Textarea
                              rows={2}
                              placeholder={field.placeholder}
                              {...p}
                              {...register(name)}
                            />
                          );
                        case 'year':
                          return (
                            <Input
                              type="number"
                              inputMode="numeric"
                              min={1900}
                              max={new Date().getFullYear()}
                              placeholder={field.placeholder ?? 'YYYY'}
                              {...p}
                              {...register(name, { setValueAs: yearOrNull })}
                            />
                          );
                        case 'date':
                          return (
                            <Input
                              type="date"
                              max={new Date().toISOString().slice(0, 10)}
                              {...p}
                              {...register(name)}
                            />
                          );
                        default:
                          return (
                            <Input placeholder={field.placeholder} {...p} {...register(name)} />
                          );
                      }
                    }}
                  </Field>
                );
              })}
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="secondary"
          onClick={() => {
            list.append({ ...emptyItem });
          }}
          disabled={list.fields.length >= maxItems}
        >
          <Plus aria-hidden="true" />
          Add {itemLabel}
        </Button>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Save changes
          </Button>
        </div>
      </div>
    </form>
  );
}
