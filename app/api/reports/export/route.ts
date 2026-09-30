import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.profile.role !== "ADMIN" && user.profile.role !== "HOD")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const reportType = searchParams.get("type") || "students";
  const levelFilter = searchParams.get("level")?.toUpperCase(); // "UG" or "PG"
  const db = getDB();

  let csvRows: string[][] = [];
  let filename = `campuscred_${reportType}_${levelFilter || "all"}_report.csv`;

  if (reportType === "students") {
    csvRows.push([
      "Student Name",
      "Register Number",
      "Department",
      "Degree Level",
      "Academic Year",
      "Total Certificates",
      "Approved Certificates",
      "Total Points Awarded",
    ]);

    db.students.forEach((s) => {
      const profile = db.profiles.find((p) => p.id === s.profile_id);
      const dept = db.departments.find((d) => d.id === s.department_id);
      const deptType = dept?.type || "UG";
      if (levelFilter && deptType !== levelFilter) return;

      const certs = db.certificates.filter((c) => c.student_id === s.id);
      const approved = certs.filter((c) => c.status === "APPROVED");
      const points = db.pointRecords
        .filter((p) => p.student_id === s.id && p.is_latest)
        .reduce((sum, p) => sum + p.points, 0);

      csvRows.push([
        `"${profile?.full_name || ""}"`,
        `"${s.register_number}"`,
        `"${dept?.name || ""}"`,
        `"${deptType}"`,
        `${s.academic_year}`,
        `${certs.length}`,
        `${approved.length}`,
        `${points}`,
      ]);
    });
  } else if (reportType === "certificates") {
    csvRows.push([
      "Achievement ID",
      "Certificate Title",
      "Student Name",
      "Register Number",
      "Department",
      "Degree Level",
      "Event Name",
      "Category",
      "Event Level",
      "Event Date",
      "Status",
      "Points Awarded",
      "Submitted At",
    ]);

    db.certificates.forEach((c) => {
      const student = db.students.find((s) => s.id === c.student_id);
      const profile = student ? db.profiles.find((p) => p.id === student.profile_id) : undefined;
      const dept = student ? db.departments.find((d) => d.id === student.department_id) : undefined;
      const deptType = dept?.type || "UG";
      if (levelFilter && deptType !== levelFilter) return;

      const cat = db.categories.find((cat) => cat.id === c.category_id);
      const point = db.pointRecords.find((p) => p.certificate_id === c.id && p.is_latest);

      csvRows.push([
        `"${c.achievement_id || "N/A"}"`,
        `"${c.title}"`,
        `"${profile?.full_name || ""}"`,
        `"${student?.register_number || ""}"`,
        `"${dept?.code || ""}"`,
        `"${deptType}"`,
        `"${c.event_name}"`,
        `"${cat?.name || ""}"`,
        `"${c.event_level}"`,
        `"${c.event_date}"`,
        `"${c.status}"`,
        `${point ? point.points : 0}`,
        `"${c.submitted_at || c.created_at}"`,
      ]);
    });
  } else if (reportType === "faculty") {
    csvRows.push([
      "Faculty Name",
      "Employee ID",
      "Department",
      "Degree Level",
      "Designation",
      "Total Reviews Conducted",
      "Approved",
      "Corrections Requested",
      "Rejected",
    ]);

    db.faculty.forEach((f) => {
      const profile = db.profiles.find((p) => p.id === f.profile_id);
      const dept = db.departments.find((d) => d.id === f.department_id);
      const deptType = dept?.type || "UG";
      if (levelFilter && deptType !== levelFilter) return;

      const reviews = db.certificateReviews.filter((r) => r.reviewer_id === f.id);
      const approved = reviews.filter((r) => r.action === "APPROVED").length;
      const corrections = reviews.filter((r) => r.action === "CORRECTION_REQUESTED").length;
      const rejected = reviews.filter((r) => r.action === "REJECTED").length;

      csvRows.push([
        `"${profile?.full_name || ""}"`,
        `"${f.employee_id}"`,
        `"${dept?.code || ""}"`,
        `"${deptType}"`,
        `"${f.designation}"`,
        `${reviews.length}`,
        `${approved}`,
        `${corrections}`,
        `${rejected}`,
      ]);
    });
  }

  const csvContent = csvRows.map((row) => row.join(",")).join("\n");

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
