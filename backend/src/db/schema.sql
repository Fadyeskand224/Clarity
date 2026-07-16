-- Clarity: schema for the persistent data pipeline described in BRD Section 6.
-- All tables key off user_id so every module (assessment, meds, journal, PDF export)
-- reads/writes the same connected dataset rather than siloed demo state.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FR: user profile / onboarding (quit date, reason, prior spend) feeds the
-- streak + savings calculations used across Home, Progress and the PDF export.
CREATE TABLE IF NOT EXISTS profiles (
  user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  quit_date           DATE NOT NULL,
  reasons             TEXT[] NOT NULL DEFAULT '{}',
  cigarettes_per_day  NUMERIC NOT NULL DEFAULT 0,
  cigarettes_per_pack NUMERIC NOT NULL DEFAULT 20,
  cost_per_pack       NUMERIC NOT NULL DEFAULT 0,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Relapses are logged as dated data points (time, trigger, mood) rather than a
-- silent streak reset, per BRD Section 6. The most recent event (if any) after
-- quit_date determines the current streak start.
CREATE TABLE IF NOT EXISTS smoking_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  trigger     TEXT,
  mood        TEXT,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fagerstrom_results (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers          JSONB NOT NULL,
  score            INTEGER NOT NULL,
  dependence_level TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medication_regimens (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  medication_type TEXT NOT NULL,
  medication_name TEXT NOT NULL,
  dose_schedule   TEXT NOT NULL,
  reminders_enabled BOOLEAN NOT NULL DEFAULT false,
  active          BOOLEAN NOT NULL DEFAULT true,
  started_at      DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medication_adherence (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  regimen_id  UUID NOT NULL REFERENCES medication_regimens(id) ON DELETE CASCADE,
  log_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  taken       BOOLEAN NOT NULL DEFAULT true,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (regimen_id, log_date)
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trigger     TEXT,
  mood        TEXT,
  note        TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS breathing_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_type      TEXT NOT NULL,
  duration_seconds  INTEGER NOT NULL,
  pre_urge_rating   INTEGER,
  post_urge_rating  INTEGER,
  completed_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_smoking_events_user ON smoking_events(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_fagerstrom_user ON fagerstrom_results(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meds_user ON medication_regimens(user_id);
CREATE INDEX IF NOT EXISTS idx_adherence_user ON medication_adherence(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_user ON journal_entries(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_breathing_user ON breathing_sessions(user_id, completed_at DESC);
