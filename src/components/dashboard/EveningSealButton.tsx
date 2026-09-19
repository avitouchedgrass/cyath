'use client';

import React, { useMemo, useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { xpParticleEmitter } from '@/lib/particleEmitter';

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
    sealDailyLedger,
  } = useHabitStore();

  const [isSealing, setIsSealing] = useState(false);

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

  const handleSeal = (e: React.MouseEvent) => {
    if (isAlreadySealed) {
      if (onOpenCorkboard) {
        onOpenCorkboard(currentDate);
      } else if (onOpenReceipt) {
        onOpenReceipt();
      }
      return;
    }

    setIsSealing(true);
    retroAudio.playTierUpgrade();
    haptics.heavy();
    if (typeof window !== 'undefined') {
      xpParticleEmitter.emit(e.clientX, e.clientY, 20);
    }

    sealDailyLedger(currentDate);

    setTimeout(() => {
      setIsSealing(false);
      retroAudio.playPinThwack();
      haptics.success();
      if (onOpenCorkboard) {
        onOpenCorkboard(currentDate);
      } else if (onOpenReceipt) {
        onOpenReceipt();
      }
    }, 1000);
  };

  if (!isEligible && !isAlreadySealed) {
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-3.5 p-4 sm:p-5 rounded-2xl border border-[#1A3629]/15 bg-[#FFFDF9] shadow-[0_8px_30px_rgba(26,54,41,0.04)] animate-in fade-in duration-200">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-1 flex-wrap">
          <span className="font-cabinet font-extrabold text-sm text-[#1A3629] tracking-tight">
            {isAlreadySealed ? 'Daily Ledger Sealed' : 'Evening Seal Ceremony'}
          </span>
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#1A3629]/10 text-[#1A3629]">
            {isAlreadySealed ? 'Verified' : '+50 XP'}
          </span>
        </div>
        <span className="font-sans text-xs text-[#4A5D4E] mt-0.5 leading-relaxed">
          {isAlreadySealed
            ? `First light scheduled for ${wakeTime} tomorrow.`
            : 'Lock in today’s habit streak and pin your guild wax medal.'}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleSeal}
          disabled={isSealing}
          className={`w-full py-2.5 px-4 rounded-xl font-cabinet font-bold text-xs transition-colors cursor-pointer flex items-center justify-center shadow-2xs ${
            isAlreadySealed
              ? 'border border-[#1A3629]/15 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9]'
              : 'bg-[#1A3629] text-[#FFFDF9] hover:bg-[#2C4A3B]'
          }`}
        >
          <span>
            {isAlreadySealed
              ? 'Open 30-Day Ledger Board'
              : isSealing
              ? 'Pinning Wax Seal...'
              : 'Seal Ledger (+50 XP)'}
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
            Inspect Thermal Receipt
          </button>
        )}
      </div>
    </div>
  );
}
