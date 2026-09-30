import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building,
  ArrowRight,
  Printer,
} from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";

export default async function StudentAchievementWalletPage() {
  const user = await getCurrentUser();
  const db = getDB();

  const studentId = user?.student?.id;
  const approvedCerts = db.certificates
    .filter((c) => c.student_id === studentId && c.status === "APPROVED")
    .map((c) => ({
      ...c,
      category: db.categories.find((cat) => cat.id === c.category_id),
      points: db.pointRecords.find((p) => p.certificate_id === c.id && p.is_latest)?.points || 0,
    }))
    .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

  const totalPoints = approvedCerts.reduce((acc, c) => acc + c.points, 0);

  // Milestone tier calculation
  let tier = "Bronze";
  let nextTier = "Silver";
  let target = 50;
  let tierColor = "from-amber-600 to-amber-700";

  if (totalPoints >= 200) {
    tier = "Platinum";
    nextTier = "Max Tier";
    target = 250;
    tierColor = "from-indigo-600 to-purple-600";
  } else if (totalPoints >= 100) {
    tier = "Gold";
    nextTier = "Platinum";
    target = 200;
    tierColor = "from-amber-500 to-yellow-500";
  } else if (totalPoints >= 50) {
    tier = "Silver";
    nextTier = "Gold";
    target = 100;
    tierColor = "from-slate-400 to-slate-600";
  }

  const progressPercent = Math.min(Math.round((totalPoints / target) * 100), 100);

  return (
    <div className="space-y-8">
      {/* Wallet Header Card */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-400 text-xs font-bold mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{tier} Recognition Tier</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Institutional Achievement Wallet
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-md leading-relaxed">
              Official faculty-certified co-curricular achievements and verified institutional points for {user?.profile.full_name}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-right">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Verified Points Balance
              </p>
              <div className="text-3xl font-black text-amber-400 mt-0.5">
                {totalPoints} <span className="text-xs font-semibold text-slate-300">PTS</span>
              </div>
            </div>

            <Link href="/student/profile">
              <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs h-12 px-4 shadow-lg">
                <Printer className="h-4 w-4 mr-1.5" />
                Print Passport
              </Button>
            </Link>
          </div>
        </div>

        {/* Tier Progress Bar */}
        <div className="relative z-10 mt-6 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300">
              Tier Progress: <span className="text-white font-bold">{tier}</span> → {nextTier}
            </span>
            <span className="font-mono text-amber-400 font-bold">
              {totalPoints} / {target} PTS ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${tierColor} transition-all duration-500`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Verified Achievements List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Faculty-Verified Records ({approvedCerts.length})
            </h3>
            <p className="text-xs text-slate-500">
              Credentials that have completed formal inspection and point awards
            </p>
          </div>
        </div>

        {approvedCerts.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 border-slate-200">
            <Award className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700">No verified achievements yet</h4>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Certificates currently in review will appear here once approved by faculty.
            </p>
            <Link href="/student/submit">
              <Button className="bg-primary-600 hover:bg-primary-700 text-xs text-white">
                Submit a Certificate
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvedCerts.map((cert) => (
              <Link
                key={cert.id}
                href={`/student/certificates/${cert.id}`}
                className="block group h-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-xl transition-all"
              >
                <Card className="h-full p-5 border-slate-200 group-hover:border-primary-300 group-hover:shadow-md transition-all bg-white relative overflow-hidden flex flex-col justify-between cursor-pointer">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                        {cert.category?.name}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {cert.achievement_id}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">{cert.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {cert.event_name} • {cert.organizer}
                    </p>

                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-amber-500" />
                        <span className="font-semibold text-slate-800">{cert.achievement}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{formatDate(cert.event_date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      +{cert.points} PTS Awarded
                    </span>

                    <div className="text-xs font-semibold text-primary-600 group-hover:text-primary-700 group-hover:translate-x-0.5 transition-all inline-flex items-center gap-1">
                      <span>View Record</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
