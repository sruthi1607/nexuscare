export interface VitalReading {
  heartRate: number; // bpm
  spO2: number; // %
  temperature: number; // °F
  respiratoryRate: number; // breaths/min
  bloodPressureSystolic: number; // mmHg
  bloodPressureDiastolic: number; // mmHg
  timestamp: string;
}

export interface IoTDevice {
  id: string;
  name: string;
  type: 'smartwatch' | 'pulse_oximeter' | 'bp_cuff' | 'thermometer';
  batteryLevel: number;
  isConnected: boolean;
  lastSyncTime: string;
  firmwareVersion: string;
}

export interface RiskFactor {
  metric: string;
  value: string;
  impact: 'positive' | 'neutral' | 'elevated' | 'high';
  description: string;
}

export interface MLRiskAssessment {
  overallLevel: 'Low' | 'Moderate' | 'Elevated';
  score: number; // 0 - 100
  title: string;
  summary: string;
  contributingFactors: RiskFactor[];
  actionableInsights: string[];
  disclaimer: string;
}

export interface HealthTelemetryAlert {
  id: string;
  metricName: string;
  measuredValue: string;
  normalRange: string;
  severity: 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  doctorNotified: boolean;
}

export interface EmergencyTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'ambulance' | 'family' | 'doctor' | 'gps' | 'geofence' | 'vital';
  simulated: boolean;
}

export interface NearbyHospital {
  id: string;
  name: string;
  distanceKm: number;
  etaMins: number;
  address: string;
  phone: string;
  emergencyBeds: number;
  traumaLevel: string;
  lat: number;
  lng: number;
}

export interface GeofenceConfig {
  id: string;
  name: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  enabled: boolean;
  isInside: boolean;
  alertTriggered: boolean;
  lastStatusChange: string;
}

export interface EmergencyActionState {
  ambulance: {
    dispatched: boolean;
    vehicleNumber: string;
    etaMinutes: number;
    status: 'idle' | 'dispatched' | 'en_route' | 'arrived';
    dispatchedAt: string | null;
  };
  familyAlert: {
    alerted: boolean;
    alertedAt: string | null;
    recipients: string[];
  };
  onCallDoctor: {
    status: 'idle' | 'requested' | 'connected';
    doctorName: string;
    specialty: string;
    summaryShared: boolean;
    sharedAt: string | null;
  };
  gpsLocation: {
    isSharing: boolean;
    lat: number;
    lng: number;
    accuracyMeters: number;
    address: string;
    isDemo: boolean;
    error: string | null;
    startedAt: string | null;
  };
}

