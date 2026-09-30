"use client";

import React from "react";
import Link from "next/link";
import { CampusCredLogo } from "./CampusCredLogo";
import { UserRole } from "@/types/database.types";
import { Bell, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { RoleSwitcherDropdown } from "./RoleSwitcherDropdown";

interface NavbarProps {
  title?: string;
  collegeName?: string;
  role: UserRole;
  userName: string;
  unreadCount?: number;
}

export function Navbar({
  title = "Dashboard",
  collegeName = "Nandha Engineering College (NEC)",
  role,
  userName,
  unreadCount = 0,
}: NavbarProps) {
  const notifUrl =
    role === "STUDENT"
      ? "/student/notifications"
      : role === "ADMIN"
      ? "/admin/dashboard"
      : "/faculty/notifications";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 md:px-8 backdrop-blur-md">
      {/* Left: Mobile Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <Link href="/">
            <CampusCredLogo size={28} showText={false} />
          </Link>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-primary-50 text-primary-700 border border-primary-200">
              NEC
            </span>
          </div>
          <p className="hidden sm:block text-xs text-slate-500 font-medium">
            {collegeName}
          </p>
        </div>
      </div>

      {/* Right: Role Switcher, Notifications & User Card */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Role Switcher Dropdown (HOD, Dean, Student, Faculty) */}
        <RoleSwitcherDropdown currentRole={role} variant="navbar" />

        {role === "STUDENT" && (
          <Link
            href="/student/profile"
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-600/10 text-amber-900 border border-amber-300 hover:shadow-sm transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>Digital Passport</span>
          </Link>
        )}

        <Link
          href={notifUrl}
          className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* User initials circle */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="h-8 w-8 rounded-full bg-navy-900 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            {userName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 leading-tight">
              {userName}
            </span>
            <span className="text-[10px] text-slate-400 capitalize">{role.toLowerCase()}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
