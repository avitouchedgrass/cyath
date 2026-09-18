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
      className="w-full relative flex flex-col items-center justify-center select-none py-2"
    >
      {/* Subtle Atmospheric Back-Glow Behind Island */}
      <div 
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[440px] lg:w-[540px] h-[320px] sm:h-[440px] lg:h-[540px] rounded-full bg-radial from-amber-500/10 via-[#1A3629]/4 to-transparent blur-3xl"
        aria-hidden="true"
      />

      {/* Sanctuary Stage Header */}
      <div className="relative z-20 flex flex-col items-center text-center gap-1 mb-2">
        <h2 className="font-cabinet font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#1A3629] tracking-tight">
          {currentIsland.name}
        </h2>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFFDF9]/90 backdrop-blur-xs border border-[#1A3629]/12 text-[#1A3629] font-sans text-xs shadow-2xs">
          <span className="font-cabinet font-bold text-[#1A3629]">Tier {currentIsland.tier}</span>
          <span className="opacity-30">·</span>
          <span className="font-mono text-[#4A5D4E]">Level {progress.level}</span>
          <span className="opacity-30">·</span>
          {isForgedStreak ? (
            <span className="flex items-center gap-1 text-[#2563EB] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
              <span>Forged Streak ({streakCount}d)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[#065F46] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>{streakCount}d Momentum</span>
            </span>
          )}
        </div>

        {/* Re-entry Shield Notice if streak was broken */}
        {streakCount === 0 && (
          <div className="mt-2 flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#FFFDF9] border border-[#1A3629]/15 shadow-sm animate-in fade-in">
            <span className="font-sans text-xs text-[#4A5D4E]">
              Sanctuary in Dormant Mist
            </span>
            <button
              type="button"
              onClick={handleReentry}
              className="px-2.5 py-1 rounded-lg bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs hover:bg-[#2C4A3B] transition-colors cursor-pointer flex items-center gap-1"
            >
              <Shield className="w-3 h-3 text-[#60A5FA]" />
              <span>Forged Re-Entry</span>
            </button>
          </div>
        )}
      </div>

      {/* Center Stage: Cardless Floating Island with Perfect Crisp Sizing */}
      <div className="relative z-10 flex flex-col items-center justify-center my-1 sm:my-2">
        <div
          className="relative z-10 w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] lg:w-[340px] lg:h-[340px] flex items-center justify-center animate-[islandFloat_8s_ease-in-out_infinite] transition-all duration-300"
        >
          {/* Base Pixel Island */}
          <Image
            src={currentIsland.image}
            alt={currentIsland.name}
            fill
            priority
            sizes="(max-width: 640px) 260px, 340px"
            className="object-contain drop-shadow-[0_20px_40px_rgba(26,54,41,0.18)] select-none"
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
              className="pointer-events-none absolute -bottom-2 -left-2 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-radial from-cyan-400/30 via-blue-300/15 to-transparent mix-blend-screen animate-ping opacity-60"
            />
          )}

          {/* 3. Fuel Reactive Layer: Hearth Embers Glow */}
          {isFuelDone && (
            <div 
              aria-label="Fuel active"
              className="pointer-events-none absolute -top-1 right-4 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-radial from-orange-500/30 via-amber-300/15 to-transparent mix-blend-screen animate-pulse"
            />
          )}
        </div>

        {/* Natural Floating Ground Shadow */}
        <div className="w-[180px] sm:w-[220px] lg:w-[250px] h-3 sm:h-3.5 rounded-full bg-[#1A3629]/15 blur-[5px] animate-[shadowFloat_8s_ease-in-out_infinite] mt-2 pointer-events-none" />
      </div>

      {/* Integrated Sanctuary Console: Ambient Elemental Runes + Level Meter */}
      <div className="w-full max-w-sm flex flex-col items-center gap-2.5 mt-2 bg-[#FFFDF9] border border-[#1A3629]/15 rounded-2xl p-4 shadow-[0_8px_30px_rgba(26,54,41,0.04)]">
        {/* Elemental Runes */}
        <div className="flex items-center justify-center gap-2 w-full">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-sans transition-all duration-200 ${
            isSunlightDone
              ? 'bg-[#FEF3C7] border-[#D97706]/30 text-[#B45309] font-bold'
              : 'bg-[#FAF8F5] border-[#1A3629]/8 text-[#4A5D4E]/60'
          }`}>
            <Sun className="w-3.5 h-3.5" />
            <span>Light</span>
          </span>

          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-sans transition-all duration-200 ${
            isHydrationDone
              ? 'bg-[#E0F2FE] border-[#0284C7]/30 text-[#0369A1] font-bold'
              : 'bg-[#FAF8F5] border-[#1A3629]/8 text-[#4A5D4E]/60'
          }`}>
            <Droplets className="w-3.5 h-3.5" />
            <span>Water</span>
          </span>

          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-sans transition-all duration-200 ${
            isFuelDone
              ? 'bg-[#ECFDF5] border-[#10B981]/30 text-[#065F46] font-bold'
              : 'bg-[#FAF8F5] border-[#1A3629]/8 text-[#4A5D4E]/60'
          }`}>
            <Utensils className="w-3.5 h-3.5" />
            <span>Fuel</span>
          </span>
        </div>

        {/* Level XP Meter */}
        <div className="w-full flex flex-col gap-1 pt-2 border-t border-[#1A3629]/10">
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
      </div>
    </div>
  );
}
