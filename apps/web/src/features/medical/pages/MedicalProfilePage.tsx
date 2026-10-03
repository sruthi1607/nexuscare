import { ClipboardList, History, Info, Pill, ShieldAlert } from 'lucide-react';
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
import { Card, CardBody } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { formatDate } from '../../../lib/format';
import { useMedicalProfile } from '../api';
import { EmergencyContactSection, HealthBasicsSection } from '../components/BasicsSections';
import { ListSection } from '../components/ListSection';

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
  const selfReported = profile.medications.filter((m) => m.source === 'self_reported');
  const prescribed = profile.medications.filter((m) => m.source === 'prescribed');

  return (
    <div className="space-y-6">
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
        emptyText="No medicines recorded."
      />

      {prescribed.length > 0 ? (
        <p className="flex items-start gap-2 text-sm text-slate-600">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {prescribed.length} prescribed medicine(s) are managed from your prescriptions.
        </p>
      ) : null}

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
    </div>
  );
}

export function MedicalProfilePage() {
  const query = useMedicalProfile();
  return (
    <>
      <PageHeader
        title="Medical information"
        description="Keep this up to date so the doctors you consult have the full picture."
        breadcrumbs={[{ label: 'Dashboard', to: '/patient' }, { label: 'Medical information' }]}
      />
      <p className="mb-6 flex items-start gap-2 rounded-lg bg-slate-100 p-3 text-sm text-slate-600">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        This is information you provide about yourself. Nexus Care does not interpret it or make
        medical decisions. Right now only you can see it; doctors you consult, and family members
        you explicitly allow, will be able to see it once those features launch.
      </p>
      <QueryState query={query} loading={<Loading />} errorTitle="Could not load your medical information">
        {(profile) => <MedicalSections profile={profile} />}
      </QueryState>
    </>
  );
}
