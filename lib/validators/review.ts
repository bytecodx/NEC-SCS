import { z } from "zod";

export const REJECTION_REASONS = [
  "Invalid certificate",
  "Unclear certificate",
  "Duplicate submission",
  "Incorrect information",
  "Wrong category",
  "Missing information",
  "Event not eligible",
  "Certificate does not belong to student",
  "Unverified issuer/event",
  "Forged or altered document",
  "Not aligned with institutional criteria",
  "Other",
] as const;

export const approveCertificateSchema = z.object({
  certificate_id: z.string().uuid("Invalid certificate ID"),
  points: z
    .number()
    .min(0, "Points must be non-negative")
    .max(100, "Points cannot exceed the maximum allowed limit"),
  comment: z.string().max(500, "Comment cannot exceed 500 characters").optional().nullable(),
});

export const requestCorrectionSchema = z.object({
  certificate_id: z.string().uuid("Invalid certificate ID"),
  explanation: z
    .string()
    .min(5, "Correction explanation must be at least 5 characters")
    .max(500, "Explanation cannot exceed 500 characters")
    .optional(),
  reason: z.string().optional(),
  comment: z.string().optional(),
});

export const rejectCertificateSchema = z
  .object({
    certificate_id: z.string().uuid("Invalid certificate ID"),
    reason: z.enum(REJECTION_REASONS),
    comment: z.string().max(500, "Comment cannot exceed 500 characters").optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.reason === "Other") {
        return !!data.comment && data.comment.trim().length >= 5;
      }
      return true;
    },
    {
      message: "Please provide an explanation when selecting 'Other'",
      path: ["comment"],
    }
  );

export const pointCorrectionSchema = z.object({
  certificate_id: z.string().uuid("Invalid certificate ID"),
  student_id: z.string().uuid("Invalid student ID"),
  points: z.number().min(0, "Points must be non-negative").max(100),
  reason: z.string().min(5, "Correction reason is mandatory"),
});

export type ApproveCertificateData = z.infer<typeof approveCertificateSchema>;
export type RequestCorrectionData = z.infer<typeof requestCorrectionSchema>;
export type RejectCertificateData = z.infer<typeof rejectCertificateSchema>;
export type PointCorrectionData = z.infer<typeof pointCorrectionSchema>;
