-- ==============================================================================
-- CAMPUSCRED — SEED DATA (MIGRATION 004)
-- Verified Achievements. Trusted Records.
-- ==============================================================================

-- 1. Insert College
INSERT INTO colleges (id, name, code, logo_url)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'ABC College of Technology',
  'ABCTECH',
  '/logo.svg'
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert College Settings
INSERT INTO college_settings (id, college_id, max_points_per_certificate, reviewer_reclaim_timeout_minutes, max_file_size_mb)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  100,
  30,
  10
) ON CONFLICT (college_id) DO NOTHING;

-- 3. Insert Departments
INSERT INTO departments (id, college_id, name, code, is_active) VALUES
  ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111111', 'Computer Science and Engineering', 'CSE', true),
  ('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111111', 'Information Technology', 'IT', true),
  ('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111111', 'Electronics and Communication Engineering', 'ECE', true),
  ('33333333-3333-3333-3333-333333333304', '11111111-1111-1111-1111-111111111111', 'Mechanical Engineering', 'MECH', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Categories
INSERT INTO categories (id, college_id, name, description, is_active) VALUES
  ('44444444-4444-4444-4444-444444444401', '11111111-1111-1111-1111-111111111111', 'Academic', 'Merit ranks, semester excellence, academic honors', true),
  ('44444444-4444-4444-4444-444444444402', '11111111-1111-1111-1111-111111111111', 'Technical', 'Technical symposiums, coding challenges, project expos', true),
  ('44444444-4444-4444-4444-444444444403', '11111111-1111-1111-1111-111111111111', 'Sports', 'Inter-collegiate and state athletic achievements', true),
  ('44444444-4444-4444-4444-444444444404', '11111111-1111-1111-1111-111111111111', 'Cultural', 'Music, debate, arts, drama and literary competitions', true),
  ('44444444-4444-4444-4444-444444444405', '11111111-1111-1111-1111-111111111111', 'Workshop', 'Technical hands-on workshops and bootcamps', true),
  ('44444444-4444-4444-4444-444444444406', '11111111-1111-1111-1111-111111111111', 'Seminar', 'Conference presentations and invited talks', true),
  ('44444444-4444-4444-4444-444444444407', '11111111-1111-1111-1111-111111111111', 'Hackathon', 'National and collegiate hackathons & buildathons', true),
  ('44444444-4444-4444-4444-444444444408', '11111111-1111-1111-1111-111111111111', 'Competition', 'Olympiads, quiz tournaments, and innovation challenges', true),
  ('44444444-4444-4444-4444-444444444409', '11111111-1111-1111-1111-111111111111', 'Certification', 'Industry-recognized professional certifications', true),
  ('44444444-4444-4444-4444-444444444410', '11111111-1111-1111-1111-111111111111', 'Research', 'Published papers, journals, and patent filings', true),
  ('44444444-4444-4444-4444-444444444411', '11111111-1111-1111-1111-111111111111', 'Leadership', 'Student council, club heads, and symposium leads', true),
  ('44444444-4444-4444-4444-444444444412', '11111111-1111-1111-1111-111111111111', 'Volunteering', 'NSS, community outreach, and social impact projects', true),
  ('44444444-4444-4444-4444-444444444413', '11111111-1111-1111-1111-111111111111', 'Other', 'Other verified co-curricular achievements', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Profiles (Auth Users should be created in Supabase Auth, but we provide seed profiles here)
-- Admin
INSERT INTO profiles (id, college_id, role, email, full_name, is_active) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'ADMIN', 'admin@abctech.edu', 'Dr. Arthur Vance (Dean/Admin)', true)
ON CONFLICT (id) DO NOTHING;

-- Faculty
INSERT INTO profiles (id, college_id, role, email, full_name, is_active) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', '11111111-1111-1111-1111-111111111111', 'FACULTY', 'prof.sharma@abctech.edu', 'Prof. Ramesh Sharma', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', '11111111-1111-1111-1111-111111111111', 'FACULTY', 'dr.kavita@abctech.edu', 'Dr. Kavita Nair', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03', '11111111-1111-1111-1111-111111111111', 'HOD', 'hod.cse@abctech.edu', 'Dr. Murugan Pillai (HOD-CSE)', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO faculty (id, profile_id, college_id, department_id, designation, employee_id, is_hod) VALUES
  ('55555555-5555-5555-5555-555555555501', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333301', 'Associate Professor', 'FAC-CSE-101', false),
  ('55555555-5555-5555-5555-555555555502', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333302', 'Assistant Professor', 'FAC-IT-102', false),
  ('55555555-5555-5555-5555-555555555503', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333301', 'Professor & Head', 'FAC-CSE-001', true)
ON CONFLICT (id) DO NOTHING;

-- Students
INSERT INTO profiles (id, college_id, role, email, full_name, is_active) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccc01', '11111111-1111-1111-1111-111111111111', 'STUDENT', 'aditya.verma@student.abctech.edu', 'Aditya Verma', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccc02', '11111111-1111-1111-1111-111111111111', 'STUDENT', 'priya.sundaram@student.abctech.edu', 'Priya Sundaram', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccc03', '11111111-1111-1111-1111-111111111111', 'STUDENT', 'rohit.gupta@student.abctech.edu', 'Rohit Gupta', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccc04', '11111111-1111-1111-1111-111111111111', 'STUDENT', 'ananya.iyer@student.abctech.edu', 'Ananya Iyer', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccc05', '11111111-1111-1111-1111-111111111111', 'STUDENT', 'vikram.singh@student.abctech.edu', 'Vikram Singh', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO students (id, profile_id, college_id, department_id, register_number, academic_year) VALUES
  ('66666666-6666-6666-6666-666666666601', 'cccccccc-cccc-cccc-cccc-cccccccccc01', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333301', '710022CS0101', 3),
  ('66666666-6666-6666-6666-666666666602', 'cccccccc-cccc-cccc-cccc-cccccccccc02', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333301', '710022CS0142', 3),
  ('66666666-6666-6666-6666-666666666603', 'cccccccc-cccc-cccc-cccc-cccccccccc03', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333302', '710022IT0118', 3),
  ('66666666-6666-6666-6666-666666666604', 'cccccccc-cccc-cccc-cccc-cccccccccc04', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333303', '710023EC0089', 2),
  ('66666666-6666-6666-6666-666666666605', 'cccccccc-cccc-cccc-cccc-cccccccccc05', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333304', '710021ME0054', 4)
ON CONFLICT (id) DO NOTHING;

-- 6. Seed Sample Certificates across various statuses
-- A: Approved Hackathon Finalist
INSERT INTO certificates (
  id, college_id, student_id, achievement_id, title, event_name, category_id,
  event_level, organizer, event_date, achievement, description, status, submitted_at
) VALUES (
  '77777777-7777-7777-7777-777777777701',
  '11111111-1111-1111-1111-111111111111',
  '66666666-6666-6666-6666-666666666601',
  'ACH-2026-CSE-000101',
  'Smart India Hackathon Finalist',
  'Smart India Hackathon 2026',
  '44444444-4444-4444-4444-444444444407',
  'NATIONAL',
  'Ministry of Education & AICTE',
  '2026-08-15',
  'National Finalist (Top 5 Nationwide)',
  'Developed an automated drone monitoring solution for disaster relief logistics.',
  'APPROVED',
  '2026-08-20 10:00:00+00'
) ON CONFLICT (id) DO NOTHING;

-- Primary File
INSERT INTO certificate_files (
  certificate_id, version, file_type, storage_path, original_filename, file_size, mime_type, file_hash
) VALUES (
  '77777777-7777-7777-7777-777777777701',
  1,
  'PRIMARY',
  'certificates/77777777-7777-7777-7777-777777777701/sih_finalist_cert.pdf',
  'sih_finalist_cert.pdf',
  1048576,
  'application/pdf',
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
) ON CONFLICT DO NOTHING;

-- Point Record for Approved Certificate
INSERT INTO point_records (
  student_id, certificate_id, points, awarded_by, comment, is_latest
) VALUES (
  '66666666-6666-6666-6666-666666666601',
  '77777777-7777-7777-7777-777777777701',
  40,
  '55555555-5555-5555-5555-555555555501',
  'Exemplary national-level participation and presentation.',
  true
) ON CONFLICT DO NOTHING;

-- Review Record
INSERT INTO certificate_reviews (
  certificate_id, reviewer_id, action, comment
) VALUES (
  '77777777-7777-7777-7777-777777777701',
  '55555555-5555-5555-5555-555555555501',
  'APPROVED',
  'Verified against AICTE official finalist directory.'
) ON CONFLICT DO NOTHING;

-- B: Approved Python Certification
INSERT INTO certificates (
  id, college_id, student_id, achievement_id, title, event_name, category_id,
  event_level, organizer, event_date, achievement, description, status, submitted_at
) VALUES (
  '77777777-7777-7777-7777-777777777702',
  '11111111-1111-1111-1111-111111111111',
  '66666666-6666-6666-6666-666666666601',
  'ACH-2026-CSE-000102',
  'Python Institute Certified Associate (PCAP)',
  'PCAP Certification Exam',
  '44444444-4444-4444-4444-444444444409',
  'INTERNATIONAL',
  'OpenEDG Python Institute',
  '2026-07-10',
  'Passed with Distinction (92%)',
  'Global credential certifying object-oriented programming, data structures, and standard library modules.',
  'APPROVED',
  '2026-07-15 09:30:00+00'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO point_records (
  student_id, certificate_id, points, awarded_by, comment, is_latest
) VALUES (
  '66666666-6666-6666-6666-666666666601',
  '77777777-7777-7777-7777-777777777702',
  25,
  '55555555-5555-5555-5555-555555555501',
  'Verified credential ID on Python Institute portal.',
  true
) ON CONFLICT DO NOTHING;

-- C: Under Review Certificate
INSERT INTO certificates (
  id, college_id, student_id, title, event_name, category_id,
  event_level, organizer, event_date, achievement, description, status, submitted_at,
  reviewer_id, review_started_at
) VALUES (
  '77777777-7777-7777-7777-777777777703',
  '11111111-1111-1111-1111-111111111111',
  '66666666-6666-6666-6666-666666666602',
  'IEEE Student Branch Paper Presentation',
  'IEEE TechSymposium 2026',
  '44444444-4444-4444-4444-444444444410',
  'STATE',
  'IEEE Madras Section',
  '2026-09-01',
  'Best Technical Paper Award',
  'Paper titled "Efficient Edge Inference on Constrained Microcontrollers".',
  'UNDER_REVIEW',
  '2026-09-05 14:00:00+00',
  '55555555-5555-5555-5555-555555555501',
  now() - interval '5 minutes'
) ON CONFLICT (id) DO NOTHING;

-- D: Submitted (Pending Claim) Certificate
INSERT INTO certificates (
  id, college_id, student_id, title, event_name, category_id,
  event_level, organizer, event_date, achievement, description, status, submitted_at
) VALUES (
  '77777777-7777-7777-7777-777777777704',
  '11111111-1111-1111-1111-111111111111',
  '66666666-6666-6666-6666-666666666601',
  'AWS Certified Cloud Practitioner',
  'Amazon Web Services Certification',
  '44444444-4444-4444-4444-444444444409',
  'INTERNATIONAL',
  'Amazon Web Services (AWS)',
  '2026-09-12',
  'Certified Cloud Practitioner',
  'Foundational cloud architecture, security, and pricing models.',
  'SUBMITTED',
  '2026-09-15 11:20:00+00'
) ON CONFLICT (id) DO NOTHING;

-- E: Correction Required Certificate
INSERT INTO certificates (
  id, college_id, student_id, title, event_name, category_id,
  event_level, organizer, event_date, achievement, description, status, submitted_at
) VALUES (
  '77777777-7777-7777-7777-777777777705',
  '11111111-1111-1111-1111-111111111111',
  '66666666-6666-6666-6666-666666666602',
  'Inter-College Basketball Championship',
  'State Collegiate Games 2026',
  '44444444-4444-4444-4444-444444444403',
  'STATE',
  'Sports Development Authority',
  '2026-08-05',
  'Runners Up',
  'Represented College in the Men/Women tournament.',
  'CORRECTION_REQUIRED',
  '2026-08-10 16:00:00+00'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO certificate_reviews (
  certificate_id, reviewer_id, action, reason, comment
) VALUES (
  '77777777-7777-7777-7777-777777777705',
  '55555555-5555-5555-5555-555555555501',
  'CORRECTION_REQUESTED',
  'Unclear certificate',
  'The uploaded certificate is blurry and the physical seal is not legible. Please upload a high-resolution scan or photo.'
) ON CONFLICT DO NOTHING;
