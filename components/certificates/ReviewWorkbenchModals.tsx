"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Award, AlertTriangle, XCircle, CheckCircle2, ShieldCheck, Clock } from "lucide-react";
import {
  approveCertificateAction,
  requestCorrectionAction,
  rejectCertificateAction,
} from "@/actions/reviews";
import { REJECTION_REASONS } from "@/lib/validators/review";

interface ReviewModalsProps {
  certificateId: string;
  maxPoints: number;
  onSuccess: () => void;
}

export function ApproveModal({
  isOpen,
  onClose,
  certificateId,
  maxPoints = 100,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  certificateId: string;
  maxPoints?: number;
  onSuccess: () => void;
}) {
  const [points, setPoints] = useState<number>(25);
  const [comment, setComment] = useState("");
  const [isDeclared, setIsDeclared] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDeclared) {
      setError("Please affirm the verification declaration.");
      return;
    }
    if (points < 0 || points > maxPoints) {
      setError(`Points must be between 0 and ${maxPoints}.`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await approveCertificateAction({
        certificate_id: certificateId,
        points: Number(points),
        comment: comment.trim() || undefined,
      });

      if (!res.success) {
        setError(res.error || "Failed to approve certificate");
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-700 mb-1">
            <CheckCircle2 className="h-5 w-5" />
            <DialogTitle>Approve & Award Points</DialogTitle>
          </div>
          <p className="text-xs text-slate-500">
            Verify certificate authenticity and manually assign institutional points (Cap: {maxPoints} pts).
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <Alert
              variant="error"
              onClear={() => setError(null)}
              clearLabel="Clear"
            >
              {error}
            </Alert>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Points Awarded (0 – {maxPoints}) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="number"
                min={0}
                max={maxPoints}
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                required
                className="font-bold text-lg text-emerald-700 pr-12"
              />
              <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">
                PTS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Human-assigned score based on achievement tier, organizer stature, and category weight.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reviewer Commendation / Remarks (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Verified against AICTE official finalist directory. Outstanding presentation."
              rows={3}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Approval Action Timestamp */}
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs flex items-center justify-between">
            <span className="text-emerald-900 flex items-center gap-1.5 font-medium">
              <Clock className="h-3.5 w-3.5 text-emerald-600" />
              <span>Approval Action Timestamp:</span>
            </span>
            <span className="font-mono font-bold text-emerald-950 bg-white px-2 py-0.5 rounded border border-emerald-200">
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}, {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          {/* Verification Declaration */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isDeclared}
                onChange={(e) => setIsDeclared(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs text-emerald-950 font-medium leading-relaxed">
                I hereby declare that I have inspected the original evidence, verified date and organizer authenticity, and approved point allocation within college guidelines.
              </span>
            </label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !isDeclared}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              {loading ? "Approving..." : "Confirm & Award Points"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RequestCorrectionModal({
  isOpen,
  onClose,
  certificateId,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  certificateId: string;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState("Unclear certificate");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError("Please provide instructions explaining what the student needs to correct.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await requestCorrectionAction({
        certificate_id: certificateId,
        reason,
        comment: comment.trim(),
      });

      if (!res.success) {
        setError(res.error || "Failed to request correction");
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Request Correction</DialogTitle>
          </div>
          <p className="text-xs text-slate-500">
            Return certificate to student with specific instructions for revision or higher-resolution upload.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <Alert
              variant="error"
              onClear={() => setError(null)}
              clearLabel="Clear"
            >
              {error}
            </Alert>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Correction Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="Unclear certificate">Unclear or blurry certificate image/scan</option>
              <option value="Missing proof of participation">Missing proof of participation or rank</option>
              <option value="Wrong category selected">Incorrect achievement category selected</option>
              <option value="Certificate date mismatch">Event date mismatch with documentation</option>
              <option value="Incomplete organizer details">Incomplete organizer or credential ID details</option>
              <option value="Other">Other specific requirement</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Instructions for Student <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Explain clearly what document needs re-uploading or what metadata needs updating..."
              rows={4}
              required
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Correction Request Timestamp */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs flex items-center justify-between">
            <span className="text-amber-900 flex items-center gap-1.5 font-medium">
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              <span>Request Timestamp:</span>
            </span>
            <span className="font-mono font-bold text-amber-950 bg-white px-2 py-0.5 rounded border border-amber-200">
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}, {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
            >
              {loading ? "Sending..." : "Send Correction Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RejectModal({
  isOpen,
  onClose,
  certificateId,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  certificateId: string;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState<(typeof REJECTION_REASONS)[number]>("Unverified issuer/event");
  const [comment, setComment] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) {
      setError("Please confirm that this rejection determination is final.");
      return;
    }
    if (!comment.trim()) {
      setError("Please provide a reason explaining the rejection.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await rejectCertificateAction({
        certificate_id: certificateId,
        reason,
        comment: comment.trim(),
      });

      if (!res.success) {
        setError(res.error || "Failed to reject certificate");
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-rose-600 mb-1">
            <XCircle className="h-5 w-5" />
            <DialogTitle>Reject Submission</DialogTitle>
          </div>
          <p className="text-xs text-slate-500">
            Permanently reject this certificate submission. This action will be audited and notified to the student.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <Alert
              variant="error"
              onClear={() => setError(null)}
              clearLabel="Clear"
            >
              {error}
            </Alert>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as (typeof REJECTION_REASONS)[number])}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="Unverified issuer/event">Unverified or illegitimate organizer/event</option>
              <option value="Duplicate submission">Duplicate submission of already credited event</option>
              <option value="Forged or altered document">Discrepancy or altered document detected</option>
              <option value="Not aligned with institutional criteria">Does not satisfy college co-curricular policy</option>
              <option value="Other">Other disqualification</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detailed Reason / Note <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="State the institutional basis for rejecting this submission..."
              rows={3}
              required
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="text-xs text-rose-950 font-medium leading-relaxed">
                I confirm that I have evaluated this submission and that it does not meet recognition criteria.
              </span>
            </label>
          </div>

          {/* Rejection Decision Timestamp */}
          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-xs flex items-center justify-between">
            <span className="text-rose-900 flex items-center gap-1.5 font-medium">
              <Clock className="h-3.5 w-3.5 text-rose-600" />
              <span>Rejection Decision Timestamp:</span>
            </span>
            <span className="font-mono font-bold text-rose-950 bg-white px-2 py-0.5 rounded border border-rose-200">
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}, {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !confirmed}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              {loading ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
