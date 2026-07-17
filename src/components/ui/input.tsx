import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-[var(--radius-sm)] border bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ability-red/30 focus-visible:border-ability-red",
          "disabled:cursor-not-allowed disabled:opacity-50",
          hasError ? "border-danger" : "border-slate-300",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
