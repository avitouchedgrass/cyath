'use client';

import React from 'react';
import Link from 'next/link';
import { useHabitStore } from '@/store/useHabitStore';
import { calculateLevel } from '@/lib/progression/engine';
import { StreakBadge } from './StreakBadge';

export function XpHud() {
  const { totalXp } = useHabitStore();
  const progress = calculateLevel(totalXp);

  return (
    <div className="w-full bg-[#FFFDF9] border-2 border-[#1A3629] rounded-3xl p-5 sm:p-6 shadow-[3px_3px_0px_#1A3629] flex flex-col md:flex-row md:items-center justify-between gap-5">
      {/* Left: Level & Title */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#F4EDE0] border-2 border-[#1A3629] shadow-[3px_3px_0px_#1A3629] flex flex-col items-center justify-center">
          <span className="font-mono text-[10px] uppercase font-bold text-[#4A5D4E]">
            LVL
          </span>
          <span className="font-cabinet text-2xl font-black text-[#1A3629] leading-none">
            {progress.level}
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#D97706]">
              Title Rank
            </span>
            {progress.isMaxLevel && (
              <span className="px-2 py-0.5 rounded-full bg-[#D97706] text-[#FFFDF9] font-mono text-[9px] font-bold">
                MAX
              </span>
            )}
          </div>
          <h2 className="font-fraunces font-bold text-2xl text-[#1A3629] tracking-tight">
            {progress.title}
          </h2>
          {progress.nextTitle && (
            <p className="font-mono text-xs text-[#4A5D4E]">
              Next rank: {progress.nextTitle}
            </p>
          )}
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

        <div className="w-full h-3.5 bg-[#EAE3D2] rounded-full border-2 border-[#1A3629] overflow-hidden p-0.5">
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
          href="/sanctuary"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A3629] text-[#FFFDF9] font-cabinet text-xs font-bold border-2 border-[#1A3629] shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
        >
          <span>Island Sanctuary →</span>
        </Link>
      </div>
    </div>
  );
}
