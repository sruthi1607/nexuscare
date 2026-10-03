-- 0001 — Identity, profiles, sessions and audit log (Phase 3: authentication)
--
-- Authentication is implemented by the API (ADR-020). Credentials live in `users`; application
-- profile data in `profiles`; role-specific data in `patients` / `doctors`. Caregivers ("family")
-- have no extension table — their relationships arrive with the family module.

create extension if not exists citext;

create type app_role as enum ('patient', 'doctor', 'caregiver', 'admin');
create type account_status as enum ('active', 'suspended', 'deactivated');
create type doctor_verification as enum ('pending', 'verified', 'rejected', 'suspended');

-- Keeps updated_at current on every UPDATE.
create function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table users (
  id                   uuid primary key default gen_random_uuid(),
  email                citext not null unique,
  password_hash        text not null,
  role                 app_role not null,
  status               account_status not null default 'active',
  email_verified_at    timestamptz,
  failed_login_count   integer not null default 0 check (failed_login_count >= 0),
  locked_until         timestamptz,
  last_login_at        timestamptz,
  password_changed_at  timestamptz not null default now(),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint users_email_length check (char_length(email) between 3 and 254)
);
create index users_role_idx on users (role);
create trigger users_set_updated_at before update on users
  for each row execute function set_updated_at();

create table profiles (
  user_id                  uuid primary key references users (id) on delete cascade,
  full_name                text not null check (char_length(full_name) between 2 and 120),
  phone                    text,
  preferred_language       text not null default 'en',
  timezone                 text not null default 'UTC',
  onboarding_completed_at  timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create trigger profiles_set_updated_at before update on profiles
  for each row execute function set_updated_at();

-- Medical profile fields are completed during onboarding (later phase); all nullable for now.
create table patients (
  user_id                  uuid primary key references users (id) on delete cascade,
  date_of_birth            date,
  sex                      text,
  blood_group              text,
  emergency_contact_name   text,
  emergency_contact_phone  text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create trigger patients_set_updated_at before update on patients
  for each row execute function set_updated_at();

create table doctors (
  user_id               uuid primary key references users (id) on delete cascade,
  registration_number   text,
  registration_council  text,
  verification_status   doctor_verification not null default 'pending',
  verification_note     text,
  verified_by           uuid references users (id),
  verified_at           timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index doctors_verification_idx on doctors (verification_status);
create trigger doctors_set_updated_at before update on doctors
  for each row execute function set_updated_at();

-- Server-side sessions. Only a SHA-256 hash of the random session token is stored, so a database
-- leak does not expose usable session cookies.
create table sessions (
  id            uuid primary key default gen_random_uuid(),
  token_hash    bytea not null unique,
  user_id       uuid not null references users (id) on delete cascade,
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  expires_at    timestamptz not null,
  revoked_at    timestamptz,
  ip_address    inet,
  user_agent    text
);
create index sessions_user_idx on sessions (user_id) where revoked_at is null;
create index sessions_expires_idx on sessions (expires_at);

-- Append-only security/audit trail. Metadata must never contain passwords, tokens or health data.
create table audit_logs (
  id           bigint generated always as identity primary key,
  actor_id     uuid references users (id) on delete set null,
  action       text not null,
  entity_type  text,
  entity_id    text,
  ip_address   inet,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);
create index audit_logs_actor_idx on audit_logs (actor_id, created_at desc);
create index audit_logs_action_idx on audit_logs (action, created_at desc);
