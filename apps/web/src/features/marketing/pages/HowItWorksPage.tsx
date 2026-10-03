import { HeartHandshake, Stethoscope, User } from 'lucide-react';
import { Container } from '../../../components/layout/Container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/Tabs';
import { CallToAction } from '../components/CallToAction';
import { JourneySteps } from '../components/JourneySteps';
import { PageHero } from '../components/PageHero';
import { SectionHeading } from '../components/Section';
import { doctorJourney, familyJourney, patientJourney } from '../content';

const principles = [
  {
    title: 'Consent before sharing',
    text: 'Patients decide what doctors and family can see. Every permission can be revoked.',
  },
  {
    title: 'Humans make clinical decisions',
    text: 'Only verified doctors diagnose and prescribe. AI features explain and inform — they never diagnose.',
  },
  {
    title: 'Designed for real conditions',
    text: 'Works on modest phones and weak connections, with audio-only consultations as a fallback.',
  },
];

export function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="Simple for patients, practical for doctors, reassuring for families."
        description="Nexus Care brings everyone involved in someone’s care onto one platform, each with the right level of access."
      />

      <section aria-labelledby="journeys-heading" className="py-16 sm:py-20">
        <Container>
          <h2 id="journeys-heading" className="sr-only">
            Journeys by role
          </h2>
          <Tabs defaultValue="patients">
            <TabsList aria-label="Choose a role">
              <TabsTrigger value="patients">
                <User aria-hidden="true" />
                Patients
              </TabsTrigger>
              <TabsTrigger value="doctors">
                <Stethoscope aria-hidden="true" />
                Doctors
              </TabsTrigger>
              <TabsTrigger value="families">
                <HeartHandshake aria-hidden="true" />
                Families
              </TabsTrigger>
            </TabsList>
            <TabsContent value="patients" className="mt-8">
              <JourneySteps steps={patientJourney} />
            </TabsContent>
            <TabsContent value="doctors" className="mt-8">
              <JourneySteps steps={doctorJourney} />
            </TabsContent>
            <TabsContent value="families" className="mt-8">
              <JourneySteps steps={familyJourney} />
            </TabsContent>
          </Tabs>
        </Container>
      </section>

      <section aria-labelledby="principles-heading" className="bg-slate-50 py-16 sm:py-20">
        <Container>
          <SectionHeading
            id="principles-heading"
            eyebrow="Our principles"
            title="Built around safety and trust."
          />
          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {principles.map((p) => (
              <li key={p.title} className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-slate-900">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <CallToAction />
    </>
  );
}
