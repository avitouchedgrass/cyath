'use client';

import React, { useMemo, useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { xpParticleEmitter } from '@/lib/particleEmitter';
import { ShieldCheck, Lock, Sparkles, Check } from 'lucide-react';

interface EveningSealButtonProps {
  onOpenReceipt?: () => void;
}

export function EveningSealButton({ onOpenReceipt }: EveningSealButtonProps) {
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
      if (onOpenReceipt) onOpenReceipt();
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
      if (onOpenReceipt) onOpenReceipt();
    }, 1200);
  };

  if (!isEligible && !isAlreadySealed) {
    return null;
  }

  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl border-2 border-[#1A3629] bg-[#FFFDF9] shadow-[4px_4px_0px_#1A3629] animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
          isAlreadySealed
            ? 'bg-[#ECFDF5] border-[#10B981]/40 text-[#065F46]'
            : 'bg-[#FEF3C7] border-[#D97706]/40 text-[#B45309]'
        }`}>
          {isAlreadySealed ? (
            <Check className="w-5 h-5 text-[#10B981]" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-[#D97706]" />
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-cabinet font-extrabold text-sm text-[#1A3629]">
              {isAlreadySealed ? 'Ledger Sealed for Today' : "Evening Seal Ceremony Ready"}
            </span>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#1A3629]/15 text-[#1A3629]">
              {isAlreadySealed ? 'Verified' : '+50 XP'}
            </span>
          </div>
          <span className="font-sans text-xs text-[#4A5D4E]">
            {isAlreadySealed
              ? `Next: First Light at ${wakeTime} tomorrow morning.`
              : 'Lock in today’s habit streak and mint your gold calendar coin.'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          type="button"
          onClick={handleSeal}
          disabled={isSealing}
          className={`flex-1 sm:flex-none px-5 py-2.5 rounded-2xl font-cabinet font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#1A3629] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
            isAlreadySealed
              ? 'border-2 border-[#1A3629] bg-[#FAF8F5] text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9]'
              : 'border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] hover:bg-[#2C4A3B]'
          }`}
        >
          {isAlreadySealed ? (
            <span>View Receipt</span>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[#FCD34D]" />
              <span>{isSealing ? 'Sealing...' : 'Seal Ledger (+50 XP)'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
