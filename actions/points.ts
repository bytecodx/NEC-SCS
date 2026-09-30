"use server";

import { requireRole, requireUser } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";
import { pointCorrectionSchema, PointCorrectionData } from "@/lib/validators/review";
import { logAuditEvent } from "@/lib/audit/logger";
import { sendNotification } from "@/lib/notifications/dispatcher";
import { PointRecord } from "@/types/database.types";
import { revalidatePath } from "next/cache";

export async function getStudentPointHistoryAction(studentId?: string) {
  const user = await requireUser();
  const db = getDB();

  let targetStudentId = studentId;

  if (user.profile.role === "STUDENT") {
    targetStudentId = user.student?.id;
  } else if (!targetStudentId) {
    throw new Error("Student ID is required for staff query");
  }

  const records = db.pointRecords
    .filter((p) => p.student_id === targetStudentId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((p) => {
      const certificate = db.certificates.find((c) => c.id === p.certificate_id);
      const category = certificate ? db.categories.find((cat) => cat.id === certificate.category_id) : undefined;
      const faculty = db.faculty.find((f) => f.id === p.awarded_by);
      const facultyProfile = faculty ? db.profiles.find((pr) => pr.id === faculty.profile_id) : undefined;

      return {
        ...p,
        certificate: certificate ? { ...certificate, category } : undefined,
        awarded_by_faculty: faculty ? { ...faculty, profile: facultyProfile } : undefined,
      };
    });

  const totalPoints = records
    .filter((r) => r.is_latest)
    .reduce((sum, r) => sum + r.points, 0);

  return {
    records,
    totalPoints,
  };
}

export async function correctPointAwardAction(data: PointCorrectionData) {
  const user = await requireRole(["ADMIN", "HOD"]);
  const validation = pointCorrectionSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || "Invalid input",
    };
  }

  const { certificate_id, student_id, points, reason } = validation.data;
  const db = getDB();

  const cert = db.certificates.find((c) => c.id === certificate_id);
  if (!cert || cert.status !== "APPROVED") {
    return { success: false, error: "Only approved certificates have awarded points" };
  }

  const student = db.students.find((s) => s.id === student_id);
  if (!student) {
    return { success: false, error: "Student not found" };
  }

  // Find previous latest point record
  const previousRecord = db.pointRecords.find(
    (p) => p.certificate_id === certificate_id && p.is_latest
  );

  const originalPoints = previousRecord ? previousRecord.points : 0;

  // Mark previous records as not latest (never overwrite or delete!)
  db.pointRecords.forEach((p) => {
    if (p.certificate_id === certificate_id) {
      p.is_latest = false;
    }
  });

  // Insert brand new point record
  const newRecord: PointRecord = {
    id: crypto.randomUUID(),
    student_id,
    certificate_id,
    points,
    awarded_by: user.profile.role === "HOD" && user.faculty ? user.faculty.id : "ADMIN",
    comment: `Administrative Correction: ${reason} (Was: ${originalPoints} pts)`,
    is_latest: true,
    created_at: new Date().toISOString(),
  };
  db.pointRecords.push(newRecord);

  // Log audit event as strictly mandated in section 18
  await logAuditEvent({
    collegeId: user.profile.college_id,
    actorId: user.profile.id,
    action: "POINTS_CORRECTED",
    entityType: "POINT_RECORD",
    entityId: newRecord.id,
    metadata: {
      originalPoints,
      newPoints: points,
      changedBy: user.profile.full_name,
      role: user.profile.role,
      reason,
      certificateId: certificate_id,
      studentId: student_id,
    },
  });

  // Notify student
  await sendNotification({
    userId: student.profile_id,
    type: "POINTS_CORRECTED",
    title: "Achievement Points Adjusted",
    message: `Points for "${cert.title}" were adjusted from ${originalPoints} to ${points} pts. Reason: ${reason}.`,
    entityType: "POINT_RECORD",
    entityId: newRecord.id,
  });

  revalidatePath("/student/achievements");
  revalidatePath("/admin/dashboard");
  revalidatePath("/hod/dashboard");

  return { success: true, originalPoints, newPoints: points };
}
