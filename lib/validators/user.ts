import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(3, "Please enter your email or register number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const collegeSettingsSchema = z.object({
  college_id: z.string().optional(),
  max_points_per_certificate: z.number().min(10).max(500),
  reviewer_reclaim_timeout_minutes: z.number().min(5).max(180),
  max_file_size_mb: z.number().min(1).max(50),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type CollegeSettingsData = z.infer<typeof collegeSettingsSchema>;
