'use client';

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useHabitStore } from "@/store/useHabitStore";
import { GuildInviteModal } from "@/components/referrals/GuildInviteModal";
import { Gift, Bot, Compass, Utensils, BookOpen, FileText, User } from "lucide-react";

interface HeaderNavProps {
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
  theme?: 'light' | 'dark';
}

interface NavItem {
  name: string;
  href: string;
  id?: string;
  icon?: any;
}

function FloatingPillNav({
  isLoggedIn,
  memberNavItems,
  publicNavItems,
  isScrolled,
}: {
  isLoggedIn: boolean;
  memberNavItems: NavItem[];
  publicNavItems: NavItem[];
  isScrolled: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams?.get('tab') || 'today';
  const currentTab = rawTab === 'fuel' ? 'log' : rawTab;

  return (
    <nav 
      id="tour-navigation"
      aria-label="Main Navigation"
      className={`hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1.5 transition-all duration-300 bg-[#FFFDF9]/90 backdrop-blur-md border border-[#1A3629]/15 rounded-full p-1.5 h-12 ${
        isScrolled 
          ? "shadow-[0_8px_30px_rgba(26,54,41,0.10)] border-[#1A3629]/25" 
          : "shadow-[0_4px_18px_rgba(26,54,41,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]"
      }`}
    >
      {isLoggedIn ? (
        // Member App Tabs
        memberNavItems.map((item) => {
          const isActive = item.id === 'playbook'
            ? pathname.startsWith('/playbook')
            : pathname === '/dashboard' && (currentTab === item.id || (item.id === 'log' && currentTab === 'fuel'));

          return (
            <Link 
              key={item.name} 
              id={`tour-nav-${item.id}`}
              href={item.href}
              className={`font-cabinet font-bold text-xs sm:text-[13px] transition-all px-4 py-2 rounded-full cursor-pointer flex items-center gap-1.5 select-none ${
                isActive
                  ? "text-[#FFFDF9] bg-[#1A3629] shadow-[0_2px_8px_rgba(26,54,41,0.25)]"
                  : "text-[#1A3629]/80 hover:text-[#1A3629] hover:bg-[#1A3629]/8"
              }`}
            >
              <span>{item.name}</span>
            </Link>
          );
        })
      ) : (
        // Public Visitor Links
        publicNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && !item.href.includes('#') && pathname.startsWith(item.href));

          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`font-cabinet font-bold text-xs sm:text-[13px] transition-all px-4 py-2 rounded-full cursor-pointer select-none ${
                isActive
                  ? "text-[#FFFDF9] bg-[#1A3629] shadow-[0_2px_8px_rgba(26,54,41,0.25)]"
                  : "text-[#1A3629]/80 hover:text-[#1A3629] hover:bg-[#1A3629]/8"
              }`}
            >
              <span>{item.name}</span>
            </Link>
          );
        })
      )}
    </nav>
  );
}

function MobileBottomDock({
  memberNavItems,
}: {
  memberNavItems: NavItem[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams?.get('tab') || 'today';
  const currentTab = rawTab === 'fuel' ? 'log' : rawTab;

  return (
    <nav
      aria-label="Mobile Bottom Navigation Dock"
      className="md:hidden fixed bottom-3 inset-x-4 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border border-[#1A3629]/20 rounded-2xl shadow-[0_8px_30px_rgba(26,54,41,0.12)] p-1.5 flex items-center justify-around"
    >
      {memberNavItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = item.id === 'playbook'
          ? pathname.startsWith('/playbook')
          : pathname === '/dashboard' && (currentTab === item.id || (item.id === 'log' && currentTab === 'fuel'));

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
              isActive
                ? 'bg-[#1A3629] text-[#FFFDF9] shadow-xs'
                : 'text-[#1A3629]/70 hover:text-[#1A3629]'
            }`}
          >
            {IconComponent && <IconComponent className="w-4 h-4" />}
            <span className="text-[10px] font-cabinet font-bold mt-0.5">{item.name.split(' ')[0]}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function HeaderNav({ onOpenAuth, theme = 'light' }: HeaderNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const pathname = usePathname();

  const { userSession } = useHabitStore();
  const isLoggedIn = mounted && !!userSession;

  useEffect(() => {
    setMounted(true);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
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

  // Public visitor navigation items
  const publicNavItems: NavItem[] = [
    { name: "Recipes", href: "/playbook?tab=recipes" },
    { name: "Methodology", href: "/#methodology" },
  ];

  // Logged-in member navigation items
  const memberNavItems: NavItem[] = [
    { name: "Today", href: "/dashboard?tab=today", id: "today", icon: Compass },
    { name: "Log", href: "/dashboard?tab=log", id: "log", icon: Utensils },
    { name: "Playbook", href: "/playbook", id: "playbook", icon: BookOpen },
    { name: "Dossier & History", href: "/dashboard?tab=dossier", id: "dossier", icon: FileText },
  ];

  const logoColor = theme === 'dark' ? 'text-[#F8FAFC]' : 'text-[#1A3629]';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-center px-4 sm:px-6 lg:px-12 transition-all duration-300 pointer-events-none ${
          isScrolled
            ? "bg-[#F4F0EA]/85 backdrop-blur-md border-b border-[#1A3629]/10 shadow-[0_2px_12px_rgba(26,54,41,0.03)]"
            : "bg-transparent"
        }`}
      >
        <div className="w-full max-w-7xl relative flex items-center justify-between pointer-events-auto">
          
          {/* Left: Pixel Brand Logo */}
          <Link 
            href="/" 
            className={`font-pixel text-3xl font-bold lowercase tracking-wider ${logoColor} select-none hover:opacity-80 transition-opacity z-10 flex items-center h-10`} 
            aria-label="cyath home"
          >
            cyath
          </Link>

          {/* Center: Refined Floating Pill Nav (Desktop) with Suspense */}
          <Suspense fallback={
            <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1.5 bg-[#FFFDF9] border border-[#1A3629]/20 rounded-full p-1.5 h-12 shadow-[0_4px_16px_rgba(26,54,41,0.06)]" />
          }>
            <FloatingPillNav
              isLoggedIn={isLoggedIn}
              memberNavItems={memberNavItems}
              publicNavItems={publicNavItems}
              isScrolled={isScrolled}
            />
          </Suspense>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-2.5 z-10">
            {/* Command Palette Button */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
              className="hidden lg:flex items-center gap-1.5 border border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#1A3629]/6 px-3 rounded-full font-mono text-xs font-semibold shadow-xs transition-all cursor-pointer h-9 select-none"
              title="Open Command Palette (Cmd+K / Ctrl+K)"
              aria-label="Open Command Palette"
            >
              <span className="text-[10px] opacity-60">⌘</span>
              <span>K</span>
            </button>

            {/* Invite Button for Members */}
            {mounted && isLoggedIn && (
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(true)}
                className="hidden sm:flex border border-[#1A3629]/15 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#FAF6EE] px-3.5 rounded-full font-cabinet font-bold text-xs shadow-xs transition-all items-center justify-center gap-1.5 cursor-pointer h-9 select-none shrink-0"
                title="Invite Friends to Cyath"
                aria-label="Invite friends to Cyath"
              >
                <Gift className="w-3.5 h-3.5 text-[#1A3629]/70 shrink-0" />
                <span>Invite</span>
              </button>
            )}

            {/* Profile / App Entry Button */}
            {isLoggedIn ? (
              <Link
                id="tour-nav-profile"
                href="/profile"
                className="border border-[#1A3629]/25 bg-[#1A3629] text-[#FFFDF9] hover:bg-[#2C4A3B] px-3.5 rounded-full font-cabinet font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer h-9"
              >
                <User className="w-3.5 h-3.5 text-[#FFFDF9]/80" />
                <span>Profile</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="border border-[#1A3629]/25 bg-[#1A3629] text-[#FFFDF9] hover:bg-[#2C4A3B] px-4 rounded-full font-cabinet font-bold text-xs shadow-xs transition-all flex items-center justify-center cursor-pointer h-9"
              >
                <span>Log In</span>
              </Link>
            )}

            {/* Mobile Menu Hamburger (<768px) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-full border border-[#1A3629]/20 bg-[#1A3629] text-[#FFFDF9] shadow-xs transition-all cursor-pointer font-cabinet font-bold text-xs"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          {/* Mobile Navigation Drawer Sheet (<768px) */}
          {isMobileMenuOpen && (
            <div className="md:hidden fixed inset-x-4 top-24 bg-[#FFFDF9] border border-[#1A3629]/20 rounded-2xl p-5 shadow-[0_12px_40px_rgba(26,54,41,0.15)] flex flex-col gap-2 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-[#1A3629]/10">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#1A3629]">
                  {isLoggedIn ? "Member Workspace" : "Cyath Navigation"}
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-mono text-xs font-bold text-[#1A3629] hover:opacity-75 cursor-pointer px-2 py-0.5 rounded border border-[#1A3629]/20"
                >
                  Close [ESC]
                </button>
              </div>

              <nav className="flex flex-col gap-1.5 pt-1" aria-label="Mobile Navigation">
                {(isLoggedIn ? memberNavItems : publicNavItems).map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl font-cabinet font-bold text-sm transition-all flex items-center justify-between border border-[#1A3629]/12 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#F4EDE0]"
                  >
                    <span>{item.name}</span>
                  </Link>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    window.dispatchEvent(new CustomEvent('open-ai-coach'));
                  }}
                  className="mt-1 px-4 py-3 rounded-xl font-cabinet font-bold text-sm transition-all flex items-center justify-between border border-[#1A3629]/20 bg-[#1A3629] text-[#FFFDF9] cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Bot className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>AI Health Coach</span>
                  </span>
                  <span className="font-mono text-xs text-[#A7F3D0] bg-[#2C4A3B] px-2 py-0.5 rounded font-bold">
                    Open ⌘J
                  </span>
                </button>
              </nav>
            </div>
          )}

        </div>
      </header>

      {/* Mobile Floating Bottom Dock for Logged-In Members */}
      {isLoggedIn && (
        <Suspense fallback={null}>
          <MobileBottomDock memberNavItems={memberNavItems} />
        </Suspense>
      )}

      {/* Guild Invite Modal */}
      <GuildInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </>
  );
}
