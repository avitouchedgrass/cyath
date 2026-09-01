'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHabitStore } from "@/store/useHabitStore";
import { GuildInviteModal } from "@/components/referrals/GuildInviteModal";
import { Gift } from "lucide-react";

interface HeaderNavProps {
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
  theme?: 'light' | 'dark';
}

export function HeaderNav({ onOpenAuth, theme = 'light' }: HeaderNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const navItems = [
    { name: "Protocols", href: "/protocols" },
    { name: "Recipes", href: "/recipes" },
    { name: "Correlations", href: "/correlations" },
    { name: "Sanctuary", href: "/sanctuary" },
    { name: "Methodology", href: "/#methodology" },
  ];

  const logoColor = theme === 'dark' ? 'text-[#F8FAFC]' : 'text-[#1A3629]';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-center px-4 sm:px-6 lg:px-12 pointer-events-none transition-all duration-300">
      <div className="w-full max-w-7xl relative flex items-center justify-between pointer-events-auto">
        
        {/* Left: Authentic Lowercase Pixel Brand Text */}
        <Link 
          href="/" 
          className={`font-pixel text-3xl font-bold lowercase tracking-wider ${logoColor} select-none hover:opacity-80 transition-opacity z-10 flex items-center h-10`} 
          aria-label="cyath home"
        >
          cyath
        </Link>

        {/* Center: Tactile Pill Nav (Desktop) */}
        <nav 
          aria-label="Main Navigation"
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

        {/* Right: Referral Action + User Nav Actions + Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 z-10">
          {mounted && (
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              className="border-2 border-[#10B981] bg-[#ECFDF5] text-[#065F46] hover:bg-[#D1FAE5] px-3 sm:px-4 rounded-full font-cabinet font-bold text-xs shadow-[3px_3px_0px_#10B981] hover:shadow-[4px_4px_0px_#10B981] hover:-translate-y-0.5 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer h-10 select-none shrink-0"
              title="Adventurer's Guild Pact: Invite Friends for +250 XP"
              aria-label="Invite friends to Cyath for +250 XP"
            >
              <Gift className="w-3.5 h-3.5 text-[#059669] shrink-0" />
              <span>Invite (+250 XP)</span>
            </button>
          )}

          {pathname.startsWith('/dashboard') ? (
            <Link
              href="/profile"
              className="border-2 border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] px-4 sm:px-5 rounded-full font-cabinet font-bold text-xs shadow-[3px_3px_0px_#1A3629] hover:shadow-[4px_4px_0px_#1A3629] hover:-translate-y-0.5 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all flex items-center justify-center cursor-pointer h-10"
            >
              <span>Profile</span>
            </Link>
          ) : (
            <Link
              href={mounted && userSession ? "/dashboard" : "/login"}
              className="border-2 border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] px-4 sm:px-5 rounded-full font-cabinet font-bold text-xs shadow-[3px_3px_0px_#1A3629] hover:shadow-[4px_4px_0px_#1A3629] hover:-translate-y-0.5 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer h-10"
            >
              <span className="w-2 h-2 rounded-full bg-[#1A3629]" />
              <span className="hidden xs:inline">Dashboard</span>
              <span className="xs:hidden">App</span>
            </Link>
          )}

          {/* Mobile Hamburger / Menu Button (<768px) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full border-2 border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] shadow-[3px_3px_0px_#1A3629] hover:-translate-y-0.5 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all cursor-pointer font-cabinet font-bold text-xs"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Guild Invite Modal */}
        <GuildInviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
        />

        {/* Mobile Navigation Drawer Sheet (<768px) */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-x-4 top-24 bg-[#FFFDF9] border-3 border-[#1A3629] rounded-2xl p-5 shadow-[6px_6px_0px_#1A3629] flex flex-col gap-2 z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#1A3629]/15">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#4A5D4E]">
                Navigation Menu
              </span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-mono text-xs font-bold text-[#1A3629] hover:opacity-75 cursor-pointer px-2 py-0.5 rounded border border-[#1A3629]/30"
              >
                Close [ESC]
              </button>
            </div>

            <nav className="flex flex-col gap-1.5 pt-1" aria-label="Mobile Navigation">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && !item.href.includes('#') && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl font-cabinet font-bold text-sm transition-all flex items-center justify-between border-2 min-h-[44px] ${
                      isActive
                        ? "bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-[2px_2px_0px_#3A6B52]"
                        : "bg-[#F4F0EA] text-[#1A3629] border-[#1A3629]/20 hover:border-[#1A3629]"
                    }`}
                  >
                    <span>{item.name}</span>
                    {isActive && <span className="font-mono text-xs">● Active</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

      </div>
    </header>
  );
}
