import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Activity, PhoneCall } from 'lucide-react';
import type { z } from 'zod';
import {
  BLOOD_GROUPS,
  emergencyContactUpdateSchema,
  healthBasicsUpdateSchema,
  type EmergencyContact,
  type HealthBasics,
} from '@nexuscare/shared';
import { DescriptionList } from '../../../components/common/DescriptionList';
import { SectionCard } from '../../../components/common/SectionCard';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { Field } from '../../../components/ui/Field';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { useToast } from '../../../components/ui/toast-context';
import { ApiError } from '../../../lib/api-client';
import { useUpdateMedicalSection } from '../api';

const numberOrNull = (value: unknown) =>
  value === '' || value === null || value === undefined ? null : Number(value);
const emptyToNull = (value: unknown) => (value === '' ? null : value);

function FormActions({ onCancel, saving }: { onCancel: () => void; saving: boolean }) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:col-span-2 sm:flex-row sm:justify-end">
      <Button variant="outline" onClick={onCancel} disabled={saving}>
        Cancel
      </Button>
      <Button type="submit" loading={saving}>
        Save changes
      </Button>
    </div>
  );
}

function bmi(basics: HealthBasics): string | null {
  if (!basics.heightCm || !basics.weightKg) return null;
  const value = basics.weightKg / (basics.heightCm / 100) ** 2;
  return value.toFixed(1);
}

export function HealthBasicsSection({ basics }: { basics: HealthBasics }) {
  const [editing, setEditing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const save = useUpdateMedicalSection('basics');
  const { toast } = useToast();
  type Input = z.input<typeof healthBasicsUpdateSchema>;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Input, unknown, z.output<typeof healthBasicsUpdateSchema>>({
    resolver: zodResolver(healthBasicsUpdateSchema),
    values: basics,
  });

  const submit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await save.mutateAsync(values);
      setEditing(false);
      toast({ tone: 'success', title: 'Health basics saved' });
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'Could not save.');
    }
  });

  return (
    <SectionCard
      id="basics"
      title="Health basics"
      description="Blood group, height and weight."
      icon={<Activity aria-hidden="true" />}
      editing={editing}
      onEdit={() => {
        setEditing(true);
      }}
    >
      {editing ? (
        <form noValidate onSubmit={(e) => void submit(e)} className="grid gap-5 sm:grid-cols-3">
          {serverError ? (
            <Alert tone="danger" className="sm:col-span-3">
              {serverError}
            </Alert>
          ) : null}
          <Field label="Blood group" error={errors.bloodGroup?.message}>
            {(p) => (
              <Select
                placeholder="Not sure"
                options={BLOOD_GROUPS.map((g) => ({ value: g, label: g }))}
                {...p}
                {...register('bloodGroup', { setValueAs: emptyToNull })}
              />
            )}
          </Field>
          <Field label="Height (cm)" error={errors.heightCm?.message}>
            {(p) => (
              <Input
                type="number"
                inputMode="decimal"
                step="0.1"
                {...p}
                {...register('heightCm', { setValueAs: numberOrNull })}
              />
            )}
          </Field>
          <Field label="Weight (kg)" error={errors.weightKg?.message}>
            {(p) => (
              <Input
                type="number"
                inputMode="decimal"
                step="0.1"
                {...p}
                {...register('weightKg', { setValueAs: numberOrNull })}
              />
            )}
          </Field>
          <div className="sm:col-span-3">
            <FormActions
              saving={isSubmitting}
              onCancel={() => {
                reset();
                setEditing(false);
              }}
            />
          </div>
        </form>
      ) : (
        <DescriptionList
          className="sm:grid-cols-4"
          items={[
            { label: 'Blood group', value: basics.bloodGroup },
            { label: 'Height', value: basics.heightCm ? `${String(basics.heightCm)} cm` : null },
            { label: 'Weight', value: basics.weightKg ? `${String(basics.weightKg)} kg` : null },
            { label: 'BMI (calculated)', value: bmi(basics) },
          ]}
        />
      )}
    </SectionCard>
  );
}

export function EmergencyContactSection({ contact }: { contact: EmergencyContact }) {
  const [editing, setEditing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const save = useUpdateMedicalSection('emergency-contact');
  const { toast } = useToast();
  type Input = z.input<typeof emergencyContactUpdateSchema>;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Input, unknown, z.output<typeof emergencyContactUpdateSchema>>({
    resolver: zodResolver(emergencyContactUpdateSchema),
    values: {
      name: contact.name ?? '',
      relationship: contact.relationship ?? '',
      phone: contact.phone ?? '',
    },
  });

  const submit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await save.mutateAsync(values);
      setEditing(false);
      toast({ tone: 'success', title: 'Emergency contact saved' });
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'Could not save.');
    }
  });

  return (
    <SectionCard
      id="emergency-contact"
      title="Emergency contact"
      description="Who should be contacted if you need urgent help."
      icon={<PhoneCall aria-hidden="true" />}
      editing={editing}
      onEdit={() => {
        setEditing(true);
      }}
    >
      {editing ? (
        <form noValidate onSubmit={(e) => void submit(e)} className="grid gap-5 sm:grid-cols-2">
          {serverError ? (
            <Alert tone="danger" className="sm:col-span-2">
              {serverError}
            </Alert>
          ) : null}
          <Field label="Name" error={errors.name?.message}>
            {(p) => <Input autoComplete="off" {...p} {...register('name')} />}
          </Field>
          <Field label="Relationship" error={errors.relationship?.message}>
            {(p) => <Input placeholder="e.g. Daughter" {...p} {...register('relationship')} />}
          </Field>
          <Field
            label="Phone"
            hint="Include the country code."
            error={errors.phone?.message}
            className="sm:col-span-2"
          >
            {(p) => <Input type="tel" inputMode="tel" {...p} {...register('phone')} />}
          </Field>
          <FormActions
            saving={isSubmitting}
            onCancel={() => {
              reset();
              setEditing(false);
            }}
          />
        </form>
      ) : (
        <DescriptionList
          items={[
            { label: 'Name', value: contact.name },
            { label: 'Relationship', value: contact.relationship },
            {
              label: 'Phone',
              value: contact.phone ? (
                <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`} className="text-brand-700 hover:underline">
                  {contact.phone}
                </a>
              ) : null,
            },
          ]}
        />
      )}
    </SectionCard>
  );
}
