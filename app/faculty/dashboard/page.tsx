import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";
import { StatCards, StatItem } from "@/components/dashboard/StatCards";
import { ActivityFeed, ActivityItem } from "@/components/dashboard/ActivityFeed";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/formatters";
import {
  FileCheck2,
  Clock,
  Award,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building,
  User,
} from "lucide-react";
import { AddStudentModal } from "@/components/students/AddStudentModal";

export default async function FacultyDashboardPage() {
  const user = await getCurrentUser();
  const db = getDB();

  const deptId = user?.faculty?.department_id;
  const deptStudentIds = new Set(
    db.students.filter((s) => s.department_id === deptId).map((s) => s.id)
  );

  const deptCertificates = db.certificates
    .filter((c) => deptStudentIds.has(c.student_id))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const pendingQueue = deptCertificates.filter((c) => c.status === "SUBMITTED");
  const underReview = deptCertificates.filter((c) => c.status === "UNDER_REVIEW");
  const approved = deptCertificates.filter((c) => c.status === "APPROVED");
  const corrections = deptCertificates.filter((c) => c.status === "CORRECTION_REQUIRED");

  const stats: StatItem[] = [
    {
      title: "Pending Queue",
      value: pendingQueue.length,
      description: "Submissions awaiting review",
      iconName: "clock",
      variant: "primary",
    },
    {
      title: "Under Evaluation",
      value: underReview.length,
      description: "Claimed with active lock",
      iconName: "alert",
      variant: "amber",
    },
    {
      title: "Approved Records",
      value: approved.length,
      description: "Points awarded & certified",
      iconName: "check",
      variant: "emerald",
    },
    {
      title: "Corrections Sent",
      value: corrections.length,
      description: "Awaiting student resubmission",
      iconName: "trending",
      variant: "indigo",
    },
  ];

  // Urgent submissions needing faculty review
  const urgentSubmissions = deptCertificates
    .filter((c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW")
    .slice(0, 6)
    .map((c) => {
      const student = db.students.find((s) => s.id === c.student_id);
      const studentProfile = student ? db.profiles.find((p) => p.id === student.profile_id) : undefined;
      const category = db.categories.find((cat) => cat.id === c.category_id);
      const reviewer = c.reviewer_id ? db.faculty.find((f) => f.id === c.reviewer_id) : undefined;
      const reviewerProfile = reviewer ? db.profiles.find((p) => p.id === reviewer.profile_id) : undefined;

      return {
        ...c,
        student: student ? { ...student, profile: studentProfile } : undefined,
        category,
        reviewer: reviewer ? { ...reviewer, profile: reviewerProfile } : undefined,
      };
    });

  // Department activity feed
  const deptAudit = db.auditLogs
    .filter((l) => l.action.startsWith("CERTIFICATE_") || l.action.startsWith("POINTS_"))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const activities: ActivityItem[] = deptAudit.map((l) => {
    let actType: ActivityItem["type"] = "submission";
    if (l.action === "CERTIFICATE_APPROVED") actType = "approval";
    else if (l.action === "CORRECTION_REQUESTED") actType = "correction";
    else if (l.action === "POINTS_AWARDED") actType = "points";

    return {
      id: l.id,
      title: l.action.replace("_", " "),
      description: (l.metadata as any)?.comment || (l.metadata as any)?.title || "Review action processed",
      timestamp: l.created_at,
      type: actType,
      link: `/faculty/reviews/${l.entity_id}`,
    };
  });

  return (
    <div className="space-y-8">
      {/* Faculty Identity Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        {/* Ambient Gradient Glows */}
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-primary-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>NEC Faculty Evaluator • {user?.faculty?.department?.code || "CSE"}</span>
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 text-[11px] font-semibold border border-slate-700">
                Nandha Engineering College
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {user?.profile.full_name}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Designation: <span className="text-emerald-300 font-semibold">{user?.faculty?.designation}</span> • Employee ID:{" "}
              <span className="font-mono font-bold text-amber-300">{user?.faculty?.employee_id}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <AddStudentModal
              defaultDepartmentId={user?.faculty?.department_id}
              defaultDepartmentName={user?.faculty?.department?.name}
              buttonVariant="banner"
              buttonLabel="Add Student"
            />
            <Link href="/faculty/reviews">
              <Button className="bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold h-10 px-4 shadow-lg shadow-primary-900/30">
                <FileCheck2 className="h-4 w-4 mr-1.5" />
                Open Review Queue ({pendingQueue.length + underReview.length})
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Scorecard */}
      <StatCards stats={stats} />

      {/* Department Review Queue Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Active Verification Queue
              </h3>
              <p className="text-xs text-slate-500">
                Department certificates awaiting primary proof evaluation
              </p>
            </div>
            <Link
              href="/faculty/reviews"
              className="text-xs font-bold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
            >
              <span>View full queue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {urgentSubmissions.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-2 border-slate-200">
              <FileCheck2 className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Verification Queue is Empty</p>
              <p className="text-xs text-slate-400 mt-1">
                All submitted certificates in your department have been evaluated.
              </p>
            </Card>
          ) : (
            <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Achievement & Event</th>
                      <th className="py-3 px-4">Status / Lock</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {urgentSubmissions.map((cert) => {
                      const isLockedByOther =
                        cert.status === "UNDER_REVIEW" &&
                        cert.reviewer_id &&
                        cert.reviewer_id !== user?.faculty?.id;

                      return (
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
                            <p className="font-bold text-slate-800 truncate">{cert.title}</p>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                              <span className="truncate">{cert.event_name}</span>
                              <span>•</span>
                              <span className="font-semibold text-slate-600">
                                {cert.category?.name}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <StatusBadge status={cert.status} />
                              {cert.status === "UNDER_REVIEW" && (
                                <p className="text-[10px] text-slate-500 truncate">
                                  {isLockedByOther
                                    ? `Reviewing: ${cert.reviewer?.profile?.full_name || "Faculty"}`
                                    : "Claimed by you"}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <Link href={`/faculty/reviews/${cert.id}`}>
                              <Button
                                size="sm"
                                className="text-xs h-8 bg-slate-900 hover:bg-slate-800 text-white"
                              >
                                {isLockedByOther ? "Inspect" : "Evaluate"}
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
}
