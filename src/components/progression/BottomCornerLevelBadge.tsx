'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useHabitStore } from '@/store/useHabitStore';
import { calculateLevel } from '@/lib/progression/engine';
import { Sparkles } from 'lucide-react';

export function BottomCornerLevelBadge() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { totalXp, userSession } = useHabitStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide on auth, login, onboarding, dashboard, and sanctuary screens
  if (!mounted) return null;
  if (
    pathname === '/auth' ||
    pathname === '/login' ||
    pathname === '/onboarding' ||
    pathname === '/sanctuary' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/dashboard')
  ) {
    return null;
  }

  const progress = calculateLevel(totalXp);

  return (
    <div className="fixed bottom-20 md:bottom-5 left-4 md:left-5 z-40 pointer-events-auto select-none animate-in fade-in slide-in-from-bottom-3 duration-300">
      <Link
        id="xp-hud-badge-target"
        href="/dashboard?tab=today"
        className="flex items-center gap-3 px-3.5 py-2 rounded-full border border-[#1A3629]/15 bg-[#FFFDF9]/95 backdrop-blur-xs shadow-[0_4px_20px_rgba(26,54,41,0.08)] hover:shadow-[0_8px_25px_rgba(26,54,41,0.12)] hover:border-[#1A3629]/30 transition-all cursor-pointer group"
        title={`Level ${progress.level} (${progress.currentLevelXp}/${progress.xpForNextLevel} XP) · Open Cockpit`}
        aria-label={`Current Level: Level ${progress.level}`}
      >
        {/* Floating Level Badge Circle */}
        <div className="flex items-center justify-center bg-[#FAF6EE] px-2.5 py-1 rounded-full border border-[#1A3629]/15 group-hover:border-[#1A3629]/30 transition-colors">
          <span className="font-cabinet text-xs font-black text-[#1A3629] tabular-nums">
            Lv.{progress.level}
          </span>
        </div>

        {/* Title & XP Progress Bar */}
        <div className="flex flex-col gap-0.5 min-w-[70px]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-cabinet font-bold text-[#1A3629] truncate max-w-[90px] sm:max-w-[120px]">
              Level {progress.level}
            </span>
            <span className="text-[10px] font-mono font-bold text-[#4A5D4E] tabular-nums">
              {progress.progressPercent}%
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-[#EAE3D2] border border-[#1A3629]/15 overflow-hidden">
            <div
              className="h-full bg-[#10B981] transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>
        </div>

        <span className="hidden md:inline-flex text-[10px] font-mono font-bold text-[#1A3629] bg-[#FAF8F5] px-2 py-0.5 rounded-full border border-[#1A3629]/15">
          Cockpit ↗
        </span>
      </Link>
    </div>
  );
}
