# 10 — Testing Strategy

## 1. Test pyramid

| Layer           | Tooling                                                                                            | What it covers                                                                                                           |
| --------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Static          | `tsc --noEmit` (strict), ESLint (typescript-eslint, react-hooks, jsx-a11y, import rules), Prettier | Types, unsafe patterns, accessibility lint, forbidden imports (service-role client)                                      |
| Unit            | Vitest                                                                                             | Shared schemas, slot generation, state transitions (appointments, orders, alerts), policies, threshold rules, formatters |
| Component       | Vitest + React Testing Library + MSW                                                               | Forms, validation messages, loading/empty/error states, guards                                                           |
| API integration | Vitest + Supertest against a test Supabase database                                                | Routes end-to-end: auth, validation, permissions (allowed **and** forbidden), envelopes                                  |
| Database / RLS  | pgTAP (`supabase test db`)                                                                         | Every policy: owner, doctor with/without care relationship, caregiver with/without scope, admin, anonymous               |
| ML              | pytest                                                                                             | Feature extraction, API contracts, model loading, deterministic scoring on fixtures, model-card presence                 |
| AI evaluation   | Scripted eval suite (see 06 §5)                                                                    | Emergency routing, refusals, grounding/citations, injection, MedTranslator fidelity                                      |
| E2E             | Playwright (+ axe-core)                                                                            | Critical journeys J1–J10 on desktop and mobile viewports; accessibility scan per page                                    |
| Load (later)    | k6                                                                                                 | Booking contention, ingest throughput                                                                                    |

## 2. Test data

- Factories create users/entities per test via the service role in an isolated test project/schema.
- Seed data (`supabase/seed`) is demo-only and flagged `is_demo`; tests never rely on production data.
- Synthetic medical documents for MedTranslator; simulator scenarios for IoT.

## 3. Environments for database tests

**Plain PostgreSQL (available now):** `npm run db:local` starts a real PostgreSQL server without
Docker (ADR-018). Setting `TEST_DATABASE_URL` to the URL it prints enables the API's database
integration tests (`apps/api/test/*.int.test.ts`); without it they are skipped.

Local **Supabase** (Auth, Storage, RLS testing with `supabase test db`) requires Docker, which is
**not currently installed**. Options:

1. **Install Docker Desktop** and use `supabase start` for fully local, disposable databases (recommended).
2. Use a dedicated **`nexuscare-test` Supabase project** for integration and RLS tests (never the dev/prod project).

## 4. Quality gate for every phase

A phase is complete only when all of the following pass:

1. `npm run typecheck` — zero errors.
2. `npm run lint` — zero errors.
3. `npm test` — all unit/component/integration tests pass; new code has tests for success **and** forbidden/invalid paths.
4. RLS tests for any new/changed table pass.
5. `npm run build` — web and api build successfully (and ML image tests when touched).
6. Manual smoke test of the phase's journeys + regression check of previous phases' journeys.
7. Completion report: implemented, files created/modified, DB changes, API changes, tests, limitations, manual test steps.

## 5. CI

`.github/workflows/ci.yml`: install (cached) → typecheck → lint → unit/component tests → build →
integration + RLS tests (against the test database) → Playwright smoke (on main/PRs touching web).
