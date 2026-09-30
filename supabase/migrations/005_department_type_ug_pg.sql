-- ==============================================================================
-- CAMPUSCRED — DATABASE MIGRATION 005: SEPARATE UG AND PG DEPARTMENTS
-- Distinguish Undergraduate (UG) and Postgraduate (PG) programmes
-- ==============================================================================

DO $$ BEGIN
  CREATE TYPE department_type AS ENUM ('UG', 'PG');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 1. Add 'type' column to departments table
ALTER TABLE departments
ADD COLUMN IF NOT EXISTS type department_type NOT NULL DEFAULT 'UG';

-- 2. Create index for fast filtering by department type
CREATE INDEX IF NOT EXISTS idx_departments_type ON departments(college_id, type);

-- 3. Insert default Postgraduate (PG) departments for Nandha Engineering College (NEC)
-- assuming college code 'NEC' exists
DO $$
DECLARE
  nec_college_id UUID;
BEGIN
  SELECT id INTO nec_college_id FROM colleges WHERE code = 'NEC' LIMIT 1;
  
  IF nec_college_id IS NOT NULL THEN
    -- M.E. CSE
    INSERT INTO departments (id, college_id, name, code, type, is_active)
    VALUES (
      gen_random_uuid(),
      nec_college_id,
      'M.E. Computer Science and Engineering',
      'ME-CSE',
      'PG',
      true
    )
    ON CONFLICT (college_id, code) DO UPDATE SET type = 'PG';

    -- M.E. VLSI
    INSERT INTO departments (id, college_id, name, code, type, is_active)
    VALUES (
      gen_random_uuid(),
      nec_college_id,
      'M.E. VLSI Design',
      'ME-VLSI',
      'PG',
      true
    )
    ON CONFLICT (college_id, code) DO UPDATE SET type = 'PG';

    -- MBA
    INSERT INTO departments (id, college_id, name, code, type, is_active)
    VALUES (
      gen_random_uuid(),
      nec_college_id,
      'Master of Business Administration',
      'MBA',
      'PG',
      true
    )
    ON CONFLICT (college_id, code) DO UPDATE SET type = 'PG';

    -- MCA
    INSERT INTO departments (id, college_id, name, code, type, is_active)
    VALUES (
      gen_random_uuid(),
      nec_college_id,
      'Master of Computer Applications',
      'MCA',
      'PG',
      true
    )
    ON CONFLICT (college_id, code) DO UPDATE SET type = 'PG';
  END IF;
END $$;
