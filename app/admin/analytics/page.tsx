import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { getInstitutionalAnalyticsAction } from "@/actions/admin";
import {
  DepartmentDistributionChart,
  DepartmentMetric,
} from "@/components/charts/DepartmentDistributionChart";
import { CategoryPieChart, CategoryMetric } from "@/components/charts/CategoryPieChart";
import { Card } from "@/components/ui/card";
import { BarChart3, Users, Award, ShieldCheck } from "lucide-react";

export default async function AdminAnalyticsPage() {
  const analytics = await getInstitutionalAnalyticsAction();

  const deptData: DepartmentMetric[] = analytics.certsByDepartment.map((d: any) => ({
    department: `${d.name}${d.type === "PG" ? " (PG)" : ""}`,
    approved: d.approved,
    underReview: d.total - d.approved,
    totalPoints: d.approved * 25, // proportional estimate
  }));

  const categoryData: CategoryMetric[] = analytics.certsByCategory.map((c: any) => ({
    name: c.name,
    value: c.count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Institutional Analytics & Accreditation Metrics
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Campus-wide co-curricular distribution, verification throughput, and faculty workload balance.
        </p>
      </div>

      {/* UG & PG Academic Split KPI Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">UG Branches</span>
          <span className="text-sky-600 font-black text-xl block mt-0.5">{analytics.ugDeptCount} Disciplines</span>
          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">{analytics.ugStudentsCount} Undergraduates</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">PG Programmes</span>
          <span className="text-purple-600 font-black text-xl block mt-0.5">{analytics.pgDeptCount} Programmes</span>
          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">{analytics.pgStudentsCount} Postgraduate Scholars</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Credentials</span>
          <span className="text-slate-900 font-black text-xl block mt-0.5">{analytics.totalCertificates} Submissions</span>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">{analytics.approvedCount} Verified Approved</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Accredited Points</span>
          <span className="text-amber-600 font-black text-xl block mt-0.5">{analytics.totalPointsAwarded} PTS</span>
          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">Institution-Wide Total</span>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DepartmentDistributionChart
          data={deptData}
          title="Department Achievement Volume"
          subtitle="Total submitted vs verified credentials across branches"
        />

        <CategoryPieChart
          data={categoryData}
          title="College Category Breakdown"
          subtitle="Taxonomy distribution of recognized co-curricular credentials"
        />
      </div>

      {/* Faculty Evaluation Workload Audit */}
      <Card className="p-6 border-slate-200 bg-white space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4 text-primary-600" />
            <span>Faculty Verification Activity & Review Audit</span>
          </h3>
          <p className="text-xs text-slate-500">
            Workload distribution and evaluation determinations conducted by departmental faculty.
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">Total Reviews</th>
                <th className="py-3 px-4">Approved</th>
                <th className="py-3 px-4">Corrections Requested</th>
                <th className="py-3 px-4">Rejected</th>
                <th className="py-3 px-4 text-right">Approval Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {analytics.facultyActivity.map((f: any, i: number) => {
                const approvalRate =
                  f.totalReviews > 0 ? Math.round((f.approved / f.totalReviews) * 100) : 0;

                return (
                  <tr key={i} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-bold text-slate-900">{f.name}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {f.totalReviews}
                    </td>
                    <td className="py-3 px-4 text-emerald-700 font-semibold">
                      {f.approved}
                    </td>
                    <td className="py-3 px-4 text-amber-700 font-semibold">
                      {f.corrections}
                    </td>
                    <td className="py-3 px-4 text-rose-700 font-semibold">
                      {f.rejected}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-700">
                      {approvalRate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
