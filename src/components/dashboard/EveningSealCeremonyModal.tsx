'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { formatLocalDate } from '@/lib/dateUtils';
import { calculateLevel } from '@/lib/progression/engine';
import { getIslandTier } from '@/lib/progression/config';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { xpParticleEmitter } from '@/lib/particleEmitter';
import { PixelWaxSeal } from '@/components/dashboard/PixelWaxSeal';
import { X, Sparkles } from 'lucide-react';

export interface EveningSealCeremonyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (sealedDate: string) => void;
}

type CeremonyStage = 'ROLLING' | 'READY' | 'CHARGING' | 'STAMPED' | 'PINNING';

const SAWTOOTH_CLIP =
  'polygon(0% 0%, 100% 0%, 100% calc(100% - 8px), 97.5% 100%, 95% calc(100% - 8px), 92.5% 100%, 90% calc(100% - 8px), 87.5% 100%, 85% calc(100% - 8px), 82.5% 100%, 80% calc(100% - 8px), 77.5% 100%, 75% calc(100% - 8px), 72.5% 100%, 70% calc(100% - 8px), 67.5% 100%, 65% calc(100% - 8px), 62.5% 100%, 60% calc(100% - 8px), 57.5% 100%, 55% calc(100% - 8px), 52.5% 100%, 50% calc(100% - 8px), 47.5% 100%, 45% calc(100% - 8px), 42.5% 100%, 40% calc(100% - 8px), 37.5% 100%, 35% calc(100% - 8px), 32.5% 100%, 30% calc(100% - 8px), 27.5% 100%, 25% calc(100% - 8px), 22.5% 100%, 20% calc(100% - 8px), 17.5% 100%, 15% calc(100% - 8px), 12.5% 100%, 10% calc(100% - 8px), 7.5% 100%, 5% calc(100% - 8px), 2.5% 100%, 0% calc(100% - 8px))';

export function EveningSealCeremonyModal({
  isOpen,
  onClose,
  onComplete,
}: EveningSealCeremonyModalProps) {
  const {
    currentDate,
    getDailyLog,
    totalXp,
    streakCount,
    isForgedStreak,
    userProfile,
    sealDailyLedger,
  } = useHabitStore();

  const [stage, setStage] = useState<CeremonyStage>('ROLLING');
  const [chargeProgress, setChargeProgress] = useState(0); // 0 to 100
  const [isDeskShaking, setIsDeskShaking] = useState(false);

  const chargeAnimRef = useRef<number | null>(null);
  const chargeStartRef = useRef<number | null>(null);
  const stampZoneRef = useRef<HTMLDivElement | null>(null);

  const targetDate = currentDate || formatLocalDate();
  const currentLog = getDailyLog(targetDate);
  const progress = calculateLevel(totalXp);
  const currentIsland = getIslandTier(progress.level);

  const targetProtein = userProfile?.weightKg ? Math.round(userProfile.weightKg * 2.0) : 140;
  const isSunlightDone = !!currentLog.habitsCompleted?.['sunlight'];
  const proteinLogged = currentLog.totalProteinLogged || 0;
  const hydrationLogged = (currentLog.hydrationLiters || 0).toFixed(1);

  // Initialize stage and trigger paper feed audio
  useEffect(() => {
    if (!isOpen) {
      setStage('ROLLING');
      setChargeProgress(0);
      setIsDeskShaking(false);
      return;
    }

    setStage('ROLLING');
    setChargeProgress(0);
    setIsDeskShaking(false);

    // Audio cue: register motor ticks as paper feeds
    retroAudio.playPaperFeedTicks();
    retroAudio.playPaperRustle();

    const rolloutTimer = setTimeout(() => {
      setStage('READY');
      retroAudio.playBlip();
    }, 850);

    return () => clearTimeout(rolloutTimer);
  }, [isOpen]);

  // Execute the seal impact ceremony
  const triggerSealImpact = useCallback(() => {
    setStage('STAMPED');
    retroAudio.stopWaxHeatHum();
    retroAudio.playWaxStampThump();
    setIsDeskShaking(true);
    haptics.heavy();

    // Golden XP Ember particle fireworks
    if (stampZoneRef.current) {
      const rect = stampZoneRef.current.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;
      xpParticleEmitter.emit(originX, originY, 35);
    }

    // Call state store mutation: seals day, logs +50 XP
    sealDailyLedger(targetDate);

    // After 1.2s, transition to PINNING and open the 30-Day Ledger Corkboard
    setTimeout(() => {
      setStage('PINNING');
      retroAudio.playPaperRustle();
      setTimeout(() => {
        onComplete(targetDate);
      }, 400);
    }, 1250);
  }, [sealDailyLedger, targetDate, onComplete]);

  // Press-and-hold animation loop (~750ms charge time)
  const stepCharge = useCallback(
    (timestamp: number) => {
      if (!chargeStartRef.current) chargeStartRef.current = timestamp;
      const elapsed = timestamp - chargeStartRef.current;
      const progressPercent = Math.min(100, (elapsed / 750) * 100);

      setChargeProgress(progressPercent);

      if (progressPercent >= 100) {
        chargeAnimRef.current = null;
        triggerSealImpact();
      } else {
        chargeAnimRef.current = requestAnimationFrame(stepCharge);
      }
    },
    [triggerSealImpact]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    if (stage !== 'READY' && stage !== 'CHARGING') return;
    e.preventDefault();
    setStage('CHARGING');
    chargeStartRef.current = null;
    retroAudio.startWaxHeatHum();
    haptics.tap();
    chargeAnimRef.current = requestAnimationFrame(stepCharge);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (stage !== 'CHARGING') return;
    e.preventDefault();
    if (chargeAnimRef.current) {
      cancelAnimationFrame(chargeAnimRef.current);
      chargeAnimRef.current = null;
    }
    retroAudio.stopWaxHeatHum();
    retroAudio.playStampClink();
    setChargeProgress(0);
    setStage('READY');
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-80 flex items-center justify-center p-3 sm:p-6 bg-[#0E1A14]/85 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && stage !== 'CHARGING' && stage !== 'STAMPED') {
          onClose();
        }
      }}
    >
      {/* Scribe's Solid Dark Oak Desk Chassis */}
      <div
        className={`w-full max-w-[420px] bg-[#342419] border-4 border-[#1E140E] rounded-3xl p-5 sm:p-7 shadow-[0_35px_90px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.1)] flex flex-col items-center relative overflow-hidden my-auto ${
          isDeskShaking ? 'animate-[deskRumble_0.4s_ease-out]' : ''
        }`}
      >
        {/* Pixel Brass Corner Plates */}
        <div className="absolute top-2 left-2 pointer-events-none">
          <svg width="24" height="24" viewBox="0 0 24 24" shapeRendering="crispEdges">
            <rect x="0" y="0" width="20" height="3" fill="#F59E0B" />
            <rect x="0" y="3" width="16" height="3" fill="#D97706" />
            <rect x="0" y="6" width="12" height="3" fill="#B45309" />
            <rect x="0" y="9" width="8" height="3" fill="#78350F" />
            <rect x="4" y="4" width="3" height="3" fill="#241A13" />
          </svg>
        </div>
        <div className="absolute top-2 right-2 pointer-events-none">
          <svg width="24" height="24" viewBox="0 0 24 24" shapeRendering="crispEdges">
            <rect x="4" y="0" width="20" height="3" fill="#F59E0B" />
            <rect x="8" y="3" width="16" height="3" fill="#D97706" />
            <rect x="12" y="6" width="12" height="3" fill="#B45309" />
            <rect x="16" y="9" width="8" height="3" fill="#78350F" />
            <rect x="17" y="4" width="3" height="3" fill="#241A13" />
          </svg>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={stage === 'CHARGING' || stage === 'STAMPED' || stage === 'PINNING'}
          className="absolute top-4 right-4 w-8 h-8 rounded-full border border-[#241A13] bg-[#FFFDF9] text-[#241A13] hover:bg-[#241A13] hover:text-[#FFFDF9] transition-colors flex items-center justify-center cursor-pointer shadow-xs z-20 disabled:opacity-30"
          aria-label="Close ceremony"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ritual Stage Header */}
        <div className="flex flex-col items-center text-center mb-4">
          <span className="font-cabinet font-black text-lg sm:text-xl text-[#FBF8F1] tracking-tight">
            Evening Seal Ceremony
          </span>
          <span className="font-mono text-[11px] text-[#D8C7B5] mt-0.5">
            {stage === 'STAMPED' || stage === 'PINNING'
              ? 'Manifest Verified & Sealed'
              : 'Affix the Guild Signet to Lock Today’s Record'}
          </span>
        </div>

        {/* Mechanical Register Slot Bevel (where paper rolls out) */}
        <div className="w-full max-w-[320px] h-3 bg-[#1E140E] rounded-full border-t border-b border-black/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] mb-[-6px] z-10" />

        {/* 58mm Physical Thermal Register Slip */}
        <div
          style={{ clipPath: SAWTOOTH_CLIP }}
          className={`w-full max-w-[320px] bg-[#FBF8F1] text-[#2B1F17] pt-5 pb-7 px-5 shadow-[0_15px_40px_rgba(0,0,0,0.45),0_0_0_1px_rgba(43,31,23,0.15)] flex flex-col items-center relative transition-all duration-300 ${
            stage === 'ROLLING' ? 'animate-[receiptFeed_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards]' : ''
          } ${stage === 'PINNING' ? '-translate-y-6 scale-95 opacity-0 duration-400' : ''}`}
        >
          {/* Diagonal Verified Stamp Banner */}
          {stage === 'STAMPED' && (
            <div className="absolute top-16 -right-2 transform rotate-12 border-2 border-[#991B1B] text-[#991B1B] px-3 py-1 font-mono font-black text-[11px] tracking-wider bg-[#FFFDF9]/90 shadow-2xs animate-in zoom-in-75 duration-200 pointer-events-none">
              ★ AFFIXED &amp; SEALED ★
            </div>
          )}

          {/* Dot-matrix Register Header */}
          <div className="flex flex-col items-center text-center font-mono w-full">
            <span className="text-[11px] font-black tracking-widest text-[#2B1F17] uppercase">
              *** CYATH GUILD REGISTER ***
            </span>
            <span className="text-[9.5px] text-[#2B1F17]/70 mt-0.5">
              TERMINAL #01 // DESK OPERATOR
            </span>
            <div className="flex items-center justify-between w-full text-[10px] text-[#2B1F17]/80 mt-2 pt-1 border-t border-[#2B1F17]/25 font-bold">
              <span>{targetDate}</span>
              <span>LVL {progress.level} · {currentIsland.name.toUpperCase()}</span>
            </div>
            <div className="w-full font-mono text-[9px] text-[#2B1F17]/50 tracking-tighter truncate mt-0.5">
              ==============================================
            </div>
          </div>

          {/* Telemetry Line Items */}
          <div className="w-full flex flex-col gap-1.5 font-mono text-[11px] text-left my-2">
            <div className="flex items-center justify-between">
              <span className="text-[#2B1F17]/75">01. SUNLIGHT RITUAL</span>
              <span className="font-bold">{isSunlightDone ? 'DONE (+15M)' : 'PENDING'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#2B1F17]/75">02. PROTEIN FLOOR</span>
              <span className="font-bold">{proteinLogged}g / {targetProtein}g</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#2B1F17]/75">03. HYDRATION FLASK</span>
              <span className="font-bold">{hydrationLogged} L</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#2B1F17]/75">04. DAY STREAK</span>
              <span className="font-bold">{streakCount} DAYS {isForgedStreak ? '(FORGED)' : ''}</span>
            </div>
          </div>

          <div className="w-full font-mono text-[9px] text-[#2B1F17]/50 tracking-tighter truncate my-1">
            ----------------------------------------------
          </div>

          {/* Interactive Wax Stamping Station Zone */}
          <div
            ref={stampZoneRef}
            className="w-full flex flex-col items-center justify-center my-3 relative min-h-[96px]"
          >
            {stage === 'STAMPED' || stage === 'PINNING' ? (
              /* Stamped 16-Bit Wax Seal Revealed */
              <div className="flex flex-col items-center animate-in zoom-in-95 duration-200">
                <PixelWaxSeal
                  isForged={isForgedStreak}
                  size={54}
                  className="filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]"
                />
                <div className="flex items-center gap-1.5 mt-2 px-3 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 font-mono text-[10px] font-black text-emerald-800 shadow-2xs animate-in fade-in zoom-in-95 duration-200">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>+50 XP AWARDED</span>
                </div>
              </div>
            ) : (
              /* Interactive Press-and-Hold Brass Signet */
              <div
                role="button"
                tabIndex={0}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                className="group relative flex flex-col items-center justify-center cursor-pointer touch-none select-none p-2"
                title="Press and hold to affix the Guild Wax Seal"
              >
                {/* Circular Charge Progress Ring */}
                <svg
                  className="absolute w-22 h-22 pointer-events-none -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="#D97706"
                    strokeWidth="4"
                    strokeDasharray="276"
                    strokeDashoffset={276 - (276 * chargeProgress) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-75"
                    opacity={chargeProgress > 0 ? 0.9 : 0.25}
                  />
                </svg>

                {/* Glowing Molten Wax Pool under signet */}
                <div
                  className={`w-15 h-15 rounded-full transition-all duration-200 flex items-center justify-center shadow-inner ${
                    isForgedStreak
                      ? 'bg-[#334155] border-2 border-[#64748B]'
                      : 'bg-[#991B1B] border-2 border-[#DC2626]'
                  } ${
                    stage === 'CHARGING'
                      ? 'scale-110 shadow-[0_0_20px_rgba(220,38,38,0.7)]'
                      : 'group-hover:scale-105'
                  }`}
                >
                  {/* Heavy 16-Bit Brass Signet Matrix */}
                  <div
                    className={`transition-transform duration-150 ${
                      stage === 'CHARGING' ? 'scale-90 translate-y-0.5' : 'group-hover:-translate-y-1'
                    }`}
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" shapeRendering="crispEdges">
                      {/* Brass Handle Bevels */}
                      <rect x="10" y="2" width="4" height="6" fill="#D97706" />
                      <rect x="9" y="8" width="6" height="3" fill="#F59E0B" />
                      <rect x="7" y="11" width="10" height="3" fill="#B45309" />
                      {/* Signet Face */}
                      <rect x="5" y="14" width="14" height="4" fill="#FEF08A" />
                      <rect x="7" y="18" width="10" height="2" fill="#78350F" />
                      {/* Guild Heraldic Star Engraving */}
                      <rect x="11" y="15" width="2" height="2" fill="#451A03" />
                      <rect x="10" y="16" width="4" height="1" fill="#451A03" />
                    </svg>
                  </div>
                </div>

                {/* Interactive Feedback Label */}
                <span className="font-mono text-[9px] font-black text-[#B91C1C] uppercase tracking-wider mt-2.5">
                  {stage === 'CHARGING'
                    ? `HOLDING... ${Math.round(chargeProgress)}%`
                    : 'HOLD TO AFFIX SEAL'}
                </span>
              </div>
            )}
          </div>

          {/* Barcode & Hash */}
          <div className="w-full flex flex-col items-center mt-1">
            <div className="w-40 h-6 flex items-center justify-between overflow-hidden opacity-75">
              {Array.from({ length: 32 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-full bg-[#2B1F17]"
                  style={{
                    width: idx % 5 === 0 ? '3px' : idx % 3 === 0 ? '2px' : '1px',
                    marginRight: '1px',
                  }}
                />
              ))}
            </div>
            <span className="font-mono text-[8px] text-[#2B1F17]/60 mt-1 tracking-widest">
              AUTH: CYATH-{targetDate.replace(/-/g, '')}-OK
            </span>
          </div>
        </div>

        {/* Footer Guidance Note */}
        <div className="mt-4 flex items-center justify-center text-center font-mono text-xs text-[#D8C7B5]/80">
          <span>
            {stage === 'STAMPED' || stage === 'PINNING'
              ? 'Pinning sealed manifest to Guild Ledger...'
              : 'Press & hold the brass signet to melt and verify tonight’s record.'}
          </span>
        </div>
      </div>
    </div>
  );
}
