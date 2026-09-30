import * as React from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "error" | "warning" | "success" | "info";
  title?: string;
  onClear?: () => void;
  clearLabel?: string;
}

const variantStyles = {
  error: {
    container: "bg-gradient-to-r from-rose-50/95 via-red-50/80 to-amber-50/40 border-rose-200/90 text-rose-900 shadow-sm shadow-rose-100/50",
    iconBg: "bg-rose-100/90 border border-rose-200 text-rose-600 shadow-2xs",
    icon: AlertCircle,
    title: "text-rose-950 font-bold",
    description: "text-rose-800",
    button: "text-rose-600 hover:text-rose-800 hover:bg-rose-100/80 active:bg-rose-200/70",
  },
  warning: {
    container: "bg-gradient-to-r from-amber-50/95 via-yellow-50/80 to-orange-50/40 border-amber-200/90 text-amber-900 shadow-sm shadow-amber-100/50",
    iconBg: "bg-amber-100/90 border border-amber-200 text-amber-600 shadow-2xs",
    icon: AlertTriangle,
    title: "text-amber-950 font-bold",
    description: "text-amber-800",
    button: "text-amber-600 hover:text-amber-800 hover:bg-amber-100/80 active:bg-amber-200/70",
  },
  success: {
    container: "bg-gradient-to-r from-emerald-50/95 via-teal-50/80 to-cyan-50/40 border-emerald-200/90 text-emerald-900 shadow-sm shadow-emerald-100/50",
    iconBg: "bg-emerald-100/90 border border-emerald-200 text-emerald-600 shadow-2xs",
    icon: CheckCircle2,
    title: "text-emerald-950 font-bold",
    description: "text-emerald-800",
    button: "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100/80 active:bg-emerald-200/70",
  },
  info: {
    container: "bg-gradient-to-r from-sky-50/95 via-blue-50/80 to-indigo-50/40 border-sky-200/90 text-sky-900 shadow-sm shadow-sky-100/50",
    iconBg: "bg-sky-100/90 border border-sky-200 text-sky-600 shadow-2xs",
    icon: Info,
    title: "text-sky-950 font-bold",
    description: "text-sky-800",
    button: "text-sky-600 hover:text-sky-800 hover:bg-sky-100/80 active:bg-sky-200/70",
  },
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = "error",
      title,
      children,
      onClear,
      clearLabel = "Clear",
      ...props
    },
    ref
  ) => {
    const config = variantStyles[variant];
    const IconComponent = config.icon;

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative flex items-start gap-3.5 p-4 rounded-xl border backdrop-blur-xs transition-all duration-300 animate-in fade-in-50 slide-in-from-top-2",
          config.container,
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-105",
            config.iconBg
          )}
        >
          <IconComponent className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0 pr-2 pt-0.5">
          {title && (
            <h4 className={cn("text-sm tracking-tight mb-0.5", config.title)}>
              {title}
            </h4>
          )}
          <div className={cn("text-xs leading-relaxed font-medium break-words", config.description)}>
            {children}
          </div>
        </div>

        {onClear && (
          <div className="shrink-0 flex items-center gap-1">
            <button
              type="button"
              onClick={onClear}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/40",
                config.button
              )}
              title={clearLabel}
              aria-label={clearLabel}
            >
              <X className="h-3.5 w-3.5" />
              <span>{clearLabel}</span>
            </button>
          </div>
        )}
      </div>
    );
  }
);

Alert.displayName = "Alert";
