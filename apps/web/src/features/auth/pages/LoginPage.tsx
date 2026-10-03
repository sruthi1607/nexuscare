import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@nexuscare/shared';
import { Mail } from 'lucide-react';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { Field } from '../../../components/ui/Field';
import { Input } from '../../../components/ui/Input';
import { ApiError } from '../../../lib/api-client';
import { useAuth } from '../auth-context';
import { PasswordInput } from '../components/PasswordInput';
import { resolvePostLoginPath } from '../roles';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginInput) => {
    setServerError(null);
    try {
      const user = await login(values);
      void navigate(resolvePostLoginPath(user.role, redirectTo), { replace: true });
    } catch (error) {
      setServerError(
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again.',
      );
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
      <p className="mt-2 text-sm text-slate-600">
        Log in to manage your appointments, records and medicines.
      </p>

      {redirectTo && !serverError ? (
        <Alert tone="info" className="mt-6">
          Please log in to continue.
        </Alert>
      ) : null}
      {serverError ? (
        <Alert tone="danger" title="Could not log in" className="mt-6">
          {serverError}
        </Alert>
      ) : null}

      <form
        noValidate
        onSubmit={(event) => void handleSubmit(onSubmit)(event)}
        className="mt-8 space-y-5"
      >
        <Field label="Email" required error={errors.email?.message}>
          {(p) => (
            <Input
              type="email"
              autoComplete="email"
              inputMode="email"
              leadingIcon={<Mail aria-hidden="true" />}
              {...p}
              {...register('email')}
            />
          )}
        </Field>
        <Field label="Password" required error={errors.password?.message}>
          {(p) => (
            <PasswordInput autoComplete="current-password" {...p} {...register('password')} />
          )}
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>

      <div className="mt-8 border-t border-slate-200 pt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Demo Accounts (One-Click Sign In)
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex flex-col items-start p-2.5 text-left h-auto hover:border-brand-500 hover:bg-brand-50/50"
            onClick={async () => {
              const u = await login({ email: 'patient@nexuscare.example', password: 'password123' });
              void navigate(resolvePostLoginPath(u.role, redirectTo), { replace: true });
            }}
          >
            <span className="font-semibold text-xs text-slate-900">👤 Patient</span>
            <span className="text-[11px] text-slate-500 truncate w-full">Sarah Jenkins</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex flex-col items-start p-2.5 text-left h-auto hover:border-brand-500 hover:bg-brand-50/50"
            onClick={async () => {
              const u = await login({ email: 'doctor@nexuscare.example', password: 'password123' });
              void navigate(resolvePostLoginPath(u.role, redirectTo), { replace: true });
            }}
          >
            <span className="font-semibold text-xs text-slate-900">🩺 Doctor</span>
            <span className="text-[11px] text-slate-500 truncate w-full">Dr. Arvind Mehta</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex flex-col items-start p-2.5 text-left h-auto hover:border-brand-500 hover:bg-brand-50/50"
            onClick={async () => {
              const u = await login({ email: 'family@nexuscare.example', password: 'password123' });
              void navigate(resolvePostLoginPath(u.role, redirectTo), { replace: true });
            }}
          >
            <span className="font-semibold text-xs text-slate-900">👥 Caregiver</span>
            <span className="text-[11px] text-slate-500 truncate w-full">David Jenkins</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex flex-col items-start p-2.5 text-left h-auto hover:border-brand-500 hover:bg-brand-50/50"
            onClick={async () => {
              const u = await login({ email: 'admin@nexuscare.example', password: 'password123' });
              void navigate(resolvePostLoginPath(u.role, redirectTo), { replace: true });
            }}
          >
            <span className="font-semibold text-xs text-slate-900">🛡️ Admin</span>
            <span className="text-[11px] text-slate-500 truncate w-full">System Admin</span>
          </Button>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        New to Nexus Care?{' '}
        <Link to="/register" className="font-medium text-brand-700 hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
