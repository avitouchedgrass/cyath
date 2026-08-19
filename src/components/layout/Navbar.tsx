import React from "react";
import Link from "next/link";
import { InvertedButton } from "../ui/InvertedButton";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[rgba(255,255,255,0.08)] bg-[rgba(11,15,23,0.7)] backdrop-blur-[14px]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          {/* Pixel-wave monogram placeholder */}
          <div className="h-8 w-8 bg-white pixel-asset rounded-sm animate-pixel-float flex items-center justify-center font-cabinet text-black font-extrabold">
            C
          </div>
          <span className="font-cabinet text-xl font-bold tracking-tight text-white">
            Cyath
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-white transition-colors">
            Dashboard
          </Link>
          <InvertedButton variant="primary" className="py-2 px-4 text-xs">
            Sign In
          </InvertedButton>
        </div>
      </div>
    </nav>
  );
}
