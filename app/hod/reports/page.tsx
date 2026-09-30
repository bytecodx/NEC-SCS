import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Download, ShieldCheck, FileCheck2, Users } from "lucide-react";

export default function HODReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Department Accreditation Reports & CSV Exporters
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate accredited institutional datasets for NAAC, NBA, NIRF, and academic audit committees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-slate-200 bg-white flex flex-col justify-between space-y-4">
          <div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Verified Achievement Records Ledger
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Export all departmental certificate records, including unique Achievement IDs, student register numbers, event dates, faculty award points, and verification timestamps.
            </p>
          </div>

          <a href="/api/reports/export?type=certificates" download>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 shadow-sm flex items-center justify-center gap-2">
              <Download className="h-4 w-4" />
              <span>Download Achievements CSV</span>
            </Button>
          </a>
        </Card>

        <Card className="p-6 border-slate-200 bg-white flex flex-col justify-between space-y-4">
          <div>
            <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-3">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Student Co-Curricular Summary Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Comprehensive student credit standings, total approved achievements, and cumulative points earned for NAAC Criteria 5.3 (Student Participation and Activities).
            </p>
          </div>

          <a href="/api/reports/export?type=students" download>
            <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs h-10 shadow-sm flex items-center justify-center gap-2">
              <Download className="h-4 w-4" />
              <span>Download Student Matrix CSV</span>
            </Button>
          </a>
        </Card>
      </div>
    </div>
  );
}
