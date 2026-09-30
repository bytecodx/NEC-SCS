import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NEC Portal — Nandha Engineering College | Verified Student Achievements",
  description:
    "Nandha Engineering College (NEC) Autonomous Institutional Co-Curricular Credential Management & Faculty Verification Portal.",
  applicationName: "NEC Portal",
  manifest: "/manifest.json",
  icons: {
    icon: "/nec-logo.png",
    apple: "/nec-logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NEC Portal",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-primary-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
