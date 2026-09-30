"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/database.types";
import { switchRoleAction } from "@/actions/auth";
import {
  GraduationCap,
  Award,
  Building2,
  ShieldCheck,
  ChevronDown,
  Check,
  Loader2,
} from "lucide-react";

interface RoleOption {
  role: UserRole;
  label: string;
  name: string;
  dept: string;
  icon: React.ElementType;
  badgeBg: string;
  badgeText: string;
  activeRing: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: "STUDENT",
    label: "Student",
    name: "Aditya Verma",
    dept: "Computer Science",
    icon: GraduationCap,
    badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
    badgeText: "text-sky-600",
    activeRing: "ring-sky-500",
  },
  {
    role: "FACULTY",
    label: "Faculty",
    name: "Prof. Sharma",
    dept: "CSE Reviewer",
    icon: Award,
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    badgeText: "text-emerald-600",
    activeRing: "ring-emerald-500",
  },
  {
    role: "HOD",
    label: "HOD",
    name: "Dr. Murugan Pillai",
    dept: "HOD - CSE",
    icon: Building2,
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    badgeText: "text-indigo-600",
    activeRing: "ring-indigo-500",
  },
  {
    role: "ADMIN",
    label: "Dean / Admin",
    name: "Dr. Arthur Vance",
    dept: "Institution Admin",
    icon: ShieldCheck,
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    badgeText: "text-amber-600",
    activeRing: "ring-amber-500",
  },
];

interface RoleSwitcherDropdownProps {
  currentRole?: UserRole;
  variant?: "navbar" | "compact" | "banner";
  className?: string;
}

export function RoleSwitcherDropdown({
  currentRole = "STUDENT",
  variant = "navbar",
  className = "",
}: RoleSwitcherDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [targetRole, setTargetRole] = useState<UserRole | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOption =
    ROLE_OPTIONS.find((opt) => opt.role === currentRole) || ROLE_OPTIONS[0];
  const ActiveIcon = activeOption.icon;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSelectRole = async (role: UserRole) => {
    if (role === currentRole && !isSwitching) {
      setIsOpen(false);
      return;
    }

    setIsSwitching(true);
    setTargetRole(role);
    setIsOpen(false);

    try {
      const res = await switchRoleAction(role);
      if (res.success && res.redirectPath) {
        router.push(res.redirectPath);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to switch role:", err);
    } finally {
      setIsSwitching(false);
      setTargetRole(null);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => !isSwitching && setIsOpen(!isOpen)}
        disabled={isSwitching}
        className={`inline-flex items-center gap-2 rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          variant === "banner"
            ? "px-3.5 py-2 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-white shadow-sm focus:ring-amber-400"
            : "px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 hover:border-slate-300 shadow-2xs focus:ring-primary-500"
        } ${isSwitching ? "opacity-75 cursor-wait" : "cursor-pointer"}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {isSwitching ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-600" />
        ) : (
          <ActiveIcon className={`h-3.5 w-3.5 ${activeOption.badgeText}`} />
        )}

        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className="text-slate-400 hidden sm:inline">Role:</span>
          <span className={variant === "banner" ? "text-white font-bold" : "text-slate-900 font-bold"}>
            {isSwitching && targetRole
              ? `Switching to ${ROLE_OPTIONS.find((r) => r.role === targetRole)?.label}...`
              : activeOption.label}
          </span>
        </div>

        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-slate-700" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu Modal / Popover */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-[100] animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Header */}
          <div className="px-4 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Switch Institutional Portal
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Select an institutional persona to switch view & permissions
            </p>
          </div>

          {/* Role List */}
          <div className="p-1.5 space-y-1">
            {ROLE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = option.role === currentRole;

              return (
                <button
                  key={option.role}
                  type="button"
                  onClick={() => handleSelectRole(option.role)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between group ${
                    isSelected
                      ? "bg-slate-50 border border-slate-200 shadow-2xs font-semibold"
                      : "hover:bg-slate-50/80 border border-transparent"
                  }`}
                  role="menuitem"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center border shrink-0 ${option.badgeBg}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                          {option.label}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {option.name} • {option.dept}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Info Footer */}
          <div className="px-4 py-2 bg-slate-50/80 text-[10px] text-slate-400 rounded-b-xl flex items-center justify-between">
            <span>Demo Mode Active</span>
            <span className="font-mono text-slate-500">1-Click Fast Switch</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Separate dedicated role switcher bar (Clean, non-nested, zero overlap)
 */
export function SeparateRoleBar({
  currentRole = "ADMIN",
  className = "",
}: {
  currentRole?: UserRole;
  className?: string;
}) {
  const router = useRouter();
  const [isSwitching, setIsSwitching] = useState(false);
  const [targetRole, setTargetRole] = useState<UserRole | null>(null);

  const handleSelectRole = async (role: UserRole) => {
    if (role === currentRole && !isSwitching) return;
    setIsSwitching(true);
    setTargetRole(role);

    try {
      const res = await switchRoleAction(role);
      if (res.success && res.redirectPath) {
        router.push(res.redirectPath);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to switch role:", err);
    } finally {
      setIsSwitching(false);
      setTargetRole(null);
    }
  };

  return (
    <div
      className={`p-3.5 sm:p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-16 rounded-xl bg-white p-1 border border-slate-200/90 shadow-2xs shrink-0 flex items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/nec-logo.png"
            alt="Nandha Engineering College (NEC) Logo"
            className="h-full w-full object-contain"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-900 tracking-tight">
              NEC Portal Role Switcher
            </span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
              NEC Portal
            </span>
            <span className="hidden sm:inline-flex text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              1-Click Fast Switch
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Switch institutional portal view between Dean / Admin, HOD, Faculty Reviewer, and Student.
          </p>
        </div>
      </div>

      {/* Separate Persona Switcher Controls */}
      <div className="flex items-center gap-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {ROLE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = opt.role === currentRole;
            const isPending = isSwitching && targetRole === opt.role;

            return (
              <button
                key={opt.role}
                type="button"
                disabled={isSwitching}
                onClick={() => handleSelectRole(opt.role)}
                title={`Switch to ${opt.label} (${opt.name})`}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-primary-500/30"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300"
                } ${isSwitching ? "cursor-wait opacity-80" : "cursor-pointer"}`}
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-400" />
                ) : (
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-amber-400" : opt.badgeText}`} />
                )}
                <span className="truncate">{opt.label}</span>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 ml-auto shrink-0 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
