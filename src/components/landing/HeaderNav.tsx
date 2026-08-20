'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { InvertedButton } from "../ui/InvertedButton";
import { Logo } from "../ui/Logo";
import { useHabitStore } from "@/store/useHabitStore";
import { Sun, Moon } from "lucide-react";

interface HeaderNavProps {
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
  theme?: 'retro' | 'dark';
  themeMode?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export function HeaderNav({ onOpenAuth, theme, themeMode = 'dark', onToggleTheme }: HeaderNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { userSession } = useHabitStore();

  const isRetro = theme === 'retro' || (theme === undefined && pathname === '/');
  const isLight = themeMode === 'light';

  useEffect(() => {
    setMounted(true);
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

  if (isRetro) {
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
                  ? "bg-[#FFFDF9] border-2 border-[#1A3629] rounded-full px-6 py-2 shadow-[4px_4px_0px_#1A3629]" 
                  : "bg-[#FFFDF9] border-2 border-[#1A3629] rounded-full px-6 py-2 shadow-[3px_3px_0px_#1A3629]"
                : isScrolled
                  ? "bg-[#1A261E] border-2 border-[#F4F0EA] rounded-full px-6 py-2 shadow-[4px_4px_0px_#D9A036]" 
                  : "bg-[#1A261E] border-2 border-[#F4F0EA] rounded-full px-6 py-2 shadow-[3px_3px_0px_#D9A036]"
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
                        ? "text-[#1A3629] bg-[#E8DECF]/70"
                        : "text-[#1A3629] hover:text-[#3A6B52]"
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
                      ? "text-[#F4F0EA] bg-[#111914]"
                      : "text-[#C2CDBF] hover:text-[#F4F0EA]"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right: Theme Toggle & Actions Button */}
          <div className="flex items-center gap-3 z-10">
            {/* Theme Toggle Button */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className={`p-2 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                  isLight
                    ? "bg-[#FFFDF9] border-[#1A3629] text-[#1A3629] shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                    : "bg-[#1A261E] border-[#F4F0EA] text-[#F4F0EA] shadow-[2px_2px_0px_#D9A036] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                }`}
                aria-label={`Switch to ${isLight ? 'Dark' : 'Light'} mode`}
                title={`Switch to ${isLight ? 'Midnight Dark' : 'Warm Light'} mode`}
              >
                {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-[#D9A036]" />}
              </button>
            )}

            {mounted && userSession ? (
              <Link
                href="/dashboard"
                className={`border-2 px-5 sm:px-6 py-2 rounded-full font-cabinet font-bold text-xs hover:-translate-y-0.5 active:translate-y-[3px] active:translate-x-[3px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer ${
                  isLight
                    ? "border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] shadow-[3px_3px_0px_#1A3629] hover:shadow-[4px_4px_0px_#1A3629]"
                    : "border-[#F4F0EA] bg-[#1A261E] text-[#F4F0EA] shadow-[3px_3px_0px_#D9A036] hover:shadow-[4px_4px_0px_#D9A036]"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isLight ? "bg-[#1A3629]" : "bg-[#D9A036]"}`} />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className={`border-2 px-5 sm:px-6 py-2 rounded-full font-cabinet font-bold text-xs hover:-translate-y-0.5 active:translate-y-[3px] active:translate-x-[3px] active:shadow-none transition-all cursor-pointer ${
                  isLight
                    ? "border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] shadow-[3px_3px_0px_#1A3629] hover:shadow-[4px_4px_0px_#1A3629]"
                    : "border-[#F4F0EA] bg-[#1A261E] text-[#F4F0EA] shadow-[3px_3px_0px_#D9A036] hover:shadow-[4px_4px_0px_#D9A036]"
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>

        </div>
      </header>
    );
  }

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
          {!pathname.startsWith('/dashboard') && (
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex text-xs font-mono text-neutral-300 hover:text-white transition-colors px-2 py-1.5"
            >
              Dashboard
            </Link>
          )}

          {mounted && (userSession || pathname.startsWith('/dashboard')) ? (
            <Link
              href="/profile"
              className="border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2 text-xs font-mono text-slate-300 transition-all"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${userSession && !userSession.id.startsWith('guest_') ? 'bg-white' : 'bg-white/60'}`} />
              <span className="max-w-[120px] truncate">
                {userSession && !userSession.id.startsWith('guest_')
                  ? (userSession.email ? userSession.email.split('@')[0] : 'Profile')
                  : 'Local Sandbox'}
              </span>
            </Link>
          ) : (
            <Link href="/login">
              <InvertedButton 
                variant="secondary" 
                className="py-2 px-5 text-xs sm:text-sm rounded-full backdrop-blur-md cursor-pointer border-white/20 hover:bg-white/10"
              >
                Login / Signup
              </InvertedButton>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
