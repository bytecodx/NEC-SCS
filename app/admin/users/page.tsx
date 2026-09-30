"use client";

import React, { useState, useEffect } from "react";
import { getAdminUsersAction, toggleUserStatusAction } from "@/actions/admin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  GraduationCap,
  Award,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  ShieldCheck,
} from "lucide-react";

export default function AdminUsersPage() {
  const [data, setData] = useState<{ students: any[]; faculty: any[] }>({
    students: [],
    faculty: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"FACULTY" | "STUDENTS">("FACULTY");
  const [degreeFilter, setDegreeFilter] = useState<"ALL" | "UG" | "PG">("ALL");
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      const res = await getAdminUsersAction();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggle = async (profileId: string, name: string, isFaculty: boolean) => {
    setTogglingId(profileId);
    setNotice(null);
    try {
      const res = await toggleUserStatusAction(profileId);
      if (res.success) {
        if (!res.isActive && isFaculty) {
          setNotice(
            `Automated Security Trigger Executed: ${name} was deactivated. Any certificates held under active review by this faculty member were automatically released back to the 'SUBMITTED' review queue.`
          );
        } else {
          setNotice(`Account for ${name} is now ${res.isActive ? "Active" : "Disabled"}.`);
        }
        await loadUsers();
      }
    } catch (err: any) {
      alert(err?.message || "Failed to update user status");
    } finally {
      setTogglingId(null);
    }
  };

  const filteredFaculty = data.faculty.filter((f) => {
    const deptType = f.department?.type || "UG";
    if (degreeFilter !== "ALL" && deptType !== degreeFilter) return false;
    return (
      f.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      f.employee_id?.toLowerCase().includes(search.toLowerCase()) ||
      f.department?.name?.toLowerCase().includes(search.toLowerCase()) ||
      f.department?.code?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const filteredStudents = data.students.filter((s) => {
    const deptType = s.department?.type || "UG";
    if (degreeFilter !== "ALL" && deptType !== degreeFilter) return false;
    return (
      s.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.register_number?.toLowerCase().includes(search.toLowerCase()) ||
      s.department?.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.department?.code?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          User & Faculty Management
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage enrolled student credentials, authorized faculty evaluators, and security status.
        </p>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-900">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{notice}</span>
        </div>
      )}

      {/* Tab Switcher, Degree Level Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Main Role Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveTab("FACULTY")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === "FACULTY"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Faculty ({data.faculty.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("STUDENTS")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === "STUDENTS"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Students ({data.students.length})</span>
            </button>
          </div>

          {/* Degree Filter (UG vs PG) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setDegreeFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                degreeFilter === "ALL"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Levels
            </button>
            <button
              onClick={() => setDegreeFilter("UG")}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                degreeFilter === "UG"
                  ? "bg-white text-sky-700 shadow-xs ring-1 ring-sky-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              <span>UG Only</span>
            </button>
            <button
              onClick={() => setDegreeFilter("PG")}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                degreeFilter === "PG"
                  ? "bg-white text-purple-700 shadow-xs ring-1 ring-purple-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              <span>PG Only</span>
            </button>
          </div>
        </div>

        <div className="relative w-full lg:w-72">
          <Input
            type="text"
            placeholder={
              activeTab === "FACULTY" ? "Search faculty or employee ID..." : "Search student or register no..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs bg-white"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-200/60 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : activeTab === "FACULTY" ? (
        /* Faculty Table */
        <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Faculty Member</th>
                  <th className="py-3.5 px-4">Employee ID</th>
                  <th className="py-3.5 px-4">Department & Role</th>
                  <th className="py-3.5 px-4">Review History</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredFaculty.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{f.profile?.full_name}</p>
                      <p className="text-[11px] text-slate-400">{f.profile?.email}</p>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                      {f.employee_id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-slate-800">{f.department?.name}</p>
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                            f.department?.type === "PG"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-sky-50 text-sky-700 border-sky-200"
                          }`}
                        >
                          {f.department?.type || "UG"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {f.designation} {f.is_hod && "• Head of Dept"}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-700">
                          {f.reviewCount} total reviews
                        </span>
                        {f.activeLockCount > 0 && (
                          <p className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
                            <Lock className="h-3 w-3" /> {f.activeLockCount} active lock
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {f.profile?.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="h-3 w-3" /> Disabled
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant={f.profile?.is_active ? "outline" : "default"}
                        onClick={() =>
                          handleToggle(f.profile?.id, f.profile?.full_name || "Faculty", true)
                        }
                        disabled={togglingId === f.profile?.id}
                        className={`text-xs h-8 ${
                          f.profile?.is_active
                            ? "text-rose-600 hover:bg-rose-50 border-rose-200"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        }`}
                      >
                        {togglingId === f.profile?.id
                          ? "Processing..."
                          : f.profile?.is_active
                          ? "Disable"
                          : "Activate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Students Table */
        <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Register Number</th>
                  <th className="py-3.5 px-4">Department & Year</th>
                  <th className="py-3.5 px-4">Certificates</th>
                  <th className="py-3.5 px-4">Points</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{s.profile?.full_name}</p>
                      <p className="text-[11px] text-slate-400">{s.profile?.email}</p>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                      {s.register_number}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-slate-800">{s.department?.name}</p>
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                            s.department?.type === "PG"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-sky-50 text-sky-700 border-sky-200"
                          }`}
                        >
                          {s.department?.type || "UG"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">Year {s.academic_year}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700">
                        {s.approvedCount} / {s.certCount} Approved
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      +{s.totalPoints} PTS
                    </td>

                    <td className="py-3.5 px-4">
                      {s.profile?.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Disabled
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant={s.profile?.is_active ? "outline" : "default"}
                        onClick={() =>
                          handleToggle(s.profile?.id, s.profile?.full_name || "Student", false)
                        }
                        disabled={togglingId === s.profile?.id}
                        className={`text-xs h-8 ${
                          s.profile?.is_active
                            ? "text-rose-600 hover:bg-rose-50 border-rose-200"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        }`}
                      >
                        {togglingId === s.profile?.id
                          ? "Processing..."
                          : s.profile?.is_active
                          ? "Disable"
                          : "Activate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
