export type UserRole = 'STUDENT' | 'FACULTY' | 'HOD' | 'ADMIN';

export type CertificateStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CORRECTION_REQUIRED'
  | 'APPROVED'
  | 'REJECTED';

export type EventLevel =
  | 'COLLEGE'
  | 'INTRA_COLLEGE'
  | 'INTER_COLLEGE'
  | 'DISTRICT'
  | 'STATE'
  | 'NATIONAL'
  | 'INTERNATIONAL'
  | 'OTHER';

export type FileType = 'PRIMARY' | 'SUPPORTING';

export type ReviewAction =
  | 'CLAIMED'
  | 'CORRECTION_REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'RECLAIMED';

export type AuditAction =
  | 'LOGIN'
  | 'CERTIFICATE_CREATED'
  | 'CERTIFICATE_SUBMITTED'
  | 'CERTIFICATE_CLAIMED'
  | 'CERTIFICATE_RECLAIMED'
  | 'CERTIFICATE_APPROVED'
  | 'CORRECTION_REQUESTED'
  | 'CERTIFICATE_REJECTED'
  | 'POINTS_AWARDED'
  | 'POINTS_CORRECTED'
  | 'USER_CREATED'
  | 'USER_DISABLED'
  | 'CONFIGURATION_CHANGED';

export interface College {
  id: string;
  name: string;
  code: string;
  logo_url: string | null;
  created_at: string;
}

export interface CollegeSettings {
  id: string;
  college_id: string;
  max_points_per_certificate: number;
  reviewer_reclaim_timeout_minutes: number;
  max_file_size_mb: number;
  updated_at: string;
}

export type DepartmentType = 'UG' | 'PG';

export interface Department {
  id: string;
  college_id: string;
  name: string;
  code: string;
  type: DepartmentType;
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  college_id: string;
  role: UserRole;
  email: string;
  full_name: string;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  profile_id: string;
  college_id: string;
  department_id: string;
  register_number: string;
  academic_year: number;
  created_at: string;
  profile?: Profile;
  department?: Department;
}

export interface Faculty {
  id: string;
  profile_id: string;
  college_id: string;
  department_id: string;
  designation: string;
  employee_id: string;
  is_hod: boolean;
  created_at: string;
  profile?: Profile;
  department?: Department;
}

export interface Category {
  id: string;
  college_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Certificate {
  id: string;
  college_id: string;
  student_id: string;
  achievement_id: string | null;
  title: string;
  event_name: string;
  category_id: string;
  event_level: EventLevel;
  organizer: string;
  event_date: string;
  achievement: string;
  description: string | null;
  status: CertificateStatus;
  reviewer_id: string | null;
  review_started_at: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;

  // Joined relations
  student?: Student & { profile?: Profile; department?: Department };
  reviewer?: Faculty & { profile?: Profile };
  category?: Category;
  files?: CertificateFile[];
  reviews?: CertificateReview[];
  points?: PointRecord[];
}

export interface CertificateFile {
  id: string;
  certificate_id: string;
  version: number;
  file_type: FileType;
  storage_path: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  file_hash: string;
  created_at: string;
  signed_url?: string;
}

export interface CertificateReview {
  id: string;
  certificate_id: string;
  reviewer_id: string;
  action: ReviewAction;
  reason: string | null;
  comment: string | null;
  created_at: string;
  reviewer?: Faculty & { profile?: Profile };
}

export interface PointRecord {
  id: string;
  student_id: string;
  certificate_id: string;
  points: number;
  awarded_by: string;
  comment: string | null;
  is_latest: boolean;
  created_at: string;
  awarded_by_faculty?: Faculty & { profile?: Profile };
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  read_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  college_id: string;
  actor_id: string | null;
  action: AuditAction;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, any>;
  ip_address: string | null;
  created_at: string;
  actor?: Profile;
}
