import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  LANGUAGES,
  SEX_OPTIONS,
  profileUpdateSchema,
  type Profile,
  type ProfileUpdate,
  type ProfileUpdateInput,
} from '@nexuscare/shared';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { Field } from '../../../components/ui/Field';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { ApiError } from '../../../lib/api-client';
import { browserTimeZone, timeZoneOptions } from '../../../lib/format';

const emptyToNull = (value: unknown) => (value === '' ? null : value);

/** Profile → form values (nulls become '' so inputs stay controlled). */
function toFormValues(profile: Profile): ProfileUpdateInput {
  return {
    fullName: profile.fullName,
    phone: profile.phone ?? '',
    dateOfBirth: profile.dateOfBirth ?? '',
    sex: profile.sex,
    preferredLanguage: profile.preferredLanguage,
    // New accounts default to UTC; suggest the device's zone instead.
    timezone: profile.timezone === 'UTC' ? browserTimeZone() : profile.timezone,
    address: {
      line1: profile.address.line1 ?? '',
      line2: profile.address.line2 ?? '',
      city: profile.address.city ?? '',
      region: profile.address.region ?? '',
      postalCode: profile.address.postalCode ?? '',
      country: profile.address.country ?? '',
    },
  };
}

function FormSection({
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
        <div className="grid gap-5 sm:grid-cols-2">{children}</div>
      </CardBody>
    </Card>
  );
}

export interface ProfileFormProps {
  profile: Profile;
  onSubmit: (values: ProfileUpdateInput) => Promise<void>;
  onCancel: () => void;
}

export function ProfileForm({ profile, onSubmit, onCancel }: ProfileFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileUpdateInput, unknown, ProfileUpdate>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: toFormValues(profile),
  });

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

      <FormSection title="Personal details" description="How you appear across Nexus Care.">
        <Field label="Full name" required error={errors.fullName?.message} className="sm:col-span-2">
          {(p) => <Input autoComplete="name" {...p} {...register('fullName')} />}
        </Field>
        <Field label="Date of birth" error={errors.dateOfBirth?.message}>
          {(p) => (
            <Input
              type="date"
              autoComplete="bday"
              max={new Date().toISOString().slice(0, 10)}
              {...p}
              {...register('dateOfBirth')}
            />
          )}
        </Field>
        <Field label="Sex" error={errors.sex?.message}>
          {(p) => (
            <Select
              placeholder="Select"
              options={SEX_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              {...p}
              {...register('sex', { setValueAs: emptyToNull })}
            />
          )}
        </Field>
      </FormSection>

      <FormSection title="Contact" description="Your email is used to sign in and cannot be changed here.">
        <Field label="Email" hint="Contact support to change your sign-in email.">
          {(p) => <Input type="email" value={profile.email} readOnly disabled {...p} />}
        </Field>
        <Field
          label="Phone"
          hint="Include the country code, e.g. +91."
          error={errors.phone?.message}
        >
          {(p) => (
            <Input type="tel" autoComplete="tel" inputMode="tel" {...p} {...register('phone')} />
          )}
        </Field>
      </FormSection>

      <FormSection title="Preferences" description="Used for reminders and communication.">
        <Field label="Preferred language" required error={errors.preferredLanguage?.message}>
          {(p) => (
            <Select
              options={LANGUAGES.map((l) => ({ value: l.code, label: l.name }))}
              {...p}
              {...register('preferredLanguage')}
            />
          )}
        </Field>
        <Field
          label="Time zone"
          required
          hint="Appointment and reminder times are shown in this zone."
          error={errors.timezone?.message}
        >
          {(p) => (
            <Select options={timeZoneOptions(profile.timezone)} {...p} {...register('timezone')} />
          )}
        </Field>
      </FormSection>

      <FormSection title="Address" description="Optional. Helps with nearby care and deliveries.">
        <Field label="Address line 1" error={errors.address?.line1?.message} className="sm:col-span-2">
          {(p) => <Input autoComplete="address-line1" {...p} {...register('address.line1')} />}
        </Field>
        <Field label="Address line 2" error={errors.address?.line2?.message} className="sm:col-span-2">
          {(p) => <Input autoComplete="address-line2" {...p} {...register('address.line2')} />}
        </Field>
        <Field label="City / town / village" error={errors.address?.city?.message}>
          {(p) => <Input autoComplete="address-level2" {...p} {...register('address.city')} />}
        </Field>
        <Field label="State / region" error={errors.address?.region?.message}>
          {(p) => <Input autoComplete="address-level1" {...p} {...register('address.region')} />}
        </Field>
        <Field label="Postal code" error={errors.address?.postalCode?.message}>
          {(p) => <Input autoComplete="postal-code" {...p} {...register('address.postalCode')} />}
        </Field>
        <Field label="Country" error={errors.address?.country?.message}>
          {(p) => <Input autoComplete="country-name" {...p} {...register('address.country')} />}
        </Field>
      </FormSection>

      <div className="sticky bottom-20 z-10 flex flex-col-reverse gap-2 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-card backdrop-blur sm:flex-row sm:justify-end md:bottom-4">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Save profile
        </Button>
      </div>
    </form>
  );
}
