'use client';

import React, { useState, useEffect } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { formatLocalDate } from '@/lib/dateUtils';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { MinimalistReceiptModal } from '@/components/dashboard/MinimalistReceiptModal';
import { WaxSealSvg } from '@/components/dashboard/WaxSealSvg';
import { ParchmentVoidSlotSvg } from '@/components/dashboard/ParchmentVoidSlotSvg';
import { CorkboardBackdropSvg } from '@/components/dashboard/CorkboardBackdropSvg';
import { X } from 'lucide-react';

export interface WaxSealCorkboardProps {
  isOpen: boolean;
  onClose: () => void;
  justSealedDate?: string | null;
}

export function WaxSealCorkboard({
  isOpen,
  onClose,
  justSealedDate = null,
}: WaxSealCorkboardProps) {
  const { isLedgerSealedByDate, getDailyLog, streakCount, isForgedStreak } = useHabitStore();
  const [inspectDate, setInspectDate] = useState<string | null>(null);

  // Play audio on opening or when a new seal slams down
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
  const days: { dateStr: string; dayNumber: number; isToday: boolean; isSealed: boolean; isForged: boolean }[] = [];

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
    });
  }

  const sealedCount = days.filter((d) => d.isSealed).length;

  const handleInspectSlot = (dateStr: string, isSealed: boolean) => {
    retroAudio.playBlip();
    haptics.tap();
    if (isSealed) {
      setInspectDate(dateStr);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-70 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#1A3629]/75 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Rustic Wooden & Cork Frame Chassis */}
      <div
        className={`w-full max-w-3xl bg-[#3D2E24] border-4 border-[#241A13] rounded-3xl p-5 sm:p-8 shadow-[0_30px_70px_rgba(15,10,7,0.55),0_0_0_1px_rgba(255,255,255,0.1)] flex flex-col gap-6 relative overflow-hidden ${
          justSealedDate ? 'animate-[deskRumble_0.4s_ease-out]' : ''
        }`}
      >
        {/* Custom SVG Corkboard Backdrop */}
        <CorkboardBackdropSvg />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full border border-[#3D2E24]/40 bg-[#FFFDF9] text-[#3D2E24] hover:bg-[#3D2E24] hover:text-[#FFFDF9] transition-colors flex items-center justify-center cursor-pointer shadow-sm z-20"
          aria-label="Close ledger"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Archival Ledger Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#3D2E24]/20 pb-4 pr-10 sm:pr-0">
          <div className="flex flex-col">
            <h2 className="font-cabinet font-extrabold text-2xl sm:text-3xl text-[#2B1F17] tracking-tight">
              The 30-Day Guild Ledger
            </h2>
            <p className="font-mono text-xs text-[#5C4838] mt-0.5">
              Daily wax seals stamped on verification. Tap any sealed day to inspect receipt.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFDF9]/90 border border-[#3D2E24]/20 font-mono text-xs font-bold text-[#2B1F17] shadow-xs">
              <span className="text-[#B91C1C]">●</span>
              <span>{sealedCount} / 30 Sealed</span>
            </div>
            {isForgedStreak && (
              <span className="font-mono text-xs font-bold text-[#1D4ED8] bg-blue-100/90 px-3 py-1.5 rounded-full border border-blue-300 shadow-xs">
                Forged Streak ({streakCount}d)
              </span>
            )}
          </div>
        </div>

        {/* Corkboard Grid Canvas (5 rows × 6 columns = 30 Recessed Well Slots) */}
        <div className="relative z-10 p-4 sm:p-6 rounded-2xl bg-[#B8A994]/70 border-2 border-[#3D2E24]/30 shadow-[inset_0_4px_18px_rgba(43,31,23,0.3)] grid grid-cols-5 sm:grid-cols-6 gap-3 sm:gap-4.5 backdrop-blur-[0.5px]">
          {days.map((slot) => {
            const isJustSealed = justSealedDate === slot.dateStr;

            return (
              <button
                key={slot.dateStr}
                type="button"
                onClick={() => handleInspectSlot(slot.dateStr, slot.isSealed)}
                className={`flex flex-col items-center justify-center p-1.5 rounded-2xl transition-all cursor-pointer relative group ${
                  slot.isSealed
                    ? 'hover:scale-105 active:scale-95'
                    : 'opacity-85 hover:opacity-100'
                }`}
                title={
                  slot.isSealed
                    ? `${slot.dateStr}: Sealed (Click to inspect thermal receipt)`
                    : `${slot.dateStr}: Unsealed well`
                }
              >
                {/* Seal / Well Container */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center relative">
                  {slot.isSealed ? (
                    <div
                      className={`w-full h-full flex items-center justify-center ${
                        isJustSealed
                          ? 'animate-[waxStampThump_0.5s_cubic-bezier(0.22,1,0.36,1)_forwards]'
                          : ''
                      }`}
                    >
                      <WaxSealSvg
                        isForged={slot.isForged}
                        size={52}
                        className="filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]"
                      />
                    </div>
                  ) : (
                    <ParchmentVoidSlotSvg
                      isToday={slot.isToday}
                      size={46}
                    />
                  )}
                </div>

                {/* Day Number Label */}
                <span
                  className={`font-mono text-[10px] font-bold mt-1 tabular-nums ${
                    slot.isToday
                      ? 'text-[#B91C1C] underline decoration-2 underline-offset-2'
                      : 'text-[#3D2E24]'
                  }`}
                >
                  Day {slot.dayNumber}
                </span>
              </button>
            );
          })}
        </div>

        {/* Board Legend Strip */}
        <div className="relative z-10 flex items-center justify-between text-xs font-mono text-[#5C4838] border-t border-[#3D2E24]/20 pt-3 flex-wrap gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#991B1B] border border-[#F87171] inline-block shadow-2xs" />
              <span>Sealed Day</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#334155] border border-[#94A3B8] inline-block shadow-2xs" />
              <span>Forged Re-Entry</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#8C7A6B]/50 border border-dashed border-[#5E4E42] inline-block" />
              <span>Missed Well</span>
            </span>
          </div>

          <span className="text-[11px] text-[#2B1F17]/80">
            Click any wax seal to inspect receipt →
          </span>
        </div>
      </div>

      {/* Historical Receipt Inspection Modal */}
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
