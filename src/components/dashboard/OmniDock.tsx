'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { xpParticleEmitter } from '@/lib/particleEmitter';
import { parseQuickLog, ParsedCommand } from '@/lib/quickLogParser';
import { Droplets, Zap } from 'lucide-react';

export function OmniDock() {
  const {
    currentDate,
    deskRitualsByDate,
    getDailyLog,
    completeMorningBoot,
    completeEveningWrap,
    setProtein,
    setHydration,
    setSleep,
    setEnergy,
    toggleHabit,
    habits,
  } = useHabitStore();

  const currentLog = getDailyLog(currentDate);
  const ritual = deskRitualsByDate[currentDate] || {};

  const currentHour = new Date().getHours();
  const isMorning = currentHour < 12;
  const isEvening = currentHour >= 17;

  // Quick-Drop natural language state
  const [quickInput, setQuickInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Local state for morning inline chips
  const [morningSleep, setMorningSleep] = useState(currentLog.sleepHours || 7.5);
  const [morningRested, setMorningRested] = useState(ritual.morningRestedRating || 8);
  const [morningCaffeineDelay, setMorningCaffeineDelay] = useState(true);

  // Local state for evening inline chips
  const [eveningSlump, setEveningSlump] = useState(ritual.afternoonSlumpScore || 2);
  const [eveningScreenCutoff, setEveningScreenCutoff] = useState(true);

  // Parse natural language command live
  const parsedCmd = useMemo<ParsedCommand | null>(() => {
    return parseQuickLog(quickInput, habits);
  }, [quickInput, habits]);

  // Execute Quick-Drop command
  const handleExecuteQuickDrop = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickInput.trim()) return;

    if (!parsedCmd) {
      // Fallback: log as daily note
      retroAudio.playBlip();
      setFeedback(`Note recorded: "${quickInput.trim()}"`);
      setQuickInput('');
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    retroAudio.playInspectConfirm();
    xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 10);

    switch (parsedCmd.type) {
      case 'LOG_PROTEIN': {
        const amt = parsedCmd.payload?.amount || 25;
        const isRelative = parsedCmd.payload?.isRelative ?? true;
        const newTotal = isRelative ? (currentLog.totalProteinLogged || 0) + amt : amt;
        setProtein(newTotal, currentDate);
        setFeedback(`✓ Added +${amt}g Protein (Total: ${newTotal}g)`);
        break;
      }
      case 'LOG_HYDRATION': {
        const amt = parsedCmd.payload?.amount || 0.5;
        const isRelative = parsedCmd.payload?.isRelative ?? true;
        const newTotal = Number((isRelative ? (currentLog.hydrationLiters || 0) + amt : amt).toFixed(2));
        setHydration(newTotal, currentDate);
        setFeedback(`✓ Added +${amt}L Water (Total: ${newTotal}L)`);
        break;
      }
      case 'LOG_SLEEP': {
        const hrs = parsedCmd.payload?.hours || 7.5;
        setSleep(hrs, currentDate);
        setFeedback(`✓ Sleep updated to ${hrs} hours`);
        break;
      }
      case 'LOG_ENERGY': {
        const level = parsedCmd.payload?.level || 8;
        setEnergy(level, currentDate);
        setFeedback(`✓ Alertness rated ${level}/10`);
        break;
      }
      case 'TOGGLE_HABIT': {
        const habitId = parsedCmd.payload?.habitId;
        if (habitId) {
          toggleHabit(habitId, currentDate);
          setFeedback(`✓ Toggled habit "${parsedCmd.title}"`);
        }
        break;
      }
      default:
        setFeedback(`✓ Executed: ${parsedCmd.title}`);
        break;
    }

    setQuickInput('');
    setTimeout(() => setFeedback(null), 3200);
  };

  const handleMorningLock = () => {
    retroAudio.playTierUpgrade();
    xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 12);
    completeMorningBoot({
      sleepHours: morningSleep,
      restedRating: morningRested,
      sunlightDone: morningCaffeineDelay,
      targetFocusHours: 5,
    }, currentDate);
    setFeedback('✓ Morning Boot locked (+50 XP)');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleEveningSeal = () => {
    retroAudio.playTierUpgrade();
    xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 12);
    completeEveningWrap({
      caffeineCutoffRespected: eveningScreenCutoff,
      wholeFoodRating: 8,
      afternoonSlumpScore: eveningSlump,
    }, currentDate);
    setFeedback('✓ Evening Wrap sealed (+50 XP)');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div id="tour-omni-dock" className="w-full rounded-2xl border-2 border-[#1A3629] bg-[#FFFDF9] p-5 sm:p-6 shadow-[4px_4px_0px_#1A3629] flex flex-col gap-4">
      {/* Station Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1A3629]/15">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
          <h2 className="font-fraunces font-bold text-base sm:text-lg text-[#1A3629]">
            {isMorning
              ? 'Morning Boot · 10-Second Check-In'
              : isEvening
              ? 'Evening Wrap & Shutdown'
              : 'Midday Focus & Slump Defense'}
          </h2>
        </div>

        <span className="font-mono text-xs font-bold text-[#1A3629] bg-[#FAF6EE] border border-[#1A3629]/30 px-2.5 py-0.5 rounded-full">
          {isMorning && (ritual.morningBootCompleted ? '✓ Synced' : '+50 XP Available')}
          {!isMorning && !isEvening && 'Active Focus'}
          {isEvening && (ritual.eveningWrapCompleted ? '✓ Sealed' : '+50 XP Available')}
        </span>
      </div>

      {/* Layer 1: Time-Aware 1-Tap Tactile Chips */}
      {isMorning && (
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sleep hours stepper chip */}
          <button
            type="button"
            onClick={() => {
              retroAudio.playBlip();
              const next = morningSleep >= 9 ? 6 : Number((morningSleep + 0.5).toFixed(1));
              setMorningSleep(next);
            }}
            className="px-3 py-1.5 rounded-xl border-2 border-[#1A3629] bg-[#FAF8F5] text-[#1A3629] font-mono text-xs font-bold hover:bg-[#1A3629] hover:text-[#FFFDF9] shadow-[2px_2px_0px_#1A3629] transition-all cursor-pointer flex items-center gap-1.5"
            title="Click to cycle recorded sleep hours"
          >
            <span>Sleep:</span>
            <span className="tabular-nums font-black">{morningSleep}h</span>
          </button>

          {/* Rested rating chip */}
          <button
            type="button"
            onClick={() => {
              retroAudio.playBlip();
              const next = morningRested >= 10 ? 5 : morningRested + 1;
              setMorningRested(next);
            }}
            className="px-3 py-1.5 rounded-xl border-2 border-[#1A3629] bg-[#FAF8F5] text-[#1A3629] font-mono text-xs font-bold hover:bg-[#1A3629] hover:text-[#FFFDF9] shadow-[2px_2px_0px_#1A3629] transition-all cursor-pointer flex items-center gap-1.5"
            title="Click to adjust restedness rating"
          >
            <span>Rested:</span>
            <span className="tabular-nums font-black">{morningRested}/10</span>
          </button>

          {/* Caffeine Delay toggle chip */}
          <button
            type="button"
            onClick={() => {
              retroAudio.playBlip();
              setMorningCaffeineDelay(!morningCaffeineDelay);
            }}
            className={`px-3 py-1.5 rounded-xl border-2 border-[#1A3629] font-mono text-xs font-bold transition-all shadow-[2px_2px_0px_#1A3629] cursor-pointer flex items-center gap-1.5 ${
              morningCaffeineDelay
                ? 'bg-[#ECFDF5] text-[#065F46] border-[#065F46]'
                : 'bg-[#FAF8F5] text-[#1A3629]/70 border-[#1A3629]'
            }`}
          >
            <span>{morningCaffeineDelay ? '✓' : '○'}</span>
            <span>Delay Caffeine 90m</span>
          </button>

          {/* Commit Morning Boot Button */}
          {!ritual.morningBootCompleted ? (
            <button
              type="button"
              onClick={handleMorningLock}
              className="ml-auto px-4 py-1.5 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              Lock Morning Boot (+50 XP) →
            </button>
          ) : (
            <span className="ml-auto font-mono text-xs text-[#065F46] font-bold bg-[#ECFDF5] border border-[#10B981]/40 px-3 py-1.5 rounded-xl shadow-xs">
              ✓ Morning Boot Locked
            </span>
          )}
        </div>
      )}

      {!isMorning && !isEvening && (
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              retroAudio.playInspectConfirm();
              const next = Number(((currentLog.hydrationLiters || 0) + 0.5).toFixed(2));
              setHydration(next, currentDate);
              xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 6);
              setFeedback('✓ Hydration logged (+500ml)');
              setTimeout(() => setFeedback(null), 2500);
            }}
            className="px-3.5 py-1.5 rounded-xl border-2 border-[#1A3629] bg-[#FAF8F5] text-[#1A3629] font-mono text-xs font-bold hover:bg-[#1A3629] hover:text-[#FFFDF9] shadow-[2px_2px_0px_#1A3629] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Droplets className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Drink +500ml Water</span>
          </button>

          <button
            type="button"
            onClick={() => {
              retroAudio.playInspectConfirm();
              const next = Math.min(10, (currentLog.energyLevel || 7) + 1);
              setEnergy(next, currentDate);
              xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 6);
              setFeedback(`✓ Alertness updated to ${next}/10`);
              setTimeout(() => setFeedback(null), 2500);
            }}
            className="px-3.5 py-1.5 rounded-xl border-2 border-[#1A3629] bg-[#FAF8F5] text-[#1A3629] font-mono text-xs font-bold hover:bg-[#1A3629] hover:text-[#FFFDF9] shadow-[2px_2px_0px_#1A3629] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Rate Alertness ({currentLog.energyLevel || 7}/10)</span>
          </button>

          <span className="ml-auto font-mono text-xs text-[#4A5D4E]">
            Deep Focus Block Active
          </span>
        </div>
      )}

      {isEvening && (
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Slump score chip */}
          <button
            type="button"
            onClick={() => {
              retroAudio.playBlip();
              const next = eveningSlump >= 5 ? 1 : eveningSlump + 1;
              setEveningSlump(next);
            }}
            className="px-3 py-1.5 rounded-xl border-2 border-[#1A3629] bg-[#FAF8F5] text-[#1A3629] font-mono text-xs font-bold hover:bg-[#1A3629] hover:text-[#FFFDF9] shadow-[2px_2px_0px_#1A3629] transition-all cursor-pointer flex items-center gap-1.5"
            title="Click to adjust afternoon slump severity (1=Mild, 5=Severe)"
          >
            <span>Afternoon Slump:</span>
            <span className="tabular-nums font-black">{eveningSlump}/5 ({eveningSlump <= 2 ? 'Mild' : 'Heavy'})</span>
          </button>

          {/* Screen cutoff toggle chip */}
          <button
            type="button"
            onClick={() => {
              retroAudio.playBlip();
              setEveningScreenCutoff(!eveningScreenCutoff);
            }}
            className={`px-3 py-1.5 rounded-xl border-2 border-[#1A3629] font-mono text-xs font-bold transition-all shadow-[2px_2px_0px_#1A3629] cursor-pointer flex items-center gap-1.5 ${
              eveningScreenCutoff
                ? 'bg-[#ECFDF5] text-[#065F46] border-[#065F46]'
                : 'bg-[#FAF8F5] text-[#1A3629]/70 border-[#1A3629]'
            }`}
          >
            <span>{eveningScreenCutoff ? '✓' : '○'}</span>
            <span>Screen Cutoff Respected</span>
          </button>

          {/* Commit Evening Wrap Button */}
          {!ritual.eveningWrapCompleted ? (
            <button
              type="button"
              onClick={handleEveningSeal}
              className="ml-auto px-4 py-1.5 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              Seal Evening Wrap (+50 XP) →
            </button>
          ) : (
            <span className="ml-auto font-mono text-xs text-[#065F46] font-bold bg-[#ECFDF5] border border-[#10B981]/40 px-3 py-1.5 rounded-xl shadow-xs">
              ✓ Evening Wrap Sealed
            </span>
          )}
        </div>
      )}

      {/* Layer 2: Quiet Inline Quick-Drop Natural Language Input Bar */}
      <form onSubmit={handleExecuteQuickDrop} className="w-full flex flex-col gap-2 pt-1">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Quick Drop: type 'ate 35g protein' or 'drank 500ml' or 'slept 8h'..."
            className="w-full h-11 pl-4 pr-20 rounded-xl border-2 border-[#1A3629]/30 focus:border-[#1A3629] bg-[#FAF8F5] text-[#1A3629] font-mono text-xs placeholder:text-[#1A3629]/40 outline-none transition-all focus:bg-[#FFFDF9] shadow-inner"
          />

          <button
            type="submit"
            disabled={!quickInput.trim()}
            className={`absolute right-2 px-3.5 h-7 rounded-lg border text-xs font-mono font-bold transition-all flex items-center justify-center ${
              quickInput.trim()
                ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] cursor-pointer shadow-xs active:scale-95'
                : 'bg-[#EAE3D2]/50 text-[#1A3629]/40 border-transparent cursor-not-allowed'
            }`}
          >
            Log ↵
          </button>
        </div>

        {/* Dedicated live parser detection preview row — eliminates any text collision */}
        {parsedCmd && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ECFDF5] border border-[#10B981]/40 text-xs font-mono text-[#065F46] font-bold animate-in fade-in duration-150">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shrink-0" />
            <span className="truncate">Detected: <strong>{parsedCmd.title}</strong></span>
            <span className="ml-auto text-[10px] text-[#065F46]/70 shrink-0 hidden sm:inline">Press Enter to log</span>
          </div>
        )}

        {/* Transient Feedback Message */}
        {feedback && (
          <div className="text-xs font-mono font-bold text-[#065F46] bg-[#ECFDF5] border border-[#10B981]/40 px-3 py-1.5 rounded-lg flex items-center justify-between animate-in fade-in">
            <span>{feedback}</span>
            <span className="text-[10px] text-[#065F46]/60">Telemetry Synced</span>
          </div>
        )}
      </form>
    </div>
  );
}
