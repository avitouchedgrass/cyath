'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { useHabitStore } from '@/store/useHabitStore';
import { getIslandTier } from '@/lib/progression/config';
import { calculateLevel } from '@/lib/progression/engine';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { Sparkles, Shield, Flame, Sun, Droplets, Utensils } from 'lucide-react';

export function LivingIslandHero() {
  const {
    totalXp,
    currentDate,
    getDailyLog,
    streakCount,
    isForgedStreak,
    isReentryAvailable,
    activateReentryProtocol,
  } = useHabitStore();

  const progress = useMemo(() => calculateLevel(totalXp), [totalXp]);
  const currentIsland = useMemo(() => getIslandTier(progress.level), [progress.level]);
  const currentLog = getDailyLog(currentDate);

  // Reactive Habit States
  const isSunlightDone = !!currentLog.habitsCompleted?.['sunlight'];
  const isHydrationDone = (currentLog.hydrationLiters || 0) >= 2.0 || !!currentLog.habitsCompleted?.['hydration'];
  const isFuelDone = (currentLog.totalProteinLogged || 0) >= 100 || !!currentLog.habitsCompleted?.['protein_target'];

  const allHabitsDone = isSunlightDone && isHydrationDone && isFuelDone;

  const handleReentry = () => {
    retroAudio.playTierUpgrade();
    haptics.heavy();
    activateReentryProtocol(currentDate);
  };

  return (
    <div
      id="living-island-stage"
      className="w-full relative flex flex-col items-center justify-center select-none py-1 sm:py-2"
    >
      {/* Status Header Bar */}
      <div className="relative z-20 flex flex-col items-center text-center gap-1.5 mb-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFDF9] border border-[#1A3629]/15 text-[#1A3629] font-cabinet font-bold text-xs shadow-2xs">
          <span>Tier {currentIsland.tier}</span>
          <span className="opacity-30">·</span>
          <span className="font-mono text-[#1A3629]">Level {progress.level}</span>
          <span className="opacity-30">·</span>
          {isForgedStreak ? (
            <span className="flex items-center gap-1 text-[#2563EB] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
              <span>Forged Streak ({streakCount}d)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[#065F46]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>Streak: {streakCount}d</span>
            </span>
          )}
        </div>

        <h2 className="font-cabinet font-extrabold text-xl sm:text-2xl lg:text-3xl text-[#1A3629] tracking-tight">
          {currentIsland.name}
        </h2>

        {/* Re-entry Shield Notice if streak was broken */}
        {streakCount === 0 && (
          <div className="mt-1 flex items-center gap-2 p-2 rounded-2xl bg-[#FFFDF9] border border-[#1A3629]/20 shadow-2xs">
            <span className="font-sans text-xs text-[#4A5D4E]">
              Sanctuary in Dormant Mist.
            </span>
            <button
              type="button"
              onClick={handleReentry}
              className="px-2.5 py-1 rounded-xl bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-[11px] hover:bg-[#2C4A3B] transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Shield className="w-3 h-3 text-[#60A5FA]" />
              <span>Forged Re-Entry</span>
            </button>
          </div>
        )}
      </div>

      {/* Center Stage: Floating Island Canvas with Reactive Layers */}
      <div className="relative z-10 flex flex-col items-center justify-center my-1 sm:my-2">
        <div
          className="relative z-10 w-[160px] h-[160px] sm:w-[240px] sm:h-[240px] md:w-[340px] md:h-[340px] lg:w-[420px] lg:h-[420px] flex items-center justify-center animate-[islandFloat_8s_ease-in-out_infinite] transition-all duration-300"
        >
          {/* Base Pixel Island */}
          <Image
            src={currentIsland.image}
            alt={currentIsland.name}
            fill
            priority
            sizes="(max-width: 640px) 160px, (max-width: 1024px) 340px, 420px"
            className="object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.15)] select-none"
            style={{ imageRendering: 'pixelated' }}
          />

          {/* 1. Sunlight Reactive Layer: Golden Sunbeam Sweep */}
          {isSunlightDone && (
            <div 
              aria-label="Sunlight active"
              className="pointer-events-none absolute inset-0 rounded-full bg-radial from-amber-400/25 via-yellow-200/15 to-transparent mix-blend-screen animate-pulse"
            />
          )}

          {/* 2. Hydration Reactive Layer: Spring Glow */}
          {isHydrationDone && (
            <div 
              aria-label="Hydration active"
              className="pointer-events-none absolute -bottom-2 -left-2 w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-radial from-cyan-400/30 via-blue-300/15 to-transparent mix-blend-screen animate-ping opacity-60"
            />
          )}

          {/* 3. Fuel Reactive Layer: Hearth Embers Glow */}
          {isFuelDone && (
            <div 
              aria-label="Fuel active"
              className="pointer-events-none absolute -top-1 right-4 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-radial from-orange-500/30 via-amber-300/15 to-transparent mix-blend-screen animate-pulse"
            />
          )}
        </div>

        {/* Natural Floating Ground Shadow */}
        <div className="w-[140px] sm:w-[200px] md:w-[280px] lg:w-[340px] h-2.5 sm:h-3.5 rounded-full bg-[#1A3629]/15 blur-[4px] animate-[shadowFloat_8s_ease-in-out_infinite] mt-1 pointer-events-none" />
      </div>

      {/* Reactive Action Feedback Pills */}
      <div className="flex items-center gap-2 mt-2">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-mono font-bold transition-all ${
          isSunlightDone
            ? 'bg-[#FEF3C7] border-[#D97706]/40 text-[#B45309]'
            : 'bg-[#FFFDF9] border-[#1A3629]/10 text-[#4A5D4E]/60'
        }`}>
          <Sun className="w-3 h-3" />
          <span>Light</span>
        </span>

        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-mono font-bold transition-all ${
          isHydrationDone
            ? 'bg-[#E0F2FE] border-[#0284C7]/40 text-[#0369A1]'
            : 'bg-[#FFFDF9] border-[#1A3629]/10 text-[#4A5D4E]/60'
        }`}>
          <Droplets className="w-3 h-3" />
          <span>Water</span>
        </span>

        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-mono font-bold transition-all ${
          isFuelDone
            ? 'bg-[#ECFDF5] border-[#10B981]/40 text-[#065F46]'
            : 'bg-[#FFFDF9] border-[#1A3629]/10 text-[#4A5D4E]/60'
        }`}>
          <Utensils className="w-3 h-3" />
          <span>Fuel</span>
        </span>
      </div>

      {/* Progression Bar */}
      <div className="w-56 sm:w-72 flex flex-col gap-1 mt-3">
        <div className="w-full h-1.5 bg-[#1A3629]/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1A3629] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress.progressPercent))}%` }}
          />
        </div>
        <div className="flex items-center justify-between font-mono text-[10px] text-[#4A5D4E]">
          <span>{Math.round(progress.progressPercent)}% to Lvl {progress.level + 1}</span>
          <span>{progress.currentLevelXp}/{progress.xpForNextLevel} XP</span>
        </div>
      </div>
    </div>
  );
}
