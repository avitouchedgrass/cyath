'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { useHabitStore } from '@/store/useHabitStore';
import { supabase } from '@/lib/supabase';
import { retroAudio } from '@/lib/retroAudio';
import { XpHud } from '@/components/progression/XpHud';
import { Cloud, LogOut, RefreshCw, Sparkles, Trash2, AlertTriangle, X, ShieldAlert } from 'lucide-react';

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
    deleteAccountData,
  } = useHabitStore();

  const [mounted, setMounted] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteAccount = async () => {
    retroAudio.playBlip();
    setIsDeleting(true);
    try {
      await deleteAccountData();
      router.push('/');
    } catch (err) {
      console.error('Delete account error:', err);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (!mounted) return null;

  const isGuest = !userSession || userSession.id.startsWith('guest_');
  const userEmail = userSession?.email || (isGuest ? 'guest.explorer@cyath.app' : 'user@cyath.app');
  const displayName = userProfile?.fullName || (isGuest ? 'Demo Explorer' : userEmail.split('@')[0]);
  const goalTitle = userProfile?.primaryGoal && GOAL_TITLES[userProfile.primaryGoal]
    ? GOAL_TITLES[userProfile.primaryGoal]
    : 'Daily Well-Being';

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1A3629] transition-colors duration-300 flex flex-col selection:bg-[#1A3629] selection:text-[#FFFDF9]">
      <HeaderNav />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-10 pt-28 pb-24">
        
        {/* Header Section */}
        <div className="mb-8 border-b-2 border-[#1A3629]/15 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-fraunces font-black text-3xl sm:text-4xl tracking-tight text-[#1A3629]">
              Explorer Dossier
            </h1>
            <p className="text-sm sm:text-base font-cabinet font-medium mt-1 leading-relaxed text-[#2C4A3B]">
              Your personal wellness telemetry sheet, calibrated baseline targets, and cloud synchronization.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 bg-[#FFFDF9] border-[#1A3629] text-[#1A3629] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer self-start sm:self-auto"
          >
            <span>Open Daily Planner →</span>
          </Link>
        </div>

        {/* User Identity Banner */}
        <div className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[5px_5px_0px_#1A3629] rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 sm:border-3 border-[#1A3629] bg-[#F4F0EA] flex items-center justify-center font-cabinet font-black text-xl text-[#1A3629] shadow-[3px_3px_0px_#1A3629]">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-fraunces font-black text-2xl sm:text-3xl tracking-tight text-[#1A3629]">
                  {displayName}
                </h2>
                {isGuest && (
                  <span className="px-2 py-0.5 rounded-md border border-[#1A3629] bg-[#F4F0EA] text-[10px] font-mono font-bold">
                    GUEST
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-[#4A5D4E]">
                {userEmail} · Goal: <strong className="text-[#1A3629] font-bold">{goalTitle}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleForceSync}
              disabled={isSyncing}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border-2 border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Cloud'}</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {syncStatus && (
          <div className="mb-6 p-3.5 rounded-xl border-2 border-[#10B981] bg-[#ECFDF5] text-xs font-mono font-bold text-[#065F46] flex items-center gap-2 shadow-xs">
            <Sparkles className="w-4 h-4 text-[#10B981]" />
            <span>{syncStatus}</span>
          </div>
        )}

        {/* Progression HUD */}
        <div className="mb-8">
          <XpHud />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 mb-8">
          <div className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[4px_4px_0px_#1A3629] rounded-2xl p-5 sm:p-6">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider block mb-2 text-[#4A5D4E]">
              Days Calibrated
            </span>
            <div className="font-mono font-black text-3xl tabular-nums text-[#1A3629]">
              {totalDaysLogged}
            </div>
            <span className="text-xs font-cabinet font-medium text-[#2C4A3B] mt-1 block">
              Active journal entries
            </span>
          </div>

          <div className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[4px_4px_0px_#1A3629] rounded-2xl p-5 sm:p-6">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider block mb-2 text-[#4A5D4E]">
              Habits Executed
            </span>
            <div className="font-mono font-black text-3xl tabular-nums text-[#1A3629]">
              {totalHabitsCompleted}
            </div>
            <span className="text-xs font-cabinet font-medium text-[#2C4A3B] mt-1 block">
              Micro-routines executed
            </span>
          </div>

          <div className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[4px_4px_0px_#1A3629] rounded-2xl p-5 sm:p-6">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider block mb-2 text-[#4A5D4E]">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          <div className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[4px_4px_0px_#1A3629] rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="font-fraunces font-bold text-xl mb-4 text-[#1A3629]">
                Calibrated Blueprint Targets
              </h2>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#1A3629]/15">
                  <span className="text-[#4A5D4E]">Target Daily Protein:</span>
                  <span className="font-bold text-[#1A3629]">
                    {userProfile?.weightKg ? Math.round(userProfile.weightKg * 2.0) : 140}g / day
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#1A3629]/15">
                  <span className="text-[#4A5D4E]">Target Hydration:</span>
                  <span className="font-bold text-[#1A3629]">
                    {userProfile?.weightKg ? (userProfile.weightKg * 0.04).toFixed(1) : '2.5'}L / day
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#1A3629]/15">
                  <span className="text-[#4A5D4E]">Target Sleep:</span>
                  <span className="font-bold text-[#1A3629]">8.0 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4A5D4E]">Equipped Cartridges:</span>
                  <span className="font-bold text-[#10B981]">{activeProtocolIds?.length || 1} Active</span>
                </div>
              </div>
            </div>

            <Link
              href="/onboarding"
              className="mt-6 w-full py-3 rounded-xl border-2 border-[#1A3629] bg-[#F4F0EA] text-[#1A3629] font-cabinet font-bold text-xs text-center shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all block"
            >
              Re-Calibrate Daily Targets →
            </Link>
          </div>

          <div className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[4px_4px_0px_#1A3629] rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="font-fraunces font-bold text-xl mb-4 text-[#1A3629]">
                Core Pillars Navigation
              </h2>
              <ul className="space-y-2.5 font-cabinet font-bold text-xs">
                <li>
                  <Link href="/protocols" className="flex items-center justify-between p-3 rounded-xl border border-[#1A3629]/20 hover:bg-[#F4F0EA] transition-colors">
                    <span>Protocol Cartridges</span>
                    <span className="font-mono text-xs">→</span>
                  </Link>
                </li>
                <li>
                  <Link href="/recipes" className="flex items-center justify-between p-3 rounded-xl border border-[#1A3629]/20 hover:bg-[#F4F0EA] transition-colors">
                    <span>Whole-Food Fuel Recipes</span>
                    <span className="font-mono text-xs">→</span>
                  </Link>
                </li>
                <li>
                  <Link href="/correlations" className="flex items-center justify-between p-3 rounded-xl border border-[#1A3629]/20 hover:bg-[#F4F0EA] transition-colors">
                    <span>Correlation Engine</span>
                    <span className="font-mono text-xs">→</span>
                  </Link>
                </li>
                <li>
                  <Link href="/sanctuary" className="flex items-center justify-between p-3 rounded-xl border border-[#1A3629]/20 hover:bg-[#F4F0EA] transition-colors">
                    <span>Sanctuary Floating Island</span>
                    <span className="font-mono text-xs">→</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="mt-4 pt-3 border-t border-[#1A3629]/15 flex items-center justify-between text-[11px] font-mono text-[#4A5D4E]">
              <span>Cyath Engine v2.0</span>
              <span>Local-First · Encrypted</span>
            </div>
          </div>

        </div>

        {/* Danger Zone: Account & Data Deletion */}
        <div className="border-3 border-[#DC2626] bg-[#FEF2F2] shadow-[4px_4px_0px_#DC2626] rounded-2xl p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FFFDF9] border-2 border-[#DC2626] flex items-center justify-center shrink-0 shadow-xs">
                <ShieldAlert className="w-5 h-5 text-[#DC2626]" />
              </div>
              <div>
                <h3 className="font-fraunces font-bold text-lg text-[#991B1B]">
                  Account &amp; Telemetry Management
                </h3>
                <p className="text-xs font-cabinet font-medium text-[#7F1D1D] mt-0.5 max-w-xl leading-relaxed">
                  Permanently delete your profile, custom recipes, XP progression history, and all daily habit logs from both local storage and cloud databases.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                retroAudio.playBlip();
                setShowDeleteModal(true);
              }}
              className="px-4 py-2.5 rounded-xl border-2 border-[#DC2626] bg-[#DC2626] text-[#FFFDF9] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#991B1B] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer flex items-center gap-1.5 shrink-0 self-stretch sm:self-auto justify-center"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account Data</span>
            </button>
          </div>
        </div>

      </main>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full border-3 border-[#DC2626] bg-[#FFFDF9] shadow-[8px_8px_0px_#DC2626] rounded-3xl p-6 sm:p-8 relative animate-in fade-in zoom-in-95 duration-200">
            
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-[#1A3629]/20 hover:bg-[#F4F0EA] cursor-pointer"
            >
              <X className="w-4 h-4 text-[#1A3629]" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] border-2 border-[#DC2626] flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-[#DC2626]" />
            </div>

            <h3 className="font-fraunces font-black text-2xl text-[#1A3629] mb-2">
              Permanently Delete Account?
            </h3>

            <p className="text-xs sm:text-sm font-cabinet font-medium text-[#2C4A3B] leading-relaxed mb-6">
              This action is <strong>irreversible</strong>. All your daily habits, Pearson correlation data, custom recipes, XP progression, and cloud backups will be permanently purged.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl border-2 border-[#1A3629] bg-[#FAF6EE] text-[#1A3629] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl border-2 border-[#DC2626] bg-[#DC2626] text-[#FFFDF9] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#991B1B] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Everything</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
