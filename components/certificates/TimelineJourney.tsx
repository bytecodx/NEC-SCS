"use client";

import React from "react";
import { Certificate, CertificateReview, PointRecord, Profile } from "@/types/database.types";
import { formatDateTime } from "@/lib/utils/formatters";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Award,
  UserCheck,
  Send,
  FileEdit,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface TimelineJourneyProps {
  certificate: Certificate;
  reviews?: (CertificateReview & { reviewer?: { profile?: Profile } })[];
  points?: PointRecord[];
  studentName?: string;
}

export function TimelineJourney({
  certificate,
  reviews = [],
  points = [],
  studentName = "Student",
}: TimelineJourneyProps) {
  // Build ordered event list
  interface TimelineEvent {
    id: string;
    title: string;
    timestamp: string;
    actor: string;
    type: "SUBMITTED" | "CLAIMED" | "CORRECTION" | "APPROVED" | "REJECTED" | "POINTS";
    description?: string | null;
    meta?: string | null;
  }

  const events: TimelineEvent[] = [];

  // 1. Initial Submission
  if (certificate.submitted_at || certificate.created_at) {
    events.push({
      id: "ev-submit",
      title: "Certificate Submitted for Verification",
      timestamp: certificate.submitted_at || certificate.created_at,
      actor: studentName,
      type: "SUBMITTED",
      description: `Original submission filed under category with primary documentation.`,
    });
  }

  // 2. Reviews
  reviews.forEach((r) => {
    const reviewerName = r.reviewer?.profile?.full_name || "Department Faculty";
    if (r.action === "CLAIMED") {
      events.push({
        id: `ev-${r.id}`,
        title: "Claimed for Institutional Review",
        timestamp: r.created_at,
        actor: reviewerName,
        type: "CLAIMED",
        description: "Review lock acquired. Reviewer evaluating document originality and guidelines.",
      });
    } else if (r.action === "CORRECTION_REQUESTED") {
      events.push({
        id: `ev-${r.id}`,
        title: "Correction Requested by Faculty",
        timestamp: r.created_at,
        actor: reviewerName,
        type: "CORRECTION",
        meta: r.reason ? `Reason: ${r.reason}` : undefined,
        description: r.comment || "Faculty requested revised evidence.",
      });
    } else if (r.action === "APPROVED") {
      events.push({
        id: `ev-${r.id}`,
        title: "Certificate Verified & Approved",
        timestamp: r.created_at,
        actor: reviewerName,
        type: "APPROVED",
        description: r.comment || "Verification complete. Meets institutional criteria.",
      });
    } else if (r.action === "REJECTED") {
      events.push({
        id: `ev-${r.id}`,
        title: "Submission Rejected",
        timestamp: r.created_at,
        actor: reviewerName,
        type: "REJECTED",
        meta: r.reason ? `Reason: ${r.reason}` : undefined,
        description: r.comment || "Does not satisfy recognition criteria.",
      });
    }
  });

  // 3. Points Awarded
  points.forEach((p) => {
    events.push({
      id: `ev-pts-${p.id}`,
      title: `Points Awarded: +${p.points} Points`,
      timestamp: p.created_at,
      actor: "Authorized Faculty",
      type: "POINTS",
      description: p.comment || "Points recorded to student achievement wallet.",
    });
  });

  // Sort ascending by time
  events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "SUBMITTED":
        return <Send className="h-4 w-4 text-sky-600" />;
      case "CLAIMED":
        return <Clock className="h-4 w-4 text-indigo-600" />;
      case "CORRECTION":
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case "APPROVED":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-rose-600" />;
      case "POINTS":
        return <Award className="h-4 w-4 text-amber-500" />;
    }
  };

  const getBadgeColor = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "SUBMITTED":
        return "bg-sky-50 border-sky-200 text-sky-700";
      case "CLAIMED":
        return "bg-indigo-50 border-indigo-200 text-indigo-700";
      case "CORRECTION":
        return "bg-amber-50 border-amber-300 text-amber-800";
      case "APPROVED":
        return "bg-emerald-50 border-emerald-300 text-emerald-800";
      case "REJECTED":
        return "bg-rose-50 border-rose-300 text-rose-800";
      case "POINTS":
        return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300 text-amber-900";
    }
  };

  return (
    <div className="flow-root">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Verification Audit Trail
        </h3>
        <p className="text-xs text-slate-500">
          Immutable event log and reviewer history for this achievement.
        </p>
      </div>

      <ul role="list" className="-mb-8">
        {events.map((event, idx) => {
          const isLast = idx === events.length - 1;
          return (
            <li key={event.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={cn(
                        "h-8 w-8 rounded-full border flex items-center justify-center ring-8 ring-white",
                        getBadgeColor(event.type)
                      )}
                    >
                      {getEventIcon(event.type)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{event.title}</p>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                        By {event.actor}
                      </p>
                      {event.meta && (
                        <p className="mt-1 text-xs font-semibold text-amber-800 bg-amber-50/70 border border-amber-200/80 px-2 py-0.5 rounded inline-block">
                          {event.meta}
                        </p>
                      )}
                      {event.description && (
                        <p className="mt-1 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-[11px] whitespace-nowrap text-slate-400 font-mono">
                      {formatDateTime(event.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
