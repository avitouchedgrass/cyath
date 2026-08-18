'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { InvertedButton } from "../ui/InvertedButton";

interface HeaderNavProps {
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
}

export function HeaderNav({ onOpenAuth }: HeaderNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-6 lg:px-12 pt-5 pb-3 pointer-events-none">
      <div className="w-full max-w-7xl relative flex items-center justify-between pointer-events-auto">
        
        {/* Left: Brand Monogram */}
        <Link href="/" className="flex items-center gap-3 group z-10">
          <div className="h-9 w-9 bg-white pixel-art rounded-sm animate-pixel-float flex items-center justify-center font-serif text-black font-bold text-base shadow-[0_0_20px_rgba(255,255,255,0.25)]">
            C
          </div>
          <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-neutral-200 transition-colors">
            Cyath
          </span>
        </Link>

        {/* Center: Truly Centered Capsule Navigation Bar */}
        <nav 
          className={`hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 transition-all duration-300 ease-out ${
            isScrolled 
              ? "backdrop-blur-2xl bg-[#121212]/85 border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.6)] rounded-full px-8 py-2.5" 
              : "bg-transparent border border-transparent px-8 py-2.5"
          }`}
        >
          {[
            { name: "Protocols", href: "/dashboard" },
            { name: "Recipes", href: "/recipes" },
            { name: "Correlations", href: "/dashboard#correlations" },
            { name: "Methodology", href: "#methodology" },
          ].map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 z-10">
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex text-xs font-semibold text-neutral-400 hover:text-white transition-colors px-2 py-1.5"
          >
            Dashboard
          </Link>
          <InvertedButton 
            variant="secondary" 
            onClick={() => onOpenAuth ? onOpenAuth('login') : null}
            className="py-2 px-5 text-xs sm:text-sm rounded-full backdrop-blur-md cursor-pointer border-white/20 hover:bg-white/10"
          >
            Login / Signup
          </InvertedButton>
        </div>

      </div>
    </header>
  );
}
