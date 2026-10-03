import { describe, expect, it } from 'vitest';
import {
  loginSchema,
  registerFormSchema as registerSchema,
  registerRequestSchema,
  signupRoleSchema,
} from './schemas.js';

const validRegistration = {
  fullName: 'Asha Kumar',
  email: ' asha@example.com ',
  role: 'patient',
  password: 'correcthorse42',
  confirmPassword: 'correcthorse42',
  acceptTerms: true,
};

describe('registerSchema', () => {
  it('accepts a valid registration and trims the email', () => {
    const parsed = registerSchema.parse(validRegistration);
    expect(parsed.email).toBe('asha@example.com');
  });

  it('never allows self-registration as admin', () => {
    expect(signupRoleSchema.safeParse('admin').success).toBe(false);
    expect(registerSchema.safeParse({ ...validRegistration, role: 'admin' }).success).toBe(false);
  });

  it.each([
    ['too short', 'short1'],
    ['no digit', 'onlyletterspassword'],
    ['no letter', '12345678901'],
  ])('rejects weak passwords (%s)', (_label, password) => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      password,
      confirmPassword: password,
    });
    expect(result.success).toBe(false);
  });

  it('reports mismatched passwords on confirmPassword', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      confirmPassword: 'different99',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['confirmPassword']);
  });

  it('requires accepting the terms', () => {
    const result = registerSchema.safeParse({ ...validRegistration, acceptTerms: false });
    expect(result.error?.issues[0]?.path).toEqual(['acceptTerms']);
  });
});

describe('loginSchema', () => {
  it('requires an email and a password', () => {
    expect(loginSchema.safeParse({ email: '', password: '' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
  });
});

describe('registerRequestSchema (API)', () => {
  it('requires acceptTerms to be exactly true and drops unknown fields', () => {
    const { confirmPassword: _ignored, ...request } = validRegistration;
    expect(registerRequestSchema.safeParse({ ...request, acceptTerms: false }).success).toBe(false);

    const parsed = registerRequestSchema.parse({ ...request, isAdmin: true });
    expect(parsed).not.toHaveProperty('isAdmin');
  });
});
