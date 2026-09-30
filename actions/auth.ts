"use server";

import { loginSchema, LoginFormData } from "@/lib/validators/user";
import { getDB } from "@/lib/db/store";
import { setSessionUser, clearSessionUser, getCurrentUser } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/audit/logger";
import { revalidatePath } from "next/cache";

export async function loginAction(data: LoginFormData) {
  const validation = loginSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || "Invalid input",
    };
  }

  const { identifier, password } = validation.data;
  const db = getDB();

  // Find profile by email (supports @nandhaengg.org, @nandha.edu, @nec.edu.in, @abctech.edu) OR by student register number OR faculty employee id
  const normalizedId = identifier.toLowerCase().trim();
  const getUsername = (email: string) => email.split("@")[0];
  const inputUser = getUsername(normalizedId);

  let matchedProfile = db.profiles.find((p) => {
    if (!p.is_active) return false;
    const profileEmail = p.email.toLowerCase();
    const profileUser = getUsername(profileEmail);
    return (
      profileEmail === normalizedId ||
      (profileUser === inputUser &&
        (normalizedId.includes("@nandha") ||
          normalizedId.includes("@nec.") ||
          normalizedId.includes("@abctech.")))
    );
  });

  if (!matchedProfile) {
    // Check student register number
    const student = db.students.find(
      (s) => s.register_number.toLowerCase() === identifier.toLowerCase()
    );
    if (student) {
      matchedProfile = db.profiles.find((p) => p.id === student.profile_id && p.is_active);
    }
  }

  if (!matchedProfile) {
    // Check faculty employee ID
    const faculty = db.faculty.find(
      (f) => f.employee_id.toLowerCase() === identifier.toLowerCase()
    );
    if (faculty) {
      matchedProfile = db.profiles.find((p) => p.id === faculty.profile_id && p.is_active);
    }
  }

  if (!matchedProfile) {
    return {
      success: false,
      error: "Account not found or inactive. Please contact your college administrator.",
    };
  }

  // Set session cookie
  await setSessionUser(matchedProfile.id);

  // Log audit event
  await logAuditEvent({
    collegeId: matchedProfile.college_id,
    actorId: matchedProfile.id,
    action: "LOGIN",
    entityType: "USER",
    entityId: matchedProfile.id,
    metadata: { email: matchedProfile.email, role: matchedProfile.role },
  });

  return {
    success: true,
    role: matchedProfile.role,
  };
}

export async function logoutAction() {
  const user = await getCurrentUser();
  await clearSessionUser();
  revalidatePath("/");
  return { success: true };
}

export async function getSessionAction() {
  const user = await getCurrentUser();
  return { user };
}

export async function switchRoleAction(targetRole: "STUDENT" | "FACULTY" | "HOD" | "ADMIN") {
  const roleEmails: Record<string, { email: string; path: string }> = {
    STUDENT: { email: "aditya.verma@student.abctech.edu", path: "/student/dashboard" },
    FACULTY: { email: "prof.sharma@abctech.edu", path: "/faculty/dashboard" },
    HOD: { email: "hod.cse@abctech.edu", path: "/hod/dashboard" },
    ADMIN: { email: "admin@abctech.edu", path: "/admin/dashboard" },
  };

  const config = roleEmails[targetRole];
  if (!config) {
    return { success: false, error: "Invalid role specified" };
  }

  const db = getDB();
  const profile = db.profiles.find(
    (p) => p.email.toLowerCase() === config.email.toLowerCase() && p.is_active
  );
  if (!profile) {
    return { success: false, error: "User profile not found" };
  }

  await setSessionUser(profile.id);

  await logAuditEvent({
    collegeId: profile.college_id,
    actorId: profile.id,
    action: "LOGIN",
    entityType: "USER",
    entityId: profile.id,
    metadata: { switchType: "ROLE_SWITCH", targetRole, email: profile.email },
  });

  revalidatePath("/");
  revalidatePath("/student/dashboard");
  revalidatePath("/faculty/dashboard");
  revalidatePath("/hod/dashboard");
  revalidatePath("/admin/dashboard");

  return { success: true, redirectPath: config.path };
}
