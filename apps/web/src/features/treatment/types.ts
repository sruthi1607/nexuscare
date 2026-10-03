export type ConsultationMode = 'video' | 'audio' | 'in_person';

export interface TreatmentVitals {
  bpSystolic: number;
  bpDiastolic: number;
  heartRate: number;
  spo2: number;
  temperatureF: number;
  weightKg: number;
  respiratoryRate?: number;
}

export interface TreatmentAppointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar?: string;
  patientId: string;
  patientName: string;
  scheduledAt: string; // ISO datetime
  durationMinutes: number;
  mode: ConsultationMode;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  reasonForVisit: string;
  consultationId?: string;
}

export interface TreatmentPrescriptionItem {
  id: string;
  medicineName: string;
  genericName?: string;
  strength: string;
  dosage: string; // e.g. "1 Tablet"
  frequency: string; // e.g. "Once daily", "Twice daily"
  timing: 'before_meal' | 'after_meal' | 'with_meal' | 'anytime';
  duration: string; // e.g. "30 days"
  instructions: string;
  pharmacyProductId?: string;
}

export interface TreatmentPrescription {
  id: string;
  consultationId: string;
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  doctorRegNumber: string;
  doctorSpecialty: string;
  clinicName: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  issuedAt: string;
  validUntil: string;
  diagnosis: string;
  generalInstructions: string;
  items: TreatmentPrescriptionItem[];
  status: 'active' | 'completed' | 'cancelled';
  isArchivedToRecords?: boolean;
}

export interface LabTestResultItem {
  parameter: string;
  value: string | number;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'high' | 'low';
}

export interface TreatmentRecord {
  id: string;
  patientId: string;
  type: 'lab_report' | 'imaging' | 'prescription_scan' | 'discharge_summary' | 'clinical_note';
  title: string;
  labOrClinic: string;
  recordDate: string;
  description: string;
  sizeBytes: number;
  mimeType: string;
  hiddenFromDoctors: boolean;
  tags: string[];
  prescriptionId?: string;
  testResults?: LabTestResultItem[];
  fileUrl?: string;
  uploadedBy: string;
  createdAt: string;
}

export interface TreatmentConsultation {
  id: string;
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  patientId: string;
  patientName: string;
  date: string;
  mode: ConsultationMode;
  status: 'scheduled' | 'in_progress' | 'completed';
  chiefComplaint: string;
  vitals: TreatmentVitals;
  clinicalNotes: string;
  diagnosis: string;
  prescriptionsIssued: string[]; // prescription IDs
  labTestsOrdered: string[];
  followUpDate?: string;
  chatMessages: {
    id: string;
    sender: 'doctor' | 'patient';
    senderName: string;
    text: string;
    timestamp: string;
  }[];
}

export interface TreatmentMedicine {
  id: string;
  patientId: string;
  name: string;
  genericName?: string;
  brand: string;
  strength: string;
  dosageForm: string;
  instructions: string;
  source: 'prescribed' | 'self_reported';
  status: 'active' | 'paused' | 'stopped';
  prescribedBy?: string;
  prescriptionId?: string;
  refillsRemaining: number;
  daysSupplyRemaining: number;
  startedOn: string;
  dailySlots: ('morning' | 'afternoon' | 'evening' | 'night')[];
}

export interface TreatmentReminder {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
  scheduledTime: string; // e.g. "08:30 AM"
  timing: string; // e.g. "After breakfast"
  status: 'pending' | 'taken' | 'missed';
  takenAt?: string;
  date: string; // YYYY-MM-DD
}

export interface PharmacyProduct {
  id: string;
  name: string;
  genericName: string;
  brand: string;
  strength: string;
  category: 'cardiac' | 'diabetes' | 'antibiotics' | 'pain' | 'vitamins' | 'respiratory' | 'devices';
  categoryLabel: string;
  dosageForm: string; // Tablet, Capsule, Syrup, Inhaler, Strip
  packSize: string;
  price: number;
  mrp: number;
  inStock: boolean;
  requiresPrescription: boolean;
  rating: number;
  reviewsCount: number;
  description: string;
  manufacturer: string;
  imageUrl?: string;
}

export interface PharmacyCartItem {
  product: PharmacyProduct;
  quantity: number;
  prescriptionId?: string;
}

export interface OrderTrackingStep {
  step: 'pending_review' | 'confirmed' | 'packed' | 'out_for_delivery' | 'delivered';
  title: string;
  description: string;
  time?: string;
  completed: boolean;
  active: boolean;
}

export interface PharmacyOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  date: string;
  items: {
    product: PharmacyProduct;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: 'cash_on_delivery' | 'mock_online' | 'mock_upi';
  paymentStatus: 'paid' | 'unpaid';
  deliveryAddress: {
    fullName: string;
    street: string;
    city: string;
    postalCode: string;
    phone: string;
  };
  deliverySpeed: 'standard' | 'express';
  status: 'pending_review' | 'confirmed' | 'packed' | 'out_for_delivery' | 'delivered';
  trackingSteps: OrderTrackingStep[];
  deliveryAgent?: {
    name: string;
    phone: string;
    vehicle: string;
    otp: string;
  };
  prescriptionAttached?: boolean;
}
