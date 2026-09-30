"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Category, EventLevel } from "@/types/database.types";
import { SmartChecklist } from "@/components/certificates/SmartChecklist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { createCertificateAction } from "@/actions/certificates";
import {
  UploadCloud,
  FileCheck2,
  AlertCircle,
  FileText,
  Calendar,
  Building,
  Award,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Clock,
} from "lucide-react";
import { formatFileSize } from "@/lib/utils/formatters";

interface SubmitCertificateFormProps {
  categories: Category[];
}

export function SubmitCertificateForm({ categories }: SubmitCertificateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form Fields
  const [title, setTitle] = useState("");
  const [eventName, setEventName] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [eventLevel, setEventLevel] = useState<EventLevel>("COLLEGE");
  const [organizer, setOrganizer] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [achievement, setAchievement] = useState("");
  const [description, setDescription] = useState("");
  const [isDeclared, setIsDeclared] = useState(false);

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Client-side SHA-256 calculation
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 10 * 1024 * 1024) {
      setFileError("File exceeds 10MB maximum limit.");
      return;
    }

    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(selected.type)) {
      setFileError("Only PDF, JPEG, and PNG files are accepted.");
      return;
    }

    setFileError(null);
    setFile(selected);

    // Read as Base64 and compute SHA-256 hash using Web Crypto API
    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      setFileBase64(base64);

      // Web crypto SHA-256
      try {
        const arrayBuffer = await selected.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        setFileHash(hashHex);
      } catch (err) {
        console.error("Hash calculation failed", err);
      }
    };
    reader.readAsDataURL(selected);
  };

  const removeFile = () => {
    setFile(null);
    setFileBase64(null);
    setFileHash(null);
    setFileError(null);
  };

  // Readiness Checklist Items
  const checklistItems = [
    { key: "title", label: "Descriptive achievement title", isCompleted: title.trim().length >= 3 },
    { key: "event", label: "Event & organizer identified", isCompleted: eventName.trim().length >= 2 && organizer.trim().length >= 2 },
    { key: "category", label: "Category & level selected", isCompleted: Boolean(categoryId && eventLevel) },
    { key: "date", label: "Valid event date", isCompleted: Boolean(eventDate) },
    { key: "achievement", label: "Achievement standing / rank", isCompleted: achievement.trim().length >= 2 },
    { key: "file", label: "Primary certificate document (≤ 10MB)", isCompleted: Boolean(file && fileBase64) },
    { key: "declaration", label: "Student authenticity declaration", isCompleted: isDeclared },
  ];

  const isReady = checklistItems.every((item) => item.isCompleted);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReady || !file || !fileBase64) {
      setError("Please complete all checklist requirements before submitting.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await createCertificateAction(
        {
          title: title.trim(),
          event_name: eventName.trim(),
          category_id: categoryId,
          event_level: eventLevel,
          organizer: organizer.trim(),
          event_date: eventDate,
          achievement: achievement.trim(),
          description: description.trim() || undefined,
        },
        {
          originalFilename: file.name,
          fileSize: file.size,
          mimeType: file.type,
          base64Data: fileBase64,
          isSupporting: false,
        }
      );

      if (!res.success) {
        setError(res.error || "Failed to submit certificate");
        return;
      }

      router.push(`/student/certificates/${res.certificateId}`);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Submission Form */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert
              variant="error"
              title="Submission Incomplete"
              onClear={() => setError(null)}
              clearLabel="Clear"
            >
              {error}
            </Alert>
          )}

          {/* Section 1: Basic Information */}
          <Card className="p-6 border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <Award className="h-4 w-4 text-primary-600" />
              <span>Achievement & Event Details</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Achievement Title <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. 1st Place - National AI Hackathon 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="text-sm"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Clear summary of your award, rank, or credential.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Event Level <span className="text-rose-500">*</span>
                </label>
                <select
                  value={eventLevel}
                  onChange={(e) => setEventLevel(e.target.value as EventLevel)}
                  className="w-full text-sm p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="COLLEGE">College Level</option>
                  <option value="INTRA_COLLEGE">Intra-College</option>
                  <option value="INTER_COLLEGE">Inter-College</option>
                  <option value="DISTRICT">District Level</option>
                  <option value="STATE">State Level</option>
                  <option value="NATIONAL">National Level</option>
                  <option value="INTERNATIONAL">International Level</option>
                  <option value="OTHER">Other Recognition</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Event / Competition Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Smart India Hackathon"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Organizing Body / Institution <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. AICTE / Ministry of Education"
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Event / Completion Date <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Standing / Outcome <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Winner, 1st Runner Up, Participant"
                  value={achievement}
                  onChange={(e) => setAchievement(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Summary / Project Abstract (Optional)
              </label>
              <textarea
                placeholder="Describe your role, project topic, or details to assist faculty reviewers..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </Card>

          {/* Section 2: Document Upload */}
          <Card className="p-6 border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <UploadCloud className="h-4 w-4 text-primary-600" />
              <span>Primary Document Evidence</span>
            </h3>

            {fileError && (
              <Alert
                variant="error"
                title="File Upload Notice"
                onClear={() => setFileError(null)}
                clearLabel="Clear"
              >
                {fileError}
              </Alert>
            )}

            {!file ? (
              <label className="relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 hover:border-primary-500 rounded-xl bg-slate-50/70 hover:bg-slate-50 cursor-pointer transition-all">
                <UploadCloud className="h-10 w-10 text-slate-400 mb-2" />
                <span className="text-sm font-semibold text-slate-700">
                  Click to upload or drag & drop certificate
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  PDF, PNG, or JPEG (Max file size 10MB)
                </span>
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 truncate max-w-xs sm:max-w-md">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-mono font-medium">Ready</span>
                    </div>
                    {fileHash && (
                      <p className="text-[10px] font-mono text-slate-400 truncate max-w-xs mt-0.5">
                        SHA-256: {fileHash.slice(0, 16)}...
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="Remove file"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </Card>

          {/* Section 3: Declaration & Submit */}
          <Card className="p-6 border-slate-200 shadow-2xs space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDeclared}
                  onChange={(e) => setIsDeclared(e.target.checked)}
                  className="mt-1 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-xs text-slate-700 leading-relaxed font-medium">
                  I solemnly declare that the certificate attached is genuine, issued in my name, and that the event was attended by me. I understand that submitting fraudulent or tampered credentials incurs disciplinary action and permanent revocation of co-curricular credits.
                </span>
              </label>
            </div>

            {/* Request & Submission Date and Time */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <Clock className="h-3.5 w-3.5 text-primary-600" />
                <span>Request &amp; Submission Timestamp:</span>
              </span>
              <span className="font-mono font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} • {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            <Button
              type="submit"
              disabled={!isReady || isPending}
              className="w-full h-11 text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
            >
              {isPending ? "Submitting for Institutional Verification..." : "Submit for Faculty Verification"}
            </Button>
          </Card>
        </form>
      </div>

      {/* Sidebar: Smart Readiness Checklist */}
      <div className="space-y-4">
        <SmartChecklist items={checklistItems} />

        <Card className="p-5 border-slate-200 bg-white">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Verification Policy
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            All submitted certificates undergo strict human review by assigned faculty within your department. No automated approvals or computer-assigned points are applied.
          </p>
          <div className="mt-3 text-[11px] text-slate-500 space-y-1">
            <p>• Byte-level SHA-256 duplicate detection active.</p>
            <p>• Review locks prevent simultaneous duplicate evaluations.</p>
            <p>• Points are capped according to college regulations.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
