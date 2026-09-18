'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { useHabitStore } from '@/store/useHabitStore';
import { getIslandTier } from '@/lib/progression/config';
import { calculateLevel } from '@/lib/progression/engine';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { Shield, Sun, Droplets, Utensils, Receipt } from 'lucide-react';

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
    activateReentryProtocol,
  } = useHabitStore();

  const progress = useMemo(() => calculateLevel(totalXp), [totalXp]);
  const currentIsland = useMemo(() => getIslandTier(progress.level), [progress.level]);
  const currentLog = getDailyLog(currentDate);

  // Reactive Habit States
  const isSunlightDone = !!currentLog.habitsCompleted?.['sunlight'];
  const isHydrationDone = (currentLog.hydrationLiters || 0) >= 2.0 || !!currentLog.habitsCompleted?.['hydration'];
  const isFuelDone = (currentLog.totalProteinLogged || 0) >= 100 || !!currentLog.habitsCompleted?.['protein_target'];

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
      {/* Soft Ethereal Horizon Glow Behind Island */}
      <div 
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[520px] lg:w-[640px] h-[400px] sm:h-[520px] lg:h-[640px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(245,215,160,0.18)_0%,_rgba(26,54,41,0.02)_55%,_transparent_75%)] blur-2xl"
        aria-hidden="true"
      />

      {/* Sanctuary Stage Header */}
      <div className="relative z-20 flex flex-col items-center text-center gap-1 mb-2">
        <h2 className="font-cabinet font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#1A3629] tracking-tight">
          {currentIsland.name}
        </h2>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFFDF9] border border-[#1A3629]/15 text-[#1A3629] font-sans text-xs shadow-2xs">
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

      {/* Center Stage: Monumental Hero Pixel Island */}
      <div className="relative z-10 flex flex-col items-center justify-center my-2 sm:my-3">
        <div
          className="relative z-10 w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] md:w-[380px] md:h-[380px] lg:w-[400px] lg:h-[400px] xl:w-[460px] xl:h-[460px] 2xl:w-[500px] 2xl:h-[500px] flex items-center justify-center animate-[islandFloat_8s_ease-in-out_infinite] transition-all duration-300"
        >
          {/* Base Pixel Island */}
          <Image
            src={currentIsland.image}
            alt={currentIsland.name}
            fill
            priority
            sizes="(max-width: 640px) 280px, (max-width: 1024px) 400px, 500px"
            className="object-contain drop-shadow-[0_25px_45px_rgba(26,54,41,0.20)] select-none"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* Natural Floating Ground Shadow */}
        <div className="w-[200px] sm:w-[280px] md:w-[320px] lg:w-[350px] xl:w-[380px] h-3.5 sm:h-4.5 rounded-full bg-[#1A3629]/15 blur-[6px] animate-[shadowFloat_8s_ease-in-out_infinite] mt-2 pointer-events-none" />
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

      {/* Thermal Receipt Anchor Below Sanctuary */}
      {onOpenReceipt && (
        <button
          type="button"
          onClick={() => {
            retroAudio.playBlip();
            haptics.tap();
            onOpenReceipt();
          }}
          className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#1A3629]/15 bg-[#FFFDF9] hover:bg-[#1A3629] hover:text-[#FFFDF9] text-[#1A3629] font-cabinet font-bold text-xs shadow-2xs transition-all cursor-pointer group"
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Thermal Daily Receipt</span>
        </button>
      )}
    </div>
  );
}

