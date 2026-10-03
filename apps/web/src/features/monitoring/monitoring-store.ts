import { useSyncExternalStore } from 'react';
import type {
  EmergencyActionState,
  EmergencyTimelineEvent,
  GeofenceConfig,
  HealthTelemetryAlert,
  IoTDevice,
  MLRiskAssessment,
  NearbyHospital,
  VitalReading,
} from './types';
import { notificationsStore } from '../notifications/notifications-store';
import { familyStore } from '../family/family-store';

const STORAGE_KEY = 'nexuscare_monitoring_store_v2';

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

export const NEARBY_HOSPITALS: NearbyHospital[] = [
  {
    id: 'hosp-apollo',
    name: 'Apollo Multi-Specialty Hospital',
    distanceKm: 1.8,
    etaMins: 5,
    address: '154/11 Bannerghatta Road, Central Zone',
    phone: '+1 (555) 911-2001',
    emergencyBeds: 12,
    traumaLevel: 'Level 1 Trauma & Cardiac Care',
    lat: 12.9780,
    lng: 77.6010,
  },
  {
    id: 'hosp-fortis',
    name: 'Fortis Heart & Vascular Institute',
    distanceKm: 2.9,
    etaMins: 8,
    address: '23 Cunningham Road, Health District',
    phone: '+1 (555) 911-3400',
    emergencyBeds: 8,
    traumaLevel: 'Comprehensive Stroke & Cath Lab',
    lat: 12.9820,
    lng: 77.5880,
  },
  {
    id: 'hosp-manipal',
    name: 'Manipal Super Specialty Hospital',
    distanceKm: 3.7,
    etaMins: 11,
    address: '98 HAL Old Airport Road',
    phone: '+1 (555) 911-5600',
    emergencyBeds: 16,
    traumaLevel: 'Level 1 Trauma & Resuscitation Center',
    lat: 12.9640,
    lng: 77.6150,
  },
  {
    id: 'hosp-max',
    name: 'Max Care Emergency Medical Center',
    distanceKm: 4.5,
    etaMins: 14,
    address: '12 Ring Road Sector 4',
    phone: '+1 (555) 911-7800',
    emergencyBeds: 5,
    traumaLevel: '24/7 Rapid Emergency Response',
    lat: 12.9550,
    lng: 77.5800,
  },
];

interface MonitoringState {
  currentVitals: VitalReading;
  vitalsHistory: VitalReading[];
  devices: IoTDevice[];
  alerts: HealthTelemetryAlert[];
  simulationMode: 'normal' | 'tachycardia' | 'hypoxia' | 'fever';
  emergencyActions: EmergencyActionState;
  emergencyTimeline: EmergencyTimelineEvent[];
  hospitals: NearbyHospital[];
  selectedHospitalId: string;
  geofence: GeofenceConfig;
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

const INITIAL_TIMELINE: EmergencyTimelineEvent[] = [
  {
    id: 'tl-1',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    title: 'Live Telemetry Stream Active',
    description: 'Continuous smartwatch sensor streaming at 1Hz frequency.',
    type: 'vital',
    simulated: true,
  },
  {
    id: 'tl-2',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    title: 'Geofence Active: Home Safe Zone (500m)',
    description: 'Patient status verified inside designated safe perimeter.',
    type: 'geofence',
    simulated: true,
  },
];

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
  hospitals: NEARBY_HOSPITALS,
  selectedHospitalId: NEARBY_HOSPITALS[0]!.id,
  emergencyActions: {
    ambulance: {
      dispatched: false,
      vehicleNumber: 'KA-01-EA-108',
      etaMinutes: 7,
      status: 'idle',
      dispatchedAt: null,
    },
    familyAlert: {
      alerted: false,
      alertedAt: null,
      recipients: ['David Jenkins (Spouse - Caregiver)', 'Emergency Contacts List'],
    },
    onCallDoctor: {
      status: 'idle',
      doctorName: 'Dr. Arvind Mehta, MD',
      specialty: 'Cardiology & Critical Care',
      summaryShared: false,
      sharedAt: null,
    },
    gpsLocation: {
      isSharing: false,
      lat: 12.9716,
      lng: 77.5946,
      accuracyMeters: 14,
      address: '742 Evergreen Terrace, Springfield (Demo Location)',
      isDemo: true,
      error: null,
      startedAt: null,
    },
  },
  emergencyTimeline: INITIAL_TIMELINE,
  geofence: {
    id: 'geo-home-1',
    name: 'Home Safe Zone',
    centerLat: 12.9716,
    centerLng: 77.5946,
    radiusMeters: 500,
    enabled: true,
    isInside: true,
    alertTriggered: false,
    lastStatusChange: new Date().toISOString(),
  },
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

// Background simulation ticker for live vitals
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
  getState: () => state,
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

  // EMERGENCY ACTION A: 108 Ambulance Dispatched
  dispatchAmbulance: (hospitalId?: string) => {
    const hosp = state.hospitals.find((h) => h.id === hospitalId) ?? state.hospitals[0]!;
    const nowIso = new Date().toISOString();

    const newEvent: EmergencyTimelineEvent = {
      id: `tl-amb-${Date.now()}`,
      timestamp: nowIso,
      title: `108 Ambulance Unit #KA-01-EA-108 Dispatched`,
      description: `Dispatched from ${hosp.name}. Priority code Red. Simulated ETA: ${hosp.etaMins} minutes. Route traced on emergency radar.`,
      type: 'ambulance',
      simulated: true,
    };

    state = {
      ...state,
      selectedHospitalId: hosp.id,
      emergencyActions: {
        ...state.emergencyActions,
        ambulance: {
          dispatched: true,
          vehicleNumber: 'KA-01-EA-108',
          etaMinutes: hosp.etaMins,
          status: 'dispatched',
          dispatchedAt: nowIso,
        },
      },
      emergencyTimeline: [newEvent, ...state.emergencyTimeline],
    };

    notificationsStore.addNotification({
      category: 'health',
      priority: 'urgent',
      title: '🚨 108 Emergency Ambulance Dispatched (Simulated)',
      message: `Ambulance unit #KA-01-EA-108 is en route from ${hosp.name}. ETA ~${hosp.etaMins} mins.`,
      actionUrl: '/patient/health',
      actionLabel: 'Track Ambulance Map',
      roleTarget: 'patient',
    });

    notify();
  },

  cancelAmbulance: () => {
    state = {
      ...state,
      emergencyActions: {
        ...state.emergencyActions,
        ambulance: {
          ...state.emergencyActions.ambulance,
          dispatched: false,
          status: 'idle',
          dispatchedAt: null,
        },
      },
      emergencyTimeline: [
        {
          id: `tl-amb-cancel-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: 'Ambulance Dispatch Standdown',
          description: 'Emergency ambulance request stood down by user.',
          type: 'ambulance',
          simulated: true,
        },
        ...state.emergencyTimeline,
      ],
    };
    notify();
  },

  // EMERGENCY ACTION B: Family Alerted
  alertFamilyMembers: () => {
    const nowIso = new Date().toISOString();
    const newEvent: EmergencyTimelineEvent = {
      id: `tl-fam-${Date.now()}`,
      timestamp: nowIso,
      title: 'Family & Caregivers Alerted (Simulated)',
      description: 'High-priority SMS and Push alert dispatched to David Jenkins (Spouse) and designated emergency contacts with live telemetry and GPS coordinates.',
      type: 'family',
      simulated: true,
    };

    state = {
      ...state,
      emergencyActions: {
        ...state.emergencyActions,
        familyAlert: {
          alerted: true,
          alertedAt: nowIso,
          recipients: ['David Jenkins (Spouse - Primary Caregiver)', 'Emergency Contacts List'],
        },
      },
      emergencyTimeline: [newEvent, ...state.emergencyTimeline],
    };

    notificationsStore.addNotification({
      category: 'health',
      priority: 'urgent',
      title: '👨‍👩‍👧 Family Alert Dispatched (Simulated)',
      message: 'David Jenkins (Spouse) alerted with your live location and telemetry summary.',
      actionUrl: '/patient/family',
      actionLabel: 'View Family Dashboard',
      roleTarget: 'patient',
    });

    familyStore.triggerFamilyAlert({
      patientId: '00000000-0000-4000-8000-000000000001',
      patientName: 'Sarah Jenkins',
      alertType: 'emergency_sos',
      severity: 'urgent',
      title: 'EMERGENCY SOS: Sarah Jenkins Alerted Family',
      message: 'Sarah Jenkins activated Emergency Family Alert. Live GPS location and biometrics shared.',
    });

    notify();
  },

  // EMERGENCY ACTION C: Contact On-Call Doctor
  requestOnCallDoctor: () => {
    state = {
      ...state,
      emergencyActions: {
        ...state.emergencyActions,
        onCallDoctor: {
          ...state.emergencyActions.onCallDoctor,
          status: 'requested',
        },
      },
    };
    notify();
  },

  shareHealthSummaryWithDoctor: () => {
    const nowIso = new Date().toISOString();
    const newEvent: EmergencyTimelineEvent = {
      id: `tl-doc-${Date.now()}`,
      timestamp: nowIso,
      title: 'Live Telemetry & Health Summary Shared with Doctor',
      description: `Encrypted 12-lead ECG strip, continuous pulse log, and medication history transmitted to Dr. Arvind Mehta (On-Call Cardiologist).`,
      type: 'doctor',
      simulated: true,
    };

    state = {
      ...state,
      emergencyActions: {
        ...state.emergencyActions,
        onCallDoctor: {
          ...state.emergencyActions.onCallDoctor,
          status: 'connected',
          summaryShared: true,
          sharedAt: nowIso,
        },
      },
      emergencyTimeline: [newEvent, ...state.emergencyTimeline],
    };

    notificationsStore.addNotification({
      category: 'health',
      priority: 'normal',
      title: '🩺 Telemetry Shared with Dr. Arvind Mehta',
      message: 'Your live biometric packet and current vitals were successfully delivered to the attending cardiologist.',
      actionUrl: '/patient/medical',
      actionLabel: 'View Medical Summary',
      roleTarget: 'patient',
    });

    notify();
  },

  // EMERGENCY ACTION D: Share Live GPS Location
  startGpsSharing: (useBrowser = true) => {
    const nowIso = new Date().toISOString();

    if (useBrowser && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(5));
          const lng = parseFloat(pos.coords.longitude.toFixed(5));
          const accuracy = Math.round(pos.coords.accuracy);

          state = {
            ...state,
            emergencyActions: {
              ...state.emergencyActions,
              gpsLocation: {
                isSharing: true,
                lat,
                lng,
                accuracyMeters: accuracy,
                address: `Live Device Coordinates: ${lat}° N, ${lng}° E (±${accuracy}m)`,
                isDemo: false,
                error: null,
                startedAt: nowIso,
              },
            },
            geofence: {
              ...state.geofence,
              centerLat: lat,
              centerLng: lng,
            },
            emergencyTimeline: [
              {
                id: `tl-gps-${Date.now()}`,
                timestamp: nowIso,
                title: 'Live Browser GPS Coordinates Shared',
                description: `High-accuracy GPS broadcasting: Lat ${lat}, Lng ${lng} (Accuracy: ±${accuracy}m).`,
                type: 'gps',
                simulated: false,
              },
              ...state.emergencyTimeline,
            ],
          };
          notify();
        },
        (_err) => {
          // Fallback to Demo Location
          state = {
            ...state,
            emergencyActions: {
              ...state.emergencyActions,
              gpsLocation: {
                isSharing: true,
                lat: 12.9716,
                lng: 77.5946,
                accuracyMeters: 15,
                address: '742 Evergreen Terrace, Springfield (Demo Location Fallback)',
                isDemo: true,
                error: 'Browser location permission denied. Using verified Demo Location.',
                startedAt: nowIso,
              },
            },
            emergencyTimeline: [
              {
                id: `tl-gps-demo-${Date.now()}`,
                timestamp: nowIso,
                title: 'Demo GPS Location Shared (Fallback)',
                description: 'Browser location was unavailable; using clearly labelled Demo Coordinates (12.9716° N, 77.5946° E).',
                type: 'gps',
                simulated: true,
              },
              ...state.emergencyTimeline,
            ],
          };
          notify();
        },
        { timeout: 8000, enableHighAccuracy: true },
      );
    } else {
      // Direct Demo Sharing
      state = {
        ...state,
        emergencyActions: {
          ...state.emergencyActions,
          gpsLocation: {
            isSharing: true,
            lat: 12.9716,
            lng: 77.5946,
            accuracyMeters: 15,
            address: '742 Evergreen Terrace, Springfield (Demo Location)',
            isDemo: true,
            error: null,
            startedAt: nowIso,
          },
        },
        emergencyTimeline: [
          {
            id: `tl-gps-demo-${Date.now()}`,
            timestamp: nowIso,
            title: 'Live Demo GPS Coordinates Shared',
            description: 'Broadcasting live coordinates: 12.9716° N, 77.5946° E for emergency response routing.',
            type: 'gps',
            simulated: true,
          },
          ...state.emergencyTimeline,
        ],
      };
      notify();
    }
  },

  stopGpsSharing: () => {
    state = {
      ...state,
      emergencyActions: {
        ...state.emergencyActions,
        gpsLocation: {
          ...state.emergencyActions.gpsLocation,
          isSharing: false,
          startedAt: null,
        },
      },
      emergencyTimeline: [
        {
          id: `tl-gps-stop-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: 'Live GPS Location Sharing Stopped',
          description: 'Location broadcast terminated by patient.',
          type: 'gps',
          simulated: true,
        },
        ...state.emergencyTimeline,
      ],
    };
    notify();
  },

  selectHospital: (hospitalId: string) => {
    state = { ...state, selectedHospitalId: hospitalId };
    notify();
  },

  // GEO-FENCING
  updateGeofence: (config: Partial<GeofenceConfig>) => {
    state = {
      ...state,
      geofence: {
        ...state.geofence,
        ...config,
        lastStatusChange: new Date().toISOString(),
      },
    };
    notify();
  },

  simulateGeofenceExit: () => {
    const nowIso = new Date().toISOString();
    const newEvent: EmergencyTimelineEvent = {
      id: `tl-geo-exit-${Date.now()}`,
      timestamp: nowIso,
      title: '⚠️ GEO-FENCE ALERT: Patient Exited Safe Zone',
      description: `Patient telemetry detected movement outside the configured ${state.geofence.name} (${state.geofence.radiusMeters}m radius).`,
      type: 'geofence',
      simulated: true,
    };

    state = {
      ...state,
      geofence: {
        ...state.geofence,
        isInside: false,
        alertTriggered: true,
        lastStatusChange: nowIso,
      },
      emergencyTimeline: [newEvent, ...state.emergencyTimeline],
    };

    notificationsStore.addNotification({
      category: 'health',
      priority: 'urgent',
      title: '⚠️ GEO-FENCE ALERT (Simulated)',
      message: 'Patient has moved outside the configured safe zone. Family caregiver notified.',
      actionUrl: '/patient/health',
      actionLabel: 'View Safe Zone Radar',
      roleTarget: 'patient',
    });

    familyStore.triggerFamilyAlert({
      patientId: '00000000-0000-4000-8000-000000000001',
      patientName: 'Sarah Jenkins',
      alertType: 'emergency_sos',
      severity: 'urgent',
      title: '⚠️ Geo-Fence Breach Alert: Sarah Jenkins',
      message: `Sarah Jenkins has moved outside the configured ${state.geofence.name} (${state.geofence.radiusMeters}m).`,
    });

    notify();
  },

  simulateGeofenceEnter: () => {
    const nowIso = new Date().toISOString();
    const newEvent: EmergencyTimelineEvent = {
      id: `tl-geo-enter-${Date.now()}`,
      timestamp: nowIso,
      title: '✓ GEO-FENCE ENTERED: Patient Returned to Safe Zone',
      description: `Patient status normalized inside the configured ${state.geofence.name}.`,
      type: 'geofence',
      simulated: true,
    };

    state = {
      ...state,
      geofence: {
        ...state.geofence,
        isInside: true,
        alertTriggered: false,
        lastStatusChange: nowIso,
      },
      emergencyTimeline: [newEvent, ...state.emergencyTimeline],
    };

    notificationsStore.addNotification({
      category: 'health',
      priority: 'normal',
      title: '✓ Geo-Fence Restored (Simulated)',
      message: 'Patient is back safely inside the designated safe perimeter.',
      actionUrl: '/patient/health',
      actionLabel: 'View Safe Zone',
      roleTarget: 'patient',
    });

    notify();
  },

  deleteGeofence: () => {
    state = {
      ...state,
      geofence: {
        ...state.geofence,
        enabled: false,
        isInside: true,
        alertTriggered: false,
      },
    };
    notify();
  },

  getMLRiskAssessment: (): MLRiskAssessment => {
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
    emergencyActions: current.emergencyActions,
    emergencyTimeline: current.emergencyTimeline,
    hospitals: current.hospitals,
    selectedHospitalId: current.selectedHospitalId,
    geofence: current.geofence,
    mlAssessment,
    setSimulationMode: monitoringStore.setSimulationMode,
    acknowledgeAlert: monitoringStore.acknowledgeAlert,
    dispatchAmbulance: monitoringStore.dispatchAmbulance,
    cancelAmbulance: monitoringStore.cancelAmbulance,
    alertFamilyMembers: monitoringStore.alertFamilyMembers,
    requestOnCallDoctor: monitoringStore.requestOnCallDoctor,
    shareHealthSummaryWithDoctor: monitoringStore.shareHealthSummaryWithDoctor,
    startGpsSharing: monitoringStore.startGpsSharing,
    stopGpsSharing: monitoringStore.stopGpsSharing,
    selectHospital: monitoringStore.selectHospital,
    updateGeofence: monitoringStore.updateGeofence,
    simulateGeofenceExit: monitoringStore.simulateGeofenceExit,
    simulateGeofenceEnter: monitoringStore.simulateGeofenceEnter,
    deleteGeofence: monitoringStore.deleteGeofence,
  };
}

