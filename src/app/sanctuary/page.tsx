'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { useHabitStore } from '@/store/useHabitStore';
import { calculateLevel } from '@/lib/progression/engine';
import { IslandCenterStage } from '@/components/progression/IslandCenterStage';
import { HabitCalendarMini } from '@/components/progression/HabitCalendarMini';
import { StreakCardMini } from '@/components/progression/StreakCardMini';
import { HabitStatsCard } from '@/components/progression/HabitStatsCard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export default function SanctuaryPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { userSession, totalXp, streakCount } = useHabitStore();

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

      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 flex flex-col gap-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: 'Sanctuary' }]} />

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#1A3629]/15 pb-4">
          <div>
            <h1 className="font-fraunces font-black text-3xl md:text-4xl tracking-tight text-[#1A3629]">
              Island Sanctuary
            </h1>
            <p className="font-cabinet text-xs sm:text-sm font-medium text-[#4A5D4E] mt-0.5">
              Your living sky world directly evolves as you complete daily health habits.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-full border-2 border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] font-mono font-bold text-xs flex items-center shadow-[2px_2px_0px_#1A3629]">
              <span className="tabular-nums">{streakCount} Day Streak</span>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-cabinet font-bold px-4 py-2 rounded-full border-2 bg-[#1A3629] border-[#1A3629] text-[#FFFDF9] shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              <span>Daily Planner →</span>
            </Link>
          </div>
        </div>

        {/* Hero Section: Centered Island Stage with Spacious Breathing Room */}
        <section className="w-full flex flex-col items-center justify-center py-2">
          <IslandCenterStage
            currentLevel={progress.level}
            totalXp={progress.totalXp}
            progressPercent={progress.progressPercent}
          />
        </section>

        {/* Bottom Consistency & Progress Grid (3 Balanced Cards) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mt-4">
          <HabitStatsCard />
          <StreakCardMini />
          <HabitCalendarMini />
        </section>
      </main>
    </div>
  );
}
