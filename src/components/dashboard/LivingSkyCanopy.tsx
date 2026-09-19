'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { useHabitStore } from '@/store/useHabitStore';
import { ISLAND_TIERS, getIslandTier } from '@/lib/progression/config';
import { calculateLevel } from '@/lib/progression/engine';
import { calculateCircadianStatus } from '@/lib/circadianEngine';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';

export type IslandLifecycleState = 'active' | 'embers' | 'mist' | 'dormant';

interface LivingIslandHeroProps {
  onOpenReceipt?: () => void;
}

export function LivingIslandHero({ onOpenReceipt }: LivingIslandHeroProps) {
  const {
    totalXp,
    currentDate,
    getDailyLog,
    streakCount,
    isForgedStreak,
    userProfile,
    activateReentryProtocol,
  } = useHabitStore();

  const progress = useMemo(() => calculateLevel(totalXp), [totalXp]);
  const currentIsland = useMemo(() => getIslandTier(progress.level), [progress.level]);
  const nextIsland = useMemo(() => {
    return ISLAND_TIERS.find((t) => t.tier === currentIsland.tier + 1) || null;
  }, [currentIsland.tier]);

  const currentLog = getDailyLog(currentDate);

  const isSunlightDone = !!currentLog.habitsCompleted?.['sunlight'];
  const isHydrationDone = (currentLog.hydrationLiters || 0) >= 2.0 || !!currentLog.habitsCompleted?.['hydration'];
  const isFuelDone = (currentLog.totalProteinLogged || 0) >= 100 || !!currentLog.habitsCompleted?.['protein_target'];

  const completedHabitsCount = (isSunlightDone ? 1 : 0) + (isHydrationDone ? 1 : 0) + (isFuelDone ? 1 : 0);

  // Dynamic 48-Hour Lifecycle State (Active -> Embers -> Mist Dormancy -> Kintsugi)
  const lifecycleState: IslandLifecycleState = useMemo(() => {
    if (streakCount === 0) return 'mist';
    if (completedHabitsCount === 0) return 'embers';
    return 'active';
  }, [streakCount, completedHabitsCount]);

  // Dynamic Circadian Horizon Aura
  const circadian = useMemo(() => {
    return calculateCircadianStatus({
      wakeTimeStr: userProfile?.wakeTime || '07:30',
      bedtimeTargetStr: userProfile?.bedTime || '23:30',
    });
  }, [userProfile?.wakeTime, userProfile?.bedTime]);

  const horizonAuraClass = useMemo(() => {
    const phaseId = circadian.currentPhase.id;
    if (phaseId === 'photonic_reset') {
      return 'bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.22)_0%,_rgba(245,215,160,0.08)_45%,_transparent_75%)]';
    }
    if (phaseId === 'peak_clarity' || phaseId === 'secondary_focus') {
      return 'bg-[radial-gradient(circle_at_center,_rgba(96,165,250,0.18)_0%,_rgba(219,234,254,0.06)_45%,_transparent_75%)]';
    }
    if (phaseId === 'postprandial_dip' || phaseId === 'cortisol_winddown') {
      return 'bg-[radial-gradient(circle_at_center,_rgba(249,115,22,0.18)_0%,_rgba(254,215,170,0.08)_45%,_transparent_75%)]';
    }
    return 'bg-[radial-gradient(circle_at_center,_rgba(30,41,59,0.22)_0%,_rgba(51,65,85,0.08)_45%,_transparent_75%)]';
  }, [circadian.currentPhase.id]);

  const handleReentry = () => {
    retroAudio.playTierUpgrade();
    haptics.heavy();
    activateReentryProtocol();
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center text-center">
      {/* Ambient Circadian Horizon Glow */}
      <div
        className={`pointer-events-none absolute -inset-10 sm:-inset-16 rounded-full blur-3xl opacity-70 transition-all duration-1000 ${horizonAuraClass}`}
        aria-hidden="true"
      />

      {/* Floating Island Identification Banner */}
      <div className="relative z-10 flex flex-col items-center gap-1 mb-2 sm:mb-4">
        <h2 className="font-cabinet font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#1A3629] drop-shadow-xs">
          {currentIsland.name}
        </h2>

        {/* Momentum & Level Badge */}
        <div className="flex items-center gap-2 mt-1">
          <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FFFDF9] border border-[#1A3629]/15 text-[#1A3629] shadow-2xs">
            Tier {currentIsland.tier} · Level {progress.level}
          </span>
          <span className="font-mono text-xs font-bold text-[#065F46] bg-[#ECFDF5] border border-[#10B981]/25 px-2 py-0.5 rounded-full">
            ● {streakCount}d Momentum
          </span>
        </div>

        {/* Re-entry Badge if Kintsugi Forged */}
        {isForgedStreak && (
          <div className="mt-1 flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 shadow-2xs animate-in fade-in">
            <span className="font-mono text-xs font-bold text-[#2563EB]">
              Forged Re-Entry · Golden Kintsugi Active
            </span>
          </div>
        )}

        {/* Environmental Lore (Always visible, no popup needed) */}
        <p className="font-sans text-xs sm:text-sm text-[#4A5D4E] max-w-md mt-1 leading-relaxed">
          {currentIsland.description}
        </p>

        {/* Re-entry Shield Notice if streak was broken */}
        {streakCount === 0 && (
          <div className="mt-2 flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#FFFDF9] border border-[#1A3629]/15 shadow-sm animate-in fade-in">
            <span className="font-sans text-xs text-[#4A5D4E]">
              Sanctuary in Dormant Mist
            </span>
            <button
              type="button"
              onClick={handleReentry}
              className="px-2.5 py-1 rounded-lg bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs hover:bg-[#2C4A3B] transition-colors cursor-pointer"
            >
              <span>Forged Re-Entry</span>
            </button>
          </div>
        )}
      </div>

      {/* Center Stage: Monumental Hero Pixel Island */}
      <div className="relative z-10 flex flex-col items-center justify-center my-2 sm:my-3">
        <div
          className="relative z-10 w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] md:w-[380px] md:h-[380px] lg:w-[400px] lg:h-[400px] xl:w-[460px] xl:h-[460px] 2xl:w-[500px] 2xl:h-[500px] flex items-center justify-center animate-[islandFloat_8s_ease-in-out_infinite] transition-all duration-300"
        >
          {/* Handcrafted High-Definition Pixel Island */}
          <Image
            src={currentIsland.image}
            alt={currentIsland.name}
            fill
            priority
            sizes="(max-width: 640px) 280px, (max-width: 1024px) 400px, 500px"
            className={`object-contain drop-shadow-[0_25px_45px_rgba(26,54,41,0.20)] select-none transition-all duration-700 ${
              lifecycleState === 'mist'
                ? 'grayscale-[60%] contrast-[0.92] brightness-[0.96]'
                : lifecycleState === 'embers'
                ? 'sepia-[0.20] saturate-[1.12] hue-rotate-[-8deg]'
                : ''
            }`}
            style={{ imageRendering: 'pixelated' }}
          />

          {/* Dormant / Mist Fog Shroud Overlay */}
          {lifecycleState === 'mist' && (
            <div
              className="pointer-events-none absolute inset-x-4 bottom-8 h-24 bg-gradient-to-t from-slate-200/50 via-slate-100/25 to-transparent backdrop-blur-[1px] rounded-full animate-pulse"
              aria-hidden="true"
            />
          )}

          {/* Golden Kintsugi Fracture Seams Overlay (For Forged Streaks) */}
          {(isForgedStreak || streakCount >= 5) && (
            <svg
              viewBox="0 0 100 100"
              className="pointer-events-none absolute inset-0 w-full h-full select-none"
              shapeRendering="crispEdges"
              aria-hidden="true"
            >
              <path
                d="M48 68 L52 74 L50 82 L54 88 M52 74 L60 76 L66 82"
                stroke="#F59E0B"
                strokeWidth="1.2"
                fill="none"
                strokeDasharray="2 1"
                className="filter drop-shadow-[0_0_3px_#FBBF24]"
              />
            </svg>
          )}
        </div>

        {/* Natural Floating Ground Shadow */}
        <div className="w-[200px] sm:w-[280px] md:w-[320px] lg:w-[350px] xl:w-[380px] h-3.5 sm:h-4.5 rounded-full bg-[#1A3629]/15 blur-[6px] animate-[shadowFloat_8s_ease-in-out_infinite] mt-2 pointer-events-none" />
      </div>

      {/* Sanctuary Evolution Meter (Cleaned of redundant pills) */}
      <div className="w-full max-w-sm flex flex-col items-center gap-2 mt-2 bg-[#FFFDF9] border border-[#1A3629]/15 rounded-2xl p-4 shadow-[0_8px_30px_rgba(26,54,41,0.04)]">
        {/* Level XP Meter */}
        <div className="w-full flex flex-col gap-1.5">
          <div className="w-full h-1.5 bg-[#FAF8F5] border border-[#1A3629]/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1A3629] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress.progressPercent))}%` }}
            />
          </div>
          <div className="flex items-center justify-between font-mono text-[10px] text-[#4A5D4E]">
            <span>{Math.round(progress.progressPercent)}% to Level {progress.level + 1}</span>
            <span>{progress.currentLevelXp} / {progress.xpForNextLevel} XP</span>
          </div>
        </div>

        {nextIsland && (
          <div className="w-full pt-2 border-t border-[#1A3629]/8 flex items-center justify-between text-[11px]">
            <span className="font-sans text-[#4A5D4E]">Next Tier Evolution</span>
            <span className="font-cabinet font-bold text-[#1A3629]">{nextIsland.name} (Lv {nextIsland.minLevel})</span>
          </div>
        )}
      </div>

      {/* Tactile Perforated Thermal Receipt Stub */}
      {onOpenReceipt && (
        <button
          type="button"
          onClick={() => {
            retroAudio.playBlip();
            haptics.tap();
            onOpenReceipt();
          }}
          className="mt-3.5 inline-flex items-center px-4 py-2 rounded-xl border border-dashed border-[#1A3629]/25 bg-[#FFFDF9] hover:bg-[#1A3629] hover:text-[#FFFDF9] text-[#1A3629] shadow-2xs transition-all cursor-pointer group"
          title="Click to print and inspect daily thermal receipt"
        >
          <span className="font-mono text-xs font-bold tracking-tight">
            RECEIPT · {completedHabitsCount}/3 ANCHORS · {currentLog.totalProteinLogged || 0}g
          </span>
        </button>
      )}

      {/* Sub-Floor Descent Indicator */}
      <a
        href="#specimen-reliquary"
        className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] text-[#4A5D4E]/80 hover:text-[#1A3629] transition-colors cursor-pointer"
      >
        <span>Specimen Reliquary Sub-Floor ↓</span>
      </a>
    </div>
  );
}
