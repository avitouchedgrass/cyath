'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useHabitStore } from '@/store/useHabitStore';
import { getDailyCommandProtocol } from '@/lib/dailyProtocolEngine';
import { xpParticleEmitter } from '@/lib/particleEmitter';
import { getRelativeLocalDate, parseLocalDate } from '@/lib/dateUtils';
import { shouldTriggerRecoveryDownscale, DOWNSCALED_FOCUS_PROTOCOL } from '@/lib/engines/reentryEngine';

export function CommandProtocolCard() {
  const {
    currentDate,
    userProfile,
    getDailyLog,
    dailyProtocolsAcceptedByDate,
    dailyProtocolsCompletedByDate,
    deskRitualsByDate,
    acceptDailyProtocol,
    completeDailyProtocol,
  } = useHabitStore();

  const currentLog = getDailyLog(currentDate);
  const ritual = deskRitualsByDate[currentDate] || {};

  const isDownscaled = useMemo(() => {
    if (currentLog.isDownscaled) return true;
    return shouldTriggerRecoveryDownscale({
      sleepHours: currentLog.sleepHours,
      morningRestedRating: ritual.morningRestedRating,
    });
  }, [currentLog.isDownscaled, currentLog.sleepHours, ritual.morningRestedRating]);

  const yesterdayDate = useMemo(() => getRelativeLocalDate(-1, parseLocalDate(currentDate)), [currentDate]);
  const yesterdayLog = useMemo(() => getDailyLog(yesterdayDate), [getDailyLog, yesterdayDate]);

  const rawProtocol = useMemo(() => {
    return getDailyCommandProtocol(currentDate, userProfile?.primaryGoal, yesterdayLog);
  }, [currentDate, userProfile?.primaryGoal, yesterdayLog]);

  const protocol = useMemo(() => {
    if (isDownscaled) {
      return {
        ...rawProtocol,
        title: DOWNSCALED_FOCUS_PROTOCOL.title,
        directive: DOWNSCALED_FOCUS_PROTOCOL.directive,
        mechanism: DOWNSCALED_FOCUS_PROTOCOL.mechanism,
        expectedGain: '15m Micro-Sprint · Zero Burnout',
        category: 'recovery' as const,
      };
    }
    return rawProtocol;
  }, [isDownscaled, rawProtocol]);


  const isAccepted = !!dailyProtocolsAcceptedByDate[currentDate];
  const isCompleted = !!dailyProtocolsCompletedByDate[currentDate];

  const handleAccept = (e: React.MouseEvent) => {
    xpParticleEmitter.emit(e.clientX, e.clientY, 6);
    acceptDailyProtocol(currentDate);
  };

  const handleComplete = (e: React.MouseEvent) => {
    xpParticleEmitter.emit(e.clientX, e.clientY, 8);
    completeDailyProtocol(currentDate);
  };

  return (
    <section 
      aria-labelledby="daily-protocol-title"
      className="w-full border-2 border-[#1A3629] bg-[#FFFDF9] rounded-2xl p-6 sm:p-7 shadow-[4px_4px_0px_#1A3629] flex flex-col gap-5 transition-all"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1A3629]/15">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-md border border-[#1A3629] bg-[#FAF6EE] text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A3629]">
            Daily Focus Protocol · {protocol.category}
          </span>
          {isDownscaled && (
            <span className="px-2.5 py-0.5 rounded-md border border-[#D97706]/40 bg-[#FEF3C7] text-[10px] font-mono font-bold text-[#92400E]">
              [MINIMUM VIABLE RE-ENTRY ACTIVE]
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-md border border-[#10B981]/40 bg-[#ECFDF5] text-[10px] font-mono font-bold text-[#065F46]">
            {protocol.expectedGain}
          </span>
        </div>


        <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#4A5D4E]">
          <span>Reward:</span>
          <span className="px-2 py-0.5 rounded border border-[#10B981]/50 bg-[#ECFDF5] text-[#065F46]">
            +{protocol.xpReward} XP
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 
          id="daily-protocol-title"
          className="font-cabinet font-extrabold text-2xl sm:text-3xl text-[#1A3629] tracking-tight leading-tight"
        >
          {protocol.title}
        </h2>

        <div className="border border-[#1A3629]/15 bg-[#FAF6EE] px-4 py-3.5 rounded-2xl">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#92400E] block mb-1">
            Exact Directive
          </span>
          <p className="font-cabinet font-bold text-sm sm:text-base text-[#1A3629] leading-relaxed">
            {protocol.directive}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2563EB]">
            1. Scientific Hypothesis
          </span>
          <p className="text-xs font-cabinet font-medium text-[#2C4A3B] leading-relaxed">
            {protocol.hypothesis}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#059669]">
            2. Biological Mechanism
          </span>
          <p className="text-xs font-cabinet font-medium text-[#2C4A3B] leading-relaxed">
            {protocol.mechanism}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-[#1A3629]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap text-xs font-cabinet">
          {protocol.recipeTitle && (
            <span className="font-bold text-[#1A3629]">
              Fuel Synergy: {protocol.recipeTitle}
            </span>
          )}

          <Link
            href="/protocols"
            className="text-[#4A5D4E] hover:text-[#1A3629] transition-colors cursor-pointer"
          >
            All Protocols →
          </Link>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!isAccepted ? (
            <button
              type="button"
              onClick={handleAccept}
              className="px-5 py-2.5 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs shadow-[3px_3px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              Accept Protocol &amp; Commit (+50 XP)
            </button>
          ) : !isCompleted ? (
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 rounded-xl border border-[#10B981] bg-[#ECFDF5] text-[#065F46] font-mono text-xs font-bold">
                ✓ Committed
              </span>
              <button
                type="button"
                onClick={handleComplete}
                className="px-4 py-2 rounded-xl border-2 border-[#10B981] bg-[#10B981] text-[#FFFDF9] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#065F46] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
              >
                Mark Accomplished (+50 XP)
              </button>
            </div>
          ) : (
            <div className="px-4 py-2 rounded-xl border-2 border-[#10B981] bg-[#ECFDF5] text-[#065F46] font-mono text-xs font-bold shadow-[2px_2px_0px_#10B981]">
              ✓ Protocol Mastered · +100 Total XP Awarded
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
