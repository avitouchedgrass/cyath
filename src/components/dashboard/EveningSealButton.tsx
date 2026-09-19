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
  const pinnedCount = Object.values(isLedgerSealedByDate).filter(Boolean).length;

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
      <div className="w-full flex flex-col gap-2 pt-1">
        <button
          type="button"
          onClick={handleStartCeremony}
          title={isAlreadySealed ? "View your 30-day habit ledger" : "Begin the daily closing ceremony to seal today's log and earn XP"}
          className={`w-full h-11 px-5 rounded-full font-cabinet font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] ${
            isAlreadySealed
              ? 'border border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9]'
              : 'bg-[#1A3629] text-[#FFFDF9] hover:bg-[#2C4A3B] hover:shadow-md'
          }`}
        >
          <span>
            {isAlreadySealed
              ? `Daily Ledger Sealed (${pinnedCount} of 30)`
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
            Inspect Thermal Receipt →
          </button>
        )}
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
