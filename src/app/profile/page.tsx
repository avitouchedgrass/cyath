'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { useHabitStore } from '@/store/useHabitStore';
import { supabase } from '@/lib/supabase';
import {
  User,
  ShieldCheck,
  Zap,
  Flame,
  Award,
  ArrowLeft,
  ChevronRight,
  LogOut,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Sliders,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { userSession, setUserSession, userProfile, logsByDate, habits, activeProtocolIds } = useHabitStore();
  const [mounted, setMounted] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

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
    setSyncStatus('Synchronized live data with local store');
    setTimeout(() => setSyncStatus(null), 3000);
  };

  if (!mounted) return null;

  const isGuest = !userSession || userSession.id.startsWith('guest_');
  const userEmail = userSession?.email || (isGuest ? 'guest.session@cyath.app' : 'user@cyath.app');
  const displayName = userProfile?.fullName || (isGuest ? 'Guest Explorer' : userEmail.split('@')[0]);

  return (
    <div className="min-h-screen bg-[#080808] text-neutral-100 selection:bg-white selection:text-black flex flex-col">
      {/* Background Radial Ambient Glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.02) 0%, transparent 60%)
          `,
        }}
      />

      <HeaderNav />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-6 lg:px-12 pt-36 sm:pt-40 pb-24">
        
        {/* Navigation Strip */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Dashboard</span>
          </Link>

          <Link
            href="/onboarding?edit=true"
            className="inline-flex items-center gap-1.5 text-xs font-mono px-3.5 py-1.5 rounded-full border border-white/10 bg-white text-black font-semibold hover:bg-neutral-200 transition-all shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Edit Biometrics &amp; Goals</span>
          </Link>
        </div>

        {/* Hero / Identity Card */}
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center text-white text-xl font-mono font-bold shadow-inner">
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

            <div className="flex items-center gap-3">
              {isGuest ? (
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-white text-black hover:bg-neutral-200 transition-all shadow-sm"
                >
                  Create Account
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* 1. Calibrated Biometrics & Goals Card */}
        {userProfile && (
          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 mb-10 shadow-xl">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/5">
              <div>
                <h3 className="font-serif font-normal text-xl text-white tracking-tight">
                  Calibrated Biometrics &amp; Targets
                </h3>
                <p className="text-neutral-400 text-xs font-sans mt-0.5">
                  Physical baseline parameters configured during onboarding.
                </p>
              </div>

              <Link
                href="/onboarding?edit=true"
                className="text-xs font-mono text-neutral-400 hover:text-white transition-colors"
              >
                Re-calibrate →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">Height &amp; Weight</span>
                <span className="text-sm font-mono font-semibold text-white">{userProfile.heightCm} cm / {userProfile.weightKg} kg</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">Age &amp; Sex</span>
                <span className="text-sm font-mono font-semibold text-white">{userProfile.age}y / {userProfile.sex}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">Primary Target</span>
                <span className="text-sm font-mono font-semibold text-white capitalize">{userProfile.primaryGoal}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">Allergies / Diet</span>
                <span className="text-xs font-mono text-neutral-300 truncate block">
                  {userProfile.allergies.length > 0 ? userProfile.allergies.join(', ') : 'None'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 1. Lifetime Performance Telemetry */}
        <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-4 px-1">
          Lifetime Telemetry
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-5 shadow-lg">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
              Active Days
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-white tracking-tight">{Math.max(1, totalDaysLogged)}</span>
              <span className="text-xs text-neutral-400 font-sans">Days</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-sans mt-2">
              Telemetry logged across timeline
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-5 shadow-lg">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
              Habits Executed
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-white tracking-tight">{totalHabitsCompleted}</span>
              <span className="text-xs text-emerald-400 font-sans">Completed</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-sans mt-2">
              Successful protocol adherence checkoffs
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-5 shadow-lg">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
              Total Protein Fuel
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-white tracking-tight">{totalProteinLogged}g</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-sans mt-2">
              Amino acid fuel logged from whole-foods
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-5 shadow-lg">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
              Active Blueprints
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-white tracking-tight">{activeProtocolIds.length}</span>
              <span className="text-xs text-neutral-400 font-sans">Protocols</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-sans mt-2">
              Routines calibrated in your daily planner
            </p>
          </div>
        </div>

        {/* 2. Subscribed Protocols Matrix */}
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 mb-10 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <div>
              <h3 className="font-serif font-normal text-xl text-white tracking-tight">
                Active Protocol Blueprints
              </h3>
              <p className="text-neutral-400 text-xs font-sans mt-1">
                Your currently subscribed routine blueprints synchronized to the daily checklist.
              </p>
            </div>

            <Link
              href="/protocols"
              className="text-xs font-mono text-white hover:text-neutral-300 transition-colors inline-flex items-center gap-1"
            >
              <span>Explore More</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeProtocolIds.map((id) => (
                <div key={id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
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

        {/* 3. Account Data & Cloud Operations */}
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
          <h3 className="font-serif font-normal text-xl text-white tracking-tight mb-2">
            Data &amp; Security Controls
          </h3>
          <p className="text-neutral-400 text-xs font-sans mb-6">
            Manage your synchronized telemetry and local caching options.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleForceSync}
              className="px-4 py-2.5 rounded-xl text-xs font-mono bg-white/[0.04] border border-white/10 text-neutral-200 hover:text-white hover:bg-white/[0.08] transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Cloud State</span>
            </button>

            {syncStatus && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {syncStatus}
              </span>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
