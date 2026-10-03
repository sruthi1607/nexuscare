import { useSyncExternalStore } from 'react';
import type { AssistantCitation, AssistantMessage, SuggestedPrompt } from './types';
import { monitoringStore } from '../monitoring/monitoring-store';
import { treatmentStore } from '../treatment/treatment-store';
import { getStoredDemoMedicalProfile } from '../medical/api';

const STORAGE_KEY = 'nexuscare_ai_assistant_history_v2';

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: 'p-hr',
    label: 'What is my heart rate?',
    category: 'cardiac',
    prompt: 'What is my heart rate right now and is it within normal limits?',
  },
  {
    id: 'p-spo2',
    label: 'What does my SpO2 mean?',
    category: 'cardiac',
    prompt: 'What does my SpO2 mean and what is my current oxygen saturation?',
  },
  {
    id: 'p-bp',
    label: 'Explain my blood pressure.',
    category: 'cardiac',
    prompt: 'Explain my blood pressure reading and what the numbers mean.',
  },
  {
    id: 'p-meds',
    label: 'What medicines am I taking?',
    category: 'medication',
    prompt: 'What medicines am I taking and when should I take them?',
  },
  {
    id: 'p-ecg',
    label: 'What is my ECG pattern?',
    category: 'cardiac',
    prompt: 'What is my ECG pattern showing on my connected telemetry?',
  },
  {
    id: 'p-med-info',
    label: 'Explain my medical information.',
    category: 'lifestyle',
    prompt: 'Explain my medical information, chronic conditions, and recorded allergies.',
  },
];

const INITIAL_MESSAGES: AssistantMessage[] = [
  {
    id: 'msg-init-1',
    role: 'assistant',
    content:
      'Hello Sarah! I am your Nexus Care AI Health Assistant.\n\nI can answer questions about your real-time biometrics, medication reminders, medical conditions, and clinical guidelines.\n\n**Disclaimer:** *Nexus AI provides general health information and does not replace professional medical advice.*',
    timestamp: new Date().toISOString(),
    citations: [
      {
        sourceName: 'Nexus Evidence Knowledge Base',
        publication: 'Peer-reviewed clinical guidelines & patient telemetry integration',
        evidenceGrade: 'Grade A',
      },
    ],
  },
];

// Knowledge base responses for instant intelligent answers
function generateAiResponse(userPrompt: string): {
  content: string;
  citations: AssistantCitation[];
  isEmergencyAlert: boolean;
} {
  const p = userPrompt.toLowerCase();
  const vitals = monitoringStore.getState().currentVitals;
  const medicines = treatmentStore.getState().medicines;
  const medicalProfile = getStoredDemoMedicalProfile();

  if (
    p.includes('chest pain') ||
    p.includes('heart attack') ||
    p.includes('left arm') ||
    p.includes('jaw pain') ||
    p.includes('severe shortness of breath') ||
    p.includes('emergency')
  ) {
    return {
      content:
        '⚠️ **CRITICAL EMERGENCY WARNING:** If you or someone around you is experiencing acute crushing chest pressure, pain radiating to the jaw/arm/back, extreme shortness of breath, or cold sweats, **call emergency services (112 or 911) immediately**.\n\nNexus Care has also made the **108 Ambulance Dispatch** and **Emergency SOS** triggers available on your Health Monitoring dashboard.\n\n*Nexus AI provides general health information and does not replace professional medical advice.*',
      citations: [
        {
          sourceName: 'American Heart Association (AHA)',
          publication: 'Guidelines for Acute Coronary Syndrome Triage Protocols',
          evidenceGrade: 'Class I Recommendation',
        },
        {
          sourceName: 'World Health Organization (WHO)',
          publication: 'Emergency Cardiovascular First-Response Guidelines',
        },
      ],
      isEmergencyAlert: true,
    };
  }

  // Heart Rate
  if (p.includes('heart rate') || p.includes('pulse') || p.includes('bpm')) {
    const hr = vitals.heartRate;
    const isElevated = hr > 100;
    const isLow = hr < 60;
    const statusText = isElevated
      ? 'elevated (tachycardia range)'
      : isLow
        ? 'below standard baseline (bradycardia range)'
        : 'within normal resting adult limits (60–100 bpm)';

    return {
      content: `**Your Current Heart Rate:**\n\n• **Live Reading:** **${hr} bpm** (beats per minute)\n• **Assessment:** Your current resting heart rate is ${statusText}.\n• **Normal Range:** A standard healthy resting heart rate for adults ranges between 60 and 100 bpm.\n• **Context:** Heart rate naturally fluctuates with physical exertion, stress, hydration, caffeine, and ambient temperature.\n\n*Nexus AI provides general health information and does not replace professional medical advice.*`,
      citations: [
        {
          sourceName: 'American Heart Association (AHA)',
          publication: 'Target Heart Rates & Resting Pulse Standards',
          evidenceGrade: 'Grade A Consensus',
        },
        {
          sourceName: 'Mayo Clinic Health Information',
          publication: 'Heart Rate: What is normal?',
        },
      ],
      isEmergencyAlert: isElevated,
    };
  }

  // SpO2 / Oxygen Saturation
  if (p.includes('spo2') || p.includes('oxygen') || p.includes('saturation')) {
    const spo2 = vitals.spO2;
    const isHypoxic = spo2 < 95;

    return {
      content: `**Your Current Blood Oxygen (SpO2):**\n\n• **Live Reading:** **${spo2}% SpO2**\n• **What SpO2 Measures:** Oxygen saturation (SpO2) measures the percentage of hemoglobin in your red blood cells carrying oxygen from your lungs throughout your body.\n• **Clinical Targets:**\n  - **Normal & Healthy:** 95% to 100%\n  - **Mild Hypoxia / Borderline:** 91% to 94%\n  - **Critical:** Below 90% requires immediate medical attention\n• **Your Status:** Your reading of ${spo2}% indicates ${
        isHypoxic ? 'lowered oxygen saturation that warrants resting and monitoring' : 'excellent tissue oxygen delivery'
      }.\n\n*Nexus AI provides general health information and does not replace professional medical advice.*`,
      citations: [
        {
          sourceName: 'World Health Organization (WHO)',
          publication: 'Pulse Oximetry Training Manual & Hypoxia Recognition',
          evidenceGrade: 'Grade A Evidence',
        },
      ],
      isEmergencyAlert: isHypoxic,
    };
  }

  // Blood Pressure
  if (p.includes('blood pressure') || p.includes('bp') || p.includes('systolic') || p.includes('diastolic')) {
    const sys = vitals.bloodPressureSystolic;
    const dia = vitals.bloodPressureDiastolic;

    return {
      content: `**Your Current Blood Pressure:**\n\n• **Live Reading:** **${sys}/${dia} mmHg**\n• **Understanding the Numbers:**\n  - **Systolic (${sys} mmHg):** The pressure in your blood vessels when your heart contracts.\n  - **Diastolic (${dia} mmHg):** The pressure in your blood vessels when your heart rests between beats.\n• **Target Categories:**\n  - **Normal:** < 120/< 80 mmHg\n  - **Elevated:** 120–129/< 80 mmHg\n  - **Hypertension Stage 1:** 130–139/80–89 mmHg\n• **Your Plan:** You are taking **Telmisartan 40mg** daily as prescribed by Dr. Arvind Mehta, which helps keep your vascular resistance controlled.\n\n*Nexus AI provides general health information and does not replace professional medical advice.*`,
      citations: [
        {
          sourceName: 'American College of Cardiology / AHA',
          publication: 'High Blood Pressure Clinical Practice Guidelines',
          evidenceGrade: 'Class I Recommendation',
        },
      ],
      isEmergencyAlert: false,
    };
  }

  // Medicines
  if (p.includes('medicine') || p.includes('medication') || p.includes('pill') || p.includes('taking') || p.includes('drug')) {
    const medList = medicines.map((m) => `• **${m.name}** (${m.strength}) — [${m.instructions}]`).join('\n');

    return {
      content: `**Your Current Active Medications:**\n\n${medList}\n\n**Key Safety Reminders:**\n1. Take **Telmisartan 40mg** in the morning to maintain continuous 24-hour blood pressure control.\n2. Take **Metformin 500mg ER** with meals (Breakfast & Dinner) to prevent stomach upset.\n3. Take **Vitamin D3** once weekly on Sundays.\n\n*Nexus AI provides general health information and does not replace professional medical advice.*`,
      citations: [
        {
          sourceName: 'US National Library of Medicine (PubMed)',
          publication: 'Prescription Drug Information & Adherence Guidelines',
        },
        {
          sourceName: 'American Diabetes Association (ADA)',
          publication: 'Standards of Medical Care in Diabetes',
        },
      ],
      isEmergencyAlert: false,
    };
  }

  // ECG Pattern
  if (p.includes('ecg') || p.includes('ekg') || p.includes('sinus') || p.includes('rhythm') || p.includes('waveform')) {
    return {
      content: `**Your Telemetry ECG Pattern Analysis:**\n\n• **Rhythm Classification:** **Normal Sinus Rhythm**\n• **Waveform Markers:**\n  - **P-Wave:** Normal upright deflection indicating consistent atrial depolarization.\n  - **QRS Complex:** Narrow (< 100 ms duration), indicating rapid ventricular conduction.\n  - **T-Wave:** Normal repolarization with no acute ST-segment elevation or depression.\n• **Heart Rate Synchronicity:** Regular R-R interval spacing conforming to your live pulse rate of ${vitals.heartRate} bpm.\n\n*Note: Smartwatch/wearable single-lead ECG telemetry provides screening information only and does not substitute for a clinical 12-lead diagnostic ECG conducted in a hospital.*`,
      citations: [
        {
          sourceName: 'Heart Rhythm Society (HRS)',
          publication: 'Clinical Guidance on Mobile & Wearable ECG Interpretation',
          evidenceGrade: 'Grade A',
        },
      ],
      isEmergencyAlert: false,
    };
  }

  // Medical Info / Conditions / Summary
  if (p.includes('medical') || p.includes('condition') || p.includes('allergy') || p.includes('profile') || p.includes('history')) {
    const condNames = medicalProfile.conditions.map((c) => `• **${c.name}** (${c.status.toUpperCase()}) — ${c.notes}`).join('\n');
    const allergies = medicalProfile.allergies.map((a) => `• **${a.substance}** (${a.severity.toUpperCase()}): ${a.reaction}`).join('\n');

    return {
      content: `**Summary of Your Medical Information (Sarah Jenkins):**\n\n**1. Chronic Conditions:**\n${condNames}\n\n**2. Documented Allergies:**\n${allergies}\n\n**3. Physical Baseline:**\n• **Blood Group:** O Positive (O+)\n• **Height & Weight:** 168 cm, 68 kg (BMI: 24.1 — Normal range)\n\n**4. Primary Care Team:**\n• **Attending Cardiologist:** Dr. Arvind Mehta, MD\n• **Emergency Contact:** David Jenkins (Spouse) — +1 (555) 234-5679\n\n*Nexus AI provides general health information and does not replace professional medical advice.*`,
      citations: [
        {
          sourceName: 'Nexus Care Medical Profile System',
          publication: 'Encrypted Patient Health Record Standards',
        },
      ],
      isEmergencyAlert: false,
    };
  }

  // Default response
  return {
    content: `Thank you for your question: **"${userPrompt}"**.\n\nBased on your health records, you are currently managing **Essential Hypertension** and **Type 2 Diabetes** (latest HbA1c 6.8%) under the care of **Dr. Arvind Mehta**. Your live biometrics show a heart rate of **${vitals.heartRate} bpm** and SpO2 of **${vitals.spO2}%**.\n\nFeel free to ask about your medication schedule, biometric readings, or diet recommendations.\n\n*Nexus AI provides general health information and does not replace professional medical advice.*`,
    citations: [
      {
        sourceName: 'Nexus Clinical Knowledge Base',
        publication: 'Evidence-Based Primary Care Guidelines',
      },
    ],
    isEmergencyAlert: false,
  };
}


interface AssistantState {
  messages: AssistantMessage[];
  isThinking: boolean;
}

function loadState(): AssistantState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.messages)) {
        return { messages: parsed.messages, isThinking: false };
      }
    }
  } catch {
    // Ignore error
  }
  return { messages: INITIAL_MESSAGES, isThinking: false };
}

let state: AssistantState = loadState();
const listeners = new Set<() => void>();

function saveAndNotify() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages: state.messages }));
  } catch {
    // Ignore error
  }
  listeners.forEach((l) => l());
}

export const assistantStore = {
  getSnapshot: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  sendMessage: (userText: string) => {
    const userMsg: AssistantMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
    };

    state = {
      ...state,
      messages: [...state.messages, userMsg],
      isThinking: true,
    };
    saveAndNotify();

    setTimeout(() => {
      const aiResult = generateAiResponse(userText);
      const aiMsg: AssistantMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        content: aiResult.content,
        timestamp: new Date().toISOString(),
        citations: aiResult.citations,
        isEmergencyAlert: aiResult.isEmergencyAlert,
      };

      state = {
        ...state,
        messages: [...state.messages, aiMsg],
        isThinking: false,
      };
      saveAndNotify();
    }, 700);
  },

  clearChat: () => {
    state = {
      messages: INITIAL_MESSAGES,
      isThinking: false,
    };
    saveAndNotify();
  },
};

export function useAssistant() {
  const current = useSyncExternalStore(assistantStore.subscribe, assistantStore.getSnapshot);
  return {
    messages: current.messages,
    isThinking: current.isThinking,
    sendMessage: assistantStore.sendMessage,
    clearChat: assistantStore.clearChat,
  };
}
