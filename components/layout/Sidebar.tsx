"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CampusCredLogo } from "./CampusCredLogo";
import { UserRole } from "@/types/database.types";
import { logoutAction } from "@/actions/auth";
import {
  LayoutDashboard,
  Award,
  UploadCloud,
  FileCheck2,
  UserCheck,
  Bell,
  Users,
  Building2,
  FolderTree,
  BarChart3,
  FileSpreadsheet,
  ShieldAlert,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SidebarProps {
  role: UserRole;
  userName: string;
  departmentName?: string;
  unreadNotifications?: number;
}

export function Sidebar({
  role,
  userName,
  departmentName,
  unreadNotifications = 0,
}: SidebarProps) {
  const pathname = usePathname();

  const studentLinks = [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/certificates", label: "Certificates", icon: FileCheck2 },
    { href: "/student/submit", label: "Submit Certificate", icon: UploadCloud },
    { href: "/student/achievements", label: "Achievement Wallet", icon: Award },
    { href: "/student/profile", label: "Achievement Passport", icon: Sparkles },
    {
      href: "/student/notifications",
      label: "Notifications",
      icon: Bell,
      badge: unreadNotifications > 0 ? unreadNotifications : undefined,
    },
  ];

  const facultyLinks = [
    { href: "/faculty/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/faculty/reviews", label: "Review Queue", icon: FileCheck2 },
    { href: "/faculty/students", label: "Department Students", icon: Users },
    {
      href: "/faculty/notifications",
      label: "Notifications",
      icon: Bell,
      badge: unreadNotifications > 0 ? unreadNotifications : undefined,
    },
  ];

  const hodLinks = [
    { href: "/hod/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/faculty/reviews", label: "Department Reviews", icon: FileCheck2 },
    { href: "/hod/students", label: "Students", icon: Users },
    { href: "/hod/analytics", label: "Department Analytics", icon: BarChart3 },
    { href: "/hod/reports", label: "Reports Export", icon: FileSpreadsheet },
    {
      href: "/faculty/notifications",
      label: "Notifications",
      icon: Bell,
      badge: unreadNotifications > 0 ? unreadNotifications : undefined,
    },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users & Faculty", icon: Users },
    { href: "/admin/departments", label: "Departments", icon: Building2 },
    { href: "/admin/categories", label: "Categories", icon: FolderTree },
    { href: "/admin/reports", label: "Reports & Exports", icon: FileSpreadsheet },
    { href: "/admin/analytics", label: "Institutional Analytics", icon: BarChart3 },
    { href: "/admin/audit-logs", label: "Audit Logs", icon: ShieldAlert },
    { href: "/admin/settings", label: "College Settings", icon: Settings },
  ];

  let links = studentLinks;
  if (role === "FACULTY") links = facultyLinks;
  else if (role === "HOD") links = hodLinks;
  else if (role === "ADMIN") links = adminLinks;

  const handleLogout = async () => {
    await logoutAction();
    window.location.href = "/login";
  };

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40 bg-white border-r border-slate-200">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <Link href="/">
          <CampusCredLogo size={32} />
        </Link>
      </div>

      {/* Role Pill & Dept Info */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-navy-900 text-white">
            {role}
          </span>
          {departmentName && (
            <span className="text-xs font-semibold text-slate-500 truncate max-w-[120px]">
              {departmentName}
            </span>
          )}
        </div>
        <p className="text-xs font-medium text-slate-800 mt-1.5 truncate">
          {userName}
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150",
                isActive
                  ? "bg-primary-50 text-primary-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-primary-600" : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
                <span>{link.label}</span>
              </div>
              {link.badge ? (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-primary-600 rounded-full">
                  {link.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
