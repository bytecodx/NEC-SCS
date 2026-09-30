import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";
import { CertificateCard } from "@/components/certificates/CertificateCard";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileCheck2, Filter } from "lucide-react";

export default async function StudentCertificatesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string }>;
}) {
  const user = await getCurrentUser();
  const db = getDB();
  const params = await searchParams;

  const studentId = user?.student?.id;
  const categories = db.categories.filter((c) => c.college_id === user?.profile.college_id);

  let certificates = db.certificates.filter((c) => c.student_id === studentId);

  // Filter by status if requested
  if (params.status && params.status !== "ALL") {
    certificates = certificates.filter((c) => c.status === params.status);
  }

  // Filter by category if requested
  if (params.category && params.category !== "ALL") {
    certificates = certificates.filter((c) => c.category_id === params.category);
  }

  const enrichedCerts = certificates
    .map((c) => ({
      ...c,
      category: db.categories.find((cat) => cat.id === c.category_id),
      files: db.certificateFiles.filter((f) => f.certificate_id === c.id),
      points: db.pointRecords.filter((p) => p.certificate_id === c.id),
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const currentStatus = params.status || "ALL";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            My Certificates & Submissions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse all submitted credentials, track verification status, and resubmit requested revisions.
          </p>
        </div>

        <Link href="/student/submit">
          <Button className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold h-10 shadow-sm">
            <UploadCloud className="h-4 w-4 mr-1.5" />
            Submit New Certificate
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
        {[
          { key: "ALL", label: "All Submissions" },
          { key: "SUBMITTED", label: "Submitted" },
          { key: "UNDER_REVIEW", label: "In Review" },
          { key: "CORRECTION_REQUIRED", label: "Corrections" },
          { key: "APPROVED", label: "Approved" },
          { key: "REJECTED", label: "Rejected" },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={`/student/certificates?status=${tab.key}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentStatus === tab.key
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Certificate Grid */}
      {enrichedCerts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <FileCheck2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700">No certificates match your criteria</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try choosing a different status filter or submit a new certificate.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {enrichedCerts.map((c) => (
            <CertificateCard key={c.id} certificate={c} />
          ))}
        </div>
      )}
    </div>
  );
}
