'use client';

import React, { useState, useEffect } from 'react';
import { ISLAND_TIERS, IslandTier, getIslandTier, getNextIslandTier, xpToReachLevel } from '@/lib/progression/config';
import { retroAudio } from '@/lib/retroAudio';
import { LivingEmberCanopy } from './LivingEmberCanopy';
import { useHabitStore } from '@/store/useHabitStore';
import { calculateSanctuaryMatrix } from '@/lib/sanctuaryMatrixEngine';

interface IslandCenterStageProps {
  currentLevel: number;
  totalXp: number;
  progressPercent: number;
}

export function IslandCenterStage({ currentLevel, totalXp, progressPercent }: IslandCenterStageProps) {
  const currentIsland = getIslandTier(currentLevel);
  const nextIsland = getNextIslandTier(currentLevel);
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState(currentIsland.tier - 1);

  const { currentDate, getDailyLog, userProfile, dailyProtocolsAcceptedByDate, deskRitualsByDate } =
    useHabitStore();
  const currentLog = getDailyLog(currentDate);
  const protocolAccepted = !!dailyProtocolsAcceptedByDate[currentDate];
  const sunlightDone = !!currentLog.habitsCompleted['sunlight'];
  const deskRitual = deskRitualsByDate[currentDate];
  const targetProtein = userProfile?.weightKg ? Math.round(userProfile.weightKg * 2.0) : 140;
  const targetHydration = userProfile?.weightKg ? Number((userProfile.weightKg * 0.04).toFixed(1)) : 2.5;

  const matrix = calculateSanctuaryMatrix({
    sleepHours: currentLog.sleepHours || 7.5,
    restedRating: deskRitual?.morningRestedRating,
    energyLevel: currentLog.energyLevel,
    totalProteinLogged: currentLog.totalProteinLogged,
    targetProtein,
    hydrationLiters: currentLog.hydrationLiters,
    targetHydration,
    protocolAccepted,
    sunlightDone,
    caffeineCutoffRespected: deskRitual?.eveningWrapCompleted,
    slumpScore: deskRitual?.afternoonSlumpScore,
  });

  const isRestorativeSleep = matrix.hearth.score >= 70;
  const isAtmosphereClear = matrix.atmosphere.score >= 60;

  // Preload remaining island tier assets progressively during idle time
  useEffect(() => {
    const preloader = () => {
      ISLAND_TIERS.forEach((tier) => {
        const img = new Image();
        img.src = tier.image;
      });
    };

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        const id = (window as any).requestIdleCallback(preloader, { timeout: 2000 });
        return () => (window as any).cancelIdleCallback(id);
      } else {
        const timer = setTimeout(preloader, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const displayedIsland = ISLAND_TIERS[selectedPhaseIndex] || currentIsland;
  const isUnlocked = currentLevel >= displayedIsland.minLevel;

  const prevPhase = () => {
    retroAudio.playBlip();
    setSelectedPhaseIndex((prev) => (prev > 0 ? prev - 1 : ISLAND_TIERS.length - 1));
  };

  const nextPhase = () => {
    retroAudio.playBlip();
    setSelectedPhaseIndex((prev) => (prev < ISLAND_TIERS.length - 1 ? prev + 1 : 0));
  };

  // XP threshold math for current island tier
  const nextTierXp = nextIsland ? xpToReachLevel(nextIsland.minLevel) : xpToReachLevel(50);
  const xpRemaining = Math.max(0, nextTierXp - totalXp);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* 1. Free-floating Pixel Island on Cyath Canvas */}
      <div className="relative flex flex-col items-center justify-center w-full min-h-[380px] sm:min-h-[460px] md:min-h-[500px] lg:min-h-[520px] overflow-hidden">
        {/* Dynamic Ambient Sky Glow linked to Biological Matrix */}
        <div
          className={`absolute w-80 h-80 sm:w-[480px] sm:h-[480px] rounded-full blur-3xl pointer-events-none transition-colors duration-1000 ${
            isRestorativeSleep
              ? 'bg-gradient-to-t from-[#A7F3D0]/30 via-[#FEF3C7]/25 to-transparent'
              : 'bg-gradient-to-t from-[#94A3B8]/25 via-[#CBD5E1]/20 to-transparent'
          }`}
        />

        {/* Ambient Spore & Ember Canopy Canvas */}
        <LivingEmberCanopy
          className="absolute inset-0 pointer-events-none z-0 opacity-70"
          intensity={matrix.canopy.score >= 80 ? 'high' : 'ambient'}
        />

        {/* Atmospheric Mist Layer when circadian synchronization is low */}
        {!isAtmosphereClear && (
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#E2E8F0]/30 to-transparent pointer-events-none z-0" />
        )}

        {/* Floating Island Asset with Idle Float Keyframe */}
        <div className="relative z-10 w-[300px] sm:w-[420px] md:w-[480px] lg:w-[520px] xl:w-[560px] max-w-full aspect-square flex items-center justify-center animate-[islandFloat_8s_ease-in-out_infinite] cursor-default group/island">
          {/* Interactive Frame with Hover Lift and Right-Click Protection Shield */}
          <div
            className="relative w-full h-full flex items-center justify-center transition-transform duration-500 hover:scale-[1.04] select-none"
            onContextMenu={(e) => e.preventDefault()}
          >
            {ISLAND_TIERS.map((tier, index) => {
              const isSelected = index === selectedPhaseIndex;
              const isTierUnlocked = currentLevel >= tier.minLevel;

              return (
                <div
                  key={tier.tier}
                  aria-hidden={!isSelected}
                  className={`absolute inset-0 w-full h-full flex items-center justify-center transition-all duration-300 ease-out select-none pointer-events-none ${
                    isSelected
                      ? 'opacity-100 scale-100 z-10'
                      : 'opacity-0 scale-95 z-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={tier.image}
                    alt={`${tier.name} - Tier ${tier.tier} Floating Sanctuary Island`}
                    draggable={false}
                    loading={isSelected ? 'eager' : 'lazy'}
                    decoding="async"
                    // @ts-ignore
                    fetchPriority={isSelected ? 'high' : 'low'}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src.includes('.webp')) {
                        target.src = target.src.replace('.webp', '.png');
                      }
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                    className={`w-full h-full object-contain [image-rendering:pixelated] drop-shadow-[0_24px_30px_rgba(26,54,41,0.22)] select-none pointer-events-none transition-all duration-300 ${
                      !isTierUnlocked
                        ? 'grayscale contrast-125 opacity-60'
                        : 'opacity-100 group-hover/island:brightness-105'
                    }`}
                  />
                </div>
              );
            })}

            {/* Shield overlay preventing right-click save, copy, or drag */}
            <div
              className="absolute inset-0 z-20 select-none cursor-default"
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Soft ground shadow beneath floating island, synchronized with island float */}
        <div className="w-56 sm:w-72 md:w-84 h-5 rounded-full bg-[#1A3629]/16 blur-md mt-2 animate-[shadowFloat_8s_ease-in-out_infinite]" />
      </div>

      {/* 2. Integrated Sanctuary Stage Pedestal (Scrubber + Precision Progress Bar) */}
      <div className="w-full max-w-2xl bg-[#FFFDF9] border-2 border-[#1A3629] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#1A3629] flex flex-col gap-3.5 mt-3 z-10">
        {/* Phase Header & Tactile Scrubber */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevPhase}
              aria-label="Previous Sanctuary Phase"
              className="w-8 h-8 rounded-lg border-2 border-[#1A3629] bg-[#FAF8F5] text-[#1A3629] flex items-center justify-center hover:bg-[#EAE3D2] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer font-bold text-sm shadow-[1px_1px_0px_#1A3629]"
            >
              ‹
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E]">
                  Phase {displayedIsland.tier}
                </span>
                {!isUnlocked && (
                  <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 rounded border border-[#C9A84C]/50 bg-[#FEF3C7] text-[#92400E] font-bold">
                    Locked
                  </span>
                )}
              </div>
              <h3 className="font-fraunces font-bold text-base sm:text-lg text-[#1A3629] tracking-tight leading-none mt-0.5">
                {displayedIsland.name}
              </h3>
            </div>

            <button
              type="button"
              onClick={nextPhase}
              aria-label="Next Sanctuary Phase"
              className="w-8 h-8 rounded-lg border-2 border-[#1A3629] bg-[#FAF8F5] text-[#1A3629] flex items-center justify-center hover:bg-[#EAE3D2] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer font-bold text-sm shadow-[1px_1px_0px_#1A3629]"
            >
              ›
            </button>
          </div>

          <div className="shrink-0">
            <span className="font-mono text-xs font-bold text-[#1A3629] bg-[#F4EFE6] px-3 py-1 rounded-full border border-[#1A3629]/20 tabular-nums">
              {totalXp >= 1000 ? `${(totalXp / 1000).toFixed(1)}K` : totalXp} / {nextTierXp >= 1000 ? `${(nextTierXp / 1000).toFixed(1)}K` : nextTierXp} XP
            </span>
          </div>
        </div>

        {/* Precision Progress Track */}
        <div className="w-full h-2.5 bg-[#EAE3D2] rounded-full overflow-hidden border border-[#1A3629]/20">
          <div
            className="h-full bg-[#1A3629] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Level Progression Metadata */}
        <div className="flex items-center justify-between text-xs font-mono text-[#1A3629]">
          <span className="font-bold tracking-tight">Level {currentLevel}</span>
          <span className="text-[#4A5D4E] tabular-nums text-[11px]">
            {nextIsland ? `Level ${nextIsland.minLevel} Evolution · ${xpRemaining.toLocaleString()} XP to evolve` : 'Apex Sanctuary Reached'}
          </span>
        </div>
      </div>
    </div>
  );
}
