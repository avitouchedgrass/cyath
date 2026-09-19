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
import { CorkboardBackdropSvg } from '@/components/dashboard/CorkboardBackdropSvg';

const SAWTOOTH_CLIP =
  'polygon(0% 0%, 100% 0%, 100% calc(100% - 6px), 95% 100%, 90% calc(100% - 6px), 85% 100%, 80% calc(100% - 6px), 75% 100%, 70% calc(100% - 6px), 65% 100%, 60% calc(100% - 6px), 55% 100%, 50% calc(100% - 6px), 45% 100%, 40% calc(100% - 6px), 35% 100%, 30% calc(100% - 6px), 25% 100%, 20% calc(100% - 6px), 15% 100%, 10% calc(100% - 6px), 5% 100%, 0% calc(100% - 6px))';

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
    <div className="relative w-full h-full flex flex-col justify-between py-1 px-1 sm:px-2 overflow-hidden rounded-3xl">
      {/* ------------------------------------------------------------- */}
      {/* Leftmost Sideways Toggle Arrow Handle */}
      {/* ------------------------------------------------------------- */}
      <button
        type="button"
        onClick={() => {
          retroAudio.playPaperRustle();
          haptics.tap();
          onToggleLedger();
        }}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-40 px-1.5 py-3 rounded-r-xl border-y border-r border-[#1A3629]/20 bg-[#FFFDF9]/90 hover:bg-[#1A3629] text-[#1A3629] hover:text-[#FFFDF9] shadow-2xs transition-all flex flex-col items-center gap-1 cursor-pointer group select-none backdrop-blur-xs"
        title={isLedgerOpen ? 'Slide back to Living Island (◀)' : 'Slide open 30-Day Guild Ledger (▶)'}
        aria-label={isLedgerOpen ? 'Close 30-Day Ledger' : 'Open 30-Day Ledger'}
      >
        <span className="font-mono text-xs font-bold transition-transform duration-200 group-hover:scale-110">
          {isLedgerOpen ? '◀' : '▶'}
        </span>
        <span className="[writing-mode:vertical-rl] font-cabinet font-extrabold text-[9px] tracking-wider uppercase opacity-70 group-hover:opacity-100">
          {isLedgerOpen ? 'Island' : 'Ledger'}
        </span>
      </button>

      {/* ------------------------------------------------------------- */}
      {/* VIEW B: Monumental Living Island (Default Unboxed View) */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full flex-1 flex flex-col justify-between gap-2">
        {/* Top: Compact Title (Streak pill removed per design directive) */}
        <div className="flex flex-col items-center text-center gap-1 pt-1">
          <h1 className="font-cabinet font-black text-xl sm:text-2xl lg:text-3xl tracking-tight text-[#1A3629]">
            {currentIsland.name}
          </h1>

          {/* Dormant Mist Banner if Streak Broken */}
          {streakCount === 0 && (
            <div className="mt-0.5 flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFDF9] border border-[#1A3629]/15 shadow-2xs">
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

        {/* Center: Ginormous Floating Island Graphic (Calibrated for zero-scroll fit) */}
        <div className="relative flex-1 flex flex-col items-center justify-center my-auto min-h-[260px] sm:min-h-[320px] lg:min-h-[380px] py-1">
          <div className="relative z-10 w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] md:w-[420px] md:h-[420px] lg:w-[460px] lg:h-[460px] xl:w-[500px] xl:h-[500px] 2xl:w-[540px] 2xl:h-[540px] max-w-full flex items-center justify-center animate-[islandFloat_8s_ease-in-out_infinite] transition-all duration-300">
            {isLowEndDevice ? (
              <Image
                src={currentIsland.pngImage || currentIsland.image}
                alt={currentIsland.name}
                fill
                priority
                sizes="(max-width: 640px) 280px, (max-width: 1024px) 460px, 540px"
                className="object-contain drop-shadow-[0_20px_32px_rgba(26,54,41,0.16)] select-none"
                style={{ imageRendering: 'pixelated' }}
              />
            ) : (
              <svg
                viewBox="0 0 800 800"
                className="w-full h-full drop-shadow-[0_20px_32px_rgba(26,54,41,0.16)] select-none"
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
          <div className="relative flex flex-col items-center justify-center -mt-4 sm:-mt-6 pointer-events-none animate-[shadowFloat_8s_ease-in-out_infinite]">
            <div className="w-[240px] sm:w-[320px] md:w-[380px] lg:w-[420px] xl:w-[460px] 2xl:w-[500px] h-3.5 rounded-full bg-[#1A3629]/10" />
            <div className="w-[160px] sm:w-[220px] md:w-[260px] lg:w-[290px] xl:w-[320px] 2xl:w-[350px] h-2.5 rounded-full bg-[#1A3629]/16 -mt-2.5" />
            <div className="w-[90px] sm:w-[130px] md:w-[150px] lg:w-[170px] xl:w-[190px] 2xl:w-[210px] h-1.5 rounded-full bg-[#1A3629]/24 -mt-1.5" />
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
              onClick={() => {
                retroAudio.playPaperRustle();
                haptics.tap();
                onToggleLedger();
              }}
              className="font-cabinet font-bold text-[#1A3629] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>30-Day Ledger ({pinnedCount}/30)</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* VIEW A: Sliding 30-Day Guild Ledger Drawer with Paper Texture */}
      {/* Slides from the left and covers the island as a whole */}
      {/* ------------------------------------------------------------- */}
      <div
        className={`absolute inset-0 z-30 transition-transform duration-300 ease-in-out ${
          isLedgerOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'
        }`}
      >
        <div className="w-full h-full min-h-[540px] bg-[#3D2E24] border-4 border-[#241A13] rounded-3xl p-4 sm:p-6 shadow-[0_24px_60px_rgba(10,7,5,0.45)] flex flex-col justify-between relative overflow-hidden">
          {/* Custom Corkboard Backdrop SVG for Rich Tactile Texture */}
          <CorkboardBackdropSvg />

          {/* Ledger Header */}
          <div className="relative z-10 flex items-center justify-between pb-3 border-b-2 border-[#3D2E24]/20">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#2B1F17] bg-[#FFFDF9]/95 border-2 border-[#2B1F17]/20 px-3 py-1 rounded-full shadow-2xs">
                {pinnedCount} of 30 Sealed
              </span>
              {isForgedStreak && (
                <span className="font-mono text-[10px] font-bold text-[#1E3A8A] bg-blue-100/95 border-2 border-blue-300 px-2.5 py-0.5 rounded-full">
                  Kintsugi Active
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                retroAudio.playPaperRustle();
                haptics.tap();
                onToggleLedger();
              }}
              className="h-8 px-3.5 rounded-full border-2 border-[#241A13] bg-[#FFFDF9] hover:bg-[#241A13] hover:text-[#FFFDF9] text-[#241A13] font-cabinet font-bold text-xs transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <span>Return to Island</span>
              <span className="text-[10px]">✕</span>
            </button>
          </div>

          {/* 30-Day Receipt Grid on Cork Board */}
          <div className="relative z-10 flex-1 flex flex-col justify-center my-2">
            <div className="p-3 sm:p-4 rounded-2xl bg-[#B8A994]/80 border-2 border-[#3D2E24]/35 shadow-[inset_0_4px_16px_rgba(43,31,23,0.3)] grid grid-cols-5 sm:grid-cols-6 gap-2 sm:gap-2.5 backdrop-blur-[0.5px]">
              {rollingDays.map((slot) => {
                const naturalTilt = ((slot.dayNumber % 5) - 2) * 0.75;
                return (
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
                    style={{
                      clipPath: SAWTOOTH_CLIP,
                      transform: `rotate(${naturalTilt}deg)`,
                    }}
                    className={`aspect-[4/5] rounded-xs border flex flex-col items-center justify-between p-1 sm:p-1.5 transition-all duration-150 cursor-pointer text-center relative select-none ${
                      slot.isSealed
                        ? 'border-[#2B1F17]/30 bg-[#FFFDF7] hover:border-[#1A3629] shadow-[0_2px_6px_rgba(0,0,0,0.15)] hover:scale-105 hover:rotate-0'
                        : slot.isToday
                        ? 'border-[#2B1F17]/40 bg-[#FFFDF9]/85 hover:bg-[#FFFDF9]'
                        : 'border-[#2B1F17]/15 bg-[#FAF8F5]/60 hover:bg-[#FAF8F5]'
                    }`}
                    title={`${slot.dateStr}: ${slot.isSealed ? 'Sealed (Click to view receipt)' : 'Unsealed'}`}
                  >
                    <span className={`font-mono text-[9px] sm:text-[10px] font-bold ${slot.isToday ? 'text-[#1A3629]' : 'text-[#2B1F17]/70'}`}>
                      {slot.dayNumber}
                    </span>

                    <div className="flex-1 flex items-center justify-center my-0.5">
                      {slot.isSealed ? (
                        <div className="transform scale-90 sm:scale-100">
                          <PixelWaxSeal size={18} />
                        </div>
                      ) : (
                        <span className="text-[8px] font-mono text-[#2B1F17]/30">
                          {slot.isToday ? 'Today' : ''}
                        </span>
                      )}
                    </div>

                    <span className="text-[7px] sm:text-[8px] font-mono text-[#2B1F17]/60 uppercase">
                      {slot.isSealed ? 'Done' : 'Open'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ledger Footer */}
          <div className="relative z-10 flex items-center justify-between pt-2 border-t-2 border-[#3D2E24]/20 text-xs font-sans text-[#433226]">
            <span>Click any sealed day to inspect receipt</span>
            <button
              type="button"
              onClick={() => {
                retroAudio.playPaperRustle();
                haptics.tap();
                onToggleLedger();
              }}
              className="font-cabinet font-bold text-[#2B1F17] hover:underline cursor-pointer"
            >
              Back to Living Island →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
