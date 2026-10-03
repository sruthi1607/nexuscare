import { useSyncExternalStore } from 'react';
import type {
  PharmacyCartItem,
  PharmacyOrder,
  PharmacyProduct,
  TreatmentAppointment,
  TreatmentConsultation,
  TreatmentMedicine,
  TreatmentPrescription,
  TreatmentPrescriptionItem,
  TreatmentRecord,
  TreatmentReminder,
  TreatmentVitals,
} from './types';

// Realistic Catalog of medicines
export const PHARMACY_CATALOG: PharmacyProduct[] = [
  {
    id: 'prod-telmisartan-40',
    name: 'Telmisartan 40mg',
    genericName: 'Telmisartan',
    brand: 'Telma / Micardis',
    strength: '40 mg',
    category: 'cardiac',
    categoryLabel: 'Cardiovascular & BP',
    dosageForm: 'Tablets',
    packSize: 'Strip of 30 tablets',
    price: 18.5,
    mrp: 24.0,
    inStock: true,
    requiresPrescription: true,
    rating: 4.8,
    reviewsCount: 142,
    description:
      'Angiotensin II receptor blocker used for management of hypertension and cardiovascular risk reduction.',
    manufacturer: 'Glenmark Pharmaceuticals',
  },
  {
    id: 'prod-atorvastatin-10',
    name: 'Atorvastatin 10mg',
    genericName: 'Atorvastatin Calcium',
    brand: 'Lipitor / Atorva',
    strength: '10 mg',
    category: 'cardiac',
    categoryLabel: 'Cardiovascular & BP',
    dosageForm: 'Tablets',
    packSize: 'Strip of 30 tablets',
    price: 15.0,
    mrp: 21.0,
    inStock: true,
    requiresPrescription: true,
    rating: 4.9,
    reviewsCount: 198,
    description: 'HMG-CoA reductase inhibitor used to lower LDL cholesterol and triglycerides.',
    manufacturer: 'Pfizer / Zydus',
  },
  {
    id: 'prod-metformin-500',
    name: 'Metformin 500mg ER',
    genericName: 'Metformin Hydrochloride',
    brand: 'Glucophage XR',
    strength: '500 mg',
    category: 'diabetes',
    categoryLabel: 'Diabetes Care',
    dosageForm: 'Tablets',
    packSize: 'Strip of 20 tablets',
    price: 12.0,
    mrp: 16.5,
    inStock: true,
    requiresPrescription: true,
    rating: 4.7,
    reviewsCount: 89,
    description:
      'First-line extended-release oral biguanide for type 2 diabetes blood glucose regulation.',
    manufacturer: 'Merck Healthcare',
  },
  {
    id: 'prod-vitamind-60k',
    name: 'Vitamin D3 60,000 IU',
    genericName: 'Cholecalciferol',
    brand: 'Calcitas D3',
    strength: '60,000 IU',
    category: 'vitamins',
    categoryLabel: 'Vitamins & Supplements',
    dosageForm: 'Softgel Capsules',
    packSize: 'Box of 8 softgels',
    price: 14.0,
    mrp: 18.0,
    inStock: true,
    requiresPrescription: false,
    rating: 4.9,
    reviewsCount: 310,
    description:
      'High-potency weekly vitamin D3 supplement for bone health, calcium absorption and immune support.',
    manufacturer: 'Cadila Pharma',
  },
  {
    id: 'prod-amoxicillin-500',
    name: 'Amoxicillin & Clavulanate 625mg',
    genericName: 'Amoxicillin + Clavulanic Acid',
    brand: 'Augmentin 625 Duo',
    strength: '500mg + 125mg',
    category: 'antibiotics',
    categoryLabel: 'Antibiotics',
    dosageForm: 'Tablets',
    packSize: 'Strip of 10 tablets',
    price: 22.0,
    mrp: 28.5,
    inStock: true,
    requiresPrescription: true,
    rating: 4.6,
    reviewsCount: 76,
    description:
      'Broad-spectrum penicillin antibiotic combined with beta-lactamase inhibitor for bacterial infections.',
    manufacturer: 'GSK Pharmaceuticals',
  },
  {
    id: 'prod-paracetamol-650',
    name: 'Paracetamol 650mg',
    genericName: 'Acetaminophen / Paracetamol',
    brand: 'Dolo 650',
    strength: '650 mg',
    category: 'pain',
    categoryLabel: 'Pain & Fever Relief',
    dosageForm: 'Tablets',
    packSize: 'Strip of 15 tablets',
    price: 6.5,
    mrp: 9.0,
    inStock: true,
    requiresPrescription: false,
    rating: 4.9,
    reviewsCount: 520,
    description: 'Fast-acting analgesic and antipyretic for mild-to-moderate fever, headache, and body pain.',
    manufacturer: 'Micro Labs',
  },
  {
    id: 'prod-omeprazole-20',
    name: 'Omeprazole 20mg Delayed Release',
    genericName: 'Omeprazole',
    brand: 'Prilosec / Omez',
    strength: '20 mg',
    category: 'pain',
    categoryLabel: 'Gastrointestinal Care',
    dosageForm: 'Capsules',
    packSize: 'Strip of 15 capsules',
    price: 11.0,
    mrp: 14.5,
    inStock: true,
    requiresPrescription: false,
    rating: 4.7,
    reviewsCount: 165,
    description: 'Proton pump inhibitor for relief from gastric acid reflux, heartburn and gastritis.',
    manufacturer: 'Dr. Reddy’s Labs',
  },
  {
    id: 'prod-cetirizine-10',
    name: 'Cetirizine 10mg Non-Drowsy',
    genericName: 'Cetirizine Hydrochloride',
    brand: 'Zyrtec / Cetzine',
    strength: '10 mg',
    category: 'respiratory',
    categoryLabel: 'Allergy & Respiratory',
    dosageForm: 'Tablets',
    packSize: 'Strip of 10 tablets',
    price: 7.0,
    mrp: 10.0,
    inStock: true,
    requiresPrescription: false,
    rating: 4.8,
    reviewsCount: 230,
    description:
      'Second-generation antihistamine for rapid 24-hour relief of allergies, allergic rhinitis and hives.',
    manufacturer: 'Cipla Healthcare',
  },
  {
    id: 'prod-bp-monitor',
    name: 'Digital Upper Arm BP Monitor',
    genericName: 'Oscillometric Sphygmomanometer',
    brand: 'NexusCare ProHealth Monitor',
    strength: 'Standard Arm Cuff (22-42 cm)',
    category: 'devices',
    categoryLabel: 'Medical Devices',
    dosageForm: 'Device with USB-C & Bluetooth',
    packSize: '1 unit with pouch & batteries',
    price: 45.0,
    mrp: 65.0,
    inStock: true,
    requiresPrescription: false,
    rating: 4.9,
    reviewsCount: 88,
    description:
      'Clinically validated digital blood pressure monitor with irregular heartbeat detection and app sync.',
    manufacturer: 'Omron Healthcare / NexusCare',
  },
  {
    id: 'prod-glucometer-strips',
    name: 'Blood Glucose Test Strips (50 ct)',
    genericName: 'Glucose Reagent Test Strips',
    brand: 'Accu-Chek Active',
    strength: '50 Test Strips',
    category: 'devices',
    categoryLabel: 'Medical Devices',
    dosageForm: 'Strips Vial',
    packSize: 'Vial of 50 strips',
    price: 24.0,
    mrp: 32.0,
    inStock: true,
    requiresPrescription: false,
    rating: 4.8,
    reviewsCount: 174,
    description: 'Fast 5-second test strips with underdose detection for precise diabetic self-monitoring.',
    manufacturer: 'Roche Diabetes Care',
  },
];

function dateString(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.toISOString().split('T')[0] ?? '2026-10-03';
}

const INITIAL_APPOINTMENTS: TreatmentAppointment[] = [
  {
    id: 'apt-101',
    doctorId: '00000000-0000-4000-8000-000000000002',
    doctorName: 'Dr. Arvind Mehta, MD',
    doctorSpecialty: 'Cardiology & Preventive Medicine',
    patientId: '00000000-0000-4000-8000-000000000001',
    patientName: 'Sarah Jenkins',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(), // in 30 mins
    durationMinutes: 30,
    mode: 'video',
    status: 'scheduled',
    reasonForVisit: 'Hypertension follow-up & persistent morning dizziness review',
    consultationId: 'con-101',
  },
  {
    id: 'apt-102',
    doctorId: 'doc-sarah-chen',
    doctorName: 'Dr. Sarah Chen, MD',
    doctorSpecialty: 'Internal Medicine',
    patientId: '00000000-0000-4000-8000-000000000001',
    patientName: 'Sarah Jenkins',
    scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
    durationMinutes: 30,
    mode: 'video',
    status: 'completed',
    reasonForVisit: 'Routine health checkup and fatigue discussion',
    consultationId: 'con-100',
  },
];

const INITIAL_CONSULTATIONS: TreatmentConsultation[] = [
  {
    id: 'con-101',
    appointmentId: 'apt-101',
    doctorId: '00000000-0000-4000-8000-000000000002',
    doctorName: 'Dr. Arvind Mehta, MD',
    doctorSpecialty: 'Cardiology & Preventive Medicine',
    patientId: '00000000-0000-4000-8000-000000000001',
    patientName: 'Sarah Jenkins',
    date: dateString(0),
    mode: 'video',
    status: 'scheduled',
    chiefComplaint: 'Blood pressure readings fluctuating around 138/88 mmHg. Occasional morning dizziness.',
    vitals: {
      bpSystolic: 136,
      bpDiastolic: 86,
      heartRate: 74,
      spo2: 98,
      temperatureF: 98.4,
      weightKg: 68.5,
      respiratoryRate: 16,
    },
    clinicalNotes:
      'Patient reports consistent morning elevations in BP. Compliant with lifestyle modifications. S1/S2 distinct, no carotid bruits. Peripheral pulses bilaterally intact. Advised initiation of Telmisartan 40mg + continuation of lipid lowering therapy.',
    diagnosis: 'Essential Stage 1 Hypertension (ICD-10: I10); Borderline Dyslipidemia',
    prescriptionsIssued: ['rx-201'],
    labTestsOrdered: ['Comprehensive Lipid Panel', 'Serum Electrolytes & Creatinine', '25-OH Vitamin D'],
    followUpDate: dateString(30),
    chatMessages: [
      {
        id: 'msg-1',
        sender: 'doctor',
        senderName: 'Dr. Arvind Mehta',
        text: 'Hello Sarah, welcome. I have reviewed your morning blood pressure readings.',
        timestamp: '10:02 AM',
      },
      {
        id: 'msg-2',
        sender: 'patient',
        senderName: 'Sarah Jenkins',
        text: 'Thank you doctor. I took readings twice daily as requested.',
        timestamp: '10:03 AM',
      },
    ],
  },
  {
    id: 'con-100',
    appointmentId: 'apt-102',
    doctorId: 'doc-sarah-chen',
    doctorName: 'Dr. Sarah Chen, MD',
    doctorSpecialty: 'Internal Medicine',
    patientId: '00000000-0000-4000-8000-000000000001',
    patientName: 'Sarah Jenkins',
    date: dateString(-7),
    mode: 'video',
    status: 'completed',
    chiefComplaint: 'Annual physical examination and routine blood tests',
    vitals: {
      bpSystolic: 134,
      bpDiastolic: 84,
      heartRate: 72,
      spo2: 99,
      temperatureF: 98.6,
      weightKg: 69.0,
      respiratoryRate: 16,
    },
    clinicalNotes:
      'Cardiopulmonary examination clear. Abdomen soft, non-tender. Advised routine blood investigations and cardiology consultation for BP stabilization.',
    diagnosis: 'Elevated blood pressure reading without diagnosis of hypertension (ICD-10 R03.0)',
    prescriptionsIssued: [],
    labTestsOrdered: ['Complete Blood Count (CBC)', 'Lipid Profile'],
    chatMessages: [],
  },
];

const INITIAL_PRESCRIPTIONS: TreatmentPrescription[] = [
  {
    id: 'rx-201',
    consultationId: 'con-101',
    appointmentId: 'apt-101',
    doctorId: '00000000-0000-4000-8000-000000000002',
    doctorName: 'Dr. Arvind Mehta, MD',
    doctorRegNumber: 'MCI-CARD-2014-98214',
    doctorSpecialty: 'Consultant Cardiologist & Heart Failure Specialist',
    clinicName: 'NexusCare Cardiology & Preventive Care Clinic',
    patientId: '00000000-0000-4000-8000-000000000001',
    patientName: 'Sarah Jenkins',
    patientAge: 42,
    patientGender: 'Female',
    issuedAt: new Date().toISOString(),
    validUntil: dateString(90),
    diagnosis: 'Stage 1 Essential Hypertension & Borderline Hyperlipidemia',
    generalInstructions:
      'Take blood pressure medication consistently every morning after breakfast. Monitor home BP 3x weekly. Avoid excessive dietary sodium (<2g/day) and maintain 30 mins brisk walking.',
    status: 'active',
    isArchivedToRecords: true,
    items: [
      {
        id: 'rx-item-1',
        medicineName: 'Telmisartan',
        genericName: 'Telmisartan',
        strength: '40 mg',
        dosage: '1 Tablet',
        frequency: 'Once daily (OD)',
        timing: 'after_meal',
        duration: '30 days',
        instructions: 'Take in the morning with water after breakfast.',
        pharmacyProductId: 'prod-telmisartan-40',
      },
      {
        id: 'rx-item-2',
        medicineName: 'Atorvastatin',
        genericName: 'Atorvastatin Calcium',
        strength: '10 mg',
        dosage: '1 Tablet',
        frequency: 'Once daily at night (HS)',
        timing: 'after_meal',
        duration: '30 days',
        instructions: 'Take after dinner before bedtime.',
        pharmacyProductId: 'prod-atorvastatin-10',
      },
      {
        id: 'rx-item-3',
        medicineName: 'Vitamin D3 (Cholecalciferol)',
        genericName: 'Cholecalciferol',
        strength: '60,000 IU',
        dosage: '1 Softgel Capsule',
        frequency: 'Once weekly',
        timing: 'with_meal',
        duration: '8 weeks',
        instructions: 'Take every Sunday morning with milk or a meal containing healthy fats.',
        pharmacyProductId: 'prod-vitamind-60k',
      },
    ],
  },
];

const INITIAL_RECORDS: TreatmentRecord[] = [
  {
    id: 'rec-301',
    patientId: '00000000-0000-4000-8000-000000000001',
    type: 'lab_report',
    title: 'Comprehensive Lipid & Metabolic Profile',
    labOrClinic: 'Quest Diagnostic Labs / Metropolis Health (NABL Accredited)',
    recordDate: dateString(-4),
    description:
      'Fasting lipid panel and basic metabolic chemistry including serum electrolytes, glucose, and renal function markers.',
    sizeBytes: 428000,
    mimeType: 'application/pdf',
    hiddenFromDoctors: false,
    tags: ['Lipid Panel', 'Cholesterol', 'Glucose', 'Blood Test'],
    uploadedBy: 'Dr. Sarah Chen, MD',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    testResults: [
      {
        parameter: 'Total Cholesterol',
        value: 228,
        unit: 'mg/dL',
        referenceRange: '< 200 mg/dL',
        status: 'high',
      },
      {
        parameter: 'HDL (Good) Cholesterol',
        value: 46,
        unit: 'mg/dL',
        referenceRange: '> 40 mg/dL',
        status: 'normal',
      },
      {
        parameter: 'LDL (Bad) Cholesterol',
        value: 148,
        unit: 'mg/dL',
        referenceRange: '< 100 mg/dL',
        status: 'high',
      },
      {
        parameter: 'Triglycerides',
        value: 174,
        unit: 'mg/dL',
        referenceRange: '< 150 mg/dL',
        status: 'high',
      },
      {
        parameter: 'Fasting Blood Glucose',
        value: 94,
        unit: 'mg/dL',
        referenceRange: '70 - 99 mg/dL',
        status: 'normal',
      },
      {
        parameter: 'Serum Creatinine',
        value: 0.88,
        unit: 'mg/dL',
        referenceRange: '0.6 - 1.1 mg/dL',
        status: 'normal',
      },
      {
        parameter: 'Serum Potassium (K+)',
        value: 4.4,
        unit: 'mEq/L',
        referenceRange: '3.5 - 5.1 mEq/L',
        status: 'normal',
      },
      {
        parameter: 'Vitamin D3 (25-OH)',
        value: 18.2,
        unit: 'ng/mL',
        referenceRange: '30 - 100 ng/mL',
        status: 'low',
      },
    ],
  },
  {
    id: 'rec-302',
    patientId: '00000000-0000-4000-8000-000000000001',
    type: 'imaging',
    title: '12-Lead Electrocardiogram (ECG) Tracing',
    labOrClinic: 'Apollo Cardiovascular Center',
    recordDate: dateString(-12),
    description:
      'Standard resting 12-lead ECG. Normal sinus rhythm, HR 74 bpm. Normal axis, no pathological Q waves or ST-T changes.',
    sizeBytes: 1250000,
    mimeType: 'image/png',
    hiddenFromDoctors: false,
    tags: ['ECG', 'Cardiology', 'Sinus Rhythm'],
    uploadedBy: 'Sarah Jenkins',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    testResults: [
      {
        parameter: 'Heart Rate',
        value: 74,
        unit: 'bpm',
        referenceRange: '60 - 100 bpm',
        status: 'normal',
      },
      {
        parameter: 'PR Interval',
        value: 156,
        unit: 'ms',
        referenceRange: '120 - 200 ms',
        status: 'normal',
      },
      {
        parameter: 'QRS Duration',
        value: 88,
        unit: 'ms',
        referenceRange: '80 - 120 ms',
        status: 'normal',
      },
      {
        parameter: 'QTc Interval',
        value: 418,
        unit: 'ms',
        referenceRange: '< 450 ms',
        status: 'normal',
      },
    ],
  },
  {
    id: 'rec-303',
    patientId: '00000000-0000-4000-8000-000000000001',
    type: 'prescription_scan',
    title: 'Digital Prescription Slip — Dr. Arvind Mehta',
    labOrClinic: 'NexusCare Cardiology Clinic',
    recordDate: dateString(0),
    description: 'Digitally signed prescription for Telmisartan 40mg, Atorvastatin 10mg, Vitamin D3.',
    sizeBytes: 312000,
    mimeType: 'application/pdf',
    hiddenFromDoctors: false,
    tags: ['Prescription', 'Cardiology', 'Hypertension'],
    prescriptionId: 'rx-201',
    uploadedBy: 'Dr. Arvind Mehta, MD',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_MEDICINES: TreatmentMedicine[] = [
  {
    id: 'med-401',
    patientId: '00000000-0000-4000-8000-000000000001',
    name: 'Telmisartan',
    genericName: 'Telmisartan',
    brand: 'Telma 40',
    strength: '40 mg',
    dosageForm: 'Tablet',
    instructions: '1 tablet once daily in the morning after breakfast',
    source: 'prescribed',
    status: 'active',
    prescribedBy: 'Dr. Arvind Mehta, MD',
    prescriptionId: 'rx-201',
    refillsRemaining: 2,
    daysSupplyRemaining: 28,
    startedOn: dateString(0),
    dailySlots: ['morning'],
  },
  {
    id: 'med-402',
    patientId: '00000000-0000-4000-8000-000000000001',
    name: 'Atorvastatin',
    genericName: 'Atorvastatin Calcium',
    brand: 'Atorva 10',
    strength: '10 mg',
    dosageForm: 'Tablet',
    instructions: '1 tablet once daily at bedtime after dinner',
    source: 'prescribed',
    status: 'active',
    prescribedBy: 'Dr. Arvind Mehta, MD',
    prescriptionId: 'rx-201',
    refillsRemaining: 2,
    daysSupplyRemaining: 28,
    startedOn: dateString(0),
    dailySlots: ['evening'],
  },
  {
    id: 'med-403',
    patientId: '00000000-0000-4000-8000-000000000001',
    name: 'Vitamin D3',
    genericName: 'Cholecalciferol',
    brand: 'Calcitas D3',
    strength: '60,000 IU',
    dosageForm: 'Capsule',
    instructions: '1 softgel once weekly on Sunday mornings with breakfast',
    source: 'prescribed',
    status: 'active',
    prescribedBy: 'Dr. Arvind Mehta, MD',
    prescriptionId: 'rx-201',
    refillsRemaining: 1,
    daysSupplyRemaining: 7,
    startedOn: dateString(0),
    dailySlots: ['morning'],
  },
  {
    id: 'med-404',
    patientId: '00000000-0000-4000-8000-000000000001',
    name: 'Omega-3 Fish Oil',
    genericName: 'EPA + DHA Ethyl Esters',
    brand: 'TrueBasics Triple Strength',
    strength: '1000 mg',
    dosageForm: 'Softgel',
    instructions: '1 softgel daily with lunch',
    source: 'self_reported',
    status: 'active',
    refillsRemaining: 0,
    daysSupplyRemaining: 12,
    startedOn: '2026-01-15',
    dailySlots: ['afternoon'],
  },
];

const TODAY_DATE: string = dateString(0);

const INITIAL_REMINDERS: TreatmentReminder[] = [
  {
    id: 'rem-501',
    medicineId: 'med-401',
    medicineName: 'Telmisartan 40mg',
    dosage: '1 Tablet',
    timeSlot: 'morning',
    scheduledTime: '08:30 AM',
    timing: 'After breakfast',
    status: 'taken',
    takenAt: '08:42 AM',
    date: TODAY_DATE,
  },
  {
    id: 'rem-502',
    medicineId: 'med-404',
    medicineName: 'Omega-3 Fish Oil 1000mg',
    dosage: '1 Softgel',
    timeSlot: 'afternoon',
    scheduledTime: '01:30 PM',
    timing: 'With lunch',
    status: 'pending',
    date: TODAY_DATE,
  },
  {
    id: 'rem-503',
    medicineId: 'med-402',
    medicineName: 'Atorvastatin 10mg',
    dosage: '1 Tablet',
    timeSlot: 'evening',
    scheduledTime: '09:00 PM',
    timing: 'After dinner before bed',
    status: 'pending',
    date: TODAY_DATE,
  },
  {
    id: 'rem-504',
    medicineId: 'med-403',
    medicineName: 'Vitamin D3 60k IU',
    dosage: '1 Capsule',
    timeSlot: 'morning',
    scheduledTime: '09:00 AM (Sunday)',
    timing: 'Sunday morning with milk',
    status: 'pending',
    date: TODAY_DATE,
  },
];

const INITIAL_ORDERS: PharmacyOrder[] = [
  {
    id: 'ord-8910',
    orderNumber: 'NX-PHARM-89102',
    patientId: '00000000-0000-4000-8000-000000000001',
    patientName: 'Sarah Jenkins',
    date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    items: [
      {
        product: PHARMACY_CATALOG[0]!, // Telmisartan 40
        quantity: 1,
        price: 18.5,
      },
      {
        product: PHARMACY_CATALOG[1]!, // Atorvastatin 10
        quantity: 1,
        price: 15.0,
      },
      {
        product: PHARMACY_CATALOG[3]!, // Vitamin D3
        quantity: 1,
        price: 14.0,
      },
    ],
    subtotal: 47.5,
    deliveryFee: 0,
    discount: 5.0,
    total: 42.5,
    paymentMethod: 'mock_online',
    paymentStatus: 'paid',
    deliveryAddress: {
      fullName: 'Sarah Jenkins',
      street: '742 Evergreen Terrace, Apt 4B',
      city: 'Metroville',
      postalCode: '110001',
      phone: '+1 (555) 234-5678',
    },
    deliverySpeed: 'express',
    status: 'out_for_delivery',
    prescriptionAttached: true,
    deliveryAgent: {
      name: 'Rohan Sharma',
      phone: '+1 (555) 892-3341',
      vehicle: 'Electric Courier Bike (NexusExpress #14)',
      otp: '4921',
    },
    trackingSteps: [
      {
        step: 'pending_review',
        title: 'Order Placed & Prescription Received',
        description: 'Order logged with prescription Rx-201 attached.',
        time: '11:00 AM',
        completed: true,
        active: false,
      },
      {
        step: 'confirmed',
        title: 'Prescription Verified by Licensed Pharmacist',
        description: 'Verified by Dr. Neha Kapoor (Reg: PHARM-2019-331).',
        time: '11:20 AM',
        completed: true,
        active: false,
      },
      {
        step: 'packed',
        title: 'Medicines Picked & Temperature-Sealed',
        description: 'Packed at NexusCare Central Pharmacy Hub #2.',
        time: '11:55 AM',
        completed: true,
        active: false,
      },
      {
        step: 'out_for_delivery',
        title: 'Out for Express 2-Hour Delivery',
        description: 'Rohan Sharma is en route to your address. Provide OTP 4921 upon delivery.',
        time: '12:30 PM',
        completed: false,
        active: true,
      },
      {
        step: 'delivered',
        title: 'Delivered',
        description: 'Package delivered and handed over safely.',
        completed: false,
        active: false,
      },
    ],
  },
];

export interface TreatmentState {
  appointments: TreatmentAppointment[];
  consultations: TreatmentConsultation[];
  prescriptions: TreatmentPrescription[];
  records: TreatmentRecord[];
  medicines: TreatmentMedicine[];
  reminders: TreatmentReminder[];
  cart: PharmacyCartItem[];
  orders: PharmacyOrder[];
}

const STORAGE_KEY = 'nexuscare_treatment_flow_state_v1';

function loadStoredState(): TreatmentState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<TreatmentState>;
      return {
        appointments: parsed.appointments ?? INITIAL_APPOINTMENTS,
        consultations: parsed.consultations ?? INITIAL_CONSULTATIONS,
        prescriptions: parsed.prescriptions ?? INITIAL_PRESCRIPTIONS,
        records: parsed.records ?? INITIAL_RECORDS,
        medicines: parsed.medicines ?? INITIAL_MEDICINES,
        reminders: parsed.reminders ?? INITIAL_REMINDERS,
        cart: parsed.cart ?? [],
        orders: parsed.orders ?? INITIAL_ORDERS,
      };
    }
  } catch {
    // ignore parse error
  }
  return {
    appointments: INITIAL_APPOINTMENTS,
    consultations: INITIAL_CONSULTATIONS,
    prescriptions: INITIAL_PRESCRIPTIONS,
    records: INITIAL_RECORDS,
    medicines: INITIAL_MEDICINES,
    reminders: INITIAL_REMINDERS,
    cart: [],
    orders: INITIAL_ORDERS,
  };
}

let currentState: TreatmentState = loadStoredState();
const listeners = new Set<() => void>();

function notify() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
  } catch {
    // Ignore storage quota
  }
  listeners.forEach((listener) => listener());
}

function updateState(updater: (prev: TreatmentState) => TreatmentState) {
  currentState = updater(currentState);
  notify();
}

// Public API Store Methods
export const treatmentStore = {
  getState(): TreatmentState {
    return currentState;
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  // Appointments
  addAppointment(appointment: Omit<TreatmentAppointment, 'id'>) {
    const newId = `apt-${Date.now()}`;
    const newConsultationId = `con-${Date.now()}`;
    const createdAppointment: TreatmentAppointment = {
      ...appointment,
      id: newId,
      consultationId: newConsultationId,
    };

    const createdConsultation: TreatmentConsultation = {
      id: newConsultationId,
      appointmentId: newId,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName,
      doctorSpecialty: appointment.doctorSpecialty,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      date: appointment.scheduledAt.split('T')[0] ?? TODAY_DATE,
      mode: appointment.mode,
      status: 'scheduled',
      chiefComplaint: appointment.reasonForVisit,
      vitals: {
        bpSystolic: 128,
        bpDiastolic: 82,
        heartRate: 72,
        spo2: 99,
        temperatureF: 98.4,
        weightKg: 68.0,
      },
      clinicalNotes: '',
      diagnosis: '',
      prescriptionsIssued: [],
      labTestsOrdered: [],
      chatMessages: [],
    };

    updateState((s) => ({
      ...s,
      appointments: [createdAppointment, ...s.appointments],
      consultations: [createdConsultation, ...s.consultations],
    }));

    return createdAppointment;
  },

  updateAppointmentStatus(
    id: string,
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled',
  ) {
    updateState((s) => ({
      ...s,
      appointments: s.appointments.map((a) => (a.id === id ? { ...a, status } : a)),
      consultations: s.consultations.map((c) =>
        c.appointmentId === id
          ? {
              ...c,
              status:
                status === 'in_progress'
                  ? 'in_progress'
                  : status === 'completed'
                    ? 'completed'
                    : c.status,
            }
          : c,
      ),
    }));
  },

  // Consultations
  updateConsultation(id: string, updates: Partial<TreatmentConsultation>) {
    updateState((s) => ({
      ...s,
      consultations: s.consultations.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  },

  addConsultationMessage(consultationId: string, text: string, sender: 'doctor' | 'patient', senderName: string) {
    updateState((s) => ({
      ...s,
      consultations: s.consultations.map((c) => {
        if (c.id !== consultationId) return c;
        const newMsg = {
          id: `msg-${Date.now()}`,
          sender,
          senderName,
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        return {
          ...c,
          chatMessages: [...c.chatMessages, newMsg],
        };
      }),
    }));
  },

  // Complete consultation and create prescription
  completeConsultationWithPrescription(
    consultationId: string,
    clinicalNotes: string,
    diagnosis: string,
    vitals: TreatmentVitals,
    prescriptionItems: Omit<TreatmentPrescriptionItem, 'id'>[],
    generalInstructions: string,
  ) {
    const consultation = currentState.consultations.find((c) => c.id === consultationId);
    if (!consultation) return null;

    const prescriptionId = `rx-${Date.now().toString().slice(-4)}`;
    const fullItems: TreatmentPrescriptionItem[] = prescriptionItems.map((item, idx) => ({
      ...item,
      id: `rx-item-${Date.now()}-${idx}`,
    }));

    const newPrescription: TreatmentPrescription = {
      id: prescriptionId,
      consultationId,
      appointmentId: consultation.appointmentId,
      doctorId: consultation.doctorId,
      doctorName: consultation.doctorName,
      doctorRegNumber: 'MCI-REG-2016-88341',
      doctorSpecialty: consultation.doctorSpecialty,
      clinicName: 'NexusCare Telemedicine & Clinical Care',
      patientId: consultation.patientId,
      patientName: consultation.patientName,
      patientAge: 42,
      patientGender: 'Female',
      issuedAt: new Date().toISOString(),
      validUntil:
        new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString().split('T')[0] ??
        TODAY_DATE,
      diagnosis,
      generalInstructions,
      status: 'active',
      items: fullItems,
      isArchivedToRecords: true,
    };

    // Auto-create Medical Record for this prescription
    const newRecord: TreatmentRecord = {
      id: `rec-rx-${prescriptionId}`,
      patientId: consultation.patientId,
      type: 'prescription_scan',
      title: `Prescription Slip — ${consultation.doctorName}`,
      labOrClinic: 'NexusCare Digital Clinic',
      recordDate: new Date().toISOString().split('T')[0] ?? TODAY_DATE,
      description: `Prescribed medications: ${fullItems.map((i) => `${i.medicineName} ${i.strength}`).join(', ')}. Diagnosis: ${diagnosis}`,
      sizeBytes: 284000,
      mimeType: 'application/pdf',
      hiddenFromDoctors: false,
      tags: ['Prescription', 'Consultation', diagnosis.split(' ')[0] ?? 'Clinical'],
      prescriptionId,
      uploadedBy: consultation.doctorName,
      createdAt: new Date().toISOString(),
    };

    // Auto-create/sync Current Medicines & Daily Reminders
    const newMedicines: TreatmentMedicine[] = fullItems.map((item, i) => {
      const slot: 'morning' | 'afternoon' | 'evening' | 'night' =
        item.timing === 'after_meal' && item.frequency.toLowerCase().includes('night')
          ? 'evening'
          : item.frequency.toLowerCase().includes('lunch')
            ? 'afternoon'
            : 'morning';

      return {
        id: `med-${Date.now()}-${i}`,
        patientId: consultation.patientId,
        name: item.medicineName,
        genericName: item.genericName ?? item.medicineName,
        brand: item.medicineName,
        strength: item.strength,
        dosageForm: item.dosage.includes('Capsule') ? 'Capsule' : 'Tablet',
        instructions: `${item.dosage} - ${item.frequency} (${item.instructions})`,
        source: 'prescribed',
        status: 'active',
        prescribedBy: consultation.doctorName,
        prescriptionId,
        refillsRemaining: 3,
        daysSupplyRemaining: 30,
        startedOn: new Date().toISOString().split('T')[0] ?? TODAY_DATE,
        dailySlots: [slot],
      };
    });

    const newReminders: TreatmentReminder[] = newMedicines.map((med, i) => ({
      id: `rem-${Date.now()}-${i}`,
      medicineId: med.id,
      medicineName: `${med.name} ${med.strength}`,
      dosage: fullItems[i]?.dosage ?? '1 Tablet',
      timeSlot: med.dailySlots[0] ?? 'morning',
      scheduledTime:
        med.dailySlots[0] === 'morning'
          ? '08:30 AM'
          : med.dailySlots[0] === 'afternoon'
            ? '01:30 PM'
            : '09:00 PM',
      timing: fullItems[i]?.instructions ?? 'Take with water',
      status: 'pending',
      date: TODAY_DATE,
    }));

    updateState((s) => ({
      ...s,
      consultations: s.consultations.map((c) =>
        c.id === consultationId
          ? {
              ...c,
              clinicalNotes,
              diagnosis,
              vitals,
              status: 'completed',
              prescriptionsIssued: [prescriptionId, ...c.prescriptionsIssued],
            }
          : c,
      ),
      appointments: s.appointments.map((a) =>
        a.id === consultation.appointmentId ? { ...a, status: 'completed' } : a,
      ),
      prescriptions: [newPrescription, ...s.prescriptions],
      records: [newRecord, ...s.records],
      medicines: [...newMedicines, ...s.medicines],
      reminders: [...newReminders, ...s.reminders],
    }));

    return newPrescription;
  },

  // 1-Click push prescription items to medicines & reminders
  syncPrescriptionToMedications(prescriptionId: string) {
    const rx = currentState.prescriptions.find((p) => p.id === prescriptionId);
    if (!rx) return;

    const newMeds: TreatmentMedicine[] = rx.items.map((item, i) => {
      const slot: 'morning' | 'afternoon' | 'evening' | 'night' =
        item.timing === 'after_meal' && item.frequency.toLowerCase().includes('night')
          ? 'evening'
          : 'morning';

      return {
        id: `med-${Date.now()}-${i}`,
        patientId: rx.patientId,
        name: item.medicineName,
        genericName: item.genericName ?? item.medicineName,
        brand: item.medicineName,
        strength: item.strength,
        dosageForm: 'Tablet',
        instructions: `${item.dosage} - ${item.frequency} (${item.instructions})`,
        source: 'prescribed',
        status: 'active',
        prescribedBy: rx.doctorName,
        prescriptionId: rx.id,
        refillsRemaining: 2,
        daysSupplyRemaining: 30,
        startedOn: TODAY_DATE,
        dailySlots: [slot],
      };
    });

    const newReminders: TreatmentReminder[] = newMeds.map((med, i) => ({
      id: `rem-sync-${Date.now()}-${i}`,
      medicineId: med.id,
      medicineName: `${med.name} ${med.strength}`,
      dosage: rx.items[i]?.dosage ?? '1 Tablet',
      timeSlot: med.dailySlots[0] ?? 'morning',
      scheduledTime: med.dailySlots[0] === 'morning' ? '08:30 AM' : '09:00 PM',
      timing: rx.items[i]?.instructions ?? 'After meal',
      status: 'pending',
      date: TODAY_DATE,
    }));

    updateState((s) => ({
      ...s,
      medicines: [...newMeds, ...s.medicines],
      reminders: [...newReminders, ...s.reminders],
    }));
  },

  // 1-Click Load Prescription into Pharmacy Cart
  loadPrescriptionIntoPharmacyCart(prescriptionId: string) {
    const rx = currentState.prescriptions.find((p) => p.id === prescriptionId);
    if (!rx) return;

    const newCartItems: PharmacyCartItem[] = [];

    rx.items.forEach((item) => {
      // Find matching catalog product
      const product =
        PHARMACY_CATALOG.find((p) => p.id === item.pharmacyProductId) ??
        PHARMACY_CATALOG.find((p) =>
          p.name.toLowerCase().includes(item.medicineName.toLowerCase()),
        ) ??
        PHARMACY_CATALOG[0];

      if (product) {
        newCartItems.push({
          product,
          quantity: 1,
          prescriptionId: rx.id,
        });
      }
    });

    updateState((s) => {
      const existingProductIds = new Set(s.cart.map((c) => c.product.id));
      const filtered = newCartItems.filter((item) => !existingProductIds.has(item.product.id));
      return {
        ...s,
        cart: [...s.cart, ...filtered],
      };
    });
  },

  // Medical Records & Lab Upload
  uploadMedicalRecord(record: Omit<TreatmentRecord, 'id' | 'createdAt'>) {
    const newRecord: TreatmentRecord = {
      ...record,
      id: `rec-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    updateState((s) => ({
      ...s,
      records: [newRecord, ...s.records],
    }));

    return newRecord;
  },

  toggleRecordPrivacy(recordId: string) {
    updateState((s) => ({
      ...s,
      records: s.records.map((r) =>
        r.id === recordId ? { ...r, hiddenFromDoctors: !r.hiddenFromDoctors } : r,
      ),
    }));
  },

  // Medicines & Reminders
  updateMedicineStatus(id: string, status: 'active' | 'paused' | 'stopped') {
    updateState((s) => ({
      ...s,
      medicines: s.medicines.map((m) => (m.id === id ? { ...m, status } : m)),
    }));
  },

  markReminderStatus(reminderId: string, status: 'taken' | 'missed' | 'pending') {
    const takenTime =
      status === 'taken'
        ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : undefined;

    updateState((s) => ({
      ...s,
      reminders: s.reminders.map((r) =>
        r.id === reminderId
          ? {
              ...r,
              status,
              takenAt: takenTime,
            }
          : r,
      ),
    }));
  },

  // Refill medication -> 1-click add to cart
  refillMedicine(medicineId: string) {
    const med = currentState.medicines.find((m) => m.id === medicineId);
    if (!med) return null;

    const defaultProduct = PHARMACY_CATALOG[0]!;
    const matchedProduct: PharmacyProduct =
      PHARMACY_CATALOG.find((p) =>
        p.name.toLowerCase().includes(med.name.toLowerCase()) ||
        med.name.toLowerCase().includes(p.genericName.toLowerCase()),
      ) ?? defaultProduct;

    updateState((s) => {
      const existing = s.cart.find((c) => c.product.id === matchedProduct.id);
      if (existing) {
        return {
          ...s,
          cart: s.cart.map((c) =>
            c.product.id === matchedProduct.id ? { ...c, quantity: c.quantity + 1 } : c,
          ),
        };
      }
      return {
        ...s,
        cart: [
          ...s.cart,
          { product: matchedProduct, quantity: 1, prescriptionId: med.prescriptionId },
        ],
      };
    });

    return matchedProduct;
  },

  // Pharmacy Cart
  addToCart(product: PharmacyProduct, quantity = 1, prescriptionId?: string) {
    updateState((s) => {
      const existing = s.cart.find((c) => c.product.id === product.id);
      if (existing) {
        return {
          ...s,
          cart: s.cart.map((c) =>
            c.product.id === product.id ? { ...c, quantity: c.quantity + quantity } : c,
          ),
        };
      }
      return {
        ...s,
        cart: [...s.cart, { product, quantity, prescriptionId }],
      };
    });
  },

  updateCartQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    updateState((s) => ({
      ...s,
      cart: s.cart.map((c) => (c.product.id === productId ? { ...c, quantity } : c)),
    }));
  },

  removeFromCart(productId: string) {
    updateState((s) => ({
      ...s,
      cart: s.cart.filter((c) => c.product.id !== productId),
    }));
  },

  clearCart() {
    updateState((s) => ({ ...s, cart: [] }));
  },

  // Checkout and Order
  placeOrder(
    deliveryAddress: {
      fullName: string;
      street: string;
      city: string;
      postalCode: string;
      phone: string;
    },
    paymentMethod: 'cash_on_delivery' | 'mock_online' | 'mock_upi',
    deliverySpeed: 'standard' | 'express',
  ) {
    const { cart } = currentState;
    if (cart.length === 0) return null;

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const deliveryFee = deliverySpeed === 'express' ? 5.0 : subtotal > 30 ? 0 : 3.5;
    const discount = subtotal > 50 ? 5.0 : 0;
    const total = Number((subtotal + deliveryFee - discount).toFixed(2));

    const orderId = `ord-${Date.now()}`;
    const orderNumber = `NX-PHARM-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: PharmacyOrder = {
      id: orderId,
      orderNumber,
      patientId: '00000000-0000-4000-8000-000000000001',
      patientName: deliveryAddress.fullName,
      date: new Date().toISOString(),
      items: cart.map((c) => ({
        product: c.product,
        quantity: c.quantity,
        price: c.product.price,
      })),
      subtotal,
      deliveryFee,
      discount,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash_on_delivery' ? 'unpaid' : 'paid',
      deliveryAddress,
      deliverySpeed,
      status: 'pending_review',
      prescriptionAttached: cart.some((c) => c.product.requiresPrescription),
      deliveryAgent: {
        name: 'Vikram Singh',
        phone: '+1 (555) 349-1120',
        vehicle: 'Express Delivery Partner #22',
        otp: Math.floor(1000 + Math.random() * 9000).toString(),
      },
      trackingSteps: [
        {
          step: 'pending_review',
          title: 'Order Placed & Prescription Review',
          description: 'Your order was received and sent to our partner pharmacy.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          completed: true,
          active: true,
        },
        {
          step: 'confirmed',
          title: 'Prescription Verified & Order Confirmed',
          description: 'Licensed pharmacist verified medicines and dosages.',
          completed: false,
          active: false,
        },
        {
          step: 'packed',
          title: 'Packed & Dispatched',
          description: 'Medicines sealed in tamper-proof climate-controlled packaging.',
          completed: false,
          active: false,
        },
        {
          step: 'out_for_delivery',
          title: 'Out for Delivery',
          description: 'Courier agent has picked up the order and is on the way.',
          completed: false,
          active: false,
        },
        {
          step: 'delivered',
          title: 'Delivered',
          description: 'Package handed over to recipient.',
          completed: false,
          active: false,
        },
      ],
    };

    updateState((s) => ({
      ...s,
      orders: [newOrder, ...s.orders],
      cart: [], // Clear cart after order
    }));

    return newOrder;
  },

  // Interactive "Simulate Next Step" for Order Tracking testing
  advanceOrderStatus(orderId: string) {
    const order = currentState.orders.find((o) => o.id === orderId);
    if (!order) return;

    const sequence: PharmacyOrder['status'][] = [
      'pending_review',
      'confirmed',
      'packed',
      'out_for_delivery',
      'delivered',
    ];

    const currentIndex = sequence.indexOf(order.status);
    if (currentIndex < 0 || currentIndex >= sequence.length - 1) return;

    const nextStatus = sequence[currentIndex + 1];
    if (!nextStatus) return;

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedSteps = order.trackingSteps.map((step, idx) => {
      if (idx <= currentIndex + 1) {
        return {
          ...step,
          completed: idx < currentIndex + 1 || nextStatus === 'delivered',
          active: idx === currentIndex + 1 && nextStatus !== 'delivered',
          time: step.time ?? nowTime,
        };
      }
      return step;
    });

    updateState((s) => ({
      ...s,
      orders: s.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: nextStatus,
              trackingSteps: updatedSteps,
            }
          : o,
      ),
    }));
  },

  // Reset store to demo defaults if needed
  resetToDefaults() {
    currentState = {
      appointments: INITIAL_APPOINTMENTS,
      consultations: INITIAL_CONSULTATIONS,
      prescriptions: INITIAL_PRESCRIPTIONS,
      records: INITIAL_RECORDS,
      medicines: INITIAL_MEDICINES,
      reminders: INITIAL_REMINDERS,
      cart: [],
      orders: INITIAL_ORDERS,
    };
    notify();
  },
};

export function useTreatmentStore(): TreatmentState {
  return useSyncExternalStore(treatmentStore.subscribe, treatmentStore.getState);
}

export function useTreatment() {
  const state = useTreatmentStore();
  return {
    ...state,
    bookAppointment: (apt: Parameters<typeof treatmentStore.addAppointment>[0]) =>
      treatmentStore.addAppointment(apt),
    addAppointment: treatmentStore.addAppointment,
    uploadMedicalRecord: treatmentStore.uploadMedicalRecord,
    addMedicalRecord: treatmentStore.uploadMedicalRecord,
    toggleRecordPrivacy: treatmentStore.toggleRecordPrivacy,
    loadPrescriptionIntoPharmacyCart: treatmentStore.loadPrescriptionIntoPharmacyCart,
    syncPrescriptionToMedications: treatmentStore.syncPrescriptionToMedications,
    updateMedicineStatus: treatmentStore.updateMedicineStatus,
    markReminderStatus: treatmentStore.markReminderStatus,
    refillMedicine: treatmentStore.refillMedicine,
    addToCart: treatmentStore.addToCart,
    updateCartQuantity: treatmentStore.updateCartQuantity,
    removeFromCart: treatmentStore.removeFromCart,
    clearCart: treatmentStore.clearCart,
    placeOrder: treatmentStore.placeOrder,
    advanceOrderStatus: treatmentStore.advanceOrderStatus,
  };
}

