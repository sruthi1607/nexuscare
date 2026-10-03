import { useSyncExternalStore } from 'react';
import type { AssistantCitation, AssistantMessage, SuggestedPrompt } from './types';

const STORAGE_KEY = 'nexuscare_ai_assistant_history_v1';

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: 'p-1',
    label: 'What does HbA1c 6.8% mean?',
    category: 'diabetes',
    prompt: 'Can you explain what an HbA1c of 6.8% means and how it relates to diabetes management?',
  },
  {
    id: 'p-2',
    label: 'How does Telmisartan lower blood pressure?',
    category: 'medication',
    prompt: 'How does my prescribed Telmisartan 40mg work to protect my heart and control blood pressure?',
  },
  {
    id: 'p-3',
    label: 'Best time to take Metformin 500mg?',
    category: 'medication',
    prompt: 'When is the best time of day to take Metformin 500mg, and should I take it with food?',
  },
  {
    id: 'p-4',
    label: 'Emergency signs vs stable chest discomfort?',
    category: 'cardiac',
    prompt: 'What are the red-flag emergency symptoms for cardiovascular issues that require immediate emergency care?',
  },
  {
    id: 'p-5',
    label: 'Diet tips to lower triglycerides naturally?',
    category: 'lifestyle',
    prompt: 'What dietary changes can help lower triglycerides and bad LDL cholesterol?',
  },
];

const INITIAL_MESSAGES: AssistantMessage[] = [
  {
    id: 'msg-init-1',
    role: 'assistant',
    content:
      'Hello Sarah! I am your Nexus Care AI Health Assistant. I can help explain medical terms, medication schedules, lab test results, and evidence-based wellness guidelines grounded in peer-reviewed clinical sources.\n\n*Note: I provide health information only and do not replace personalized clinical advice from your physician, Dr. Arvind Mehta.*',
    timestamp: '2026-10-03T10:00:00.000Z',
    citations: [
      {
        sourceName: 'Nexus Clinical Knowledge Base',
        publication: 'Peer-reviewed evidence guidelines',
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

  if (
    p.includes('chest pain') ||
    p.includes('heart attack') ||
    p.includes('left arm') ||
    p.includes('jaw pain') ||
    p.includes('shortness of breath') ||
    p.includes('emergency')
  ) {
    return {
      content:
        '⚠️ **CRITICAL EMERGENCY WARNING:** If you or someone around you is experiencing acute chest tightness, crushing pain radiating to the jaw, neck, back, or left arm, severe shortness of breath, or cold sweats, **call emergency services (112 or 911) immediately**.\n\nDo not wait or drive yourself to the hospital. Emergency medical responders can begin treatment on arrival.\n\nFor mild, stable questions or follow-ups, your cardiologist Dr. Arvind Mehta can review your historical telemetry during your appointment.',
      citations: [
        {
          sourceName: 'American Heart Association (AHA)',
          publication: 'Guidelines for Acute Coronary Syndrome Triage',
          evidenceGrade: 'Grade A Evidence',
        },
        {
          sourceName: 'World Health Organization (WHO)',
          publication: 'Cardiovascular Emergency Recognition Protocols',
        },
      ],
      isEmergencyAlert: true,
    };
  }

  if (p.includes('hba1c') || p.includes('sugar') || p.includes('glucose') || p.includes('diabetes')) {
    return {
      content:
        '**Understanding HbA1c (Glycated Hemoglobin):**\n\n• **What it measures:** HbA1c reflects your average blood sugar concentration over the past 2 to 3 months by measuring the percentage of hemoglobin coated with glucose.\n• **Interpretation of 6.8%:**\n  - Normal: Under 5.7%\n  - Prediabetes: 5.7% to 6.4%\n  - Diabetes management target: 6.5% to 7.0% for most adults\n• **Your Plan:** Your 6.8% reading indicates good progress under active management. Continuing your prescribed Metformin 500mg ER along with portion-controlled complex carbohydrates helps maintain stability.',
      citations: [
        {
          sourceName: 'American Diabetes Association (ADA)',
          publication: 'Standards of Medical Care in Diabetes (2026)',
          evidenceGrade: 'Grade A Consensus',
        },
        {
          sourceName: 'Mayo Clinic Health Information',
          publication: 'HbA1c Test Overview & Targets',
        },
      ],
      isEmergencyAlert: false,
    };
  }

  if (p.includes('metformin')) {
    return {
      content:
        '**Metformin 500mg Guidance:**\n\n1. **Timing:** Best taken with or immediately following your main meals (e.g. Breakfast and Dinner). Taking it with food significantly reduces stomach upset or nausea.\n2. **Mechanism:** It decreases the amount of glucose your liver produces and improves your body’s sensitivity to insulin.\n3. **Important Tip:** Do not crush or chew extended-release (ER) tablets; swallow them whole with a glass of water.',
      citations: [
        {
          sourceName: 'US National Library of Medicine (PubMed)',
          publication: 'Metformin Clinical Pharmacology & Dosing Guidelines',
        },
        {
          sourceName: 'British National Formulary (BNF)',
          publication: 'Biguanides Clinical Monograph',
        },
      ],
      isEmergencyAlert: false,
    };
  }

  if (p.includes('telmisartan') || p.includes('blood pressure') || p.includes('hypertension')) {
    return {
      content:
        '**Telmisartan 40mg Mechanism & BP Control:**\n\n• **How it works:** Telmisartan is an Angiotensin II Receptor Blocker (ARB). It prevents angiotensin II from constricting your blood vessels, allowing them to widen so blood flows smoothly with reduced cardiac resistance.\n• **Cardiovascular Protection:** ARBs have renal and cardiac protective properties, especially beneficial for individuals managing borderline blood sugars.\n• **Target:** Your recent telemetry of 122/80 mmHg indicates that Telmisartan 40mg is effectively keeping your blood pressure in the optimal target zone.',
      citations: [
        {
          sourceName: 'European Society of Cardiology (ESC)',
          publication: 'Guidelines on Arterial Hypertension Management',
          evidenceGrade: 'Class I Recommendation',
        },
      ],
      isEmergencyAlert: false,
    };
  }

  if (p.includes('triglyceride') || p.includes('cholesterol') || p.includes('diet') || p.includes('food')) {
    return {
      content:
        '**Evidence-Based Nutrition for Lipid Control:**\n\n• **Reduce Refined Sugars:** Triglycerides respond rapidly to dietary changes. Minimizing sweetened beverages and ultra-processed bakery items significantly lowers levels.\n• **Healthy Fats:** Incorporate heart-healthy unsaturated fats such as olive oil, walnuts, chia seeds, and omega-3 rich foods.\n• **Soluble Fiber:** Oats, beans, lentils, and flaxseed bind cholesterol in the digestive system and drag it out of the body.\n• **Physical Activity:** 30 minutes of moderate brisk walking 5 days a week helps increase protective HDL cholesterol.',
      citations: [
        {
          sourceName: 'American Heart Association (AHA)',
          publication: 'Dietary Strategies for Hypertriglyceridemia Management',
        },
        {
          sourceName: 'Harvard T.H. Chan School of Public Health',
          publication: 'The Nutrition Source: Fats & Cholesterol',
        },
      ],
      isEmergencyAlert: false,
    };
  }

  // Default helpful response
  return {
    content: `Thank you for your question about **"${userPrompt}"**.\n\nBased on clinical reference literature, maintaining consistent medication adherence, regular home vitals monitoring, and balanced nutrition are key pillars of long-term health.\n\nFor questions specific to dosage changes or acute physiological changes, Dr. Arvind Mehta can review your complete chart during your upcoming tele-consultation.`,
    citations: [
      {
        sourceName: 'Nexus Evidence Knowledge Base',
        publication: 'Integrated Primary Healthcare Guidelines',
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
