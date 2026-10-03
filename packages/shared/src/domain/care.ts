/**
 * Domain contracts for modules delivered in later phases. They mirror the database design in
 * docs/03-database-design.md so each phase starts from an agreed shape. No tables or endpoints
 * exist for these yet — they are created by the phase that owns them.
 */
import { z } from 'zod';
import { currencySchema } from './common.js';
import { consultationModeSchema } from './doctor.js';

// ---------- Family / caregivers (Family module) ----------

export const FAMILY_SCOPES = [
  'view_profile',
  'view_appointments',
  'manage_appointments',
  'view_records',
  'view_prescriptions',
  'view_medications',
  'receive_medication_alerts',
  'view_health_metrics',
  'receive_emergency_alerts',
] as const;
export const familyScopeSchema = z.enum(FAMILY_SCOPES);
export type FamilyScope = z.infer<typeof familyScopeSchema>;

export const familyLinkStatusSchema = z.enum(['invited', 'active', 'declined', 'revoked']);

/** A caregiver's link to a patient, with the permissions the patient granted (default none). */
export const familyMemberSchema = z.object({
  linkId: z.uuid(),
  patientId: z.uuid(),
  caregiverId: z.uuid().nullable(),
  caregiverName: z.string().nullable(),
  invitedEmail: z.string().nullable(),
  relationship: z.string(),
  status: familyLinkStatusSchema,
  scopes: z.array(familyScopeSchema),
  createdAt: z.string(),
});
export type FamilyMember = z.infer<typeof familyMemberSchema>;

// ---------- Appointments (Appointments module) ----------

export const appointmentStatusSchema = z.enum([
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
]);
export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>;

export const appointmentSchema = z.object({
  id: z.uuid(),
  patientId: z.uuid(),
  doctorId: z.uuid(),
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
  mode: consultationModeSchema,
  status: appointmentStatusSchema,
  reasonForVisit: z.string().nullable(),
  cancellationReason: z.string().nullable(),
  createdAt: z.iso.datetime(),
});
export type Appointment = z.infer<typeof appointmentSchema>;

// ---------- Medical records (Records module) ----------

export const recordTypeSchema = z.enum([
  'lab_report',
  'imaging',
  'prescription_scan',
  'discharge_summary',
  'clinical_note',
  'vaccination',
  'other',
]);

export const medicalRecordSchema = z.object({
  id: z.uuid(),
  patientId: z.uuid(),
  uploadedBy: z.uuid(),
  recordType: recordTypeSchema,
  title: z.string(),
  description: z.string().nullable(),
  recordDate: z.string().nullable(),
  mimeType: z.string(),
  sizeBytes: z.number().int(),
  hiddenFromDoctors: z.boolean(),
  createdAt: z.iso.datetime(),
});
export type MedicalRecord = z.infer<typeof medicalRecordSchema>;

// ---------- Prescriptions (Prescriptions module) ----------

export const prescriptionItemSchema = z.object({
  id: z.uuid(),
  medicineId: z.uuid().nullable(),
  medicineName: z.string(),
  strength: z.string().nullable(),
  dose: z.string(),
  frequencyPerDay: z.number().int().nullable(),
  durationDays: z.number().int().nullable(),
  instructions: z.string().nullable(),
});

export const prescriptionSchema = z.object({
  id: z.uuid(),
  patientId: z.uuid(),
  doctorId: z.uuid(),
  consultationId: z.uuid().nullable(),
  status: z.enum(['active', 'completed', 'cancelled']),
  notes: z.string().nullable(),
  issuedAt: z.iso.datetime(),
  validUntil: z.string().nullable(),
  items: z.array(prescriptionItemSchema),
});
export type Prescription = z.infer<typeof prescriptionSchema>;

// ---------- Notifications (Notifications module) ----------

export const notificationSchema = z.object({
  id: z.uuid(),
  recipientId: z.uuid(),
  type: z.string(),
  category: z.enum([
    'account',
    'appointments',
    'clinical',
    'medication',
    'pharmacy',
    'family',
    'health',
    'ai',
  ]),
  title: z.string(),
  body: z.string(),
  /** Entity references for deep links; never health values. */
  data: z.record(z.string(), z.unknown()),
  priority: z.enum(['low', 'normal', 'high']),
  readAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
});
export type Notification = z.infer<typeof notificationSchema>;

// ---------- Pharmacy orders (Pharmacy module) ----------

export const orderStatusSchema = z.enum([
  'pending_review',
  'confirmed',
  'packed',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'rejected',
]);

export const pharmacyOrderSchema = z.object({
  id: z.uuid(),
  patientId: z.uuid(),
  pharmacyId: z.uuid(),
  prescriptionId: z.uuid().nullable(),
  status: orderStatusSchema,
  paymentMethod: z.enum(['cash_on_delivery', 'mock_online']),
  paymentStatus: z.enum(['unpaid', 'paid', 'refunded']),
  items: z.array(
    z.object({
      medicineId: z.uuid(),
      name: z.string(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().nonnegative(),
      lineTotal: z.number().nonnegative(),
    }),
  ),
  subtotal: z.number().nonnegative(),
  deliveryFee: z.number().nonnegative(),
  total: z.number().nonnegative(),
  currency: currencySchema,
  createdAt: z.iso.datetime(),
});
export type PharmacyOrder = z.infer<typeof pharmacyOrderSchema>;

// ---------- Health monitoring (IoT / ML modules) ----------

export const metricTypeSchema = z.enum([
  'heart_rate',
  'spo2',
  'body_temperature',
  'bp_systolic',
  'bp_diastolic',
  'respiratory_rate',
  'blood_glucose',
]);

export const healthMetricSchema = z.object({
  id: z.number().int(),
  patientId: z.uuid(),
  deviceId: z.uuid().nullable(),
  metricType: metricTypeSchema,
  value: z.number(),
  unit: z.string(),
  source: z.enum(['device', 'simulator', 'manual']),
  recordedAt: z.iso.datetime(),
});
export type HealthMetric = z.infer<typeof healthMetricSchema>;

/** Health alerts are risk indications for follow-up — never diagnoses. */
export const healthAlertSchema = z.object({
  id: z.uuid(),
  patientId: z.uuid(),
  source: z.enum(['threshold_rule', 'ml_model', 'patient_sos', 'device']),
  severity: z.enum(['info', 'warning', 'critical']),
  status: z.enum(['open', 'acknowledged', 'resolved']),
  title: z.string(),
  message: z.string(),
  triggeredAt: z.iso.datetime(),
  acknowledgedAt: z.iso.datetime().nullable(),
  resolvedAt: z.iso.datetime().nullable(),
  isSimulated: z.boolean(),
});
export type HealthAlert = z.infer<typeof healthAlertSchema>;
