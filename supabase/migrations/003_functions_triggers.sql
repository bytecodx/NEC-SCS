-- ==============================================================================
-- CAMPUSCRED — FUNCTIONS & TRIGGERS (MIGRATION 003)
-- Verified Achievements. Trusted Records.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. STATUS TRANSITION VALIDATION
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION validate_certificate_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is not changing, allow update
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Allowed transitions:
  -- DRAFT -> SUBMITTED
  -- SUBMITTED -> UNDER_REVIEW
  -- UNDER_REVIEW -> APPROVED, CORRECTION_REQUIRED, REJECTED, SUBMITTED (reclaimed/timeout/reverted)
  -- CORRECTION_REQUIRED -> SUBMITTED
  IF (OLD.status = 'DRAFT' AND NEW.status = 'SUBMITTED') OR
     (OLD.status = 'SUBMITTED' AND NEW.status = 'UNDER_REVIEW') OR
     (OLD.status = 'UNDER_REVIEW' AND NEW.status IN ('APPROVED', 'CORRECTION_REQUIRED', 'REJECTED', 'SUBMITTED')) OR
     (OLD.status = 'CORRECTION_REQUIRED' AND NEW.status = 'SUBMITTED') THEN
    
    -- Stamp timestamps
    IF NEW.status = 'SUBMITTED' AND OLD.status = 'DRAFT' THEN
      NEW.submitted_at := now();
    END IF;

    IF NEW.status = 'UNDER_REVIEW' AND OLD.status = 'SUBMITTED' THEN
      NEW.review_started_at := now();
    END IF;

    NEW.updated_at := now();
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Invalid certificate status transition from % to %', OLD.status, NEW.status;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_certificate_status ON certificates;
CREATE TRIGGER trg_validate_certificate_status
  BEFORE UPDATE ON certificates
  FOR EACH ROW
  EXECUTE FUNCTION validate_certificate_status_transition();

-- ------------------------------------------------------------------------------
-- 2. AUTO-RESET UNDER_REVIEW CERTIFICATES WHEN FACULTY IS DISABLED
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_faculty_disabled()
RETURNS TRIGGER AS $$
DECLARE
  v_faculty_id UUID;
  v_college_id UUID;
  r RECORD;
BEGIN
  -- Check if profile was active and is now disabled
  IF OLD.is_active = true AND NEW.is_active = false THEN
    -- Find if this profile belongs to a faculty member
    SELECT id, college_id INTO v_faculty_id, v_college_id FROM faculty WHERE profile_id = NEW.id;
    
    IF v_faculty_id IS NOT NULL THEN
      -- Revert any UNDER_REVIEW certificates claimed by this faculty back to SUBMITTED
      FOR r IN 
        SELECT id FROM certificates 
        WHERE reviewer_id = v_faculty_id AND status = 'UNDER_REVIEW'
      LOOP
        UPDATE certificates
        SET status = 'SUBMITTED',
            reviewer_id = NULL,
            review_started_at = NULL,
            updated_at = now()
        WHERE id = r.id;

        -- Create audit log entry
        INSERT INTO audit_logs (
          college_id,
          actor_id,
          action,
          entity_type,
          entity_id,
          metadata
        ) VALUES (
          v_college_id,
          NEW.id,
          'USER_DISABLED',
          'CERTIFICATE',
          r.id,
          jsonb_build_object(
            'message', 'Faculty member disabled; certificate review lock released back to SUBMITTED',
            'faculty_id', v_faculty_id
          )
        );
      END LOOP;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_faculty_disabled ON profiles;
CREATE TRIGGER trg_faculty_disabled
  AFTER UPDATE OF is_active ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_faculty_disabled();

-- ------------------------------------------------------------------------------
-- 3. UNIQUE ACHIEVEMENT ID GENERATOR
-- Format: ACH-YYYY-DEPT-XXXXXX (e.g. ACH-2026-CS-000128)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION generate_achievement_id()
RETURNS TRIGGER AS $$
DECLARE
  v_dept_code TEXT;
  v_year TEXT;
  v_seq INT;
BEGIN
  -- Only generate achievement_id when certificate transitions to APPROVED and doesn't have one yet
  IF NEW.status = 'APPROVED' AND (OLD.status IS DISTINCT FROM 'APPROVED' OR NEW.achievement_id IS NULL) THEN
    -- Get department code
    SELECT d.code INTO v_dept_code
    FROM students s
    JOIN departments d ON s.department_id = d.id
    WHERE s.id = NEW.student_id;

    IF v_dept_code IS NULL THEN
      v_dept_code := 'GEN';
    END IF;

    v_year := to_char(COALESCE(NEW.event_date, CURRENT_DATE), 'YYYY');

    -- Calculate next sequence number for this department and year
    SELECT COALESCE(COUNT(*), 0) + 1 INTO v_seq
    FROM certificates
    WHERE status = 'APPROVED'
      AND achievement_id LIKE 'ACH-' || v_year || '-' || v_dept_code || '-%';

    NEW.achievement_id := 'ACH-' || v_year || '-' || UPPER(v_dept_code) || '-' || LPAD(v_seq::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_achievement_id ON certificates;
CREATE TRIGGER trg_generate_achievement_id
  BEFORE UPDATE ON certificates
  FOR EACH ROW
  EXECUTE FUNCTION generate_achievement_id();
