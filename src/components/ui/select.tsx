import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, hasError, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "h-10 w-full appearance-none rounded-[var(--radius-sm)] border bg-white px-3 pr-9 text-sm text-slate-800 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ability-red/30 focus-visible:border-ability-red",
            "disabled:cursor-not-allowed disabled:opacity-50",
            hasError ? "border-danger" : "border-slate-300",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    );
  }
);
Select.displayName = "Select";
