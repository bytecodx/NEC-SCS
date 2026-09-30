"use client";

import React from "react";
import Link from "next/link";
import { Certificate, CertificateFile, Category, PointRecord } from "@/types/database.types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card } from "@/components/ui/card";
import { Calendar, Award, Building, FileText, ChevronRight, AlertCircle, Clock } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils/formatters";

interface CertificateCardProps {
  certificate: Certificate & {
    category?: Category;
    files?: CertificateFile[];
    points?: PointRecord[];
  };
  baseHref?: string;
}

export function CertificateCard({ certificate, baseHref = "/student/certificates" }: CertificateCardProps) {
  const latestPoints = certificate.points?.find((p) => p.is_latest)?.points;
  const primaryFile = certificate.files?.find((f) => f.file_type === "PRIMARY");
  const targetHref = `${baseHref}/${certificate.id}`;

  const getStatusAccent = () => {
    switch (certificate.status) {
      case "APPROVED":
        return "from-emerald-500 via-teal-400 to-emerald-600";
      case "CORRECTION_REQUIRED":
        return "from-amber-500 via-orange-400 to-amber-600";
      case "REJECTED":
        return "from-rose-500 via-red-400 to-rose-600";
      default:
        return "from-primary-500 via-sky-400 to-indigo-600";
    }
  };

  return (
    <Link
      href={targetHref}
      className="block group h-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-2xl transition-all"
    >
      <Card className="h-full hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 border-slate-200/90 group-hover:border-primary-400 overflow-hidden flex flex-col justify-between cursor-pointer bg-white relative rounded-2xl card-sheen">
        {/* Top Status Gradient Accent Bar */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${getStatusAccent()}`} />

        <div className="p-5">
          {/* Header row: Category & Status */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 truncate">
              {certificate.category?.name || "General"}
            </span>
            <StatusBadge status={certificate.status} />
          </div>

          {/* Title & Achievement ID */}
          <h3 className="text-base font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1 mb-1">
            {certificate.title}
          </h3>

          {certificate.achievement_id && (
            <p className="text-xs font-mono font-semibold text-emerald-700 mb-2">
              {certificate.achievement_id}
            </p>
          )}

          {/* Event Details */}
          <div className="space-y-1.5 text-xs text-slate-600 my-3">
            <div className="flex items-center gap-2">
              <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{certificate.event_name} • {certificate.organizer}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate font-medium text-slate-800">{certificate.achievement}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>Event: {formatDate(certificate.event_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 pt-1.5 border-t border-slate-100">
              <Clock className="h-3.5 w-3.5 text-primary-500 shrink-0" />
              <span className="text-[11px] truncate">
                Submitted: <strong className="font-mono text-slate-700 font-semibold">{formatDateTime(certificate.submitted_at || certificate.created_at)}</strong>
              </span>
            </div>
          </div>

          {/* Warning if correction required */}
          {certificate.status === "CORRECTION_REQUIRED" && (
            <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Correction requested by faculty reviewer. Tap to view notes & upload revision.</span>
            </div>
          )}
        </div>

        {/* Footer bar */}
        <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
          <div>
            {certificate.status === "APPROVED" && latestPoints !== undefined ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <Award className="h-3.5 w-3.5 text-emerald-600" />
                +{latestPoints} Points Awarded
              </span>
            ) : (
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                {primaryFile ? primaryFile.original_filename : "No attachment"}
              </span>
            )}
          </div>

          <div className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 group-hover:text-primary-700 group-hover:translate-x-0.5 transition-all">
            <span>View Details</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
