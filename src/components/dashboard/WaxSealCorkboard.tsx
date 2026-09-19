'use client';

import React, { useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { formatLocalDate } from '@/lib/dateUtils';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { MinimalistReceiptModal } from '@/components/dashboard/MinimalistReceiptModal';
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
      className="fixed inset-0 z-70 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#1A3629]/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Rustic Wooden Frame Chassis */}
      <div className="w-full max-w-3xl bg-[#C7BAA7] border-8 border-[#3D2E24] rounded-3xl p-5 sm:p-8 shadow-[0_25px_60px_rgba(26,54,41,0.35)] flex flex-col gap-6 relative select-none">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full border-2 border-[#3D2E24]/30 bg-[#FFFDF9] text-[#3D2E24] hover:bg-[#3D2E24] hover:text-[#FFFDF9] transition-colors flex items-center justify-center cursor-pointer shadow-xs z-10"
          aria-label="Close corkboard"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Archival Corkboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#3D2E24]/20 pb-4 pr-10 sm:pr-0">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#5C4838]">
              30-Day Ledger Expedition
            </span>
            <h3 className="font-cabinet font-extrabold text-2xl text-[#2B1F17] tracking-tight mt-0.5">
              The Guild Wax-Seal Board
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFDF9] border border-[#3D2E24]/20 font-mono text-xs font-bold text-[#2B1F17] shadow-xs">
              <span className="text-[#B91C1C]">●</span>
              <span>{sealedCount} / 30 Pinned</span>
            </div>
            {isForgedStreak && (
              <span className="font-mono text-xs font-bold text-[#2563EB] bg-blue-100/80 px-2.5 py-1 rounded-full border border-blue-300">
                Forged Streak ({streakCount}d)
              </span>
            )}
          </div>
        </div>

        {/* Corkboard Texture Canvas (5 rows × 6 columns = 30 Recessed Medal Slots) */}
        <div className="p-4 sm:p-6 rounded-2xl bg-[#B8A994] border-2 border-[#3D2E24]/25 shadow-[inset_0_4px_16px_rgba(43,31,23,0.25)] grid grid-cols-5 sm:grid-cols-6 gap-3 sm:gap-4">
          {days.map((slot) => {
            const isJustSealed = justSealedDate === slot.dateStr;

            return (
              <button
                key={slot.dateStr}
                type="button"
                onClick={() => handleInspectSlot(slot.dateStr, slot.isSealed)}
                className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all cursor-pointer relative group ${
                  slot.isSealed
                    ? 'hover:scale-105 active:scale-95'
                    : 'opacity-70 hover:opacity-90'
                }`}
                title={
                  slot.isSealed
                    ? `${slot.dateStr}: Sealed (Click to inspect thermal receipt)`
                    : `${slot.dateStr}: Unsealed void`
                }
              >
                {/* Recessed Circular Medal Well */}
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center relative shadow-[inset_0_3px_8px_rgba(0,0,0,0.3)] transition-all ${
                    slot.isSealed
                      ? slot.isForged
                        ? 'bg-[#334155] border-2 border-[#94A3B8] shadow-md'
                        : 'bg-[#991B1B] border-2 border-[#F87171] shadow-md'
                      : slot.isToday
                      ? 'bg-[#FAF8F5]/80 border-2 border-dashed border-[#B91C1C] animate-pulse'
                      : 'bg-[#2B1F17]/20 border-2 border-dashed border-[#2B1F17]/30'
                  } ${isJustSealed ? 'animate-[bounce_0.6s_ease-out]' : ''}`}
                >
                  {slot.isSealed ? (
                    /* Tactile Wax Seal Medal Coin */
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border border-black/25 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]">
                      {slot.isForged ? (
                        /* Forged Iron Rivet Medal */
                        <span className="font-pixel text-[10px] text-[#FCD34D] font-bold drop-shadow-xs">
                          FE
                        </span>
                      ) : (
                        /* Imperial Wax Seal Stamp */
                        <span className="font-pixel text-xs text-[#FFFDF9] font-bold drop-shadow-xs">
                          ★
                        </span>
                      )}
                    </div>
                  ) : slot.isToday ? (
                    <span className="font-mono text-[10px] font-bold text-[#B91C1C]">
                      TODAY
                    </span>
                  ) : (
                    /* Hollow Grey Void Slot */
                    <span className="font-mono text-xs text-[#2B1F17]/40 font-bold">
                      Ø
                    </span>
                  )}
                </div>

                {/* Day Number Label */}
                <span className="font-mono text-[10px] font-bold text-[#3D2E24] mt-1.5">
                  Day {slot.dayNumber}
                </span>
              </button>
            );
          })}
        </div>

        {/* Board Legend & Help Strip */}
        <div className="flex items-center justify-between text-xs font-sans text-[#5C4838] border-t border-[#3D2E24]/15 pt-3 flex-wrap gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#991B1B] border border-[#F87171] inline-block" />
              <span>Sealed Day</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#334155] border border-[#94A3B8] inline-block" />
              <span>Forged Re-Entry</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#2B1F17]/20 border border-dashed border-[#2B1F17]/40 inline-block" />
              <span>Missed Void</span>
            </span>
          </div>

          <span className="font-mono text-[11px] text-[#5C4838]">
            Click any wax seal to inspect receipt
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
