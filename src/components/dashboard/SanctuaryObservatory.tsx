'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { useHabitStore } from '@/store/useHabitStore';
import { ISLAND_TIERS, getIslandTier } from '@/lib/progression/config';
import { calculateLevel } from '@/lib/progression/engine';
import { calculateCircadianStatus } from '@/lib/circadianEngine';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { PixelWaxSeal } from '@/components/dashboard/PixelWaxSeal';
import { EveningSealButton } from '@/components/dashboard/EveningSealButton';
import { Sun, Sparkles, Clock, Compass } from 'lucide-react';

export type IslandLifecycleState = 'active' | 'embers' | 'mist' | 'dormant';

interface SanctuaryObservatoryProps {
  onOpenSchedule: () => void;
  onOpenReceipt: () => void;
  onOpenCorkboard: (sealedDate?: string) => void;
}

export function SanctuaryObservatory({
  onOpenSchedule,
  onOpenReceipt,
  onOpenCorkboard,
}: SanctuaryObservatoryProps) {
  const {
    totalXp,
    currentDate,
    getDailyLog,
    streakCount,
    isForgedStreak,
    userProfile,
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

  const wakeTime = userProfile?.wakeTime || '07:30';
  const bedTime = userProfile?.bedTime || '23:30';

  const circadian = useMemo(() => {
    return calculateCircadianStatus({
      wakeTimeStr: wakeTime,
      bedtimeTargetStr: bedTime,
    });
  }, [wakeTime, bedTime]);

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

  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [hardwareDetails, setHardwareDetails] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedOverride = localStorage.getItem('cyath_low_power_island');
    if (savedOverride !== null) {
      const isManualLow = savedOverride === 'true';
      setIsLowEndDevice(isManualLow);
      if (isManualLow) setHardwareDetails('Manual low-power mode active');
      return;
    }

    const cores = navigator.hardwareConcurrency || 8;
    const memory = (navigator as any).deviceMemory || 8;
    const isLowCores = cores <= 4;
    const isLowMemory = memory < 4;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isLowCores || isLowMemory || prefersReducedMotion) {
      setIsLowEndDevice(true);
      const reason = isLowCores && isLowMemory
        ? `Low-spec device (${cores} cores, ${memory}GB RAM)`
        : isLowCores
        ? `Low-spec device (${cores} CPU cores)`
        : isLowMemory
        ? `Low-spec device (${memory}GB RAM)`
        : 'Reduced motion preference active';
      setHardwareDetails(reason);
    }
  }, []);

  const toggleSpecMode = () => {
    const next = !isLowEndDevice;
    setIsLowEndDevice(next);
    localStorage.setItem('cyath_low_power_island', next ? 'true' : 'false');
    setHardwareDetails(next ? 'Manual low-power mode active' : null);
  };

  const handleReentry = () => {
    retroAudio.playTierUpgrade();
    haptics.heavy();
    activateReentryProtocol();
  };

  const pinnedCount = Object.values(isLedgerSealedByDate).filter(Boolean).length;

  return (
    <section 
      aria-label="Sanctuary Observatory"
      className="relative w-full rounded-3xl bg-[#FFFDF9]/85 border border-[#1A3629]/15 p-5 sm:p-7 xl:p-8 backdrop-blur-md shadow-[0_8px_32px_rgba(26,54,41,0.04)] overflow-hidden"
    >
      {/* Dynamic Circadian Horizon Aura */}
      <div
        className={`pointer-events-none absolute -inset-20 rounded-full blur-3xl opacity-60 transition-all duration-1000 ${horizonAuraClass}`}
        aria-hidden="true"
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-6 xl:gap-8 items-center">
        
        {/* ========================================================================= */}
        {/* BAY 1 (Left, col-span-3): Circadian Chrono-Compass */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 flex flex-col gap-3.5 order-2 lg:order-1">
          <div className="flex items-center justify-between pb-2 border-b border-[#1A3629]/10">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#1A3629]" />
              <h2 className="font-cabinet font-extrabold text-sm text-[#1A3629] tracking-tight">
                Circadian Compass
              </h2>
            </div>
            <button
              type="button"
              onClick={onOpenSchedule}
              className="text-[10px] font-mono font-bold text-[#4A5D4E] hover:text-[#1A3629] underline cursor-pointer"
              title="Calibrate circadian wake and bed hours"
            >
              Calibrate
            </button>
          </div>

          {/* Active Phase Card with Solar Arc Indicator */}
          <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#1A3629]/12 shadow-2xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E] flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                Active Biological Phase
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            
            <span className="font-cabinet font-extrabold text-base text-[#1A3629] tracking-tight">
              {circadian.currentPhase.name}
            </span>
            
            <p className="font-sans text-xs text-[#4A5D4E] leading-relaxed">
              {circadian.currentPhase.hourlyDirective}
            </p>

            {/* Micro 24-Hour Solar Timeline Ribbon */}
            <div className="mt-1 pt-2 border-t border-[#1A3629]/8 flex flex-col gap-1">
              <div className="flex items-center justify-between font-mono text-[10px] text-[#4A5D4E]">
                <span>Phase Window</span>
                <span className="font-bold text-[#1A3629]">{circadian.currentPhase.timeRange}</span>
              </div>
              <div className="w-full h-1.5 bg-[#FAF8F5] border border-[#1A3629]/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500/80 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(10, circadian.alertnessScore))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Schedule Window */}
          <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#1A3629]/10 flex flex-col gap-1 text-xs">
            <div className="flex items-center justify-between font-mono text-[11px] text-[#1A3629]">
              <span className="flex items-center gap-1.5 font-semibold text-[#4A5D4E]">
                <Clock className="w-3 h-3 text-[#1A3629]/60" /> Schedule Window
              </span>
              <span className="font-bold">{wakeTime} to {bedTime}</span>
            </div>
          </div>

          {/* Streak Momentum Status */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#1A3629]/12 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 relative">
                <Image
                  src={isForgedStreak ? '/assets/trophies/flame_iron.png' : '/assets/trophies/flame_normal.png'}
                  alt="Streak Flame"
                  fill
                  className="object-contain select-none"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <span className="font-cabinet font-extrabold text-xs text-[#1A3629]">
                {streakCount} {streakCount === 1 ? 'Day' : 'Days'} Momentum
              </span>
            </div>
            {isForgedStreak && (
              <span 
                className="font-mono text-[9px] font-bold text-[#1E3A8A] bg-blue-100 px-1.5 py-0.5 rounded cursor-help border border-blue-200"
                title="Kintsugi repair active: momentum preserved"
              >
                Kintsugi
              </span>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BAY 2 (Center, col-span-6): The Monumental Floating Island Hero */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center text-center order-1 lg:order-2">
          
          {/* Biome Name & Level Header */}
          <div className="flex flex-col items-center gap-1 mb-1">
            <span className="font-mono text-[9.5px] uppercase tracking-widest text-[#1A3629]/50 select-none">
              Sanctuary Meridian · Sector 01
            </span>

            <h1 className="font-cabinet font-black text-3xl sm:text-4xl xl:text-5xl tracking-tight text-[#1A3629] drop-shadow-xs">
              {currentIsland.name}
            </h1>

            <div className="flex items-center gap-2 mt-0.5 flex-wrap justify-center">
              <span
                title="Tier = island biome stage (10 total). Level = your XP rank within this tier."
                className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FFFDF9] border border-[#1A3629]/15 text-[#1A3629] shadow-2xs cursor-help"
              >
                Tier {currentIsland.tier} · Level {progress.level}
              </span>
              <span className="font-mono text-xs font-bold text-[#065F46] bg-[#ECFDF5] border border-[#10B981]/25 px-2.5 py-0.5 rounded-full">
                ● {streakCount}d Momentum
              </span>
            </div>

            {/* Environmental Narrative Lore */}
            <p className="font-sans text-xs sm:text-sm text-[#4A5D4E] max-w-md mt-1 leading-relaxed">
              {currentIsland.description}
            </p>

            {/* Dormant Mist Banner if Streak Broken */}
            {streakCount === 0 && (
              <div className="mt-1.5 flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#FFFDF9] border border-[#1A3629]/15 shadow-sm">
                <span className="font-sans text-xs text-[#4A5D4E]">
                  Sanctuary in Dormant Mist
                </span>
                <button
                  type="button"
                  onClick={handleReentry}
                  className="px-2.5 py-1 rounded-lg bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs hover:bg-[#2C4A3B] transition-colors cursor-pointer"
                >
                  Forged Re-Entry
                </button>
              </div>
            )}
          </div>

          {/* Floating Island Graphic with Authentic Shaders */}
          <div className="relative flex flex-col items-center justify-center my-2 sm:my-3">
            <div className="relative z-10 w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px] lg:w-[340px] lg:h-[340px] xl:w-[370px] xl:h-[370px] flex items-center justify-center animate-[islandFloat_8s_ease-in-out_infinite] transition-all duration-300">
              {isLowEndDevice ? (
                <Image
                  src={currentIsland.pngImage || currentIsland.image}
                  alt={currentIsland.name}
                  fill
                  priority
                  sizes="(max-width: 640px) 240px, (max-width: 1024px) 320px, 370px"
                  className="object-contain drop-shadow-[0_12px_20px_rgba(26,54,41,0.12)] select-none"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <svg
                  viewBox="0 0 800 800"
                  className="w-full h-full drop-shadow-[0_12px_20px_rgba(26,54,41,0.12)] select-none"
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

                  {lifecycleState === 'mist' && (
                    <g id="sanctuary-mist-overlay" opacity="0.65">
                      <rect x="180" y="580" width="440" height="24" rx="12" fill="#CBD5E1" opacity="0.35" />
                      <rect x="240" y="630" width="320" height="18" rx="9" fill="#E2E8F0" opacity="0.25" />
                    </g>
                  )}
                </svg>
              )}
            </div>

            {/* Stepped Pixel Ground Shadow */}
            <div className="relative flex flex-col items-center justify-center -mt-2 pointer-events-none animate-[shadowFloat_8s_ease-in-out_infinite]">
              <div className="w-[180px] sm:w-[240px] md:w-[270px] h-3 rounded-full bg-[#1A3629]/10" />
              <div className="w-[120px] sm:w-[160px] md:w-[190px] h-2 rounded-full bg-[#1A3629]/18 -mt-2.5" />
              <div className="w-[70px] sm:w-[90px] md:w-[110px] h-1 rounded-full bg-[#1A3629]/25 -mt-1.5" />
            </div>

            {isLowEndDevice && (
              <div className="mt-2 flex items-center gap-2 font-mono text-[10px] text-amber-900 bg-amber-50/90 border border-amber-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                <span>Low-power mode · PNG active</span>
                <button
                  type="button"
                  onClick={toggleSpecMode}
                  className="underline hover:text-amber-950 cursor-pointer font-bold"
                >
                  Force SVG
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BAY 3 (Right, col-span-3): Evolution & Guild Closure Station */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 flex flex-col gap-3.5 order-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1A3629]/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1A3629]" />
              <h2 className="font-cabinet font-extrabold text-sm text-[#1A3629] tracking-tight">
                Sanctuary Evolution
              </h2>
            </div>
            <span className="font-mono text-[10px] text-[#4A5D4E]">
              Tier {currentIsland.tier} of 10
            </span>
          </div>

          {/* Level XP Progress Bar */}
          <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#1A3629]/12 shadow-2xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-cabinet font-extrabold text-xs text-[#1A3629]">
                Level {progress.level} Evolution
              </span>
              <span className="font-mono text-xs font-bold text-[#1A3629]">
                {Math.round(progress.progressPercent)}%
              </span>
            </div>
            
            <div className="w-full h-2 bg-[#FAF8F5] border border-[#1A3629]/12 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-[#1A3629] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress.progressPercent))}%` }}
              />
            </div>

            <div className="flex items-center justify-between font-mono text-[10px] text-[#4A5D4E]">
              <span>Current Level Progress</span>
              <span>{progress.currentLevelXp} / {progress.xpForNextLevel} XP</span>
            </div>

            {nextIsland && (
              <div className="pt-2 border-t border-[#1A3629]/8 flex items-center justify-between text-[11px]">
                <span className="font-sans text-[#4A5D4E]">Next Biome</span>
                <span className="font-cabinet font-bold text-[#1A3629]">{nextIsland.name} (Lv {nextIsland.minLevel})</span>
              </div>
            )}
          </div>

          {/* 30-Day Guild Ledger Tile */}
          <button
            type="button"
            onClick={() => {
              retroAudio.playPaperRustle();
              haptics.tap();
              onOpenCorkboard();
            }}
            className="w-full p-3 rounded-2xl bg-[#FFFDF9] border border-[#1A3629]/12 shadow-2xs hover:border-[#1A3629]/30 hover:shadow-xs transition-all flex items-center justify-between cursor-pointer group text-left active:scale-[0.99]"
            title="Inspect 30-Day Guild Wax-Seal Ledger (Hotkey L)"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#F4F0EA] border border-[#1A3629]/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <PixelWaxSeal size={18} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-cabinet font-bold text-xs text-[#1A3629]">
                  30-Day Guild Ledger
                </span>
                <span className="font-mono text-[10px] text-[#4A5D4E]">
                  {pinnedCount} of 30 Seals Pinned
                </span>
              </div>
            </div>
            <span className="font-mono text-[11px] font-bold text-[#1A3629] group-hover:translate-x-0.5 transition-transform shrink-0">
              Board (L) →
            </span>
          </button>

          {/* Evening Seal Ceremony Station */}
          <EveningSealButton
            onOpenReceipt={onOpenReceipt}
            onOpenCorkboard={onOpenCorkboard}
          />
        </div>

      </div>
    </section>
  );
}
