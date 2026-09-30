"use server";

import { requireRole, requireUser } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";
import { certificateFormSchema, CertificateFormData } from "@/lib/validators/certificate";
import { logAuditEvent } from "@/lib/audit/logger";
import { sendNotification } from "@/lib/notifications/dispatcher";
import { calculateSHA256, checkForDuplicateHash, validateCertificateFile } from "@/lib/storage/client";
import { Certificate, CertificateFile, EventLevel } from "@/types/database.types";
import { revalidatePath } from "next/cache";

export async function getCategoriesAction() {
  const user = await requireUser();
  const db = getDB();
  return db.categories.filter((c) => c.college_id === user.profile.college_id && c.is_active);
}

export async function createCertificateAction(formData: CertificateFormData, fileData?: {
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  base64Data: string;
  isSupporting?: boolean;
}) {
  const user = await requireRole(["STUDENT"]);
  if (!user.student) {
    throw new Error("Student profile record not found");
  }

  const validation = certificateFormSchema.safeParse(formData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || "Invalid certificate details",
    };
  }

  const db = getDB();
  const certId = crypto.randomUUID();
  const student = user.student;

  let duplicateWarning: string | null = null;
  const filesToInsert: CertificateFile[] = [];

  if (fileData) {
    const buffer = Buffer.from(fileData.base64Data, "base64");
    const fileValidation = validateCertificateFile({
      size: fileData.fileSize,
      type: fileData.mimeType,
    });

    if (!fileValidation.valid) {
      return { success: false, error: fileValidation.error };
    }

    const hash = calculateSHA256(buffer);
    const dupCheck = checkForDuplicateHash(hash);
    if (dupCheck.isDuplicate) {
      duplicateWarning =
        "Possible duplicate certificate detected: A byte-identical file was already submitted in the repository. Note: This system detects byte-identical files and does not detect visually similar or re-photographed certificates. Faculty will review accordingly.";
    }

    const fileId = crypto.randomUUID();
    const storagePath = `certificates/${certId}/${fileData.originalFilename}`;

    const newFile: CertificateFile = {
      id: fileId,
      certificate_id: certId,
      version: 1,
      file_type: fileData.isSupporting ? "SUPPORTING" : "PRIMARY",
      storage_path: storagePath,
      original_filename: fileData.originalFilename,
      file_size: fileData.fileSize,
      mime_type: fileData.mimeType,
      file_hash: hash,
      created_at: new Date().toISOString(),
    };

    filesToInsert.push(newFile);
  }

  const newCertificate: Certificate = {
    id: certId,
    college_id: user.profile.college_id,
    student_id: student.id,
    achievement_id: null,
    title: formData.title,
    event_name: formData.event_name,
    category_id: formData.category_id,
    event_level: formData.event_level as EventLevel,
    organizer: formData.organizer,
    event_date: formData.event_date,
    achievement: formData.achievement,
    description: formData.description || null,
    status: "SUBMITTED",
    reviewer_id: null,
    review_started_at: null,
    submitted_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.certificates.unshift(newCertificate);
  filesToInsert.forEach((f) => db.certificateFiles.push(f));

  // Audit Log
  await logAuditEvent({
    collegeId: user.profile.college_id,
    actorId: user.profile.id,
    action: "CERTIFICATE_SUBMITTED",
    entityType: "CERTIFICATE",
    entityId: certId,
    metadata: {
      title: formData.title,
      student: user.profile.full_name,
      duplicateWarning: !!duplicateWarning,
    },
  });

  // Notify student
  await sendNotification({
    userId: user.profile.id,
    type: "CERTIFICATE_SUBMITTED",
    title: "Certificate Submitted",
    message: `Your certificate "${formData.title}" has been successfully submitted and added to the faculty verification queue.`,
    entityType: "CERTIFICATE",
    entityId: certId,
  });

  // Notify department faculty
  const deptFaculty = db.faculty.filter(
    (f) => f.department_id === student.department_id && f.college_id === user.profile.college_id
  );
  for (const facultyMember of deptFaculty) {
    await sendNotification({
      userId: facultyMember.profile_id,
      type: "NEW_CERTIFICATE_TO_REVIEW",
      title: "New Certificate for Review",
      message: `${user.profile.full_name} (${student.register_number}) submitted "${formData.title}" for verification.`,
      entityType: "CERTIFICATE",
      entityId: certId,
    });
  }

  revalidatePath("/student/certificates");
  revalidatePath("/student/dashboard");
  revalidatePath("/faculty/reviews");

  return {
    success: true,
    certificateId: certId,
    duplicateWarning,
  };
}

export async function resubmitCertificateAction(
  certificateId: string,
  updatedData: Partial<CertificateFormData>,
  newFileData?: {
    originalFilename: string;
    fileSize: number;
    mimeType: string;
    base64Data: string;
  }
) {
  const user = await requireRole(["STUDENT"]);
  const db = getDB();

  const cert = db.certificates.find((c) => c.id === certificateId);
  if (!cert) {
    return { success: false, error: "Certificate not found" };
  }

  if (cert.student_id !== user.student?.id) {
    return { success: false, error: "Unauthorized access to this certificate" };
  }

  if (cert.status !== "CORRECTION_REQUIRED") {
    return {
      success: false,
      error: `Invalid transition: Only certificates with 'CORRECTION_REQUIRED' status can be resubmitted. Current status is ${cert.status}.`,
    };
  }

  // Update certificate fields if provided
  if (updatedData.title) cert.title = updatedData.title;
  if (updatedData.event_name) cert.event_name = updatedData.event_name;
  if (updatedData.category_id) cert.category_id = updatedData.category_id;
  if (updatedData.event_level) cert.event_level = updatedData.event_level;
  if (updatedData.organizer) cert.organizer = updatedData.organizer;
  if (updatedData.event_date) cert.event_date = updatedData.event_date;
  if (updatedData.achievement) cert.achievement = updatedData.achievement;
  if (updatedData.description !== undefined) cert.description = updatedData.description;

  // Add new file version without deleting previous files
  if (newFileData) {
    const buffer = Buffer.from(newFileData.base64Data, "base64");
    const fileValidation = validateCertificateFile({
      size: newFileData.fileSize,
      type: newFileData.mimeType,
    });

    if (!fileValidation.valid) {
      return { success: false, error: fileValidation.error };
    }

    const hash = calculateSHA256(buffer);
    const existingFiles = db.certificateFiles.filter((f) => f.certificate_id === cert.id);
    const nextVersion = existingFiles.length + 1;

    const newFile: CertificateFile = {
      id: crypto.randomUUID(),
      certificate_id: cert.id,
      version: nextVersion,
      file_type: "PRIMARY",
      storage_path: `certificates/${cert.id}/v${nextVersion}_${newFileData.originalFilename}`,
      original_filename: newFileData.originalFilename,
      file_size: newFileData.fileSize,
      mime_type: newFileData.mimeType,
      file_hash: hash,
      created_at: new Date().toISOString(),
    };

    db.certificateFiles.push(newFile);
  }

  // Valid state transition: CORRECTION_REQUIRED -> SUBMITTED
  cert.status = "SUBMITTED";
  cert.reviewer_id = null;
  cert.review_started_at = null;
  cert.submitted_at = new Date().toISOString();
  cert.updated_at = new Date().toISOString();

  // Audit Log
  await logAuditEvent({
    collegeId: user.profile.college_id,
    actorId: user.profile.id,
    action: "CERTIFICATE_SUBMITTED",
    entityType: "CERTIFICATE",
    entityId: cert.id,
    metadata: {
      action: "RESUBMISSION_AFTER_CORRECTION",
      title: cert.title,
    },
  });

  // Notify faculty
  const deptFaculty = db.faculty.filter(
    (f) => f.department_id === user.student?.department_id && f.college_id === user.profile.college_id
  );
  for (const facultyMember of deptFaculty) {
    await sendNotification({
      userId: facultyMember.profile_id,
      type: "CERTIFICATE_RESUBMITTED",
      title: "Resubmitted Certificate",
      message: `${user.profile.full_name} has resubmitted "${cert.title}" with updated details/file.`,
      entityType: "CERTIFICATE",
      entityId: cert.id,
    });
  }

  revalidatePath("/student/certificates");
  revalidatePath(`/student/certificates/${cert.id}`);
  revalidatePath("/faculty/reviews");

  return { success: true };
}

export async function getStudentCertificatesAction(filters?: {
  status?: string;
  categoryId?: string;
  eventLevel?: string;
  search?: string;
}) {
  const user = await requireRole(["STUDENT"]);
  const db = getDB();

  let certs = db.certificates.filter((c) => c.student_id === user.student?.id);

  if (filters?.status && filters.status !== "ALL") {
    certs = certs.filter((c) => c.status === filters.status);
  }
  if (filters?.categoryId && filters.categoryId !== "ALL") {
    certs = certs.filter((c) => c.category_id === filters.categoryId);
  }
  if (filters?.eventLevel && filters.eventLevel !== "ALL") {
    certs = certs.filter((c) => c.event_level === filters.eventLevel);
  }
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase();
    certs = certs.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.event_name.toLowerCase().includes(q) ||
        c.organizer.toLowerCase().includes(q)
    );
  }

  // Populate joined fields
  return certs.map((c) => {
    const category = db.categories.find((cat) => cat.id === c.category_id);
    const files = db.certificateFiles.filter((f) => f.certificate_id === c.id);
    const points = db.pointRecords.filter((p) => p.certificate_id === c.id);
    const reviews = db.certificateReviews.filter((r) => r.certificate_id === c.id);
    return {
      ...c,
      category,
      files,
      points,
      reviews,
    };
  });
}

export async function getCertificateDetailsAction(id: string) {
  const user = await requireUser();
  const db = getDB();

  const cert = db.certificates.find((c) => c.id === id);
  if (!cert) {
    return null;
  }

  // Authorization check
  if (user.profile.role === "STUDENT" && cert.student_id !== user.student?.id) {
    throw new Error("Forbidden: You cannot access another student's certificate");
  }

  if (user.profile.role === "FACULTY" || user.profile.role === "HOD") {
    const certStudent = db.students.find((s) => s.id === cert.student_id);
    if (certStudent?.department_id !== user.faculty?.department_id) {
      throw new Error("Forbidden: You can only access certificates within your department");
    }
  }

  const student = db.students.find((s) => s.id === cert.student_id);
  const studentProfile = student ? db.profiles.find((p) => p.id === student.profile_id) : undefined;
  const studentDept = student ? db.departments.find((d) => d.id === student.department_id) : undefined;

  const category = db.categories.find((cat) => cat.id === cert.category_id);
  const files = db.certificateFiles
    .filter((f) => f.certificate_id === cert.id)
    .sort((a, b) => b.version - a.version);

  const reviews = db.certificateReviews
    .filter((r) => r.certificate_id === cert.id)
    .map((r) => {
      const reviewer = db.faculty.find((f) => f.id === r.reviewer_id);
      const reviewerProfile = reviewer ? db.profiles.find((p) => p.id === reviewer.profile_id) : undefined;
      return {
        ...r,
        reviewer: reviewer ? { ...reviewer, profile: reviewerProfile } : undefined,
      };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const points = db.pointRecords
    .filter((p) => p.certificate_id === cert.id)
    .map((p) => {
      const awardedFaculty = db.faculty.find((f) => f.id === p.awarded_by);
      const profile = awardedFaculty ? db.profiles.find((pr) => pr.id === awardedFaculty.profile_id) : undefined;
      return {
        ...p,
        awarded_by_faculty: awardedFaculty ? { ...awardedFaculty, profile } : undefined,
      };
    });

  const reviewerFaculty = cert.reviewer_id ? db.faculty.find((f) => f.id === cert.reviewer_id) : null;
  const reviewerProfile = reviewerFaculty ? db.profiles.find((p) => p.id === reviewerFaculty.profile_id) : null;

  return {
    ...cert,
    student: student ? { ...student, profile: studentProfile, department: studentDept } : undefined,
    category,
    files,
    reviews,
    points,
    reviewer: reviewerFaculty ? { ...reviewerFaculty, profile: reviewerProfile || undefined } : undefined,
  };
}
