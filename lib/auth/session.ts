import { cookies } from "next/headers";
import { getDB } from "@/lib/db/store";
import { Profile, Student, Faculty, Department, UserRole } from "@/types/database.types";
import { createServerSupabaseClient } from "./supabase-server";

export interface AuthenticatedUser {
  profile: Profile;
  student?: Student & { department?: Department };
  faculty?: Faculty & { department?: Department };
}

const SESSION_COOKIE_NAME = "campuscred_session_user_id";

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const db = getDB();

  let sessionUserId: string | undefined;
  try {
    const cookieStore = await cookies();
    sessionUserId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  } catch {
    // When called outside request scope (e.g. testing scripts), fallback to admin profile
    const adminProfile = db.profiles.find((p) => p.role === "ADMIN" && p.is_active);
    if (adminProfile) {
      return buildAuthenticatedUser(adminProfile, db);
    }
    return null;
  }

  // 1. Try Supabase Auth session first if Supabase is active
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const profile = db.profiles.find((p) => p.id === user.id && p.is_active);
      if (profile) {
        return buildAuthenticatedUser(profile, db);
      }
    }
  } catch {
    // If Supabase is unreachable or not configured yet, proceed to cookie-based session
  }

  // 2. Cookie session fallback (works in local dev, preview, demo)
  if (!sessionUserId) {
    return null;
  }

  const profile = db.profiles.find((p) => p.id === sessionUserId && p.is_active);
  if (!profile) {
    return null;
  }

  return buildAuthenticatedUser(profile, db);
}

function buildAuthenticatedUser(profile: Profile, db: ReturnType<typeof getDB>): AuthenticatedUser {
  if (profile.role === "STUDENT") {
    const student = db.students.find((s) => s.profile_id === profile.id);
    if (student) {
      const department = db.departments.find((d) => d.id === student.department_id);
      return {
        profile,
        student: { ...student, department },
      };
    }
  }

  if (profile.role === "FACULTY" || profile.role === "HOD") {
    const faculty = db.faculty.find((f) => f.profile_id === profile.id);
    if (faculty) {
      const department = db.departments.find((d) => d.id === faculty.department_id);
      return {
        profile,
        faculty: { ...faculty, department },
      };
    }
  }

  return { profile };
}

export async function setSessionUser(profileId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, profileId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionUser(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore Supabase signout error if offline
  }
}

export async function requireUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Please sign in to continue");
  }
  return user;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<AuthenticatedUser> {
  const user = await requireUser();
  if (!allowedRoles.includes(user.profile.role)) {
    throw new Error(`Forbidden: Access restricted to roles: ${allowedRoles.join(", ")}`);
  }
  return user;
}
