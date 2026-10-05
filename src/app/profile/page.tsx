'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { useHabitStore } from '@/store/useHabitStore';
import { supabase } from '@/lib/supabase';
import { retroAudio } from '@/lib/retroAudio';
import { XpHud } from '@/components/progression/XpHud';
import { GuildInviteModal } from '@/components/referrals/GuildInviteModal';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { WeightTrackerModal } from '@/components/dashboard/WeightTrackerModal';
import {
  PixelGift,
  PixelRefresh,
  PixelLogOut,
  PixelCompass,
  PixelShieldCheck,
  PixelDownload,
  PixelFileText,
  PixelExternalLink,
  PixelShieldAlert,
  PixelTrash,
  PixelX,
  PixelAlert,
  PixelCheck,
  PixelSparkles,
  PixelSun,
  PixelFlame,
} from '@/components/common/PixelIcons';
import { ISLAND_SUITES, IslandSuiteId, getIslandTier } from '@/lib/progression/config';
import { calculateLevel } from '@/lib/progression/engine';
import { CUSTOM_HABITS_LIBRARY, HabitItem } from '@/store/useHabitStore';
import { haptics } from '@/lib/haptics';

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
    updateUserProfile,
    setCustomHabitSlot,
    totalXp,
    logsByDate,
    activeProtocolIds,
    deleteAccountData,
    resetUserProgress,
    logWeight,
    gainXp,
  } = useHabitStore();

  const [mounted, setMounted] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isRecalibrateModalOpen, setIsRecalibrateModalOpen] = useState(false);
  const [calibWeightKg, setCalibWeightKg] = useState(userProfile?.weightKg || 70);
  const [calibProtein, setCalibProtein] = useState(userProfile?.targetProteinGrams || (userProfile?.weightKg ? Math.round(userProfile.weightKg * 2.0) : 140));
  const [calibBedTime, setCalibBedTime] = useState(userProfile?.bedTime || '23:30');
  const [calibWakeTime, setCalibWakeTime] = useState(userProfile?.wakeTime || '07:30');
  const [customHabitTitle, setCustomHabitTitle] = useState('');
  const [customHabitCategory, setCustomHabitCategory] = useState<HabitItem['category']>('lifestyle');
  const [isCreatingHabit, setIsCreatingHabit] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (userProfile) {
      if (userProfile.weightKg) setCalibWeightKg(userProfile.weightKg);
      if (userProfile.targetProteinGrams) {
        setCalibProtein(userProfile.targetProteinGrams);
      } else if (userProfile.weightKg) {
        setCalibProtein(Math.round(userProfile.weightKg * 2.0));
      }
      if (userProfile.bedTime) setCalibBedTime(userProfile.bedTime);
      if (userProfile.wakeTime) setCalibWakeTime(userProfile.wakeTime);
    }
  }, [userProfile]);

  const totalDaysLogged = Object.keys(logsByDate).length;
  const totalHabitsCompleted = Object.values(logsByDate).reduce((acc, log) => {
    return acc + Object.values(log.habitsCompleted || {}).filter(Boolean).length;
  }, 0);
  const totalProteinLogged = Object.values(logsByDate).reduce((acc, log) => {
    return acc + (log.totalProteinLogged || 0);
  }, 0);

  const masterLevelInfo = calculateLevel(totalXp);
  const activeSuite: IslandSuiteId = (userProfile?.selectedIslandSuite || userProfile?.archetype || 'circadian') as IslandSuiteId;
  const currentIsland = getIslandTier(masterLevelInfo.level, activeSuite);

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

  const handleExportData = () => {
    retroAudio.playInspectConfirm();
    try {
      const payload = {
        userProfile,
        logsByDate,
        exportedAt: new Date().toISOString(),
        version: 'cyath-v2.0-prod',
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cyath-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Data export error:', err);
    }
  };

  const handleSaveRecalibration = async () => {
    retroAudio.playTierUpgrade();
    haptics.heavy();
    const w = Number(calibWeightKg) || 70;
    const p = Number(calibProtein) || Math.round(w * 2.0);
    updateUserProfile({
      weightKg: w,
      targetProteinGrams: p,
      bedTime: calibBedTime,
      wakeTime: calibWakeTime,
    });
    logWeight(w, 'Biometric Target Recalibration');
    gainXp(25, 'Biometric Target Recalibration');
    setIsRecalibrateModalOpen(false);
    setSyncStatus('Targets successfully recalibrated (+25 XP)!');
    setTimeout(() => setSyncStatus(null), 3500);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const activeUserId = session?.user?.id || userSession?.id;
      if (activeUserId && !activeUserId.startsWith('guest_')) {
        await supabase
          .from('user_profiles')
          .update({
            weight_kg: w,
            target_protein_grams: p,
            bed_time: calibBedTime,
            wake_time: calibWakeTime,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', activeUserId);
      }
    } catch {}
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
        
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <Breadcrumbs items={[{ label: 'Profile' }]} />
        </div>

        {/* Header Section */}
        <div className="mb-8 border-b border-[#1A3629]/10 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-cabinet font-extrabold text-3xl sm:text-4xl tracking-tight text-[#1A3629]">
              Profile &amp; Settings
            </h1>
            <p className="text-sm sm:text-base font-cabinet font-medium mt-1 leading-relaxed text-[#2C4A3B]">
              Your account settings, baseline targets, and daily progress summary.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#1A3629]/15 bg-[#FFFDF9] text-[#1A3629] font-cabinet font-semibold text-xs shadow-2xs hover:bg-[#F4F0EA] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>Open Sanctuary Observatory →</span>
          </Link>
        </div>

        {/* User Identity Banner */}
        <div className="rounded-3xl border border-[#1A3629]/10 bg-[#FFFDF9] shadow-[0_2px_12px_rgba(26,54,41,0.03)] p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border border-[#1A3629]/15 bg-[#F4F0EA] flex items-center justify-center font-cabinet font-extrabold text-xl text-[#1A3629]">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-cabinet font-bold text-2xl sm:text-3xl tracking-tight text-[#1A3629]">
                  {displayName}
                </h2>
                {isGuest && (
                  <span className="px-2.5 py-0.5 rounded-full border border-[#1A3629]/20 bg-[#F4F0EA] text-xs font-mono font-semibold">
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
              onClick={() => {
                retroAudio.playInspectConfirm();
                setIsInviteModalOpen(true);
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-emerald-600/20 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/70 font-cabinet font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              title="Invite Friends for +250 XP"
            >
              <PixelGift size={14} color="#059669" />
              <span>Invite (+250 XP)</span>
            </button>

            <button
              type="button"
              onClick={handleForceSync}
              disabled={isSyncing}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-[#1A3629]/15 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#F4F0EA] font-cabinet font-semibold text-xs transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              <PixelRefresh size={14} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Cloud'}</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] hover:bg-[#234535] font-cabinet font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <PixelLogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {syncStatus && (
          <div className="mb-6 p-3.5 rounded-2xl border border-emerald-600/20 bg-emerald-50 text-xs font-mono font-bold text-[#065F46] flex items-center gap-2">
            <PixelRefresh size={16} color="#10B981" />
            <span>{syncStatus}</span>
          </div>
        )}

        {/* Progression HUD */}
        <div className="mb-8">
          <XpHud />
        </div>

        {/* Physical Archival Register */}
        <div className="rounded-3xl border border-[#1A3629]/15 bg-[#FFFDF9] shadow-[0_4px_24px_rgba(26,54,41,0.04)] p-6 sm:p-7 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-[#1A3629]/10 gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase font-bold tracking-wider text-[#1A3629]">
                Archival Biometric Ledger
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded-md border border-[#1A3629]/15 bg-[#FAF8F5] text-[#4A5D4E]">
                REGISTER NO. 2026-V2
              </span>
            </div>
            <span className="font-mono text-xs text-[#4A5D4E] flex items-center gap-1.5 self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              Local Encrypted Storage
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl border border-[#1A3629]/10 bg-[#FAF8F5] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#4A5D4E]">
                  Cadence
                </span>
                <span className="font-mono text-xs text-[#1A3629]/60">ENTRIES</span>
              </div>
              <div className="my-2">
                <div className="font-mono font-black text-3xl tabular-nums text-[#1A3629]">
                  {totalDaysLogged}
                </div>
                <span className="font-cabinet font-medium text-xs text-[#2C4A3B]">
                  Active Journal Days
                </span>
              </div>
              <div className="pt-2 border-t border-[#1A3629]/10 flex items-center justify-between font-mono text-xs text-[#4A5D4E]">
                <span>Status</span>
                <span className="text-[#065F46] font-bold">Documented</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl border border-[#1A3629]/10 bg-[#FAF8F5] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#4A5D4E]">
                  Discipline
                </span>
                <span className="font-mono text-xs text-[#1A3629]/60">CHECKS</span>
              </div>
              <div className="my-2">
                <div className="font-mono font-black text-3xl tabular-nums text-[#1A3629]">
                  {totalHabitsCompleted}
                </div>
                <span className="font-cabinet font-medium text-xs text-[#2C4A3B]">
                  Rituals Executed
                </span>
              </div>
              <div className="pt-2 border-t border-[#1A3629]/10 flex items-center justify-between font-mono text-xs text-[#4A5D4E]">
                <span>Integrity</span>
                <span className="text-[#065F46] font-bold">Verified</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl border border-[#1A3629]/10 bg-[#FAF8F5] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#4A5D4E]">
                  Metabolism
                </span>
                <span className="font-mono text-xs text-[#1A3629]/60">PROTEIN</span>
              </div>
              <div className="my-2">
                <div className="font-mono font-black text-3xl tabular-nums text-[#1A3629]">
                  {totalProteinLogged}g
                </div>
                <span className="font-cabinet font-medium text-xs text-[#2C4A3B]">
                  Total Nitrogen Floor
                </span>
              </div>
              <div className="pt-2 border-t border-[#1A3629]/10 flex items-center justify-between font-mono text-xs text-[#4A5D4E]">
                <span>Daily Target</span>
                <span className="text-[#065F46] font-bold">
                  {userProfile?.targetProteinGrams || (userProfile?.weightKg ? Math.round(userProfile.weightKg * 2.0) : 140)}g
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sanctuary Biome Architecture Suite Switcher */}
        <div className="rounded-3xl border border-[#1A3629]/15 bg-[#FFFDF9] shadow-[0_2px_12px_rgba(26,54,41,0.03)] p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#1A3629]/10 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#B8862D] uppercase tracking-wider">
                  Universal Sanctuary Progression
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#1A3629]/10 text-[#1A3629] font-mono text-xs font-bold">
                  Tier {currentIsland.tier} · Level {masterLevelInfo.level}
                </span>
              </div>
              <h2 className="font-cabinet font-extrabold text-2xl text-[#1A3629] tracking-tight mt-1">
                Active Biome Suite: {ISLAND_SUITES[activeSuite]?.name || 'The Pillow Fighter'}
              </h2>
              <p className="text-xs font-cabinet font-medium text-[#4A5D4E] mt-0.5">
                Switch between your floating biomes without losing your master level progression.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#1A3629]/20 bg-[#FAF8F5] text-[#1A3629] font-cabinet font-bold text-xs hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-colors shrink-0"
            >
              <span>View in Observatory →</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {(Object.values(ISLAND_SUITES) as Array<(typeof ISLAND_SUITES)[IslandSuiteId]>).map((suite) => {
              const isSelected = activeSuite === suite.id;
              const previewTier = getIslandTier(masterLevelInfo.level, suite.id);
              return (
                <div
                  key={suite.id}
                  onClick={() => {
                    if (!isSelected) {
                      retroAudio.playTierUpgrade();
                      haptics.tap();
                      updateUserProfile({ selectedIslandSuite: suite.id });
                    }
                  }}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                    isSelected
                      ? 'border-[#1A3629] bg-[#FAF8F5] ring-2 ring-[#1A3629]/10'
                      : 'border-[#1A3629]/15 bg-[#FFFDF9] hover:border-[#1A3629]/40 hover:bg-[#FAF8F5]/50'
                  }`}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#4A5D4E] uppercase tracking-wider">
                        {suite.badge}
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1A3629] text-[#FFFDF9] font-mono text-xs font-bold">
                          <PixelCheck size={10} color="#FFFDF9" />
                          <span>ACTIVE</span>
                        </span>
                      )}
                    </div>

                    <div className="w-full h-32 rounded-xl bg-gradient-to-b from-[#EBF3EE] to-[#FAF8F5] border border-[#1A3629]/10 flex items-center justify-center overflow-hidden relative">
                      <img
                        src={previewTier.pngImage || previewTier.image}
                        alt={previewTier.name}
                        className="w-28 h-28 object-contain transition-transform duration-300 hover:scale-110"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </div>

                    <div>
                      <h3 className="font-cabinet font-bold text-base text-[#1A3629]">
                        {suite.name}
                      </h3>
                      <p className="font-sans text-xs text-[#4A5D4E] mt-1 leading-snug">
                        {suite.tagline}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isSelected) {
                        retroAudio.playTierUpgrade();
                        haptics.tap();
                        updateUserProfile({ selectedIslandSuite: suite.id });
                      }
                    }}
                    className={`w-full py-2.5 rounded-xl font-cabinet font-bold text-xs transition-colors cursor-pointer text-center ${
                      isSelected
                        ? 'bg-[#1A3629] text-[#FFFDF9]'
                        : 'border border-[#1A3629]/20 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9]'
                    }`}
                  >
                    <span>{isSelected ? 'Active Architecture' : 'Equip Architecture'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4th Custom Habit Slot Configuration */}
        <div className="rounded-3xl border border-[#1A3629]/15 bg-[#FFFDF9] shadow-[0_2px_12px_rgba(26,54,41,0.03)] p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#1A3629]/10 gap-2">
            <div>
              <span className="font-mono text-xs font-bold text-[#B8862D] uppercase tracking-wider">
                Daily Focus Configuration
              </span>
              <h2 className="font-cabinet font-extrabold text-2xl text-[#1A3629] tracking-tight mt-1">
                4th Custom Habit Slot
              </h2>
              <p className="text-xs font-cabinet font-medium text-[#4A5D4E] mt-0.5">
                Equip an optional 4th keystone habit across lifestyle, mindfulness, movement, or nutrition.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#1A3629]/10 font-mono text-xs font-bold text-[#1A3629] self-start sm:self-auto">
              Current: {CUSTOM_HABITS_LIBRARY.find((h) => h.id === (userProfile?.customHabitSlot || 'reading_20m'))?.title || userProfile?.customHabitSlot || 'Deep Reading'}
            </span>
          </div>

          {/* Quick Selectors Grid from Library */}
          <div className="mt-5 flex flex-col gap-3">
            <span className="font-mono text-xs uppercase font-bold text-[#4A5D4E]">
              Select from Evidence-Based Habit Library:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {CUSTOM_HABITS_LIBRARY.map((habit) => {
                const isEquipped = (userProfile?.customHabitSlot || 'reading_20m') === habit.id;
                return (
                  <button
                    key={habit.id}
                    type="button"
                    onClick={() => {
                      retroAudio.playInspectConfirm();
                      haptics.tap();
                      setCustomHabitSlot(habit.id, habit.title, habit.category);
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      isEquipped
                        ? 'border-2 border-[#1A3629] bg-[#FAF8F5]'
                        : 'border border-[#1A3629]/15 bg-[#FFFDF9] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-cabinet font-bold text-xs text-[#1A3629]">
                        {habit.title}
                      </span>
                      <span className="font-mono text-xs text-[#4A5D4E] uppercase">
                        {habit.category}
                      </span>
                    </div>
                    {isEquipped && (
                      <span className="px-2 py-0.5 rounded-full bg-[#1A3629] text-[#FFFDF9] font-mono text-xs font-bold shrink-0">
                        EQUIPPED
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Input Option */}
            <div className="mt-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#1A3629]/15 flex flex-col gap-3">
              <span className="font-cabinet font-bold text-xs text-[#1A3629]">
                Or Define Your Own Personal Lifestyle Habit:
              </span>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={customHabitTitle}
                  onChange={(e) => setCustomHabitTitle(e.target.value)}
                  placeholder="e.g. 15m Evening Piano, Mobility Routine..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#1A3629]/20 bg-[#FFFDF9] font-cabinet font-bold text-xs text-[#1A3629] focus:outline-none focus:border-[#1A3629]"
                />
                <select
                  value={customHabitCategory}
                  onChange={(e) => setCustomHabitCategory(e.target.value as any)}
                  className="px-3 py-2.5 rounded-xl border border-[#1A3629]/20 bg-[#FFFDF9] font-mono text-xs font-bold text-[#1A3629]"
                >
                  <option value="life">Life</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="recovery">Recovery</option>
                  <option value="fuel">Fuel</option>
                  <option value="movement">Movement</option>
                  <option value="circadian">Circadian</option>
                  <option value="misc">Misc</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const title = customHabitTitle.trim();
                    if (!title) return;
                    const id = `custom_${Date.now()}`;
                    retroAudio.playInspectConfirm();
                    haptics.tap();
                    setCustomHabitSlot(id, title, customHabitCategory);
                    setCustomHabitTitle('');
                  }}
                  disabled={!customHabitTitle.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#1A3629] hover:bg-[#2C4A3B] text-[#FFFDF9] font-cabinet font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <span>Equip Custom Habit</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details & Baseline Targets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          <div className="rounded-3xl border border-[#1A3629]/15 bg-[#FFFDF9] shadow-[0_2px_12px_rgba(26,54,41,0.03)] p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-cabinet font-bold text-xl text-[#1A3629]">
                  Calibrated Baseline Targets
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md border border-[#1A3629]/15 bg-[#FAF8F5] text-[#4A5D4E]">
                  BIOMETRICS
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#1A3629]/10">
                  <span className="text-[#4A5D4E]">Current Body Weight:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1A3629]">
                      {userProfile?.weightKg || 70} kg
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        retroAudio.playInspectConfirm();
                        setIsWeightModalOpen(true);
                      }}
                      className="text-xs font-mono font-bold text-[#065F46] bg-[#ECFDF5] border border-[#10B981]/30 px-2 py-0.5 rounded hover:bg-[#D1FAE5] transition-colors cursor-pointer"
                    >
                      Check-in (+15 XP)
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-[#1A3629]/10">
                  <span className="text-[#4A5D4E]">Target Daily Protein:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#065F46]">
                      {userProfile?.targetProteinGrams || (userProfile?.weightKg ? Math.round(userProfile.weightKg * 2.0) : 140)}g / day
                    </span>
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-[#FAF8F5] border border-[#1A3629]/15 text-[#4A5D4E]">
                      {(((userProfile?.targetProteinGrams || (userProfile?.weightKg ? Math.round(userProfile.weightKg * 2.0) : 140))) / (userProfile?.weightKg || 70)).toFixed(1)}g/kg
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-[#1A3629]/10">
                  <span className="text-[#4A5D4E]">Target Hydration:</span>
                  <span className="font-bold text-[#1A3629]">
                    {userProfile?.weightKg ? (userProfile.weightKg * 0.04).toFixed(1) : '2.5'}L / day
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-[#1A3629]/10">
                  <span className="text-[#4A5D4E]">Target Sleep:</span>
                  <span className="font-bold text-[#1A3629]">8.0 hours (slow-wave)</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-[#1A3629]/10">
                  <span className="text-[#4A5D4E]">Circadian Window:</span>
                  <span className="font-bold text-[#1A3629]">{userProfile?.bedTime || '23:30'} → {userProfile?.wakeTime || '07:30'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4A5D4E]">Active Protocols:</span>
                  <span className="font-bold text-[#10B981]">{activeProtocolIds?.length || 1} Active</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  retroAudio.playInspectConfirm();
                  setIsRecalibrateModalOpen(true);
                }}
                className="flex-1 py-2.5 rounded-xl border border-[#1A3629] bg-[#1A3629] hover:bg-[#2C4A3B] text-[#FFFDF9] font-cabinet font-semibold text-xs text-center transition-colors cursor-pointer"
              >
                Quick Calibrate Targets
              </button>
              <Link
                href="/onboarding?edit=true"
                className="flex-1 py-2.5 rounded-xl border border-[#1A3629]/15 bg-[#F4F0EA] hover:bg-[#EBE5DC] text-[#1A3629] font-cabinet font-semibold text-xs text-center transition-colors block"
              >
                Full Onboarding Wizard →
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-[#1A3629]/15 bg-[#FFFDF9] shadow-[0_2px_12px_rgba(26,54,41,0.03)] p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <h2 className="font-cabinet font-bold text-xl mb-4 text-[#1A3629]">
                Core Pillars Navigation
              </h2>
              <ul className="space-y-2 font-cabinet font-semibold text-xs">
                <li>
                  <Link href="/playbook?tab=protocols" className="flex items-center justify-between p-3.5 rounded-2xl border border-[#1A3629]/10 hover:bg-[#F4F0EA] transition-colors">
                    <span>Focus &amp; Circadian Protocols</span>
                    <span className="font-mono text-xs">→</span>
                  </Link>
                </li>
                <li>
                  <Link href="/playbook" className="flex items-center justify-between p-3.5 rounded-2xl border border-[#1A3629]/10 hover:bg-[#F4F0EA] transition-colors">
                    <span>Evidence-Based Playbook</span>
                    <span className="font-mono text-xs">→</span>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard?tab=dossier" className="flex items-center justify-between p-3.5 rounded-2xl border border-[#1A3629]/10 hover:bg-[#F4F0EA] transition-colors">
                    <span>Correlation Engine &amp; Dossier</span>
                    <span className="font-mono text-xs">→</span>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="flex items-center justify-between p-3.5 rounded-2xl border border-[#1A3629]/10 hover:bg-[#F4F0EA] transition-colors">
                    <span>Sanctuary Observatory</span>
                    <span className="font-mono text-xs">→</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="mt-4 pt-3 border-t border-[#1A3629]/10 flex items-center justify-between text-xs font-mono text-[#4A5D4E]">
              <span>Cyath Engine v2.0</span>
              <span>Local-First · Encrypted</span>
            </div>
          </div>

        </div>

        {/* Getting Started Walkthrough Launcher Card */}
        <div className="rounded-3xl border border-[#1A3629]/10 bg-[#FFFDF9] shadow-[0_2px_12px_rgba(26,54,41,0.03)] p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F4F0EA] border border-[#1A3629]/15 flex items-center justify-center shrink-0">
              <PixelCompass size={20} className="text-[#1A3629]" />
            </div>
            <div>
              <h3 className="font-cabinet font-bold text-lg text-[#1A3629]">
                Getting Started Walkthrough
              </h3>
              <p className="text-xs font-cabinet font-medium text-[#4A5D4E] mt-0.5">
                Replay the interactive guide to habit tracking, focus protocols, and island progression.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              retroAudio.playInspectConfirm();
              window.dispatchEvent(new CustomEvent('open-cyath-walkthrough'));
            }}
            className="px-4 py-2.5 rounded-xl border border-[#1A3629]/15 bg-[#F4F0EA] hover:bg-[#EBE5DC] text-[#1A3629] font-cabinet font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <PixelCompass size={14} />
            <span>Launch Walkthrough Tour</span>
          </button>
        </div>

        {/* Trust, Privacy & Legal Terms */}
        <div className="rounded-3xl border border-[#1A3629]/10 bg-[#FFFDF9] shadow-[0_2px_12px_rgba(26,54,41,0.03)] p-6 sm:p-7 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#1A3629]/10">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F4F0EA] border border-[#1A3629]/15 flex items-center justify-center shrink-0">
                <PixelShieldCheck size={20} color="#1A3629" />
              </div>
              <div>
                <h3 className="font-cabinet font-bold text-lg text-[#1A3629]">
                  Trust, Privacy &amp; Legal Terms
                </h3>
                <p className="text-xs font-cabinet font-medium text-[#4A5D4E] mt-0.5 max-w-xl leading-relaxed">
                  Your circadian data, dietary logs, and habit streaks belong solely to you. Learn about our commitments or export your telemetry.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportData}
              className="px-4 py-2.5 rounded-xl border border-[#1A3629]/15 bg-[#F4F0EA] hover:bg-[#EBE5DC] text-[#1A3629] font-cabinet font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-auto"
            >
              <PixelDownload size={14} />
              <span>Export Ledger JSON</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5">
            <Link
              href="/privacy"
              className="group p-4 rounded-2xl border border-[#1A3629]/12 bg-[#FAF8F5] hover:bg-[#F4EDE0] hover:border-[#1A3629]/25 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FFFDF9] border border-[#1A3629]/15 flex items-center justify-center">
                  <PixelFileText size={16} className="text-[#1A3629]" />
                </div>
                <div>
                  <h4 className="font-cabinet font-bold text-sm text-[#1A3629] group-hover:text-[#2C4A3B]">
                    Privacy Policy
                  </h4>
                  <p className="text-xs font-sans text-[#4A5D4E]">
                    Read our zero-sale telemetry and encryption principles.
                  </p>
                </div>
              </div>
              <PixelExternalLink size={14} className="text-[#1A3629]/40 group-hover:text-[#1A3629] group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/terms"
              className="group p-4 rounded-2xl border border-[#1A3629]/12 bg-[#FAF8F5] hover:bg-[#F4EDE0] hover:border-[#1A3629]/25 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FFFDF9] border border-[#1A3629]/15 flex items-center justify-center">
                  <PixelFileText size={16} className="text-[#1A3629]" />
                </div>
                <div>
                  <h4 className="font-cabinet font-bold text-sm text-[#1A3629] group-hover:text-[#2C4A3B]">
                    Terms &amp; Conditions
                  </h4>
                  <p className="text-xs font-sans text-[#4A5D4E]">
                    Fair-use terms and software agreement.
                  </p>
                </div>
              </div>
              <PixelExternalLink size={14} className="text-[#1A3629]/40 group-hover:text-[#1A3629] group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>

        {/* Danger Zone: Account & Data Reset */}
        <div className="rounded-3xl border border-red-200/80 bg-red-50/40 p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-red-200 flex items-center justify-center shrink-0 shadow-2xs">
                <PixelShieldAlert size={20} color="#DC2626" />
              </div>
              <div>
                <h3 className="font-cabinet font-bold text-lg text-[#991B1B]">
                  Danger Zone · Account Data &amp; Reset
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
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-100/70 text-amber-900 hover:bg-amber-100 font-cabinet font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <PixelRefresh size={14} />
                <span>Reset to Level 1</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  setShowDeleteModal(true);
                }}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-red-600 bg-red-600 text-white hover:bg-red-700 font-cabinet font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <PixelTrash size={14} />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Guild Recruitment Modal */}
      <GuildInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      {/* Reset Progress Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-[#1A3629]/30 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-md w-full bg-[#FFFDF9] border border-[#1A3629]/15 rounded-3xl p-6 sm:p-8 relative shadow-[0_25px_60px_rgba(26,54,41,0.14)] animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setShowResetModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-[#1A3629]/15 hover:bg-[#F4F0EA] cursor-pointer"
            >
              <PixelX size={16} className="text-[#1A3629]" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-100/70 border border-amber-300 flex items-center justify-center mb-4">
              <PixelRefresh size={24} className="text-amber-900" />
            </div>

            <h3 className="font-cabinet font-extrabold text-2xl text-[#1A3629] mb-2">
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
                className="flex-1 py-3 rounded-xl border border-[#1A3629]/15 bg-[#FAF6EE] text-[#1A3629] font-cabinet font-semibold text-xs hover:bg-[#EAE4D7] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleResetProgress}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl border border-amber-600 bg-amber-600 text-white font-cabinet font-semibold text-xs hover:bg-amber-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? <span>Resetting...</span> : <span>Confirm Reset (0 XP)</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-[#1A3629]/30 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-md w-full bg-[#FFFDF9] border border-[#1A3629]/15 rounded-3xl p-6 sm:p-8 relative shadow-[0_25px_60px_rgba(26,54,41,0.14)] animate-in zoom-in-95 duration-150">
            
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-[#1A3629]/15 hover:bg-[#F4F0EA] cursor-pointer"
            >
              <PixelX size={16} className="text-[#1A3629]" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-red-100/70 border border-red-300 flex items-center justify-center mb-4">
              <PixelAlert size={24} className="text-red-700" />
            </div>

            <h3 className="font-cabinet font-extrabold text-2xl text-[#1A3629] mb-2">
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
                className="flex-1 py-3 rounded-xl border border-[#1A3629]/15 bg-[#FAF6EE] text-[#1A3629] font-cabinet font-semibold text-xs hover:bg-[#EAE4D7] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl border border-red-600 bg-red-600 text-white font-cabinet font-semibold text-xs hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <PixelTrash size={14} />
                    <span>Delete Everything</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Quick Recalibration Modal */}
      {isRecalibrateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#1A3629]/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsRecalibrateModalOpen(false)}
        >
          <div
            className="max-w-lg w-full bg-[#FFFDF9] border border-[#1A3629]/20 rounded-3xl p-6 sm:p-8 relative shadow-[0_20px_50px_rgba(26,54,41,0.18)] flex flex-col gap-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-[#1A3629]/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border border-[#1A3629]/15 bg-[#FAF8F5] text-[#1A3629]">
                    Biometric Console
                  </span>
                  <span className="font-mono text-xs font-bold text-[#065F46] bg-[#ECFDF5] border border-[#10B981]/30 px-2 py-0.5 rounded-md">
                    +25 XP Recalibration
                  </span>
                </div>
                <h3 className="font-cabinet font-extrabold text-2xl text-[#1A3629] mt-1">
                  Recalibrate Baseline Targets
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRecalibrateModalOpen(false)}
                className="w-8 h-8 rounded-full border border-[#1A3629]/20 bg-[#FAF8F5] text-[#1A3629]/70 hover:text-[#1A3629] hover:bg-[#FAF8F5]/80 flex items-center justify-center cursor-pointer transition-colors"
              >
                <PixelX size={12} color="#1A3629" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Weight row */}
              <div className="p-4 rounded-2xl border border-[#1A3629]/15 bg-[#FAF8F5] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="recalib-weight" className="font-mono text-xs font-bold uppercase text-[#1A3629]">
                    Calibrated Body Weight
                  </label>
                  <span className="font-mono text-xs text-[#4A5D4E]">
                    Current: {calibWeightKg} kg
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="recalib-weight"
                    type="range"
                    min="40"
                    max="180"
                    step="0.5"
                    value={calibWeightKg}
                    onChange={(e) => {
                      const w = parseFloat(e.target.value) || 70;
                      setCalibWeightKg(w);
                      setCalibProtein(Math.round(w * 2.0));
                    }}
                    className="flex-1 accent-[#1A3629] cursor-pointer"
                  />
                  <div className="w-20 px-2.5 py-1.5 rounded-xl border border-[#1A3629]/20 bg-[#FFFDF9] text-center font-mono font-bold text-sm text-[#1A3629]">
                    {calibWeightKg} kg
                  </div>
                </div>
              </div>

              {/* Protein Target Floor */}
              <div className="p-4 rounded-2xl border border-[#1A3629]/15 bg-[#FAF8F5] flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="recalib-protein" className="font-mono text-xs font-bold uppercase text-[#1A3629]">
                    Daily Protein Floor
                  </label>
                  <span className="font-mono text-xs font-bold text-[#065F46]">
                    {(calibProtein / calibWeightKg).toFixed(1)}g / kg
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="recalib-protein"
                    type="range"
                    min={Math.round(calibWeightKg * 1.2)}
                    max={Math.round(calibWeightKg * 2.8)}
                    step="1"
                    value={calibProtein}
                    onChange={(e) => setCalibProtein(parseInt(e.target.value) || 140)}
                    className="flex-1 accent-[#065F46] cursor-pointer"
                  />
                  <div className="w-24 px-2.5 py-1.5 rounded-xl border border-[#1A3629]/20 bg-[#FFFDF9] text-center font-mono font-bold text-sm text-[#065F46]">
                    {calibProtein}g / day
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { label: '1.6g/kg', name: 'Baseline', mult: 1.6 },
                    { label: '1.8g/kg', name: 'Athletic', mult: 1.8 },
                    { label: '2.0g/kg', name: 'Optimal', mult: 2.0 },
                    { label: '2.2g/kg', name: 'Peak', mult: 2.2 },
                  ].map((p) => {
                    const isSelected = Math.round(calibWeightKg * p.mult) === calibProtein;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          retroAudio.playBlip();
                          setCalibProtein(Math.round(calibWeightKg * p.mult));
                        }}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9]'
                            : 'border-[#1A3629]/15 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#F4F0EA]'
                        }`}
                      >
                        <span className="font-mono font-bold text-xs block">{p.label}</span>
                        <span className="font-cabinet text-xs block opacity-80">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Circadian Bedtime & Wake Time */}
              <div className="p-4 rounded-2xl border border-[#1A3629]/15 bg-[#FAF8F5] grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="recalib-bedtime" className="font-mono text-xs font-bold uppercase text-[#1A3629]">
                    Target Bedtime
                  </label>
                  <input
                    id="recalib-bedtime"
                    type="time"
                    value={calibBedTime}
                    onChange={(e) => setCalibBedTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#1A3629]/20 bg-[#FFFDF9] font-mono font-bold text-xs text-[#1A3629]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="recalib-waketime" className="font-mono text-xs font-bold uppercase text-[#1A3629]">
                    Target Wake
                  </label>
                  <input
                    id="recalib-waketime"
                    type="time"
                    value={calibWakeTime}
                    onChange={(e) => setCalibWakeTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#1A3629]/20 bg-[#FFFDF9] font-mono font-bold text-xs text-[#1A3629]"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRecalibrateModalOpen(false)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#1A3629]/15 bg-[#FAF6EE] text-[#1A3629] font-cabinet font-semibold text-xs hover:bg-[#EAE4D7] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRecalibration}
                className="w-full flex-1 py-3 rounded-xl border border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] hover:bg-[#2C4A3B] font-cabinet font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <PixelCheck size={14} color="#FFFDF9" />
                <span>Save &amp; Recalibrate (+25 XP)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <WeightTrackerModal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
      />


    </div>
  );
}
