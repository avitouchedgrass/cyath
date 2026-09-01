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

  // Hide on auth, login, and onboarding screens
  if (!mounted) return null;
  if (
    pathname === '/auth' ||
    pathname === '/login' ||
    pathname === '/onboarding' ||
    pathname.startsWith('/auth/')
  ) {
    return null;
  }

  const progress = calculateLevel(totalXp);

  return (
    <div className="fixed bottom-5 left-5 z-40 pointer-events-auto select-none animate-in fade-in slide-in-from-bottom-3 duration-300">
      <Link
        id="xp-hud-badge-target"
        href="/sanctuary"
        className="flex items-center gap-3 px-3.5 py-2 rounded-2xl border-2 sm:border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[4px_4px_0px_#1A3629] hover:shadow-[5px_5px_0px_#1A3629] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer group"
        title={`Level ${progress.level} · ${progress.title} (${progress.currentLevelXp}/${progress.xpForNextLevel} XP) — Open Sanctuary`}
        aria-label={`Current Level: Level ${progress.level} ${progress.title}`}
      >
        {/* Floating Level Badge Circle */}
        <div className="flex items-center gap-1.5 bg-[#FAF6EE] px-2 py-1 rounded-xl border border-[#1A3629]/30 group-hover:border-[#1A3629] transition-colors">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shrink-0" />
          <span className="font-cabinet text-xs font-black text-[#1A3629] tabular-nums">
            Lv.{progress.level}
          </span>
        </div>

        {/* Title & XP Progress Bar */}
        <div className="flex flex-col gap-0.5 min-w-[70px]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A3629] truncate max-w-[90px] sm:max-w-[120px]">
              {progress.title}
            </span>
            <span className="text-[10px] font-mono font-bold text-[#4A5D4E] tabular-nums">
              {progress.progressPercent}%
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-[#EAE3D2] border border-[#1A3629]/30 overflow-hidden">
            <div
              className="h-full bg-[#10B981] transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>
        </div>

        <span className="hidden md:inline-flex text-[10px] font-mono font-bold text-[#10B981] bg-[#ECFDF5] px-1.5 py-0.5 rounded border border-[#10B981]/30">
          Sanctuary ↗
        </span>
      </Link>
    </div>
  );
}
