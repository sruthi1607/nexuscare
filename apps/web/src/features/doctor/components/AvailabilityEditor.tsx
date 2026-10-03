import { useMemo, useState } from 'react';
import { Copy, Plus, Trash2 } from 'lucide-react';
import {
  SLOT_LENGTHS,
  WEEKDAYS,
  availabilityIssues,
  type Availability,
  type AvailabilityRule,
} from '@nexuscare/shared';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { Field } from '../../../components/ui/Field';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { ApiError } from '../../../lib/api-client';
import { cn } from '../../../lib/cn';

const MAX_RANGES_PER_DAY = 3;
// Monday first — the common convention for working weeks.
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

interface Range extends AvailabilityRule {
  key: number;
}

export interface AvailabilityEditorProps {
  availability: Availability;
  onSave: (value: { slotMinutes: number; rules: AvailabilityRule[] }) => Promise<void>;
}

/** Weekly schedule editor with live validation (same rules the API enforces). */
export function AvailabilityEditor({ availability, onSave }: AvailabilityEditorProps) {
  const [slotMinutes, setSlotMinutes] = useState(availability.slotMinutes);
  const [nextKey, setNextKey] = useState(availability.rules.length);
  const [ranges, setRanges] = useState<Range[]>(() =>
    availability.rules.map((rule, key) => ({ ...rule, key })),
  );
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const issues = useMemo(() => availabilityIssues(ranges, slotMinutes), [ranges, slotMinutes]);

  const addRange = (weekday: number) => {
    setRanges((current) => [
      ...current,
      { weekday, startTime: '09:00', endTime: '13:00', key: nextKey },
    ]);
    setNextKey((k) => k + 1);
  };

  const updateRange = (key: number, patch: Partial<AvailabilityRule>) => {
    setRanges((current) => current.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const removeRange = (key: number) => {
    setRanges((current) => current.filter((r) => r.key !== key));
  };

  const copyMondayToWeekdays = () => {
    const monday = ranges.filter((r) => r.weekday === 1);
    let key = nextKey;
    const copies = [2, 3, 4, 5].flatMap((weekday) =>
      monday.map((r) => ({ weekday, startTime: r.startTime, endTime: r.endTime, key: key++ })),
    );
    setRanges((current) => [...current.filter((r) => ![2, 3, 4, 5].includes(r.weekday)), ...copies]);
    setNextKey(key);
  };

  const save = async () => {
    if (issues.length > 0) return;
    setSaving(true);
    setServerError(null);
    try {
      await onSave({
        slotMinutes,
        rules: ranges.map(({ weekday, startTime, endTime }) => ({ weekday, startTime, endTime })),
      });
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'Could not save your schedule.');
    } finally {
      setSaving(false);
    }
  };

  const hasMonday = ranges.some((r) => r.weekday === 1);

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="flex flex-col gap-4 py-5 sm:flex-row sm:items-end sm:justify-between">
          <Field
            label="Appointment length"
            hint={`Times are in your profile time zone: ${availability.timezone.replaceAll('_', ' ')}.`}
            className="sm:max-w-xs"
          >
            {(p) => (
              <Select
                options={SLOT_LENGTHS.map((m) => ({ value: String(m), label: `${String(m)} minutes` }))}
                value={String(slotMinutes)}
                onChange={(event) => {
                  setSlotMinutes(Number(event.target.value));
                }}
                {...p}
              />
            )}
          </Field>
          <Button variant="outline" size="sm" onClick={copyMondayToWeekdays} disabled={!hasMonday}>
            <Copy aria-hidden="true" />
            Copy Monday to Tue–Fri
          </Button>
        </CardBody>
      </Card>

      <Card>
        <ul className="divide-y divide-slate-100">
          {DAY_ORDER.map((weekday) => {
            const dayRanges = ranges.filter((r) => r.weekday === weekday);
            const dayName = WEEKDAYS[weekday];
            return (
              <li key={weekday} className="grid gap-3 px-5 py-4 md:grid-cols-[9rem_1fr]">
                <div className="flex items-center justify-between md:block">
                  <p className="font-medium text-slate-900">{dayName}</p>
                  <p className="text-sm text-slate-500">
                    {dayRanges.length === 0 ? 'Unavailable' : `${String(dayRanges.length)} range(s)`}
                  </p>
                </div>
                <div className="space-y-2">
                  {dayRanges.map((range, index) => (
                    <div key={range.key} className="flex flex-wrap items-end gap-2">
                      <Field label={`${dayName} range ${String(index + 1)} start`} hideLabel>
                        {(p) => (
                          <Input
                            type="time"
                            step={300}
                            value={range.startTime}
                            onChange={(e) => {
                              updateRange(range.key, { startTime: e.target.value });
                            }}
                            className="w-32"
                            {...p}
                          />
                        )}
                      </Field>
                      <span className="pb-2 text-sm text-slate-500">to</span>
                      <Field label={`${dayName} range ${String(index + 1)} end`} hideLabel>
                        {(p) => (
                          <Input
                            type="time"
                            step={300}
                            value={range.endTime}
                            onChange={(e) => {
                              updateRange(range.key, { endTime: e.target.value });
                            }}
                            className="w-32"
                            {...p}
                          />
                        )}
                      </Field>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${dayName} range ${String(index + 1)}`}
                        onClick={() => {
                          removeRange(range.key);
                        }}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(dayRanges.length === 0 && 'text-brand-700')}
                    disabled={dayRanges.length >= MAX_RANGES_PER_DAY}
                    onClick={() => {
                      addRange(weekday);
                    }}
                  >
                    <Plus aria-hidden="true" />
                    Add hours on {dayName}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      {issues.length > 0 ? (
        <Alert tone="warning" title="Please fix these before saving">
          <ul className="list-disc pl-4">
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </Alert>
      ) : null}
      {serverError ? (
        <Alert tone="danger" title="Schedule not saved">
          {serverError}
        </Alert>
      ) : null}

      <div className="sticky bottom-20 z-10 flex justify-end rounded-xl border border-slate-200 bg-white/95 p-3 shadow-card backdrop-blur md:bottom-4">
        <Button
          onClick={() => void save()}
          loading={saving}
          disabled={issues.length > 0}
          className="w-full sm:w-auto"
        >
          Save availability
        </Button>
      </div>
    </div>
  );
}
