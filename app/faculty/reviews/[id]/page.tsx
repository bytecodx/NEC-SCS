import React from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";
import { ReviewWorkbench } from "@/components/certificates/ReviewWorkbench";
import { claimCertificateForReviewAction } from "@/actions/reviews";

export default async function FacultyReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || !user.faculty) {
    redirect("/login");
  }

  const db = getDB();
  const { id } = await params;

  const certificate = db.certificates.find((c) => c.id === id);
  if (!certificate) {
    notFound();
  }

  // Department isolation check
  const student = db.students.find((s) => s.id === certificate.student_id);
  if (!student || student.department_id !== user.faculty.department_id) {
    notFound(); // Not in this faculty's department
  }

  const studentProfile = db.profiles.find((p) => p.id === student.profile_id);
  const category = db.categories.find((cat) => cat.id === certificate.category_id);
  const files = db.certificateFiles.filter((f) => f.certificate_id === certificate.id);
  const reviews = db.certificateReviews
    .filter((r) => r.certificate_id === certificate.id)
    .map((r) => {
      const reviewer = db.faculty.find((f) => f.id === r.reviewer_id);
      const reviewerProfile = reviewer ? db.profiles.find((p) => p.id === reviewer.profile_id) : undefined;
      return {
        ...r,
        reviewer: reviewer ? { ...reviewer, profile: reviewerProfile } : undefined,
      };
    });
  const points = db.pointRecords.filter((p) => p.certificate_id === certificate.id);

  // College settings for max points & timeout
  const settings = db.collegeSettings.find((s) => s.college_id === user.profile.college_id);
  const maxPoints = settings?.max_points_per_certificate || 100;
  const timeoutMinutes = settings?.reviewer_reclaim_timeout_minutes || 30;

  // Duplicate check
  const primaryFile = files.find((f) => f.file_type === "PRIMARY");
  const isDuplicateFlagged = primaryFile
    ? db.certificateFiles.some(
        (f) => f.id !== primaryFile.id && f.file_hash === primaryFile.file_hash
      )
    : false;

  return (
    <ReviewWorkbench
      certificate={certificate}
      student={{ ...student, profile: studentProfile }}
      category={category}
      files={files}
      reviews={reviews}
      points={points}
      currentFacultyId={user.faculty.id}
      maxPointsPerCertificate={maxPoints}
      reviewerTimeoutMinutes={timeoutMinutes}
      isDuplicateFlagged={isDuplicateFlagged}
    />
  );
}
