# 01 — Product Requirements

## 1. Vision

Give patients — especially in rural and underserved areas — a single place to find a doctor, consult
remotely, keep their health records, follow their treatment, get medicines delivered, involve their
family, and understand their own health information, with AI and connected devices as supporting
(never diagnosing) tools.

## 2. Scope

### In scope (prototype)

- Accounts and profiles for four roles: **Patient**, **Doctor**, **Family/Caregiver**, **Admin**.
- Doctor discovery, availability, appointment booking, rescheduling and cancellation.
- Telemedicine consultations (video, audio-only, in-consultation chat).
- Medical records, prescriptions, medication lists and reminders.
- Online pharmacy (catalogue, inventory, orders, order tracking).
- Family/caregiver ecosystem with explicit, scoped, revocable patient consent.
- MedTranslator: plain-language explanation of uploaded medical documents.
- RAG health assistant grounded in a curated knowledge base, with citations.
- IoT health monitoring (ESP32-class devices + a simulator), threshold and ML-based anomaly/risk indication.
- Health and emergency alerts to patients and permitted family members.
- In-app notifications (email/SMS/WhatsApp later via adapters).
- Admin dashboard and analytics.

### Explicit non-goals

- Clinical diagnosis, triage decisions or treatment decisions by software.
- Real payment processing (prototype uses _cash on delivery_ and an isolated _mock_ online payment).
- E-prescription submission to national registries, insurance claims, EHR interoperability (FHIR export is a later candidate).
- Raw ECG waveform interpretation.
- Native mobile apps (the web app is responsive and PWA-ready).

## 3. Safety principles (apply to every module)

| Principle              | Implementation                                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| No diagnosis claims    | Copy, prompts and UI use "information", "anomaly", "risk indication", "talk to your doctor".                               |
| AI is not a doctor     | Assistant identifies itself as an AI information tool on every session; refuses diagnosis, dosing changes and prescribing. |
| Emergency first        | Emergency-like inputs (chat, SOS, critical vitals) surface the configured local emergency number before anything else.     |
| No fabricated sources  | RAG answers cite only retrieved knowledge-base chunks; no chunk → "I couldn't find this in trusted sources".               |
| Consent before sharing | Family members see nothing by default; each scope is granted by the patient and revocable instantly.                       |
| Human in the loop      | Prescriptions are issued only by verified doctors; AI never creates clinical records.                                      |
| Labelled simulation    | Simulated devices, mock payments and mock video are visibly badged in the UI and flagged in data.                          |

## 4. User roles

| Role                   | Who                                                | Key goals                                                                                                                                            |
| ---------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Patient**            | Person receiving care (adult account holder)       | Find doctors, book and attend consultations, keep records, follow medication, order medicines, understand documents, monitor vitals, involve family. |
| **Doctor**             | Registered medical practitioner, verified by admin | Publish availability, manage appointments, consult remotely, view permitted patient data, write prescriptions and notes.                             |
| **Family / Caregiver** | Relative or caregiver invited by a patient         | View only what the patient permitted, receive medication and emergency alerts, optionally manage appointments.                                       |
| **Admin**              | Platform operator                                  | Verify doctors, manage users, pharmacy catalogue/orders, knowledge base, analytics, audit.                                                           |

v1 uses **one role per account** (see ADR-005). Minors/dependants without their own account are a
later extension (guardian-managed patient profiles).

## 5. Feature modules and requirements

Requirement IDs are referenced from tests and phase reports.

### 5.1 Patient

| Module                    | Requirements                                                                                                                                                                                                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Profile**               | PAT-1 Register/login with email (phone OTP later). PAT-2 Complete profile: DOB, sex, blood group, height/weight, allergies, chronic conditions, emergency contact, address, preferred language, timezone. PAT-3 Edit profile; changes audited. |
| **Doctors**               | PAT-4 Search verified doctors by specialty, name, language, consultation mode, fee range, earliest availability. PAT-5 View doctor profile and next available slots.                                                                           |
| **Appointments**          | PAT-6 Book an available slot (video/audio/in-person) with reason for visit. PAT-7 Reschedule (to another free slot) or cancel until a cut-off (default 2 h before start). PAT-8 View upcoming/past appointments with status timeline.          |
| **Consultations**         | PAT-9 Join the consultation room from 10 min before start. PAT-10 Audio-only fallback and in-consultation text chat with attachments. PAT-11 View consultation summary written by the doctor.                                                  |
| **Medical records**       | PAT-12 Upload PDFs/images with type, title, date. PAT-13 View/download own records. PAT-14 Hide a record from doctors ("private"). PAT-15 Soft-delete own uploads.                                                                             |
| **Prescriptions**         | PAT-16 View prescriptions issued to them; download PDF (later). PAT-17 Order medicines from a prescription.                                                                                                                                    |
| **Medicines & reminders** | PAT-18 Medication list auto-populated from prescriptions; add self-reported medicines. PAT-19 Set reminder times per medication. PAT-20 Mark doses taken/skipped; missed doses auto-detected. PAT-21 Adherence summary.                        |
| **Pharmacy**              | PAT-22 Browse catalogue and pharmacy availability. PAT-23 Cart and checkout; Rx-only medicines require a valid prescription. PAT-24 Track and cancel orders (before dispatch).                                                                 |
| **Family**                | PAT-25 Invite caregivers by email. PAT-26 Grant/revoke per-scope permissions. PAT-27 Remove a caregiver at any time. PAT-28 See which caregiver accessed what (audit view, later).                                                             |
| **AI assistant**          | PAT-29 Ask health questions; answers grounded in the knowledge base with citations. PAT-30 Optional opt-in to use own profile/medication context. PAT-31 Chat history; delete sessions.                                                        |
| **MedTranslator**         | PAT-32 Upload or pick a record; receive a structured plain-language explanation in a chosen language and reading level. PAT-33 Explanation lists questions to ask the doctor and never diagnoses.                                              |
| **Health monitoring**     | PAT-34 Register IoT device (key shown once) or simulator. PAT-35 Live and historical vitals charts. PAT-36 See anomaly/risk indications with contributing factors. PAT-37 SOS button.                                                          |
| **Notifications**         | PAT-38 In-app notification centre with unread count (realtime). PAT-39 Per-category channel preferences.                                                                                                                                       |

### 5.2 Doctor

| Module            | Requirements                                                                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Profile**       | DOC-1 Apply as doctor: registration number, council, specialties, experience, languages, fee, bio. DOC-2 Hidden from discovery until admin verifies.                                              |
| **Availability**  | DOC-3 Weekly recurring availability rules (per weekday, time range, slot length, modes). DOC-4 Time-off/exceptions. DOC-5 Changes never silently cancel booked appointments (conflicts reported). |
| **Appointments**  | DOC-6 Day/week agenda. DOC-7 Cancel with reason (patient notified), mark no-show.                                                                                                                 |
| **Patients**      | DOC-8 List patients with whom a care relationship exists. DOC-9 View patient chart: profile summary, non-private records, prescriptions, medications, vitals, alerts.                             |
| **Consultations** | DOC-10 Start consultation, video/audio, chat. DOC-11 Private clinical notes + patient-visible summary, follow-up date.                                                                            |
| **Prescriptions** | DOC-12 Issue structured prescriptions (catalogue-linked or free-text items) from a consultation. DOC-13 Cancel a prescription.                                                                    |

### 5.3 Family / Caregiver

| Module                          | Requirements                                                                                                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Linked patients**             | FAM-1 Accept an invitation; list linked patients and status. FAM-2 Leave a link.                                                                                                     |
| **Permissions**                 | FAM-3 See exactly which scopes were granted. Default: none.                                                                                                                          |
| **Medication alerts**           | FAM-4 Notified of missed doses (scope `receive_medication_alerts`).                                                                                                                  |
| **Emergency alerts**            | FAM-5 Notified of SOS and critical health alerts (scope `receive_emergency_alerts`); can acknowledge.                                                                                |
| **Selected health information** | FAM-6 Read-only views per scope: profile summary, appointments, records, prescriptions, medications, vitals. FAM-7 Book/cancel on behalf of patient only with `manage_appointments`. |

### 5.4 Admin

| Module             | Requirements                                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| **Users**          | ADM-1 Search users, suspend/reactivate. ADM-2 Admin accounts created only by CLI/seed, MFA required.                         |
| **Doctors**        | ADM-3 Verification queue: approve/reject with reason; suspend.                                                               |
| **Appointments**   | ADM-4 Platform-wide list with filters (no clinical notes).                                                                   |
| **Pharmacy**       | ADM-5 Manage medicines, pharmacies, inventory. ADM-6 Process orders through statuses; verify Rx for prescription-only items. |
| **Knowledge base** | ADM-7 Upload curated documents with source, publisher, URL, licence; review and publish.                                     |
| **Analytics**      | ADM-8 Users by role, appointments over time, completion/no-show rates, orders, alert volumes, AI usage — aggregates only.    |
| **Platform**       | ADM-9 Specialties, feature flags, emergency number configuration. ADM-10 Audit log viewer.                                   |

## 6. Non-functional requirements

| Area                 | Target                                                                                                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accessibility        | WCAG 2.2 AA: keyboard navigation, focus management, labels, contrast ≥ 4.5:1, reduced-motion support.                                                                                                                           |
| Responsiveness       | Usable from 360 px wide; tables collapse to cards on mobile.                                                                                                                                                                    |
| Low bandwidth        | Route-level code splitting; public pages ≤ ~250 KB gzipped JS; audio-only consultation mode; skeletons, not spinners, for perceived speed.                                                                                      |
| Performance          | p95 API latency < 300 ms for CRUD endpoints (excluding AI/ML); booking is atomic.                                                                                                                                               |
| Internationalisation | English first. Marketing copy is centralised in content modules (`features/marketing/content.ts`) and react-i18next is introduced as a dedicated step before a second language ships. Dates/times shown in the user's timezone. |
| Privacy              | Least privilege, consent-based sharing, audit of sensitive reads, no PHI in logs or external notification bodies.                                                                                                               |
| Reliability          | Idempotent booking/order/ingest endpoints; background jobs safe to run on multiple instances.                                                                                                                                   |
| Observability        | Structured logs with request IDs; health/readiness endpoints; error tracking (later).                                                                                                                                           |

## 7. User journeys

### J1 — Patient books and attends a video consultation

1. Patient registers → verifies email → completes profile.
2. Searches "General physician, Hindi, video" → opens doctor profile → picks a slot → confirms reason.
3. API atomically creates the appointment → patient and doctor get notifications; reminder 1 h before.
4. 10 min before start, "Join" becomes active → both join the room (audio-only if bandwidth is poor).
5. Doctor writes notes and patient summary, issues a prescription → appointment completed.
6. Patient sees summary + prescription; medications appear in their list with suggested reminder times.

### J2 — Patient reschedules / cancels

1. From appointment detail → "Reschedule" shows free slots of the same doctor → confirm.
2. Old slot freed, event logged, doctor notified. Cancellation within cut-off is blocked with an explanation.

### J3 — Doctor onboarding

1. Doctor registers as doctor → submits registration details → status _pending_; dashboard shows a "verification pending" state.
2. Admin reviews → approves → doctor notified → configures availability → appears in discovery.

### J4 — Medication adherence with family support

1. Prescription creates medications → patient sets 08:00/20:00 reminders.
2. Worker generates dose instances → in-app reminder at 08:00.
3. Dose not marked by 08:00 + grace (default 60 min) → marked _missed_ → caregiver with `receive_medication_alerts` is notified.

### J5 — Family invitation and consent

1. Patient → Family → "Invite" (email, relationship) → selects scopes (none preselected).
2. Caregiver receives link → signs up/logs in as caregiver → accepts.
3. Caregiver dashboard shows only granted sections. Patient revokes a scope → access disappears immediately.

### J6 — Ordering medicines from a prescription

1. Patient opens prescription → "Order medicines" → items pre-filled → chooses pharmacy with stock.
2. Checkout (COD or clearly-labelled mock payment) → order _pending review_ if any item is Rx-only.
3. Admin verifies the linked prescription → confirmed → packed → out for delivery → delivered; each step notifies the patient.

### J7 — Understanding a lab report (MedTranslator)

1. Patient uploads a lab report PDF (or picks an existing record) → chooses language + reading level.
2. Backend extracts text and asks the LLM for a structured explanation.
3. Patient sees: summary, each value with the document's own reference range and a plain-language note,
   terms glossary, questions for the doctor, safety disclaimer. No diagnosis.

### J8 — Asking the health assistant

1. Patient opens assistant → safety banner → asks a question.
2. Emergency-like input → emergency guidance shown first.
3. Otherwise hybrid retrieval from the knowledge base → streamed answer with numbered citations to real sources.

### J9 — IoT monitoring and alerts

1. Patient registers a device (or starts the simulator) → device sends readings every few seconds.
2. Vitals dashboard updates live. A reading outside thresholds creates a _warning/critical health alert_.
3. ML service periodically scores recent windows → _risk indication_ with contributing factors.
4. Critical alert → patient + caregivers with `receive_emergency_alerts` notified; anyone can acknowledge; unacknowledged alerts re-notify.

### J10 — SOS

Patient taps SOS → confirmation → critical alert with last known vitals → caregivers notified → emergency number displayed prominently.

## 8. Application sitemap

> **Phase 2 update:** the authenticated app lives under a single `/dashboard` shell. The
> role areas below map to `/dashboard/...` paths whose navigation is chosen by the signed-in role
> (e.g. `/patient/appointments` → `/dashboard/appointments`). Public marketing pages added in
> Phase 2: `/how-it-works`, `/features`, `/about`, `/contact`.

```
PUBLIC
/                         Landing (what Nexus Care is, how it works, safety statement)
/how-it-works  /features  /about  /contact
/login  /register  /register/doctor  /forgot-password  /reset-password  /verify-email
/doctors                  Public doctor directory (verified only)
/doctors/:doctorId        Public doctor profile + slots (booking requires login)
/invite/:token            Caregiver invitation acceptance
/legal/privacy  /legal/terms  /legal/ai-safety

SHARED (authenticated)
/onboarding               Role-specific profile completion
/notifications            Notification centre
/settings                 Account, security (MFA), notification preferences, language

PATIENT  /patient
  /                       Dashboard: next appointment, today's doses, latest vitals, alerts
  /appointments           List (upcoming/past)          /appointments/:id
  /appointments/book/:doctorId
  /consultations/:id      Consultation room
  /records                List + upload                 /records/:id
  /prescriptions          List                          /prescriptions/:id
  /medications            Medication list, reminders, today's doses, adherence
  /pharmacy               Catalogue                     /pharmacy/cart   /pharmacy/checkout
  /orders                 List                          /orders/:id
  /family                 Caregivers, invitations, permissions
  /assistant              Sessions                      /assistant/:sessionId
  /medtranslator          Analyses                      /medtranslator/:analysisId
  /health                 Vitals dashboard, risk indications
  /health/devices         Devices & simulator
  /alerts                 Health alerts history
  /profile                Medical profile

DOCTOR  /doctor
  /                       Dashboard: today's agenda, pending items, alerts for my patients
  /onboarding             Verification status / application
  /schedule               Availability rules + time off
  /appointments           Agenda (day/week/list)        /appointments/:id
  /consultations/:id      Consultation room + notes + prescription panel
  /patients               My patients                   /patients/:patientId (tabs)
  /prescriptions          Issued prescriptions          /prescriptions/new?consultationId=
  /profile                Public profile

CAREGIVER  /caregiver
  /                       Linked patients + open alerts
  /patients/:patientId    Permitted sections only
  /alerts                 Alerts across linked patients
  /invitations            Pending invitations

ADMIN  /admin
  /                       Overview KPIs
  /users                  /users/:id
  /doctors                Verification queue            /doctors/:id
  /appointments
  /pharmacy/medicines  /pharmacy/pharmacies  /pharmacy/orders
  /knowledge              Knowledge-base documents      /knowledge/:id
  /analytics
  /audit-logs
  /settings               Specialties, emergency number, feature flags
```
