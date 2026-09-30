"use client";

import React, { useState, useEffect } from "react";
import { getCollegeSettingsAction, updateCollegeSettingsAction } from "@/actions/admin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminSettingsPage() {
  const [college, setCollege] = useState<any>(null);
  const [maxPoints, setMaxPoints] = useState(100);
  const [timeoutMinutes, setTimeoutMinutes] = useState(30);
  const [maxFileSize, setMaxFileSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getCollegeSettingsAction();
        setCollege(res.college);
        if (res.settings) {
          setMaxPoints(res.settings.max_points_per_certificate);
          setTimeoutMinutes(res.settings.reviewer_reclaim_timeout_minutes);
          setMaxFileSize(res.settings.max_file_size_mb);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await updateCollegeSettingsAction({
        max_points_per_certificate: Number(maxPoints),
        reviewer_reclaim_timeout_minutes: Number(timeoutMinutes),
        max_file_size_mb: Number(maxFileSize),
      });

      if (!res.success) {
        setError(res.error || "Failed to update college settings");
        setSaving(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err?.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          College Policy & Security Settings
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Institutional rules governing point caps, review lock reclamation, and storage constraints.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">
            Institutional policies updated successfully. Changes are effective immediately across all review queues.
          </span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2.5">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-slate-200/60 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Institutional Identity Card */}
          <Card className="p-6 border-slate-200 bg-white space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Institutional Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Institution Name</span>
                <span className="font-bold text-slate-900 text-sm">
                  {college?.name || "Nandha Engineering College (NEC)"}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Institutional Code</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {college?.code || "NEC"}
                </span>
              </div>
            </div>
          </Card>

          {/* Policy Configurations */}
          <Card className="p-6 border-slate-200 bg-white space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary-600" />
              <span>Verification & Point Award Limits</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Maximum Awardable Points Per Certificate (Cap)
              </label>
              <Input
                type="number"
                min={1}
                max={500}
                value={maxPoints}
                onChange={(e) => setMaxPoints(Number(e.target.value))}
                required
                className="font-bold text-sm max-w-xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Faculty evaluators cannot award points higher than this value for any individual certificate.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reviewer Lock Inactivity Timeout (Minutes)
              </label>
              <Input
                type="number"
                min={5}
                max={240}
                value={timeoutMinutes}
                onChange={(e) => setTimeoutMinutes(Number(e.target.value))}
                required
                className="font-bold text-sm max-w-xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                If a faculty reviewer opens a submission and takes no action within this duration, departmental colleagues may reclaim the lock to prevent queue staleness.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Maximum File Upload Size (Megabytes)
              </label>
              <Input
                type="number"
                min={1}
                max={50}
                value={maxFileSize}
                onChange={(e) => setMaxFileSize(Number(e.target.value))}
                required
                className="font-bold text-sm max-w-xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Enforced both client-side and server-side on student certificate attachments.
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs h-10 px-6 shadow-sm"
              >
                {saving ? "Saving Policies..." : "Save Institutional Settings"}
              </Button>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
}
