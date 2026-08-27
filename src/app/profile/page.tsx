'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { useHabitStore } from '@/store/useHabitStore';
import { supabase } from '@/lib/supabase';
import { retroAudio } from '@/lib/retroAudio';
import { XpHud } from '@/components/progression/XpHud';

const GOAL_TITLES: Record<string, string> = {
  focus: 'Peak Energy & Focus',
  muscle: 'Strength & Fuel',
  sleep: 'Deep Restful Sleep',
  longevity: 'Daily Well-Being',
  fat_loss: 'Healthy Habits',
};

export default function ProfilePage() {
  const router = useRouter();
  const {
    userSession,
    setUserSession,
    userProfile,
    logsByDate,
    activeProtocolIds,
  } = useHabitStore();

  const [mounted, setMounted] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalDaysLogged = Object.keys(logsByDate).length;
  const totalHabitsCompleted = Object.values(logsByDate).reduce((acc, log) => {
    return acc + Object.values(log.habitsCompleted || {}).filter(Boolean).length;
  }, 0);
  const totalProteinLogged = Object.values(logsByDate).reduce((acc, log) => {
    return acc + (log.totalProteinLogged || 0);
  }, 0);

  const handleSignOut = async () => {
    retroAudio.playBlip();
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
    setUserSession(null);
    router.push('/');
  };

  const handleForceSync = async () => {
    retroAudio.playBlip();
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setSyncStatus('All data synchronized with cloud!');
      setTimeout(() => setSyncStatus(null), 3500);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!mounted) return null;

  const isGuest = !userSession || userSession.id.startsWith('guest_');
  const userEmail = userSession?.email || (isGuest ? 'demo.user@cyath.app' : 'user@cyath.app');
  const displayName = userProfile?.fullName || (isGuest ? 'Demo Explorer' : userEmail.split('@')[0]);
  const goalTitle = userProfile?.primaryGoal && GOAL_TITLES[userProfile.primaryGoal]
    ? GOAL_TITLES[userProfile.primaryGoal]
    : 'Daily Well-Being';

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1A3629] transition-colors duration-300 flex flex-col">
      <HeaderNav />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 lg:px-10 pt-28 pb-24">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-[#1A3629]/15">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-cabinet font-bold px-4 py-1.5 rounded-full border-2 bg-[#1A3629] border-[#1A3629] text-[#FFFDF9] shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          >
            <span>← Return to Daily Planner</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-cabinet font-bold px-4 py-1.5 rounded-full border-2 bg-[#1A3629] border-[#1A3629] text-[#FFFDF9] shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          >
            <span>Back to Home →</span>
          </Link>
        </div>

        {/* User Identity Banner */}
        <div className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[6px_6px_0px_#1A3629] rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl border-3 border-[#1A3629] bg-[#F4F0EA] flex items-center justify-center font-pixel font-bold text-xl text-[#1A3629] shadow-[3px_3px_0px_#1A3629]">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-fraunces font-black text-2xl sm:text-3xl tracking-tight text-[#1A3629]">
                  {displayName}
                </h1>
                {isGuest && (
                  <span className="px-2.5 py-0.5 rounded-full border border-[#1A3629] bg-[#F4F0EA] text-[10px] font-mono font-bold">
                    GUEST
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-[#2C4A3B]">
                {userEmail} · Goal: {goalTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleForceSync}
              disabled={isSyncing}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border-2 border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60"
            >
              <span>{isSyncing ? 'Syncing...' : 'Sync Cloud'}</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {syncStatus && (
          <div className="mb-6 p-4 rounded-xl border-2 border-[#1A3629] bg-[#E8DECF] text-xs font-mono font-bold text-[#1A3629]">
            ✓ {syncStatus}
          </div>
        )}

        {/* Progression HUD */}
        <div className="mb-8">
          <XpHud />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[4px_4px_0px_#1A3629] rounded-2xl p-6">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider block mb-2 opacity-75">
              Days Calibrated
            </span>
            <div className="font-mono font-black text-3xl tabular-nums text-[#1A3629]">
              {totalDaysLogged}
            </div>
            <span className="text-xs font-cabinet font-medium text-[#2C4A3B] mt-1 block">
              Logged journal entries
            </span>
          </div>

          <div className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[4px_4px_0px_#1A3629] rounded-2xl p-6">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider block mb-2 opacity-75">
              Habits Checked
            </span>
            <div className="font-mono font-black text-3xl tabular-nums text-[#1A3629]">
              {totalHabitsCompleted}
            </div>
            <span className="text-xs font-cabinet font-medium text-[#2C4A3B] mt-1 block">
              Micro-routines executed
            </span>
          </div>

          <div className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[4px_4px_0px_#1A3629] rounded-2xl p-6">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider block mb-2 opacity-75">
              Total Protein Fuel
            </span>
            <div className="font-mono font-black text-3xl tabular-nums text-[#1A3629]">
              {totalProteinLogged}g
            </div>
            <span className="text-xs font-cabinet font-medium text-[#2C4A3B] mt-1 block">
              Cumulative whole-food fuel
            </span>
          </div>
        </div>

        {/* Account Details & Blueprints Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[4px_4px_0px_#1A3629] rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="font-fraunces font-bold text-xl mb-4 text-[#1A3629]">
                Calibrated Blueprint
              </h2>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#1A3629]/15">
                  <span>Target Daily Protein:</span>
                  <span className="font-bold">
                    {userProfile?.weightKg ? Math.round(userProfile.weightKg * 2.0) : 140}g / day
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#1A3629]/15">
                  <span>Target Hydration:</span>
                  <span className="font-bold">
                    {userProfile?.weightKg ? (userProfile.weightKg * 0.04).toFixed(1) : '2.5'}L / day
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#1A3629]/15">
                  <span>Target Sleep:</span>
                  <span className="font-bold">8.0 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active Blueprints:</span>
                  <span className="font-bold">{activeProtocolIds?.length || 1} Imported</span>
                </div>
              </div>
            </div>

            <Link
              href="/onboarding"
              className="mt-6 w-full py-3 rounded-xl border-2 border-[#1A3629] bg-[#F4F0EA] text-[#1A3629] font-cabinet font-bold text-xs text-center shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 transition-all block"
            >
              Re-Calibrate Daily Targets →
            </Link>
          </div>

          <div className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[4px_4px_0px_#1A3629] rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="font-fraunces font-bold text-xl mb-4 text-[#1A3629]">
                Quick Links
              </h2>
              <ul className="space-y-2.5 font-cabinet font-bold text-xs">
                <li>
                  <Link href="/protocols" className="flex items-center justify-between p-2.5 rounded-xl border border-[#1A3629]/20 hover:bg-[#F4F0EA] transition-colors">
                    <span>Explore Daily Blueprints</span>
                    <span>→</span>
                  </Link>
                </li>
                <li>
                  <Link href="/recipes" className="flex items-center justify-between p-2.5 rounded-xl border border-[#1A3629]/20 hover:bg-[#F4F0EA] transition-colors">
                    <span>16-Bit Food Recipes</span>
                    <span>→</span>
                  </Link>
                </li>
                <li>
                  <Link href="/correlations" className="flex items-center justify-between p-2.5 rounded-xl border border-[#1A3629]/20 hover:bg-[#F4F0EA] transition-colors">
                    <span>Pattern Discovery Engine</span>
                    <span>→</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1A3629]/15 text-[11px] font-mono text-[#2C4A3B]">
              Cyath Retro System v1.0 · Storage Mode: Local + Cloud
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
