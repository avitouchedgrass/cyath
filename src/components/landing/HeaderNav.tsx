'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { InvertedButton } from "../ui/InvertedButton";
import { Logo } from "../ui/Logo";

interface HeaderNavProps {
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
}

export function HeaderNav({ onOpenAuth }: HeaderNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Protocols", href: "/protocols" },
    { name: "Recipes", href: "/recipes" },
    { name: "Correlations", href: "/correlations" },
    { name: "Methodology", href: "/#methodology" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-center px-6 lg:px-12 pointer-events-none bg-gradient-to-b from-[#080808] via-[#080808]/80 to-transparent backdrop-blur-[2px]">
      <div className="w-full max-w-7xl relative flex items-center justify-between pointer-events-auto">
        
        {/* Left: Static Pixel-Wave Monogram (No Text) */}
        <Link href="/" className="flex items-center group z-10 p-1 hover:opacity-80 transition-opacity" aria-label="Home">
          <Logo className="w-10 h-10 sm:w-11 sm:h-11" />
        </Link>

        {/* Center: Truly Centered Capsule Navigation Bar */}
        <nav 
          className={`hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-6 transition-all duration-300 ease-out ${
            isScrolled 
              ? "backdrop-blur-2xl bg-[#080808]/90 border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.8)] rounded-full px-7 py-2" 
              : "bg-white/[0.02] border border-white/10 backdrop-blur-md rounded-full px-7 py-2"
          }`}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && !item.href.includes('#') && pathname.startsWith(item.href));

            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`text-xs font-medium transition-all px-2.5 py-1 rounded-full ${
                  isActive
                    ? "text-white bg-white/10 font-semibold"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3.5 z-10">
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex text-xs font-mono text-neutral-300 hover:text-white transition-colors px-2 py-1.5"
          >
            Dashboard
          </Link>
          <Link href="/login">
            <InvertedButton 
              variant="secondary" 
              className="py-2 px-5 text-xs sm:text-sm rounded-full backdrop-blur-md cursor-pointer border-white/20 hover:bg-white/10"
            >
              Login / Signup
            </InvertedButton>
          </Link>
        </div>

      </div>
    </header>
  );
}
