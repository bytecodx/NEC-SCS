import React from "react";
import { getAuditLogsAction } from "@/actions/admin";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils/formatters";
import { ShieldAlert, ShieldCheck, Lock, Clock } from "lucide-react";

export default async function AdminAuditLogsPage() {
  const auditLogs = await getAuditLogsAction();

  const getActionBadge = (action: string) => {
    if (action.includes("APPROVED") || action.includes("AWARDED")) {
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    }
    if (action.includes("DISABLED") || action.includes("REJECTED")) {
      return "bg-rose-50 text-rose-800 border-rose-200";
    }
    if (action.includes("CLAIMED") || action.includes("RECLAIMED")) {
      return "bg-amber-50 text-amber-800 border-amber-200";
    }
    return "bg-slate-100 text-slate-800 border-slate-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            System Security Audit Trail
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable chronological record of all authentication, review determinations, and point transactions.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Append-Only Integrity (No UPDATE/DELETE Permitted)</span>
        </div>
      </div>

      <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Metadata / Details</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {auditLogs.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {formatDateTime(log.created_at)}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getActionBadge(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">
                      {log.actor?.full_name || "System Actor"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {log.actor?.role || "SYSTEM"}
                    </p>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {log.entity_type}
                  </td>

                  <td className="py-3.5 px-4 max-w-sm">
                    <code className="text-[10px] font-mono bg-slate-100 p-1 rounded text-slate-700 block truncate">
                      {JSON.stringify(log.metadata)}
                    </code>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-400">
                    {log.ip_address || "127.0.0.1"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
