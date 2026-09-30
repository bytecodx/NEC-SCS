import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";
import { SubmitCertificateForm } from "@/components/forms/SubmitCertificateForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function SubmitCertificatePage() {
  const user = await getCurrentUser();
  const db = getDB();

  const categories = db.categories.filter(
    (c) => c.college_id === user?.profile.college_id && c.is_active
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb Header */}
      <div>
        <Link
          href="/student/certificates"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Certificates
        </Link>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Submit Certificate for Verification
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Upload primary documentation for human faculty verification and co-curricular point allocation.
        </p>
      </div>

      <SubmitCertificateForm categories={categories} />
    </div>
  );
}
