'use client';

import React, { useState, useEffect } from 'react';
import { ISLAND_TIERS, IslandTier, getIslandTier, getNextIslandTier, xpToReachLevel } from '@/lib/progression/config';
import { retroAudio } from '@/lib/retroAudio';

interface IslandCenterStageProps {
  currentLevel: number;
  totalXp: number;
  progressPercent: number;
}

export function IslandCenterStage({ currentLevel, totalXp, progressPercent }: IslandCenterStageProps) {
  const currentIsland = getIslandTier(currentLevel);
  const nextIsland = getNextIslandTier(currentLevel);
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState(currentIsland.tier - 1);

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
      <div className="relative flex flex-col items-center justify-center w-full min-h-[380px] sm:min-h-[460px] md:min-h-[500px] lg:min-h-[520px]">
        {/* Soft Ambient Sky Glow */}
        <div className="absolute w-80 h-80 sm:w-[480px] sm:h-[480px] rounded-full bg-gradient-to-t from-[#A7F3D0]/25 via-[#FEF3C7]/20 to-transparent blur-3xl pointer-events-none" />

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

      {/* 2. Tactile Chevron Scrubber (‹ Phase N ›) */}
      <div className="flex items-center gap-3 my-4 z-10">
        <button
          type="button"
          onClick={prevPhase}
          aria-label="Previous Phase"
          className="w-9 h-9 rounded-full border-2 border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] flex items-center justify-center hover:bg-[#FAF6EE] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer font-bold text-base shadow-[2px_2px_0px_#1A3629]"
        >
          ‹
        </button>

        <div className="px-5 py-1.5 rounded-full border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-mono text-xs font-bold shadow-[2px_2px_0px_#3A6B52] flex items-center gap-2 tracking-wide">
          <span>Phase {displayedIsland.tier}</span>
          {!isUnlocked && <span className="text-[10px] text-[#A7F3D0] opacity-80 font-normal">[Locked]</span>}
        </div>

        <button
          type="button"
          onClick={nextPhase}
          aria-label="Next Phase"
          className="w-9 h-9 rounded-full border-2 border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] flex items-center justify-center hover:bg-[#FAF6EE] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer font-bold text-base shadow-[2px_2px_0px_#1A3629]"
        >
          ›
        </button>
      </div>

      {/* 3. Tactile Progress Bar Card in Cyath Style */}
      <div className="w-full max-w-2xl sm:max-w-3xl bg-[#FFFDF9] border-2 border-[#1A3629] rounded-2xl p-5 shadow-[3px_3px_0px_#1A3629] flex flex-col gap-3 mt-2 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md border border-[#1A3629] text-[10px] font-mono font-bold uppercase tracking-wider bg-[#FAF6EE] text-[#1A3629]">
              Phase {displayedIsland.tier}
            </span>
            <span className="font-fraunces font-bold text-base sm:text-lg text-[#1A3629] tracking-tight">
              {displayedIsland.name}
            </span>
          </div>
          <span className="font-mono text-xs sm:text-sm font-bold text-[#10B981] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#10B981]/30 tabular-nums">
            {totalXp >= 1000 ? `${(totalXp / 1000).toFixed(1)}K` : totalXp} XP / {nextTierXp >= 1000 ? `${(nextTierXp / 1000).toFixed(1)}K` : nextTierXp} XP
          </span>
        </div>

        {/* Tactile Progress Bar Track */}
        <div className="w-full h-4 sm:h-5 bg-[#EAE3D2] rounded-full overflow-hidden p-0.5 border-2 border-[#1A3629] shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#059669] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-[#1A3629]">
          <span className="font-bold tracking-tight">Level {currentLevel} Mastery</span>
          <span className="text-[#4A5D4E] tabular-nums">
            {nextIsland ? `Next Phase at Level ${nextIsland.minLevel} · ${xpRemaining.toLocaleString()} XP to evolve` : 'Pinnacle Evolution Reached'}
          </span>
        </div>
      </div>
    </div>
  );
}
