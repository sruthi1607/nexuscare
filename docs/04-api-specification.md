# 04 — API Specification

Base URL: `/api/v1`. JSON over HTTPS. OpenAPI document generated from shared Zod schemas.

## 1. Conventions

| Topic        | Convention                                                                                                                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Auth         | httpOnly session cookie set by `/auth/login` or `/auth/register` (ADR-020); browsers send it automatically. IoT ingest uses `X-Device-Key`. Internal ML calls use `X-Internal-Token`.                                                |
| Success      | `200/201` → `{ "data": ..., "meta"?: { "nextCursor": "...", "total"?: n } }`                                                                                                                                                         |
| Errors       | `{ "error": { "code": "APPOINTMENT_SLOT_UNAVAILABLE", "message": "Human readable", "details"?: [...], "requestId": "..." } }`                                                                                                        |
| Status codes | 400 validation · 401 unauthenticated · 403 forbidden · 404 not found (also used instead of 403 when existence itself is sensitive) · 409 conflict · 422 business rule · 429 rate limited · 500 internal · 503 dependency unavailable |
| Pagination   | Cursor based: `?limit=20&cursor=...` (max 100).                                                                                                                                                                                      |
| Filtering    | Explicit query params validated by Zod; no free-form filters.                                                                                                                                                                        |
| Idempotency  | `Idempotency-Key` header supported on `POST /appointments`, `POST /orders`, `POST /iot/ingest`, `POST /alerts/sos`.                                                                                                                  |
| Time         | ISO-8601 UTC in payloads; clients render in user timezone.                                                                                                                                                                           |
| Versioning   | Breaking changes → `/api/v2`; additive changes in place.                                                                                                                                                                             |
| Streaming    | Assistant replies via Server-Sent Events (`text/event-stream`).                                                                                                                                                                      |
| Rate limits  | Global per-IP; stricter buckets for auth-adjacent, AI, upload and ingest endpoints.                                                                                                                                                  |

Legend: **P** patient · **D** doctor · **C** caregiver · **A** admin · **Pub** public · **Dev** device · **Int** internal.
"(scope)" = caregiver needs that family scope for the patient.

## 2. System

Operational endpoints are unversioned and live directly under `/api`.

| Method | Path          | Who | Purpose                                                                                                       |
| ------ | ------------- | --- | ------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/health` | Pub | Health report: `200` + `status: "ok"` when the database is reachable, `503` + `status: "degraded"` otherwise. |

## 3. Authentication (implemented in Phase 3)

| Method | Path                 | Who | Purpose                                                                                                                                |
| ------ | -------------------- | --- | -------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/auth/register`     | Pub | `{fullName, email, role: patient\|caregiver\|doctor, password, acceptTerms: true}` → `201 {user}` + session cookie. `409 EMAIL_TAKEN`. |
| POST   | `/auth/login`        | Pub | `{email, password}` → `200 {user}` + new session cookie (old one revoked). `401 INVALID_CREDENTIALS`, `403 ACCOUNT_SUSPENDED`, `429`.  |
| POST   | `/auth/logout`       | Any | Revokes the session and clears the cookie → `204` (also when not signed in).                                                           |
| GET    | `/auth/session`      | Any | `{user}` or `{user: null}` — signed out is not an error.                                                                               |
| GET    | `/me` ✅             | All | The signed-in user (`401` when signed out).                                                                                            |
| GET    | `/admin/overview` ✅ | A   | Aggregate counts: users by role, suspended, doctors pending verification, active sessions, new users (7 days). `403` for other roles.  |

`user` is `{id, email, role, fullName, status, doctorVerification}` (`sessionUserSchema` in `packages/shared`).

## 3b. Identity & profiles (planned)

| Method | Path                                  | Who                                 | Purpose                                                                          |
| ------ | ------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------- |
| GET    | `/me`                                 | All                                 | Current profile, role, onboarding state, role extension summary                  |
| PATCH  | `/me`                                 | All                                 | Update name, phone, language, timezone, avatar                                   |
| POST   | `/me/onboarding`                      | P, C, D                             | Complete role-specific onboarding (patient medical profile / doctor application) |
| GET    | `/patients/me` · PATCH `/patients/me` | P                                   | Medical profile                                                                  |
| GET    | `/patients/:patientId/summary`        | P(self), D(care), C(`view_profile`) | Read-only summary for chart/overview                                             |
| POST   | `/me/delete-request`                  | All                                 | Account deletion request (processed by admin/retention job)                      |

## 4. Doctors & discovery

| Method      | Path                                    | Who | Purpose                                                                                |
| ----------- | --------------------------------------- | --- | -------------------------------------------------------------------------------------- |
| GET         | `/specialties`                          | Pub | List specialties                                                                       |
| GET         | `/doctors`                              | Pub | Search verified doctors: `q, specialty, language, mode, minFee, maxFee, availableFrom` |
| GET         | `/doctors/:doctorId`                    | Pub | Public profile                                                                         |
| GET         | `/doctors/:doctorId/slots?from&to&mode` | Pub | Computed free slots (≤ 31-day window)                                                  |
| GET · PATCH | `/doctors/me`                           | D   | Own doctor profile                                                                     |
| GET · PUT   | `/doctors/me/availability`              | D   | Replace weekly rule set (returns conflicts with booked appointments)                   |
| GET · POST  | `/doctors/me/time-off`                  | D   | List / add time off                                                                    |
| DELETE      | `/doctors/me/time-off/:id`              | D   | Remove time off                                                                        |
| GET         | `/doctors/me/patients`                  | D   | Patients with care relationship                                                        |

## 5. Appointments

| Method | Path                                     | Who                             | Purpose                                                       |
| ------ | ---------------------------------------- | ------------------------------- | ------------------------------------------------------------- |
| GET    | `/appointments?status&from&to&patientId` | P, D, C(`view_appointments`), A | Role-scoped list                                              |
| POST   | `/appointments`                          | P, C(`manage_appointments`)     | Book `{doctorId, startsAt, mode, reasonForVisit, patientId?}` |
| GET    | `/appointments/:id`                      | Participants, C(scope), A       | Detail + events                                               |
| POST   | `/appointments/:id/reschedule`           | P, C(`manage_appointments`)     | `{startsAt}` — same doctor, free slot, before cut-off         |
| POST   | `/appointments/:id/cancel`               | P, D, C(`manage_appointments`)  | `{reason}`                                                    |
| POST   | `/appointments/:id/no-show`              | D                               | Mark no-show after start + grace                              |

## 6. Consultations

| Method     | Path                                  | Who  | Purpose                                                                                                         |
| ---------- | ------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------- |
| POST       | `/appointments/:id/consultation/join` | P, D | Opens/creates consultation within join window; returns `{consultationId, provider, roomUrl/token, isSimulated}` |
| GET        | `/consultations/:id`                  | P, D | Detail (patient view omits private notes)                                                                       |
| PATCH      | `/consultations/:id`                  | D    | Notes, patient summary, advice, follow-up                                                                       |
| POST       | `/consultations/:id/end`              | D    | End consultation → appointment completed                                                                        |
| GET · POST | `/consultations/:id/messages`         | P, D | Chat history / send (attachments via record upload flow)                                                        |

## 7. Medical records

| Method | Path                                       | Who                                       | Purpose                                                                                                    |
| ------ | ------------------------------------------ | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| GET    | `/patients/:patientId/records?type&cursor` | P, D(care, not hidden), C(`view_records`) | List                                                                                                       |
| POST   | `/patients/:patientId/records/uploads`     | P, D(care)                                | Create pending record + signed upload URL `{fileName, mimeType, sizeBytes, recordType, title, recordDate}` |
| POST   | `/records/:id/complete-upload`             | Uploader                                  | Verify object (size, magic bytes, hash) → `available`                                                      |
| GET    | `/records/:id`                             | as list                                   | Metadata                                                                                                   |
| GET    | `/records/:id/download-url`                | as list                                   | 60-second signed URL (audited)                                                                             |
| PATCH  | `/records/:id`                             | P                                         | Title, type, date, `hiddenFromDoctors`                                                                     |
| DELETE | `/records/:id`                             | P (own uploads)                           | Soft delete                                                                                                |

## 8. Prescriptions, medications, reminders

| Method | Path                                      | Who                                                | Purpose                                                                           |
| ------ | ----------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------- |
| POST   | `/prescriptions`                          | D                                                  | `{consultationId, items[], notes, validUntil}` → also creates patient medications |
| GET    | `/prescriptions?patientId&status`         | P, D, C(`view_prescriptions`), A(for order review) | List                                                                              |
| GET    | `/prescriptions/:id`                      | same                                               | Detail                                                                            |
| POST   | `/prescriptions/:id/cancel`               | D (issuer)                                         | Cancel with reason                                                                |
| GET    | `/patients/:patientId/medications?status` | P, D(care), C(`view_medications`)                  | Medication list                                                                   |
| POST   | `/patients/:patientId/medications`        | P                                                  | Add self-reported medication                                                      |
| PATCH  | `/medications/:id`                        | P                                                  | Status (pause/stop), instructions                                                 |
| PUT    | `/medications/:id/schedules`              | P                                                  | Replace reminder times                                                            |
| GET    | `/patients/:patientId/doses?date`         | P, C(`view_medications`)                           | Day's doses                                                                       |
| POST   | `/doses/:id/status`                       | P                                                  | `{status: taken                                                                   | skipped}` |
| GET    | `/patients/:patientId/adherence?from&to`  | P, D(care), C(`view_medications`)                  | Adherence stats                                                                   |

## 9. Pharmacy & orders

| Method | Path                                       | Who       | Purpose                                      |
| ------ | ------------------------------------------ | --------- | -------------------------------------------- |
| GET    | `/medicines?q&requiresPrescription&cursor` | Pub       | Catalogue search                             |
| GET    | `/medicines/:id`                           | Pub       | Detail + availability summary                |
| GET    | `/pharmacies?lat&lng&medicineIds`          | P         | Pharmacies with stock                        |
| GET    | `/pharmacies/:id/inventory?q`              | P         | Inventory                                    |
| POST   | `/orders/quote`                            | P         | Server-side price/stock validation of a cart |
| POST   | `/orders`                                  | P         | Place order (RPC `place_order`)              |
| GET    | `/orders?status`                           | P, A      | List                                         |
| GET    | `/orders/:id`                              | P(own), A | Detail + status history                      |
| POST   | `/orders/:id/cancel`                       | P         | Before `out_for_delivery`                    |

## 10. Family / caregivers

| Method | Path                                   | Who                   | Purpose                                                                      |
| ------ | -------------------------------------- | --------------------- | ---------------------------------------------------------------------------- |
| GET    | `/family/links`                        | P, C                  | Patient: my caregivers; caregiver: my patients (with granted scopes)         |
| POST   | `/family/invitations`                  | P                     | `{email, relationship, scopes[]}` → emailed token (in-app if account exists) |
| GET    | `/family/invitations/:token`           | Pub                   | Invitation preview (patient first name, relationship only)                   |
| POST   | `/family/invitations/:token/accept`    | C                     | Accept (caregiver must be logged in, email must match)                       |
| POST   | `/family/links/:id/decline`            | C                     | Decline                                                                      |
| PUT    | `/family/links/:id/permissions`        | P                     | Replace granted scopes                                                       |
| DELETE | `/family/links/:id`                    | P (revoke), C (leave) | End link; access removed immediately                                         |
| GET    | `/family/patients/:patientId/overview` | C                     | Aggregated view containing only permitted sections                           |

## 11. AI assistant & MedTranslator

| Method     | Path                                                      | Who     | Purpose                                                                                          |
| ---------- | --------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------ |
| GET · POST | `/assistant/sessions`                                     | P, C, D | List / create session `{usePersonalContext}` (personal context: patients only, requires consent) |
| GET        | `/assistant/sessions/:id`                                 | Owner   | Session with messages                                                                            |
| DELETE     | `/assistant/sessions/:id`                                 | Owner   | Soft delete                                                                                      |
| POST       | `/assistant/sessions/:id/messages`                        | Owner   | Send message → SSE: `safety`, `delta`, `citations`, `done`, `error` events                       |
| POST       | `/medtranslator/analyses`                                 | P       | `{recordId}` or `{uploadId}` + `{language, readingLevel}` → `202 {analysisId}`                   |
| GET        | `/medtranslator/analyses` · `/medtranslator/analyses/:id` | P       | List / poll status + result                                                                      |

## 12. IoT, health metrics, alerts

| Method     | Path                                                | Who                                       | Purpose                                                                                                   |
| ---------- | --------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| GET · POST | `/iot/devices`                                      | P                                         | List / register `{name, deviceType, isSimulated}` → returns device key **once**                           |
| POST       | `/iot/devices/:id/rotate-key`                       | P                                         | New key, old revoked                                                                                      |
| DELETE     | `/iot/devices/:id`                                  | P                                         | Revoke                                                                                                    |
| POST       | `/iot/ingest`                                       | Dev                                       | `{deviceId, readings:[{metric, value, unit, recordedAt}]}` (≤ 100 per batch) → `202 {accepted, rejected}` |
| GET        | `/patients/:patientId/metrics?types&from&to&bucket` | P, D(care), C(`view_health_metrics`)      | Raw or bucketed series                                                                                    |
| GET        | `/patients/:patientId/metrics/latest`               | same                                      | Latest per metric                                                                                         |
| GET · PUT  | `/patients/:patientId/thresholds`                   | P(read), D(care, write)                   | Personal thresholds                                                                                       |
| GET        | `/patients/:patientId/risk-assessments`             | P, D(care), C(`view_health_metrics`)      | ML risk indications                                                                                       |
| GET        | `/alerts?patientId&status&severity`                 | P, D(care), C(`receive_emergency_alerts`) | Alerts                                                                                                    |
| POST       | `/alerts/sos`                                       | P                                         | Create critical SOS alert `{note?, location?}`                                                            |
| POST       | `/alerts/:id/acknowledge`                           | P, D(care), C(scope)                      | Acknowledge                                                                                               |
| POST       | `/alerts/:id/resolve`                               | P, D(care)                                | Resolve with note                                                                                         |

## 13. Notifications

| Method    | Path                                                  | Who | Purpose                          |
| --------- | ----------------------------------------------------- | --- | -------------------------------- |
| GET       | `/notifications?unreadOnly&cursor`                    | All | List                             |
| GET       | `/notifications/unread-count`                         | All | Badge count                      |
| POST      | `/notifications/:id/read` · `/notifications/read-all` | All | Mark read                        |
| GET · PUT | `/notifications/preferences`                          | All | Channel preferences per category |

## 14. Admin

| Method     | Path                                                                                     | Purpose                                                         |
| ---------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| GET        | `/admin/users?role&status&q`                                                             | Search users                                                    |
| PATCH      | `/admin/users/:id/status`                                                                | Suspend / reactivate                                            |
| GET        | `/admin/doctors?verification`                                                            | Verification queue                                              |
| POST       | `/admin/doctors/:id/verify` · `/admin/doctors/:id/reject` · `/admin/doctors/:id/suspend` | Verification decisions                                          |
| GET        | `/admin/appointments?status&from&to&doctorId`                                            | Platform appointments (no clinical content)                     |
| CRUD       | `/admin/specialties`                                                                     | Specialties                                                     |
| CRUD       | `/admin/medicines` · `/admin/pharmacies`                                                 | Catalogue                                                       |
| PUT        | `/admin/pharmacies/:id/inventory`                                                        | Bulk inventory update                                           |
| GET        | `/admin/orders?status`                                                                   | Orders queue                                                    |
| POST       | `/admin/orders/:id/status`                                                               | `{status, note}` with transition validation                     |
| GET · POST | `/admin/knowledge-documents`                                                             | List / upload (multipart or signed upload) with source metadata |
| POST       | `/admin/knowledge-documents/:id/publish` · `/archive`                                    | Lifecycle (publish triggers chunk + embed job)                  |
| GET        | `/admin/analytics/overview?from&to`                                                      | KPIs (aggregates)                                               |
| GET        | `/admin/analytics/timeseries?metric&from&to&interval`                                    | Charts                                                          |
| GET        | `/admin/audit-logs?actorId&entityType&from&to`                                           | Audit viewer                                                    |
| GET · PUT  | `/admin/settings`                                                                        | Emergency number, feature flags                                 |

## 15. Internal ML service (`services/ml`, private network)

| Method | Path                | Purpose                                                                                                                                    |
| ------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| GET    | `/health`           | Liveness + loaded model versions                                                                                                           |
| POST   | `/v1/anomaly/score` | `{patientId, window:{start,end}, series:{metric:[{t,v}]}, baseline?}` → `{anomalyScore, isAnomalous, contributingFactors[], modelVersion}` |
| POST   | `/v1/risk/estimate` | `{features:{age, sex, restingHr, systolic, ...}}` → `{riskLevel, score, contributingFactors[], modelVersion, disclaimer}`                  |
| GET    | `/v1/models`        | Model cards metadata                                                                                                                       |

## 16. Error code catalogue (initial)

`VALIDATION_FAILED`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `ACCOUNT_SUSPENDED`,
`ONBOARDING_REQUIRED`, `DOCTOR_NOT_VERIFIED`, `APPOINTMENT_SLOT_UNAVAILABLE`,
`APPOINTMENT_CUTOFF_PASSED`, `APPOINTMENT_INVALID_TRANSITION`, `CONSULTATION_NOT_OPEN`,
`UPLOAD_INVALID_FILE`, `UPLOAD_TOO_LARGE`, `PRESCRIPTION_REQUIRED`, `OUT_OF_STOCK`,
`ORDER_INVALID_TRANSITION`, `FAMILY_INVITE_EXPIRED`, `FAMILY_INVITE_EMAIL_MISMATCH`,
`FAMILY_SCOPE_MISSING`, `DEVICE_KEY_INVALID`, `INGEST_READING_OUT_OF_RANGE`,
`AI_UNAVAILABLE`, `AI_REFUSED`, `RATE_LIMITED`, `DEPENDENCY_UNAVAILABLE`, `INTERNAL_ERROR`.
