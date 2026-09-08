'use client';

import React, { useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { xpParticleEmitter } from '@/lib/particleEmitter';

export function SmartRitualCard() {
  const { currentDate, deskRitualsByDate, completeMorningBoot, completeEveningWrap, getDailyLog } =
    useHabitStore();

  const currentLog = getDailyLog(currentDate);
  const ritual = deskRitualsByDate[currentDate] || {};

  const currentHour = new Date().getHours();
  const isMorning = currentHour < 12;
  const isEvening = currentHour >= 17;

  // Local state for fast inline morning logging
  const [sleepHours, setSleepHours] = useState(currentLog.sleepHours || 7.5);
  const [restedRating, setRestedRating] = useState(ritual.morningRestedRating || 8);
  const [delayCaffeine, setDelayCaffeine] = useState(true);

  // Local state for fast inline evening logging
  const [slumpScore, setSlumpScore] = useState(ritual.afternoonSlumpScore || 2);
  const [screenCutoff, setScreenCutoff] = useState(true);

  const handleMorningSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    retroAudio.playInspectConfirm();
    xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 10);
    completeMorningBoot({
      sleepHours,
      restedRating,
      sunlightDone: delayCaffeine,
      targetFocusHours: 5,
    }, currentDate);
  };

  const handleEveningSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    retroAudio.playInspectConfirm();
    xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 10);
    completeEveningWrap({
      caffeineCutoffRespected: screenCutoff,
      wholeFoodRating: 8,
      afternoonSlumpScore: slumpScore,
    }, currentDate);
  };

  // 1. Morning View (before 12:00 PM or if morning boot incomplete)
  if (!ritual.morningBootCompleted && (isMorning || !ritual.eveningWrapCompleted)) {
    return (
      <div className="w-full rounded-2xl border-2 border-[#1A3629] bg-[#FAF8F5] p-4 sm:p-5 shadow-[4px_4px_0px_#1A3629]">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1A3629]/15">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A3629]">
              MORNING BOOT · 10-SECOND CHECK-IN
            </span>
          </div>
          <span className="font-mono text-xs font-bold text-[#1A3629] bg-[#EAE3D2] px-2 py-0.5 rounded">
            +50 XP
          </span>
        </div>

        <form onSubmit={handleMorningSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Sleep Hours */}
            <div className="flex flex-col gap-1">
              <label className="font-mono font-bold text-[11px] text-[#1A3629]">
                Recorded Sleep
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="4"
                  max="12"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border-2 border-[#1A3629] bg-[#FFFDF9] font-mono font-bold text-xs"
                />
                <span className="font-mono font-bold text-xs text-[#1A3629]">hrs</span>
              </div>
            </div>

            {/* Rested Rating */}
            <div className="flex flex-col gap-1">
              <label className="font-mono font-bold text-[11px] text-[#1A3629]">
                Rested Score: {restedRating}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={restedRating}
                onChange={(e) => setRestedRating(Number(e.target.value))}
                className="w-full accent-[#1A3629] cursor-pointer mt-1"
              />
            </div>

            {/* Delay Caffeine */}
            <div className="flex items-center gap-2 sm:pt-4 cursor-pointer" onClick={() => setDelayCaffeine(!delayCaffeine)}>
              <div
                className={`w-4 h-4 rounded border-2 border-[#1A3629] flex items-center justify-center transition-colors ${
                  delayCaffeine ? 'bg-[#1A3629] text-[#FFFDF9]' : 'bg-[#FFFDF9]'
                }`}
              >
                {delayCaffeine && <span className="text-[10px] font-bold">✓</span>}
              </div>
              <span className="font-cabinet text-xs font-bold text-[#1A3629] select-none">
                Delay caffeine 90m
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-mono text-xs font-bold shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer text-center mt-1"
          >
            Lock Morning Boot (+50 XP) →
          </button>
        </form>
      </div>
    );
  }

  // 2. Evening View (after 5:00 PM and wrap not yet completed)
  if (isEvening && !ritual.eveningWrapCompleted) {
    return (
      <div className="w-full rounded-2xl border-2 border-[#1A3629] bg-[#FAF8F5] p-4 sm:p-5 shadow-[4px_4px_0px_#1A3629]">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1A3629]/15">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A3629]">
              EVENING WRAP &amp; SHUTDOWN · 8-SECOND CLOSE
            </span>
          </div>
          <span className="font-mono text-xs font-bold text-[#1A3629] bg-[#EAE3D2] px-2 py-0.5 rounded">
            +50 XP
          </span>
        </div>

        <form onSubmit={handleEveningSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Afternoon Slump Score */}
            <div className="flex flex-col gap-1">
              <label className="font-mono font-bold text-[11px] text-[#1A3629]">
                Afternoon Slump Severity: {slumpScore}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={slumpScore}
                onChange={(e) => setSlumpScore(Number(e.target.value))}
                className="w-full accent-[#1A3629] cursor-pointer mt-1"
              />
              <span className="font-mono text-[10px] text-[#4A5D4E]">
                {slumpScore <= 3 ? 'Minimal / Clear focus' : slumpScore <= 6 ? 'Moderate dip' : 'Severe brain fog'}
              </span>
            </div>

            {/* Screen Cutoff */}
            <div className="flex items-center gap-2 sm:pt-4 cursor-pointer" onClick={() => setScreenCutoff(!screenCutoff)}>
              <div
                className={`w-4 h-4 rounded border-2 border-[#1A3629] flex items-center justify-center transition-colors ${
                  screenCutoff ? 'bg-[#1A3629] text-[#FFFDF9]' : 'bg-[#FFFDF9]'
                }`}
              >
                {screenCutoff && <span className="text-[10px] font-bold">✓</span>}
              </div>
              <span className="font-cabinet text-xs font-bold text-[#1A3629] select-none">
                Screen shutdown 60m before bed
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-mono text-xs font-bold shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer text-center mt-1"
          >
            Seal Evening Wrap &amp; Shutdown (+50 XP) →
          </button>
        </form>
      </div>
    );
  }

  // 3. Completed State: Quiet, serene summary pill
  return (
    <div className="w-full rounded-xl border border-[#1A3629]/20 bg-[#FAF8F5] px-4 py-2.5 flex items-center justify-between text-xs font-mono">
      <div className="flex items-center gap-2">
        <span className="text-[#065F46] font-bold">✓</span>
        <span className="font-bold text-[#1A3629]">
          {ritual.eveningWrapCompleted
            ? 'Evening Wrap Sealed'
            : 'Morning Boot Primed'}
        </span>
        <span className="text-[#4A5D4E] text-[11px] hidden sm:inline">
          {ritual.eveningWrapCompleted
            ? `· Melatonin Gate active`
            : `· ${ritual.morningRestedRating || 8}/10 Rested`}
        </span>
      </div>

      <span className="text-[10px] text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#065F46]/20 font-bold">
        Ritual Complete
      </span>
    </div>
  );
}
