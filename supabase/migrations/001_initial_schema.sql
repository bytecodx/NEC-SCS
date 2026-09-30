-- ==============================================================================
-- CAMPUSCRED — DATABASE SCHEMA (MIGRATION 001)
-- Verified Achievements. Trusted Records.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('STUDENT', 'FACULTY', 'HOD', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE certificate_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'UNDER_REVIEW',
    'CORRECTION_REQUIRED',
    'APPROVED',
    'REJECTED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE event_level AS ENUM (
    'COLLEGE',
    'INTRA_COLLEGE',
    'INTER_COLLEGE',
    'DISTRICT',
    'STATE',
    'NATIONAL',
    'INTERNATIONAL',
    'OTHER'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE file_type AS ENUM ('PRIMARY', 'SUPPORTING');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE review_action AS ENUM (
    'CLAIMED',
    'CORRECTION_REQUESTED',
    'APPROVED',
    'REJECTED',
    'RECLAIMED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE audit_action AS ENUM (
    'LOGIN',
    'CERTIFICATE_CREATED',
    'CERTIFICATE_SUBMITTED',
    'CERTIFICATE_CLAIMED',
    'CERTIFICATE_RECLAIMED',
    'CERTIFICATE_APPROVED',
    'CORRECTION_REQUESTED',
    'CERTIFICATE_REJECTED',
    'POINTS_AWARDED',
    'POINTS_CORRECTED',
    'USER_CREATED',
    'USER_DISABLED',
    'CONFIGURATION_CHANGED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------------
-- 1. COLLEGES & TENANT SETTINGS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS college_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE UNIQUE,
  max_points_per_certificate INTEGER NOT NULL DEFAULT 100 CHECK (max_points_per_certificate > 0),
  reviewer_reclaim_timeout_minutes INTEGER NOT NULL DEFAULT 30 CHECK (reviewer_reclaim_timeout_minutes >= 5),
  max_file_size_mb INTEGER NOT NULL DEFAULT 10 CHECK (max_file_size_mb > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. DEPARTMENTS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(college_id, code)
);

-- ------------------------------------------------------------------------------
-- 3. PROFILES & ROLES
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE RESTRICT,
  role user_role NOT NULL DEFAULT 'STUDENT',
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE RESTRICT,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  register_number TEXT NOT NULL,
  academic_year INTEGER NOT NULL CHECK (academic_year >= 1 AND academic_year <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(college_id, register_number)
);

CREATE TABLE IF NOT EXISTS faculty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE RESTRICT,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  designation TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  is_hod BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(college_id, employee_id)
);

-- ------------------------------------------------------------------------------
-- 4. CATEGORIES & EVENTS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(college_id, name)
);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  organizer TEXT NOT NULL,
  event_level event_level NOT NULL DEFAULT 'COLLEGE',
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 5. CERTIFICATES & FILES
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE RESTRICT,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
  achievement_id TEXT UNIQUE,
  title TEXT NOT NULL,
  event_name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  event_level event_level NOT NULL DEFAULT 'COLLEGE',
  organizer TEXT NOT NULL,
  event_date DATE NOT NULL,
  achievement TEXT NOT NULL,
  description TEXT,
  status certificate_status NOT NULL DEFAULT 'DRAFT',
  reviewer_id UUID REFERENCES faculty(id) ON DELETE SET NULL,
  review_started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS certificate_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  file_type file_type NOT NULL DEFAULT 'PRIMARY',
  storage_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 6. REVIEWS & POINT RECORDS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS certificate_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES faculty(id) ON DELETE RESTRICT,
  action review_action NOT NULL,
  reason TEXT,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_reason_required CHECK (
    action NOT IN ('REJECTED', 'CORRECTION_REQUESTED') OR (reason IS NOT NULL AND length(trim(reason)) > 0)
  )
);

CREATE TABLE IF NOT EXISTS point_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
  certificate_id UUID NOT NULL REFERENCES certificates(id) ON DELETE RESTRICT,
  points INTEGER NOT NULL CHECK (points >= 0),
  awarded_by UUID NOT NULL REFERENCES faculty(id) ON DELETE RESTRICT,
  comment TEXT,
  is_latest BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 7. NOTIFICATIONS & AUDIT LOGS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE RESTRICT,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- INDEXES FOR PERFORMANCE
-- ------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_certificates_student ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_category ON certificates(category_id);
CREATE INDEX IF NOT EXISTS idx_certificates_reviewer ON certificates(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_certificates_college ON certificates(college_id);
CREATE INDEX IF NOT EXISTS idx_certificate_files_hash ON certificate_files(file_hash);
CREATE INDEX IF NOT EXISTS idx_certificate_files_cert ON certificate_files(certificate_id);
CREATE INDEX IF NOT EXISTS idx_point_records_student ON point_records(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_college_action ON audit_logs(college_id, action);
