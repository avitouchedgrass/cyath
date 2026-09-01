'use client';

import React from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { STREAK_FREEZE } from '@/lib/progression/config';
import { parseLocalDate, getRelativeLocalDate } from '@/lib/dateUtils';

export function StreakCardMini() {
  const { streakCount, streakFreezeStock, logsByDate, currentDate } = useHabitStore();

  const baseDate = parseLocalDate(currentDate || '');
  const todayDayOfWeek = baseDate.getDay(); // 0 = Sunday

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Check last 7 days activity
  const weekDays = daysOfWeek.map((label, dayIndex) => {
    const offset = dayIndex - todayDayOfWeek;
    const dateStr = getRelativeLocalDate(offset, baseDate);
    const log = logsByDate[dateStr];
    const completedCount = log?.habitsCompleted
      ? Object.values(log.habitsCompleted).filter(Boolean).length
      : 0;

    const isToday = dayIndex === todayDayOfWeek;
    const isFuture = dayIndex > todayDayOfWeek;
    const hasActivity = completedCount > 0;

    return {
      label,
      dayIndex,
      isToday,
      isFuture,
      hasActivity,
      completedCount,
    };
  });

  return (
    <div className="bg-[#FFFDF9] border-2 border-[#1A3629] rounded-2xl p-5 shadow-[3px_3px_0px_#1A3629] flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-[#1A3629]/15 pb-2">
        <h3 className="font-fraunces font-bold text-base text-[#1A3629] tracking-tight">
          Habit Streak
        </h3>
        <div className="flex items-center text-xs font-mono font-bold text-[#D97706] bg-[#FEF3C7] px-2.5 py-0.5 rounded-full border border-[#D97706]/30">
          <span className="tabular-nums">{streakCount} Days Active</span>
        </div>
      </div>

      {/* Week Day Matrix (Sun to Sat) */}
      <div className="grid grid-cols-7 gap-1.5 py-1">
        {weekDays.map((day) => (
          <div
            key={day.dayIndex}
            className={`aspect-square rounded-xl flex flex-col items-center justify-center text-center transition-all ${
              day.hasActivity
                ? 'bg-[#1A3629] text-[#FFFDF9] border border-[#1A3629]'
                : day.isToday
                ? 'bg-[#FAF6EE] text-[#1A3629] border-2 border-[#1A3629]'
                : 'bg-transparent text-[#4A5D4E] border border-transparent'
            }`}
          >
            <span className="font-mono text-[9px] uppercase font-bold leading-none">
              {day.label}
            </span>
            <span className="font-mono text-xs font-bold leading-none mt-1">
              {day.hasActivity ? '✓' : day.isToday ? '·' : '—'}
            </span>
          </div>
        ))}
      </div>

      {/* Freeze Rune Shield Stock */}
      <div className="flex items-center justify-between pt-2 border-t border-[#1A3629]/15">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A3629]/70">
          Streak Freeze
        </span>
        <span className="flex items-center font-mono text-[10px] font-bold text-[#4A5D4E]">
          <span className="tabular-nums">{streakFreezeStock} Available</span>
        </span>
        <span className={`font-bold px-2 py-0.5 rounded-md border tabular-nums ${
          streakFreezeStock > 0
            ? 'text-[#2563EB] bg-[#EFF6FF] border-[#2563EB]/30'
            : 'text-[#4A5D4E] bg-[#FAF6EE] border-[#1A3629]/20'
        }`}>
          {streakFreezeStock}/{STREAK_FREEZE.maxStock} Ready
        </span>
      </div>
    </div>
  );
}
