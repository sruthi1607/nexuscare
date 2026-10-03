import { z } from 'zod';

/** All platform roles (docs/05-auth-and-rbac.md). "caregiver" is shown as "Family" in the UI. */
export const APP_ROLES = ['patient', 'doctor', 'caregiver', 'admin'] as const;
export const appRoleSchema = z.enum(APP_ROLES);
export type AppRole = z.infer<typeof appRoleSchema>;

/** Roles a person may choose at sign-up. Admin accounts are never self-registered. */
export const SIGNUP_ROLES = ['patient', 'caregiver', 'doctor'] as const;
export const signupRoleSchema = z.enum(SIGNUP_ROLES);
export type SignupRole = z.infer<typeof signupRoleSchema>;

export const ACCOUNT_STATUSES = ['active', 'suspended', 'deactivated'] as const;
export const accountStatusSchema = z.enum(ACCOUNT_STATUSES);
export type AccountStatus = z.infer<typeof accountStatusSchema>;

export const DOCTOR_VERIFICATION_STATUSES = [
  'pending',
  'verified',
  'rejected',
  'suspended',
] as const;
export const doctorVerificationSchema = z.enum(DOCTOR_VERIFICATION_STATUSES);
export type DoctorVerification = z.infer<typeof doctorVerificationSchema>;

export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 128;

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Enter your email address')
  .max(254, 'Email address is too long')
  .pipe(z.email('Enter a valid email address'));

export const newPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${String(PASSWORD_MIN_LENGTH)} characters`)
  .max(PASSWORD_MAX_LENGTH, `Use at most ${String(PASSWORD_MAX_LENGTH)} characters`)
  .refine((value) => /[A-Za-z]/.test(value) && /\d/.test(value), {
    message: 'Include at least one letter and one number',
  });

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, 'Enter your full name')
  .max(120, 'Name is too long');

/** POST /api/v1/auth/login */
export const loginSchema = z.object({
  email: emailSchema,
  // Capped so oversized inputs cannot be used to make password hashing expensive.
  password: z
    .string()
    .min(1, 'Enter your password')
    .max(PASSWORD_MAX_LENGTH, 'Email or password is incorrect'),
});
export type LoginInput = z.infer<typeof loginSchema>;

/** POST /api/v1/auth/register — what the API accepts. */
export const registerRequestSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  role: signupRoleSchema,
  password: newPasswordSchema,
  acceptTerms: z.literal(true, {
    message: 'You must accept the terms and privacy policy to continue',
  }),
});
export type RegisterRequest = z.infer<typeof registerRequestSchema>;

/** Registration form: the request plus a confirmation field checked only in the browser. */
export const registerFormSchema = registerRequestSchema
  .extend({
    confirmPassword: z.string().min(1, 'Confirm your password'),
    acceptTerms: z.boolean().refine((value) => value, {
      message: 'You must accept the terms and privacy policy to continue',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type RegisterFormValues = z.infer<typeof registerFormSchema>;

/** The signed-in user as exposed to the browser. Never includes credentials or security fields. */
export const sessionUserSchema = z.object({
  id: z.uuid(),
  email: z.string(),
  role: appRoleSchema,
  fullName: z.string(),
  status: accountStatusSchema,
  /** Present for doctors only. */
  doctorVerification: doctorVerificationSchema.nullable(),
  /** Relative, cache-busted avatar URL, or null when none is set. */
  avatarUrl: z.string().nullable(),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

/** GET /api/v1/auth/session — `user` is null when signed out (not an error). */
export const sessionResponseSchema = z.object({ user: sessionUserSchema.nullable() });
export type SessionResponse = z.infer<typeof sessionResponseSchema>;

/** Response of login and register. */
export const authResponseSchema = z.object({ user: sessionUserSchema });
export type AuthResponse = z.infer<typeof authResponseSchema>;
