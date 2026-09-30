import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";
import { StatCards, StatItem } from "@/components/dashboard/StatCards";
import { CertificateCard } from "@/components/certificates/CertificateCard";
import { ActivityFeed, ActivityItem } from "@/components/dashboard/ActivityFeed";
import { Button } from "@/components/ui/button";
import { UploadCloud, ArrowRight, Award, Sparkles } from "lucide-react";
import { MobileAppShowcase } from "@/components/mobile/MobileAppShowcase";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  const db = getDB();

  const studentId = user?.student?.id;
  const certificates = db.certificates
    .filter((c) => c.student_id === studentId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const approved = certificates.filter((c) => c.status === "APPROVED");
  const underReview = certificates.filter((c) => c.status === "UNDER_REVIEW" || c.status === "SUBMITTED");
  const corrections = certificates.filter((c) => c.status === "CORRECTION_REQUIRED");

  // Sum total points
  const studentPoints = db.pointRecords
    .filter((p) => p.student_id === studentId)
    .reduce((sum, p) => sum + p.points, 0);

  const stats: StatItem[] = [
    {
      title: "Co-Curricular Points",
      value: `${studentPoints} PTS`,
      description: "Human-verified by faculty",
      iconName: "award",
      variant: "amber",
    },
    {
      title: "Approved Achievements",
      value: approved.length,
      description: "Official institutional records",
      iconName: "check",
      variant: "emerald",
    },
    {
      title: "In Review Queue",
      value: underReview.length,
      description: "Pending faculty evaluation",
      iconName: "clock",
      variant: "primary",
    },
    {
      title: "Action Required",
      value: corrections.length,
      description: "Revision requested by faculty",
      iconName: "alert",
      variant: "rose",
    },
  ];

  // Activities for this student
  const studentNotifications = db.notifications
    .filter((n) => n.user_id === user?.profile.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const activities: ActivityItem[] = studentNotifications.map((n) => ({
    id: n.id,
    title: n.title,
    description: n.message,
    timestamp: n.created_at,
    type: n.type.includes("APPROVED")
      ? "approval"
      : n.type.includes("CORRECTION")
      ? "correction"
      : "submission",
    link: n.entity_id ? `/student/certificates/${n.entity_id}` : undefined,
  }));

  // Map certificates with category, files, points
  const recentCerts = certificates.slice(0, 4).map((c) => ({
    ...c,
    category: db.categories.find((cat) => cat.id === c.category_id),
    files: db.certificateFiles.filter((f) => f.certificate_id === c.id),
    points: db.pointRecords.filter((p) => p.certificate_id === c.id),
  }));

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        {/* Ambient Gradient Glows */}
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-bold border border-primary-500/30">
                <Sparkles className="h-3.5 w-3.5 text-primary-400" />
                <span>NEC Student Portal</span>
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 text-[11px] font-semibold border border-slate-700">
                Year {user?.student?.academic_year || 3} • {user?.student?.department?.code || "CSE"}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome, {user?.profile.full_name}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Nandha Engineering College • Register No:{" "}
              <span className="font-mono font-bold text-amber-300">{user?.student?.register_number}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/student/profile">
              <Button variant="outline" className="border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs h-10 shadow-sm">
                <Award className="h-4 w-4 mr-1.5 text-amber-400" />
                Digital Passport
              </Button>
            </Link>
            <Link href="/student/submit">
              <Button className="bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold h-10 shadow-md">
                <UploadCloud className="h-4 w-4 mr-1.5" />
                Submit Certificate
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Scorecard */}
      <StatCards stats={stats} />

      {/* Main Grid: Recent Submissions & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Submissions</h3>
              <p className="text-xs text-slate-500">Track current status of your submitted achievements</p>
            </div>
            <Link
              href="/student/certificates"
              className="text-xs font-bold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
            >
              <span>View all ({certificates.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentCerts.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-2xs">
              <UploadCloud className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No certificates submitted yet</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Submit your first certificate for faculty review and institutional credit.
              </p>
              <Link href="/student/submit">
                <Button className="bg-primary-600 hover:bg-primary-700 text-xs text-white">
                  Submit Now
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentCerts.map((cert) => (
                <CertificateCard key={cert.id} certificate={cert} />
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          <ActivityFeed activities={activities} />
        </div>
      </div>

      {/* Interactive Mobile App Showcase */}
      <MobileAppShowcase variant="embedded" />
    </div>
  );
}
