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
      id="xp-hud-badge-target"
      href="/dashboard?tab=today"
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-[#1A3629]/15 bg-[#FFFDF9] shadow-2xs hover:bg-[#F4F0EA] transition-colors cursor-pointer select-none group"
      title={`Level ${progress.level} ${progress.title}: ${progress.currentLevelXp}/${progress.xpForNextLevel} XP`}
    >
      <div className="flex items-center justify-center">
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
