'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "../ui/Logo";
import { useHabitStore } from "@/store/useHabitStore";
import { Sun, Moon, User } from "lucide-react";

interface HeaderNavProps {
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
  theme?: 'retro' | 'dark';
  themeMode?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export function HeaderNav({ onOpenAuth, themeMode: propThemeMode, onToggleTheme: propToggleTheme }: HeaderNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { userSession, themeMode: storeThemeMode, toggleThemeMode: storeToggleTheme } = useHabitStore();

  const activeThemeMode = propThemeMode || storeThemeMode || 'dark';
  const isLight = activeThemeMode === 'light';

  const handleToggleTheme = () => {
    if (propToggleTheme) {
      propToggleTheme();
    } else {
      storeToggleTheme();
    }
  };

  useEffect(() => {
    setMounted(true);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', activeThemeMode === 'dark');
    }
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeThemeMode]);

  const navItems = [
    { name: "Protocols", href: "/protocols" },
    { name: "Recipes", href: "/recipes" },
    { name: "Correlations", href: "/correlations" },
    { name: "Methodology", href: "/#methodology" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-center px-6 lg:px-12 pointer-events-none transition-all duration-300">
      <div className="w-full max-w-7xl relative flex items-center justify-between pointer-events-auto">
        
        {/* Left: Monogram Logo */}
        <Link href="/" className="flex items-center group z-10 p-1 hover:opacity-85 transition-opacity" aria-label="Home">
          <div className={isLight ? "filter brightness-0 [filter:invert(18%)_sepia(22%)_saturate(1478%)_hue-rotate(97deg)_brightness(96%)_contrast(92%)]" : ""}>
            <Logo className="w-10 h-10 sm:w-11 sm:h-11" />
          </div>
        </Link>

        {/* Center: Tactile Pill Nav */}
        <nav 
          className={`hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-5 transition-all duration-300 ${
            isLight
              ? isScrolled 
                ? "bg-[#FFFDF9] border-2 border-[#1B2A24] rounded-full px-6 py-2 shadow-[4px_4px_0px_#1B2A24]" 
                : "bg-[#FFFDF9] border-2 border-[#1B2A24] rounded-full px-6 py-2 shadow-[3px_3px_0px_#1B2A24]"
              : isScrolled
                ? "bg-[#1D2622] border-2 border-[#F4F0EA] rounded-full px-6 py-2 shadow-[4px_4px_0px_#D9A036]" 
                : "bg-[#1D2622] border-2 border-[#F4F0EA] rounded-full px-6 py-2 shadow-[3px_3px_0px_#D9A036]"
          }`}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && !item.href.includes('#') && pathname.startsWith(item.href));

            if (isLight) {
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`font-cabinet font-bold text-xs transition-colors px-2.5 py-1 rounded-full ${
                    isActive
                      ? "text-[#1B2A24] bg-[#E8DECF]/70"
                      : "text-[#1B2A24] hover:text-[#3A6B52]"
                  }`}
                >
                  {item.name}
                </Link>
              );
            }

            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`font-cabinet font-bold text-xs transition-colors px-2.5 py-1 rounded-full ${
                  isActive
                    ? "text-[#F4F0EA] bg-[#131916]"
                    : "text-[#C2CDBF] hover:text-[#F4F0EA]"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Theme Toggle & Actions */}
        <div className="flex items-center gap-3 z-10">
          {/* Universal Theme Toggle Button */}
          <button
            type="button"
            onClick={handleToggleTheme}
            className={`p-2 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
              isLight
                ? "bg-[#FFFDF9] border-[#1B2A24] text-[#1B2A24] shadow-[2px_2px_0px_#1B2A24] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                : "bg-[#1D2622] border-[#F4F0EA] text-[#F4F0EA] shadow-[2px_2px_0px_#D9A036] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            }`}
            aria-label={`Switch to ${isLight ? 'Dark' : 'Light'} mode`}
            title={`Switch to ${isLight ? 'Midnight Dark' : 'Warm Light'} mode`}
          >
            {isLight ? <Moon className="w-4 h-4 text-[#1B2A24]" /> : <Sun className="w-4 h-4 text-[#D9A036]" />}
          </button>

          {/* Profile / Dashboard Quick Links */}
          {pathname.startsWith('/dashboard') ? (
            <Link
              href="/profile"
              className={`border-2 px-4 sm:px-5 py-2 rounded-full font-cabinet font-bold text-xs hover:-translate-y-0.5 active:translate-y-[3px] active:translate-x-[3px] active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer ${
                isLight
                  ? "border-[#1B2A24] bg-[#FFFDF9] text-[#1B2A24] shadow-[3px_3px_0px_#1B2A24] hover:shadow-[4px_4px_0px_#1B2A24]"
                  : "border-[#F4F0EA] bg-[#1D2622] text-[#F4F0EA] shadow-[3px_3px_0px_#D9A036] hover:shadow-[4px_4px_0px_#D9A036]"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </Link>
          ) : (
            <Link
              href={mounted && userSession ? "/dashboard" : "/login"}
              className={`border-2 px-5 sm:px-6 py-2 rounded-full font-cabinet font-bold text-xs hover:-translate-y-0.5 active:translate-y-[3px] active:translate-x-[3px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer ${
                isLight
                  ? "border-[#1B2A24] bg-[#FFFDF9] text-[#1B2A24] shadow-[3px_3px_0px_#1B2A24] hover:shadow-[4px_4px_0px_#1B2A24]"
                  : "border-[#F4F0EA] bg-[#1D2622] text-[#F4F0EA] shadow-[3px_3px_0px_#D9A036] hover:shadow-[4px_4px_0px_#D9A036]"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isLight ? "bg-[#1B2A24]" : "bg-[#D9A036]"}`} />
              <span>Dashboard</span>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
