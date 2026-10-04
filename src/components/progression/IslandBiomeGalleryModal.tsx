'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
  ISLAND_SUITES,
  IslandSuiteId,
  IslandTier,
  xpToReachLevel,
} from '@/lib/progression/config';
import { calculateLevel } from '@/lib/progression/engine';
import { retroAudio } from '@/lib/retroAudio';
import { useHabitStore } from '@/store/useHabitStore';
import {
  PixelX,
  PixelChevronLeft,
  PixelChevronRight,
  PixelLock,
  PixelCheck,
  PixelSparkles,
} from '@/components/common/PixelIcons';

interface IslandBiomeGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: number;
  totalXp: number;
}

export function IslandBiomeGalleryModal({
  isOpen,
  onClose,
  currentLevel,
  totalXp,
}: IslandBiomeGalleryModalProps) {
  const [mounted, setMounted] = useState(false);
  const { userProfile, updateUserProfile, suiteXp } = useHabitStore();

  const userActiveSuite: IslandSuiteId =
    (userProfile?.selectedIslandSuite as IslandSuiteId) ||
    (userProfile?.archetype as IslandSuiteId) ||
    'circadian';

  const [selectedSuite, setSelectedSuite] = useState<IslandSuiteId>(userActiveSuite);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const currentSuiteMeta = ISLAND_SUITES[selectedSuite] || ISLAND_SUITES.circadian;
  const currentSuiteTiers = currentSuiteMeta.tiers;

  const suiteProgress = calculateLevel(totalXp);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update selectedSuite if user profile changes
  useEffect(() => {
    if (isOpen) {
      setSelectedSuite(userActiveSuite);
    }
  }, [isOpen, userActiveSuite]);

  // Set initial selected index to the user's current tier for this suite on open or suite change
  useEffect(() => {
    if (isOpen) {
      const lvl = calculateLevel(totalXp).level;
      let activeIndex = 0;
      for (let i = currentSuiteTiers.length - 1; i >= 0; i--) {
        if (lvl >= currentSuiteTiers[i].minLevel) {
          activeIndex = i;
          break;
        }
      }
      setSelectedIndex(activeIndex);
    }
  }, [isOpen, selectedSuite, totalXp, currentSuiteTiers]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        retroAudio.playBlip();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : currentSuiteTiers.length - 1));
      } else if (e.key === 'ArrowRight') {
        retroAudio.playBlip();
        setSelectedIndex((prev) => (prev < currentSuiteTiers.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, currentSuiteTiers.length]);

  if (!isOpen || !mounted) return null;

  const currentTier: IslandTier = currentSuiteTiers[selectedIndex] || currentSuiteTiers[0];
  const isUnlocked = suiteProgress.level >= currentTier.minLevel;
  const xpNeeded = xpToReachLevel(currentTier.minLevel);
  const xpRemaining = Math.max(0, xpNeeded - totalXp);
  const isSuiteActive = selectedSuite === userActiveSuite;

  const prevBiome = () => {
    retroAudio.playBlip();
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : currentSuiteTiers.length - 1));
  };

  const nextBiome = () => {
    retroAudio.playBlip();
    setSelectedIndex((prev) => (prev < currentSuiteTiers.length - 1 ? prev + 1 : 0));
  };

  const handleSetActiveSuite = () => {
    retroAudio.playInspectConfirm();
    updateUserProfile({ selectedIslandSuite: selectedSuite });
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A3629]/50 backdrop-blur-md animate-in fade-in"
    >
      <div className="relative w-full max-w-2xl bg-[#FFFDF9] border border-[#1A3629]/20 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(26,54,41,0.22)] flex flex-col gap-5 max-h-[94vh] overflow-y-auto selection:bg-[#1A3629] selection:text-[#FFFDF9]">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#1A3629]/10 gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1A3629]/60">
              SANCTUARY ARCHIVE &middot; TIER {currentTier.tier} OF {currentSuiteTiers.length}
            </span>
            <h2 className="font-cabinet font-extrabold text-2xl sm:text-3xl text-[#1A3629] tracking-tight mt-0.5">
              Island Biome Gallery
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#1A3629]/15 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-colors flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <PixelX size={14} />
          </button>
        </div>

        {/* 3-Way Suite Switcher Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-1.5 rounded-2xl bg-[#F4EDE0]/60 border border-[#1A3629]/15">
          <div className="grid grid-cols-3 gap-1.5 flex-1">
            {(Object.keys(ISLAND_SUITES) as IslandSuiteId[]).map((suiteKey) => {
              const suite = ISLAND_SUITES[suiteKey];
              const isSelected = selectedSuite === suiteKey;
              const isCurrentActive = userActiveSuite === suiteKey;
              const sLevel = suiteProgress.level;

              return (
                <button
                  key={suiteKey}
                  type="button"
                  onClick={() => {
                    retroAudio.playBlip();
                    setSelectedSuite(suiteKey);
                    setSelectedIndex(0);
                  }}
                  className={`py-2 px-2 rounded-xl text-center font-cabinet font-bold text-xs transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                    isSelected
                      ? 'bg-[#FFFDF9] text-[#1A3629] shadow-xs border border-[#1A3629]/20'
                      : 'text-[#4A5D4E] hover:text-[#1A3629] hover:bg-[#FFFDF9]/40'
                  }`}
                >
                  <span className="truncate max-w-full">{suite.name.replace('The ', '')}</span>
                  <span className="text-[9px] font-mono font-medium opacity-75">
                    {isCurrentActive ? '● Active · ' : ''}Lvl {sLevel}
                  </span>
                </button>
              );
            })}
          </div>

          {!isSuiteActive && (
            <button
              type="button"
              onClick={handleSetActiveSuite}
              className="py-2 px-3 rounded-xl bg-[#1A3629] text-[#FFFDF9] hover:bg-[#2C4A3B] transition-all font-cabinet font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
            >
              <PixelSparkles size={12} color="#FFFDF9" />
              <span>Set as Active Sanctuary</span>
            </button>
          )}
        </div>

        {/* Center Stage: Floating Island Showcase with Arrow Controls */}
        <div className="relative w-full flex flex-col items-center justify-center min-h-[300px] sm:min-h-[360px] py-4 bg-gradient-to-b from-[#FAF8F5] to-[#F4F0EA]/80 rounded-2xl border border-[#1A3629]/8 overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="pointer-events-none absolute w-72 h-72 rounded-full bg-[#1A3629]/5 blur-3xl" />

          {/* Left Arrow */}
          <button
            type="button"
            onClick={prevBiome}
            aria-label="Previous island biome"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-[#1A3629]/15 bg-[#FFFDF9]/90 backdrop-blur-xs text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
          >
            <PixelChevronLeft size={16} />
          </button>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={nextBiome}
            aria-label="Next island biome"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-[#1A3629]/15 bg-[#FFFDF9]/90 backdrop-blur-xs text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
          >
            <PixelChevronRight size={16} />
          </button>

          {/* Floating Island Asset */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div
              key={currentTier.tier}
              className={`relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center animate-[islandFloat_8s_ease-in-out_infinite] transition-all duration-300 ${
                !isUnlocked ? 'filter contrast-75 brightness-75' : ''
              }`}
            >
              <Image
                src={currentTier.image}
                alt={currentTier.name}
                fill
                priority
                sizes="256px"
                className="object-contain drop-shadow-[0_16px_25px_rgba(0,0,0,0.18)] select-none"
                style={{ imageRendering: 'pixelated' }}
              />

              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#1A3629]/25 backdrop-blur-[2px] rounded-3xl">
                  <div className="w-12 h-12 rounded-full bg-[#FFFDF9] border border-[#1A3629]/20 flex items-center justify-center shadow-md">
                    <PixelLock size={20} className="text-[#1A3629]" />
                  </div>
                </div>
              )}
            </div>

            {/* Floating Ground Shadow */}
            <div className="w-36 sm:w-48 h-3 rounded-full bg-[#1A3629]/15 blur-[4px] animate-[shadowFloat_8s_ease-in-out_infinite] mt-2 pointer-events-none" />
          </div>

          {/* Tier Name & Lore Card */}
          <div className="relative z-20 flex flex-col items-center text-center px-4 mt-3 max-w-md">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-[#1A3629] px-2.5 py-0.5 rounded-full bg-[#FFFDF9] border border-[#1A3629]/10">
                Tier {currentTier.tier}
              </span>

              {isUnlocked ? (
                <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#065F46] bg-[#ECFDF5] border border-[#10B981]/30 px-2.5 py-0.5 rounded-full">
                  <PixelCheck size={12} color="#065F46" />
                  <span>Unlocked &middot; Lvl {currentTier.minLevel}+ (Current: Lvl {suiteProgress.level})</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#991B1B] bg-[#FEF2F2] border border-[#EF4444]/30 px-2.5 py-0.5 rounded-full">
                  <PixelLock size={12} color="#991B1B" />
                  <span>Unlocks at Level {currentTier.minLevel} ({xpRemaining} XP away)</span>
                </span>
              )}
            </div>

            <h3 className="font-cabinet font-extrabold text-xl sm:text-2xl text-[#1A3629]">
              {currentTier.name}
            </h3>
            <p className="font-sans text-xs sm:text-sm text-[#4A5D4E] mt-1 leading-relaxed">
              {currentTier.description}
            </p>
          </div>
        </div>

        {/* Thumbnail Selector Strip (Tiers 1-10) */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A3629]/60">
            SANCTUARY TIERS
          </span>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
            {currentSuiteTiers.map((tier, idx) => {
              const unlocked = suiteProgress.level >= tier.minLevel;
              const isSelected = selectedIndex === idx;

              return (
                <button
                  key={tier.tier}
                  type="button"
                  onClick={() => {
                    retroAudio.playBlip();
                    setSelectedIndex(idx);
                  }}
                  className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] shadow-xs scale-105'
                      : unlocked
                      ? 'border-[#1A3629]/15 bg-[#FAF8F5] text-[#1A3629] hover:border-[#1A3629]/40'
                      : 'border-[#1A3629]/10 bg-[#FAF8F5]/50 text-[#1A3629]/40 hover:bg-[#FAF8F5]'
                  }`}
                  title={`${tier.name} (Tier ${tier.tier})`}
                >
                  <div className="w-7 h-7 relative flex items-center justify-center">
                    <Image
                      src={tier.image}
                      alt={tier.name}
                      fill
                      sizes="32px"
                      className={`object-contain select-none ${!unlocked ? 'opacity-30' : ''}`}
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                  <span className="font-mono text-[10px] font-bold">
                    T{tier.tier}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
