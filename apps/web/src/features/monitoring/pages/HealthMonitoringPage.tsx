import { useState } from 'react';
import {
  Activity,
  HeartPulse,
  Thermometer,
  Wind,
  Watch,
  Smartphone,
  Wifi,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  PhoneCall,
  Sliders,
  TrendingUp,
  Info,
} from 'lucide-react';
import { useMonitoring } from '../monitoring-store';

export function HealthMonitoringPage() {
  const { vitals, history, devices, mlAssessment, simulationMode, setSimulationMode } = useMonitoring();

  // Generate SVG path for live chart waveform
  const maxHR = 130;
  const minHR = 50;
  const svgWidth = 500;
  const svgHeight = 120;

  const points = history.map((pt, idx) => {
    const x = (idx / (history.length - 1)) * svgWidth;
    const y = svgHeight - ((pt.heartRate - minHR) / (maxHR - minHR)) * svgHeight;
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(' L ')}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">IoT Health Monitoring</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              <span className="size-2 rounded-full bg-emerald-600 animate-pulse" /> Live Telemetry
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Real-time biometric streams from connected wearables, continuous pulse tracking, and ML risk detection.
          </p>
        </div>

        <a
          href="tel:112"
          className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-colors"
        >
          <PhoneCall className="size-4" /> Emergency SOS (112)
        </a>
      </div>

      {/* Interactive Simulation Controls Bar */}
      <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-4 shadow-xs">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <Sliders className="size-4 text-brand-700" />
            <span className="text-xs font-bold text-slate-900">Demo Telemetry Simulation Mode:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'normal', label: 'Normal Baseline (74 bpm, 98% SpO2)', color: 'bg-emerald-600' },
              { id: 'tachycardia', label: '⚡ Elevated HR / Tachycardia (108 bpm)', color: 'bg-rose-600' },
              { id: 'hypoxia', label: '💨 Low Oxygen / SpO2 (91%)', color: 'bg-amber-600' },
              { id: 'fever', label: '🌡️ Mild Fever (101.2°F)', color: 'bg-orange-600' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSimulationMode(mode.id as any)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  simulationMode === mode.id
                    ? `${mode.color} text-white shadow-xs ring-2 ring-slate-900/20`
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Vitals Telemetry Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Heart Rate */}
        <div
          className={`rounded-2xl border p-5 shadow-xs transition-all ${
            vitals.heartRate > 100
              ? 'border-rose-300 bg-rose-50/50'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Heart Rate</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <HeartPulse className="size-5 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900">{vitals.heartRate}</span>
            <span className="text-xs font-medium text-slate-500">bpm</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span
              className={`font-semibold ${
                vitals.heartRate > 100 ? 'text-rose-700' : 'text-emerald-700'
              }`}
            >
              {vitals.heartRate > 100 ? '⚠️ Elevated' : '✓ Normal resting'}
            </span>
            <span className="text-[11px] text-slate-400">Target: 60 - 100</span>
          </div>
        </div>

        {/* Blood Oxygen SpO2 */}
        <div
          className={`rounded-2xl border p-5 shadow-xs transition-all ${
            vitals.spO2 < 95
              ? 'border-amber-300 bg-amber-50/50'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Blood Oxygen (SpO2)</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
              <Activity className="size-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900">{vitals.spO2}%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span
              className={`font-semibold ${
                vitals.spO2 < 95 ? 'text-amber-700' : 'text-emerald-700'
              }`}
            >
              {vitals.spO2 < 95 ? '⚠️ Low Saturation' : '✓ Optimal'}
            </span>
            <span className="text-[11px] text-slate-400">Target: ≥ 95%</span>
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Blood Pressure</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <TrendingUp className="size-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900">
              {vitals.bloodPressureSystolic}/{vitals.bloodPressureDiastolic}
            </span>
            <span className="text-xs font-medium text-slate-500">mmHg</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-700">✓ Target controlled</span>
            <span className="text-[11px] text-slate-400">Target: &lt; 130/80</span>
          </div>
        </div>

        {/* Body Temperature */}
        <div
          className={`rounded-2xl border p-5 shadow-xs transition-all ${
            vitals.temperature > 99.5
              ? 'border-orange-300 bg-orange-50/50'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Body Temperature</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Thermometer className="size-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900">{vitals.temperature}</span>
            <span className="text-xs font-medium text-slate-500">°F</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span
              className={`font-semibold ${
                vitals.temperature > 99.5 ? 'text-orange-700' : 'text-emerald-700'
              }`}
            >
              {vitals.temperature > 99.5 ? '⚠️ Fever' : '✓ Normal'}
            </span>
            <span className="text-[11px] text-slate-400">Baseline: 98.4°F</span>
          </div>
        </div>
      </div>

      {/* Live ECG Waveform Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900">Live Pulse & Rhythm Waveform</h2>
            <p className="text-xs text-slate-500">Real-time continuous heart rate telemetry buffer</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <span className="size-2 rounded-full bg-rose-500 animate-ping" />
            <span>Current: {vitals.heartRate} bpm</span>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl bg-slate-950 p-4">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-32 stroke-emerald-400 fill-none"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Grid lines */}
            <line x1="0" y1="30" x2={svgWidth} y2="30" stroke="#1e293b" strokeDasharray="3,3" />
            <line x1="0" y1="60" x2={svgWidth} y2="60" stroke="#1e293b" strokeDasharray="3,3" />
            <line x1="0" y1="90" x2={svgWidth} y2="90" stroke="#1e293b" strokeDasharray="3,3" />

            {/* Continuous Pulse Line */}
            <path d={pathD} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* ML Health Risk Indication Engine Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <Sparkles className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Machine Learning Health Risk Indication</h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    mlAssessment.overallLevel === 'Elevated'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {mlAssessment.overallLevel} Risk Pattern
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Multi-metric analysis across continuous vitals, lab reports, and medication adherence.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-xs text-slate-400 font-medium">Risk Score</span>
              <div className="text-xl font-extrabold text-slate-900">{mlAssessment.score} / 100</div>
            </div>
          </div>
        </div>

        {/* Contributing Metrics Breakdown */}
        <div className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Contributing Physiological & Clinical Factors:
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {mlAssessment.contributingFactors.map((factor, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{factor.metric}</span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                      factor.impact === 'positive'
                        ? 'bg-emerald-100 text-emerald-800'
                        : factor.impact === 'elevated'
                          ? 'bg-amber-100 text-amber-800'
                          : factor.impact === 'high'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {factor.value}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-600">{factor.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Insights */}
        <div className="mt-5 rounded-xl border border-brand-200 bg-brand-50/40 p-4">
          <h4 className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-brand-600" />
            Recommended Actionable Guidance:
          </h4>
          <ul className="mt-2 space-y-1 text-xs text-slate-700">
            {mlAssessment.actionableInsights.map((insight, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-brand-600" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mandatory Strict ML Disclaimer */}
        <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-600">
          <ShieldCheck className="size-4 shrink-0 text-slate-500 mt-0.5" />
          <p>
            <strong>Important Regulatory Notice:</strong> {mlAssessment.disclaimer}
          </p>
        </div>
      </div>

      {/* Connected IoT Devices List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">Connected IoT Health Devices</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {devices.map((dev) => (
            <div key={dev.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <Watch className="size-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{dev.name}</h3>
                  <p className="text-[11px] text-slate-500">{dev.lastSyncTime}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                  <Wifi className="size-3" /> Online
                </span>
                <span className="block text-[10px] text-slate-400">Batt {dev.batteryLevel}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
