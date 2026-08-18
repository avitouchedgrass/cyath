import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl transition-all duration-300",
        "bg-[rgba(255,255,255,0.03)] backdrop-blur-[14px]",
        "border border-[rgba(255,255,255,0.08)]",
        "shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]",
        "hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.16)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
