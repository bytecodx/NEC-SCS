import React from "react";
import { CertificateStatus } from "@/types/database.types";
import {
  CheckCircle2,
  Clock,
  Search,
  AlertTriangle,
  XCircle,
  FileEdit,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface StatusBadgeProps {
  status: CertificateStatus;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function StatusBadge({ status, className, size = "default" }: StatusBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    default: "px-2.5 py-1 text-xs font-semibold gap-1.5",
    lg: "px-3.5 py-1.5 text-sm font-semibold gap-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    default: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  switch (status) {
    case "APPROVED":
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 font-medium",
            sizeClasses[size],
            className
          )}
        >
          <CheckCircle2 className={cn("text-emerald-600", iconSizes[size])} />
          <span>✓ Approved</span>
        </span>
      );

    case "SUBMITTED":
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-300 font-medium",
            sizeClasses[size],
            className
          )}
        >
          <Clock className={cn("text-blue-600", iconSizes[size])} />
          <span>⏳ Pending</span>
        </span>
      );

    case "UNDER_REVIEW":
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 border border-indigo-300 font-medium",
            sizeClasses[size],
            className
          )}
        >
          <Search className={cn("text-indigo-600", iconSizes[size])} />
          <span>🔍 Under Review</span>
        </span>
      );

    case "CORRECTION_REQUIRED":
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-medium",
            sizeClasses[size],
            className
          )}
        >
          <AlertTriangle className={cn("text-amber-600", iconSizes[size])} />
          <span>⚠ Correction Required</span>
        </span>
      );

    case "REJECTED":
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-300 font-medium",
            sizeClasses[size],
            className
          )}
        >
          <XCircle className={cn("text-rose-600", iconSizes[size])} />
          <span>✕ Rejected</span>
        </span>
      );

    case "DRAFT":
    default:
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-medium",
            sizeClasses[size],
            className
          )}
        >
          <FileEdit className={cn("text-slate-600", iconSizes[size])} />
          <span>📝 Draft</span>
        </span>
      );
  }
}
