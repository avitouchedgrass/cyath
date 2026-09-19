'use client';

import React, { useMemo, useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { EveningSealCeremonyModal } from '@/components/dashboard/EveningSealCeremonyModal';
import { Sparkles, ScrollText, ShieldCheck } from 'lucide-react';

interface EveningSealButtonProps {
  onOpenReceipt?: () => void;
  onOpenCorkboard?: (sealedDate?: string) => void;
}

export function EveningSealButton({ onOpenReceipt, onOpenCorkboard }: EveningSealButtonProps) {
  const {
    currentDate,
    getDailyLog,
    habits,
    userProfile,
    isLedgerSealedByDate,
  } = useHabitStore();

  const [isCeremonyOpen, setIsCeremonyOpen] = useState(false);

  const currentLog = getDailyLog(currentDate);
  const isAlreadySealed = !!isLedgerSealedByDate[currentDate];

  const wakeTime = userProfile?.wakeTime || '07:30';
  const bedTime = userProfile?.bedTime || '23:30';

  // Check if habits are complete or evening window is reached
  const habitsDone = habits.length > 0 && habits.every((h) => !!currentLog.habitsCompleted[h.id]);

  const isEveningWindow = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [bedHour, bedMin] = bedTime.split(':').map(Number);
    const bedMinutes = (bedHour || 23) * 60 + (bedMin || 30);
    const windowStart = bedMinutes - 180; // 3 hours before bed

    if (bedMinutes < windowStart) {
      // Handles past midnight bedtime (e.g. 01:00)
      return currentMinutes >= windowStart || currentMinutes <= bedMinutes;
    }
    return currentMinutes >= windowStart;
  }, [bedTime]);

  const isEligible = habitsDone || isEveningWindow;

  const handleStartCeremony = () => {
    if (isAlreadySealed) {
      if (onOpenCorkboard) {
        onOpenCorkboard(currentDate);
      } else if (onOpenReceipt) {
        onOpenReceipt();
      }
      return;
    }

    retroAudio.playPaperRustle();
    haptics.tap();
    setIsCeremonyOpen(true);
  };

  const handleCeremonyComplete = (sealedDate: string) => {
    setIsCeremonyOpen(false);
    if (onOpenCorkboard) {
      onOpenCorkboard(sealedDate);
    }
  };

  if (!isEligible && !isAlreadySealed) {
    return null;
  }

  return (
    <>
      <div className="w-full flex flex-col gap-3 p-4 sm:p-5 rounded-2xl border border-[#1A3629]/15 bg-[#FFFDF9] shadow-[0_8px_30px_rgba(26,54,41,0.04)] animate-in fade-in duration-200">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <div className="flex items-center gap-1.5">
              {isAlreadySealed ? (
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
              ) : (
                <ScrollText className="w-4 h-4 text-[#991B1B]" />
              )}
              <span className="font-cabinet font-black text-sm text-[#1A3629] tracking-tight">
                {isAlreadySealed ? 'Daily Ledger Sealed' : 'Evening Seal Ceremony'}
              </span>
            </div>

            <span
              className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs flex items-center gap-1 ${
                isAlreadySealed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-[#991B1B]'
              }`}
            >
              {!isAlreadySealed && <Sparkles className="w-2.5 h-2.5 text-amber-500" />}
              <span>{isAlreadySealed ? 'Archived & Verified' : '+50 XP Available'}</span>
            </span>
          </div>

          <span className="font-mono text-xs text-[#4A5D4E] mt-0.5 leading-relaxed">
            {isAlreadySealed
              ? `Manifest archived. Next first light scheduled for ${wakeTime}.`
              : 'Execute the daily closing ritual: print thermal receipt & melt wax seal.'}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleStartCeremony}
            className={`w-full py-2.5 px-4 rounded-xl font-cabinet font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-98 ${
              isAlreadySealed
                ? 'border-2 border-[#1A3629]/20 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9]'
                : 'bg-[#1A3629] text-[#FFFDF9] hover:bg-[#2C4A3B] hover:shadow-md'
            }`}
          >
            <span>
              {isAlreadySealed
                ? 'Inspect 30-Day Guild Ledger'
                : 'Begin Seal Ceremony (+50 XP)'}
            </span>
          </button>

          {isAlreadySealed && onOpenReceipt && (
            <button
              type="button"
              onClick={() => {
                retroAudio.playBlip();
                haptics.tap();
                onOpenReceipt();
              }}
              className="w-full py-1 text-center font-mono text-[11px] text-[#4A5D4E] hover:text-[#1A3629] cursor-pointer hover:underline"
            >
              Inspect 58mm Thermal Receipt →
            </button>
          )}
        </div>
      </div>

      {/* The Immersive Desk Ritual Overlay */}
      <EveningSealCeremonyModal
        isOpen={isCeremonyOpen}
        onClose={() => setIsCeremonyOpen(false)}
        onComplete={handleCeremonyComplete}
      />
    </>
  );
}
