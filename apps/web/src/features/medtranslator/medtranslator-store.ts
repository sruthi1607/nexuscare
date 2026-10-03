import { useSyncExternalStore } from 'react';
import type { MedTranslationReport } from './types';
import { treatmentStore } from '../treatment/treatment-store';
import { notificationsStore } from '../notifications/notifications-store';

export const SAMPLE_REPORTS: MedTranslationReport[] = [
  {
    id: 'report-sample-1',
    title: 'Comprehensive Lipid & Metabolic Blood Panel',
    reportType: 'Lipid & Blood Panel',
    date: '2026-09-28',
    facility: 'Apex Reference Diagnostics',
    originalFileName: 'Lipid_Panel_Sarah_Jenkins.pdf',
    plainSummary: {
      en: 'Your overall blood test shows that your blood sugar levels are borderline elevated (HbA1c 6.8%), indicating pre-diabetes/early diabetes management is needed. Your bad cholesterol (LDL 142 mg/dL) and triglycerides (198 mg/dL) are moderately high, while your good cholesterol (HDL 46 mg/dL) is in a healthy range. Your kidney and liver enzymes are working normally.',
      hi: 'आपकी रक्त जांच से पता चलता है कि आपका ब्लड शुगर स्तर सामान्य से थोड़ा अधिक (HbA1c 6.8%) है। आपका खराब कोलेस्ट्रॉल (LDL 142 mg/dL) और ट्राइग्लिसराइड्स (198 mg/dL) मध्यम रूप से बढ़े हुए हैं, जबकि अच्छा कोलेस्ट्रॉल (HDL 46 mg/dL) स्वस्थ स्तर पर है। आपकी किडनी और लिवर की कार्यक्षमता सामान्य है।',
      es: 'Su análisis de sangre general muestra que sus niveles de azúcar en sangre están en el límite superior (HbA1c 6.8%), lo que indica necesidad de control metabólico. Su colesterol malo (LDL 142 mg/dL) y triglicéridos (198 mg/dL) están moderadamente elevados, mientras que su colesterol bueno (HDL 46 mg/dL) está en un rango saludable. Sus riñones e hígado funcionan normalmente.',
    },
    keyFindings: [
      {
        parameter: 'HbA1c (3-Month Sugar Average)',
        value: '6.8% (Target: < 5.7%)',
        status: 'attention',
        plainExplanation:
          'Measures your average blood sugar over the last 90 days. 6.8% indicates your body needs assistance regulating sugars through diet and prescribed Metformin.',
      },
      {
        parameter: 'LDL (Bad Cholesterol)',
        value: '142 mg/dL (Target: < 100 mg/dL)',
        status: 'warning',
        plainExplanation:
          'Low-density lipoprotein can build up in arterial walls over time. Prescribed Atorvastatin helps reduce this number.',
      },
      {
        parameter: 'Triglycerides (Blood Fats)',
        value: '198 mg/dL (Target: < 150 mg/dL)',
        status: 'attention',
        plainExplanation:
          'Fats circulating in the bloodstream, often linked with dietary sugars and carbohydrate intake.',
      },
      {
        parameter: 'Serum Creatinine (Kidney Function)',
        value: '0.85 mg/dL (Normal: 0.6 - 1.2)',
        status: 'normal',
        plainExplanation: 'Your kidneys are filtering waste efficiently and functioning very well.',
      },
      {
        parameter: 'SGPT/ALT (Liver Health)',
        value: '26 U/L (Normal: 7 - 35)',
        status: 'normal',
        plainExplanation: 'Your liver enzymes are completely within healthy baseline parameters.',
      },
    ],
    medicalGlossary: [
      {
        term: 'Dyslipidemia',
        medicalDefinition: 'An abnormal amount of lipids (e.g. cholesterol and/or fat) in the blood.',
        plainLanguage: 'Imbalanced blood fats (too much bad cholesterol or triglycerides).',
      },
      {
        term: 'Glycated Hemoglobin (HbA1c)',
        medicalDefinition: 'Hemoglobin with attached glucose, proportional to average plasma glucose concentration.',
        plainLanguage: 'A 3-month snapshot of how much sugar has been circulating in your bloodstream.',
      },
      {
        term: 'Triglycerides',
        medicalDefinition: 'Esters derived from glycerol and three fatty acids; main constituents of body fat.',
        plainLanguage: 'The primary form of fat that your body stores and uses for energy.',
      },
      {
        term: 'Creatinine',
        medicalDefinition: 'A breakdown product of creatine phosphate from muscle and protein metabolism.',
        plainLanguage: 'A natural muscle waste product that healthy kidneys filter out through urine.',
      },
    ],
    recommendedQuestions: [
      'Should we adjust the dosage of Metformin based on the 6.8% HbA1c result?',
      'Are there specific dietary changes to help lower my triglycerides below 150 mg/dL?',
      'When should I schedule my next repeat lipid panel to check Atorvastatin effectiveness?',
    ],
  },
  {
    id: 'report-sample-2',
    title: '2D Doppler Echocardiography Report',
    reportType: 'Echocardiogram',
    date: '2026-08-14',
    facility: 'Metro Heart & Vascular Institute',
    originalFileName: 'Echo_Doppler_Sarah_Jenkins.pdf',
    plainSummary: {
      en: 'Your heart ultrasound shows that your heart muscle is pumping blood effectively with a normal ejection fraction (LVEF 62%). All four heart valves are opening and closing smoothly without major leaks. There is mild Grade 1 diastolic stiffness, which is very common with blood pressure changes and age.',
      hi: 'आपकी हृदय अल्ट्रासाउंड जांच दर्शाती है कि आपका दिल सामान्य गति (LVEF 62%) से रक्त पंप कर रहा है। सभी चार वॉल्व सुचारू रूप से कार्य कर रहे हैं। थोड़ा डायस्टोलिक कड़ापन है जो रक्तचाप और उम्र के साथ सामान्य माना जाता है।',
      es: 'Su ecocardiograma muestra que su músculo cardíaco bombea sangre eficientemente con una fracción de eyección normal (LVEF 62%). Las cuatro válvulas cardíacas funcionan bien. Se observa una leve rigidez diastólica Grado 1, común con la presión arterial y la edad.',
    },
    keyFindings: [
      {
        parameter: 'Left Ventricular Ejection Fraction (LVEF)',
        value: '62% (Normal: 55% - 70%)',
        status: 'normal',
        plainExplanation: 'Your heart main pumping chamber squeezes normally with each heartbeat.',
      },
      {
        parameter: 'Diastolic Function',
        value: 'Grade 1 Impairment (Mild)',
        status: 'attention',
        plainExplanation:
          'The heart relaxes slightly slower between beats. Managing your blood pressure helps keep this stable.',
      },
      {
        parameter: 'Valvular Function (Mitral/Aortic)',
        value: 'No significant regurgitation or stenosis',
        status: 'normal',
        plainExplanation: 'Heart valves are opening fully and sealing properly.',
      },
    ],
    medicalGlossary: [
      {
        term: 'Ejection Fraction (LVEF)',
        medicalDefinition: 'The volumetric fraction of fluid ejected from the ventricle with each contraction.',
        plainLanguage: 'The percentage of blood pumped out of the heart chamber with every beat.',
      },
      {
        term: 'Diastolic Relaxation',
        medicalDefinition: 'The phase of the cardiac cycle when the heart muscle relaxes and chambers fill with blood.',
        plainLanguage: 'The resting and filling phase of the heart between beats.',
      },
    ],
    recommendedQuestions: [
      'Is my blood pressure medication (Telmisartan) helping keep my diastolic function stable?',
      'Can I continue with moderate aerobic exercises like brisk walking?',
    ],
  },
];

interface MedTranslatorState {
  currentReport: MedTranslationReport;
  language: 'en' | 'hi' | 'es';
  isProcessing: boolean;
}

let state: MedTranslatorState = {
  currentReport: SAMPLE_REPORTS[0]!,
  language: 'en',
  isProcessing: false,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export const medTranslatorStore = {
  getSnapshot: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  selectSample: (id: string) => {
    const found = SAMPLE_REPORTS.find((r) => r.id === id);
    if (found) {
      state = { ...state, currentReport: found, isProcessing: false };
      notify();
    }
  },

  setLanguage: (lang: 'en' | 'hi' | 'es') => {
    state = { ...state, language: lang };
    notify();
  },

  uploadCustomFile: (fileName: string) => {
    state = { ...state, isProcessing: true };
    notify();

    setTimeout(() => {
      state = {
        ...state,
        isProcessing: false,
        currentReport: {
          id: `custom-${Date.now()}`,
          title: `Translated: ${fileName}`,
          reportType: 'General Lab',
          date: new Date().toISOString().split('T')[0] ?? '2026-10-03',
          facility: 'Uploaded Document',
          originalFileName: fileName,
          plainSummary: {
            en: `The uploaded report (${fileName}) was processed. Key values have been decoded into plain language. Blood chemistry parameters indicate steady progress with mild cholesterol and blood glucose targets needing continued lifestyle and prescription adherence.`,
            hi: `अपलोड की गई रिपोर्ट (${fileName}) का अनुवाद पूरा हो गया है। मुख्य स्वास्थ्य सूचकांक सामान्य नियंत्रण में हैं।`,
            es: `El informe (${fileName}) fue procesado. Los parámetros indican un progreso estable con necesidad de mantener el tratamiento.`,
          },
          keyFindings: [
            {
              parameter: 'Blood Glucose (Fasting)',
              value: '118 mg/dL',
              status: 'attention',
              plainExplanation: 'Slightly above normal fasting baseline (< 100 mg/dL).',
            },
            {
              parameter: 'Cholesterol Ratio',
              value: '3.8 (Healthy)',
              status: 'normal',
              plainExplanation: 'Ratio of total to good cholesterol is in a healthy cardioprotective range.',
            },
          ],
          medicalGlossary: [
            {
              term: 'Fasting Plasma Glucose',
              medicalDefinition: 'Blood sugar level measured after an overnight fast of at least 8 hours.',
              plainLanguage: 'Your baseline sugar level when you have not eaten overnight.',
            },
          ],
          recommendedQuestions: [
            'Should I share this translated report with Dr. Mehta during our next visit?',
          ],
        },
      };
      notify();
    }, 1200);
  },

  saveToMedicalRecords: () => {
    const report = state.currentReport;
    treatmentStore.uploadMedicalRecord({
      patientId: '00000000-0000-4000-8000-000000000001',
      type: 'lab_report',
      title: `MedTranslator: ${report.title}`,
      labOrClinic: report.facility,
      recordDate: report.date,
      description: report.plainSummary.en,
      sizeBytes: 1420000,
      mimeType: 'application/pdf',
      hiddenFromDoctors: false,
      tags: ['medtranslator', 'lab_report', 'decoded'],
      uploadedBy: 'Sarah Jenkins (via MedTranslator)',
      testResults: report.keyFindings.map((k) => ({
        parameter: k.parameter,
        value: k.value,
        referenceRange: 'Target specified',
        unit: '',
        status: k.status === 'normal' ? 'normal' : k.status === 'attention' ? 'high' : 'high',
      })),
    });

    notificationsStore.addNotification({
      category: 'health',
      priority: 'normal',
      title: 'Report Saved to Medical Records',
      message: `${report.title} and plain-language summary added to your Medical Records archive.`,
      actionUrl: '/patient/records',
      actionLabel: 'View in Records',
      roleTarget: 'patient',
    });
  },
};

export function useMedTranslator() {
  const current = useSyncExternalStore(medTranslatorStore.subscribe, medTranslatorStore.getSnapshot);
  return {
    report: current.currentReport,
    language: current.language,
    isProcessing: current.isProcessing,
    selectSample: medTranslatorStore.selectSample,
    setLanguage: medTranslatorStore.setLanguage,
    uploadCustomFile: medTranslatorStore.uploadCustomFile,
    saveToMedicalRecords: medTranslatorStore.saveToMedicalRecords,
  };
}
