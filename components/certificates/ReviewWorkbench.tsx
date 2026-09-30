"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Certificate,
  CertificateFile,
  CertificateReview,
  PointRecord,
  Category,
  Student,
  Profile,
  Faculty,
} from "@/types/database.types";
import { SecureViewer } from "./SecureViewer";
import { TimelineJourney } from "./TimelineJourney";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ApproveModal,
  RequestCorrectionModal,
  RejectModal,
} from "./ReviewWorkbenchModals";
import { claimCertificateForReviewAction } from "@/actions/reviews";
import { formatDate, formatDateTime } from "@/lib/utils/formatters";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lock,
  Unlock,
  Award,
  Calendar,
  Building,
  GraduationCap,
  ShieldCheck,
  User,
  Clock,
} from "lucide-react";

interface ReviewWorkbenchProps {
  certificate: Certificate;
  student: Student & { profile?: Profile };
  category?: Category;
  files: CertificateFile[];
  reviews: (CertificateReview & { reviewer?: { profile?: Profile } })[];
  points: PointRecord[];
  currentFacultyId: string;
  maxPointsPerCertificate: number;
  reviewerTimeoutMinutes: number;
  isDuplicateFlagged: boolean;
}

export function ReviewWorkbench({
  certificate,
  student,
  category,
  files,
  reviews,
  points,
  currentFacultyId,
  maxPointsPerCertificate,
  reviewerTimeoutMinutes,
  isDuplicateFlagged,
}: ReviewWorkbenchProps) {
  const router = useRouter();

  // Modals state
  const [showApprove, setShowApprove] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reclaiming, setReclaiming] = useState(false);
  const [reclaimError, setReclaimError] = useState<string | null>(null);

  // Reviewer lock determination
  const isUnderReview = certificate.status === "UNDER_REVIEW";
  const isLockedByMe = isUnderReview && certificate.reviewer_id === currentFacultyId;
  const isLockedByOther =
    isUnderReview && certificate.reviewer_id && certificate.reviewer_id !== currentFacultyId;

  // Check timeout
  let lockExpired = false;
  let elapsedMinutes = 0;
  if (isLockedByOther && certificate.review_started_at) {
    elapsedMinutes = Math.floor(
      (Date.now() - new Date(certificate.review_started_at).getTime()) / (1000 * 60)
    );
    lockExpired = elapsedMinutes >= reviewerTimeoutMinutes;
  }

  const handleClaim = async () => {
    setReclaiming(true);
    setReclaimError(null);
    try {
      const res = await claimCertificateForReviewAction(certificate.id);
      if (!res.success) {
        setReclaimError(res.error || "Failed to acquire review lock");
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setReclaimError(err?.message || "An error occurred");
    } finally {
      setReclaiming(false);
    }
  };

  const handleActionSuccess = () => {
    router.refresh();
  };

  const canPerformActions =
    (certificate.status === "SUBMITTED" || isLockedByMe) &&
    certificate.status !== "APPROVED" &&
    certificate.status !== "REJECTED";

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Lock Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/faculty/reviews"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Review Queue
        </Link>

        <div className="flex items-center gap-2">
          <StatusBadge status={certificate.status} />
          {certificate.achievement_id && (
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {certificate.achievement_id}
            </span>
          )}
        </div>
      </div>

      {/* Reviewer Lock Alert Banners */}
      {isLockedByOther && !lockExpired && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <Lock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <span className="font-bold">Active Review Lock:</span> Another faculty member is currently evaluating this submission (elapsed: {elapsedMinutes} mins). To ensure evaluation integrity, review decisions are locked until completion or timeout ({reviewerTimeoutMinutes} min).
          </div>
        </div>
      )}

      {isLockedByOther && lockExpired && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 flex items-center justify-between gap-3">
          <div className="flex items-start gap-3 text-xs text-rose-900">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Reviewer Lock Expired:</span> Previous review lock exceeded {reviewerTimeoutMinutes} minutes. You may reclaim this certificate to unblock the evaluation queue.
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleClaim}
            disabled={reclaiming}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0"
          >
            <Unlock className="h-3.5 w-3.5 mr-1" />
            {reclaiming ? "Reclaiming..." : "Reclaim Review Lock"}
          </Button>
        </div>
      )}

      {certificate.status === "SUBMITTED" && (
        <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between gap-3">
          <div className="text-xs text-sky-900">
            <span className="font-bold">Unclaimed Submission:</span> Claim this certificate to acquire the exclusive review lock before making verification determinations.
          </div>
          <Button
            size="sm"
            onClick={handleClaim}
            disabled={reclaiming}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shrink-0"
          >
            <Lock className="h-3.5 w-3.5 mr-1" />
            {reclaiming ? "Claiming..." : "Claim Review"}
          </Button>
        </div>
      )}

      {reclaimError && (
        <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
          {reclaimError}
        </div>
      )}

      {/* Main Two-Column Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Evidence Document Viewer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
                  Nandha Engineering College, Erode
                </span>
                <span className="text-[10px] font-bold text-slate-500">Autonomous Evaluation</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Primary Evidence Certificate Proof</span>
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">{files.length} File Version(s)</span>
          </div>

          <SecureViewer
            files={files}
            title={certificate.title}
            isDuplicateFlagged={isDuplicateFlagged}
          />
        </div>

        {/* Right Column: Student Profile, Details, Evaluation Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Action Decision Panel */}
          {canPerformActions && (
            <Card className="p-6 border-slate-700/80 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl rounded-3xl relative overflow-hidden space-y-4">
              {/* Ambient Glowing Orbs */}
              <div className="absolute -top-12 -right-12 w-44 h-44 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
              <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-primary-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

              <div className="relative z-10 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Verification Evaluation</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Lock Active</span>
                </span>
              </div>

              <p className="relative z-10 text-xs text-slate-300 leading-relaxed">
                Review the document against Nandha Engineering College guidelines. Select your official determination:
              </p>

              <div className="relative z-10 grid grid-cols-1 gap-2.5 pt-1">
                <Button
                  onClick={() => setShowApprove(true)}
                  className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs h-11 rounded-2xl shadow-lg shadow-emerald-950/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
                >
                  <CheckCircle2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Approve &amp; Award Points</span>
                </Button>

                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    onClick={() => setShowCorrection(true)}
                    variant="outline"
                    className="border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs h-10 rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 group"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
                    <span>Correction</span>
                  </Button>

                  <Button
                    onClick={() => setShowReject(true)}
                    variant="outline"
                    className="border-rose-400/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs h-10 rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 group"
                  >
                    <XCircle className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform" />
                    <span>Reject</span>
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Student Profile Card */}
          <Card className="p-5 border-slate-200 bg-white space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 text-primary-600" />
              <span>Student Profile</span>
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Name</span>
                <span className="font-bold text-slate-900">{student.profile?.full_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Register Number</span>
                <span className="font-mono font-bold text-slate-800">
                  {student.register_number}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Academic Year</span>
                <span className="font-bold text-slate-800">Year {student.academic_year}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Department</span>
                <span className="font-bold text-slate-800">{category?.name || "CSE"}</span>
              </div>
            </div>
          </Card>

          {/* Submission Details Card */}
          <Card className="p-5 border-slate-200 bg-white space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-primary-600" />
              <span>Submitted Metadata</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Title</span>
                <span className="font-bold text-slate-900">{certificate.title}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block font-medium">Event Name</span>
                  <span className="font-semibold text-slate-800">{certificate.event_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Organizer</span>
                  <span className="font-semibold text-slate-800">{certificate.organizer}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block font-medium">Standing / Rank</span>
                  <span className="font-semibold text-slate-800">{certificate.achievement}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Event Date</span>
                  <span className="font-semibold text-slate-800">
                    {formatDate(certificate.event_date)}
                  </span>
                </div>
              </div>

              {/* Request & Submission Date and Time */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary-600" />
                    <span>Requested &amp; Submitted:</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                    {formatDateTime(certificate.submitted_at || certificate.created_at)}
                  </span>
                </div>
                {certificate.review_started_at && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>Review Lock Started:</span>
                    <span className="font-mono font-semibold text-slate-700">
                      {formatDateTime(certificate.review_started_at)}
                    </span>
                  </div>
                )}
              </div>
              {certificate.description && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block font-medium mb-1">
                    Student Summary:
                  </span>
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                    {certificate.description}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Audit History / Timeline */}
          <Card className="p-5 border-slate-200 bg-white">
            <TimelineJourney
              certificate={certificate}
              reviews={reviews}
              points={points}
              studentName={student.profile?.full_name}
            />
          </Card>
        </div>
      </div>

      {/* Review Workbench Action Modals */}
      <ApproveModal
        isOpen={showApprove}
        onClose={() => setShowApprove(false)}
        certificateId={certificate.id}
        maxPoints={maxPointsPerCertificate}
        onSuccess={handleActionSuccess}
      />

      <RequestCorrectionModal
        isOpen={showCorrection}
        onClose={() => setShowCorrection(false)}
        certificateId={certificate.id}
        onSuccess={handleActionSuccess}
      />

      <RejectModal
        isOpen={showReject}
        onClose={() => setShowReject(false)}
        certificateId={certificate.id}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}
