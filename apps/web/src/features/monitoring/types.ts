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
