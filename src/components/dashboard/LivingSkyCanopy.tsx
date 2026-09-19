'use client';

import React, { useMemo, useState, useEffect } from 'react';
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

  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [hardwareDetails, setHardwareDetails] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedOverride = localStorage.getItem('cyath_low_power_island');
    if (savedOverride !== null) {
      const isManualLow = savedOverride === 'true';
      setIsLowEndDevice(isManualLow);
      if (isManualLow) {
        setHardwareDetails('Manual low-power mode active');
      }
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

      {/* Center Stage: Monumental Hero Island */}
      <div className="relative z-10 flex flex-col items-center justify-center my-2 sm:my-3">
        <div
          className="relative z-10 w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] md:w-[380px] md:h-[380px] lg:w-[400px] lg:h-[400px] xl:w-[460px] xl:h-[460px] 2xl:w-[500px] 2xl:h-[500px] flex items-center justify-center animate-[islandFloat_8s_ease-in-out_infinite] transition-all duration-300"
        >
          {isLowEndDevice ? (
            /* LOW END DEVICE FALLBACK: Pure high-res PNG without rot/SVG shader overhead */
            <Image
              src={currentIsland.image}
              alt={currentIsland.name}
              fill
              priority
              sizes="(max-width: 640px) 280px, (max-width: 1024px) 400px, 500px"
              className="object-contain drop-shadow-[0_25px_45px_rgba(26,54,41,0.20)] select-none"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            /* STANDARD / HIGH-END: Full Native SVG Vector Pipeline with feColorMatrix Rot Shaders & Kintsugi */
            <svg
              viewBox="0 0 800 800"
              className="w-full h-full drop-shadow-[0_25px_45px_rgba(26,54,41,0.20)] select-none"
              shapeRendering="crispEdges"
            >
              <defs>
                {/* Dormant / Mist Native SVG Pixel Shader */}
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

                {/* Embers Sunset Native SVG Pixel Shader */}
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

                {/* Kintsugi Gold Specular Shimmer */}
                <filter id="sanctuary-gold-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#F59E0B" floodOpacity="0.85" />
                </filter>
              </defs>

              {/* Base Island inside SVG */}
              <image
                href={currentIsland.image}
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

              {/* Native SVG Golden Kintsugi Fracture Lines */}
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

              {/* Native SVG Mist Vapor Layer */}
              {lifecycleState === 'mist' && (
                <g id="sanctuary-mist-overlay" opacity="0.65">
                  <rect x="180" y="580" width="440" height="24" rx="12" fill="#CBD5E1" opacity="0.35" />
                  <rect x="240" y="630" width="320" height="18" rx="9" fill="#E2E8F0" opacity="0.25" />
                </g>
              )}
            </svg>
          )}
        </div>

        {/* Natural Floating Ground Shadow */}
        <div className="w-[200px] sm:w-[280px] md:w-[320px] lg:w-[350px] xl:w-[380px] h-3.5 sm:h-4.5 rounded-full bg-[#1A3629]/15 blur-[6px] animate-[shadowFloat_8s_ease-in-out_infinite] mt-2 pointer-events-none" />

        {/* Low-End Device Status Text & Mode Switcher */}
        <div className="mt-2.5 flex items-center gap-2 font-mono text-[11px] text-[#4A5D4E]/80 flex-wrap justify-center">
          {isLowEndDevice ? (
            <span className="flex items-center gap-1.5 text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
              <span className="text-amber-600">●</span>
              <span>
                {hardwareDetails || 'Low-end device detected'} · Native PNG active (Rot shaders bypassed)
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[#065F46] bg-emerald-50 border border-[#10B981]/25 px-2.5 py-0.5 rounded-full">
              <span className="text-emerald-500">●</span>
              <span>Native SVG Pipeline · Color Matrix Rot &amp; Kintsugi Active</span>
            </span>
          )}

          <button
            type="button"
            onClick={toggleSpecMode}
            className="text-[10px] underline hover:text-[#1A3629] cursor-pointer text-[#4A5D4E]"
            title="Click to toggle between SVG Shader Mode and Low-End PNG Fallback"
          >
            {isLowEndDevice ? 'Force SVG Mode' : 'Simulate Low-Spec PNG'}
          </button>
        </div>
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
