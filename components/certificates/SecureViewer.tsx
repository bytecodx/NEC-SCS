"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CertificateFile } from "@/types/database.types";
import { formatFileSize } from "@/lib/utils/formatters";
import {
  FileText,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Download,
  X,
  Printer,
  Sparkles,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SecureViewerProps {
  files: CertificateFile[];
  title: string;
  isDuplicateFlagged?: boolean;
}

export function SecureViewer({ files, title, isDuplicateFlagged }: SecureViewerProps) {
  const [selectedFileId, setSelectedFileId] = useState<string>(
    files[0]?.id || ""
  );
  const [copiedHash, setCopiedHash] = useState(false);

  // Full View & Zoom States
  const [isFullView, setIsFullView] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  const selectedFile = files.find((f) => f.id === selectedFileId) || files[0];

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  // Keyboard shortcut listener for Full View
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isFullView) return;
      if (e.key === "Escape") {
        setIsFullView(false);
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      } else if (e.key === "r" || e.key === "R") {
        handleRotate();
      } else if (e.key === "0") {
        handleResetZoom();
      }
    },
    [isFullView]
  );

  useEffect(() => {
    if (isFullView) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullView, handleKeyDown]);

  if (!selectedFile) {
    return (
      <Card className="p-8 text-center bg-slate-50 border-dashed border-2 border-slate-200 rounded-3xl">
        <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600">No document attached</p>
        <p className="text-xs text-slate-400 mt-1">This certificate does not have an uploaded file.</p>
      </Card>
    );
  }

  const isPdf = selectedFile.mime_type.includes("pdf");
  const isImage = selectedFile.mime_type.includes("image");

  // Secure download / signed URL route
  const downloadUrl = `/api/files/download?path=${encodeURIComponent(
    selectedFile.storage_path
  )}&filename=${encodeURIComponent(selectedFile.original_filename)}`;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(selectedFile.file_hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open(downloadUrl, "_blank");
    if (printWindow) {
      printWindow.onload = () => printWindow.print();
    }
  };

  return (
    <>
      <Card className="overflow-hidden border-slate-200/90 shadow-sm bg-white rounded-3xl">
        {/* Institutional Verification Header */}
        <div className="px-5 py-2.5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-extrabold uppercase tracking-wider text-slate-300">
              Nandha Engineering College, Erode
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline text-slate-400">Autonomous Evidence Vault</span>
          </div>
          <span className="text-[10px] font-mono text-primary-400 font-bold bg-primary-950/80 px-2 py-0.5 rounded border border-primary-800">
            SHA-256 SECURED
          </span>
        </div>

        {/* File Selector & Action Bar */}
        <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-600/20 text-primary-400 border border-primary-500/30 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold truncate max-w-xs sm:max-w-md text-white">
                {selectedFile.original_filename}
              </h4>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                <span>{formatFileSize(selectedFile.file_size)}</span>
                <span>•</span>
                <span className="uppercase font-semibold">{selectedFile.mime_type.split("/")[1]}</span>
                <span>•</span>
                <span className="font-mono text-emerald-400 font-bold">v{selectedFile.version}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {files.length > 1 && (
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-400 px-2 font-medium">Versions:</span>
                {files.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFileId(f.id)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                      selectedFileId === f.id
                        ? "bg-primary-600 text-white"
                        : "text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    v{f.version} {f.file_type === "SUPPORTING" && "(Supp)"}
                  </button>
                ))}
              </div>
            )}

            {/* FULL VIEW BUTTON */}
            <Button
              onClick={() => {
                setZoomLevel(1);
                setRotation(0);
                setIsFullView(true);
              }}
              className="bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Maximize2 className="h-4 w-4" />
              <span>Full View</span>
            </Button>

            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors h-9"
              title="Download original file"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>
          </div>
        </div>

        {/* Duplicate warning notification if detected */}
        {isDuplicateFlagged && (
          <div className="p-3.5 bg-amber-50 border-b border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Duplicate SHA-256 Hash Flag:</span> A byte-identical file is already recorded in the Nandha Engineering College repository. Reviewers must inspect originality and verify issuance records.
            </div>
          </div>
        )}

        {/* Inline Preview Area with Click-to-Full-View Overlay */}
        <div className="bg-slate-100/90 p-4 sm:p-6 min-h-[380px] flex items-center justify-center relative overflow-hidden">
          <div
            onClick={() => {
              setZoomLevel(1);
              setRotation(0);
              setIsFullView(true);
            }}
            className="group relative max-w-full rounded-2xl overflow-hidden border border-slate-300/80 shadow-md bg-white cursor-pointer transition-transform hover:shadow-xl"
            title="Click to open Full View modal"
          >
            {/* Certificate Preview Element */}
            <img
              src={downloadUrl}
              alt={title}
              className="max-h-[460px] w-auto object-contain mx-auto transition-transform duration-200 group-hover:scale-[1.01]"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />

            {/* Hover Full View Backdrop Overlay */}
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
              <span className="px-4 py-2.5 rounded-2xl bg-white text-slate-900 font-black text-xs shadow-2xl flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <ZoomIn className="h-4 w-4 text-primary-600" />
                <span>Click for Full View &amp; Zoom</span>
              </span>
              <span className="text-[11px] text-white/90 font-medium">
                Nandha Engineering College Official Archive
              </span>
            </div>

            {/* Bottom Caption Bar */}
            <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="truncate font-semibold text-slate-800">{title}</span>
              <span className="text-primary-600 font-bold flex items-center gap-1 shrink-0">
                <Eye className="h-3.5 w-3.5" />
                <span>Full View Available</span>
              </span>
            </div>
          </div>
        </div>

        {/* Audit & Integrity Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-bold text-slate-700">SHA-256 Hash:</span>
            <code className="text-[11px] font-mono bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-slate-700 select-all truncate max-w-[180px] sm:max-w-xs font-semibold">
              {selectedFile.file_hash}
            </code>
            <button
              onClick={handleCopyHash}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1"
              title="Copy SHA-256 hash"
            >
              {copiedHash ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">Archive Bucket:</span>
            <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded-md">
              certificates/nandha/
            </span>
          </div>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* FULL VIEW MODAL (FLUID FULLSCREEN LIGHTBOX FOR FACULTY EVALUATION)        */}
      {/* ========================================================================= */}
      {isFullView && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col text-white animate-in fade-in duration-200"
        >
          {/* Top Command Toolbar */}
          <div className="h-16 px-4 sm:px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0 shadow-lg">
            {/* Left: Institution & Document Metadata */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center font-black text-xs text-white shrink-0 shadow-md">
                NEC
              </div>
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white truncate">{title}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                    Full View Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  Nandha Engineering College, Erode • Official Reviewer Lightbox
                </p>
              </div>
            </div>

            {/* Center / Right: Zoom & Control Toolbar */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
                <Button
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.5}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>

                <button
                  onClick={handleResetZoom}
                  className="px-2.5 text-xs font-mono font-bold text-primary-300 hover:text-white transition-colors"
                  title="Reset Zoom (0)"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>

                <Button
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              {/* Rotate Button */}
              <Button
                onClick={handleRotate}
                variant="outline"
                size="sm"
                className="h-9 px-3 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 rounded-xl text-xs font-semibold"
                title="Rotate 90 degrees (R)"
              >
                <RotateCw className="h-3.5 w-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Rotate</span>
              </Button>

              {/* Print Button */}
              <Button
                onClick={handlePrint}
                variant="outline"
                size="sm"
                className="h-9 px-3 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 rounded-xl text-xs font-semibold"
                title="Print Certificate"
              >
                <Printer className="h-3.5 w-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Print</span>
              </Button>

              {/* Close Button */}
              <Button
                onClick={() => setIsFullView(false)}
                className="h-9 w-9 p-0 rounded-xl bg-slate-800 hover:bg-rose-600 text-white border border-slate-700 transition-colors"
                title="Exit Full View (Esc)"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Main Full View Canvas Area */}
          <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center relative select-none">
            {/* Ambient Background Glow Effect */}
            <div className="absolute w-[500px] h-[350px] bg-primary-500/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute w-[350px] h-[250px] bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />

            <div
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
                transition: "transform 0.15s ease-out",
              }}
              className="max-w-[95vw] max-h-[80vh] flex items-center justify-center relative z-10"
            >
              <img
                src={downloadUrl}
                alt={title}
                className="max-w-full max-h-[78vh] object-contain rounded-2xl shadow-2xl border border-slate-700/80 bg-white ring-1 ring-white/20 transition-shadow duration-300 hover:shadow-primary-500/10"
              />
            </div>
          </div>

          {/* Bottom Full View Status Strip */}
          <div className="h-12 px-6 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-300">File:</span>
              <span className="font-mono text-slate-200 truncate max-w-xs">{selectedFile.original_filename}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline font-mono text-emerald-400">
                SHA-256: {selectedFile.file_hash.slice(0, 16)}...
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span className="text-slate-400 hidden sm:inline">
                Shortcuts: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">+</kbd> zoom in • <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">-</kbd> zoom out • <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">R</kbd> rotate • <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">ESC</kbd> close
              </span>
              <span className="font-bold text-slate-300">
                Nandha Evaluation Cell
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
