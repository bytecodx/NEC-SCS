import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";
import { StatCards, StatItem } from "@/components/dashboard/StatCards";
import { CategoryPieChart, CategoryMetric } from "@/components/charts/CategoryPieChart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Building2,
  FileCheck2,
  Users,
  Award,
  FileSpreadsheet,
  BarChart3,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { AddStudentModal } from "@/components/students/AddStudentModal";

export default async function HODDashboardPage() {
  const user = await getCurrentUser();
  const db = getDB();

  const deptId = user?.faculty?.department_id;
  const deptStudentIds = new Set(
    db.students.filter((s) => s.department_id === deptId).map((s) => s.id)
  );

  const deptFaculty = db.faculty.filter((f) => f.department_id === deptId);
  const deptCertificates = db.certificates.filter((c) => deptStudentIds.has(c.student_id));
  const approved = deptCertificates.filter((c) => c.status === "APPROVED");
  const inQueue = deptCertificates.filter(
    (c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW"
  );

  const totalPoints = db.pointRecords
    .filter((p) => deptStudentIds.has(p.student_id) && p.is_latest)
    .reduce((sum, p) => sum + p.points, 0);

  const stats: StatItem[] = [
    {
      title: "Department Points",
      value: `${totalPoints} PTS`,
      description: "Verified co-curricular points",
      iconName: "award",
      variant: "amber",
    },
    {
      title: "Approved Records",
      value: approved.length,
      description: "Officially certified",
      iconName: "check",
      variant: "emerald",
    },
    {
      title: "Queue Pending",
      value: inQueue.length,
      description: "Awaiting faculty evaluation",
      iconName: "clock",
      variant: "primary",
    },
    {
      title: "Faculty Evaluators",
      value: deptFaculty.length,
      description: "Assigned departmental reviewers",
      iconName: "trending",
      variant: "indigo",
    },
  ];

  // Category breakdown for chart
  const categoryCounts: Record<string, number> = {};
  deptCertificates.forEach((c) => {
    const cat = db.categories.find((cat) => cat.id === c.category_id)?.name || "Other";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categoryData: CategoryMetric[] = Object.entries(categoryCounts).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        {/* Ambient Gradient Glows */}
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-primary-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                <span>NEC Department Head • {user?.faculty?.department?.code}</span>
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 text-[11px] font-semibold border border-slate-700">
                Nandha Engineering College
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {user?.profile.full_name}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Head of Department — <span className="text-indigo-300 font-semibold">{user?.faculty?.department?.name}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <AddStudentModal
              defaultDepartmentId={deptId}
              defaultDepartmentName={user?.faculty?.department?.name}
              buttonVariant="banner"
              buttonLabel="Add Student"
            />
            <Link href="/hod/reports">
              <Button variant="outline" className="border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs h-10 shadow-sm">
                <FileSpreadsheet className="h-4 w-4 mr-1.5 text-emerald-400" />
                Department CSV Export
              </Button>
            </Link>
            <Link href="/faculty/reviews">
              <Button className="bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold h-10 shadow-md">
                <FileCheck2 className="h-4 w-4 mr-1.5" />
                Review Workbench ({inQueue.length})
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <StatCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Category Breakdown */}
        <CategoryPieChart
          data={categoryData}
          title="Department Achievement Categories"
          subtitle="Distribution of student achievements across co-curricular categories"
        />

        {/* Quick Nav & Department Faculty */}
        <div className="space-y-4">
          <Card className="p-5 border-slate-200 bg-white">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Department Faculty Reviewers ({deptFaculty.length})
            </h3>
            <div className="space-y-2.5">
              {deptFaculty.map((f) => {
                const profile = db.profiles.find((p) => p.id === f.profile_id);
                return (
                  <div
                    key={f.id}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{profile?.full_name}</p>
                      <p className="text-[11px] text-slate-500">
                        {f.designation} • ID: <span className="font-mono">{f.employee_id}</span>
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5 border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Reports & Accreditations
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Export NAAC / NBA ready verified achievement ledgers for criteria 3.3 and 5.3 audits.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/hod/reports" className="w-full">
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold h-9">
                  Generate Department Ledger CSV
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
