'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { useHabitStore } from '@/store/useHabitStore';
import { ISLAND_TIERS, getIslandTier, getSuiteTiers } from '@/lib/progression/config';
import { calculateLevel } from '@/lib/progression/engine';
import { formatLocalDate } from '@/lib/dateUtils';
import { PixelStreakFlame } from '@/components/ui/PixelStreakFlame';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { PixelPushpin } from '@/components/dashboard/PixelPushpin';
import { PixelCheck, PixelBook, PixelChevronDown, PixelSparkles } from '@/components/common/PixelIcons';

interface FullscreenSanctuaryStageProps {
  onOpenSeal: () => void;
  onOpenLedger: () => void;
  onScrollToTrophies: () => void;
  onOpenBiomeGallery?: () => void;
  onRequireAuth?: () => void;
}

export function FullscreenSanctuaryStage({
  onOpenSeal,
  onOpenLedger,
  onScrollToTrophies,
  onOpenBiomeGallery,
  onRequireAuth,
}: FullscreenSanctuaryStageProps) {
  const {
    totalXp,
    currentDate,
    getDailyLog,
    streakCount,
    isForgedStreak,
    isLedgerSealedByDate,
    activateReentryProtocol,
    userSession,
    userProfile,
    suiteXp,
  } = useHabitStore();

  const isAuthenticated = !!userSession && !userSession.id.startsWith('guest_');

  const activeSuite = (userProfile?.selectedIslandSuite || userProfile?.archetype || 'circadian') as 'circadian' | 'iron' | 'focus';
  const activeTiers = getSuiteTiers(activeSuite);

  const hasSuiteXp = !!(suiteXp && (suiteXp.circadian > 0 || suiteXp.iron > 0 || suiteXp.focus > 0));
  const activeSuiteXp = hasSuiteXp ? (suiteXp[activeSuite] ?? 0) : totalXp;
  const progress = useMemo(() => calculateLevel(activeSuiteXp), [activeSuiteXp]);
  const currentIsland = useMemo(
    () => getIslandTier(progress.level, activeSuite),
    [progress.level, activeSuite]
  );
  const nextIsland = useMemo(() => {
    return activeTiers.find((t) => t.tier === currentIsland.tier + 1) || null;
  }, [currentIsland.tier, activeTiers]);

  const currentLog = getDailyLog(currentDate);
  const isTodaySealed = isAuthenticated ? !!isLedgerSealedByDate[currentDate] : false;

  const hasLoggedToday = isTodaySealed ||
    Object.values(currentLog.habitsCompleted ?? {}).some(Boolean) ||
    (currentLog.totalProteinLogged ?? 0) > 0 ||
    (currentLog.hydrationLiters ?? 0) > 0 ||
    (currentLog.sleepHours ?? 0) > 0 ||
    (currentLog.loggedRecipeIds?.length ?? 0) > 0 ||
    (currentLog.loggedMeals?.length ?? 0) > 0;

  const isFlameForged = isAuthenticated && isForgedStreak && !hasLoggedToday;

  const [isLowEndDevice, setIsLowEndDevice] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('cyath_low_power_island');
    if (saved !== null) {
      setIsLowEndDevice(saved === 'true');
      return;
    }
    const cores = navigator.hardwareConcurrency || 8;
    const memory = (navigator as any).deviceMemory || 8;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (cores <= 4 || memory < 4 || prefersReducedMotion) {
      setIsLowEndDevice(true);
    }
  }, []);

  const handleReentry = () => {
    if (!isAuthenticated) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    retroAudio.playTierUpgrade();
    haptics.heavy();
    activateReentryProtocol();
  };

  const handleSealClick = () => {
    if (!isAuthenticated) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    retroAudio.playInspectConfirm();
    haptics.heavy();
    onOpenSeal();
  };

  const handleLedgerClick = () => {
    if (!isAuthenticated) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    retroAudio.playPaperRustle();
    haptics.tap();
    onOpenLedger();
  };

  return (
    <div
      id="tour-sanctuary-stage"
      className="relative w-full min-h-[calc(100vh-5rem)] flex flex-col justify-between items-center px-4 sm:px-8 py-6 select-none overflow-hidden"
    >
      {/* Gentle Wind-Drift Ambient Pixel Clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Upper Slow Drift Layer */}
        <div
          className="absolute top-20 left-0 opacity-70 animate-[cloudDriftSlow_52s_linear_infinite]"
          style={{ imageRendering: 'pixelated' }}
        >
          <svg width="170" height="42" viewBox="0 0 85 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_2px_6px_rgba(26,54,41,0.06)]">
            <rect x="22" y="3" width="42" height="15" fill="#D8D2C4" />
            <rect x="10" y="7" width="65" height="11" fill="#D8D2C4" />
            <rect x="5" y="11" width="75" height="6" fill="#D8D2C4" />
            <rect x="26" y="5" width="34" height="4" fill="#FFFFFF" />
            <rect x="14" y="9" width="56" height="2" fill="#FFFFFF" opacity="0.8" />
          </svg>
        </div>

        {/* Lower Fast Drift Layer */}
        <div
          className="absolute top-64 left-0 opacity-55 animate-[cloudDriftFast_36s_linear_infinite]"
          style={{ imageRendering: 'pixelated', animationDelay: '-16s' }}
        >
          <svg width="220" height="52" viewBox="0 0 110 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_2px_8px_rgba(26,54,41,0.05)]">
            <rect x="28" y="3" width="54" height="19" fill="#CDC6B6" />
            <rect x="12" y="8" width="85" height="14" fill="#CDC6B6" />
            <rect x="6" y="14" width="98" height="8" fill="#CDC6B6" />
            <rect x="34" y="6" width="42" height="5" fill="#FFFFFF" />
            <rect x="18" y="11" width="72" height="3" fill="#FFFFFF" opacity="0.85" />
          </svg>
        </div>

        {/* Distant High Altitude Micro-Cloud */}
        <div
          className="absolute top-12 left-0 opacity-40 animate-[cloudDriftSlow_70s_linear_infinite]"
          style={{ imageRendering: 'pixelated', animationDelay: '-32s' }}
        >
          <svg width="110" height="28" viewBox="0 0 55 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="14" y="2" width="28" height="10" fill="#DDD8CB" />
            <rect x="6" y="5" width="43" height="7" fill="#DDD8CB" />
            <rect x="18" y="3" width="20" height="3" fill="#FFFFFF" />
          </svg>
        </div>
      </div>

      {/* Top Bar: Sanctuary Status, Streak & Biome Tier */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10 pt-2">
        {/* Streak Flame Badge */}
        <div
          onClick={() => {
            if (!isAuthenticated && onRequireAuth) onRequireAuth();
          }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFFDF9]/90 backdrop-blur-md border border-[#1A3629]/15 shadow-sm ${
            !isAuthenticated ? 'cursor-pointer hover:border-[#1A3629]' : ''
          }`}
          title={isAuthenticated ? (isFlameForged ? `${streakCount} Day Forged Streak (Kintsugi Grace Shield Active - Log today to reignite)` : `${streakCount} Day Momentum Streak`) : 'Sign in to record daily streak'}
        >
          <PixelStreakFlame isForged={isFlameForged} size={20} />
          <span className="font-cabinet font-extrabold text-xs sm:text-sm text-[#1A3629]">
            {isAuthenticated ? `${streakCount} ${streakCount === 1 ? 'Day Streak' : 'Days Streak'}` : 'Guest Explorer'}
          </span>
          {isTodaySealed && (
            <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
              <PixelCheck size={12} color="#047857" />
              <span>Sealed Today</span>
            </span>
          )}
        </div>

        {/* Biome Name & Level Pill */}
        <div
          onClick={() => {
            if (!isAuthenticated && onRequireAuth) {
              onRequireAuth();
              return;
            }
            onOpenBiomeGallery?.();
          }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#FFFDF9]/90 backdrop-blur-md border border-[#1A3629]/15 shadow-sm font-mono text-xs cursor-pointer hover:border-[#1A3629] hover:shadow-md transition-all group"
          title="Click to explore Biome Ascensions and Island Suites"
        >
          <span className="font-cabinet font-extrabold text-sm text-[#1A3629] group-hover:text-[#2C4A3B]">
            {currentIsland.name}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#1A3629]/30" />
          <span className="font-bold text-[#4A5D4E]">
            Lvl {isAuthenticated ? progress.level : 1} ({isAuthenticated ? progress.progressPercent : 0}%)
          </span>
          <span className="text-[10px] text-[#B8862D] font-bold font-cabinet flex items-center gap-1">
            <PixelSparkles size={11} color="#B8862D" />
            <span>Biomes</span>
          </span>
        </div>
      </div>

      {/* Center: Ginormous Monumental Living Island Graphic */}
      <div className="relative flex-1 flex flex-col items-center justify-center my-auto w-full max-w-5xl py-4 z-10">
        {/* Dormant Mist Alert Banner only if user had an active account with XP that lapsed */}
        {streakCount === 0 && totalXp > 50 && (
          <div className="absolute top-2 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF9] border border-[#1A3629]/20 shadow-sm animate-in fade-in">
            <span className="font-sans text-xs text-[#4A5D4E]">
              Sanctuary in Dormant Mist
            </span>
            <button
              type="button"
              onClick={handleReentry}
              className="px-2.5 py-0.5 rounded-full bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-[11px] hover:bg-[#2C4A3B] transition-colors cursor-pointer"
            >
              Forged Re-Entry
            </button>
          </div>
        )}

        <div
          onClick={() => {
            if (!isAuthenticated && onRequireAuth) {
              onRequireAuth();
              return;
            }
            onOpenBiomeGallery?.();
          }}
          className="relative z-10 w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] md:w-[540px] md:h-[540px] lg:w-[620px] lg:h-[620px] xl:w-[700px] xl:h-[700px] max-w-full flex items-center justify-center motion-safe:animate-[islandFloat_8s_ease-in-out_infinite] motion-reduce:animate-none transition-all duration-300 cursor-pointer"
          title="Click to view Biome Ascensions & Island Suites"
        >
          <Image
            src={currentIsland.pngImage || currentIsland.image}
            alt={currentIsland.name}
            fill
            priority
            sizes="(max-width: 640px) 340px, (max-width: 1024px) 540px, 700px"
            className="object-contain drop-shadow-[0_24px_40px_rgba(26,54,41,0.18)] select-none hover:scale-[1.02] transition-transform duration-300"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* Stepped Pixel Ground Shadow */}
        <div className="relative flex flex-col items-center justify-center -mt-8 sm:-mt-10 pointer-events-none motion-safe:animate-[shadowFloat_8s_ease-in-out_infinite] motion-reduce:animate-none">
          <div className="w-[300px] sm:w-[420px] md:w-[480px] lg:w-[540px] xl:w-[600px] h-4 rounded-full bg-[#1A3629]/10" />
          <div className="w-[200px] sm:w-[280px] md:w-[320px] lg:w-[360px] xl:w-[420px] h-3 rounded-full bg-[#1A3629]/16 -mt-3" />
          <div className="w-[120px] sm:w-[170px] md:w-[200px] lg:w-[230px] xl:w-[260px] h-2 rounded-full bg-[#1A3629]/24 -mt-2" />
        </div>
      </div>

      {/* Lower Third: The ONLY 2 Master Action Buttons */}
      <div className="w-full max-w-xl flex flex-col items-center gap-4 z-20 pb-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4">
          
          {/* Secondary Button: View Ledger (Left Drawer Trigger) */}
          <button
            id="btn-view-ledger"
            type="button"
            onClick={handleLedgerClick}
            className="w-full sm:w-1/2 py-4 px-6 rounded-2xl border-2 border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] hover:bg-[#FAF8F5] font-cabinet font-black text-sm transition-all cursor-pointer shadow-[4px_4px_0px_#1A3629] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2 group"
          >
            <PixelBook size={16} color="#1A3629" />
            <span>View Ledger</span>
          </button>

          {/* Primary Button: Seal Today (Right Drawer Trigger) */}
          <button
            id="btn-seal-today"
            type="button"
            onClick={handleSealClick}
            className={`w-full sm:w-1/2 py-4 px-6 rounded-2xl text-[#FFFDF9] font-cabinet font-black text-sm transition-all cursor-pointer shadow-[4px_4px_0px_#2C5E43] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2 group ${
              isTodaySealed
                ? 'bg-[#2C4A3B] hover:bg-[#1A3629]'
                : 'bg-[#1A3629] hover:bg-[#2C4A3B] ring-2 ring-[#B8862D]/50 hover:ring-[#B8862D]'
            }`}
          >
            <PixelPushpin size={20} animate={false} className="group-hover:scale-110 transition-transform" />
            <span>{isTodaySealed ? "Review Today's Seal" : 'Seal Today'}</span>
          </button>

        </div>

        {/* Subtle Indicator down to Trophies */}
        <button
          type="button"
          onClick={onScrollToTrophies}
          className="flex items-center gap-1.5 font-mono text-[11px] text-[#4A5D4E] hover:text-[#1A3629] transition-colors cursor-pointer group mt-1"
        >
          <span>Specimen Reliquary Trophies</span>
          <PixelChevronDown size={14} color="#4A5D4E" />
        </button>
      </div>
    </div>
  );
}
