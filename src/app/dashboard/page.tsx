'use client';

import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { formatLocalDate } from '@/lib/dateUtils';
import { LivingIslandHero, CircadianHorizonCurve } from '@/components/dashboard/LivingSkyCanopy';
import { CoreHabitsCard } from '@/components/dashboard/CoreHabitsCard';
import { DailyFuelCard } from '@/components/dashboard/DailyFuelCard';
import { FuelTab } from '@/components/dashboard/FuelTab';
import { DossierTab } from '@/components/dashboard/DossierTab';
import { WeeklyDossierModal } from '@/components/dashboard/WeeklyDossierModal';
import { FileText, Plus, Utensils } from 'lucide-react';


function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab') || 'today';
  const activeTab = tabParam === 'fuel' ? 'log' : tabParam;

  const [mounted, setMounted] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const hasCalibratedTodayRef = useRef(false);

  const {
    currentDate,
    getDailyLog,
    setDate,
    userSession,
    userProfile,
    streakCount,
    streakFreezeStock,
  } = useHabitStore();

  const isAuthenticated = !!userSession && !userSession.id.startsWith('guest_');

  useEffect(() => {
    setMounted(true);
    if (!hasCalibratedTodayRef.current) {
      hasCalibratedTodayRef.current = true;
      const today = formatLocalDate();
      if (currentDate !== today) {
        setDate(today);
      }
    }
    if (isAuthenticated && (!userProfile || !userProfile.onboardingCompleted)) {
      router.push('/onboarding');
    }
  }, [isAuthenticated, userProfile, router, currentDate, setDate]);

  const todayDateStr = useMemo(() => formatLocalDate(), []);
  const isViewingToday = currentDate === todayDateStr;
  const todayLog = getDailyLog(currentDate);

  const habitsDoneToday = useMemo(() => {
    return todayLog?.habitsCompleted ? Object.values(todayLog.habitsCompleted).filter(Boolean).length : 0;
  }, [todayLog]);
  const isStreakSecured = habitsDoneToday > 0;

  const targetProtein = userProfile?.weightKg ? Math.round(userProfile.weightKg * 2.0) : 140;
  const currentProtein = todayLog.totalProteinLogged || 0;


  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F4F0EA] flex items-center justify-center text-[#1A3629] font-mono text-xs">
        Loading Member Workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1A3629] transition-colors duration-300 flex flex-col selection:bg-[#1A3629] selection:text-[#FFFDF9]">
      <HeaderNav />

      {/* Main Member Workspace Container — Panoramic Cockpit Breadth */}
      <main className="relative z-10 flex-1 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-24 pb-32 flex flex-col gap-6">
        
        {/* Cockpit Status Header Row: Clean, Editorial, Quiet */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A3629]/8 pb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-cabinet font-extrabold text-2xl sm:text-3xl tracking-tight text-[#1A3629]">
                {activeTab === 'today' && 'Daily Cockpit'}
                {(activeTab === 'log' || activeTab === 'fuel') && 'Daily Nutrition Log'}
                {activeTab === 'dossier' && 'Weekly Intelligence Dossier'}
              </h1>

              {/* Subtle Streak Preservation Reminder */}
              {streakCount > 0 && activeTab === 'today' && isViewingToday && (
                isStreakSecured ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#ECFDF5] border border-[#10B981]/30 text-[#065F46] font-cabinet font-bold text-xs shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    <span>{streakCount}-day streak</span>
                    <span className="text-[10px] font-mono opacity-75">&middot; secured today</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFF7ED] border border-[#FDBA74]/60 text-[#9A3412] font-cabinet font-bold text-xs shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] animate-pulse" />
                    <span>{streakCount}-day streak at stake</span>
                    <span className="text-[10px] font-mono opacity-80">&middot; check 1 habit</span>
                    {streakFreezeStock > 0 && (
                      <span className="text-[10px] font-mono text-[#065F46] bg-[#FFFDF9] px-1.5 py-0.5 rounded-full border border-[#10B981]/20">
                        {streakFreezeStock} freeze saved
                      </span>
                    )}
                  </div>
                )
              )}
            </div>

            <p className="text-xs text-[#4A5D4E] font-sans mt-0.5">
              {activeTab === 'today' && (isViewingToday ? 'Full-screen living sanctuary diorama, daily habit ledger, and circadian rhythm.' : `Archived daily log for ${currentDate}.`)}
              {(activeTab === 'log' || activeTab === 'fuel') && 'Log daily whole foods with AI, verify portions, and calibrate protein.'}
              {activeTab === 'dossier' && '7-day energy patterns, recovery markers, and cadence consistency.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Prominent Cockpit Log Button (Always visible on cockpit) */}
            {activeTab === 'today' && (
              <Link
                id="cockpit-log-button"
                href="/dashboard?tab=log"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1A3629] text-[#FFFDF9] font-cabinet text-xs font-bold hover:bg-[#2C4A3B] transition-all cursor-pointer shadow-xs active:scale-[0.99]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Meal</span>
              </Link>
            )}

            {/* Quick Dossier Modal Trigger */}
            <button
              id="tour-dossier-button"
              type="button"
              onClick={() => {
                retroAudio.playBlip();
                setIsDossierOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#1A3629]/15 bg-[#FFFDF9] text-[#1A3629] font-cabinet text-xs font-bold hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-all cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>7-Day Dossier</span>
            </button>

            {!isViewingToday && (
              <button
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  setDate(todayDateStr);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs hover:bg-[#2C4A3B] transition-all cursor-pointer shadow-2xs"
              >
                Return to Today →
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: TODAY (Full-Screen Flanked Panoramic Cockpit) */}
        {activeTab === 'today' && (
          <div className="w-full flex flex-col gap-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-8 items-start">
              
              {/* LEFT FLANK: Daily Focus Non-Negotiables & Desk Rituals */}
              <div className="w-full lg:col-span-1 xl:col-span-3 order-2 xl:order-1 flex flex-col gap-6">
                <CoreHabitsCard />
              </div>

              {/* CENTER STAGE: Monumental Cardless Living Sanctuary Island */}
              <div className="w-full lg:col-span-2 xl:col-span-6 order-1 xl:order-2 flex flex-col items-center justify-center">
                <LivingIslandHero />
              </div>

              {/* RIGHT FLANK: Circadian Horizon Curve & Daily Fuel Logging */}
              <div className="w-full lg:col-span-1 xl:col-span-3 order-3 xl:order-3 flex flex-col gap-6">
                <CircadianHorizonCurve />
                <DailyFuelCard
                  currentProtein={currentProtein}
                  targetProtein={targetProtein}
                  currentDate={currentDate}
                />
              </div>

            </div>
          </div>
        )}


        {/* TAB 2: LOG */}
        {(activeTab === 'log' || activeTab === 'fuel') && (
          <div className="w-full max-w-5xl mx-auto">
            <FuelTab />
          </div>
        )}

        {/* TAB 3: DOSSIER & HISTORY */}
        {activeTab === 'dossier' && (
          <div className="w-full max-w-5xl mx-auto">
            <DossierTab />
          </div>
        )}


      </main>

      {/* 7-Day Dossier Modal */}
      <WeeklyDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
      />
    </div>

  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F0EA] flex items-center justify-center text-[#1A3629] font-mono text-xs">Loading Member Cockpit...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
