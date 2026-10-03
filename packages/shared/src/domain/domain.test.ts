import { describe, expect, it } from 'vitest';
import { availabilityIssues, doctorProfileGaps, type DoctorProfile } from './doctor.js';
import { emergencyContactUpdateSchema, healthBasicsUpdateSchema } from './patient.js';
import { profileUpdateSchema } from './profile.js';

describe('availabilityIssues', () => {
  it('accepts non-overlapping ranges that fit a slot', () => {
    expect(
      availabilityIssues(
        [
          { weekday: 1, startTime: '09:00', endTime: '12:00' },
          { weekday: 1, startTime: '12:00', endTime: '13:00' },
        ],
        30,
      ),
    ).toEqual([]);
  });

  it('reports reversed, too-short and overlapping ranges', () => {
    expect(
      availabilityIssues([{ weekday: 0, startTime: '10:00', endTime: '09:00' }], 20)[0],
    ).toMatch(/end time must be after start time/);
    expect(
      availabilityIssues([{ weekday: 0, startTime: '09:00', endTime: '09:15' }], 20)[0],
    ).toMatch(/fit at least one 20-minute slot/);
    expect(
      availabilityIssues(
        [
          { weekday: 5, startTime: '09:00', endTime: '11:00' },
          { weekday: 5, startTime: '10:30', endTime: '12:00' },
        ],
        20,
      ),
    ).toEqual(['Friday: time ranges overlap']);
  });
});

describe('doctorProfileGaps', () => {
  const complete: DoctorProfile = {
    doctorId: '00000000-0000-4000-8000-000000000001',
    verificationStatus: 'pending',
    registrationNumber: 'R-1',
    registrationCouncil: 'Council',
    specialties: [
      { id: '00000000-0000-4000-8000-000000000002', name: 'Cardiology', slug: 'cardiology' },
    ],
    qualifications: [
      { id: '00000000-0000-4000-8000-000000000003', degree: 'MBBS', institution: 'X', year: 2010 },
    ],
    yearsExperience: 5,
    consultationModes: ['video'],
    languages: ['en'],
    clinicName: null,
    clinicAddress: null,
    clinicCity: null,
    consultationFee: 0,
    feeCurrency: 'INR',
    bio: null,
    acceptsNewPatients: true,
    slotMinutes: 20,
  };

  it('is empty for a complete profile with availability (a free consultation counts)', () => {
    expect(doctorProfileGaps(complete, true)).toEqual([]);
  });

  it('lists what is missing', () => {
    expect(
      doctorProfileGaps({ ...complete, registrationNumber: null, languages: [] }, false),
    ).toEqual([
      'Medical registration number and council',
      'Languages you consult in',
      'Weekly availability',
    ]);
  });
});

describe('profile and medical schemas', () => {
  const profile = {
    fullName: 'Asha Kumar',
    phone: '',
    dateOfBirth: '',
    sex: null,
    preferredLanguage: 'en',
    timezone: 'Asia/Kolkata',
    address: { line1: '', line2: '', city: '', region: '', postalCode: '', country: '' },
  };

  it('turns empty optional fields into null', () => {
    const parsed = profileUpdateSchema.parse(profile);
    expect(parsed.phone).toBeNull();
    expect(parsed.dateOfBirth).toBeNull();
    expect(parsed.address.city).toBeNull();
  });

  it('rejects unknown time zones and future birth dates', () => {
    expect(profileUpdateSchema.safeParse({ ...profile, timezone: 'Nowhere/Land' }).success).toBe(
      false,
    );
    expect(profileUpdateSchema.safeParse({ ...profile, dateOfBirth: '2999-01-01' }).success).toBe(
      false,
    );
  });

  it('requires both name and phone for an emergency contact', () => {
    expect(
      emergencyContactUpdateSchema.safeParse({ name: 'Ravi', relationship: null, phone: '' })
        .success,
    ).toBe(false);
    expect(
      emergencyContactUpdateSchema.safeParse({ name: '', relationship: '', phone: '' }).success,
    ).toBe(true);
  });

  it('bounds height and weight', () => {
    expect(
      healthBasicsUpdateSchema.safeParse({ bloodGroup: null, heightCm: 20, weightKg: null })
        .success,
    ).toBe(false);
    expect(
      healthBasicsUpdateSchema.safeParse({ bloodGroup: 'AB-', heightCm: 170, weightKg: 70 })
        .success,
    ).toBe(true);
  });
});
