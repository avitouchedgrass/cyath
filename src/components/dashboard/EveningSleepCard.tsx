'use client';

import React, { useMemo, useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { EveningSealCeremonyModal } from '@/components/dashboard/EveningSealCeremonyModal';

interface EveningSleepCardProps {
  onOpenSchedule: () => void;
  onOpenReceipt: () => void;
  onToggleCorkboard: () => void;
  onOpenAmbient: () => void;
  isCorkboardOpen: boolean;
}

export function EveningSleepCard({
  onOpenSchedule,
  onOpenReceipt,
  onToggleCorkboard,
  onOpenAmbient,
  isCorkboardOpen,
}: EveningSleepCardProps) {
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

  const habitsDone = habits.length > 0 && habits.every((h) => !!currentLog.habitsCompleted[h.id]);

  const isEveningWindow = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [bedHour, bedMin] = bedTime.split(':').map(Number);
    const bedMinutes = (bedHour || 23) * 60 + (bedMin || 30);
    const windowStart = bedMinutes - 180; // 3 hours before target bedtime

    if (bedMinutes < windowStart) {
      return currentMinutes >= windowStart || currentMinutes <= bedMinutes;
    }
    return currentMinutes >= windowStart;
  }, [bedTime]);

  const isEligible = habitsDone || isEveningWindow;

  const handleStartCeremony = () => {
    if (isAlreadySealed) {
      onToggleCorkboard();
      return;
    }

    retroAudio.playPaperRustle();
    haptics.tap();
    setIsCeremonyOpen(true);
  };

  const handleCeremonyComplete = (sealedDate: string) => {
    setIsCeremonyOpen(false);
    onToggleCorkboard();
  };

  return (
    <div className="w-full bg-[#FFFDF9] border border-[#1A3629]/15 rounded-3xl p-5 sm:p-6 shadow-[0_8px_32px_rgba(26,54,41,0.04)] flex flex-col gap-4">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1A3629]/10">
        <h3 className="font-cabinet font-extrabold text-base text-[#1A3629] tracking-tight">
          Evening Ledger &amp; Cadence
        </h3>
        <span className="font-mono text-xs font-bold text-[#1A3629]">
          {isAlreadySealed ? 'Sealed for Today' : isEligible ? 'Ceremony Available' : 'Day Cadence'}
        </span>
      </div>

      {/* Dual Bay: Left = Evening Ledger / Seal, Right = Sleep & Zen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
        
        {/* Left Slot: Evening Seal & Ledger Trigger */}
        <div className="flex flex-col justify-between gap-2.5 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#1A3629]/10">
          <div className="flex flex-col gap-0.5">
            <span className="font-cabinet font-bold text-xs text-[#1A3629]">
              30-Day Guild Ledger
            </span>
            <p className="font-sans text-[11px] text-[#4A5D4E] leading-snug">
              {isAlreadySealed
                ? `${pinnedCount} of 30 days sealed with wax.`
                : isEligible
                ? 'Wrap today with thermal receipt and seal.'
                : 'Locks at evening wrap window (3h before bedtime).'}
            </p>
          </div>

          <div className="flex flex-col gap-1.5 pt-1">
            {isEligible || isAlreadySealed ? (
              <button
                type="button"
                onClick={handleStartCeremony}
                className={`w-full py-2.5 px-3 rounded-xl font-cabinet font-bold text-xs transition-all cursor-pointer shadow-2xs active:scale-[0.98] text-center ${
                  isAlreadySealed
                    ? 'border border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9]'
                    : 'bg-[#1A3629] text-[#FFFDF9] hover:bg-[#2C4A3B]'
                }`}
              >
                {isAlreadySealed
                  ? 'View Sealed Ledger'
                  : 'Begin Seal Ceremony (+50 XP)'}
              </button>
            ) : (
              <button
                type="button"
                onClick={onToggleCorkboard}
                className="w-full py-2 px-3 rounded-xl border border-[#1A3629]/20 bg-[#FFFDF9] hover:bg-[#1A3629] hover:text-[#FFFDF9] font-cabinet font-bold text-xs text-[#1A3629] transition-all cursor-pointer text-center shadow-2xs"
              >
                {isCorkboardOpen ? 'Close Ledger View' : `Open 30-Day Ledger (${pinnedCount}/30)`}
              </button>
            )}

            {isAlreadySealed && (
              <button
                type="button"
                onClick={onOpenReceipt}
                className="text-center font-mono text-[10px] text-[#4A5D4E] hover:text-[#1A3629] cursor-pointer hover:underline py-0.5"
              >
                Inspect Thermal Receipt
              </button>
            )}
          </div>
        </div>

        {/* Right Slot: Sleep Target & Zen Ambience */}
        <div className="flex flex-col justify-between gap-2.5 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#1A3629]/10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-cabinet font-bold text-xs text-[#1A3629]">
                Circadian Cadence
              </span>
              <button
                type="button"
                onClick={onOpenSchedule}
                className="font-cabinet font-bold text-[11px] text-[#1A3629] hover:underline cursor-pointer flex items-center gap-1"
                title="Calibrate biological wake and sleep target"
              >
                <span>Calibrate</span>
                <span className="text-[10px]">⚙</span>
              </button>
            </div>

            {/* Structured Wake & Sleep Target Chips */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onOpenSchedule}
                className="p-2 rounded-xl bg-[#FFFDF9] border border-[#1A3629]/15 flex flex-col items-start gap-0.5 hover:border-[#1A3629]/40 transition-colors text-left cursor-pointer shadow-2xs group"
                title="Adjust Wake Target"
              >
                <div className="flex items-center gap-1 text-[10px] font-cabinet font-bold text-[#4A5D4E]">
                  <span>☀️</span>
                  <span>Wake Target</span>
                </div>
                <span className="font-mono text-xs font-extrabold text-[#1A3629] group-hover:text-[#2C4A3B]">
                  {wakeTime}
                </span>
              </button>

              <button
                type="button"
                onClick={onOpenSchedule}
                className="p-2 rounded-xl bg-[#FFFDF9] border border-[#1A3629]/15 flex flex-col items-start gap-0.5 hover:border-[#1A3629]/40 transition-colors text-left cursor-pointer shadow-2xs group"
                title="Adjust Rest Target"
              >
                <div className="flex items-center gap-1 text-[10px] font-cabinet font-bold text-[#4A5D4E]">
                  <span>🌙</span>
                  <span>Rest Target</span>
                </div>
                <span className="font-mono text-xs font-extrabold text-[#1A3629] group-hover:text-[#2C4A3B]">
                  {bedTime}
                </span>
              </button>
            </div>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                retroAudio.playBlip();
                haptics.tap();
                onOpenAmbient();
              }}
              className="w-full py-2 px-3 rounded-xl border border-[#1A3629]/20 bg-[#FFFDF9] hover:bg-[#1A3629] hover:text-[#FFFDF9] font-cabinet font-bold text-xs text-[#1A3629] transition-all cursor-pointer text-center shadow-2xs"
              title="Open full-screen Zen ambient living desk diorama (Hotkey A)"
            >
              Zen Ambience Display
            </button>
          </div>
        </div>

      </div>

      {/* Evening Seal Ceremony Overlay Modal */}
      <EveningSealCeremonyModal
        isOpen={isCeremonyOpen}
        onClose={() => setIsCeremonyOpen(false)}
        onComplete={handleCeremonyComplete}
      />
    </div>
  );
}
