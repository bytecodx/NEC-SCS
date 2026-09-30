"use client";

import React from "react";
import Link from "next/link";
import { CampusCredLogo } from "@/components/layout/CampusCredLogo";
import {
  ShieldCheck,
  Award,
  FileCheck2,
  Lock,
  ChevronRight,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Users,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Fingerprint,
} from "lucide-react";
import { loginAction } from "@/actions/auth";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  const handleQuickLogin = async (identifier: string, targetPath: string) => {
    const res = await loginAction({ identifier, password: "password123" });
    if (res.success) {
      router.push(targetPath);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/">
            <CampusCredLogo size={32} isDark />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white shadow-sm transition-all"
            >
              Access Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-32">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700/80 text-primary-400 text-xs font-bold mb-6 shadow-lg backdrop-blur-md animate-float">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <ShieldCheck className="h-4 w-4 text-primary-400" />
            <span>Nandha Engineering College (NEC) • Institutional Achievement System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Verified Achievements. <br />
            <span className="animated-gradient-text">
              Trusted Institutional Records.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminate unverified certificates and spreadsheet chaos. NEC Cred empowers Nandha Engineering College with faculty-verified achievement tracking, byte-level duplicate detection, and tamper-evident digital passports.
          </p>

          {/* Quick Demo Switcher */}
          <div className="mt-10 p-4 sm:p-5 rounded-2xl bg-slate-800/70 border border-slate-700/80 max-w-3xl mx-auto shadow-xl backdrop-blur-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              ⚡ Instant 1-Click Interactive Demo Role Switcher
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => handleQuickLogin("aditya.verma@student.abctech.edu", "/student/dashboard")}
                className="p-3 rounded-xl bg-slate-900/90 hover:bg-primary-600/20 border border-slate-700 hover:border-primary-500 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-primary-400">
                  <GraduationCap className="h-4 w-4 text-primary-400" />
                  <span>Student</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 truncate">Aditya Verma (CSE)</p>
              </button>

              <button
                onClick={() => handleQuickLogin("prof.sharma@abctech.edu", "/faculty/dashboard")}
                className="p-3 rounded-xl bg-slate-900/90 hover:bg-emerald-600/20 border border-slate-700 hover:border-emerald-500 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-emerald-400">
                  <Award className="h-4 w-4 text-emerald-400" />
                  <span>Faculty</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 truncate">Prof. Sharma (CSE)</p>
              </button>

              <button
                onClick={() => handleQuickLogin("hod.cse@abctech.edu", "/hod/dashboard")}
                className="p-3 rounded-xl bg-slate-900/90 hover:bg-indigo-600/20 border border-slate-700 hover:border-indigo-500 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-indigo-400">
                  <Building2 className="h-4 w-4 text-indigo-400" />
                  <span>HOD</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 truncate">Dr. Pillai (HOD-CSE)</p>
              </button>

              <button
                onClick={() => handleQuickLogin("admin@abctech.edu", "/admin/dashboard")}
                className="p-3 rounded-xl bg-slate-900/90 hover:bg-amber-600/20 border border-slate-700 hover:border-amber-500 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-amber-400">
                  <Lock className="h-4 w-4 text-amber-400" />
                  <span>Dean / Admin</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 truncate">Dr. Arthur Vance</p>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="py-16 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary-400">
              Zero-Trust Verification Engine
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Built for Academic Honesty & Institutional Integrity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-primary-900/40 text-primary-400 flex items-center justify-center mb-4 border border-primary-800/50">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Human-Controlled Scoring
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero automated approvals or AI-assigned points. Authorized department faculty inspect original evidence, award points within policy caps, or request specific corrections.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-emerald-900/40 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-800/50">
                <Fingerprint className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                SHA-256 Duplicate Flagging
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every uploaded document is cryptographically hashed upon upload. Byte-identical submissions trigger automated duplicate warnings for reviewing faculty.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-indigo-900/40 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-800/50">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Review Lock & Department Isolation
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Atomic reviewer locking prevents multiple faculty from duplicating reviews. Stale review timeouts enable queue reclaim, and disabled faculty automatically release locks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Achievement Journey Workflow */}
      <section className="py-16 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              The CampusCred Lifecycle
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
              End-to-End Achievement Credentialing Workflow
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700">
              <span className="text-xs font-bold text-primary-400 font-mono">01</span>
              <h4 className="text-sm font-bold text-white mt-1 mb-1">Student Submits</h4>
              <p className="text-xs text-slate-400">
                Real-time Smart Readiness Checklist ensures all event data and primary proofs are present before filing.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700">
              <span className="text-xs font-bold text-indigo-400 font-mono">02</span>
              <h4 className="text-sm font-bold text-white mt-1 mb-1">Faculty Evaluation</h4>
              <p className="text-xs text-slate-400">
                Department faculty claims review lock and inspects proof in a dedicated two-column workbench.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700">
              <span className="text-xs font-bold text-amber-400 font-mono">03</span>
              <h4 className="text-sm font-bold text-white mt-1 mb-1">Approve or Correct</h4>
              <p className="text-xs text-slate-400">
                Faculty assigns points (0 – cap) with commendations, or requests specific revisions.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700">
              <span className="text-xs font-bold text-emerald-400 font-mono">04</span>
              <h4 className="text-sm font-bold text-white mt-1 mb-1">Digital Passport</h4>
              <p className="text-xs text-slate-400">
                Unique Achievement ID (ACH-YYYY-DEPT-XXXXXX) issued for student resumes and institutional NAAC/NBA exports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CampusCredLogo size={24} isDark />
            <span>— Verified Student Achievement & Certificate Management</span>
          </div>
          <div>
            <span>Nandha Engineering College (NEC) • Institutional Accreditation System • Erode, Tamil Nadu</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
