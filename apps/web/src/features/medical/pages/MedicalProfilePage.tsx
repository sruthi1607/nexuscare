import { useState } from 'react';
import {
  ClipboardList,
  History,
  Info,
  Pill,
  ShieldAlert,
  HeartPulse,
  Activity,
  Thermometer,
  Wind,
  FileText,
  Eye,
  ExternalLink,
} from 'lucide-react';
import {
  ALLERGY_SEVERITIES,
  CONDITION_STATUSES,
  HISTORY_KINDS,
  allergiesUpdateSchema,
  conditionsUpdateSchema,
  historyUpdateSchema,
  medicationsUpdateSchema,
  type MedicalProfile,
} from '@nexuscare/shared';
import { QueryState } from '../../../components/common/QueryState';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Badge, type BadgeTone } from '../../../components/ui/Badge';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import { ButtonLink } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { formatDate } from '../../../lib/format';
import { useMedicalProfile } from '../api';
import { EmergencyContactSection, HealthBasicsSection } from '../components/BasicsSections';
import { ListSection } from '../components/ListSection';
import { useMonitoring } from '../../monitoring/monitoring-store';
import { useTreatment } from '../../treatment/treatment-store';
import { LabReportPreviewModal } from '../../treatment/components/LabReportPreviewModal';
import { PrescriptionSlipModal } from '../../treatment/components/PrescriptionSlipModal';
import type { TreatmentPrescription, TreatmentRecord } from '../../treatment/types';

const labelOf = (options: readonly { value: string; label: string }[], value: string) =>
  options.find((o) => o.value === value)?.label ?? value;

const severityTone: Record<string, BadgeTone> = {
  mild: 'neutral',
  moderate: 'warning',
  severe: 'danger',
  unknown: 'neutral',
};

function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading medical information">
      {[0, 1, 2].map((i) => (
        <Card key={i}>
          <CardBody className="space-y-3 py-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function MedicalSections({ profile }: { profile: MedicalProfile }) {
  const { vitals, mlAssessment } = useMonitoring();
  const { prescriptions, records } = useTreatment();
  const [selectedRecord, setSelectedRecord] = useState<TreatmentRecord | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<TreatmentPrescription | null>(null);

  const selfReported = profile.medications.filter((m) => m.source === 'self_reported');
  const prescribed = profile.medications.filter((m) => m.source === 'prescribed');

  return (
    <div className="space-y-6">
      {/* Live Vitals Snapshot Banner */}
      <Card className="border-brand-200 bg-gradient-to-r from-brand-50/70 via-white to-slate-50">
        <CardBody className="p-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-emerald-600 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900">Current Biometrics & Telemetry</h3>
                <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-800">
                  ML Risk Indication: {mlAssessment.score}/100 ({mlAssessment.overallLevel.toUpperCase()})
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Connected IoT wearable continuous data stream (Non-diagnostic).
              </p>
            </div>

            <ButtonLink to="/patient/health" size="sm" variant="outline">
              <Activity className="size-3.5 text-brand-700" />
              Open Health Monitor
            </ButtonLink>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Heart Rate</span>
                <HeartPulse className="size-4 text-rose-600" />
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-900">{vitals.heartRate}</span>
                <span className="text-[11px] text-slate-500">bpm</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Blood Oxygen</span>
                <Wind className="size-4 text-sky-600" />
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-900">{vitals.spO2}%</span>
                <span className="text-[11px] text-slate-500">SpO2</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Blood Pressure</span>
                <Activity className="size-4 text-indigo-600" />
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-900">
                  {vitals.bloodPressureSystolic}/{vitals.bloodPressureDiastolic}
                </span>
                <span className="text-[11px] text-slate-500">mmHg</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Temperature</span>
                <Thermometer className="size-4 text-amber-600" />
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-900">{vitals.temperature}°F</span>
                <span className="text-[11px] text-slate-500">Oral</span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-4 lg:col-span-1 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Respiration</span>
                <Wind className="size-4 text-emerald-600" />
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-900">{vitals.respiratoryRate}</span>
                <span className="text-[11px] text-slate-500">br/min</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <HealthBasicsSection basics={profile.basics} />
        <EmergencyContactSection contact={profile.emergencyContact} />
      </div>

      <ListSection
        section="allergies"
        title="Allergies"
        description="Medicines, foods or other substances you react to."
        icon={<ShieldAlert aria-hidden="true" />}
        itemLabel="allergy"
        items={profile.allergies}
        schema={allergiesUpdateSchema}
        maxItems={50}
        emptyItem={{ substance: '', reaction: '', severity: 'unknown' }}
        fields={[
          { name: 'substance', label: 'Allergic to', kind: 'text', required: true, placeholder: 'e.g. Penicillin' },
          { name: 'severity', label: 'Severity', kind: 'select', options: ALLERGY_SEVERITIES },
          { name: 'reaction', label: 'Reaction', kind: 'text', placeholder: 'e.g. Rash, swelling', wide: true },
        ]}
        toFormItem={(a) => ({ id: a.id, substance: a.substance, reaction: a.reaction ?? '', severity: a.severity })}
        renderItem={(a) => (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-medium text-slate-900">{a.substance}</p>
              {a.reaction ? <p className="text-sm text-slate-600">{a.reaction}</p> : null}
            </div>
            <Badge tone={severityTone[a.severity] ?? 'neutral'}>
              {labelOf(ALLERGY_SEVERITIES, a.severity)}
            </Badge>
          </div>
        )}
        emptyText="No allergies recorded. If you have none, you can leave this empty."
      />

      <ListSection
        section="conditions"
        title="Chronic conditions"
        description="Long-term conditions such as diabetes, hypertension or asthma."
        icon={<ClipboardList aria-hidden="true" />}
        itemLabel="condition"
        items={profile.conditions}
        schema={conditionsUpdateSchema}
        maxItems={50}
        emptyItem={{ name: '', status: 'active', sinceYear: null, notes: '' }}
        fields={[
          { name: 'name', label: 'Condition', kind: 'text', required: true, placeholder: 'e.g. Hypertension' },
          { name: 'status', label: 'Status', kind: 'select', options: CONDITION_STATUSES },
          { name: 'sinceYear', label: 'Since (year)', kind: 'year' },
          { name: 'notes', label: 'Notes', kind: 'text' },
        ]}
        toFormItem={(c) => ({ id: c.id, name: c.name, status: c.status, sinceYear: c.sinceYear, notes: c.notes ?? '' })}
        renderItem={(c) => (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-medium text-slate-900">{c.name}</p>
              <p className="text-sm text-slate-600">
                {[c.sinceYear ? `Since ${String(c.sinceYear)}` : null, c.notes].filter(Boolean).join(' · ')}
              </p>
            </div>
            <Badge tone={c.status === 'active' ? 'warning' : c.status === 'managed' ? 'info' : 'success'}>
              {labelOf(CONDITION_STATUSES, c.status)}
            </Badge>
          </div>
        )}
        emptyText="No chronic conditions recorded."
      />

      <ListSection
        section="medications"
        title="Current medicines"
        description="Medicines you take that were not prescribed through Nexus Care."
        icon={<Pill aria-hidden="true" />}
        itemLabel="medicine"
        items={selfReported}
        schema={medicationsUpdateSchema}
        maxItems={50}
        emptyItem={{ name: '', dose: '', frequency: '', startedOn: '', notes: '', status: 'active' }}
        fields={[
          { name: 'name', label: 'Medicine', kind: 'text', required: true, placeholder: 'e.g. Metformin' },
          { name: 'dose', label: 'Dose', kind: 'text', placeholder: 'e.g. 500 mg' },
          { name: 'frequency', label: 'How often', kind: 'text', placeholder: 'e.g. Twice a day' },
          { name: 'startedOn', label: 'Started on', kind: 'date' },
          {
            name: 'status',
            label: 'Status',
            kind: 'select',
            options: [
              { value: 'active', label: 'Taking it' },
              { value: 'paused', label: 'Paused' },
              { value: 'stopped', label: 'Stopped' },
            ],
          },
          { name: 'notes', label: 'Notes', kind: 'text' },
        ]}
        toFormItem={(m) => ({
          id: m.id,
          name: m.name,
          dose: m.dose ?? '',
          frequency: m.frequency ?? '',
          startedOn: m.startedOn ?? '',
          notes: m.notes ?? '',
          status: m.status === 'completed' ? 'stopped' : m.status,
        })}
        renderItem={(m) => (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-medium text-slate-900">
                {m.name}
                {m.dose ? <span className="font-normal text-slate-600"> · {m.dose}</span> : null}
              </p>
              <p className="text-sm text-slate-600">
                {[m.frequency, m.startedOn ? `Since ${formatDate(m.startedOn) ?? ''}` : null, m.notes]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <Badge tone={m.status === 'active' ? 'success' : 'neutral'}>
              {m.status === 'active' ? 'Taking' : m.status === 'paused' ? 'Paused' : 'Stopped'}
            </Badge>
          </div>
        )}
        emptyText="No self-reported medicines recorded."
      />

      {/* Connected Doctor Prescriptions & Lab Records */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
              <ClipboardList className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Prescriptions & Lab Records</h3>
              <p className="text-xs text-slate-500">Clinical orders issued by your attending physicians.</p>
            </div>
          </div>
          <ButtonLink to="/patient/records" size="sm" variant="outline">
            All Records
          </ButtonLink>
        </CardHeader>
        <CardBody className="divide-y divide-slate-100 p-0">
          {prescriptions.slice(0, 2).map((rx) => (
            <div key={rx.id} className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{rx.diagnosis}</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-700">
                    {rx.id}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {rx.doctorName} ({rx.doctorSpecialty}) • {rx.items.length} prescribed medications
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPrescription(rx)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Eye className="size-3.5 text-brand-700" />
                View Rx Slip
              </button>
            </div>
          ))}

          {records.slice(0, 2).map((rec) => (
            <div key={rec.id} className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{rec.title}</span>
                  <Badge tone={rec.type === 'lab_report' ? 'brand' : 'neutral'}>
                    {rec.type.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600">
                  {rec.labOrClinic} • Issued {rec.recordDate}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(rec)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <FileText className="size-3.5 text-brand-700" />
                Preview Report
              </button>
            </div>
          ))}
        </CardBody>
      </Card>

      <ListSection
        section="history"
        title="Medical history"
        description="Past surgeries, hospital stays, illnesses and injuries."
        icon={<History aria-hidden="true" />}
        itemLabel="history entry"
        items={profile.history}
        schema={historyUpdateSchema}
        maxItems={100}
        emptyItem={{ kind: 'surgery', description: '', year: null, notes: '' }}
        fields={[
          { name: 'kind', label: 'Type', kind: 'select', options: HISTORY_KINDS },
          { name: 'year', label: 'Year', kind: 'year' },
          { name: 'description', label: 'Description', kind: 'text', required: true, wide: true, placeholder: 'e.g. Appendix removed' },
          { name: 'notes', label: 'Notes', kind: 'textarea', wide: true },
        ]}
        toFormItem={(h) => ({ id: h.id, kind: h.kind, description: h.description, year: h.year, notes: h.notes ?? '' })}
        renderItem={(h) => (
          <div className="flex gap-4">
            <span className="w-12 shrink-0 text-sm font-semibold text-slate-500">
              {h.year ?? '—'}
            </span>
            <div>
              <p className="font-medium text-slate-900">{h.description}</p>
              <p className="text-sm text-slate-600">
                {[labelOf(HISTORY_KINDS, h.kind), h.notes].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
        )}
        emptyText="No past history recorded."
      />

      {selectedRecord && (
        <LabReportPreviewModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}

      {selectedPrescription && (
        <PrescriptionSlipModal
          prescription={selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
        />
      )}
    </div>
  );
}

export function MedicalProfilePage() {
  const query = useMedicalProfile();
  return (
    <>
      <PageHeader
        title="Medical information"
        description="Your comprehensive health profile, active telemetry, medications, and clinical records."
        breadcrumbs={[{ label: 'Dashboard', to: '/patient' }, { label: 'Medical information' }]}
      />
      <div className="mb-6 rounded-xl border border-brand-200 bg-brand-50/50 p-4 text-xs text-brand-950 flex items-start gap-2.5 shadow-2xs">
        <Info className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden="true" />
        <p>
          This is your structured health profile. Doctors you consult on Nexus Care can review this information to provide accurate care. You can add self-reported conditions, manage allergies, and monitor real-time biometrics.
        </p>
      </div>
      <QueryState query={query} loading={<Loading />} errorTitle="Could not load your medical information">
        {(profile) => <MedicalSections profile={profile} />}
      </QueryState>
    </>
  );
}

