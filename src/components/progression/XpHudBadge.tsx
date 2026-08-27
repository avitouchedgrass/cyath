'use client';

import React from 'react';
import Link from 'next/link';
import { useHabitStore } from '@/store/useHabitStore';
import { calculateLevel } from '@/lib/progression/engine';

export function XpHudBadge() {
  const { totalXp } = useHabitStore();
  const progress = calculateLevel(totalXp);

  return (
    <Link
      href="/sanctuary"
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border-2 border-[#1A3629] bg-[#FFFDF9] shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer select-none group"
      title={`Level ${progress.level} ${progress.title}: ${progress.currentLevelXp}/${progress.xpForNextLevel} XP`}
    >
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
        <span className="font-cabinet text-xs font-black text-[#1A3629] tabular-nums">
          Lv.{progress.level}
        </span>
      </div>

      <div className="hidden sm:flex items-center gap-1.5">
        <div className="w-12 h-2 rounded-full bg-[#EAE3D2] border border-[#1A3629]/40 overflow-hidden">
          <div
            className="h-full bg-[#10B981] transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress.progressPercent}%` }}
          />
        </div>
        <span className="font-mono text-[10px] font-bold text-[#4A5D4E] tabular-nums">
          {progress.progressPercent}%
        </span>
      </div>
    </Link>
  );
}
