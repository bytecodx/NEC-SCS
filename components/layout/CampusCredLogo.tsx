import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  subtitle?: string;
  isDark?: boolean;
}

export function CampusCredLogo({
  className = "",
  size = 36,
  showText = true,
  subtitle,
  isDark = false,
}: LogoProps) {
  // Respect official logo's aspect ratio (~1.82)
  const emblemWidth = Math.round(size * 1.82);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official Nandha Engineering College Emblem */}
      <div
        className="relative flex items-center justify-center rounded-xl bg-white p-1 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all shrink-0 overflow-hidden"
        style={{ height: size, width: emblemWidth }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/nec-logo.png"
          alt="Nandha Engineering College (NEC) Official Logo"
          className="h-full w-full object-contain"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-black text-xl tracking-tight leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              NEC <span className="text-primary-500">Portal</span>
            </span>
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-300 border border-primary-500/30 tracking-wider">
              Autonomous
            </span>
          </div>
          {subtitle ? (
            <span className={`text-[11px] font-medium tracking-tight leading-none mt-0.5 ${isDark ? "text-slate-300" : "text-slate-500"}`}>
              {subtitle}
            </span>
          ) : (
            <span className={`text-[10px] font-semibold tracking-tight leading-none mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Nandha Engineering College • Erode
            </span>
          )}
        </div>
      )}
    </div>
  );
}
