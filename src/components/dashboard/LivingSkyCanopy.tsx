'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { useHabitStore } from '@/store/useHabitStore';
import { ISLAND_TIERS, getIslandTier } from '@/lib/progression/config';
import { calculateLevel } from '@/lib/progression/engine';
import { calculateCircadianStatus } from '@/lib/circadianEngine';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { Shield, Sun, Droplets, Utensils, Receipt, X } from 'lucide-react';

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

  const [isLoreOpen, setIsLoreOpen] = useState(false);

  const progress = useMemo(() => calculateLevel(totalXp), [totalXp]);
  const currentIsland = useMemo(() => getIslandTier(progress.level), [progress.level]);
  const nextIsland = useMemo(() => {
    return ISLAND_TIERS.find((t) => t.tier === currentIsland.tier + 1) || null;
  }, [currentIsland.tier]);

  const currentLog = getDailyLog(currentDate);

  // Reactive Habit States
  const isSunlightDone = !!currentLog.habitsCompleted?.['sunlight'];
  const isHydrationDone = (currentLog.hydrationLiters || 0) >= 2.0 || !!currentLog.habitsCompleted?.['hydration'];
  const isFuelDone = (currentLog.totalProteinLogged || 0) >= 100 || !!currentLog.habitsCompleted?.['protein_target'];

  const completedHabitsCount = (isSunlightDone ? 1 : 0) + (isHydrationDone ? 1 : 0) + (isFuelDone ? 1 : 0);

  // Circadian Sky Lighting Engine (Proposal A)
  const circadian = useMemo(() => {
    return calculateCircadianStatus({
      wakeTimeStr: userProfile?.wakeTime || '07:30',
      bedtimeTargetStr: userProfile?.bedTime || '23:30',
    });
  }, [userProfile?.wakeTime, userProfile?.bedTime]);

  const horizonAuraClass = useMemo(() => {
    const phaseId = circadian.currentPhase.id;
    if (phaseId === 'photonic_reset') {
      // Golden Peach Dawn
      return 'bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.22)_0%,_rgba(245,215,160,0.08)_45%,_transparent_75%)]';
    }
    if (phaseId === 'peak_clarity' || phaseId === 'secondary_focus') {
      // Crisp Zenith Sunlight
      return 'bg-[radial-gradient(circle_at_center,_rgba(245,215,160,0.20)_0%,_rgba(26,54,41,0.02)_55%,_transparent_75%)]';
    }
    if (phaseId === 'postprandial_dip' || phaseId === 'cortisol_winddown') {
      // Dusky Warm Amber
      return 'bg-[radial-gradient(circle_at_center,_rgba(217,119,6,0.18)_0%,_rgba(26,54,41,0.03)_50%,_transparent_75%)]';
    }
    // Melatonin Gate / Evening Starlight
    return 'bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.14)_0%,_rgba(26,54,41,0.04)_55%,_transparent_75%)]';
  }, [circadian.currentPhase.id]);

  const handleReentry = () => {
    retroAudio.playTierUpgrade();
    haptics.heavy();
    activateReentryProtocol(currentDate);
  };

  const handleOpenLore = () => {
    retroAudio.playInspectConfirm();
    haptics.tap();
    setIsLoreOpen(true);
  };

  return (
    <div
      id="living-island-stage"
      className="w-full relative flex flex-col items-center justify-center select-none py-2"
    >
      {/* Dynamic Circadian Horizon Aura Behind Island (Proposal A) */}
      <div 
        className={`pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[520px] lg:w-[640px] h-[400px] sm:h-[520px] lg:h-[640px] rounded-full ${horizonAuraClass} blur-2xl transition-all duration-1000`}
        aria-hidden="true"
      />

      {/* Sanctuary Stage Header */}
      <div className="relative z-20 flex flex-col items-center text-center gap-1 mb-2">
        <div className="flex items-center gap-2">
          <h2 className="font-cabinet font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#1A3629] tracking-tight">
            {currentIsland.name}
          </h2>
        </div>

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

      {/* Center Stage: Monumental Hero Pixel Island (Clickable for Lore Inspection - Proposal B) */}
      <div className="relative z-10 flex flex-col items-center justify-center my-2 sm:my-3">
        <button
          type="button"
          onClick={handleOpenLore}
          className="relative z-10 w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] md:w-[380px] md:h-[380px] lg:w-[400px] lg:h-[400px] xl:w-[460px] xl:h-[460px] 2xl:w-[500px] 2xl:h-[500px] flex items-center justify-center animate-[islandFloat_8s_ease-in-out_infinite] transition-all duration-300 cursor-pointer group focus:outline-none"
          title="Click to inspect island lore and ecosystem vitality"
        >
          {/* Base Pixel Island */}
          <Image
            src={currentIsland.image}
            alt={currentIsland.name}
            fill
            priority
            sizes="(max-width: 640px) 280px, (max-width: 1024px) 400px, 500px"
            className="object-contain drop-shadow-[0_25px_45px_rgba(26,54,41,0.20)] select-none group-hover:scale-102 transition-transform duration-300"
            style={{ imageRendering: 'pixelated' }}
          />
        </button>

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

      {/* Tactile Perforated Thermal Receipt Stub (Proposal C) */}
      {onOpenReceipt && (
        <button
          type="button"
          onClick={() => {
            retroAudio.playBlip();
            haptics.tap();
            onOpenReceipt();
          }}
          className="mt-3.5 inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border border-dashed border-[#1A3629]/25 bg-[#FFFDF9] hover:bg-[#1A3629] hover:text-[#FFFDF9] text-[#1A3629] shadow-2xs transition-all cursor-pointer group"
          title="Click to print and inspect daily thermal receipt"
        >
          <Receipt className="w-3.5 h-3.5 text-[#4A5D4E] group-hover:text-white" />
          <span className="font-mono text-xs font-bold tracking-tight">
            RECEIPT · {completedHabitsCount}/3 ANCHORS · {currentLog.totalProteinLogged || 0}g
          </span>
        </button>
      )}

      {/* Interactive Island Ecosystem Lore Modal (Proposal B) */}
      {isLoreOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-70 flex items-center justify-center p-4 sm:p-8 bg-[#1A3629]/50 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLoreOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-[#FFFDF9] border border-[#1A3629]/15 rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(26,54,41,0.20)] flex flex-col gap-5 relative">
            <button
              type="button"
              onClick={() => setIsLoreOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full border border-[#1A3629]/15 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Close island lore"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-20 h-20 relative shrink-0">
                <Image
                  src={currentIsland.image}
                  alt={currentIsland.name}
                  fill
                  className="object-contain select-none"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[11px] font-bold text-[#4A5D4E]">
                  Tier {currentIsland.tier} · Level {progress.level}
                </span>
                <h3 className="font-cabinet font-extrabold text-2xl text-[#1A3629] tracking-tight mt-0.5">
                  {currentIsland.name}
                </h3>
              </div>
            </div>

            <p className="font-sans text-xs text-[#4A5D4E] leading-relaxed">
              {currentIsland.description}
            </p>

            {/* Ecosystem Habitat Vitality */}
            <div className="flex flex-col gap-2 pt-3 border-t border-[#1A3629]/10">
              <span className="font-cabinet font-bold text-xs text-[#1A3629]">
                Sanctuary Habitat Vitality
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 ${
                  isSunlightDone ? 'bg-[#FEF3C7] border-[#D97706]/30 text-[#B45309]' : 'bg-[#FAF8F5] border-[#1A3629]/10 text-[#4A5D4E]/60'
                }`}>
                  <Sun className="w-4 h-4" />
                  <span className="font-cabinet font-bold text-[11px]">Canopy</span>
                  <span className="font-mono text-[9px]">{isSunlightDone ? 'Awakened' : 'Dormant'}</span>
                </div>
                <div className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 ${
                  isHydrationDone ? 'bg-[#E0F2FE] border-[#0284C7]/30 text-[#0369A1]' : 'bg-[#FAF8F5] border-[#1A3629]/10 text-[#4A5D4E]/60'
                }`}>
                  <Droplets className="w-4 h-4" />
                  <span className="font-cabinet font-bold text-[11px]">Stream</span>
                  <span className="font-mono text-[9px]">{isHydrationDone ? 'Flowing' : 'Dry'}</span>
                </div>
                <div className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 ${
                  isFuelDone ? 'bg-[#ECFDF5] border-[#10B981]/30 text-[#065F46]' : 'bg-[#FAF8F5] border-[#1A3629]/10 text-[#4A5D4E]/60'
                }`}>
                  <Utensils className="w-4 h-4" />
                  <span className="font-cabinet font-bold text-[11px]">Orchard</span>
                  <span className="font-mono text-[9px]">{isFuelDone ? 'Nourished' : 'Depleted'}</span>
                </div>
              </div>
            </div>

            {/* Next Tier Evolution Preview */}
            {nextIsland && (
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#1A3629]/10 flex items-center justify-between text-xs">
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] text-[#4A5D4E]">Next Evolution Tier</span>
                  <span className="font-cabinet font-bold text-[#1A3629]">{nextIsland.name}</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-[#1A3629] px-2.5 py-1 rounded bg-[#FFFDF9] border border-[#1A3629]/10">
                  Unlocks at Lv {nextIsland.minLevel}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
