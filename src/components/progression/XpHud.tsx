'use client';

import React from 'react';
import Link from 'next/link';
import { useHabitStore } from '@/store/useHabitStore';
import { calculateLevel } from '@/lib/progression/engine';
import { getIslandTier } from '@/lib/progression/config';
import { StreakBadge } from './StreakBadge';

export function XpHud() {
  const { totalXp } = useHabitStore();
  const progress = calculateLevel(totalXp);
  const islandTier = getIslandTier(progress.level);

  return (
    <div className="w-full bg-[#FFFDF9] border border-[#1A3629]/10 rounded-3xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(26,54,41,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-5">
      {/* Left: Level, Sanctuary Stage & Title */}
      <div className="flex items-center gap-4">
        <div 
          id="xp-hud-target"
          className="w-14 h-14 rounded-2xl bg-[#F4EDE0] border border-[#1A3629]/15 flex flex-col items-center justify-center shrink-0 shadow-2xs"
        >
          <span className="font-mono text-[10px] uppercase font-bold text-[#4A5D4E]">
            LVL
          </span>
          <span className="font-cabinet text-2xl font-black text-[#1A3629] leading-none">
            {progress.level}
          </span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="font-cabinet font-bold text-xl sm:text-2xl text-[#1A3629] tracking-tight">
              Level {progress.level}
            </h2>
            <span className="font-cabinet font-semibold text-xs sm:text-sm text-[#4A5D4E]">
              · Phase {islandTier.tier}: {islandTier.name}
            </span>
          </div>
          <p className="font-mono text-[11px] text-[#4A5D4E] mt-0.5">
            {progress.isMaxLevel ? 'Maximum Level Reached' : `${progress.xpForNextLevel - progress.currentLevelXp} XP needed for Level ${progress.level + 1}`}
          </p>
        </div>
      </div>

      {/* Middle: Progress Bar */}
      <div className="flex-1 max-w-md flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#4A5D4E]">Progress to next level</span>
          <span className="font-bold text-[#1A3629]">
            {progress.isMaxLevel ? 'Complete' : `${progress.currentLevelXp} / ${progress.xpForNextLevel} XP`}
          </span>
        </div>

        <div className="w-full h-3 bg-[#EAE3D2]/70 rounded-full border border-[#1A3629]/15 overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-[#D97706] to-[#F59E0B] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress.progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-[#4A5D4E]">
          <span>{progress.progressPercent}% to next tier</span>
          <span>{progress.totalXp} Total XP</span>
        </div>
      </div>

      {/* Right: Streak & Full Progress Link */}
      <div className="flex items-center gap-3 self-end md:self-center">
        <StreakBadge />
        <Link
          href="/dashboard?tab=today"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A3629] text-[#FFFDF9] font-cabinet text-xs font-semibold hover:bg-[#234535] transition-colors"
        >
          <span>Daily Cockpit →</span>
        </Link>
      </div>
    </div>
  );
}
