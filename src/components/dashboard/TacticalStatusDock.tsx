'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useHabitStore } from '@/store/useHabitStore';
import { calculateLevel } from '@/lib/progression/engine';
import { getIslandTier } from '@/lib/progression/config';
import { retroAudio } from '@/lib/retroAudio';
import { MorningBootModal } from './MorningBootModal';
import { EveningWrapModal } from './EveningWrapModal';

export function TacticalStatusDock() {
  const { currentDate, deskRitualsByDate, totalXp, streakCount } = useHabitStore();
  const [isMorningModalOpen, setIsMorningModalOpen] = useState(false);
  const [isEveningModalOpen, setIsEveningModalOpen] = useState(false);

  const ritualData = deskRitualsByDate[currentDate] || {};
  const morningDone = !!ritualData.morningBootCompleted;
  const eveningDone = !!ritualData.eveningWrapCompleted;

  const progress = calculateLevel(totalXp);
  const islandTier = getIslandTier(progress.level);

  const phase = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'midday';
    return 'evening';
  }, []);

  return (
    <>
      <section 
        aria-label="Daily Telemetry and Desk Rituals"
        className="w-full border-2 border-[#1A3629] bg-[#FFFDF9] rounded-2xl p-5 shadow-[3px_3px_0px_#1A3629] flex flex-col gap-4 transition-all"
      >
        {/* Progression & Sanctuary Block */}
        <div className="flex flex-col gap-3 pb-3.5 border-b border-[#1A3629]/15">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#1A3629] text-[#FFFDF9] font-mono font-black text-xs flex items-center justify-center">
                L{progress.level}
              </span>
              <div>
                <span className="font-cabinet font-bold text-xs text-[#1A3629] block leading-tight">
                  {islandTier.name}
                </span>
                <span className="font-mono text-[10px] text-[#4A5D4E] block">
                  Phase {islandTier.tier} · {progress.totalXp} XP
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full border border-[#1A3629]/20 bg-[#FAF6EE] text-[11px] font-mono font-bold text-[#1A3629] tabular-nums">
                {streakCount} {streakCount === 1 ? 'Day Streak' : 'Days Streak'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#4A5D4E]">Level Progress</span>
              <span className="font-bold text-[#1A3629]">
                {progress.isMaxLevel ? 'Max Level' : `${progress.currentLevelXp} / ${progress.xpForNextLevel} XP`}
              </span>
            </div>
            <div className="w-full h-2 bg-[#EAE3D2] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1A3629] rounded-full transition-all duration-500"
                style={{ width: `${progress.progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <Link
              href="/sanctuary"
              className="text-xs font-cabinet font-bold text-[#1A3629] hover:text-[#065F46] hover:underline cursor-pointer"
            >
              Sanctuary Island →
            </Link>
            <span className="text-[10px] font-mono text-[#4A5D4E]">
              {progress.progressPercent}% to next level
            </span>
          </div>
        </div>

        {/* Desk Ritual Command Block */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E]">
              {phase === 'morning' ? 'Desk Boot Phase (<12 PM)' : phase === 'midday' ? 'Deep Work Sprint (12–5 PM)' : 'Desk Wrap Phase (5 PM+)'}
            </span>
            {(phase === 'morning' && morningDone) || (phase === 'evening' && eveningDone) ? (
              <span className="px-2 py-0.5 rounded border border-[#10B981]/40 bg-[#ECFDF5] text-[#065F46] font-mono text-[10px] font-bold">
                ✓ Sealed
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded border border-[#D97706]/40 bg-[#FEF3C7] text-[#92400E] font-mono text-[10px] font-bold">
                Action Pending
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="font-fraunces font-bold text-base text-[#1A3629] leading-snug">
              {phase === 'morning'
                ? morningDone
                  ? 'Morning Baseline Calibrated'
                  : '10-Second Morning Boot Check-in'
                : phase === 'midday'
                ? 'Deep Work Sprint Active'
                : eveningDone
                ? 'Desk Wrap Sealed · Daily Log Saved'
                : '15-Second Desk Shutdown Pending'}
            </h3>
            <p className="text-xs font-cabinet text-[#2C4A3B] leading-relaxed">
              {phase === 'morning'
                ? 'Anchor sleep, daylight exposure, and target focus hours before starting.'
                : phase === 'midday'
                ? 'Protect working memory. Keep browser context switching minimal.'
                : 'Log caffeine cutoff, meal quality, and afternoon energy dip.'}
            </p>
          </div>

          <div className="pt-1">
            {phase === 'morning' && (
              <button
                type="button"
                onClick={() => {
                  retroAudio.playInspectConfirm();
                  setIsMorningModalOpen(true);
                }}
                className={`w-full py-2.5 px-4 rounded-xl border-2 font-cabinet font-bold text-xs transition-all cursor-pointer flex items-center justify-center ${
                  morningDone
                    ? 'bg-[#FAF6EE] border-[#1A3629] text-[#1A3629] hover:bg-[#FFFDF9]'
                    : 'bg-[#1A3629] border-[#1A3629] text-[#FFFDF9] shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
                }`}
              >
                {morningDone ? 'Review Morning Boot' : 'Start Morning Boot (+50 XP)'}
              </button>
            )}

            {phase === 'midday' && (
              <button
                type="button"
                onClick={() => {
                  retroAudio.playInspectConfirm();
                  if (!morningDone) {
                    setIsMorningModalOpen(true);
                  } else {
                    setIsEveningModalOpen(true);
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl border-2 border-[#1A3629] bg-[#FAF6EE] hover:bg-[#FFFDF9] text-[#1A3629] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer flex items-center justify-center"
              >
                {morningDone ? 'Pre-log Evening Wrap →' : 'Log Morning Boot (+50 XP) →'}
              </button>
            )}

            {phase === 'evening' && (
              <button
                type="button"
                onClick={() => {
                  retroAudio.playInspectConfirm();
                  setIsEveningModalOpen(true);
                }}
                className={`w-full py-2.5 px-4 rounded-xl border-2 font-cabinet font-bold text-xs transition-all cursor-pointer flex items-center justify-center ${
                  eveningDone
                    ? 'bg-[#FAF6EE] border-[#1A3629] text-[#1A3629] hover:bg-[#FFFDF9]'
                    : 'bg-[#1A3629] border-[#1A3629] text-[#FFFDF9] shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
                }`}
              >
                {eveningDone ? 'Review Desk Wrap' : 'Seal Desk Wrap (+50 XP)'}
              </button>
            )}
          </div>
        </div>
      </section>

      <MorningBootModal
        isOpen={isMorningModalOpen}
        onClose={() => setIsMorningModalOpen(false)}
      />
      <EveningWrapModal
        isOpen={isEveningModalOpen}
        onClose={() => setIsEveningModalOpen(false)}
      />
    </>
  );
}
