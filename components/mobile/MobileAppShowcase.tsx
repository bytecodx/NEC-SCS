"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Smartphone,
  QrCode,
  Bell,
  Sparkles,
  ShieldCheck,
  Award,
  Download,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Wifi,
  Battery,
  Flame,
  X,
} from "lucide-react";

interface MobileAppShowcaseProps {
  className?: string;
  variant?: "embedded" | "modal";
  onClose?: () => void;
}

export function MobileAppShowcase({
  className = "",
  variant = "embedded",
  onClose,
}: MobileAppShowcaseProps) {
  const [activeTab, setActiveTab] = useState<"passport" | "feed" | "qr">("passport");
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const content = (
    <div className={`space-y-6 ${className}`}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-primary-500/10 via-primary-500/20 to-primary-600/10 text-primary-700 text-xs font-bold border border-primary-200 mb-2">
            <Smartphone className="h-3.5 w-3.5 text-primary-600" />
            <span>NEC Mobile PWA Experience</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            NEC Cred Mobile Application
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Carry your verified co-curricular achievements in your pocket. Built for fast on-campus evaluation, interview verification, and offline digital passports.
          </p>
        </div>

        {variant === "modal" && onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors self-start sm:self-auto"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Main Grid: Interactive Phone Mockup + Feature Value Props */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Interactive Mobile Mockup (5 cols) */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-[300px] sm:w-[320px] rounded-[44px] bg-slate-950 p-3.5 shadow-2xl ring-1 ring-slate-800 border-4 border-slate-800 relative">
            {/* Phone Notch / Dynamic Island */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 h-5 w-24 bg-slate-900 rounded-full z-30 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-slate-800 mr-2" />
              <div className="h-2.5 w-2.5 rounded-full bg-slate-950 border border-slate-700" />
            </div>

            {/* Phone Screen Container */}
            <div className="w-full bg-slate-900 text-white rounded-[36px] overflow-hidden flex flex-col pt-8 pb-3 min-h-[580px] border border-slate-800 relative">
              {/* Status Bar */}
              <div className="px-6 py-1 flex items-center justify-between text-[11px] font-semibold text-slate-300">
                <span>09:41</span>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Wifi className="h-3 w-3" />
                  <Battery className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* In-App Header */}
              <div className="px-5 pt-3 pb-2 flex items-center justify-between border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-black text-xs">
                    NEC
                  </div>
                  <div>
                    <h4 className="text-xs font-black tracking-tight text-white leading-tight">
                      NEC Cred
                    </h4>
                    <p className="text-[9px] text-slate-400">Nandha Engineering College</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400 font-bold">Online</span>
                </div>
              </div>

              {/* Dynamic In-App Screen Content */}
              <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                {activeTab === "passport" && (
                  <>
                    {/* Student Digital ID Card */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 via-primary-900 to-slate-900 border border-primary-500/30 text-white relative overflow-hidden shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary-300">
                          Digital Passport
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black border border-amber-400/30 flex items-center gap-1">
                          <Flame className="h-3 w-3 text-amber-400" />
                          Gold Tier
                        </span>
                      </div>

                      <h5 className="text-base font-black tracking-tight text-white">
                        Aditya Verma
                      </h5>
                      <p className="text-[11px] text-slate-300 font-mono">
                        710022CS0101 • B.E. CSE
                      </p>

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">
                            Verified Points
                          </span>
                          <span className="text-lg font-black text-amber-400">285 PTS</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase font-bold text-right">
                            Credentials
                          </span>
                          <span className="text-lg font-black text-white text-right block">8 Certified</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Live Verification Notification */}
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Award className="h-3.5 w-3.5" />
                      </div>
                      <div className="text-[11px]">
                        <p className="font-bold text-slate-200">Point Award Confirmed</p>
                        <p className="text-slate-400 mt-0.5 text-[10px]">
                          Smart India Hackathon approved (+40 PTS) by Prof. Ramesh Sharma.
                        </p>
                      </div>
                    </div>

                    {/* Recent Badge */}
                    <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary-400" />
                        <span className="font-semibold text-slate-300 text-[11px]">
                          Tamper-Proof SHA-256
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold">
                        VERIFIED
                      </span>
                    </div>
                  </>
                )}

                {activeTab === "qr" && (
                  <div className="p-4 rounded-2xl bg-white text-slate-900 text-center space-y-3 shadow-lg">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Institutional QR Verification
                    </span>
                    <div className="h-36 w-36 mx-auto bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-2">
                      <QrCode className="h-24 w-24 text-slate-900" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-700">
                      Scan with any camera to verify
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Direct cryptographic verification against NEC Autonomous Blockchain-style audit trail.
                    </p>
                  </div>
                )}

                {activeTab === "feed" && (
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                      <span className="text-[9px] font-bold text-primary-400 block">TODAY</span>
                      <p className="font-bold text-slate-200 text-[11px]">AWS Certification Verified</p>
                      <p className="text-[10px] text-slate-400">+25 Institutional Points Awarded</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                      <span className="text-[9px] font-bold text-emerald-400 block">YESTERDAY</span>
                      <p className="font-bold text-slate-200 text-[11px]">IEEE Paper Presentation</p>
                      <p className="text-[10px] text-slate-400">State Level Finalist Credential</p>
                    </div>
                  </div>
                )}
              </div>

              {/* In-App Tab Switcher */}
              <div className="px-4 pt-2 border-t border-slate-800 grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("passport")}
                  className={`py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                    activeTab === "passport"
                      ? "bg-primary-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Passport
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("qr")}
                  className={`py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                    activeTab === "qr"
                      ? "bg-primary-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  QR Scan
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("feed")}
                  className={`py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                    activeTab === "feed"
                      ? "bg-primary-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Activity
                </button>
              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="pt-2 flex justify-center">
                <div className="h-1 w-28 bg-slate-700 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Key Mobile App Advantages (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-4">
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-primary-300 transition-all">
              <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 border border-primary-200/60">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Instant QR Off-Campus Verification
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  During job placement interviews, hackathons, and technical symposiums, recruiters scan the student’s QR code to view live faculty attestations and point breakdown directly on NEC servers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Real-Time Evaluation Alerts
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Students receive instantaneous push notifications the moment their department faculty evaluator approves evidence, awards accreditation credits, or requests specific document revisions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200/60">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Tier-Based Achievement Wallet
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Track progress towards Bronze, Silver, Gold, and Platinum recognition milestones with institutional point caps enforced automatically across NAAC Criteria 5.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-amber-300 transition-all">
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  1-Tap PDF Resume Passport Download
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Generate print-ready, high-resolution official achievement certificates and NAAC transcript summaries directly on mobile devices with institutional seals.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Triggers */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              onClick={handleCopyLink}
              className="bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs h-11 px-5 shadow-sm"
            >
              {copiedLink ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-300" />
                  <span>Portal Link Copied!</span>
                </>
              ) : (
                <>
                  <Smartphone className="h-4 w-4 mr-1.5" />
                  <span>Launch Mobile PWA on Phone</span>
                </>
              )}
            </Button>

            <a
              href="/student/profile"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-bold transition-all shadow-2xs hover:bg-slate-50"
            >
              <ExternalLink className="h-4 w-4 text-slate-500" />
              <span>Preview Digital Passport</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  if (variant === "modal") {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <Card className="max-w-4xl w-full p-6 sm:p-8 bg-white border-slate-200 shadow-2xl rounded-3xl animate-in fade-in zoom-in-95 duration-150">
          {content}
        </Card>
      </div>
    );
  }

  return (
    <Card className="p-6 sm:p-8 border-slate-200 bg-white rounded-3xl shadow-xs">
      {content}
    </Card>
  );
}
