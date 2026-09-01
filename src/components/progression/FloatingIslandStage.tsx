'use client';

import React, { useState, useEffect } from 'react';
import { ISLAND_TIERS, IslandTier, getIslandTier, getNextIslandTier } from '@/lib/progression/config';
import { retroAudio } from '@/lib/retroAudio';

interface FloatingIslandStageProps {
  currentLevel: number;
}

export function FloatingIslandStage({ currentLevel }: FloatingIslandStageProps) {
  const currentIsland = getIslandTier(currentLevel);
  const nextIsland = getNextIslandTier(currentLevel);
  const [inspectedTier, setInspectedTier] = useState<IslandTier | null>(null);

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

  const displayedIsland = inspectedTier || currentIsland;
  const isUnlocked = currentLevel >= displayedIsland.minLevel;
  const isCurrent = displayedIsland.tier === currentIsland.tier;

  return (
    <div className="relative w-full border-2 border-[#1A3629] bg-gradient-to-b from-[#FFFDF9] to-[#F7F3EA] shadow-[3px_3px_0px_#1A3629] rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-between overflow-hidden">
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between z-10 border-b border-[#1A3629]/10 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#D97706] bg-[#FEF3C7] px-2.5 py-0.5 rounded-full border border-[#D97706]/30">
            Tier {displayedIsland.tier} of {ISLAND_TIERS.length}
          </span>
          {isCurrent && (
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#10B981]/30">
              Active Sanctuary
            </span>
          )}
          {!isUnlocked && (
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E] bg-[#EAE3D2] px-2 py-0.5 rounded-full">
              Unlocks at Level {displayedIsland.minLevel}
            </span>
          )}
        </div>

        {inspectedTier && inspectedTier.tier !== currentIsland.tier && (
          <button
            type="button"
            onClick={() => {
              retroAudio.playBlip();
              setInspectedTier(null);
            }}
            className="text-xs font-mono font-bold text-[#1A3629] hover:underline cursor-pointer"
          >
            ← View My Active Sanctuary
          </button>
        )}
      </div>

      {/* Center Stage: Floating Island with Very Subtle Float Animation */}
      <div className="relative my-6 sm:my-8 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[380px] w-full">
        {/* Soft Ambient Horizon Glow */}
        <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-t from-[#FEF3C7]/40 to-transparent blur-3xl pointer-events-none" />

        {/* Floating Island Asset with Transition Layers and Right-Click Protection */}
        <div 
          className="relative z-10 w-64 sm:w-84 md:w-96 max-w-full aspect-square flex items-center justify-center animate-[islandFloat_8s_ease-in-out_infinite] transition-transform duration-500 select-none"
          onContextMenu={(e) => e.preventDefault()}
        >
          {ISLAND_TIERS.map((tier) => {
            const isSelected = tier.tier === displayedIsland.tier;
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
                  alt={tier.name}
                  draggable={false}
                  loading={isSelected ? 'eager' : 'lazy'}
                  decoding="async"
                  // @ts-ignore
                  fetchPriority={isSelected ? 'high' : 'low'}
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  className={`w-full h-full object-contain [image-rendering:pixelated] drop-shadow-[0_12px_16px_rgba(26,54,41,0.12)] select-none pointer-events-none transition-all duration-300 ${
                    !isTierUnlocked ? 'grayscale contrast-125 opacity-70' : 'opacity-100'
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

        {/* Inverse scaling soft ground cloud shadow beneath the floating island */}
        <div className="w-44 sm:w-60 h-4 rounded-full bg-[#1A3629]/10 blur-sm mt-1 transition-all" />
      </div>

      {/* Island Description & Details */}
      <div className="z-10 text-center max-w-md flex flex-col items-center gap-1.5 mb-6">
        <h2 className="font-fraunces font-black text-2xl sm:text-3xl text-[#1A3629] tracking-tight">
          {displayedIsland.name}
        </h2>
        <p className="font-sans text-xs sm:text-sm text-[#4A5D4E] leading-relaxed">
          {displayedIsland.description}
        </p>
      </div>

      {/* Minimalist 10-Tier Scrubber Strip */}
      <div className="w-full z-10 pt-5 border-t border-[#1A3629]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 max-w-full">
          {ISLAND_TIERS.map((tier) => {
            const unlocked = currentLevel >= tier.minLevel;
            const active = displayedIsland.tier === tier.tier;

            return (
              <button
                key={tier.tier}
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  setInspectedTier(tier);
                }}
                className={`w-8 h-8 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                  active
                    ? 'bg-[#1A3629] text-[#FFFDF9] shadow-[2px_2px_0px_#1A3629] -translate-y-0.5'
                    : unlocked
                    ? 'bg-[#FAF6EE] text-[#1A3629] border border-[#1A3629]/30 hover:border-[#1A3629]'
                    : 'bg-[#F4EDE0]/50 text-[#4A5D4E] border border-[#1A3629]/20'
                }`}
                title={`${tier.name} (Level ${tier.minLevel}+)`}
              >
                {tier.tier}
              </button>
            );
          })}
        </div>

        <div className="font-mono text-xs text-[#4A5D4E] shrink-0">
          {nextIsland ? (
            <span>Next Evolution: <strong className="text-[#1A3629]">Level {nextIsland.minLevel}</strong></span>
          ) : (
            <span className="text-[#10B981] font-bold">Max Evolution Reached</span>
          )}
        </div>
      </div>
    </div>
  );
}
