'use client';

import React, { useState, useEffect } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { formatLocalDate } from '@/lib/dateUtils';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { MinimalistReceiptModal } from '@/components/dashboard/MinimalistReceiptModal';
import { PixelWaxSeal } from '@/components/dashboard/PixelWaxSeal';
import { CorkboardBackdropSvg } from '@/components/dashboard/CorkboardBackdropSvg';
import { X } from 'lucide-react';

export interface WaxSealCorkboardProps {
  isOpen: boolean;
  onClose: () => void;
  justSealedDate?: string | null;
}

// Jagged sawtooth torn bottom edge characteristic of physical 58mm thermal register paper
const SAWTOOTH_CLIP =
  'polygon(0% 0%, 100% 0%, 100% calc(100% - 6px), 95% 100%, 90% calc(100% - 6px), 85% 100%, 80% calc(100% - 6px), 75% 100%, 70% calc(100% - 6px), 65% 100%, 60% calc(100% - 6px), 55% 100%, 50% calc(100% - 6px), 45% 100%, 40% calc(100% - 6px), 35% 100%, 30% calc(100% - 6px), 25% 100%, 20% calc(100% - 6px), 15% 100%, 10% calc(100% - 6px), 5% 100%, 0% calc(100% - 6px))';

export function WaxSealCorkboard({
  isOpen,
  onClose,
  justSealedDate = null,
}: WaxSealCorkboardProps) {
  const { isLedgerSealedByDate, getDailyLog, streakCount, isForgedStreak } = useHabitStore();
  const [inspectDate, setInspectDate] = useState<string | null>(null);

  // Trigger tactile audio & haptics when board opens or seal stamps down
  useEffect(() => {
    if (!isOpen) return;
    if (justSealedDate) {
      retroAudio.playWaxStampThump();
      haptics.success();
    } else {
      retroAudio.playPaperRustle();
    }
  }, [isOpen, justSealedDate]);

  if (!isOpen) return null;

  // Generate rolling 30 days backwards from today
  const todayStr = formatLocalDate();
  const days: {
    dateStr: string;
    dayNumber: number;
    isToday: boolean;
    isSealed: boolean;
    isForged: boolean;
    log: ReturnType<typeof getDailyLog>;
  }[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = formatLocalDate(d);
    const isSealed = !!isLedgerSealedByDate[dateStr];
    const log = getDailyLog(dateStr);
    const isForged = !!log.isForgedReentry;

    days.push({
      dateStr,
      dayNumber: d.getDate(),
      isToday: dateStr === todayStr,
      isSealed,
      isForged,
      log,
    });
  }

  const sealedCount = days.filter((d) => d.isSealed).length;

  const handleInspectSlot = (dateStr: string, isSealed: boolean) => {
    if (isSealed) {
      retroAudio.playInspectConfirm();
      haptics.tap();
      setInspectDate(dateStr);
    } else {
      retroAudio.playBlip();
      haptics.tap();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-5 lg:p-6 bg-[#15271E]/80 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* 16-Bit Retro Guild Corkboard Frame */}
      <div
        className={`w-full max-w-4xl bg-[#3D2E24] border-4 border-[#241A13] rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-[0_30px_80px_rgba(10,7,5,0.65),0_0_0_1px_rgba(255,255,255,0.12)] flex flex-col gap-4 sm:gap-5 relative overflow-hidden my-auto ${
          justSealedDate ? 'animate-[deskRumble_0.4s_ease-out]' : ''
        }`}
      >
        {/* Custom Pixelated Corkboard Backdrop */}
        <CorkboardBackdropSvg />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-[#241A13] bg-[#FFFDF9] text-[#241A13] hover:bg-[#241A13] hover:text-[#FFFDF9] transition-colors flex items-center justify-center cursor-pointer shadow-sm z-20"
          aria-label="Close ledger"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Archival Ledger Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b-2 border-[#3D2E24]/20 pb-3 sm:pb-4 pr-10 sm:pr-0">
          <div className="flex flex-col">
            <h2 className="font-cabinet font-black text-xl sm:text-2xl lg:text-3xl text-[#2B1F17] tracking-tight">
              The 30-Day Guild Ledger
            </h2>
            <p className="font-mono text-[11px] sm:text-xs text-[#5C4838] mt-0.5">
              Daily thermal receipts pinned &amp; verified with guild wax. Grey shadows mark missed days.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFDF9]/95 border-2 border-[#2B1F17]/20 font-mono text-xs font-bold text-[#2B1F17] shadow-xs">
              <span className="text-[#991B1B]">●</span>
              <span>{sealedCount} / 30 Sealed</span>
            </div>
            {isForgedStreak && (
              <span className="font-mono text-[11px] sm:text-xs font-bold text-[#1E3A8A] bg-blue-100/95 px-2.5 py-1 rounded-full border-2 border-blue-300 shadow-xs">
                Forged Streak ({streakCount}d)
              </span>
            )}
          </div>
        </div>

        {/* Corkboard Grid Canvas: 30 Daily Receipt Slots (5x6 on mobile, 6x5 on desktop) */}
        <div className="relative z-10 p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#B8A994]/85 border-2 border-[#3D2E24]/35 shadow-[inset_0_4px_18px_rgba(43,31,23,0.35)] grid grid-cols-5 sm:grid-cols-6 gap-2 sm:gap-3.5 backdrop-blur-[0.5px]">
          {days.map((slot) => {
            const isJustSealed = justSealedDate === slot.dateStr;
            const naturalTilt = ((slot.dayNumber % 5) - 2) * 0.75; // -1.5deg to +1.5deg organic pin angle

            // CASE 1: SEALED DAY -> Real mini physical thermal receipt pinned to board
            if (slot.isSealed) {
              const hasSun = !!slot.log.habitsCompleted?.['sunlight'];
              const hasProtein = (slot.log.totalProteinLogged || 0) > 0;
              const hasWater = (slot.log.hydrationLiters || 0) > 0;

              return (
                <button
                  key={slot.dateStr}
                  type="button"
                  onClick={() => handleInspectSlot(slot.dateStr, true)}
                  onMouseEnter={() => retroAudio.playPaperRustle()}
                  style={{
                    clipPath: SAWTOOTH_CLIP,
                    transform: `rotate(${naturalTilt}deg)`,
                  }}
                  className={`group relative flex flex-col items-center justify-between w-full max-w-[76px] sm:max-w-[94px] h-[88px] sm:h-[110px] mx-auto p-1 sm:p-1.5 bg-[#FFFDF7] border border-[#2B1F17]/30 shadow-[0_3px_8px_rgba(0,0,0,0.18),0_1px_2px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 hover:rotate-0 hover:shadow-xl transition-all duration-150 cursor-pointer select-none ${
                    isJustSealed ? 'animate-[receiptPinDown_0.35s_ease-out]' : ''
                  }`}
                  title={`Day ${slot.dayNumber} (${slot.dateStr}): Sealed receipt. Tap to inspect 58mm slip.`}
                >
                  {/* Pixel Brass Thumbtack / Pushpin */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.4)]">
                    <svg width="10" height="10" viewBox="0 0 8 8" shapeRendering="crispEdges">
                      <rect x="2" y="0" width="4" height="1" fill="#FEF08A" />
                      <rect x="1" y="1" width="6" height="3" fill="#D97706" />
                      <rect x="3" y="2" width="2" height="1" fill="#FFFBEB" />
                      <rect x="2" y="4" width="4" height="1" fill="#78350F" />
                      <rect x="3" y="5" width="2" height="2" fill="#241A13" />
                    </svg>
                  </div>

                  {/* Thermal Receipt Header */}
                  <div className="w-full flex flex-col items-center pt-1.5">
                    <span className="font-mono text-[8px] sm:text-[9.5px] font-black text-[#2B1F17] tracking-tight leading-none">
                      DAY {slot.dayNumber}
                    </span>
                    <div className="w-full border-b border-dotted border-[#2B1F17]/30 my-0.5" />

                    {/* Dot-matrix Telemetry Indicators */}
                    <div className="flex items-center justify-center gap-1 my-0.5 opacity-85">
                      <span
                        className={`w-1.5 h-1.5 rounded-xs ${
                          hasSun ? 'bg-amber-600' : 'bg-stone-300'
                        }`}
                        title="Sunlight"
                      />
                      <span
                        className={`w-1.5 h-1.5 rounded-xs ${
                          hasProtein ? 'bg-emerald-600' : 'bg-stone-300'
                        }`}
                        title="Protein"
                      />
                      <span
                        className={`w-1.5 h-1.5 rounded-xs ${
                          hasWater ? 'bg-blue-600' : 'bg-stone-300'
                        }`}
                        title="Hydration"
                      />
                    </div>
                  </div>

                  {/* Pixelated Wax Seal Stamped Onto Receipt Paper */}
                  <div
                    className={`relative z-10 my-auto ${
                      isJustSealed
                        ? 'animate-[waxStampThump_0.5s_cubic-bezier(0.22,1,0.36,1)_forwards]'
                        : ''
                    }`}
                  >
                    <PixelWaxSeal
                      isForged={slot.isForged}
                      size={30}
                      className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Bottom Micro Print Hash */}
                  <div className="w-full flex justify-center pb-1">
                    <span className="font-mono text-[6.5px] sm:text-[7.5px] text-[#2B1F17]/60 tracking-widest leading-none">
                      CYATH-{slot.dayNumber}
                    </span>
                  </div>
                </button>
              );
            }

            // CASE 2: TODAY (PENDING) -> Blank ticket awaiting tonight's stamp
            if (slot.isToday) {
              return (
                <button
                  key={slot.dateStr}
                  type="button"
                  onClick={() => handleInspectSlot(slot.dateStr, false)}
                  style={{ clipPath: SAWTOOTH_CLIP }}
                  className="group relative flex flex-col items-center justify-between w-full max-w-[76px] sm:max-w-[94px] h-[88px] sm:h-[110px] mx-auto p-1 sm:p-1.5 bg-[#FFFDF9]/70 border-2 border-dashed border-[#B91C1C]/60 shadow-xs hover:border-[#B91C1C] hover:bg-[#FFFDF9]/90 transition-all cursor-pointer select-none"
                  title={`Day ${slot.dayNumber} (Today): Pending tonight's ledger seal.`}
                >
                  {/* Pulsing Pushpin on Today */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20">
                    <span className="absolute -inset-1 rounded-full bg-[#B91C1C]/40 animate-ping" />
                    <svg width="10" height="10" viewBox="0 0 8 8" shapeRendering="crispEdges">
                      <rect x="2" y="0" width="4" height="1" fill="#FEF08A" />
                      <rect x="1" y="1" width="6" height="3" fill="#D97706" />
                      <rect x="3" y="2" width="2" height="1" fill="#FFFBEB" />
                      <rect x="2" y="4" width="4" height="1" fill="#B91C1C" />
                      <rect x="3" y="5" width="2" height="2" fill="#241A13" />
                    </svg>
                  </div>

                  {/* Today Header */}
                  <div className="w-full flex flex-col items-center pt-1.5">
                    <span className="font-mono text-[7px] sm:text-[8px] font-black text-[#B91C1C] bg-red-100/90 px-1 py-0.2 rounded-xs leading-none">
                      TODAY
                    </span>
                    <span className="font-mono text-[8px] sm:text-[9.5px] font-bold text-[#2B1F17] mt-0.5 leading-none">
                      DAY {slot.dayNumber}
                    </span>
                    <div className="w-full border-b border-dashed border-[#B91C1C]/30 my-0.5" />
                  </div>

                  {/* Dashed Target Stamp Ring */}
                  <div className="flex flex-col items-center justify-center my-auto">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-dashed border-[#B91C1C]/60 flex items-center justify-center group-hover:scale-105 transition-transform bg-red-50/50">
                      <span className="font-mono text-[7px] sm:text-[8px] font-extrabold text-[#B91C1C] tracking-tight">
                        STAMP
                      </span>
                    </div>
                    <span className="font-mono text-[6.5px] sm:text-[7.5px] font-bold text-[#B91C1C]/80 mt-0.5 uppercase tracking-tight">
                      TONIGHT
                    </span>
                  </div>

                  {/* Bottom Micro Print */}
                  <div className="w-full flex justify-center pb-1">
                    <span className="font-mono text-[6.5px] text-[#B91C1C]/60 tracking-widest leading-none">
                      PENDING
                    </span>
                  </div>
                </button>
              );
            }

            // CASE 3: MISSED DAY -> Recessed grey shadow footprint where receipt failed to be pinned
            return (
              <div
                key={slot.dateStr}
                style={{ clipPath: SAWTOOTH_CLIP }}
                className="relative flex flex-col items-center justify-between w-full max-w-[76px] sm:max-w-[94px] h-[88px] sm:h-[110px] mx-auto p-1 sm:p-1.5 bg-[#2B1F17]/18 border border-dashed border-[#5C4838]/30 shadow-[inset_0_2px_6px_rgba(20,14,10,0.35)] select-none opacity-80"
                title={`Day ${slot.dayNumber} (${slot.dateStr}): Missed day. No receipt was pinned.`}
              >
                {/* Empty Pin Hole In Corkboard */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 z-10 w-1.5 h-1.5 rounded-full bg-[#1E140E]/80 shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.9)] border border-[#5C4838]/30" />

                {/* Ghosted Receipt Header */}
                <div className="w-full flex flex-col items-center pt-2">
                  <span className="font-mono text-[8px] sm:text-[9.5px] font-bold text-[#5C4838]/60 tracking-tight leading-none">
                    DAY {slot.dayNumber}
                  </span>
                  <div className="w-full border-b border-dashed border-[#5C4838]/25 my-0.5" />
                </div>

                {/* Ghost Silhouette of Missed Ticket / Void Stamp */}
                <div className="flex flex-col items-center justify-center my-auto">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-dashed border-[#5C4838]/35 flex items-center justify-center opacity-50">
                    <span className="font-mono text-[8px] text-[#5C4838]/70 font-bold">✕</span>
                  </div>
                  <span className="font-mono text-[7px] sm:text-[8px] font-extrabold text-[#5C4838]/65 tracking-wider uppercase mt-1">
                    MISSED
                  </span>
                </div>

                {/* Empty bottom space */}
                <div className="w-full pb-1" />
              </div>
            );
          })}
        </div>

        {/* Board Legend Strip */}
        <div className="relative z-10 flex items-center justify-between text-[11px] sm:text-xs font-mono text-[#5C4838] border-t border-[#3D2E24]/20 pt-2.5 sm:pt-3 flex-wrap gap-2">
          <div className="flex items-center gap-3.5 sm:gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-4.5 bg-[#FFFDF7] border border-[#2B1F17]/30 rounded-xs inline-flex items-center justify-center shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#991B1B]" />
              </span>
              <span>Sealed Receipt</span>
            </span>
            <span
              className="flex items-center gap-1.5 cursor-help"
              title="Grace Re-entry: Streak was broken but restored through golden Kintsugi repair."
            >
              <span className="w-3.5 h-4.5 bg-[#FFFDF7] border border-[#2B1F17]/30 rounded-xs inline-flex items-center justify-center shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#334155]" />
              </span>
              <span>Forged (Kintsugi)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-4.5 bg-[#2B1F17]/25 border border-dashed border-[#5C4838]/40 rounded-xs inline-block" />
              <span>Missed Shadow</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-4.5 bg-[#FFFDF9]/70 border border-dashed border-[#B91C1C]/60 rounded-xs inline-block" />
              <span>Today Pending</span>
            </span>
          </div>

          <span className="text-[10px] sm:text-[11px] text-[#2B1F17]/85 font-semibold">
            Tap any sealed receipt to inspect 58mm slip →
          </span>
        </div>
      </div>

      {/* Historical 58mm Thermal Receipt Inspection Modal */}
      {inspectDate && (
        <MinimalistReceiptModal
          isOpen={!!inspectDate}
          onClose={() => setInspectDate(null)}
          dateOverride={inspectDate}
        />
      )}
    </div>
  );
}
