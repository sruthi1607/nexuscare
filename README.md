# Nexus Care

AI-assisted telemedicine and healthcare-management platform for rural and underserved communities.

> **Prototype — not a medical device.** Nexus Care does not diagnose any condition. See
> [docs/](docs/README.md) for the full product and technical blueprint.

**Current phase:** 3 — authentication and role-based access (on top of the Phase 1 foundation and
Phase 2 UI system).

## Repository layout

```
apps/web          React + Vite + TypeScript + Tailwind CSS + React Router
apps/api          Express + TypeScript REST API (+ migrations/ and CLI scripts)
packages/shared   Zod schemas and types shared by web and API
scripts/          Developer tooling (local PostgreSQL)
docs/             Product requirements, architecture, ADRs
```

## Prerequisites

- Node.js ≥ 22.12 (developed on Node 24)
- A PostgreSQL database: a Supabase project **or** the built-in local server (`npm run db:local`)

## Getting started

```bash
npm install

# 1. Database — either start the local PostgreSQL server (keeps running; use a separate terminal) ...
npm run db:local
# ... or use your Supabase connection string in step 2.

# 2. Configure the API
cp apps/api/.env.example apps/api/.env      # then edit DATABASE_URL / DATABASE_SSL_MODE

# 3. Create the database tables
npm run db:migrate

# 4. (Optional) create an administrator — admins cannot sign up through the website
NEXUSCARE_ADMIN_PASSWORD='choose-a-strong-pass1' npm run admin:create -- --email admin@example.org --name "Platform Admin"

# 5. Run web + API with hot reload
npm run dev
```

- Web app: http://localhost:5173 (the dev server proxies `/api` to the API)
- Sign up at http://localhost:5173/register as a patient, family member or doctor; you are taken to
  `/patient`, `/family` or `/doctor`. Admins log in at `/login` and land on `/admin`.
- API health: http://localhost:4000/api/health · System status page: http://localhost:5173/status

### Using Supabase

In Supabase: **Project Settings → Database → Connection string** (pooler URI). Set it as
`DATABASE_URL` in `apps/api/.env`, and set `DATABASE_SSL_MODE=verify-full` with
`DATABASE_SSL_CA_FILE` pointing at the CA certificate downloaded from the same settings page
(or `DATABASE_SSL_MODE=require` to encrypt without certificate verification). Then run
`npm run db:migrate`. Authentication is built into the API (ADR-020), so Supabase Auth is not used.

## Scripts

| Command                | Purpose                                                           |
| ---------------------- | ----------------------------------------------------------------- |
| `npm run dev`          | Shared package watch + API (tsx watch) + web (Vite)               |
| `npm run db:local`     | Local PostgreSQL on port 54329 (data in `.local/postgres`)        |
| `npm run db:migrate`   | Apply pending SQL migrations from `apps/api/migrations`           |
| `npm run admin:create` | Provision an admin account (`-- --email … --name …`)              |
| `npm run typecheck`    | TypeScript across all workspaces                                  |
| `npm run lint`         | ESLint (type-aware, React hooks, accessibility), zero warnings    |
| `npm run format`       | Prettier write (`format:check` to verify)                         |
| `npm test`             | Vitest across all workspaces (starts a throwaway test PostgreSQL) |
| `npm run build`        | Production build: shared → API → web                              |
| `npm run check`        | Everything above in sequence (the phase quality gate)             |

API integration tests need no setup: they start a temporary PostgreSQL server, apply the
migrations and delete it afterwards. To use your own test database instead, set
`TEST_DATABASE_URL` (it will be migrated — never point it at real data).

## Environment variables

See [apps/api/.env.example](apps/api/.env.example) and [apps/web/.env.example](apps/web/.env.example).
Never commit `.env` files; only `VITE_`-prefixed values reach the browser and they must never be secret.
For local HTTP development set `SESSION_COOKIE_SECURE=false`; production must keep the default (`true`).
