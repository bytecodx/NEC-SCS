"use client";

import React from "react";
import Link from "next/link";
import { CampusCredLogo } from "@/components/layout/CampusCredLogo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/formatters";
import {
  Printer,
  ShieldCheck,
  Award,
  GraduationCap,
  Calendar,
  Building,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { getDB } from "@/lib/db/store";

export default function StudentPassportPage() {
  const db = getDB();

  // Find currently active student from store (Aditya Verma for demo)
  const student = db.students[0];
  const profile = db.profiles.find((p) => p.id === student?.profile_id);
  const department = db.departments.find((d) => d.id === student?.department_id);
  const college = db.colleges[0];

  const approvedCerts = db.certificates
    .filter((c) => c.student_id === student?.id && c.status === "APPROVED")
    .map((c) => ({
      ...c,
      category: db.categories.find((cat) => cat.id === c.category_id),
      points: db.pointRecords.find((p) => p.certificate_id === c.id && p.is_latest)?.points || 0,
    }))
    .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

  const totalPoints = approvedCerts.reduce((acc, c) => acc + c.points, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top action bar - Hidden when printing */}
      <div className="no-print flex items-center justify-between">
        <Link
          href="/student/achievements"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Achievement Wallet
        </Link>

        <Button
          onClick={handlePrint}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-10 px-4 shadow-sm"
        >
          <Printer className="h-4 w-4 mr-1.5" />
          Print Official Passport (PDF)
        </Button>
      </div>

      {/* Printable Digital Passport Document */}
      <div className="print-passport bg-white border border-slate-300 rounded-2xl p-8 sm:p-12 shadow-sm max-w-4xl mx-auto space-y-8 text-slate-900">
        {/* Official Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
              {college.name}
            </h1>
            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Office of Academic Affairs • Student Achievement Directorate
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded border border-primary-200 mt-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Official Co-Curricular Achievement Passport</span>
            </div>
          </div>

          <div className="text-right">
            <CampusCredLogo size={36} />
            <p className="text-[10px] font-mono text-slate-400 mt-1">
              CAMPUSCRED VERIFIED RECORD
            </p>
          </div>
        </div>

        {/* Student Credential Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Student Name</span>
            <span className="font-bold text-slate-900 text-sm">{profile?.full_name}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Register Number</span>
            <span className="font-mono font-bold text-slate-900">{student?.register_number}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Academic Department</span>
            <span className="font-bold text-slate-900">{department?.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Total Verified Credits</span>
            <span className="font-black text-emerald-700 text-sm">+{totalPoints} PTS</span>
          </div>
        </div>

        {/* Achievements Ledger Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Verified Achievement Records Ledger
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {approvedCerts.length} Verified Entries
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3">Achievement ID</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Achievement & Event</th>
                  <th className="py-3 px-3">Organizer</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {approvedCerts.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono text-[11px] font-bold text-emerald-700">
                      {cert.achievement_id}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                        {cert.category?.name}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900">{cert.title}</p>
                      <p className="text-[11px] text-slate-500">{cert.achievement}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{cert.organizer}</td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {formatDate(cert.event_date)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-700 font-mono">
                      +{cert.points} PTS
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Official Certification & Seal Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t-2 border-slate-900 text-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <ShieldCheck className="h-4 w-4" />
              <span>Institutional Verification Affirmation</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              This Achievement Passport is an official co-curricular record generated from CampusCred. Each credential has undergone human verification by authorized college faculty against primary documentary evidence.
            </p>
          </div>

          <div className="flex flex-col justify-end items-end text-right space-y-1">
            <div className="h-12 w-48 border-b border-slate-400 flex items-center justify-center text-slate-300 italic font-serif">
              [Authorized Faculty / HOD Seal]
            </div>
            <p className="text-[11px] font-bold text-slate-800">Department Coordinator / Dean</p>
            <p className="text-[10px] text-slate-400">Date Issued: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
