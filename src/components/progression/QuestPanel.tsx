'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { getDailyQuests, DailyQuest } from '@/lib/progression/engine';
import { WEEKLY_CHALLENGE_XP } from '@/lib/progression/config';

export function QuestPanel() {
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
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#1A3629]/15 pb-4">
        <div>
          <h3 className="font-fraunces font-black text-2xl text-[#1A3629] tracking-tight">
            Active Quests & Challenges
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#FAF6EE] border border-[#1A3629]/30 font-mono text-xs text-[#4A5D4E] flex items-center gap-1.5 shadow-[1px_1px_0px_#1A3629]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-ping" />
            Resets in {timeUntilReset}
          </span>
        </div>
      </div>

      {/* Quests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quests.map((quest) => {
          const isClaimed = claimedQuestIds.includes(quest.id);
          const percent = Math.min(100, Math.round((quest.progress / quest.target) * 100));

          return (
            <div
              key={quest.id}
              className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                isClaimed
                  ? 'bg-[#F4EDE0]/50 border-[#1A3629]/30 opacity-80'
                  : quest.completed
                  ? 'bg-[#FFFDF9] border-[#D97706] shadow-[3px_3px_0px_#D97706]'
                  : 'bg-[#FFFDF9] border-[#1A3629] shadow-[3px_3px_0px_#1A3629]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#FAF6EE] border border-[#1A3629]/20 font-mono text-[10px] font-bold uppercase text-[#4A5D4E]">
                    {quest.category}
                  </span>
                  <span className="font-cabinet text-xs font-bold text-[#D97706]">
                    +{quest.xpAward} XP
                  </span>
                </div>

                <h4 className="font-fraunces font-bold text-lg text-[#1A3629] mb-1">
                  {quest.title}
                </h4>
                <p className="font-sans text-xs text-[#4A5D4E] mb-4 leading-relaxed">
                  {quest.description}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#2C4A3B] mb-1.5">
                  <span>Progress</span>
                  <span className="font-bold">
                    {quest.progress} / {quest.target} {quest.unit}
                  </span>
                </div>

                <div className="w-full h-2.5 bg-[#EAE3D2] rounded-full border border-[#1A3629]/40 overflow-hidden mb-3.5">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      quest.completed ? 'bg-[#10B981]' : 'bg-[#D97706]'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {isClaimed ? (
                  <div className="w-full py-2 text-center font-mono text-xs font-bold text-[#10B981] bg-[#E8F5E9] border border-[#10B981]/40 rounded-xl">
                    Claimed ✓
                  </div>
                ) : quest.completed ? (
                  <button
                    type="button"
                    onClick={() => claimQuest(quest.id, currentDate)}
                    className="w-full py-2 bg-[#D97706] text-[#FFFDF9] font-cabinet text-xs font-bold rounded-xl border-2 border-[#1A3629] shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                  >
                    Claim +{quest.xpAward} XP!
                  </button>
                ) : (
                  <div className="w-full py-2 text-center font-mono text-xs text-[#4A5D4E] bg-[#FAF6EE] border border-[#1A3629]/20 rounded-xl">
                    In Progress ({percent}%)
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Challenge Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#FAF6EE] to-[#F5EEDF] border-2 border-[#1A3629] shadow-[3px_3px_0px_#1A3629] flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-1">
            <img
              src="/assets/progression/relic_freeze_rune.webp"
              alt="Endurance Relic"
              className="w-5 h-5 rounded-sm object-cover [image-rendering:pixelated] border border-[#1A3629]/20"
            />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1A3629]">
              Weekly Endurance Goal
            </span>
          </div>
          <h4 className="font-fraunces font-bold text-xl text-[#1A3629] mb-1">
            7-Day Consistency Challenge
          </h4>
          <p className="font-sans text-xs text-[#4A5D4E] leading-relaxed">
            Complete at least 20 total habit executions across the rolling week to earn the weekly endurance bonus.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-[240px]">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="text-[#4A5D4E]">Progress</span>
              <span className="font-bold text-[#1A3629]">
                {weeklyHabitCount} / {weeklyTarget} Habits
              </span>
            </div>
            <div className="w-full h-3 bg-[#EAE3D2] rounded-full border border-[#1A3629]/40 overflow-hidden">
              <div
                className="h-full bg-[#1A3629] transition-all duration-500 rounded-full"
                style={{ width: `${weeklyProgressPercent}%` }}
              />
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-[#FFFDF9] border border-[#1A3629] shadow-[2px_2px_0px_#1A3629] text-center shrink-0">
            <span className="block font-mono text-[10px] uppercase font-bold text-[#4A5D4E]">
              Reward
            </span>
            <span className="font-cabinet text-sm font-bold text-[#D97706]">
              +{WEEKLY_CHALLENGE_XP} XP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
