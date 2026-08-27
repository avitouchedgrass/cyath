'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { getDailyQuests, DailyQuest } from '@/lib/progression/engine';
import { WEEKLY_CHALLENGE_XP } from '@/lib/progression/config';
import { retroAudio } from '@/lib/retroAudio';

export function DailyQuestsMini() {
  const {
    currentDate,
    getDailyLog,
    habits,
    completedQuestIdsByDate,
    claimQuest,
    logsByDate,
  } = useHabitStore();

  const [timeUntilReset, setTimeUntilReset] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const diffMs = Math.max(0, endOfDay.getTime() - now.getTime());
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setTimeUntilReset(`${hours}h ${minutes}m`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, []);

  const todayLog = getDailyLog(currentDate);
  const quests: DailyQuest[] = useMemo(() => {
    return getDailyQuests(currentDate, todayLog, habits);
  }, [currentDate, todayLog, habits]);

  const claimedQuestIds = completedQuestIdsByDate[currentDate] || [];

  // Weekly Challenge Progress: Habits completed in the last 7 days
  const weeklyHabitCount = useMemo(() => {
    const today = new Date(currentDate);
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const log = logsByDate[key];
      if (log?.habitsCompleted) {
        count += Object.values(log.habitsCompleted).filter(Boolean).length;
      }
    }
    return count;
  }, [currentDate, logsByDate]);

  const weeklyTarget = 20;
  const weeklyProgressPercent = Math.min(100, Math.round((weeklyHabitCount / weeklyTarget) * 100));

  return (
    <div className="bg-[#FFFDF9] border-2 border-[#1A3629] rounded-2xl p-5 shadow-[3px_3px_0px_#1A3629] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1A3629]/15 pb-2">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A3629]/70 block">
            Daily Rituals
          </span>
          <h3 className="font-fraunces font-bold text-base text-[#1A3629] tracking-tight">
            Daily Focus
          </h3>
        </div>
        <span className="font-mono text-[10px] text-[#1A3629] font-bold bg-[#FAF6EE] px-2 py-0.5 rounded-md border border-[#1A3629]/20 tabular-nums">
          Resets {timeUntilReset}
        </span>
      </div>

      {/* Vertical Stack of 3 Compact Quests */}
      <div className="flex flex-col gap-3">
        {quests.map((quest) => {
          const isClaimed = claimedQuestIds.includes(quest.id);
          const percent = Math.min(100, Math.round((quest.progress / quest.target) * 100));

          return (
            <div
              key={quest.id}
              className={`p-3 rounded-xl border-2 transition-all flex flex-col gap-2 ${
                isClaimed
                  ? 'bg-[#FAF6EE]/50 border-[#1A3629]/20 opacity-75'
                  : quest.completed
                  ? 'bg-[#ECFDF5] border-[#1A3629] shadow-[2px_2px_0px_#10B981]'
                  : 'bg-[#FFFDF9] border-[#1A3629]/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-cabinet text-xs font-bold text-[#1A3629] block truncate">
                    {quest.title}
                  </span>
                  <span className="font-mono text-[10px] font-medium text-[#4A5D4E] tabular-nums">
                    {quest.progress}/{quest.target} {quest.unit}
                  </span>
                </div>

                {isClaimed ? (
                  <span className="font-mono text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-md border border-[#10B981]/30 shrink-0 uppercase tracking-wider">
                    Done ✓
                  </span>
                ) : quest.completed ? (
                  <button
                    type="button"
                    onClick={() => {
                      retroAudio.playBlip();
                      claimQuest(quest.id, currentDate);
                    }}
                    className="font-mono text-[10px] font-bold text-[#FFFDF9] bg-[#10B981] hover:bg-[#059669] px-2.5 py-1 rounded-md border border-[#1A3629] shadow-[1px_1px_0px_#1A3629] transition-all active:scale-95 cursor-pointer shrink-0 animate-pulse uppercase tracking-wider tabular-nums"
                  >
                    Claim +{quest.xpAward} XP
                  </button>
                ) : (
                  <span className="font-mono text-[10px] font-bold text-[#D97706] bg-[#FEF3C7] px-1.5 py-0.5 rounded-md border border-[#D97706]/30 shrink-0 tabular-nums">
                    +{quest.xpAward} XP
                  </span>
                )}
              </div>

              {/* Mini progress bar */}
              <div className="w-full h-2 bg-[#EAE3D2] rounded-full overflow-hidden border border-[#1A3629]/20 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    quest.completed ? 'bg-[#10B981]' : 'bg-[#D97706]'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Challenge Row */}
      <div className="pt-3 border-t border-[#1A3629]/15 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-[#1A3629]">
            7-Day Endurance
          </span>
          <span className="text-[#10B981] font-bold font-mono tabular-nums">
            +{WEEKLY_CHALLENGE_XP} XP
          </span>
        </div>

        <div className="w-full h-2.5 bg-[#EAE3D2] rounded-full overflow-hidden border border-[#1A3629]/20 p-0.5">
          <div
            className="h-full bg-[#10B981] rounded-full transition-all duration-500"
            style={{ width: `${weeklyProgressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-[#1A3629]/70 tabular-nums">
          <span>{weeklyHabitCount} of {weeklyTarget} habits</span>
          <span>{weeklyProgressPercent}%</span>
        </div>
      </div>
    </div>
  );
}
