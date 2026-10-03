-- 0002 — Profiles, patient medical profile and doctor professional profile (Phase 4)

-- ---------------------------------------------------------------------------------------------
-- Shared profile: demographics and address apply to every role, so they move from `patients`
-- to `profiles`. (patients.date_of_birth / sex were never populated before this migration.)
-- ---------------------------------------------------------------------------------------------
create type sex_type as enum ('female', 'male', 'other', 'prefer_not_to_say');

alter table profiles
  add column date_of_birth      date check (date_of_birth >= date '1900-01-01'),
  add column sex                sex_type,
  add column address_line1      text check (char_length(address_line1) <= 200),
  add column address_line2      text check (char_length(address_line2) <= 200),
  add column city               text check (char_length(city) <= 100),
  add column region             text check (char_length(region) <= 100),
  add column postal_code        text check (char_length(postal_code) <= 20),
  add column country            text check (char_length(country) <= 100),
  add column avatar_updated_at  timestamptz,
  add constraint profiles_phone_length check (char_length(phone) <= 25),
  add constraint profiles_language_length check (char_length(preferred_language) <= 8);

alter table patients
  drop column date_of_birth,
  drop column sex,
  add column height_cm numeric(4, 1) check (height_cm between 30 and 250),
  add column weight_kg numeric(4, 1) check (weight_kg between 1 and 400),
  add column emergency_contact_relationship text,
  add column medical_profile_updated_at timestamptz,
  add constraint patients_blood_group_check
    check (blood_group in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'));

-- Avatars are stored re-encoded (WebP, metadata stripped). Kept out of `profiles` so profile
-- queries never load image bytes. Swappable for object storage later (see AvatarStore).
create table user_avatars (
  user_id     uuid primary key references users (id) on delete cascade,
  mime_type   text not null check (mime_type in ('image/webp')),
  data        bytea not null,
  byte_size   integer not null check (byte_size > 0 and byte_size <= 1048576),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------------------------
-- Patient medical profile (patient-reported; never interpreted by the platform)
-- ---------------------------------------------------------------------------------------------
create type allergy_severity as enum ('mild', 'moderate', 'severe', 'unknown');
create type condition_status as enum ('active', 'managed', 'resolved');
create type history_kind as enum ('surgery', 'hospitalization', 'past_condition', 'injury', 'other');
create type medication_source as enum ('self_reported', 'prescribed');
create type medication_status as enum ('active', 'paused', 'stopped', 'completed');

create table patient_allergies (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid not null references patients (user_id) on delete cascade,
  substance   text not null check (char_length(substance) between 1 and 120),
  reaction    text check (char_length(reaction) <= 200),
  severity    allergy_severity not null default 'unknown',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index patient_allergies_patient_idx on patient_allergies (patient_id);
create trigger patient_allergies_set_updated_at before update on patient_allergies
  for each row execute function set_updated_at();

create table patient_conditions (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid not null references patients (user_id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 120),
  status      condition_status not null default 'active',
  since_year  smallint check (since_year between 1900 and 2100),
  notes       text check (char_length(notes) <= 300),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index patient_conditions_patient_idx on patient_conditions (patient_id);
create trigger patient_conditions_set_updated_at before update on patient_conditions
  for each row execute function set_updated_at();

create table patient_medical_history (
  id           uuid primary key default gen_random_uuid(),
  patient_id   uuid not null references patients (user_id) on delete cascade,
  kind         history_kind not null,
  description  text not null check (char_length(description) between 1 and 200),
  year         smallint check (year between 1900 and 2100),
  notes        text check (char_length(notes) <= 300),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index patient_medical_history_patient_idx on patient_medical_history (patient_id);
create trigger patient_medical_history_set_updated_at before update on patient_medical_history
  for each row execute function set_updated_at();

-- The patient's medication list. Shared with the prescriptions and reminders modules later:
-- prescribed rows will carry prescription_item_id; self-reported rows are edited by the patient.
create table medications (
  id                    uuid primary key default gen_random_uuid(),
  patient_id            uuid not null references patients (user_id) on delete cascade,
  name                  text not null check (char_length(name) between 1 and 120),
  dose                  text check (char_length(dose) <= 60),
  frequency             text check (char_length(frequency) <= 80),
  notes                 text check (char_length(notes) <= 300),
  started_on            date,
  source                medication_source not null default 'self_reported',
  status                medication_status not null default 'active',
  prescription_item_id  uuid,
  created_by            uuid references users (id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index medications_patient_idx on medications (patient_id, status);
create trigger medications_set_updated_at before update on medications
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------------------------
-- Doctor professional profile
-- ---------------------------------------------------------------------------------------------
create type consultation_mode as enum ('video', 'audio', 'in_person');

alter table doctors
  add column years_experience     smallint check (years_experience between 0 and 70),
  add column bio                  text check (char_length(bio) <= 2000),
  add column languages            text[] not null default '{}',
  add column consultation_modes   consultation_mode[] not null default '{}',
  add column consultation_fee     numeric(10, 2) check (consultation_fee between 0 and 100000),
  add column fee_currency         char(3),
  add column clinic_name          text check (char_length(clinic_name) <= 160),
  add column clinic_address       text check (char_length(clinic_address) <= 300),
  add column clinic_city          text check (char_length(clinic_city) <= 100),
  add column accepts_new_patients boolean not null default true,
  add column slot_minutes         smallint not null default 20
    check (slot_minutes in (10, 15, 20, 30, 45, 60)),
  add column profile_updated_at   timestamptz;

create index doctors_languages_idx on doctors using gin (languages);

-- Reference data (real medical specialties, not demo content).
create table specialties (
  id    uuid primary key default gen_random_uuid(),
  name  text not null unique,
  slug  text not null unique
);
insert into specialties (name, slug) values
  ('General Medicine', 'general-medicine'),
  ('Family Medicine', 'family-medicine'),
  ('Internal Medicine', 'internal-medicine'),
  ('Paediatrics', 'paediatrics'),
  ('Obstetrics & Gynaecology', 'obstetrics-gynaecology'),
  ('Cardiology', 'cardiology'),
  ('Dermatology', 'dermatology'),
  ('Endocrinology', 'endocrinology'),
  ('ENT (Otorhinolaryngology)', 'ent'),
  ('Gastroenterology', 'gastroenterology'),
  ('General Surgery', 'general-surgery'),
  ('Nephrology', 'nephrology'),
  ('Neurology', 'neurology'),
  ('Oncology', 'oncology'),
  ('Ophthalmology', 'ophthalmology'),
  ('Orthopaedics', 'orthopaedics'),
  ('Psychiatry', 'psychiatry'),
  ('Pulmonology', 'pulmonology'),
  ('Rheumatology', 'rheumatology'),
  ('Urology', 'urology'),
  ('Dentistry', 'dentistry'),
  ('Geriatrics', 'geriatrics');

create table doctor_specialties (
  doctor_id     uuid not null references doctors (user_id) on delete cascade,
  specialty_id  uuid not null references specialties (id) on delete restrict,
  primary key (doctor_id, specialty_id)
);
create index doctor_specialties_specialty_idx on doctor_specialties (specialty_id);

create table doctor_qualifications (
  id           uuid primary key default gen_random_uuid(),
  doctor_id    uuid not null references doctors (user_id) on delete cascade,
  degree       text not null check (char_length(degree) between 1 and 120),
  institution  text not null check (char_length(institution) between 1 and 160),
  year         smallint check (year between 1900 and 2100),
  created_at   timestamptz not null default now()
);
create index doctor_qualifications_doctor_idx on doctor_qualifications (doctor_id);

-- Weekly recurring availability in the doctor's own time zone (profiles.timezone). Bookable slots
-- are computed from these rules by the appointments module.
create table doctor_availability_rules (
  id          uuid primary key default gen_random_uuid(),
  doctor_id   uuid not null references doctors (user_id) on delete cascade,
  weekday     smallint not null check (weekday between 0 and 6),
  start_time  time not null,
  end_time    time not null,
  created_at  timestamptz not null default now(),
  constraint availability_range_valid check (end_time > start_time)
);
create index doctor_availability_doctor_idx on doctor_availability_rules (doctor_id, weekday);
