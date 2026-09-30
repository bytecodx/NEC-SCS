-- ==============================================================================
-- CAMPUSCRED — ROW LEVEL SECURITY POLICIES (MIGRATION 002)
-- Verified Achievements. Trusted Records.
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- HELPER FUNCTIONS FOR SECURITY CONTEXT
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_auth_profile()
RETURNS profiles AS $$
  SELECT * FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_auth_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_auth_college_id()
RETURNS UUID AS $$
  SELECT college_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_auth_student_id()
RETURNS UUID AS $$
  SELECT id FROM students WHERE profile_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_auth_faculty_department_id()
RETURNS UUID AS $$
  SELECT department_id FROM faculty WHERE profile_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 1. PROFILES POLICIES
-- ------------------------------------------------------------------------------

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Staff can view college profiles"
  ON profiles FOR SELECT
  USING (
    college_id = get_auth_college_id() AND
    get_auth_role() IN ('FACULTY', 'HOD', 'ADMIN')
  );

CREATE POLICY "Users can update own basic profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admin can manage all profiles in college"
  ON profiles FOR ALL
  USING (
    college_id = get_auth_college_id() AND
    get_auth_role() = 'ADMIN'
  );

-- ------------------------------------------------------------------------------
-- 2. COLLEGE & SETTINGS POLICIES
-- ------------------------------------------------------------------------------

CREATE POLICY "Users can view own college"
  ON colleges FOR SELECT
  USING (id = get_auth_college_id());

CREATE POLICY "Users can view college settings"
  ON college_settings FOR SELECT
  USING (college_id = get_auth_college_id());

CREATE POLICY "Admin can update college settings"
  ON college_settings FOR UPDATE
  USING (
    college_id = get_auth_college_id() AND
    get_auth_role() = 'ADMIN'
  );

-- ------------------------------------------------------------------------------
-- 3. DEPARTMENTS POLICIES
-- ------------------------------------------------------------------------------

CREATE POLICY "Users can view active departments in their college"
  ON departments FOR SELECT
  USING (college_id = get_auth_college_id());

CREATE POLICY "Admin can manage departments"
  ON departments FOR ALL
  USING (
    college_id = get_auth_college_id() AND
    get_auth_role() = 'ADMIN'
  );

-- ------------------------------------------------------------------------------
-- 4. STUDENTS POLICIES
-- ------------------------------------------------------------------------------

CREATE POLICY "Students can view own student record"
  ON students FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Faculty and HOD can view department students"
  ON students FOR SELECT
  USING (
    college_id = get_auth_college_id() AND
    (
      department_id = get_auth_faculty_department_id() OR
      get_auth_role() = 'ADMIN'
    )
  );

CREATE POLICY "Admin can manage students"
  ON students FOR ALL
  USING (
    college_id = get_auth_college_id() AND
    get_auth_role() = 'ADMIN'
  );

-- ------------------------------------------------------------------------------
-- 5. FACULTY POLICIES
-- ------------------------------------------------------------------------------

CREATE POLICY "College members can view faculty"
  ON faculty FOR SELECT
  USING (college_id = get_auth_college_id());

CREATE POLICY "Admin can manage faculty"
  ON faculty FOR ALL
  USING (
    college_id = get_auth_college_id() AND
    get_auth_role() = 'ADMIN'
  );

-- ------------------------------------------------------------------------------
-- 6. CATEGORIES POLICIES
-- ------------------------------------------------------------------------------

CREATE POLICY "College members can view active categories"
  ON categories FOR SELECT
  USING (college_id = get_auth_college_id() AND is_active = true);

CREATE POLICY "Admin can manage categories"
  ON categories FOR ALL
  USING (
    college_id = get_auth_college_id() AND
    get_auth_role() = 'ADMIN'
  );

-- ------------------------------------------------------------------------------
-- 7. CERTIFICATES POLICIES
-- ------------------------------------------------------------------------------

CREATE POLICY "Students can view own certificates"
  ON certificates FOR SELECT
  USING (student_id = get_auth_student_id());

CREATE POLICY "Students can insert own draft or submitted certificates"
  ON certificates FOR INSERT
  WITH CHECK (
    student_id = get_auth_student_id() AND
    college_id = get_auth_college_id() AND
    status IN ('DRAFT', 'SUBMITTED')
  );

CREATE POLICY "Students can update only draft or correction_required certificates"
  ON certificates FOR UPDATE
  USING (
    student_id = get_auth_student_id() AND
    status IN ('DRAFT', 'CORRECTION_REQUIRED')
  )
  WITH CHECK (
    student_id = get_auth_student_id() AND
    status IN ('DRAFT', 'SUBMITTED')
  );

CREATE POLICY "Faculty can view department certificates"
  ON certificates FOR SELECT
  USING (
    college_id = get_auth_college_id() AND
    get_auth_role() IN ('FACULTY', 'HOD') AND
    student_id IN (
      SELECT id FROM students WHERE department_id = get_auth_faculty_department_id()
    )
  );

CREATE POLICY "Faculty can update department certificates for review"
  ON certificates FOR UPDATE
  USING (
    college_id = get_auth_college_id() AND
    get_auth_role() IN ('FACULTY', 'HOD') AND
    student_id IN (
      SELECT id FROM students WHERE department_id = get_auth_faculty_department_id()
    )
  );

CREATE POLICY "Admin can view all college certificates"
  ON certificates FOR SELECT
  USING (
    college_id = get_auth_college_id() AND
    get_auth_role() = 'ADMIN'
  );

-- ------------------------------------------------------------------------------
-- 8. CERTIFICATE FILES POLICIES
-- ------------------------------------------------------------------------------

CREATE POLICY "Students can view files of own certificates"
  ON certificate_files FOR SELECT
  USING (
    certificate_id IN (
      SELECT id FROM certificates WHERE student_id = get_auth_student_id()
    )
  );

CREATE POLICY "Students can insert files for own certificates"
  ON certificate_files FOR INSERT
  WITH CHECK (
    certificate_id IN (
      SELECT id FROM certificates WHERE student_id = get_auth_student_id()
    )
  );

CREATE POLICY "Faculty can view files for department certificates"
  ON certificate_files FOR SELECT
  USING (
    certificate_id IN (
      SELECT c.id FROM certificates c
      JOIN students s ON c.student_id = s.id
      WHERE s.department_id = get_auth_faculty_department_id()
    )
  );

CREATE POLICY "Admin can view all college certificate files"
  ON certificate_files FOR SELECT
  USING (
    certificate_id IN (
      SELECT id FROM certificates WHERE college_id = get_auth_college_id()
    )
  );

-- ------------------------------------------------------------------------------
-- 9. CERTIFICATE REVIEWS POLICIES
-- ------------------------------------------------------------------------------

CREATE POLICY "Students can view reviews of own certificates"
  ON certificate_reviews FOR SELECT
  USING (
    certificate_id IN (
      SELECT id FROM certificates WHERE student_id = get_auth_student_id()
    )
  );

CREATE POLICY "Faculty can view and insert reviews for department certificates"
  ON certificate_reviews FOR SELECT
  USING (
    certificate_id IN (
      SELECT c.id FROM certificates c
      JOIN students s ON c.student_id = s.id
      WHERE s.department_id = get_auth_faculty_department_id()
    )
  );

CREATE POLICY "Faculty can create reviews for department certificates"
  ON certificate_reviews FOR INSERT
  WITH CHECK (
    certificate_id IN (
      SELECT c.id FROM certificates c
      JOIN students s ON c.student_id = s.id
      WHERE s.department_id = get_auth_faculty_department_id()
    )
  );

CREATE POLICY "Admin can view all college reviews"
  ON certificate_reviews FOR SELECT
  USING (
    certificate_id IN (
      SELECT id FROM certificates WHERE college_id = get_auth_college_id()
    )
  );

-- ------------------------------------------------------------------------------
-- 10. POINT RECORDS POLICIES
-- ------------------------------------------------------------------------------

CREATE POLICY "Students can view own points"
  ON point_records FOR SELECT
  USING (student_id = get_auth_student_id());

CREATE POLICY "Faculty can view and insert points for department students"
  ON point_records FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM students WHERE department_id = get_auth_faculty_department_id()
    )
  );

CREATE POLICY "Faculty can award points for department students"
  ON point_records FOR INSERT
  WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE department_id = get_auth_faculty_department_id()
    )
  );

CREATE POLICY "Admin can view all college point records"
  ON point_records FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM students WHERE college_id = get_auth_college_id()
    )
  );

-- ------------------------------------------------------------------------------
-- 11. NOTIFICATIONS POLICIES
-- ------------------------------------------------------------------------------

CREATE POLICY "Users can view and update own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can mark own notifications as read"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 12. AUDIT LOGS POLICIES
-- ------------------------------------------------------------------------------

CREATE POLICY "Admin can view college audit logs"
  ON audit_logs FOR SELECT
  USING (
    college_id = get_auth_college_id() AND
    get_auth_role() = 'ADMIN'
  );

CREATE POLICY "HOD can view department-related audit logs"
  ON audit_logs FOR SELECT
  USING (
    college_id = get_auth_college_id() AND
    get_auth_role() = 'HOD'
  );

-- Prevent any UPDATE or DELETE on audit logs
CREATE POLICY "Audit logs are strictly append-only"
  ON audit_logs FOR INSERT
  WITH CHECK (college_id = get_auth_college_id());
