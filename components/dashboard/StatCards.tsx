"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Award, FileCheck2, Clock, AlertTriangle, ArrowUpRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface StatItem {
  title: string;
  value: number | string;
  description?: string;
  iconName: "award" | "check" | "clock" | "alert" | "trending";
  change?: string;
  variant?: "primary" | "emerald" | "amber" | "rose" | "indigo";
}

interface StatCardsProps {
  stats: StatItem[];
}

export function StatCards({ stats }: StatCardsProps) {
  const getIcon = (name: StatItem["iconName"]) => {
    switch (name) {
      case "award":
        return Award;
      case "check":
        return FileCheck2;
      case "clock":
        return Clock;
      case "alert":
        return AlertTriangle;
      case "trending":
        return TrendingUp;
    }
  };

  const getVariantStyles = (variant: StatItem["variant"] = "primary") => {
    switch (variant) {
      case "emerald":
        return {
          iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200/80 shadow-xs",
          valColor: "text-emerald-700",
          topBar: "from-emerald-500 to-teal-400",
          hoverBorder: "hover:border-emerald-300",
          badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "amber":
        return {
          iconBg: "bg-amber-50 text-amber-600 border-amber-200/80 shadow-xs",
          valColor: "text-amber-700",
          topBar: "from-amber-500 to-yellow-400",
          hoverBorder: "hover:border-amber-300",
          badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case "rose":
        return {
          iconBg: "bg-rose-50 text-rose-600 border-rose-200/80 shadow-xs",
          valColor: "text-rose-700",
          topBar: "from-rose-500 to-pink-400",
          hoverBorder: "hover:border-rose-300",
          badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
        };
      case "indigo":
        return {
          iconBg: "bg-indigo-50 text-indigo-600 border-indigo-200/80 shadow-xs",
          valColor: "text-indigo-700",
          topBar: "from-indigo-500 to-violet-400",
          hoverBorder: "hover:border-indigo-300",
          badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
        };
      case "primary":
      default:
        return {
          iconBg: "bg-sky-50 text-primary-600 border-sky-200/80 shadow-xs",
          valColor: "text-slate-900",
          topBar: "from-primary-500 to-sky-400",
          hoverBorder: "hover:border-primary-300",
          badgeBg: "bg-sky-50 text-primary-700 border-sky-200",
        };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {stats.map((stat, i) => {
        const Icon = getIcon(stat.iconName);
        const styles = getVariantStyles(stat.variant);

        return (
          <Card
            key={i}
            className={cn(
              "p-5 bg-white border border-slate-200/90 rounded-2xl relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group cursor-default",
              styles.hoverBorder
            )}
          >
            {/* Top Glowing Gradient Accent Bar */}
            <div
              className={cn(
                "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-90 group-hover:h-1.5 transition-all duration-200",
                styles.topBar
              )}
            />

            <div className="flex items-start justify-between mt-1">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {stat.title}
                </p>
                <h3 className={cn("text-2xl sm:text-3xl font-black tracking-tight", styles.valColor)}>
                  {stat.value}
                </h3>
              </div>
              <div
                className={cn(
                  "p-3 rounded-2xl border transition-transform duration-300 group-hover:scale-105",
                  styles.iconBg
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>

            {(stat.description || stat.change) && (
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span className="truncate pr-2 font-medium">{stat.description}</span>
                {stat.change && (
                  <span
                    className={cn(
                      "inline-flex items-center font-bold text-[11px] px-2 py-0.5 rounded-full border shrink-0",
                      styles.badgeBg
                    )}
                  >
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    {stat.change}
                  </span>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
