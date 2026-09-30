import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";
import { CategoryPieChart, CategoryMetric } from "@/components/charts/CategoryPieChart";
import { Card } from "@/components/ui/card";
import { BarChart3, Award, Globe, TrendingUp } from "lucide-react";

export default async function HODAnalyticsPage() {
  const user = await getCurrentUser();
  const db = getDB();

  const deptId = user?.faculty?.department_id;
  const deptStudentIds = new Set(
    db.students.filter((s) => s.department_id === deptId).map((s) => s.id)
  );

  const deptCertificates = db.certificates.filter((c) => deptStudentIds.has(c.student_id));

  // Category counts
  const catCounts: Record<string, number> = {};
  deptCertificates.forEach((c) => {
    const cat = db.categories.find((cat) => cat.id === c.category_id)?.name || "Other";
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  });
  const categoryData: CategoryMetric[] = Object.entries(catCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Level counts
  const levelCounts: Record<string, number> = {};
  deptCertificates.forEach((c) => {
    levelCounts[c.event_level] = (levelCounts[c.event_level] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Department Analytics & Participation Metrics
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          High-level distribution of student participation across competitions, hackathons, and certifications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <CategoryPieChart
          data={categoryData}
          title="Achievement Distribution by Category"
          subtitle="Proportion of verified achievements across recognized categories"
        />

        {/* Event Level Breakdown */}
        <Card className="p-6 border-slate-200 bg-white space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Event Stature & Competition Tiers
            </h3>
            <p className="text-xs text-slate-500">
              Breakdown by competitive event tier and geographical scope
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: "International Level", key: "INTERNATIONAL", color: "bg-purple-600" },
              { label: "National Level", key: "NATIONAL", color: "bg-primary-600" },
              { label: "State Level", key: "STATE", color: "bg-emerald-600" },
              { label: "Inter-College", key: "INTER_COLLEGE", color: "bg-amber-600" },
              { label: "Intra-College", key: "INTRA_COLLEGE", color: "bg-sky-600" },
              { label: "College Level", key: "COLLEGE", color: "bg-slate-600" },
            ].map((tier) => {
              const count = levelCounts[tier.key] || 0;
              const percent =
                deptCertificates.length > 0
                  ? Math.round((count / deptCertificates.length) * 100)
                  : 0;

              return (
                <div key={tier.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>{tier.label}</span>
                    <span className="font-mono text-slate-500">
                      {count} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full ${tier.color} rounded-full transition-all`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
