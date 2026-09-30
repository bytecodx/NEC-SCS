"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CampusCredLogo } from "@/components/layout/CampusCredLogo";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginAction } from "@/actions/auth";
import {
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle,
  GraduationCap,
  Users,
  Building2,
  KeyRound,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError("Please enter your email, register number, or faculty ID.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await loginAction({ identifier, password });
      if (!res.success) {
        setError(res.error || "Authentication failed");
        setLoading(false);
        return;
      }

      if (res.role === "STUDENT") router.push("/student/dashboard");
      else if (res.role === "FACULTY") router.push("/faculty/dashboard");
      else if (res.role === "HOD") router.push("/hod/dashboard");
      else if (res.role === "ADMIN") router.push("/admin/dashboard");
      else router.push("/");
    } catch (err: any) {
      setError(err?.message || "An error occurred");
      setLoading(false);
    }
  };

  const setDemoUser = (idVal: string) => {
    setIdentifier(idVal);
    setPassword("password123");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <Link href="/">
            <CampusCredLogo size={42} />
          </Link>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          NEC Institutional Portal Sign In
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Nandha Engineering College • Student & Faculty Credential Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-6 sm:px-10 border-slate-200 shadow-md bg-white">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Role Dropdown Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Role / Demo Account
              </label>
              <select
                aria-label="Select Role / Demo Account"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    setDemoUser(e.target.value);
                  }
                }}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="" disabled>
                  -- Select Role (Student, Faculty, HOD, Dean) --
                </option>
                <option value="aditya.verma@student.abctech.edu">
                  🎓 Student — Aditya Verma (CSE)
                </option>
                <option value="prof.sharma@abctech.edu">
                  👨‍🏫 Faculty — Prof. Sharma (CSE)
                </option>
                <option value="hod.cse@abctech.edu">
                  🏛️ HOD — Dr. Murugan Pillai (CSE)
                </option>
                <option value="admin@abctech.edu">
                  👑 Dean / Admin — Dr. Arthur Vance
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Institutional ID / Email
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="e.g. 710022CS0101 or aditya.verma@..."
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="pl-9 text-xs"
                />
                <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-primary-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-9 text-xs"
                />
                <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold h-10 text-xs shadow-sm"
            >
              {loading ? "Authenticating..." : "Sign In to CampusCred"}
            </Button>
          </form>

          {/* Quick Demo Pre-Fill Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              ⚡ Demo Accounts (Pre-seeded)
            </p>
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => setDemoUser("aditya.verma@student.abctech.edu")}
                className="p-2 rounded-lg bg-slate-50 hover:bg-primary-50 border border-slate-200 hover:border-primary-300 transition-all text-left"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <GraduationCap className="h-3.5 w-3.5 text-primary-600" />
                  <span>Student</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Aditya Verma</p>
              </button>

              <button
                type="button"
                onClick={() => setDemoUser("prof.sharma@abctech.edu")}
                className="p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all text-left"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Users className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Faculty</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Prof. Sharma</p>
              </button>

              <button
                type="button"
                onClick={() => setDemoUser("hod.cse@abctech.edu")}
                className="p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition-all text-left"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                  <span>HOD</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Dr. Murugan Pillai</p>
              </button>

              <button
                type="button"
                onClick={() => setDemoUser("admin@abctech.edu")}
                className="p-2 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition-all text-left"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <KeyRound className="h-3.5 w-3.5 text-amber-600" />
                  <span>Dean / Admin</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Dr. Arthur Vance</p>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
