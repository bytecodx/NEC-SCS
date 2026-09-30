import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";
import { StatusBadge } from "@/components/ui/status-badge";
import { SecureViewer } from "@/components/certificates/SecureViewer";
import { TimelineJourney } from "@/components/certificates/TimelineJourney";
import { CorrectionForm } from "@/components/forms/CorrectionForm";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  Building,
  Award,
  Globe,
  FileText,
  AlertTriangle,
  Sparkles,
  Clock,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils/formatters";

export default async function StudentCertificateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  const db = getDB();
  const { id } = await params;

  const certificate = db.certificates.find((c) => c.id === id);
  if (!certificate || certificate.student_id !== user?.student?.id) {
    notFound();
  }

  const category = db.categories.find((c) => c.id === certificate.category_id);
  const files = db.certificateFiles.filter((f) => f.certificate_id === certificate.id);
  const reviews = db.certificateReviews
    .filter((r) => r.certificate_id === certificate.id)
    .map((r) => {
      const reviewer = db.faculty.find((f) => f.id === r.reviewer_id);
      const reviewerProfile = reviewer ? db.profiles.find((p) => p.id === reviewer.profile_id) : undefined;
      return {
        ...r,
        reviewer: reviewer ? { ...reviewer, profile: reviewerProfile } : undefined,
      };
    });
  const points = db.pointRecords.filter((p) => p.certificate_id === certificate.id);
  const latestPoints = points.find((p) => p.is_latest);

  // Check duplicate flag for the primary file
  const primaryFile = files.find((f) => f.file_type === "PRIMARY");
  const isDuplicateFlagged = primaryFile
    ? db.certificateFiles.some(
        (f) => f.id !== primaryFile.id && f.file_hash === primaryFile.file_hash
      )
    : false;

  const latestCorrectionReview = reviews
    .filter((r) => r.action === "CORRECTION_REQUESTED")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  const categories = db.categories.filter((c) => c.college_id === user?.profile.college_id);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/student/certificates"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Certificates
        </Link>
      </div>

      {/* Hero Header Card */}
      <Card className="p-6 border-slate-200 shadow-2xs bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {category?.name || "General"}
              </span>
              <StatusBadge status={certificate.status} />
              {certificate.achievement_id && (
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300">
                  {certificate.achievement_id}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {certificate.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {certificate.event_name} • Organised by {certificate.organizer}
            </p>
          </div>

          {/* Points Banner if Approved */}
          {certificate.status === "APPROVED" && latestPoints && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-right shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Institutional Award
              </span>
              <div className="text-2xl font-black text-emerald-700 flex items-center justify-end gap-1 mt-0.5">
                <Award className="h-6 w-6 text-emerald-600" />
                <span>+{latestPoints.points} PTS</span>
              </div>
              <p className="text-[10px] text-emerald-600 mt-0.5">Verified by Faculty</p>
            </div>
          )}
        </div>

        {/* Key Event Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Standing / Rank</span>
            <span className="font-bold text-slate-800">{certificate.achievement}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Event Level</span>
            <span className="font-bold text-slate-800 capitalize">
              {certificate.event_level.toLowerCase().replace("_", " ")}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Event Date</span>
            <span className="font-bold text-slate-800">{formatDate(certificate.event_date)}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium flex items-center gap-1">
              <Clock className="h-3 w-3 text-primary-500" />
              <span>Requested &amp; Submitted</span>
            </span>
            <span className="font-bold text-slate-800 font-mono text-[11px] block mt-0.5">
              {formatDateTime(certificate.submitted_at || certificate.created_at)}
            </span>
          </div>
        </div>

        {certificate.description && (
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <span className="font-bold text-slate-700 block mb-1">Project Abstract / Notes:</span>
            <p className="leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {certificate.description}
            </p>
          </div>
        )}
      </Card>

      {/* Correction Form if Status is CORRECTION_REQUIRED */}
      {certificate.status === "CORRECTION_REQUIRED" && (
        <CorrectionForm
          certificate={certificate}
          latestReview={latestCorrectionReview}
          categories={categories}
        />
      )}

      {/* Two Column Layout: Document Viewer & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Viewer (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Uploaded Evidence Document
          </h3>
          <SecureViewer
            files={files}
            title={certificate.title}
            isDuplicateFlagged={isDuplicateFlagged}
          />
        </div>

        {/* Timeline Journey (1 col) */}
        <div className="space-y-4">
          <Card className="p-5 border-slate-200 bg-white">
            <TimelineJourney
              certificate={certificate}
              reviews={reviews}
              points={points}
              studentName={user?.profile.full_name}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
