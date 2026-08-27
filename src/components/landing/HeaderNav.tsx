'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHabitStore } from "@/store/useHabitStore";
import { XpHudBadge } from "@/components/progression/XpHudBadge";

interface HeaderNavProps {
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
  theme?: 'light' | 'dark';
}

export function HeaderNav({ onOpenAuth, theme = 'light' }: HeaderNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { userSession } = useHabitStore();

  useEffect(() => {
    setMounted(true);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
    }
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
    { name: "Progress", href: "/progress" },
    { name: "Methodology", href: "/#methodology" },
  ];

  const logoColor = theme === 'dark' ? 'text-[#F8FAFC]' : 'text-[#1A3629]';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-center px-6 lg:px-12 pointer-events-none transition-all duration-300">
      <div className="w-full max-w-7xl relative flex items-center justify-between pointer-events-auto">
        
        {/* Left: Authentic Lowercase Pixel Brand Text */}
        <Link 
          href="/" 
          className={`font-pixel text-3xl font-bold lowercase tracking-wider ${logoColor} select-none hover:opacity-80 transition-opacity z-10 flex items-center h-10`} 
          aria-label="cyath home"
        >
          cyath
        </Link>

        {/* Center: Tactile Pill Nav */}
        <nav 
          className={`hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-5 transition-all duration-300 bg-[#FFFDF9] border-2 border-[#1A3629] rounded-full px-6 h-10 ${
            isScrolled 
              ? "shadow-[4px_4px_0px_#1A3629]" 
              : "shadow-[3px_3px_0px_#1A3629]"
          }`}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && !item.href.includes('#') && pathname.startsWith(item.href));

            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`font-cabinet font-bold text-xs transition-colors px-2.5 py-1 rounded-full ${
                  isActive
                    ? "text-[#1A3629] bg-[#E8DECF]/70"
                    : "text-[#1A3629] hover:text-[#3A6B52]"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Progression HUD Badge + Actions */}
        <div className="flex items-center gap-3 z-10">
          {mounted && <XpHudBadge />}

          {pathname.startsWith('/dashboard') ? (
            <Link
              href="/profile"
              className="border-2 border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] px-5 rounded-full font-cabinet font-bold text-xs shadow-[3px_3px_0px_#1A3629] hover:shadow-[4px_4px_0px_#1A3629] hover:-translate-y-0.5 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all flex items-center justify-center cursor-pointer h-10 min-w-[116px]"
            >
              <span>Profile</span>
            </Link>
          ) : (
            <Link
              href={mounted && userSession ? "/dashboard" : "/login"}
              className="border-2 border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] px-5 rounded-full font-cabinet font-bold text-xs shadow-[3px_3px_0px_#1A3629] hover:shadow-[4px_4px_0px_#1A3629] hover:-translate-y-0.5 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer h-10 min-w-[116px]"
            >
              <span className="w-2 h-2 rounded-full bg-[#1A3629]" />
              <span>Dashboard</span>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
