"use server";

import { requireRole } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";
import {
  approveCertificateSchema,
  requestCorrectionSchema,
  rejectCertificateSchema,
  ApproveCertificateData,
  RequestCorrectionData,
  RejectCertificateData,
} from "@/lib/validators/review";
import { logAuditEvent } from "@/lib/audit/logger";
import { sendNotification } from "@/lib/notifications/dispatcher";
import { CertificateReview, PointRecord } from "@/types/database.types";
import { revalidatePath } from "next/cache";

export async function getDepartmentReviewQueueAction() {
  const user = await requireRole(["FACULTY", "HOD"]);
  if (!user.faculty) {
    throw new Error("Faculty profile record not found");
  }

  const db = getDB();
  const deptId = user.faculty.department_id;

  // Filter department students
  const deptStudentIds = new Set(
    db.students.filter((s) => s.department_id === deptId).map((s) => s.id)
  );

  // Return all certificates belonging to department students
  return db.certificates
    .filter((c) => deptStudentIds.has(c.student_id))
    .map((c) => {
      const student = db.students.find((s) => s.id === c.student_id);
      const studentProfile = student ? db.profiles.find((p) => p.id === student.profile_id) : undefined;
      const category = db.categories.find((cat) => cat.id === c.category_id);
      const reviewer = c.reviewer_id ? db.faculty.find((f) => f.id === c.reviewer_id) : null;
      const reviewerProfile = reviewer ? db.profiles.find((p) => p.id === reviewer.profile_id) : null;
      const files = db.certificateFiles.filter((f) => f.certificate_id === c.id);
      const points = db.pointRecords.filter((p) => p.certificate_id === c.id);

      return {
        ...c,
        student: student ? { ...student, profile: studentProfile } : undefined,
        category,
        files,
        points,
        reviewer: reviewer ? { ...reviewer, profile: reviewerProfile || undefined } : undefined,
      };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function claimCertificateForReviewAction(certificateId: string) {
  const user = await requireRole(["FACULTY", "HOD"]);
  if (!user.faculty) {
    throw new Error("Faculty profile record not found");
  }

  const db = getDB();
  const cert = db.certificates.find((c) => c.id === certificateId);
  if (!cert) {
    return { success: false, error: "Certificate not found" };
  }

  // Verify department isolation
  const student = db.students.find((s) => s.id === cert.student_id);
  if (!student || student.department_id !== user.faculty.department_id) {
    return {
      success: false,
      error: "Forbidden: You can only review certificates belonging to your department students",
    };
  }

  const collegeSettings = db.collegeSettings.find((s) => s.college_id === user.profile.college_id);
  const timeoutMinutes = collegeSettings?.reviewer_reclaim_timeout_minutes || 30;

  // Reviewer lock check
  if (cert.status === "UNDER_REVIEW" && cert.reviewer_id && cert.reviewer_id !== user.faculty.id) {
    const startedAt = cert.review_started_at ? new Date(cert.review_started_at).getTime() : 0;
    const elapsedMinutes = (Date.now() - startedAt) / (1000 * 60);

    const activeReviewer = db.faculty.find((f) => f.id === cert.reviewer_id);
    const activeProfile = activeReviewer ? db.profiles.find((p) => p.id === activeReviewer.profile_id) : null;
    const reviewerName = activeProfile?.full_name || "Another faculty member";

    if (elapsedMinutes < timeoutMinutes) {
      const remainingMinutes = Math.ceil(timeoutMinutes - elapsedMinutes);
      return {
        success: false,
        isLocked: true,
        remainingMinutes,
        reviewerName,
        reviewStartedAt: cert.review_started_at,
        error: `Currently being reviewed by ${reviewerName} since ${new Date(
          cert.review_started_at!
        ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. Lock expires in ${remainingMinutes} min.`,
      };
    } else {
      // Stale review lock timeout reached -> Allow reclaim
      cert.reviewer_id = user.faculty.id;
      cert.review_started_at = new Date().toISOString();
      cert.updated_at = new Date().toISOString();

      await logAuditEvent({
        collegeId: user.profile.college_id,
        actorId: user.profile.id,
        action: "CERTIFICATE_RECLAIMED",
        entityType: "CERTIFICATE",
        entityId: cert.id,
        metadata: {
          previousReviewer: reviewerName,
          timeoutMinutes,
        },
      });

      revalidatePath(`/faculty/reviews/${cert.id}`);
      return { success: true, reclaimed: true };
    }
  }

  // Normal claim from SUBMITTED to UNDER_REVIEW
  if (cert.status === "SUBMITTED" || (cert.status === "UNDER_REVIEW" && cert.reviewer_id === user.faculty.id)) {
    cert.status = "UNDER_REVIEW";
    cert.reviewer_id = user.faculty.id;
    if (!cert.review_started_at || cert.reviewer_id !== user.faculty.id) {
      cert.review_started_at = new Date().toISOString();
    }
    cert.updated_at = new Date().toISOString();

    await logAuditEvent({
      collegeId: user.profile.college_id,
      actorId: user.profile.id,
      action: "CERTIFICATE_CLAIMED",
      entityType: "CERTIFICATE",
      entityId: cert.id,
      metadata: { reviewer: user.profile.full_name },
    });

    revalidatePath("/faculty/reviews");
    revalidatePath(`/faculty/reviews/${cert.id}`);
    return { success: true };
  }

  return {
    success: false,
    error: `Cannot claim certificate with status "${cert.status}"`,
  };
}

export async function approveCertificateAction(data: ApproveCertificateData) {
  const user = await requireRole(["FACULTY", "HOD"]);
  if (!user.faculty) {
    throw new Error("Faculty profile record not found");
  }

  const validation = approveCertificateSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || "Invalid approval input",
    };
  }

  const { certificate_id, points, comment } = validation.data;
  const db = getDB();

  const cert = db.certificates.find((c) => c.id === certificate_id);
  if (!cert) {
    return { success: false, error: "Certificate not found" };
  }

  // Department check
  const student = db.students.find((s) => s.id === cert.student_id);
  if (!student || student.department_id !== user.faculty.department_id) {
    return { success: false, error: "Forbidden: Certificate belongs to another department" };
  }

  // Setting points constraint check
  const collegeSettings = db.collegeSettings.find((s) => s.college_id === user.profile.college_id);
  const maxPoints = collegeSettings?.max_points_per_certificate || 100;
  if (points > maxPoints) {
    return {
      success: false,
      error: `Points (${points}) exceed the maximum allowable points per certificate (${maxPoints})`,
    };
  }

  // Generate unique Achievement ID: ACH-YYYY-DEPT-XXXXXX
  const studentDept = db.departments.find((d) => d.id === student.department_id);
  const deptCode = studentDept?.code || "GEN";
  const year = cert.event_date ? cert.event_date.substring(0, 4) : new Date().getFullYear().toString();
  const approvedCount = db.certificates.filter(
    (c) => c.status === "APPROVED" && c.achievement_id?.startsWith(`ACH-${year}-${deptCode}`)
  ).length;
  const sequence = String(approvedCount + 1).padStart(6, "0");
  const achievementId = `ACH-${year}-${deptCode}-${sequence}`;

  // State Transition: UNDER_REVIEW -> APPROVED
  cert.status = "APPROVED";
  cert.achievement_id = achievementId;
  cert.reviewer_id = user.faculty.id;
  cert.updated_at = new Date().toISOString();

  // Create Review Record
  const reviewRecord: CertificateReview = {
    id: crypto.randomUUID(),
    certificate_id: cert.id,
    reviewer_id: user.faculty.id,
    action: "APPROVED",
    reason: null,
    comment: comment || "Approved and verified by department faculty.",
    created_at: new Date().toISOString(),
  };
  db.certificateReviews.push(reviewRecord);

  // Create Point Record (human manually awarded)
  const pointRecord: PointRecord = {
    id: crypto.randomUUID(),
    student_id: student.id,
    certificate_id: cert.id,
    points,
    awarded_by: user.faculty.id,
    comment: comment || null,
    is_latest: true,
    created_at: new Date().toISOString(),
  };
  db.pointRecords.push(pointRecord);

  // Audit Logs
  await logAuditEvent({
    collegeId: user.profile.college_id,
    actorId: user.profile.id,
    action: "CERTIFICATE_APPROVED",
    entityType: "CERTIFICATE",
    entityId: cert.id,
    metadata: {
      achievementId,
      points,
      comment,
      title: cert.title,
    },
  });

  await logAuditEvent({
    collegeId: user.profile.college_id,
    actorId: user.profile.id,
    action: "POINTS_AWARDED",
    entityType: "POINT_RECORD",
    entityId: pointRecord.id,
    metadata: {
      studentId: student.id,
      points,
      certificateId: cert.id,
    },
  });

  // Notify Student
  await sendNotification({
    userId: student.profile_id,
    type: "CERTIFICATE_APPROVED",
    title: "Certificate Approved & Points Awarded",
    message: `Your certificate "${cert.title}" was verified and approved by ${user.profile.full_name}. You have been awarded +${points} points (Achievement ID: ${achievementId}).`,
    entityType: "CERTIFICATE",
    entityId: cert.id,
  });

  revalidatePath("/faculty/reviews");
  revalidatePath(`/faculty/reviews/${cert.id}`);
  revalidatePath("/student/certificates");
  revalidatePath("/student/achievements");
  revalidatePath("/student/dashboard");

  return { success: true, achievementId, points };
}

export async function requestCorrectionAction(data: RequestCorrectionData) {
  const user = await requireRole(["FACULTY", "HOD"]);
  if (!user.faculty) {
    throw new Error("Faculty profile record not found");
  }

  const validation = requestCorrectionSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || "Invalid correction request",
    };
  }

  const { certificate_id, explanation: rawExplanation, reason, comment } = validation.data;
  const explanation = rawExplanation || (reason ? `${reason}: ${comment || ""}`.trim() : comment || "Correction requested");
  const db = getDB();

  const cert = db.certificates.find((c) => c.id === certificate_id);
  if (!cert) {
    return { success: false, error: "Certificate not found" };
  }

  const student = db.students.find((s) => s.id === cert.student_id);
  if (!student || student.department_id !== user.faculty.department_id) {
    return { success: false, error: "Forbidden: Certificate belongs to another department" };
  }

  // State Transition: UNDER_REVIEW -> CORRECTION_REQUIRED
  cert.status = "CORRECTION_REQUIRED";
  cert.reviewer_id = user.faculty.id;
  cert.updated_at = new Date().toISOString();

  // Create Review Record
  const reviewRecord: CertificateReview = {
    id: crypto.randomUUID(),
    certificate_id: cert.id,
    reviewer_id: user.faculty.id,
    action: "CORRECTION_REQUESTED",
    reason: explanation,
    comment: explanation,
    created_at: new Date().toISOString(),
  };
  db.certificateReviews.push(reviewRecord);

  // Audit Log
  await logAuditEvent({
    collegeId: user.profile.college_id,
    actorId: user.profile.id,
    action: "CORRECTION_REQUESTED",
    entityType: "CERTIFICATE",
    entityId: cert.id,
    metadata: {
      explanation,
      reviewer: user.profile.full_name,
    },
  });

  // Notify Student
  await sendNotification({
    userId: student.profile_id,
    type: "CORRECTION_REQUESTED",
    title: "Correction Requested on Certificate",
    message: `Faculty requested correction on "${cert.title}": ${explanation}. Please review the feedback and resubmit.`,
    entityType: "CERTIFICATE",
    entityId: cert.id,
  });

  revalidatePath("/faculty/reviews");
  revalidatePath(`/faculty/reviews/${cert.id}`);
  revalidatePath("/student/certificates");
  revalidatePath(`/student/certificates/${cert.id}`);

  return { success: true };
}

export async function rejectCertificateAction(data: RejectCertificateData) {
  const user = await requireRole(["FACULTY", "HOD"]);
  if (!user.faculty) {
    throw new Error("Faculty profile record not found");
  }

  const validation = rejectCertificateSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || "Invalid rejection input",
    };
  }

  const { certificate_id, reason, comment } = validation.data;
  const db = getDB();

  const cert = db.certificates.find((c) => c.id === certificate_id);
  if (!cert) {
    return { success: false, error: "Certificate not found" };
  }

  const student = db.students.find((s) => s.id === cert.student_id);
  if (!student || student.department_id !== user.faculty.department_id) {
    return { success: false, error: "Forbidden: Certificate belongs to another department" };
  }

  const fullReason = reason === "Other" ? `Other: ${comment}` : reason;

  // State Transition: UNDER_REVIEW -> REJECTED
  cert.status = "REJECTED";
  cert.reviewer_id = user.faculty.id;
  cert.updated_at = new Date().toISOString();

  // Create Review Record
  const reviewRecord: CertificateReview = {
    id: crypto.randomUUID(),
    certificate_id: cert.id,
    reviewer_id: user.faculty.id,
    action: "REJECTED",
    reason: fullReason,
    comment: comment || null,
    created_at: new Date().toISOString(),
  };
  db.certificateReviews.push(reviewRecord);

  // Audit Log
  await logAuditEvent({
    collegeId: user.profile.college_id,
    actorId: user.profile.id,
    action: "CERTIFICATE_REJECTED",
    entityType: "CERTIFICATE",
    entityId: cert.id,
    metadata: {
      reason: fullReason,
      comment,
      reviewer: user.profile.full_name,
    },
  });

  // Notify Student
  await sendNotification({
    userId: student.profile_id,
    type: "CERTIFICATE_REJECTED",
    title: "Certificate Submission Rejected",
    message: `Your submission "${cert.title}" was rejected. Reason: ${fullReason}.`,
    entityType: "CERTIFICATE",
    entityId: cert.id,
  });

  revalidatePath("/faculty/reviews");
  revalidatePath(`/faculty/reviews/${cert.id}`);
  revalidatePath("/student/certificates");

  return { success: true };
}
