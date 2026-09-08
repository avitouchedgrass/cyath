'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useHabitStore } from '@/store/useHabitStore';
import { getDailyBriefing } from '@/lib/dailyProtocolEngine';
import { getRelativeLocalDate, parseLocalDate } from '@/lib/dateUtils';

export function StoveSageBriefingCard() {
  const { currentDate, userProfile, getDailyLog } = useHabitStore();

  const yesterdayDate = useMemo(() => getRelativeLocalDate(-1, parseLocalDate(currentDate)), [currentDate]);
  const yesterdayLog = useMemo(() => getDailyLog(yesterdayDate), [getDailyLog, yesterdayDate]);

  const briefing = useMemo(() => {
    return getDailyBriefing(currentDate, userProfile, yesterdayLog);
  }, [currentDate, userProfile, yesterdayLog]);

  const handleOpenCoach = () => {
    window.dispatchEvent(new CustomEvent('open-ai-coach'));
  };

  return (
    <section 
      aria-label="StoveSage Daily Intelligence Briefing"
      className="w-full border-2 border-[#1A3629] bg-[#FFFDF9] rounded-2xl p-5 shadow-[3px_3px_0px_#1A3629] flex flex-col gap-4 transition-all"
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#1A3629]/15 pb-3">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E] block mb-0.5">
            StoveSage · Intelligence Briefing
          </span>
          <h3 className="font-fraunces font-bold text-lg text-[#1A3629] leading-tight">
            {briefing.greeting}
          </h3>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-[#10B981]/40 bg-[#ECFDF5] text-[10px] font-mono font-bold text-[#065F46]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          {briefing.statusBadge}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A3629]">
          Physiological Feedback
        </span>
        <ul className="space-y-1.5">
          {briefing.yesterdayHighlights.map((highlight, idx) => (
            <li
              key={idx}
              className="text-xs font-cabinet font-medium text-[#2C4A3B] flex items-start gap-2 bg-[#FAF6EE] p-2.5 rounded-xl border border-[#1A3629]/15"
            >
              <span className="text-[#059669] font-bold text-base leading-none select-none">·</span>
              <span className="leading-relaxed">{highlight}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-2 border-t border-[#1A3629]/15 flex flex-col gap-3">
        {briefing.recommendedRecipeSlug ? (
          <Link
            href={`/recipes/${briefing.recommendedRecipeSlug}`}
            className="text-xs font-cabinet font-bold text-[#1A3629] hover:text-[#065F46] underline transition-colors cursor-pointer"
          >
            Recommended Fuel: {briefing.recommendedRecipeTitle} →
          </Link>
        ) : (
          <span className="text-xs font-cabinet text-[#4A5D4E]">
            Whole-food metabolic alignment primed.
          </span>
        )}

        <button
          type="button"
          onClick={handleOpenCoach}
          className="w-full py-2 px-3 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer flex items-center justify-center"
        >
          Consult AI Coach (⌘J)
        </button>
      </div>
    </section>
  );
}
