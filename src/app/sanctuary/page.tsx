'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { useHabitStore } from '@/store/useHabitStore';
import { calculateLevel } from '@/lib/progression/engine';
import { IslandCenterStage } from '@/components/progression/IslandCenterStage';
import { DailyArcGauge } from '@/components/progression/DailyArcGauge';
import { HabitCalendarMini } from '@/components/progression/HabitCalendarMini';
import { StreakCardMini } from '@/components/progression/StreakCardMini';
import { HabitStatsCard } from '@/components/progression/HabitStatsCard';
import { DailyQuestsMini } from '@/components/progression/DailyQuestsMini';

export default function SanctuaryPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { userSession, totalXp, habits, getDailyLog, currentDate, xpHistory, streakCount } = useHabitStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoggedIn = mounted && !!userSession && !userSession.id.startsWith('guest_');

  useEffect(() => {
    if (mounted && (!userSession || userSession.id.startsWith('guest_'))) {
      router.push('/login?redirect=/sanctuary');
    }
  }, [mounted, userSession, router]);

  const progress = useMemo(() => calculateLevel(totalXp), [totalXp]);

  const todayLog = getDailyLog(currentDate);
  const totalHabitsCount = habits.length;
  const completedHabitsCount = useMemo(() => {
    return habits.filter((h) => !!todayLog?.habitsCompleted?.[h.id]).length;
  }, [habits, todayLog?.habitsCompleted]);

  if (!mounted || !isLoggedIn) {
    return (
      <div className="min-h-[100dvh] bg-[#F4F0EA] flex items-center justify-center font-mono text-xs text-[#1A3629]">
        Redirecting to login...
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#F4F0EA] text-[#1A3629] flex flex-col selection:bg-[#1A3629] selection:text-[#FFFDF9]">
      <HeaderNav />

      <main className="relative z-10 flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-10 pt-24 pb-20 flex flex-col gap-6">
        {/* Top Cyath Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#1A3629]/15 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase tracking-wider bg-[#FFFDF9] border-[#1A3629] text-[#1A3629]">
                Progression · Level {progress.level}
              </span>
              <span className="px-2.5 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase tracking-wider bg-[#ECFDF5] border-[#10B981]/40 text-[#065F46]">
                {progress.title}
              </span>
            </div>
            <h1 className="font-fraunces font-black text-3xl md:text-4xl tracking-tight text-[#1A3629]">
              Sanctuary
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 rounded-full border-2 border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] font-mono font-bold text-xs flex items-center shadow-[2px_2px_0px_#1A3629]">
              <span className="tabular-nums">{streakCount} Day Streak</span>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-cabinet font-bold px-4 py-2 rounded-full border-2 bg-[#1A3629] border-[#1A3629] text-[#FFFDF9] shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              <span>+ Log Habit Routine</span>
            </Link>
          </div>
        </div>

        {/* 3-Column islands.study Layout with Cyath Neo-Retro Tactile Styling */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column (lg:col-span-3): Daily Arc + Calendar + Recent Activity */}
          <div className="lg:col-span-3 flex flex-col gap-5 order-2 lg:order-1">
            {/* 1. Daily Arc Gauge */}
            <DailyArcGauge
              completedCount={completedHabitsCount}
              totalCount={totalHabitsCount}
            />

            {/* 2. Habit Activity Calendar */}
            <HabitCalendarMini />

            {/* 3. Recent Activity Sessions */}
            <div className="bg-[#FFFDF9] border-2 border-[#1A3629] rounded-2xl p-5 shadow-[3px_3px_0px_#1A3629] flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-[#1A3629]/15 pb-2">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A3629]/70 block">
                    Ledger Audit
                  </span>
                  <h3 className="font-fraunces font-bold text-base text-[#1A3629]">
                    Recent Activity
                  </h3>
                </div>
                <span className="font-mono text-[10px] text-[#1A3629] font-bold bg-[#FAF6EE] px-2 py-0.5 rounded-md border border-[#1A3629]/20 tabular-nums">
                  {xpHistory.length} events
                </span>
              </div>

              <div className="divide-y divide-[#1A3629]/10">
                {xpHistory.length === 0 ? (
                  <div className="py-4 text-center font-mono text-[11px] text-[#4A5D4E]">
                    No recent habit logs recorded.
                  </div>
                ) : (
                  xpHistory.slice(0, 4).map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-cabinet text-xs font-bold text-[#1A3629] block truncate">
                          {item.reason}
                        </span>
                        <span className="font-mono text-[10px] text-[#4A5D4E] tabular-nums">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-md border border-[#10B981]/25 shrink-0 tabular-nums">
                        +{item.amount} XP
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Center Column (lg:col-span-6): The Floating Island */}
          <div className="lg:col-span-6 flex flex-col items-center justify-start order-1 lg:order-2">
            <IslandCenterStage
              currentLevel={progress.level}
              totalXp={progress.totalXp}
              progressPercent={progress.progressPercent}
            />
          </div>

          {/* Right Column (lg:col-span-3): Stats + Streak + Compact Quests */}
          <div className="lg:col-span-3 flex flex-col gap-5 order-3">
            {/* 1. Habit Discipline Stats */}
            <HabitStatsCard />

            {/* 2. Weekly Streak Tracker */}
            <StreakCardMini />

            {/* 3. Daily Focus Quests (Compact) */}
            <DailyQuestsMini />
          </div>
        </div>
      </main>
    </div>
  );
}
