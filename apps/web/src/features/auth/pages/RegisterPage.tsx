import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  PASSWORD_MIN_LENGTH,
  registerFormSchema,
  signupRoleSchema,
  type RegisterFormValues,
  type SignupRole,
} from '@nexuscare/shared';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Field } from '../../../components/ui/Field';
import { Input } from '../../../components/ui/Input';
import { RadioGroup, type RadioOption } from '../../../components/ui/Radio';
import { ApiError } from '../../../lib/api-client';
import { useAuth } from '../auth-context';
import { PasswordInput } from '../components/PasswordInput';
import { roleHomePath } from '../roles';

const roleOptions: RadioOption<SignupRole>[] = [
  { value: 'patient', label: 'Patient', description: 'Get care for yourself' },
  { value: 'caregiver', label: 'Family / caregiver', description: 'Support someone you care for' },
  { value: 'doctor', label: 'Doctor', description: 'Consult patients remotely' },
];

export function RegisterPage() {
  const { register: registerAccount } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedRole = signupRoleSchema.safeParse(searchParams.get('role'));
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      role: requestedRole.success ? requestedRole.data : 'patient',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });
  const role = useWatch({ control, name: 'role' });

  const onSubmit = async ({ confirmPassword: _confirm, ...values }: RegisterFormValues) => {
    setServerError(null);
    try {
      const user = await registerAccount({ ...values, acceptTerms: true });
      void navigate(roleHomePath(user.role), { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'EMAIL_TAKEN') {
        setError('email', {
          message: 'An account with this email already exists. Try logging in.',
        });
        return;
      }
      setServerError(
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again.',
      );
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create your account</h1>
      <p className="mt-2 text-sm text-slate-600">
        Free to join. You decide what you share and with whom.
      </p>

      {serverError ? (
        <Alert tone="danger" title="Could not create your account" className="mt-6">
          {serverError}
        </Alert>
      ) : null}

      <form
        noValidate
        onSubmit={(event) => void handleSubmit(onSubmit)(event)}
        className="mt-8 space-y-5"
      >
        <RadioGroup
          legend="I am joining as"
          variant="cards"
          options={roleOptions}
          error={errors.role?.message}
          {...register('role')}
        />
        {role === 'doctor' ? (
          <p className="rounded-lg bg-brand-50 p-3 text-sm text-brand-800">
            Doctor accounts are reviewed before they are listed. You’ll be asked for your medical
            registration details after signing up.
          </p>
        ) : null}

        <Field label="Full name" required error={errors.fullName?.message}>
          {(p) => <Input autoComplete="name" {...p} {...register('fullName')} />}
        </Field>
        <Field label="Email" required error={errors.email?.message}>
          {(p) => (
            <Input
              type="email"
              autoComplete="email"
              inputMode="email"
              {...p}
              {...register('email')}
            />
          )}
        </Field>
        <Field
          label="Password"
          required
          hint={`At least ${String(PASSWORD_MIN_LENGTH)} characters, including a letter and a number.`}
          error={errors.password?.message}
        >
          {(p) => <PasswordInput autoComplete="new-password" {...p} {...register('password')} />}
        </Field>
        <Field label="Confirm password" required error={errors.confirmPassword?.message}>
          {(p) => (
            <PasswordInput autoComplete="new-password" {...p} {...register('confirmPassword')} />
          )}
        </Field>
        <Checkbox
          label="I agree to the terms of use and privacy policy"
          description="Nexus Care is a prototype and not a medical device."
          error={errors.acceptTerms?.message}
          {...register('acceptTerms')}
        />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}
