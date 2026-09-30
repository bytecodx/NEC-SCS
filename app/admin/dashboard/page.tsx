import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";
import { StatCards, StatItem } from "@/components/dashboard/StatCards";
import {
  DepartmentDistributionChart,
  DepartmentMetric,
} from "@/components/charts/DepartmentDistributionChart";
import { CategoryPieChart, CategoryMetric } from "@/components/charts/CategoryPieChart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils/formatters";
import {
  Building2,
  Users,
  Award,
  FileCheck2,
  FileSpreadsheet,
  ShieldCheck,
  Settings,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  FolderTree,
} from "lucide-react";

import { RoleSwitcherDropdown, SeparateRoleBar } from "@/components/layout/RoleSwitcherDropdown";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  const db = getDB();

  const collegeId = user?.profile.college_id;
  const college = db.colleges.find((c) => c.id === collegeId);

  const totalStudents = db.students.filter((s) => s.college_id === collegeId).length;
  const totalFaculty = db.faculty.filter((f) => f.college_id === collegeId).length;
  const allCerts = db.certificates.filter((c) => c.college_id === collegeId);
  const approvedCerts = allCerts.filter((c) => c.status === "APPROVED");
  const pendingCerts = allCerts.filter(
    (c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW"
  );

  const totalPoints = db.pointRecords
    .filter((p) => p.is_latest)
    .reduce((sum, p) => sum + p.points, 0);

  const stats: StatItem[] = [
    {
      title: "Enrolled Students",
      value: totalStudents,
      description: "Across all academic departments",
      iconName: "award",
      variant: "primary",
    },
    {
      title: "Faculty Evaluators",
      value: totalFaculty,
      description: "Department review coordinators",
      iconName: "trending",
      variant: "indigo",
    },
    {
      title: "Certified Achievements",
      value: approvedCerts.length,
      description: "Verified institutional credentials",
      iconName: "check",
      variant: "emerald",
    },
    {
      title: "Institutional Credits",
      value: `${totalPoints} PTS`,
      description: "Points awarded college-wide",
      iconName: "award",
      variant: "amber",
    },
  ];

  // Department distribution data for bar chart
  const deptData: DepartmentMetric[] = db.departments
    .filter((d) => d.college_id === collegeId)
    .map((d) => {
      const studentIds = new Set(
        db.students.filter((s) => s.department_id === d.id).map((s) => s.id)
      );
      const approved = allCerts.filter(
        (c) => studentIds.has(c.student_id) && c.status === "APPROVED"
      ).length;
      const underReview = allCerts.filter(
        (c) =>
          studentIds.has(c.student_id) &&
          (c.status === "SUBMITTED" || c.status === "UNDER_REVIEW")
      ).length;
      const deptPoints = db.pointRecords
        .filter((p) => studentIds.has(p.student_id) && p.is_latest)
        .reduce((sum, p) => sum + p.points, 0);

      return {
        department: `${d.code}${d.type === "PG" ? " (PG)" : ""}`,
        approved,
        underReview,
        totalPoints: deptPoints,
      };
    });

  // Category data for pie chart
  const categoryCounts: Record<string, number> = {};
  allCerts.forEach((c) => {
    const cat = db.categories.find((cat) => cat.id === c.category_id)?.name || "Other";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const categoryData: CategoryMetric[] = Object.entries(categoryCounts).map(
    ([name, value]) => ({ name, value })
  );

  // Recent system audit events
  const recentAudit = db.auditLogs
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Standalone Dedicated Role Switcher (Non-nested, Clean Bar) */}
      <SeparateRoleBar currentRole={user?.profile.role || "ADMIN"} />

      {/* Admin Executive Identity Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        {/* Ambient Gradient Glows */}
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 text-xs font-bold border border-amber-500/30 shadow-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                <span>Executive Command Center • NEC</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Session 2025–2026 Live</span>
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="h-13 w-22 rounded-2xl bg-white p-1 shadow-md border border-slate-700/60 shrink-0 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/nec-logo.png"
                  alt="Nandha Engineering College Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Nandha Engineering College (NEC)
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5 max-w-xl leading-relaxed">
                  Institutional Credential & Achievement Management System • Dean & Administrator Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="text-slate-200 font-semibold">{user?.profile.full_name}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">{user?.profile.email}</span>
              </span>
            </div>
          </div>

          {/* Executive Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/admin/departments">
              <Button variant="outline" className="border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs h-10 shadow-sm">
                <Building2 className="h-4 w-4 mr-1.5 text-sky-400" />
                Engineering Branches
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button variant="outline" className="border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs h-10 shadow-sm">
                <FileSpreadsheet className="h-4 w-4 mr-1.5 text-emerald-400" />
                Accreditation Reports
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button className="bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold h-10 shadow-md transition-all">
                <Settings className="h-4 w-4 mr-1.5" />
                NEC Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Institutional Accreditation Readiness KPI Strip */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">NAAC Criteria 5</span>
            <span className="text-emerald-400 font-bold text-sm flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> 100% Export Ready
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">NBA Tier-1 Status</span>
            <span className="text-sky-400 font-bold text-sm flex items-center gap-1 mt-0.5">
              <Sparkles className="h-3.5 w-3.5" /> Outcome Verified
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">SHA-256 Duplicates</span>
            <span className="text-emerald-400 font-bold text-sm flex items-center gap-1 mt-0.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Zero Conflict Flags
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">System Verification</span>
            <span className="text-amber-300 font-bold text-sm flex items-center gap-1 mt-0.5">
              <Award className="h-3.5 w-3.5" /> 100% Faculty Evaluated
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Scorecard */}
      <StatCards stats={stats} />

      {/* Executive Quick Launchpad */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              NEC Administrative Launchpad
            </h3>
            <p className="text-xs text-slate-500">
              Direct access to departmental configurations, reviewer queues, and reports
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/users"
            className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-primary-400 hover:shadow-md transition-all duration-200 group block"
          >
            <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-primary-200/60">
              <Users className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
              User & Faculty Directory
            </h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Manage student registries, assign department faculty reviewers, and manage permissions.
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary-600">
              <span>Manage users</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/departments"
            className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-md transition-all duration-200 group block"
          >
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-indigo-200/60">
              <Building2 className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Department Governance
            </h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Oversee departmental isolation, point caps, reviewer lock timeouts, and HOD assignments.
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-indigo-600">
              <span>Departments</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-400 hover:shadow-md transition-all duration-200 group block"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-emerald-200/60">
              <FolderTree className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Achievement Categories
            </h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Configure co-curricular classifications: Hackathons, Research, Technical, Sports, and Arts.
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <span>Classifications</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/reports"
            className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-400 hover:shadow-md transition-all duration-200 group block"
          >
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-amber-200/60">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
              Accreditation Reports
            </h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              1-click export of verified student records formatted for NAAC Criteria 5 & NBA accreditation.
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-amber-600">
              <span>Export CSV</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DepartmentDistributionChart
          data={deptData}
          title="Institutional Achievements by Department"
          subtitle="Comparison of approved credentials, reviews, and points awarded"
        />

        <CategoryPieChart
          data={categoryData}
          title="College Category Distribution"
          subtitle="Proportion of credentials across co-curricular classifications"
        />
      </div>

      {/* Audit Logs & College Settings Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5 border-slate-200 bg-white rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-primary-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recent Immutable Audit Trail
              </h3>
            </div>
            <Link
              href="/admin/audit-logs"
              className="text-xs font-bold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
            >
              <span>Full audit log</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentAudit.map((log) => {
              const actor = db.profiles.find((p) => p.id === log.actor_id);
              const actionColors: Record<string, string> = {
                LOGIN: "bg-sky-50 text-sky-700 border-sky-200",
                CERTIFICATE_APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
                POINTS_AWARDED: "bg-amber-50 text-amber-700 border-amber-200",
                CERTIFICATE_SUBMITTED: "bg-indigo-50 text-indigo-700 border-indigo-200",
                CORRECTION_REQUESTED: "bg-rose-50 text-rose-700 border-rose-200",
              };
              const badgeStyle = actionColors[log.action] || "bg-slate-100 text-slate-700 border-slate-200";

              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-xs hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded-md border ${badgeStyle}`}>
                      {log.action}
                    </span>
                    <div>
                      <span className="text-slate-800 font-semibold">
                        {actor?.full_name || "System"}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Entity: <span className="font-mono text-slate-600">{log.entity_type}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                    {formatDateTime(log.created_at)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Institution Highlights Card */}
        <Card className="p-5 border-slate-200 bg-white rounded-2xl shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                NEC Governance
              </h3>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Institution</span>
                <span className="font-bold text-slate-900 text-sm">Nandha Engineering College</span>
                <p className="text-slate-500 text-[11px] mt-0.5">Erode, Tamil Nadu • Autonomous</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Policy Max Points / Cert</span>
                <span className="font-bold text-slate-900 text-sm">100 Points Cap</span>
                <p className="text-slate-500 text-[11px] mt-0.5">Automated clamp enforces NAAC distribution caps</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Review Lock Timeout</span>
                <span className="font-bold text-slate-900 text-sm">30 Minutes</span>
                <p className="text-slate-500 text-[11px] mt-0.5">Auto-reclaims idle locks back to review queue</p>
              </div>
            </div>
          </div>

          <Link href="/admin/settings" className="block w-full">
            <Button variant="outline" className="w-full text-xs font-bold border-slate-200 hover:bg-slate-50">
              <Settings className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
              Configure College Policy
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
