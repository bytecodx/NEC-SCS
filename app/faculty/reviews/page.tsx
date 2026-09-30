import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate, formatDateTime } from "@/lib/utils/formatters";
import {
  FileCheck2,
  Lock,
  Clock,
  Unlock,
  AlertCircle,
  FileText,
  UserCheck,
} from "lucide-react";

export default async function FacultyReviewsQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await getCurrentUser();
  const db = getDB();
  const params = await searchParams;

  const currentTab = params.tab || "PENDING";
  const deptId = user?.faculty?.department_id;
  const currentFacultyId = user?.faculty?.id;

  const deptStudentIds = new Set(
    db.students.filter((s) => s.department_id === deptId).map((s) => s.id)
  );

  let certificates = db.certificates
    .filter((c) => deptStudentIds.has(c.student_id))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (currentTab === "PENDING") {
    certificates = certificates.filter(
      (c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW"
    );
  } else if (currentTab === "CORRECTIONS") {
    certificates = certificates.filter((c) => c.status === "CORRECTION_REQUIRED");
  } else if (currentTab === "APPROVED") {
    certificates = certificates.filter((c) => c.status === "APPROVED");
  } else if (currentTab === "REJECTED") {
    certificates = certificates.filter((c) => c.status === "REJECTED");
  }

  const enriched = certificates.map((c) => {
    const student = db.students.find((s) => s.id === c.student_id);
    const studentProfile = student ? db.profiles.find((p) => p.id === student.profile_id) : undefined;
    const category = db.categories.find((cat) => cat.id === c.category_id);
    const reviewer = c.reviewer_id ? db.faculty.find((f) => f.id === c.reviewer_id) : undefined;
    const reviewerProfile = reviewer ? db.profiles.find((p) => p.id === reviewer.profile_id) : undefined;
    const files = db.certificateFiles.filter((f) => f.certificate_id === c.id);
    const points = db.pointRecords.find((p) => p.certificate_id === c.id && p.is_latest);

    // Timeout calculation
    const timeoutMinutes = 30;
    const isLockedByOther =
      c.status === "UNDER_REVIEW" && c.reviewer_id && c.reviewer_id !== currentFacultyId;
    let lockExpired = false;
    if (isLockedByOther && c.review_started_at) {
      const elapsedMinutes =
        (Date.now() - new Date(c.review_started_at).getTime()) / (1000 * 60);
      lockExpired = elapsedMinutes >= timeoutMinutes;
    }

    return {
      ...c,
      student: student ? { ...student, profile: studentProfile } : undefined,
      category,
      reviewer: reviewer ? { ...reviewer, profile: reviewerProfile } : undefined,
      files,
      points,
      isLockedByOther,
      lockExpired,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold border border-primary-200/80 mb-2">
          <span>Nandha Engineering College, Erode</span>
          <span className="text-primary-400">•</span>
          <span>Department Evaluation Cell</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Department Verification Workbench
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Evaluate submitted certificates, inspect primary proofs in Full View, and award institutional points.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
        {[
          { key: "PENDING", label: "Action Needed" },
          { key: "CORRECTIONS", label: "Corrections Requested" },
          { key: "APPROVED", label: "Approved Records" },
          { key: "REJECTED", label: "Rejected" },
          { key: "ALL", label: "All Department" },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={`/faculty/reviews?tab=${tab.key}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentTab === tab.key
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Queue Table */}
      {enriched.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-slate-200">
          <FileCheck2 className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700">No submissions found</h4>
          <p className="text-xs text-slate-400 mt-1">
            There are currently no certificates in this filter category for your department.
          </p>
        </Card>
      ) : (
        <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Achievement & Event</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Event &amp; Submission Time</th>
                  <th className="py-3 px-4">Status &amp; Lock</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {enriched.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">
                        {cert.student?.profile?.full_name || "Student"}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400">
                        {cert.student?.register_number}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 truncate">{cert.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {cert.event_name} • {cert.achievement}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                        {cert.category?.name}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="text-xs font-semibold text-slate-800">
                        {formatDate(cert.event_date)}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-primary-500 shrink-0" />
                        <span>Submitted: {formatDateTime(cert.submitted_at || cert.created_at)}</span>
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <StatusBadge status={cert.status} />

                        {cert.status === "APPROVED" && cert.points && (
                          <span className="block text-[10px] font-bold text-emerald-700 font-mono">
                            +{cert.points.points} PTS
                          </span>
                        )}

                        {cert.isLockedByOther && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            <Lock className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[120px]">
                              {cert.reviewer?.profile?.full_name || "Faculty"}
                            </span>
                            {cert.lockExpired && (
                              <span className="text-rose-600 font-bold ml-1">(Expired)</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/faculty/reviews/${cert.id}`}>
                        <Button
                          size="sm"
                          className={`text-xs h-8 ${
                            cert.isLockedByOther && !cert.lockExpired
                              ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                              : "bg-slate-900 hover:bg-slate-800 text-white font-bold"
                          }`}
                        >
                          {cert.isLockedByOther && !cert.lockExpired ? "Inspect" : "Workbench →"}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
