import { z } from "zod";

export const eventLevelEnum = z.enum([
  "COLLEGE",
  "INTRA_COLLEGE",
  "INTER_COLLEGE",
  "DISTRICT",
  "STATE",
  "NATIONAL",
  "INTERNATIONAL",
  "OTHER",
]);

export const certificateFormSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title cannot exceed 150 characters"),
  event_name: z
    .string()
    .min(2, "Event name is required")
    .max(150, "Event name cannot exceed 150 characters"),
  category_id: z.string().uuid("Please select a valid category"),
  event_level: eventLevelEnum,
  organizer: z
    .string()
    .min(2, "Organizer is required")
    .max(150, "Organizer cannot exceed 150 characters"),
  event_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid event date"),
  achievement: z
    .string()
    .min(2, "Achievement / Rank / Role is required")
    .max(100, "Achievement cannot exceed 100 characters"),
  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .nullable(),
});

export type CertificateFormData = z.infer<typeof certificateFormSchema>;
