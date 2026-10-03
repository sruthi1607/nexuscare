# Nexus Care — Technical Blueprint

Nexus Care is an AI-assisted telemedicine and healthcare-management platform focused on improving
access to care for rural and underserved communities.

> **Status:** Phase 3 (authentication and role-based access) complete. See the repository [README](../README.md) for setup.
>
> **Clinical disclaimer:** Nexus Care is a software prototype. It is **not** a clinically validated
> medical device. No module diagnoses disease. AI and ML outputs are framed as _information_,
> _physiological anomaly detection_ and _risk indication_ only, and always defer to a qualified
> clinician.

## Documents

| #   | Document                                                   | Covers                                                                  |
| --- | ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| 01  | [Product requirements](01-product-requirements.md)         | Vision, scope, roles, modules, requirements, user journeys, sitemap     |
| 02  | [System architecture](02-system-architecture.md)           | System overview, frontend, backend, folder structure, deployment        |
| 03  | [Database design](03-database-design.md)                   | Entities, ERD, relationships, constraints, RLS approach                 |
| 04  | [API specification](04-api-specification.md)               | REST conventions and the full route catalogue                           |
| 05  | [Authentication & RBAC](05-auth-and-rbac.md)               | Auth flows, roles, permission matrix, family consent, doctor access     |
| 06  | [AI, RAG & MedTranslator](06-ai-rag-medtranslator.md)      | LLM gateway, RAG pipeline, document explanation, AI safety              |
| 07  | [IoT & ML](07-iot-and-ml.md)                               | Device ingestion, simulator, anomaly detection, risk estimation, alerts |
| 08  | [Notifications & storage](08-notifications-and-storage.md) | Notification pipeline, channels, file storage, signed URLs              |
| 09  | [Security](09-security.md)                                 | Threat model, controls, privacy, compliance considerations              |
| 10  | [Testing strategy](10-testing-strategy.md)                 | Test pyramid, tooling, per-phase quality gate, AI/ML evaluation         |
| 11  | [Roadmap & dependencies](11-roadmap-and-dependencies.md)   | Feature dependency map, phase plan, risks                               |
| 12  | [Architecture decisions](12-architecture-decisions.md)     | Decision records (ADRs) with rationale                                  |

## Engineering ground rules (summary)

1. Work strictly phase by phase; a phase is done only when it type-checks, lints, passes tests and builds.
2. Never break working functionality; never duplicate components, routes, services or schemas.
3. Secrets live in environment variables only; the frontend never holds privileged keys.
4. Every feature is wired to auth, database, API, permissions and notifications — no disconnected demo pages.
5. External integrations sit behind adapters; unavailable ones get an explicit, clearly labelled mock.
6. Demo/seed data is always flagged as demo data and never used in production flows.
