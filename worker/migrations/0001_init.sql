-- Migration 0001_init.sql: Inbound enquiries and rate limiting (Audit Items 1 & 15, Task B-7)
-- NDPA 2023 compliance: Stores structured enquiry briefs, enforces uniqueness,
-- and indexes created_at for sliding-window rate checks and 90-day pruning.

CREATE TABLE enquiry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ref TEXT UNIQUE NOT NULL,
  client_request_id TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'handled', 'spam')),
  name TEXT NOT NULL,
  company TEXT,
  whatsapp_e164 TEXT,
  email TEXT,
  project_type TEXT NOT NULL CHECK (project_type IN ('festival', 'wedding_event', 'commercial', 'documentary', 'other')),
  event_date TEXT NOT NULL,
  event_end_date TEXT,
  date_flexible INTEGER NOT NULL DEFAULT 0 CHECK (date_flexible IN (0, 1)),
  short_notice INTEGER NOT NULL DEFAULT 0 CHECK (short_notice IN (0, 1)),
  venue TEXT,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  duration TEXT NOT NULL CHECK (duration IN ('half_day', 'full_day', 'multi_day', 'unsure')),
  deliverables TEXT NOT NULL,
  reference_url TEXT,
  notes TEXT,
  consent_at TEXT NOT NULL,
  source TEXT,
  CHECK (whatsapp_e164 IS NOT NULL OR email IS NOT NULL)
);

CREATE INDEX idx_enquiry_created_at ON enquiry (created_at);
CREATE INDEX idx_enquiry_rate_limit ON enquiry (whatsapp_e164, email, created_at);
