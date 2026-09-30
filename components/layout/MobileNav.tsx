"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/types/database.types";
import {
  LayoutDashboard,
  Award,
  UploadCloud,
  FileCheck2,
  Bell,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface MobileNavProps {
  role: UserRole;
  unreadNotifications?: number;
}

export function MobileNav({ role, unreadNotifications = 0 }: MobileNavProps) {
  const pathname = usePathname();

  const studentLinks = [
    { href: "/student/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/student/certificates", label: "Certificates", icon: FileCheck2 },
    { href: "/student/submit", label: "Submit", icon: UploadCloud, highlight: true },
    { href: "/student/achievements", label: "Wallet", icon: Award },
    {
      href: "/student/notifications",
      label: "Alerts",
      icon: Bell,
      badge: unreadNotifications,
    },
  ];

  const facultyLinks = [
    { href: "/faculty/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/faculty/reviews", label: "Queue", icon: FileCheck2 },
    { href: "/faculty/students", label: "Students", icon: Users },
    {
      href: "/faculty/notifications",
      label: "Alerts",
      icon: Bell,
      badge: unreadNotifications,
    },
  ];

  const hodLinks = [
    { href: "/hod/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/faculty/reviews", label: "Reviews", icon: FileCheck2 },
    { href: "/hod/analytics", label: "Analytics", icon: BarChart3 },
    {
      href: "/faculty/notifications",
      label: "Alerts",
      icon: Bell,
      badge: unreadNotifications,
    },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  let links = studentLinks;
  if (role === "FACULTY") links = facultyLinks;
  else if (role === "HOD") links = hodLinks;
  else if (role === "ADMIN") links = adminLinks;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lift">
      <nav className="flex items-center justify-around">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-xs font-medium transition-colors relative",
                isActive
                  ? "text-primary-600 font-bold"
                  : "text-slate-500 hover:text-slate-800",
                link.highlight && "text-primary-600"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "h-5 w-5 mb-0.5",
                    isActive ? "text-primary-600 scale-110" : "text-slate-500",
                    link.highlight && "text-primary-600"
                  )}
                />
                {link.badge && link.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    {link.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] tracking-tight">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
