import { useState, type ReactNode } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import type { z } from 'zod';
import {
  CONSULTATION_MODES,
  CURRENCIES,
  LANGUAGES,
  doctorProfileUpdateSchema,
  type DoctorProfile,
  type DoctorProfileUpdateInput,
  type Specialty,
} from '@nexuscare/shared';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { Checkbox } from '../../../components/ui/Checkbox';
import { CheckboxGroup } from '../../../components/ui/CheckboxGroup';
import { Field, FieldError } from '../../../components/ui/Field';
import { Input, Textarea } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { ApiError } from '../../../lib/api-client';

type Output = z.output<typeof doctorProfileUpdateSchema>;

const numberOrNull = (value: unknown) =>
  value === '' || value === null || value === undefined ? null : Number(value);

function toFormValues(profile: DoctorProfile): DoctorProfileUpdateInput {
  return {
    registrationNumber: profile.registrationNumber ?? '',
    registrationCouncil: profile.registrationCouncil ?? '',
    specialtyIds: profile.specialties.map((s) => s.id),
    qualifications: profile.qualifications.map((q) => ({
      id: q.id,
      degree: q.degree,
      institution: q.institution,
      year: q.year,
    })),
    // RHF needs a value to show; validation rejects the null if left empty.
    yearsExperience: profile.yearsExperience as number,
    consultationModes: profile.consultationModes,
    languages: profile.languages,
    clinicName: profile.clinicName ?? '',
    clinicAddress: profile.clinicAddress ?? '',
    clinicCity: profile.clinicCity ?? '',
    consultationFee: profile.consultationFee as number,
    feeCurrency: profile.feeCurrency ?? 'INR',
    bio: profile.bio ?? '',
    acceptsNewPatients: profile.acceptsNewPatients,
  };
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardBody className="grid gap-6 py-6 lg:grid-cols-[14rem_1fr]">
        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
        </div>
        <div className="grid min-w-0 gap-5 sm:grid-cols-2">{children}</div>
      </CardBody>
    </Card>
  );
}

export interface DoctorProfileFormProps {
  profile: DoctorProfile;
  specialties: Specialty[];
  onSubmit: (values: Output) => Promise<void>;
}

export function DoctorProfileForm({ profile, specialties, onSubmit }: DoctorProfileFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const registrationLocked = profile.verificationStatus === 'verified';
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DoctorProfileUpdateInput, unknown, Output>({
    resolver: zodResolver(doctorProfileUpdateSchema),
    defaultValues: toFormValues(profile),
  });
  const qualifications = useFieldArray({ control, name: 'qualifications', keyName: 'rowKey' });

  const submit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'Could not save your profile.');
    }
  });

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="space-y-6">
      {serverError ? (
        <Alert tone="danger" title="Your changes were not saved">
          {serverError}
        </Alert>
      ) : null}

      <Section
        title="Medical registration"
        description="Checked by our team before you are listed. Locked once verified."
      >
        <Field
          label="Registration number"
          error={errors.registrationNumber?.message}
          hint={registrationLocked ? 'Verified — contact support to change.' : undefined}
        >
          {(p) => <Input readOnly={registrationLocked} {...p} {...register('registrationNumber')} />}
        </Field>
        <Field label="Registration council" error={errors.registrationCouncil?.message}>
          {(p) => (
            <Input
              readOnly={registrationLocked}
              placeholder="e.g. State Medical Council"
              {...p}
              {...register('registrationCouncil')}
            />
          )}
        </Field>
      </Section>

      <Section title="Specialties" description="Choose up to three.">
        <div className="sm:col-span-2">
          <Controller
            control={control}
            name="specialtyIds"
            render={({ field, fieldState }) => (
              <CheckboxGroup
                legend="Specialties"
                required
                columns={3}
                max={3}
                options={specialties.map((s) => ({ value: s.id, label: s.name }))}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
      </Section>

      <Section title="Qualifications" description="Degrees and diplomas, most recent first.">
        <div className="space-y-3 sm:col-span-2">
          {errors.qualifications?.message ? (
            <FieldError>{errors.qualifications.message}</FieldError>
          ) : null}
          {qualifications.fields.map((row, index) => (
            <div
              key={row.rowKey}
              className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-[1fr_1fr_7rem_auto]"
            >
              <Field
                label="Degree"
                required
                error={errors.qualifications?.[index]?.degree?.message}
              >
                {(p) => (
                  <Input placeholder="e.g. MBBS" {...p} {...register(`qualifications.${index}.degree`)} />
                )}
              </Field>
              <Field
                label="Institution"
                required
                error={errors.qualifications?.[index]?.institution?.message}
              >
                {(p) => <Input {...p} {...register(`qualifications.${index}.institution`)} />}
              </Field>
              <Field label="Year" error={errors.qualifications?.[index]?.year?.message}>
                {(p) => (
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="YYYY"
                    {...p}
                    {...register(`qualifications.${index}.year`, { setValueAs: numberOrNull })}
                  />
                )}
              </Field>
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove qualification ${String(index + 1)}`}
                  onClick={() => {
                    qualifications.remove(index);
                  }}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            variant="secondary"
            size="sm"
            disabled={qualifications.fields.length >= 10}
            onClick={() => {
              qualifications.append({ degree: '', institution: '', year: null });
            }}
          >
            <Plus aria-hidden="true" />
            Add qualification
          </Button>
        </div>
      </Section>

      <Section title="Practice" description="How and where you consult.">
        <Field label="Years of experience" required error={errors.yearsExperience?.message}>
          {(p) => (
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              max={70}
              {...p}
              {...register('yearsExperience', { setValueAs: numberOrNull })}
            />
          )}
        </Field>
        <div className="flex items-end pb-2">
          <Checkbox
            label="Accepting new patients"
            description="Untick to stop new bookings without hiding your profile."
            {...register('acceptsNewPatients')}
          />
        </div>
        <div className="sm:col-span-2">
          <Controller
            control={control}
            name="consultationModes"
            render={({ field, fieldState }) => (
              <CheckboxGroup
                legend="Consultation types"
                required
                columns={3}
                options={CONSULTATION_MODES}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
        <div className="sm:col-span-2">
          <Controller
            control={control}
            name="languages"
            render={({ field, fieldState }) => (
              <CheckboxGroup
                legend="Languages you consult in"
                required
                columns={4}
                max={10}
                options={LANGUAGES.map((l) => ({ value: l.code, label: l.name }))}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
        <Field
          label="Hospital / clinic"
          hint="Required for in-person consultations."
          error={errors.clinicName?.message}
        >
          {(p) => <Input {...p} {...register('clinicName')} />}
        </Field>
        <Field label="City" error={errors.clinicCity?.message}>
          {(p) => <Input {...p} {...register('clinicCity')} />}
        </Field>
        <Field label="Clinic address" error={errors.clinicAddress?.message} className="sm:col-span-2">
          {(p) => <Textarea rows={2} {...p} {...register('clinicAddress')} />}
        </Field>
      </Section>

      <Section title="Fee and bio" description="Shown to patients when they book.">
        <Field
          label="Consultation fee"
          required
          hint="Enter 0 for free consultations."
          error={errors.consultationFee?.message}
        >
          {(p) => (
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              {...p}
              {...register('consultationFee', { setValueAs: numberOrNull })}
            />
          )}
        </Field>
        <Field label="Currency" required error={errors.feeCurrency?.message}>
          {(p) => (
            <Select
              options={CURRENCIES.map((c) => ({ value: c, label: c }))}
              {...p}
              {...register('feeCurrency')}
            />
          )}
        </Field>
        <Field
          label="Professional bio"
          hint="A short introduction: your focus, experience and approach (up to 2000 characters)."
          error={errors.bio?.message}
          className="sm:col-span-2"
        >
          {(p) => <Textarea rows={5} {...p} {...register('bio')} />}
        </Field>
      </Section>

      <div className="sticky bottom-20 z-10 flex justify-end rounded-xl border border-slate-200 bg-white/95 p-3 shadow-card backdrop-blur md:bottom-4">
        <Button type="submit" loading={isSubmitting} className="w-full sm:w-auto">
          Save professional profile
        </Button>
      </div>
    </form>
  );
}
