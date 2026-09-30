"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addStudentAction, getDepartmentListAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UserPlus,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Calendar,
  Building2,
  Mail,
  Hash,
} from "lucide-react";

interface AddStudentModalProps {
  defaultDepartmentId?: string;
  defaultDepartmentName?: string;
  buttonLabel?: string;
  buttonVariant?: "default" | "outline" | "banner";
  className?: string;
}

export function AddStudentModal({
  defaultDepartmentId,
  defaultDepartmentName,
  buttonLabel = "Add Student",
  buttonVariant = "default",
  className = "",
}: AddStudentModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [academicYear, setAcademicYear] = useState<number>(3);
  const [departmentId, setDepartmentId] = useState<string>(defaultDepartmentId || "");
  const [departments, setDepartments] = useState<
    Array<{ id: string; name: string; code: string; type?: "UG" | "PG" }>
  >([]);

  useEffect(() => {
    if (defaultDepartmentId) {
      setDepartmentId(defaultDepartmentId);
    }
  }, [defaultDepartmentId]);

  useEffect(() => {
    async function loadDepts() {
      try {
        const list = await getDepartmentListAction();
        setDepartments(list);
        if (!departmentId && list.length > 0) {
          setDepartmentId(list[0].id);
        }
      } catch (err) {
        console.error("Failed to load departments:", err);
      }
    }
    if (isOpen) {
      loadDepts();
    }
  }, [isOpen, departmentId]);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setRegisterNumber("");
    setAcademicYear(3);
    if (defaultDepartmentId) setDepartmentId(defaultDepartmentId);
    setError(null);
  };

  const handleOpen = () => {
    resetForm();
    setSuccessMessage(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setError("Please enter the student's full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid student email address.");
      return;
    }
    if (!registerNumber.trim()) {
      setError("Please enter the Anna University / NEC Register Number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addStudentAction({
        fullName,
        email,
        registerNumber,
        academicYear,
        departmentId: departmentId || defaultDepartmentId,
      });

      if (!res.success) {
        setError(res.error || "Failed to add student.");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(res.message || "Student enrolled successfully!");
      router.refresh();

      setTimeout(() => {
        setIsSubmitting(false);
        setIsOpen(false);
        resetForm();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred while adding student.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      {buttonVariant === "banner" ? (
        <Button
          type="button"
          onClick={handleOpen}
          className={`border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs h-10 shadow-sm transition-all flex items-center gap-1.5 ${className}`}
        >
          <UserPlus className="h-4 w-4 text-emerald-400" />
          <span>{buttonLabel}</span>
        </Button>
      ) : buttonVariant === "outline" ? (
        <Button
          type="button"
          variant="outline"
          onClick={handleOpen}
          className={`border-slate-200 hover:bg-slate-50 text-slate-800 text-xs h-9 shadow-2xs font-bold transition-all flex items-center gap-1.5 ${className}`}
        >
          <UserPlus className="h-3.5 w-3.5 text-primary-600" />
          <span>{buttonLabel}</span>
        </Button>
      ) : (
        <Button
          type="button"
          onClick={handleOpen}
          className={`bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold h-9 sm:h-10 px-4 shadow-sm transition-all flex items-center gap-1.5 ${className}`}
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>{buttonLabel}</span>
        </Button>
      )}

      {/* Modal Dialog Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 border-b border-slate-800">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-16 rounded-xl bg-white p-1 border border-slate-700/60 shadow-md shrink-0 flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/nec-logo.png"
                      alt="Nandha Engineering College Logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                        Enroll Student
                      </h3>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30">
                        NEC Portal
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Direct Department Registration • Co-Curricular Tracking
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              {/* Feedback Alert */}
              {error && (
                <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Student Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-primary-600" />
                  <span>Student Full Name *</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Sanjay Kumar M"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isSubmitting}
                  className="h-10 text-xs"
                />
              </div>

              {/* Register Number & Academic Year Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Register Number *</span>
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. 710023CS0199"
                    value={registerNumber}
                    onChange={(e) => setRegisterNumber(e.target.value.toUpperCase())}
                    disabled={isSubmitting}
                    className="h-10 text-xs font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Anna University / NEC Roll No.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-amber-600" />
                      <span>Academic Year *</span>
                    </span>
                    {departments.find((d) => d.id === departmentId)?.type === "PG" && (
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                        PG 2-Yr Programme
                      </span>
                    )}
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(Number(e.target.value))}
                    disabled={isSubmitting}
                    aria-label="Academic Year"
                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={1}>Year 1 — First Year</option>
                    <option value={2}>Year 2 — Second Year {departments.find((d) => d.id === departmentId)?.type === "PG" ? "(Final Year)" : ""}</option>
                    {departments.find((d) => d.id === departmentId)?.type !== "PG" && (
                      <>
                        <option value={3}>Year 3 — Third Year</option>
                        <option value={4}>Year 4 — Final Year</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Student Email */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-sky-600" />
                  <span>Student Official Email *</span>
                </label>
                <Input
                  type="email"
                  required
                  placeholder="e.g. sanjay.m@student.nandha.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="h-10 text-xs"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Credentials & notifications will be routed to this institutional address.
                </span>
              </div>

              {/* Department with Separate UG and PG groupings */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Assigned Department</span>
                  </label>
                  {departmentId && (
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        departments.find((d) => d.id === departmentId)?.type === "PG"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-sky-50 text-sky-700 border-sky-200"
                      }`}
                    >
                      {departments.find((d) => d.id === departmentId)?.type === "PG"
                        ? "Postgraduate (PG)"
                        : "Undergraduate (UG)"}
                    </span>
                  )}
                </div>

                {defaultDepartmentName ? (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{defaultDepartmentName}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Your Department
                    </span>
                  </div>
                ) : (
                  <select
                    value={departmentId}
                    onChange={(e) => {
                      const newId = e.target.value;
                      setDepartmentId(newId);
                      const targetDept = departments.find((d) => d.id === newId);
                      if (targetDept?.type === "PG" && academicYear > 2) {
                        setAcademicYear(2);
                      }
                    }}
                    disabled={isSubmitting}
                    aria-label="Assigned Department"
                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <optgroup label="── Undergraduate (UG) Branches ──">
                      {departments
                        .filter((d) => (d.type || "UG") === "UG")
                        .map((d) => (
                          <option key={d.id} value={d.id}>
                            [UG] {d.name} ({d.code})
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="── Postgraduate (PG) Programmes ──">
                      {departments
                        .filter((d) => d.type === "PG")
                        .map((d) => (
                          <option key={d.id} value={d.id}>
                            [PG] {d.name} ({d.code})
                          </option>
                        ))}
                    </optgroup>
                  </select>
                )}
              </div>

              {/* Timestamp footer strip */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Instant Auth Sync</span>
                <span className="font-mono text-[10px] text-slate-400">
                  {new Date().toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="text-xs h-10 px-4 border-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold h-10 px-5 shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      <span>Enrolling...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-1.5" />
                      <span>Enroll Student into NEC Portal</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
