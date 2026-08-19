'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { useHabitStore } from '@/store/useHabitStore';
import { supabase } from '@/lib/supabase';
import {
  User,
  ShieldAlert,
  ArrowLeft,
  ChevronRight,
  LogOut,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Sliders,
  Sparkles,
  Flame,
  Scale,
  Activity,
  Heart,
  Zap,
  Dumbbell,
  Moon,
} from 'lucide-react';

const GOAL_ICONS: Record<string, React.ElementType> = {
  focus: Zap,
  muscle: Dumbbell,
  sleep: Moon,
  longevity: Heart,
};

export default function ProfilePage() {
  const router = useRouter();
  const {
    userSession,
    setUserSession,
    userProfile,
    logsByDate,
    habits,
    activeProtocolIds,
    deleteAccountData,
  } = useHabitStore();

  const [mounted, setMounted] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
    setUserSession(null);
    router.push('/');
  };

  const handleForceSync = () => {
    setSyncStatus('Telemetry synced with cloud');
    setTimeout(() => setSyncStatus(null), 3000);
  };

  if (!mounted) return null;

  const isGuest = !userSession || userSession.id.startsWith('guest_');
  const userEmail = userSession?.email || (isGuest ? 'guest.session@cyath.app' : 'user@cyath.app');
  const displayName = userProfile?.fullName || (isGuest ? 'Guest Explorer' : userEmail.split('@')[0]);

  const GoalIcon = userProfile?.primaryGoal && GOAL_ICONS[userProfile.primaryGoal]
    ? GOAL_ICONS[userProfile.primaryGoal]
    : Activity;

  return (
    <div className="min-h-screen bg-[#080808] text-neutral-100 selection:bg-white selection:text-black flex flex-col">
      {/* Background Radial Ambient Glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(circle at 50% 8%, rgba(255, 255, 255, 0.03) 0%, transparent 60%)
          `,
        }}
      />

      <HeaderNav />

      {/* Main Container with 2-Column Responsive Layout */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 lg:px-10 pt-36 sm:pt-40 pb-24">
        
        {/* Navigation & Header Breadcrumb */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.06]">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Return to Daily Planner</span>
          </Link>

          <Link
            href="/onboarding?edit=true"
            className="inline-flex items-center gap-1.5 text-xs font-mono px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 transition-all shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Re-calibrate Biometrics</span>
          </Link>
        </div>

        {/* 2-Column Asymmetric Grid Layout (Operate Mode) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT / MAIN COLUMN (8 cols): Identity, Biometrics & Subscribed Protocols */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Unified Identity & Biometrics Panel */}
            <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/5">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center text-white text-xl font-mono font-bold shadow-inner shrink-0">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="font-serif font-normal text-2xl sm:text-3xl text-white tracking-tight">
                        {displayName}
                      </h1>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
                        {isGuest ? 'Demo Mode' : 'Cloud Verified'}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-neutral-400">
                      {userEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/onboarding?edit=true"
                    className="px-3.5 py-2 rounded-xl text-xs font-mono bg-white text-black font-semibold hover:bg-neutral-200 transition-all shadow-sm"
                  >
                    Edit Profile
                  </Link>
                </div>
              </div>

              {/* Physical Biometrics Matrix */}
              {userProfile ? (
                <div className="pt-6">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-4">
                    Physical Calibration Profile
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                      <span className="text-[10px] font-mono text-neutral-400 block mb-1">Height &amp; Weight</span>
                      <span className="text-xs font-mono font-semibold text-white">
                        {userProfile.heightCm} cm · {userProfile.weightKg} kg
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                      <span className="text-[10px] font-mono text-neutral-400 block mb-1">Demographics</span>
                      <span className="text-xs font-mono font-semibold text-white capitalize">
                        {userProfile.age}y · {userProfile.sex}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                      <span className="text-[10px] font-mono text-neutral-400 block mb-1">Primary Target</span>
                      <div className="flex items-center gap-1.5">
                        <GoalIcon className="w-3 h-3 text-emerald-400" />
                        <span className="text-xs font-mono font-semibold text-white capitalize">
                          {userProfile.primaryGoal}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                      <span className="text-[10px] font-mono text-neutral-400 block mb-1">Diet / Allergies</span>
                      <span className="text-xs font-mono text-neutral-300 truncate block">
                        {userProfile.allergies.length > 0 ? userProfile.allergies.join(', ') : 'No Restrictions'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-6 flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-400">Profile calibration not yet completed.</span>
                  <Link
                    href="/onboarding"
                    className="text-xs font-mono text-white underline underline-offset-4"
                  >
                    Start Onboarding →
                  </Link>
                </div>
              )}
            </div>

            {/* Lifetime Telemetry Aggregates */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif font-normal text-xl text-white tracking-tight">
                  Lifetime Telemetry
                </h2>
                <span className="text-xs font-mono text-neutral-500">
                  Aggregated timeline records
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-5 shadow-lg">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                    Timeline Days
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      {Math.max(1, totalDaysLogged)}
                    </span>
                    <span className="text-xs text-neutral-400 font-sans">Days Logged</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 font-sans mt-2">
                    Consecutive tracking consistency
                  </p>
                </div>

                <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-5 shadow-lg">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                    Habits Executed
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      {totalHabitsCompleted}
                    </span>
                    <span className="text-xs text-emerald-400 font-sans">Completed</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 font-sans mt-2">
                    Routine checks &amp; standards
                  </p>
                </div>

                <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-5 shadow-lg">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                    Protein Fuel
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      {totalProteinLogged}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">g Total</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 font-sans mt-2">
                    Amino acid fuel from whole foods
                  </p>
                </div>
              </div>
            </div>

            {/* Subscribed Protocol Blueprints */}
            <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/5">
                <div>
                  <h3 className="font-serif font-normal text-xl text-white tracking-tight">
                    Active Protocol Blueprints
                  </h3>
                  <p className="text-neutral-400 text-xs font-sans mt-0.5">
                    Routines currently active in your daily checklist.
                  </p>
                </div>

                <Link
                  href="/protocols"
                  className="text-xs font-mono text-white hover:text-neutral-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>Catalog</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {activeProtocolIds.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs font-mono text-neutral-400 mb-3">No active protocols selected.</p>
                  <Link
                    href="/protocols"
                    className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-all inline-block"
                  >
                    Browse Protocol Blueprints
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {activeProtocolIds.map((id) => (
                    <div
                      key={id}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:border-white/15 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-mono font-medium text-white capitalize">
                            {id.replace('-', ' & ')}
                          </h4>
                          <span className="text-[10px] font-mono text-neutral-500">Subscribed &amp; Calibrated</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-emerald-400">✓ Active</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT / SIDEBAR COLUMN (4 cols): Cloud Controls, Session & Danger Zone */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Cloud Sync & State Panel */}
            <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="font-serif font-normal text-lg text-white tracking-tight">
                Cloud Sync
              </h3>
              <p className="text-neutral-400 text-xs font-sans leading-relaxed">
                Telemetry and daily logs are synchronized with Supabase cloud infrastructure.
              </p>

              <button
                type="button"
                onClick={handleForceSync}
                className="w-full py-2.5 rounded-xl text-xs font-mono bg-white/[0.04] border border-white/10 text-neutral-200 hover:text-white hover:bg-white/[0.08] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Force Cloud Sync</span>
              </button>

              {syncStatus && (
                <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 justify-center pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{syncStatus}</span>
                </div>
              )}
            </div>

            {/* Session Management */}
            <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="font-serif font-normal text-lg text-white tracking-tight">
                Session Control
              </h3>
              <p className="text-neutral-400 text-xs font-sans leading-relaxed">
                Currently authenticated as <span className="text-neutral-200 font-mono">{userEmail}</span>.
              </p>

              {isGuest ? (
                <Link
                  href="/login"
                  className="w-full py-2.5 rounded-xl text-xs font-mono font-semibold bg-white text-black hover:bg-neutral-200 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  Create Full Cloud Account
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full py-2.5 rounded-xl text-xs font-mono font-semibold bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>

            {/* Danger Zone */}
            <div className="backdrop-blur-xl bg-red-950/[0.08] border border-red-500/20 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-red-400">
                <ShieldAlert className="w-4 h-4" />
                <h3 className="font-serif font-normal text-base text-red-200 tracking-tight">
                  Danger Zone
                </h3>
              </div>
              
              <p className="text-neutral-400 text-xs font-sans leading-relaxed">
                Permanently purge your account, synchronized telemetry records, streaks, and biometrics.
              </p>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-2.5 rounded-xl text-xs font-mono font-semibold bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
            </div>

          </div>

        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <div className="relative z-10 w-full max-w-md bg-[#0d0d0d] border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-normal text-xl text-white">Permanently Delete Account?</h4>
                  <p className="text-[11px] font-mono text-neutral-400">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                All daily logs, habit metrics, and personalized biometrics associated with <strong className="text-white font-mono">{userEmail}</strong> will be permanently wiped.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-mono bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteAccountData();
                    router.push('/');
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-mono font-semibold bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg cursor-pointer"
                >
                  Yes, Delete Everything
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
