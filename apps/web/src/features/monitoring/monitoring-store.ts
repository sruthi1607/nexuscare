import { useSyncExternalStore } from 'react';
import type {
  HealthTelemetryAlert,
  IoTDevice,
  MLRiskAssessment,
  VitalReading,
} from './types';
import { notificationsStore } from '../notifications/notifications-store';
import { familyStore } from '../family/family-store';

const STORAGE_KEY = 'nexuscare_monitoring_store_v1';

const INITIAL_DEVICES: IoTDevice[] = [
  {
    id: 'dev-watch-1',
    name: 'Nexus Pulse Smartwatch v3',
    type: 'smartwatch',
    batteryLevel: 84,
    isConnected: true,
    lastSyncTime: 'Just now (Live streaming)',
    firmwareVersion: 'v2.4.1',
  },
  {
    id: 'dev-bp-1',
    name: 'Omron Connect Wireless BP Cuff',
    type: 'bp_cuff',
    batteryLevel: 92,
    isConnected: true,
    lastSyncTime: '30 mins ago',
    firmwareVersion: 'v1.8.0',
  },
  {
    id: 'dev-oxi-1',
    name: 'AccuPulse Fingertip SpO2 Sensor',
    type: 'pulse_oximeter',
    batteryLevel: 65,
    isConnected: true,
    lastSyncTime: 'Live continuous',
    firmwareVersion: 'v3.1.2',
  },
];

const INITIAL_ALERTS: HealthTelemetryAlert[] = [
  {
    id: 'alt-telem-1',
    metricName: 'Heart Rate',
    measuredValue: '104 bpm',
    normalRange: '60 - 100 bpm',
    severity: 'warning',
    title: 'Elevated Resting Heart Rate',
    message: 'Resting pulse reached 104 bpm during 15 minutes of inactivity. Logged to doctor telemetry feed.',
    timestamp: '2026-10-03T09:15:00.000Z',
    acknowledged: false,
    doctorNotified: true,
  },
  {
    id: 'alt-telem-2',
    metricName: 'Blood Pressure',
    measuredValue: '138/88 mmHg',
    normalRange: '< 130/80 mmHg',
    severity: 'warning',
    title: 'Borderline Elevated Systolic BP',
    message: 'Evening reading showed transient elevation before taking scheduled Telmisartan dose.',
    timestamp: '2026-10-01T20:30:00.000Z',
    acknowledged: true,
    doctorNotified: true,
  },
];

interface MonitoringState {
  currentVitals: VitalReading;
  vitalsHistory: VitalReading[];
  devices: IoTDevice[];
  alerts: HealthTelemetryAlert[];
  simulationMode: 'normal' | 'tachycardia' | 'hypoxia' | 'fever';
}

const INITIAL_VITALS: VitalReading = {
  heartRate: 74,
  spO2: 98,
  temperature: 98.4,
  respiratoryRate: 16,
  bloodPressureSystolic: 122,
  bloodPressureDiastolic: 80,
  timestamp: new Date().toISOString(),
};

function generateInitialHistory(): VitalReading[] {
  const list: VitalReading[] = [];
  const now = Date.now();
  for (let i = 20; i >= 0; i--) {
    const time = new Date(now - i * 3000).toISOString();
    list.push({
      heartRate: 72 + Math.floor(Math.sin(i / 3) * 4) + (i % 2),
      spO2: 98 + (i % 2 === 0 ? 0 : 1),
      temperature: 98.4,
      respiratoryRate: 16 + (i % 3 === 0 ? 1 : 0),
      bloodPressureSystolic: 122,
      bloodPressureDiastolic: 80,
      timestamp: time,
    });
  }
  return list;
}

let state: MonitoringState = {
  currentVitals: INITIAL_VITALS,
  vitalsHistory: generateInitialHistory(),
  devices: INITIAL_DEVICES,
  alerts: INITIAL_ALERTS,
  simulationMode: 'normal',
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

// Background simulation ticker
if (typeof window !== 'undefined') {
  setInterval(() => {
    let baseHR = 74;
    let baseSpO2 = 98;
    let baseTemp = 98.4;
    let baseRR = 16;
    let baseSys = 122;
    let baseDia = 80;

    if (state.simulationMode === 'tachycardia') {
      baseHR = 108;
    } else if (state.simulationMode === 'hypoxia') {
      baseSpO2 = 91;
    } else if (state.simulationMode === 'fever') {
      baseTemp = 101.2;
      baseHR = 92;
    }

    const jitterHR = baseHR + Math.floor(Math.random() * 3) - 1;
    const jitterSpO2 = Math.min(100, Math.max(88, baseSpO2 + Math.floor(Math.random() * 2) - (Math.random() > 0.7 ? 1 : 0)));
    const jitterRR = baseRR + (Math.random() > 0.5 ? 1 : 0);

    const newReading: VitalReading = {
      heartRate: jitterHR,
      spO2: jitterSpO2,
      temperature: baseTemp,
      respiratoryRate: jitterRR,
      bloodPressureSystolic: baseSys,
      bloodPressureDiastolic: baseDia,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...state.vitalsHistory.slice(1), newReading];
    state = {
      ...state,
      currentVitals: newReading,
      vitalsHistory: newHistory,
    };
    notify();
  }, 2500);
}

export const monitoringStore = {
  getSnapshot: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  setSimulationMode: (mode: 'normal' | 'tachycardia' | 'hypoxia' | 'fever') => {
    state = { ...state, simulationMode: mode };

    if (mode === 'tachycardia') {
      const alert: HealthTelemetryAlert = {
        id: `alt-${Date.now()}`,
        metricName: 'Heart Rate',
        measuredValue: '108 bpm',
        normalRange: '60 - 100 bpm',
        severity: 'critical',
        title: 'Tachycardia / Elevated Resting Heart Rate Alert',
        message: 'Pulse sustained above 100 bpm during rest. Notifying your doctor and family caregiver.',
        timestamp: new Date().toISOString(),
        acknowledged: false,
        doctorNotified: true,
      };
      state = { ...state, alerts: [alert, ...state.alerts] };

      notificationsStore.addNotification({
        category: 'health',
        priority: 'urgent',
        title: 'Elevated Heart Rate Alert (108 bpm)',
        message: 'Resting pulse reached 108 bpm. Telemetry forwarded to Dr. Arvind Mehta.',
        actionUrl: '/patient/health',
        actionLabel: 'View Health Telemetry',
        roleTarget: 'patient',
      });

      familyStore.triggerFamilyAlert({
        patientId: '00000000-0000-4000-8000-000000000001',
        patientName: 'Sarah Jenkins',
        alertType: 'abnormal_vitals',
        severity: 'urgent',
        title: 'Elevated Heart Rate (108 bpm)',
        message: 'Sarah Jenkins recorded resting tachycardia (108 bpm). Caregiver alert triggered.',
      });
    } else if (mode === 'hypoxia') {
      const alert: HealthTelemetryAlert = {
        id: `alt-${Date.now()}`,
        metricName: 'SpO2 Oxygen',
        measuredValue: '91%',
        normalRange: '95 - 100%',
        severity: 'critical',
        title: 'Low Oxygen Saturation Alert (91% SpO2)',
        message: 'Oxygen saturation dropped below 95%. Take slow deep breaths and rest comfortably.',
        timestamp: new Date().toISOString(),
        acknowledged: false,
        doctorNotified: true,
      };
      state = { ...state, alerts: [alert, ...state.alerts] };

      notificationsStore.addNotification({
        category: 'health',
        priority: 'urgent',
        title: 'Low Blood Oxygen (91% SpO2)',
        message: 'Pulse Oximeter recorded oxygen drop. Rest in an upright posture.',
        actionUrl: '/patient/health',
        actionLabel: 'Check Vitals',
        roleTarget: 'patient',
      });
    }

    notify();
  },

  acknowledgeAlert: (id: string) => {
    state = {
      ...state,
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)),
    };
    notify();
  },

  getMLRiskAssessment: (): MLRiskAssessment => {
    // Dynamic calculation based on current vitals & simulation
    const isElevatedHR = state.currentVitals.heartRate > 100;
    const isHypoxic = state.currentVitals.spO2 < 94;

    if (isElevatedHR || isHypoxic) {
      return {
        overallLevel: 'Elevated',
        score: 68,
        title: 'Elevated Physiological Pattern Detected',
        summary:
          'Real-time telemetry reflects elevated cardiovascular workload (HR > 100 bpm) coinciding with mild LDL history (142 mg/dL). Clinical monitoring recommended.',
        contributingFactors: [
          {
            metric: 'Resting Heart Rate',
            value: `${state.currentVitals.heartRate} bpm`,
            impact: 'high',
            description: 'Tachycardia pattern detected during resting state.',
          },
          {
            metric: 'Serum LDL Cholesterol',
            value: '142 mg/dL',
            impact: 'elevated',
            description: 'Above target (< 100 mg/dL); managed via Atorvastatin 10mg.',
          },
          {
            metric: 'HbA1c Glycemic Level',
            value: '6.8%',
            impact: 'elevated',
            description: 'Mild glycemic variation; managed via Metformin 500mg ER.',
          },
          {
            metric: 'Medication Adherence',
            value: '96% (7-Day Streak)',
            impact: 'positive',
            description: 'Consistent prescription adherence provides cardioprotection.',
          },
        ],
        actionableInsights: [
          'Rest in a comfortable seated position and take calm, slow breaths.',
          'Review upcoming video consultation with Dr. Arvind Mehta today at 04:30 PM.',
          'If you feel acute chest tightness or radiating pain, press Emergency SOS (112).',
        ],
        disclaimer:
          'Nexus ML Risk Indication is an experimental pattern analysis tool for trend observation only. It is NOT a definitive diagnosis of heart attack, arrhythmia, or acute pathology. Never delay emergency medical attention.',
      };
    }

    return {
      overallLevel: 'Moderate',
      score: 34,
      title: 'Stable Controlled Risk Profile',
      summary:
        'Vitals are in steady target range (BP 122/80, SpO2 98%, HR 74 bpm). Medication adherence and lifestyle support good long-term cardiovascular stability.',
      contributingFactors: [
        {
          metric: 'Resting Heart Rate',
          value: '74 bpm',
          impact: 'positive',
          description: 'Resting heart rate is within optimal physiological range (60-100 bpm).',
        },
        {
          metric: 'Blood Pressure',
          value: '122/80 mmHg',
          impact: 'positive',
          description: 'Target controlled under Telmisartan 40mg therapy.',
        },
        {
          metric: 'Serum LDL Cholesterol',
          value: '142 mg/dL',
          impact: 'elevated',
          description: 'Borderline elevated; active Atorvastatin 10mg treatment in progress.',
        },
        {
          metric: 'HbA1c Level',
          value: '6.8%',
          impact: 'neutral',
          description: 'Mild glycemic management ongoing with Metformin 500mg.',
        },
        {
          metric: 'Medication Adherence',
          value: '96% on-time rate',
          impact: 'positive',
          description: 'High adherence prevents rebound hypertensive episodes.',
        },
      ],
      actionableInsights: [
        'Maintain daily morning doses of Telmisartan 40mg and Metformin 500mg.',
        'Schedule 3-month repeat lipid profile to verify LDL reduction.',
        'Continue 30-minute daily walking exercise.',
      ],
      disclaimer:
        'Nexus ML Risk Indication is an experimental pattern analysis tool for trend observation only. It is NOT a definitive diagnosis of heart attack, arrhythmia, or acute pathology. Always consult your doctor.',
    };
  },
};

export function useMonitoring() {
  const current = useSyncExternalStore(monitoringStore.subscribe, monitoringStore.getSnapshot);
  const mlAssessment = monitoringStore.getMLRiskAssessment();

  return {
    vitals: current.currentVitals,
    history: current.vitalsHistory,
    devices: current.devices,
    alerts: current.alerts,
    simulationMode: current.simulationMode,
    mlAssessment,
    setSimulationMode: monitoringStore.setSimulationMode,
    acknowledgeAlert: monitoringStore.acknowledgeAlert,
  };
}
