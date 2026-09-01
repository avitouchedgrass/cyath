'use client';

import React, { useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { STREAK_MILESTONES, STREAK_FREEZE } from '@/lib/progression/config';

import { Flame, ShieldCheck } from 'lucide-react';

interface StreakBadgeProps {
  showDetails?: boolean;
}

export function StreakBadge({ showDetails = false }: StreakBadgeProps) {
  const { streakCount, streakFreezeStock } = useHabitStore();
  const [open, setOpen] = useState(false);

  const nextMilestone = STREAK_MILESTONES.find((m) => m.days > streakCount) ?? null;
  const daysLeft = nextMilestone ? nextMilestone.days - streakCount : 0;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-[#1A3629] bg-[#FFFDF9] shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer select-none group"
        aria-label="View streak details"
      >
        <div className="flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-[#D97706] fill-[#F59E0B] shrink-0" />
          <span className="font-cabinet text-xs font-bold text-[#1A3629] tabular-nums">
            {streakCount} {streakCount === 1 ? 'Day' : 'Days'}
          </span>
        </div>

        {streakFreezeStock > 0 && (
          <div
            className="flex items-center gap-1 pl-2 border-l border-[#1A3629]/20 text-[11px] font-mono font-bold text-[#2563EB]"
            title={`${streakFreezeStock} Streak Freeze available`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
            <span className="tabular-nums">{streakFreezeStock}</span>
          </div>
        )}
      </button>

      {(open || showDetails) && (
        <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-64 p-4 bg-[#FFFDF9] border-2 border-[#1A3629] rounded-2xl shadow-[4px_4px_0px_#1A3629] z-40 text-left animate-card-enter">
          <div className="flex items-center justify-between mb-2">
            <span className="font-cabinet text-xs font-bold text-[#1A3629] uppercase tracking-wider">
              Consistency Streak
            </span>
            <span className="text-xs font-mono font-bold text-[#D97706]">
              {streakCount} Days Active
            </span>
          </div>

          <p className="font-sans text-xs text-[#4A5D4E] mb-3">
            {nextMilestone
              ? `${daysLeft} more ${daysLeft === 1 ? 'day' : 'days'} to reach ${nextMilestone.name} (+${nextMilestone.xp} XP)`
              : 'Maximum milestone achieved! You hold the Eternal Flame.'}
          </p>

          <div className="pt-2 border-t border-[#1A3629]/15 flex items-center justify-between text-[11px] font-mono text-[#2C4A3B]">
            <span>Streak Freezes:</span>
            <span className="font-bold">
              {streakFreezeStock}/{STREAK_FREEZE.maxStock} stocked
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
