import { Info } from 'lucide-react';
import { Container } from '../../../components/layout/Container';
import { Alert } from '../../../components/ui/Alert';
import { CallToAction } from '../components/CallToAction';
import { PageHero } from '../components/PageHero';
import { coreFeatures } from '../content';

const details: Record<string, string[]> = {
  telemedicine: ['Video and audio-only modes', 'In-consultation chat', 'Doctor’s written summary'],
  appointments: ['Real-time availability', 'Reschedule and cancel', 'Automatic reminders'],
  records: ['Upload PDFs and photos', 'Private-from-doctors option', 'Secure download links'],
  prescriptions: ['Issued by verified doctors', 'Linked to consultations', 'Order from pharmacy'],
  medications: ['Custom reminder times', 'Taken / skipped tracking', 'Adherence overview'],
  pharmacy: ['Prescription checks', 'Order tracking', 'Cash on delivery'],
  assistant: ['Cited, trusted sources', 'Emergency guidance first', 'Never diagnoses'],
  medtranslator: ['Lab reports and summaries', 'Multiple languages', 'Questions for your doctor'],
  monitoring: ['ESP32-compatible devices', 'Threshold alerts', 'Anomaly and risk indications'],
  family: ['Invite by email', 'Per-permission control', 'Instant revocation'],
};

export function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title="Everything needed for remote care, in one platform."
        description="Each feature connects to the others: a consultation produces a prescription, the prescription becomes reminders, and reminders can keep family informed."
      />

      <section aria-label="Feature list" className="py-16 sm:py-20">
        <Container>
          <Alert tone="info" title="Built in phases" className="mb-10">
            Nexus Care is a prototype under active development. Features become available step by
            step; nothing here is presented as a certified medical service.
          </Alert>
          <ul className="grid gap-6 md:grid-cols-2">
            {coreFeatures.map(({ id, icon: Icon, title, description }) => (
              <li
                key={id}
                id={id}
                className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-6 shadow-card"
              >
                <div className="flex items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {(details[id] ?? []).map((detail) => (
                        <li
                          key={detail}
                          className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                        >
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-10 flex items-start gap-2 text-sm text-slate-500">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            AI and monitoring features provide information, anomaly detection and risk indication
            only. They do not diagnose any medical condition.
          </p>
        </Container>
      </section>

      <CallToAction />
    </>
  );
}
