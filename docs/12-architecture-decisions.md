# 12 — Architecture Decision Records

Each decision: context → decision → consequences. New decisions are appended; superseded ones are
marked, never deleted.

### ADR-001 — Monorepo with npm workspaces

- **Decision:** One repository: `apps/web`, `apps/api`, `packages/shared`, `services/ml`, `iot/*`, `supabase/`.
- **Why:** Shared Zod schemas/types between web and API; atomic changes across layers; one CI.
- **Consequences:** npm workspaces (pnpm not installed; no extra tooling needed). Python service has its own toolchain.

### ADR-002 — Supabase for Postgres, Auth, Storage, Realtime and pgvector

- **Decision:** Use a hosted Supabase project per environment; SQL migrations are the schema source of truth.
- **Why:** Managed auth with MFA, RLS-native Postgres, signed-URL storage, realtime and vectors in one place.
- **Consequences:** Docker needed for fully local Supabase (not installed yet); hosted dev/test projects meanwhile.

### ADR-003 — Backend owns business logic

- **Decision:** All domain reads/writes go through the Express API. The browser uses Supabase only for auth, Realtime subscriptions and signed-URL file transfer.
- **Why:** Central validation, business rules, notifications and audit; easier to add AI/ML/IoT orchestration.
- **Consequences:** Slightly more API surface; consistent behaviour across clients (future mobile app).

### ADR-004 — Defense in depth: API policies + RLS with user-scoped clients

- **Decision:** Request handlers query Supabase with the caller's JWT so RLS applies; the service-role client is restricted (lint rule) to system modules.
- **Why:** One missed API check must not leak PHI.
- **Consequences:** Policies are written twice (TS + SQL) and both are tested.

### ADR-005 — One role per account (v1)

- **Decision:** `profiles.role` is a single `app_role`. Role-specific data in `patients` / `doctors`.
- **Why:** Simpler RBAC, UI and RLS for a prototype.
- **Consequences:** A person who is both a patient and a caregiver needs two accounts for now; `family_links.caregiver_id` references `profiles` (not a caregiver table) so multi-role support can be added later without schema rework.

### ADR-006 — Consent-based, scoped family access

- **Decision:** `family_links` + one row per granted `family_scope`; patient-initiated invitations only; default deny.
- **Why:** Explicit, auditable, instantly revocable consent; prevents unsolicited access requests.

### ADR-007 — Doctor access via care relationship

- **Decision:** Doctors access a patient's data only when a non-cancelled appointment exists; patients can hide individual records.
- **Why:** Least privilege without a separate consent workflow for every doctor.

### ADR-008 — Booking integrity in the database

- **Decision:** Slots computed on the fly; booking through an RPC; Postgres exclusion constraints prevent overlaps per doctor and per patient.
- **Why:** Correct under concurrency regardless of API instance count.

### ADR-009 — Adapters for every external integration, with explicit mocks

- **Decision:** `integrations/<kind>/` exposes an interface; implementations selected by env (`*_PROVIDER`). Mocks flag outputs as simulated for UI badges.
- **Why:** Testability, provider swap, honest demos without hardware/paid services.

### ADR-010 — Claude via the Anthropic SDK on the backend; separate embeddings provider

- **Decision:** `LlmClient` implemented with `@anthropic-ai/sdk`, model from `LLM_MODEL` (default `claude-opus-5-5`), effort set per route, structured outputs for MedTranslator, native citations for RAG. Embeddings via a separate provider (Voyage AI recommended) stored in pgvector with HNSW.
- **Why:** Native PDF/image understanding removes most OCR plumbing; native citations guarantee answers cite real retrieved text.
- **Consequences:** Two AI vendors to configure; data-processing agreements required before real PHI.

### ADR-011 — Worker process with database-claimed jobs

- **Decision:** `apps/api/src/worker.ts` runs scheduled jobs (reminders, dose generation, missed doses, notification dispatch, escalations, scoring, ingestion) claiming rows with `FOR UPDATE SKIP LOCKED` via RPC.
- **Why:** No extra infrastructure (Redis) for a prototype; safe with multiple instances.
- **Consequences:** Can migrate to a dedicated queue (pg-boss/pgmq) later without changing job logic.

### ADR-012 — ML as a separate internal Python service

- **Decision:** FastAPI + scikit-learn in `services/ml`, reachable only from API/worker with an internal token.
- **Why:** Python ML ecosystem; independent scaling and deployment; clear contract.

### ADR-013 — IoT over HTTPS with per-device keys

- **Decision:** Devices and simulator POST batches to `/api/v1/iot/ingest` with hashed per-device keys. MQTT can be added later behind the same ingestion service.
- **Why:** Simplest secure path for ESP32; simulator exercises the real pipeline.

### ADR-014 — Shared Zod schemas as the validation contract

- **Decision:** `packages/shared` holds request/response schemas used by React Hook Form and API middleware; OpenAPI generated from them.
- **Why:** No drift between frontend and backend validation.

### ADR-015 — UTC instants, IANA timezones for wall-clock rules

- **Decision:** `timestamptz` for instants; `time` + `timezone` for availability and reminders; rendering in the user's timezone.

### ADR-016 — REST `/api/v1` with a uniform envelope

- **Decision:** `{data, meta}` / `{error:{code,message,details,requestId}}`, cursor pagination, idempotency keys on critical POSTs, SSE for streaming.

### ADR-017 — Direct PostgreSQL pool for system-level database access

- **Context:** Phase 1 needs a verifiable database connection before Supabase Auth/RLS exist.
- **Decision:** The API holds a `pg` connection pool built from `DATABASE_URL` (Supabase pooler URI in
  hosted environments). It serves health checks now and background jobs/migrations later. Request-scoped
  domain data still goes through user-scoped Supabase clients (ADR-004) once auth lands in Phase 2.
- **Consequences:** SSL is configured explicitly via `DATABASE_SSL_MODE` (`disable` | `require` |
  `verify-full`, default `verify-full`) and optional `DATABASE_SSL_CA_FILE`; any `sslmode` in the URL is ignored.

### ADR-018 — Embedded PostgreSQL for local development without Docker

- **Context:** Docker is not installed, so local Supabase cannot run.
- **Decision:** `npm run db:local` runs real PostgreSQL binaries via `embedded-postgres`, bound to
  localhost, with data in `.local/postgres` (gitignored).
- **Consequences:** It is plain PostgreSQL — no Auth, Storage, Realtime or PostgREST. Supabase-dependent
  features must be developed against a Supabase project (or local Supabase once Docker is installed).

### ADR-019 — ESLint 9 (not 10)

- **Context:** `eslint-plugin-jsx-a11y` (accessibility linting) does not yet declare support for ESLint 10.
- **Decision:** Stay on ESLint 9 with the flat config; upgrade when the plugin supports 10. No `--force` installs.

### ADR-020 — Built-in authentication in the API (supersedes the auth parts of ADR-002/004/005)

- **Context:** Phase 3 required real, testable authentication, but there is no Supabase project and no
  Docker on the development machine. Decided with the project owner on 2026-10-03.
- **Decision:** The Express API owns authentication: Argon2id password hashes in `users`, opaque
  server-side sessions in `sessions` (hashed token, httpOnly cookie), and `requireAuth` /
  `requireRole` middleware. The schema is plain PostgreSQL and runs unchanged on Supabase's database.
- **Consequences:**
  - Email verification, password reset and MFA must be built by us (they need an email provider).
  - Row Level Security will read the caller from a per-transaction setting (`app.user_id`) instead
    of `auth.uid()`; the API must connect as a non-owner role for RLS to apply.
  - Supabase remains an option for Postgres, Storage and Realtime; Realtime/Storage authorisation
    will need signed tokens issued by the API rather than Supabase sessions.

### ADR-021 — Versioned SQL migrations run by the API

- **Decision:** `apps/api/migrations/NNNN_name.sql`, applied by `npm run db:migrate` inside one
  transaction under an advisory lock, recorded with checksums in `schema_migrations`. Applied
  migrations are immutable (edits are detected and refused).
- **Consequences:** No Supabase CLI dependency. Tests start a throwaway PostgreSQL
  (`embedded-postgres`) and apply the same migrations, so schema and tests can never drift.

### ADR-022 — Role areas in the web app

- **Decision:** Each role has its own route area — `/patient`, `/doctor`, `/family` (caregiver) and
  `/admin` — inside one shared dashboard shell whose navigation comes from the signed-in role.
  `/dashboard` redirects to the role home.
- **Consequences:** Route guards are UX only; every API route enforces authentication and role
  independently.
