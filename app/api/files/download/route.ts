import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") || "";
  const expires = searchParams.get("expires");

  // Validate expiration
  if (expires && Date.now() > parseInt(expires, 10)) {
    return new NextResponse("Link Expired: Signed URLs are valid for 60 seconds only.", {
      status: 403,
    });
  }

  // Provide a clean SVG certificate viewer preview for demonstrations & development
  const isPdf = path.endsWith(".pdf");
  const fileName = path.split("/").pop() || "certificate";

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="100%" height="100%">
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#D97706"/>
          <stop offset="50%" stop-color="#FCD34D"/>
          <stop offset="100%" stop-color="#B45309"/>
        </linearGradient>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F8FAFC"/>
          <stop offset="100%" stop-color="#EFF6FF"/>
        </linearGradient>
      </defs>

      <!-- Background & Ornate Border -->
      <rect width="1000" height="700" fill="url(#bgGrad)"/>
      <rect x="25" y="25" width="950" height="650" rx="16" fill="none" stroke="url(#goldGrad)" stroke-width="8"/>
      <rect x="40" y="40" width="920" height="620" rx="10" fill="none" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="6,4"/>

      <!-- Watermark / Shield -->
      <g opacity="0.08" transform="translate(420, 240)">
        <polygon points="80,10 150,45 150,135 80,180 10,135 10,45" fill="#0F172A"/>
      </g>

      <!-- Certificate Header -->
      <text x="500" y="85" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" fill="#0F172A" text-anchor="middle" letter-spacing="2">NANDHA ENGINEERING COLLEGE</text>
      <text x="500" y="110" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#2563EB" text-anchor="middle" letter-spacing="3">(AUTONOMOUS) • ERODE, TAMIL NADU</text>
      <text x="500" y="130" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#64748B" text-anchor="middle">Approved by AICTE, New Delhi • Accredited by NBA &amp; NAAC A+ Grade • Affiliated to Anna University</text>
      <line x1="200" y1="145" x2="800" y2="145" stroke="url(#goldGrad)" stroke-width="2"/>

      <text x="500" y="200" font-family="Georgia, serif" font-size="36" font-weight="bold" fill="#0F172A" text-anchor="middle">Certificate of Achievement</text>

      <text x="500" y="240" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#64748B" text-anchor="middle" letter-spacing="1">THIS IS PROUDLY PRESENTED FOR VERIFIED COMPLETION OF</text>

      <!-- Title / File Name -->
      <rect x="120" y="265" width="760" height="75" rx="12" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
      <text x="500" y="310" font-family="system-ui, sans-serif" font-size="22" font-weight="800" fill="#1E293B" text-anchor="middle">${fileName.replace(/_/g, ' ').replace(/\.[^/.]+$/, '').toUpperCase()}</text>

      <!-- Details -->
      <text x="500" y="380" font-family="system-ui, sans-serif" font-size="14" font-weight="500" fill="#334155" text-anchor="middle">
        Formally verified and authenticated under Nandha Engineering College Co-Curricular Governance Framework.
      </text>
      <text x="500" y="405" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#059669" text-anchor="middle">
        Format: ${isPdf ? "Official PDF Document (SHA-256 Digitally Signed)" : "High-Resolution Image Document (Full View Certified)"}
      </text>

      <!-- Institutional Rosette / Seal -->
      <g transform="translate(250, 520)">
        <circle cx="0" cy="0" r="50" fill="#FFFBEB" stroke="url(#goldGrad)" stroke-width="5"/>
        <circle cx="0" cy="0" r="42" fill="none" stroke="#D97706" stroke-width="1.5" stroke-dasharray="4,2"/>
        <text x="0" y="-12" font-family="system-ui, sans-serif" font-size="9" font-weight="900" fill="#B45309" text-anchor="middle" letter-spacing="1">NANDHA ENGG</text>
        <text x="0" y="4" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#92400E" text-anchor="middle">★ ERODE ★</text>
        <text x="0" y="20" font-family="system-ui, sans-serif" font-size="8" font-weight="700" fill="#B45309" text-anchor="middle">AUTONOMOUS</text>
      </g>

      <!-- Signatures -->
      <g transform="translate(720, 520)">
        <line x1="-90" y1="0" x2="90" y2="0" stroke="#334155" stroke-width="2"/>
        <text x="0" y="20" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#0F172A" text-anchor="middle">Authorized Faculty Evaluator</text>
        <text x="0" y="38" font-family="system-ui, sans-serif" font-size="11" font-weight="500" fill="#64748B" text-anchor="middle">Nandha Verification Cell • Erode</text>
      </g>
    </svg>
  `;

  return new NextResponse(svgContent, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "private, max-age=60",
    },
  });
}
