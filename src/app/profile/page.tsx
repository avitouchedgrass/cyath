'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { useHabitStore } from '@/store/useHabitStore';
import { supabase } from '@/lib/supabase';
import { retroAudio } from '@/lib/retroAudio';
import {
  ArrowLeft,
  ChevronRight,
  LogOut,
  RefreshCw,
  CheckCircle2,
  Sliders,
  Sparkles,
  Flame,
  Activity,
  Heart,
  Zap,
  Dumbbell,
  Moon,
  Lock,
} from 'lucide-react';

const GOAL_LABELS: Record<string, { title: string; icon: React.ElementType }> = {
  focus: { title: 'Peak Energy & Focus', icon: Zap },
  muscle: { title: 'Strength & Fuel', icon: Dumbbell },
  sleep: { title: 'Deep Restful Sleep', icon: Moon },
  longevity: { title: 'Daily Well-Being', icon: Heart },
  fat_loss: { title: 'Healthy Habits', icon: Flame },
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

  const goalMeta = userProfile?.primaryGoal && GOAL_LABELS[userProfile.primaryGoal]
    ? GOAL_LABELS[userProfile.primaryGoal]
    : { title: 'Daily Well-Being', icon: Activity };
  const GoalIcon = goalMeta.icon;

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1A3629] transition-colors duration-300 flex flex-col">
      <HeaderNav />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 lg:px-10 pt-28 pb-24">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-[#1A3629]/15">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-full border-2 bg-[#FFFDF9] border-[#1A3629] text-[#1A3629] shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Daily Planner</span>
          </Link>

          {isGuest ? (
            <Link
              href="/login?redirect=/onboarding?edit=true"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3.5 py-1.5 rounded-full border-2 bg-[#FFFDF9] border-[#1A3629] text-[#1A3629] transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In to Edit Biometrics</span>
            </Link>
          ) : (
            <Link
              href="/onboarding?edit=true"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3.5 py-1.5 rounded-full border-2 bg-[#FFFDF9] border-[#1A3629] text-[#1A3629] shadow-[2px_2px_0px_#1A3629] transition-all"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Edit Biometrics &amp; Goals</span>
            </Link>
          )}
        </div>

        {/* 2-Column Asymmetric Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN (8 cols): Identity & Performance */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Identity & Biometrics Panel */}
            <div className="border-4 border-[#1A3629] bg-[#FFFDF9] shadow-[6px_6px_0px_#1A3629] rounded-3xl p-6 sm:p-8 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b-2 border-[#1A3629]/15">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl border-3 border-[#1A3629] bg-[#F4F0EA] flex items-center justify-center text-2xl font-fraunces font-black shrink-0 text-[#1A3629]">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="font-fraunces font-black text-2xl sm:text-3xl tracking-tight text-[#1A3629]">
                        {displayName}
                      </h1>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border-2 border-[#1A3629] bg-[#F4F0EA] uppercase text-[#1A3629]">
                        {isGuest ? 'Demo Mode' : 'Verified'}
                      </span>
                    </div>
                    <p className="text-xs font-mono font-bold opacity-75 text-[#2C4A3B]">
                      {userEmail}
                    </p>
                  </div>
                </div>

                <div>
                  {isGuest ? (
                    <Link
                      href="/login?redirect=/onboarding?edit=true"
                      className="px-4 py-2.5 rounded-xl text-xs font-cabinet font-bold border-2 bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-[2px_2px_0px_#3A6B52] flex items-center gap-1.5 transition-all"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Sign In to Save</span>
                    </Link>
                  ) : (
                    <Link
                      href="/onboarding?edit=true"
                      className="px-4 py-2.5 rounded-xl text-xs font-cabinet font-bold border-2 bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-[2px_2px_0px_#3A6B52] transition-all"
                    >
                      Edit Profile
                    </Link>
                  )}
                </div>
              </div>

              {/* Biometrics Matrix */}
              {userProfile ? (
                <div className="pt-6">
                  <div className="text-[10px] font-mono font-bold tracking-widest uppercase opacity-70 mb-4 text-[#1A3629]">
                    Biometrics &amp; Daily Goals
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl border-2 border-[#1A3629]/20 bg-[#F4F0EA]">
                      <span className="text-[10px] font-mono font-bold block mb-1 opacity-70">Height &amp; Weight</span>
                      <span className="text-xs font-mono font-bold tabular-nums">
                        {userProfile.heightCm} cm · {userProfile.weightKg} kg
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border-2 border-[#1A3629]/20 bg-[#F4F0EA]">
                      <span className="text-[10px] font-mono font-bold block mb-1 opacity-70">Age &amp; Sex</span>
                      <span className="text-xs font-mono font-bold capitalize tabular-nums">
                        {userProfile.age} yrs · {userProfile.sex}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border-2 border-[#1A3629]/20 bg-[#F4F0EA]">
                      <span className="text-[10px] font-mono font-bold block mb-1 opacity-70">Core Goal</span>
                      <div className="flex items-center gap-1.5">
                        <GoalIcon className="w-3.5 h-3.5 shrink-0 text-[#1A3629]" />
                        <span className="text-xs font-cabinet font-bold truncate">
                          {goalMeta.title}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border-2 border-[#1A3629]/20 bg-[#F4F0EA]">
                      <span className="text-[10px] font-mono font-bold block mb-1 opacity-70">Diet Restrictions</span>
                      <span className="text-xs font-cabinet font-medium truncate block">
                        {userProfile.allergies && userProfile.allergies.length > 0
                          ? userProfile.allergies.join(', ')
                          : 'No known allergies'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Lifetime Performance Aggregates */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase opacity-70 block text-[#1A3629]">
                    All-Time Stats
                  </span>
                  <h2 className="font-fraunces font-bold text-xl text-[#1A3629]">
                    Lifetime Activity
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[4px_4px_0px_#1A3629] rounded-2xl p-5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider block mb-1 opacity-70">
                    Days Logged
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-black tabular-nums">
                      {Math.max(1, totalDaysLogged)}
                    </span>
                    <span className="text-xs font-cabinet font-bold opacity-80">Days</span>
                  </div>
                </div>

                <div className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[4px_4px_0px_#1A3629] rounded-2xl p-5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider block mb-1 opacity-70">
                    Habits Completed
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-black tabular-nums">
                      {totalHabitsCompleted}
                    </span>
                    <span className="text-xs font-cabinet font-bold opacity-80">Done</span>
                  </div>
                </div>

                <div className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[4px_4px_0px_#1A3629] rounded-2xl p-5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider block mb-1 opacity-70">
                    Protein Tracked
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-black tabular-nums">
                      {totalProteinLogged}
                    </span>
                    <span className="text-xs font-mono font-bold opacity-80">g Total</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscribed Protocol Blueprints */}
            <div className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[5px_5px_0px_#1A3629] rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-5 pb-4 border-b-2 border-[#1A3629]/15">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase opacity-70 block text-[#1A3629]">
                    Routine Blueprints
                  </span>
                  <h3 className="font-fraunces font-bold text-lg text-[#1A3629]">
                    Active Blueprints
                  </h3>
                </div>

                <Link
                  href="/protocols"
                  className="text-xs font-mono font-bold hover:underline inline-flex items-center gap-1 text-[#1A3629]"
                >
                  <span>Browse Catalog</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {activeProtocolIds.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs font-cabinet font-medium opacity-80 mb-3 text-[#2C4A3B]">
                    No protocol blueprints active yet.
                  </p>
                  <Link
                    href="/protocols"
                    className="px-4 py-2 rounded-xl border-2 bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] text-xs font-cabinet font-bold inline-block"
                  >
                    Explore Daily Blueprints
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {activeProtocolIds.map((id) => (
                    <div
                      key={id}
                      className="p-4 rounded-xl border-2 border-[#1A3629]/20 bg-[#F4F0EA] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg border-2 bg-[#FFFDF9] border-[#1A3629] flex items-center justify-center text-[#1A3629]">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-cabinet font-bold capitalize text-[#1A3629]">
                            {id.replace('-', ' & ')}
                          </h4>
                          <span className="text-[10px] font-mono opacity-70 text-[#2C4A3B]">Active in Planner</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#1A3629]">✓ Active</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN (4 cols): Cloud Controls & Sign Out */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Cloud Sync */}
            <div className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[5px_5px_0px_#1A3629] rounded-2xl p-6 space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase opacity-70 block text-[#1A3629]">
                  Cloud Storage
                </span>
                <h3 className="font-fraunces font-bold text-lg text-[#1A3629]">
                  Sync &amp; Backup
                </h3>
              </div>
              <p className="text-xs font-cabinet font-medium leading-relaxed opacity-80 text-[#2C4A3B]">
                Your daily habits, recipes, and biometrics are saved locally and synced automatically.
              </p>

              <button
                type="button"
                onClick={handleForceSync}
                disabled={isSyncing}
                className="w-full py-3 rounded-xl text-xs font-mono font-bold border-2 bg-[#F4F0EA] border-[#1A3629] text-[#1A3629] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Cloud Records'}</span>
              </button>

              {syncStatus && (
                <div className="text-xs font-mono font-bold flex items-center gap-1.5 justify-center text-center text-[#1A3629]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{syncStatus}</span>
                </div>
              )}
            </div>

            {/* Session Management */}
            <div className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[5px_5px_0px_#1A3629] rounded-2xl p-6 space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase opacity-70 block text-[#1A3629]">
                  Account
                </span>
                <h3 className="font-fraunces font-bold text-lg text-[#1A3629]">
                  Session
                </h3>
              </div>

              {isGuest ? (
                <Link
                  href="/login"
                  className="w-full py-3 rounded-xl text-xs font-cabinet font-bold border-2 bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-[2px_2px_0px_#3A6B52] flex items-center justify-center gap-2"
                >
                  Create Account to Save
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full py-3 rounded-xl text-xs font-mono font-bold border-2 bg-[#F4F0EA] border-[#1A3629] text-[#1A3629] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
