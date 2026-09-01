'use client';

import React, { useMemo } from 'react';
import { useHabitStore } from '@/store/useHabitStore';

export function HabitStatsCard() {
  const { logsByDate, totalXp } = useHabitStore();

  const stats = useMemo(() => {
    const logs = Object.values(logsByDate);
    const activeDaysCount = logs.filter(
      (l) => l.habitsCompleted && Object.values(l.habitsCompleted).some(Boolean)
    ).length;

    let totalHabitsEver = 0;
    logs.forEach((l) => {
      if (l.habitsCompleted) {
        totalHabitsEver += Object.values(l.habitsCompleted).filter(Boolean).length;
      }
    });

    const dailyAvg = activeDaysCount > 0 ? (totalHabitsEver / activeDaysCount).toFixed(1) : '0.0';

    return {
      activeDaysCount,
      dailyAvg,
      totalHabitsEver,
      totalXp,
    };
  }, [logsByDate, totalXp]);

  return (
    <div className="bg-[#FFFDF9] border-2 border-[#1A3629] rounded-2xl p-5 shadow-[3px_3px_0px_#1A3629] flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-[#1A3629]/15 pb-2">
        <h3 className="font-fraunces font-bold text-base text-[#1A3629] tracking-tight">
          Lifetime Stats
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <div className="p-2.5 rounded-xl bg-[#FAF6EE]/70 border border-[#1A3629]/15">
          <span className="font-mono text-[9px] text-[#1A3629]/70 uppercase font-bold tracking-wider block mb-0.5">
            Daily Average
          </span>
          <span className="font-cabinet text-2xl font-black text-[#1A3629] leading-none tabular-nums block">
            {stats.dailyAvg}
          </span>
          <span className="font-cabinet text-[11px] font-medium text-[#4A5D4E]">habits / day</span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#FAF6EE]/70 border border-[#1A3629]/15">
          <span className="font-mono text-[9px] text-[#1A3629]/70 uppercase font-bold tracking-wider block mb-0.5">
            Total Logged
          </span>
          <span className="font-cabinet text-2xl font-black text-[#1A3629] leading-none tabular-nums block">
            {stats.totalHabitsEver}
          </span>
          <span className="font-cabinet text-[11px] font-medium text-[#4A5D4E]">actions done</span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#FAF6EE]/70 border border-[#1A3629]/15">
          <span className="font-mono text-[9px] text-[#1A3629]/70 uppercase font-bold tracking-wider block mb-0.5">
            Active Days
          </span>
          <span className="font-cabinet text-2xl font-black text-[#1A3629] leading-none tabular-nums block">
            {stats.activeDaysCount}
          </span>
          <span className="font-cabinet text-[11px] font-medium text-[#4A5D4E]">days recorded</span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#ECFDF5] border border-[#10B981]/30">
          <span className="font-mono text-[9px] text-[#065F46] uppercase font-bold tracking-wider block mb-0.5">
            Total XP
          </span>
          <span className="font-cabinet text-2xl font-black text-[#10B981] leading-none tabular-nums block">
            {stats.totalXp >= 1000 ? `${(stats.totalXp / 1000).toFixed(1)}K` : stats.totalXp}
          </span>
          <span className="font-cabinet text-[11px] font-medium text-[#065F46]">lifetime points</span>
        </div>
      </div>
    </div>
  );
}
