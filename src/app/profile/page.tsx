'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { useHabitStore } from '@/store/useHabitStore';
import { supabase } from '@/lib/supabase';
import { retroAudio } from '@/lib/retroAudio';
import { XpHud } from '@/components/progression/XpHud';
import { Cloud, LogOut, RefreshCw, Sparkles, Trash2, AlertTriangle, X, ShieldAlert, RotateCcw, Copy, Check, Share2, Users, Gift } from 'lucide-react';

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
    resetUserProgress,
    claimReferralCode,
  } = useHabitStore();

  const [mounted, setMounted] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [referralInput, setReferralInput] = useState('');
  const [referralMsg, setReferralMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isClaimingRef, setIsClaimingRef] = useState(false);

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
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.error('Sign out error:', err);
    }
    setUserSession(null);
    window.location.href = '/';
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

  const handleResetProgress = async () => {
    retroAudio.playBlip();
    setIsProcessing(true);
    try {
      await resetUserProgress();
      setShowResetModal(false);
      setSyncStatus('Progress reset to Level 1 (0 XP)!');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err) {
      console.error('Reset progress error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAccount = async () => {
    retroAudio.playBlip();
    setIsProcessing(true);
    try {
      await deleteAccountData();
      window.location.href = '/';
    } catch (err) {
      console.error('Delete account error:', err);
      setIsProcessing(false);
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

  const userReferralCode = userProfile?.referralCode || 'CYATH-JOIN';
  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/auth?ref=${userReferralCode}`
    : `https://cyath.space/auth?ref=${userReferralCode}`;

  const handleCopyInviteLink = async () => {
    retroAudio.playInspectConfirm();
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleClaimReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralInput.trim()) return;
    setIsClaimingRef(true);
    setReferralMsg(null);
    try {
      const res = await claimReferralCode(referralInput.trim());
      setReferralMsg({ text: res.message, isError: !res.success });
      if (res.success) {
        setReferralInput('');
      }
    } catch (err: any) {
      setReferralMsg({ text: err?.message || 'Failed to claim code', isError: true });
    } finally {
      setIsClaimingRef(false);
    }
  };

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

        {/* Guild Recruitment Pact (Referral System) - Strategic Hero Position */}
        <div className="border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[5px_5px_0px_#1A3629] rounded-3xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b-2 border-[#1A3629]/15">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full border border-[#1A3629] bg-[#FAF6EE] text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A3629] flex items-center gap-1">
                  <Gift className="w-3 h-3 text-[#D97706]" />
                  Adventurer&apos;s Guild Pact
                </span>
                <span className="px-2 py-0.5 rounded-md border border-[#10B981] bg-[#ECFDF5] text-[10px] font-mono font-bold text-[#065F46]">
                  +250 XP Dual Reward
                </span>
              </div>
              <h2 className="font-fraunces font-black text-2xl text-[#1A3629] tracking-tight">
                Invite Companions to Cyath
              </h2>
              <p className="text-xs sm:text-sm font-cabinet font-medium text-[#2C4A3B] mt-1 max-w-xl leading-relaxed">
                Share your unique referral link with friends. When they join, they get <strong>+250 Starter XP</strong> and you earn <strong>+250 Guild Bonus XP</strong>!
              </p>
            </div>

            {/* Your Referral Code Badge & Copy */}
            <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
              <span className="text-[10px] font-mono font-bold text-[#4A5D4E] uppercase tracking-wider">
                Your Referral Code
              </span>
              <div className="flex items-center gap-2">
                <div className="px-3.5 py-2 rounded-xl border-2 border-[#1A3629] bg-[#FAF6EE] font-mono font-black text-sm tracking-wider text-[#1A3629] shadow-[2px_2px_0px_#1A3629] select-all">
                  {userReferralCode}
                </div>
                <button
                  type="button"
                  onClick={handleCopyInviteLink}
                  className="px-4 py-2 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#34D399]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Share & Claim Row */}
          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Quick Social Sharing */}
            <div className="flex flex-col justify-between gap-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A3629]">
                1-Click Quick Share
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`I'm leveling up my metabolic health on Cyath! Join my guild with code ${userReferralCode} for +250 Starter XP: ${inviteUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => retroAudio.playInspectConfirm()}
                  className="flex-1 py-2.5 px-3 rounded-xl border-2 border-[#1A3629] bg-[#FAF6EE] hover:bg-[#E8DECF] text-[#1A3629] font-cabinet font-bold text-xs text-center shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5"
                >
                  <span>WhatsApp Share</span>
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Tracking my daily metabolic habits and building my 16-bit sanctuary on @Cyath. Join with my code ${userReferralCode} to get +250 Starter XP:`)}&url=${encodeURIComponent(inviteUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => retroAudio.playInspectConfirm()}
                  className="flex-1 py-2.5 px-3 rounded-xl border-2 border-[#1A3629] bg-[#FAF6EE] hover:bg-[#E8DECF] text-[#1A3629] font-cabinet font-bold text-xs text-center shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Share on X</span>
                </a>
              </div>
              <p className="text-[11px] font-mono text-[#4A5D4E]">
                Invite link: <code className="text-[#1A3629] bg-[#FAF6EE] px-1 py-0.5 rounded border border-[#1A3629]/10">{inviteUrl}</code>
              </p>
            </div>

            {/* Right: Claim A Friend's Code (if not yet claimed) */}
            <div className="flex flex-col justify-between gap-3 p-4 rounded-2xl border-2 border-[#1A3629]/15 bg-[#FAF6EE]">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A3629] block">
                  Claim an Invite Code
                </span>
                <span className="text-[11px] font-cabinet text-[#4A5D4E] mt-0.5 block">
                  {userProfile?.claimedReferral
                    ? `Pact active! Joined with code: ${userProfile.referredBy || 'GUILD'}`
                    : 'Were you invited by a friend? Enter their code for +250 Starter XP:'}
                </span>
              </div>

              {!userProfile?.claimedReferral ? (
                <form onSubmit={handleClaimReferral} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={referralInput}
                    onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                    placeholder="e.g. CYATH-XXXX"
                    className="flex-1 px-3 py-2 rounded-xl border-2 border-[#1A3629]/30 focus:border-[#1A3629] bg-[#FFFDF9] font-mono text-xs text-[#1A3629] outline-none uppercase placeholder:normal-case"
                  />
                  <button
                    type="submit"
                    disabled={isClaimingRef || !referralInput.trim()}
                    className="px-4 py-2 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isClaimingRef ? 'Claiming...' : 'Claim +250 XP'}
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#065F46]">
                  <Check className="w-4 h-4 text-[#10B981]" />
                  <span>Starter Guild XP Claimed</span>
                </div>
              )}

              {referralMsg && (
                <div className={`text-[11px] font-mono font-bold ${referralMsg.isError ? 'text-red-600' : 'text-[#065F46]'}`}>
                  {referralMsg.text}
                </div>
              )}
            </div>
          </div>
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

        {/* Danger Zone: Account & Data Reset */}
        <div className="border-3 border-[#DC2626] bg-[#FEF2F2] shadow-[4px_4px_0px_#DC2626] rounded-2xl p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FFFDF9] border-2 border-[#DC2626] flex items-center justify-center shrink-0 shadow-xs">
                <ShieldAlert className="w-5 h-5 text-[#DC2626]" />
              </div>
              <div>
                <h3 className="font-fraunces font-bold text-lg text-[#991B1B]">
                  Danger Zone · Account Telemetry &amp; Reset
                </h3>
                <p className="text-xs font-cabinet font-medium text-[#7F1D1D] mt-0.5 max-w-xl leading-relaxed">
                  Reset your account progression back to Level 1 (0 XP) with fresh daily habits, or permanently purge all database records.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto self-stretch sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  setShowResetModal(true);
                }}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border-2 border-[#D97706] bg-[#FEF3C7] text-[#92400E] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#D97706] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Level 1</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  setShowDeleteModal(true);
                }}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border-2 border-[#DC2626] bg-[#DC2626] text-[#FFFDF9] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#991B1B] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Reset Progress Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full border-3 border-[#D97706] bg-[#FFFDF9] shadow-[8px_8px_0px_#D97706] rounded-3xl p-6 sm:p-8 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowResetModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-[#1A3629]/20 hover:bg-[#F4F0EA] cursor-pointer"
            >
              <X className="w-4 h-4 text-[#1A3629]" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] border-2 border-[#D97706] flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6 text-[#92400E]" />
            </div>

            <h3 className="font-fraunces font-black text-2xl text-[#1A3629] mb-2">
              Reset Progress to Level 1?
            </h3>

            <p className="text-xs sm:text-sm font-cabinet font-medium text-[#2C4A3B] leading-relaxed mb-6">
              This will reset your XP to <strong>0 XP</strong>, restore your island sanctuary to its starter state, and clear logged habit history for this account.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl border-2 border-[#1A3629] bg-[#FAF6EE] text-[#1A3629] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleResetProgress}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl border-2 border-[#D97706] bg-[#D97706] text-[#FFFDF9] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#78350F] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? <span>Resetting...</span> : <span>Confirm Reset (0 XP)</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
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
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl border-2 border-[#1A3629] bg-[#FAF6EE] text-[#1A3629] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl border-2 border-[#DC2626] bg-[#DC2626] text-[#FFFDF9] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#991B1B] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
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
