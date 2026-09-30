"use client";

import React from "react";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ChecklistItem {
  key: string;
  label: string;
  isCompleted: boolean;
}

interface SmartChecklistProps {
  items: ChecklistItem[];
}

export function SmartChecklist({ items }: SmartChecklistProps) {
  const allCompleted = items.every((i) => i.isCompleted);
  const completedCount = items.filter((i) => i.isCompleted).length;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Submission Readiness
          </h4>
          <p className="text-[11px] text-slate-500">
            Institutional verification checklist ({completedCount}/{items.length})
          </p>
        </div>
        <span
          className={cn(
            "text-xs font-bold px-2.5 py-1 rounded-full border transition-all",
            allCompleted
              ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm"
              : "bg-amber-50 text-amber-700 border-amber-200"
          )}
        >
          {allCompleted ? "✓ Ready to Submit" : "Incomplete"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item) => (
          <div
            key={item.key}
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg text-xs transition-colors",
              item.isCompleted
                ? "bg-white text-slate-900 border border-emerald-100 shadow-2xs font-medium"
                : "text-slate-400 border border-transparent"
            )}
          >
            {item.isCompleted ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <CircleDashed className="h-4 w-4 text-slate-300 shrink-0" />
            )}
            <span className={item.isCompleted ? "text-slate-800" : "text-slate-500"}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
