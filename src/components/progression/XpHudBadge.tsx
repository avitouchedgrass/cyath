'use client';

import React from 'react';
import Link from 'next/link';
import { useHabitStore } from '@/store/useHabitStore';
import { calculateLevel } from '@/lib/progression/engine';

export function XpHudBadge() {
  const { totalXp, streakCount } = useHabitStore();
  const progress = calculateLevel(totalXp);

  return (
    <Link
      href="/progress"
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border-2 border-[#1A3629] bg-[#FFFDF9] shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer select-none group"
      title={`Level ${progress.level} ${progress.title}: ${progress.currentLevelXp}/${progress.xpForNextLevel} XP`}
    >
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
        <span className="font-pixel text-xs font-bold text-[#1A3629]">
          Lv.{progress.level}
        </span>
      </div>

      <div className="hidden sm:flex items-center gap-1.5">
        <div className="w-12 h-2 rounded-full bg-[#EAE3D2] border border-[#1A3629]/40 overflow-hidden">
          <div
            className="h-full bg-[#D97706] transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress.progressPercent}%` }}
          />
        </div>
        <span className="font-mono text-[10px] font-bold text-[#4A5D4E]">
          {progress.progressPercent}%
        </span>
      </div>

      <div className="flex items-center gap-1.5 pl-2 border-l border-[#1A3629]/20 text-xs">
        <img
          src="/assets/progression/relic_flame_brazier.jpg"
          alt="Flame"
          className="w-4 h-4 rounded-sm object-cover [image-rendering:pixelated]"
        />
        <span className="font-pixel text-xs font-bold text-[#1A3629]">
          {streakCount}
        </span>
      </div>
    </Link>
  );
}
