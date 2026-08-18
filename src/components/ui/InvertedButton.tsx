import { cn } from "@/lib/utils";
import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export const InvertedButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98]",
          variant === "primary" &&
            "bg-white text-black hover:bg-gray-100",
          variant === "secondary" &&
            "bg-transparent text-[#F8FAFC] border border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.05)]",
          className
        )}
        {...props}
      />
    );
  }
);

InvertedButton.displayName = "InvertedButton";
