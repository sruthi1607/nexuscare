import { describe, expect, it } from 'vitest';
import { resolvePostLoginPath, roleHomePath } from './roles';

describe('roleHomePath', () => {
  it('maps every role to its own area', () => {
    expect(roleHomePath('patient')).toBe('/patient');
    expect(roleHomePath('doctor')).toBe('/doctor');
    expect(roleHomePath('caregiver')).toBe('/family');
    expect(roleHomePath('admin')).toBe('/admin');
  });
});

describe('resolvePostLoginPath', () => {
  it.each([
    [null, '/patient'],
    ['/patient/records', '/patient/records'],
    ['/patient?tab=1', '/patient?tab=1'],
    ['/ui-kit', '/ui-kit'],
    ['/admin', '/patient'],
    ['/patientx', '/patient'],
    ['//evil.example', '/patient'],
    ['https://evil.example', '/patient'],
    ['/\\evil.example', '/patient'],
    ['javascript:alert(1)', '/patient'],
  ])('redirectTo=%s → %s for a patient', (redirectTo, expected) => {
    expect(resolvePostLoginPath('patient', redirectTo)).toBe(expected);
  });
});
