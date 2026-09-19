'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { useHabitStore } from '@/store/useHabitStore';
import { ISLAND_TIERS, getIslandTier } from '@/lib/progression/config';
import { calculateLevel } from '@/lib/progression/engine';
import { formatLocalDate } from '@/lib/dateUtils';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { PixelWaxSeal } from '@/components/dashboard/PixelWaxSeal';

export type IslandLifecycleState = 'active' | 'embers' | 'mist' | 'dormant';

interface SanctuaryObservatoryProps {
  isLedgerOpen: boolean;
  onToggleLedger: () => void;
  onOpenReceipt: () => void;
  justSealedDate?: string | null;
}

export function SanctuaryObservatory({
  isLedgerOpen,
  onToggleLedger,
  onOpenReceipt,
  justSealedDate = null,
}: SanctuaryObservatoryProps) {
  const {
    totalXp,
    currentDate,
    getDailyLog,
    streakCount,
    isForgedStreak,
    activateReentryProtocol,
    isLedgerSealedByDate,
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

  const lifecycleState: IslandLifecycleState = useMemo(() => {
    if (streakCount === 0) return 'mist';
    if (completedHabitsCount === 0) return 'embers';
    return 'active';
  }, [streakCount, completedHabitsCount]);

  const [isLowEndDevice, setIsLowEndDevice] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedOverride = localStorage.getItem('cyath_low_power_island');
    if (savedOverride !== null) {
      setIsLowEndDevice(savedOverride === 'true');
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
    retroAudio.playTierUpgrade();
    haptics.heavy();
    activateReentryProtocol();
  };

  const pinnedCount = Object.values(isLedgerSealedByDate).filter(Boolean).length;

  // Rolling 30 days calculation for the in-place ledger
  const todayStr = formatLocalDate();
  const rollingDays = useMemo(() => {
    const list = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = formatLocalDate(d);
      const isSealed = !!isLedgerSealedByDate[dateStr];
      const log = getDailyLog(dateStr);
      list.push({
        dateStr,
        dayNumber: d.getDate(),
        isToday: dateStr === todayStr,
        isSealed,
        isForged: !!log.isForgedReentry,
      });
    }
    return list;
  }, [isLedgerSealedByDate, getDailyLog, todayStr]);

  return (
    <div className="w-full h-full min-h-[580px] bg-[#FFFDF9] border border-[#1A3629]/15 rounded-3xl p-5 sm:p-7 shadow-[0_8px_32px_rgba(26,54,41,0.04)] flex flex-col justify-between relative overflow-hidden">
      
      {/* ------------------------------------------------------------- */}
      {/* VIEW A: In-Place 30-Day Guild Ledger Overlay */}
      {/* ------------------------------------------------------------- */}
      {isLedgerOpen ? (
        <div className="w-full flex-1 flex flex-col justify-between gap-4 animate-in fade-in duration-200">
          {/* Ledger Header with Switched Layout */}
          <div className="flex items-center justify-between pb-3 border-b border-[#1A3629]/10">
            {/* Top-Left: # of 30 Sealed Badge */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#1A3629] bg-[#FAF8F5] border border-[#1A3629]/15 px-3 py-1 rounded-full shadow-2xs">
                {pinnedCount} of 30 Sealed
              </span>
              {isForgedStreak && (
                <span className="font-mono text-[10px] font-bold text-[#B45309] bg-[#FFFBEB] border border-[#D97706]/30 px-2 py-0.5 rounded-md">
                  Kintsugi Active
                </span>
              )}
            </div>

            {/* Top-Right: Closing Trigger */}
            <button
              type="button"
              onClick={onToggleLedger}
              className="h-8 px-3.5 rounded-full border border-[#1A3629]/20 bg-[#FFFDF9] hover:bg-[#1A3629] hover:text-[#FFFDF9] text-[#1A3629] font-cabinet font-bold text-xs transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
            >
              <span>Return to Sanctuary</span>
              <span className="text-[10px]">✕</span>
            </button>
          </div>

          {/* 30-Day Grid */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="p-3 sm:p-4 rounded-2xl bg-[#FAF8F5] border border-[#1A3629]/12 grid grid-cols-5 sm:grid-cols-6 gap-2 sm:gap-2.5">
              {rollingDays.map((slot) => (
                <button
                  key={slot.dateStr}
                  type="button"
                  onClick={() => {
                    if (slot.isSealed) {
                      retroAudio.playInspectConfirm();
                      haptics.tap();
                      onOpenReceipt();
                    } else {
                      retroAudio.playBlip();
                    }
                  }}
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-between p-1.5 transition-all duration-150 cursor-pointer text-center relative ${
                    slot.isSealed
                      ? 'border-[#1A3629]/30 bg-[#FFFDF9] hover:border-[#1A3629] shadow-2xs hover:scale-105'
                      : slot.isToday
                      ? 'border-[#1A3629]/40 bg-[#FFFDF9]/60 hover:bg-[#FFFDF9]'
                      : 'border-[#1A3629]/8 bg-[#FAF8F5]/60 hover:bg-[#FAF8F5]'
                  }`}
                  title={`${slot.dateStr}: ${slot.isSealed ? 'Sealed (Click to view receipt)' : 'Unsealed'}`}
                >
                  <span className={`font-mono text-[10px] font-bold ${slot.isToday ? 'text-[#1A3629]' : 'text-[#4A5D4E]/70'}`}>
                    {slot.dayNumber}
                  </span>

                  <div className="flex-1 flex items-center justify-center my-0.5">
                    {slot.isSealed ? (
                      <div className="transform scale-90">
                        <PixelWaxSeal size={20} />
                      </div>
                    ) : (
                      <span className="text-[9px] font-mono text-[#1A3629]/20">
                        {slot.isToday ? 'Today' : ''}
                      </span>
                    )}
                  </div>

                  <span className="text-[8px] font-mono text-[#4A5D4E]/60 uppercase">
                    {slot.isSealed ? 'Done' : 'Open'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Ledger Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-[#1A3629]/10 text-xs font-sans text-[#4A5D4E]">
            <span>Click any sealed day to inspect thermal receipt</span>
            <button
              type="button"
              onClick={onToggleLedger}
              className="font-cabinet font-bold text-[#1A3629] hover:underline cursor-pointer"
            >
              Back to Living Island →
            </button>
          </div>
        </div>
      ) : (
        /* ------------------------------------------------------------- */
        /* VIEW B: Monumental Floating Island (Default) */
        /* ------------------------------------------------------------- */
        <div className="w-full flex-1 flex flex-col justify-between gap-4 animate-in fade-in duration-200">
          
          {/* Top: Title above island + Streak just below */}
          <div className="flex flex-col items-center text-center gap-1.5 pt-1">
            <h1 className="font-cabinet font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight text-[#1A3629]">
              {currentIsland.name}
            </h1>

            {/* Streak just below the title */}
            <div
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAF8F5] border border-[#1A3629]/15 shadow-2xs"
              title={`${streakCount} Day Habit Momentum Streak`}
            >
              <div className="w-3.5 h-3.5 relative">
                <Image
                  src={isForgedStreak ? '/assets/trophies/flame_iron.png' : '/assets/trophies/flame_normal.png'}
                  alt="Streak Flame"
                  fill
                  className="object-contain select-none"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <span className="font-cabinet font-extrabold text-xs text-[#1A3629]">
                {streakCount} {streakCount === 1 ? 'Day' : 'Days'} {isForgedStreak ? 'Forged' : 'Streak'}
              </span>
              {isForgedStreak && (
                <span className="font-mono text-[9px] font-bold text-[#1E3A8A] bg-blue-100 px-1 py-0.2 rounded border border-blue-200">
                  Kintsugi
                </span>
              )}
            </div>

            {/* Dormant Mist Banner if Streak Broken */}
            {streakCount === 0 && (
              <div className="mt-1 flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFDF9] border border-[#1A3629]/15 shadow-2xs">
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
          </div>

          {/* Center: Monumental Floating Island Graphic */}
          <div className="relative flex-1 flex flex-col items-center justify-center my-auto min-h-[300px]">
            <div className="relative z-10 w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] md:w-[420px] md:h-[420px] lg:w-[460px] lg:h-[460px] xl:w-[500px] xl:h-[500px] flex items-center justify-center animate-[islandFloat_8s_ease-in-out_infinite] transition-all duration-300">
              {isLowEndDevice ? (
                <Image
                  src={currentIsland.pngImage || currentIsland.image}
                  alt={currentIsland.name}
                  fill
                  priority
                  sizes="(max-width: 640px) 280px, (max-width: 1024px) 420px, 500px"
                  className="object-contain drop-shadow-[0_16px_28px_rgba(26,54,41,0.14)] select-none"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <svg
                  viewBox="0 0 800 800"
                  className="w-full h-full drop-shadow-[0_16px_28px_rgba(26,54,41,0.14)] select-none"
                  shapeRendering="crispEdges"
                >
                  <defs>
                    <filter id="sanctuary-rot-dormant" colorInterpolationFilters="sRGB">
                      <feColorMatrix
                        type="matrix"
                        values="
                          0.42 0.38 0.20 0 0
                          0.32 0.48 0.20 0 0
                          0.30 0.30 0.40 0 0
                          0    0    0    1 0"
                      />
                    </filter>
                    <filter id="sanctuary-rot-embers" colorInterpolationFilters="sRGB">
                      <feColorMatrix
                        type="matrix"
                        values="
                          1.18 0.05 0.00 0 0.02
                          0.08 0.96 0.00 0 0.00
                          0.04 0.04 0.78 0 0.00
                          0    0    0    1 0"
                      />
                    </filter>
                    <filter id="sanctuary-gold-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#F59E0B" floodOpacity="0.85" />
                    </filter>
                  </defs>

                  <image
                    href={currentIsland.svgImage || currentIsland.image}
                    width="800"
                    height="800"
                    filter={
                      lifecycleState === 'mist'
                        ? 'url(#sanctuary-rot-dormant)'
                        : lifecycleState === 'embers'
                        ? 'url(#sanctuary-rot-embers)'
                        : undefined
                    }
                    style={{ imageRendering: 'pixelated' }}
                  />

                  {(isForgedStreak || streakCount >= 5) && (
                    <g id="kintsugi-gold-seams" filter="url(#sanctuary-gold-glow)">
                      <path
                        d="M370 520 L410 575 L395 640 L425 700 M410 575 L470 595 L520 635 M395 640 L345 675 L315 725"
                        stroke="#F59E0B"
                        strokeWidth="5"
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                        fill="none"
                      />
                      <path
                        d="M370 520 L410 575 L395 640 L425 700 M410 575 L470 595 L520 635 M395 640 L345 675 L315 725"
                        stroke="#FFFBEB"
                        strokeWidth="2"
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                        fill="none"
                      />
                    </g>
                  )}
                </svg>
              )}
            </div>

            {/* Stepped Pixel Ground Shadow */}
            <div className="relative flex flex-col items-center justify-center -mt-3 pointer-events-none animate-[shadowFloat_8s_ease-in-out_infinite]">
              <div className="w-[240px] sm:w-[320px] md:w-[380px] xl:w-[440px] h-3.5 rounded-full bg-[#1A3629]/10" />
              <div className="w-[160px] sm:w-[220px] md:w-[270px] xl:w-[310px] h-2.5 rounded-full bg-[#1A3629]/18 -mt-2.5" />
              <div className="w-[90px] sm:w-[130px] md:w-[160px] xl:w-[180px] h-1.5 rounded-full bg-[#1A3629]/25 -mt-1.5" />
            </div>
          </div>

          {/* Bottom: Current Tier and Level above Progress Bar */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-[#1A3629]/10">
            <div className="flex items-baseline justify-between">
              {/* Tier with a teeny tiny bit less contrast */}
              <span className="font-cabinet font-semibold text-xs sm:text-sm text-[#4A5D4E]">
                Tier {currentIsland.tier}
              </span>

              {/* Level with bold contrast emphasis */}
              <span className="font-cabinet font-black text-base sm:text-lg text-[#1A3629]">
                Level {progress.level}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-[#1A3629]/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1A3629] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress.progressPercent))}%` }}
              />
            </div>

            {/* Progress XP details + Quick Ledger Toggle */}
            <div className="flex items-center justify-between font-mono text-[11px] text-[#4A5D4E]">
              <span>{progress.currentLevelXp} / {progress.xpForNextLevel} XP</span>
              <button
                type="button"
                onClick={onToggleLedger}
                className="font-cabinet font-bold text-[#1A3629] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>30-Day Ledger ({pinnedCount}/30)</span>
                <span>→</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
