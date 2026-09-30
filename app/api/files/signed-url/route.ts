import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";
import { generateSignedUrl } from "@/lib/storage/client";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fileId } = body;

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    const db = getDB();
    const file = db.certificateFiles.find((f) => f.id === fileId);
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const certificate = db.certificates.find((c) => c.id === file.certificate_id);
    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    // Role-based authorization check
    const role = user.profile.role;
    if (role === "STUDENT") {
      if (user.student?.id !== certificate.student_id) {
        return NextResponse.json(
          { error: "Forbidden: You cannot view another student's certificate" },
          { status: 403 }
        );
      }
    } else if (role === "FACULTY" || role === "HOD") {
      const student = db.students.find((s) => s.id === certificate.student_id);
      if (student?.department_id !== user.faculty?.department_id) {
        return NextResponse.json(
          { error: "Forbidden: You can only view certificates from your department" },
          { status: 403 }
        );
      }
    } else if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const signedUrl = await generateSignedUrl(file.storage_path, 60);

    return NextResponse.json({
      success: true,
      signedUrl,
      expiresInSeconds: 60,
      mimeType: file.mime_type,
      filename: file.original_filename,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
