import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Download, ShieldCheck, FileCheck2, Users, Award } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Accreditation & Institutional Reports
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate accredited CSV datasets for NAAC, NBA, NIRF, AICTE compliance, and university audits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Report 1: Certificates Ledger */}
        <Card className="p-6 border-slate-200 bg-white flex flex-col justify-between space-y-4">
          <div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Verified Achievement Records Ledger
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Complete college-wide ledger of all approved and verified achievements, including Achievement IDs, event titles, categories, dates, and awarded points.
            </p>
          </div>

          <a href="/api/reports/export?type=certificates" download>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 shadow-sm flex items-center justify-center gap-2">
              <Download className="h-4 w-4" />
              <span>Download Achievements CSV</span>
            </Button>
          </a>
        </Card>

        {/* Report 2: Student Matrix */}
        <Card className="p-6 border-slate-200 bg-white flex flex-col justify-between space-y-4">
          <div>
            <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-3">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Student Co-Curricular Matrix (NAAC 5.3)
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Enrolled students with their departments, register numbers, approved submission counts, and cumulative verified co-curricular credit standings.
            </p>
          </div>

          <a href="/api/reports/export?type=students" download>
            <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs h-10 shadow-sm flex items-center justify-center gap-2">
              <Download className="h-4 w-4" />
              <span>Download Student Matrix CSV</span>
            </Button>
          </a>
        </Card>

        {/* Report 3: Faculty Workload */}
        <Card className="p-6 border-slate-200 bg-white flex flex-col justify-between space-y-4">
          <div>
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Faculty Evaluator Audit Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Verification workload distribution across departments, count of approved submissions, corrections requested, and rejections conducted by each faculty reviewer.
            </p>
          </div>

          <a href="/api/reports/export?type=faculty" download>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 shadow-sm flex items-center justify-center gap-2">
              <Download className="h-4 w-4" />
              <span>Download Faculty Audit CSV</span>
            </Button>
          </a>
        </Card>
      </div>
    </div>
  );
}
