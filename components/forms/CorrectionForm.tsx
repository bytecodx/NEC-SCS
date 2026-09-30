"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Certificate, CertificateReview, Category, EventLevel } from "@/types/database.types";
import { resubmitCertificateAction } from "@/actions/certificates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import {
  AlertTriangle,
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Clock,
} from "lucide-react";
import { formatFileSize } from "@/lib/utils/formatters";

interface CorrectionFormProps {
  certificate: Certificate;
  latestReview?: CertificateReview;
  categories: Category[];
}

export function CorrectionForm({ certificate, latestReview, categories }: CorrectionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Editable fields
  const [title, setTitle] = useState(certificate.title);
  const [eventName, setEventName] = useState(certificate.event_name);
  const [categoryId, setCategoryId] = useState(certificate.category_id);
  const [eventLevel, setEventLevel] = useState<EventLevel>(certificate.event_level);
  const [organizer, setOrganizer] = useState(certificate.organizer);
  const [eventDate, setEventDate] = useState(certificate.event_date);
  const [achievement, setAchievement] = useState(certificate.achievement);
  const [description, setDescription] = useState(certificate.description || "");

  // New file state (optional replacement)
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFileBase64(result.split(",")[1]);
    };
    reader.readAsDataURL(selected);
  };

  const removeFile = () => {
    setFile(null);
    setFileBase64(null);
    setFileError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await resubmitCertificateAction(
        certificate.id,
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
        file && fileBase64
          ? {
              originalFilename: file.name,
              fileSize: file.size,
              mimeType: file.type,
              base64Data: fileBase64,
            }
          : undefined
      );

      if (!res.success) {
        setError(res.error || "Failed to resubmit certificate");
        return;
      }

      router.refresh();
    });
  };

  return (
    <Card className="p-6 border-amber-300 bg-amber-50/20 shadow-sm space-y-5">
      {/* Reviewer Notice Header */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span>Faculty Correction Requested</span>
        </div>
        {latestReview?.reason && (
          <p className="text-xs font-semibold text-amber-800 mb-1">
            Reason: {latestReview.reason}
          </p>
        )}
        {latestReview?.comment && (
          <p className="text-xs text-amber-900 bg-white/80 p-2.5 rounded-lg border border-amber-200">
            "{latestReview.comment}"
          </p>
        )}
      </div>

      {error && (
        <Alert
          variant="error"
          title="Resubmission Error"
          onClear={() => setError(null)}
          clearLabel="Clear"
        >
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Achievement Title
            </label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Event Name</label>
            <Input value={eventName} onChange={(e) => setEventName(e.target.value)} required />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Organizing Body</label>
            <Input value={organizer} onChange={(e) => setOrganizer(e.target.value)} required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Event Date</label>
            <Input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Standing / Rank</label>
            <Input
              value={achievement}
              onChange={(e) => setAchievement(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Summary / Notes for Reviewer
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
          />
        </div>

        {/* Upload replacement certificate */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Upload Revised Document (Replaces current primary file as Version 2)
          </label>

          {fileError && <p className="text-xs text-rose-600 mb-2">{fileError}</p>}

          {!file ? (
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-amber-300 hover:border-amber-400 rounded-xl bg-amber-50/40 cursor-pointer transition-all">
              <UploadCloud className="h-8 w-8 text-amber-600 mb-1" />
              <span className="text-xs font-semibold text-slate-700">
                Click to attach revised certificate scan/PDF
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Previous file versions will remain archived in the audit trail.
              </span>
              <input
                type="file"
                accept=".pdf,image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="p-3 rounded-lg border border-amber-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800">{file.name}</p>
                  <p className="text-[11px] text-slate-400">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="p-1 text-slate-400 hover:text-rose-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Resubmission Request Date & Time */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs mb-4">
          <span className="flex items-center gap-1.5 font-medium text-amber-900">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span>Resubmission Request Timestamp:</span>
          </span>
          <span className="font-mono font-bold text-amber-950 bg-white px-2.5 py-0.5 rounded-lg border border-amber-200">
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} • {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-10 text-xs"
        >
          {isPending ? "Resubmitting for Review..." : "Resubmit Revised Certificate"}
        </Button>
      </form>
    </Card>
  );
}
