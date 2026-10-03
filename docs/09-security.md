# 09 — Security Architecture

Healthcare data is sensitive by default. Security is a cross-cutting requirement in every phase.

## 1. Threat model (summary)

| Threat                 | Example                                             | Primary controls                                                                                            |
| ---------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Broken access control  | Patient A reads patient B's records via ID guessing | API policies + RLS on every table; UUIDs; 404 for unauthorised resources; RLS test suite                    |
| Over-sharing to family | Caregiver sees more than granted                    | Default-deny scopes; patient-only grants; RLS scope checks; audit                                           |
| Account takeover       | Credential stuffing                                 | Supabase auth rate limits, breached-password check, MFA (required for admin)                                |
| Privilege escalation   | User sets own role to admin                         | Role assigned by trigger (admin excluded); `role`/`status` columns not writable by users                    |
| Secret leakage         | Service key in frontend bundle                      | Only `VITE_` public vars in web; CI secret scanning; service key server-only                                |
| Injection              | SQL / XSS                                           | Parameterised queries via Supabase client/RPC; React escaping; markdown rendered with sanitiser; strict CSP |
| Malicious uploads      | Polyglot or oversized files                         | Type/magic-byte checks, size caps, private buckets, signed URLs, later AV scan                              |
| Prompt injection       | Instructions inside documents/KB                    | Content treated as data; no state-changing tools; output post-checks                                        |
| Device spoofing        | Fake vitals for another patient                     | Per-device hashed keys bound to one patient; plausibility checks; rate limits; revocation                   |
| Abuse / DoS            | Flooding AI or ingest endpoints                     | Per-user/IP/device rate limits, quotas, payload limits                                                      |
| PHI in logs            | Lab values in error logs                            | pino redaction, no request bodies logged on clinical routes, IDs only                                       |
| Insider misuse         | Admin browsing records                              | No admin read access to clinical content; audit logs                                                        |

## 2. Controls

### Application

- Zod validation on every input (body, params, query) on both client and server.
- helmet (CSP, HSTS, frame-ancestors none, no-sniff), strict CORS allowlist, JSON body limit (1 MB).
- Rate limiting buckets: global, auth-sensitive, AI, uploads, IoT ingest.
- Consistent error envelope; stack traces never returned outside development.
- Idempotency keys on booking, orders, ingest, SOS.
- Dependency hygiene: `npm audit` in CI, Dependabot/Renovate, lockfiles committed, `pip-audit` for ML.

### Data

- TLS everywhere; encryption at rest provided by Supabase.
- RLS enabled on all tables; `SECURITY DEFINER` functions pin `search_path` and are reviewed.
- Service-role usage limited to named system modules (lint-enforced) and always audit-logged when touching PHI.
- Minimal data in JWT claims (role, status only).
- Audit logs for sensitive reads (records, downloads, caregiver views) and all admin actions.
- Backups and point-in-time recovery for production.

### Secrets & configuration

- `.env` files gitignored; `.env.example` documents variables without values.
- Separate Supabase projects and keys per environment; key rotation documented.
- Device keys and invite tokens stored only as hashes.

### Frontend

- No secrets; anon key only (safe by design with RLS).
- Session tokens managed by Supabase JS; logout clears query cache.
- Sensitive views avoid caching in shared devices (no persistent query cache for clinical data).

## 3. Privacy by design

- Consent capture: terms/privacy acceptance at sign-up; separate explicit consents for AI personal
  context and family scopes.
- Data minimisation in notifications, logs, AI context and analytics (aggregates only).
- User rights: data export (later phase) and account deletion request workflow.
- Retention policy (see 03 §8) enforced by scheduled jobs.

## 4. Compliance considerations

Nexus Care is a prototype. Before handling real patient data, assess the regulations of the target
jurisdiction — for example HIPAA (US), the DPDP Act and telemedicine practice guidelines (India) or
GDPR (EU) — including data-processing agreements/BAAs with Supabase, the LLM provider, the video
provider and messaging providers, data residency, and medical-device software classification for the
monitoring/risk features.

## 5. Security checkpoints per phase

1. New table → RLS enabled + policies + pgTAP tests in the same migration PR.
2. New endpoint → auth/role middleware + resource policy + validation + rate limit category + tests for forbidden access.
3. New integration → adapter, secrets via env, timeout and retry policy, mock for tests.
4. Phase completion → run the `/security-review` checklist on the diff.
