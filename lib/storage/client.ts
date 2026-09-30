import crypto from "crypto";
import { getDB } from "@/lib/db/store";
import { CertificateFile } from "@/types/database.types";
import { createAdminSupabaseClient } from "@/lib/auth/supabase-server";

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateCertificateFile(file: {
  size: number;
  type: string;
}): FileValidationResult {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 10MB limit (uploaded: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file format (${file.type}). Allowed formats: PDF, JPG, JPEG, PNG`,
    };
  }

  return { valid: true };
}

export function calculateSHA256(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export function checkForDuplicateHash(hash: string): {
  isDuplicate: boolean;
  existingFile?: CertificateFile;
} {
  const db = getDB();
  const existing = db.certificateFiles.find((f) => f.file_hash === hash);
  if (existing) {
    return { isDuplicate: true, existingFile: existing };
  }
  return { isDuplicate: false };
}

/**
 * Generate a short-lived signed URL (default 60 seconds)
 * Ensures private storage access compliance.
 */
export async function generateSignedUrl(
  storagePath: string,
  expiresInSeconds = 60
): Promise<string> {
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase.storage
      .from("certificates")
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      // Return a secure proxy URL if Supabase bucket is not live
      return `/api/files/download?path=${encodeURIComponent(storagePath)}&expires=${Date.now() + expiresInSeconds * 1000}`;
    }

    return data.signedUrl;
  } catch {
    return `/api/files/download?path=${encodeURIComponent(storagePath)}&expires=${Date.now() + expiresInSeconds * 1000}`;
  }
}
