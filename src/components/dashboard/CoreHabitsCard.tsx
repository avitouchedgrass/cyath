'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { xpParticleEmitter } from '@/lib/particleEmitter';
import { shouldTriggerRecoveryDownscale, DOWNSCALED_MICRO_HABITS } from '@/lib/engines/reentryEngine';
import { XP_MATRIX } from '@/lib/constants/xpMatrix';
import { Check, Sun, Moon, Utensils, ChevronDown, Plus, ShieldCheck, ChevronUp } from 'lucide-react';

export function CoreHabitsCard() {
  const {
    habits,
    currentDate,
    getDailyLog,
    toggleHabit,
    addCustomHabit,
    deskRitualsByDate,
    completeMorningBoot,
    completeEveningWrap,
    userProfile,
  } = useHabitStore();

  const [activeDrawer, setActiveDrawer] = useState<'none' | 'morning' | 'evening'>('none');
  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Morning Boot inline drawer state
  const [morningSleep, setMorningSleep] = useState<number>(7.5);
  const [morningRested, setMorningRested] = useState<number>(4);
  const [morningSunlight, setMorningSunlight] = useState<boolean>(true);

  // Evening Wrap inline drawer state
  const [eveningCaffeine, setEveningCaffeine] = useState<'none' | 'before_cutoff' | 'after_cutoff'>('before_cutoff');
  const [eveningSlump, setEveningSlump] = useState<number>(2);

  const currentLog = getDailyLog(currentDate);
  const ritual = deskRitualsByDate[currentDate] || {};

  const targetProtein = userProfile?.weightKg ? Math.round(userProfile.weightKg * 2.0) : 140;
  const currentProtein = currentLog.totalProteinLogged || 0;
  const isProteinMet = currentProtein >= targetProtein;

  // Check if minimum viable re-entry is triggered
  const isDownscaled = useMemo(() => {
    if (currentLog.isDownscaled) return true;
    return shouldTriggerRecoveryDownscale({
      sleepHours: currentLog.sleepHours,
      morningRestedRating: ritual.morningRestedRating,
    });
  }, [currentLog.isDownscaled, currentLog.sleepHours, ritual.morningRestedRating]);

  // If downscaled: active habits are the 3 essential micro-habits; otherwise standard core habits
  const activeHabits = useMemo(() => {
    if (isDownscaled) {
      return DOWNSCALED_MICRO_HABITS.map((m) => ({
        id: m.id,
        title: m.title,
        category: m.category,
        benefit: m.benefit,
        targetDaysPerWeek: 7,
      }));
    }
    return habits.slice(0, 3).map((h) => ({
      ...h,
      benefit: getHabitBenefit(h.title, h.category),
    }));
  }, [isDownscaled, habits]);

  const secondaryHabits = useMemo(() => {
    if (isDownscaled) return [];
    return habits.slice(3);
  }, [isDownscaled, habits]);

  const completedCount = useMemo(() => {
    return activeHabits.filter((h) => currentLog.habitsCompleted[h.id]).length;
  }, [activeHabits, currentLog.habitsCompleted]);

  const handleToggle = useCallback((habitId: string, event?: React.MouseEvent) => {
    const isDone = !!currentLog.habitsCompleted[habitId];
    if (!isDone) {
      retroAudio.playInspectConfirm();
      if (typeof window !== 'undefined' && event) {
        xpParticleEmitter.emit(event.clientX, event.clientY, 10);
      }
      if (completedCount === activeHabits.length - 1) {
        retroAudio.playTierUpgrade();
        if (typeof window !== 'undefined') {
          xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 25);
        }
      }
    } else {
      retroAudio.playBlip();
    }
    toggleHabit(habitId, currentDate);
  }, [currentLog.habitsCompleted, completedCount, activeHabits.length, toggleHabit, currentDate]);

  // Power-User Accelerators: keys 1, 2, 3 toggle core habits; Esc dismisses drawers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.key === 'Escape') {
        if (activeDrawer !== 'none') {
          setActiveDrawer('none');
        }
        return;
      }

      if (e.key === '1' && activeHabits[0]) {
        e.preventDefault();
        handleToggle(activeHabits[0].id);
      } else if (e.key === '2' && activeHabits[1]) {
        e.preventDefault();
        handleToggle(activeHabits[1].id);
      } else if (e.key === '3' && activeHabits[2]) {
        e.preventDefault();
        handleToggle(activeHabits[2].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeHabits, activeDrawer, handleToggle]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    retroAudio.playInspectConfirm();
    addCustomHabit(newTitle.trim());
    setNewTitle('');
    setShowAddForm(false);
  };

  const handleSaveMorningBoot = () => {
    completeMorningBoot({
      sleepHours: morningSleep,
      restedRating: morningRested,
      sunlightDone: morningSunlight,
      targetFocusHours: 4,
    }, currentDate);
    retroAudio.playInspectConfirm();
    setActiveDrawer('none');
  };

  const handleSaveEveningWrap = () => {
    completeEveningWrap({
      caffeineCutoffRespected: eveningCaffeine !== 'after_cutoff',
      caffeineStatus: eveningCaffeine,
      wholeFoodRating: 4,
      afternoonSlumpScore: eveningSlump,
    }, currentDate);
    retroAudio.playInspectConfirm();
    setActiveDrawer('none');
  };

  function getHabitBenefit(title: string, category: string): string {
    const lower = title.toLowerCase();
    if (lower.includes('sunlight') || lower.includes('light')) return '15m natural morning light & hydration';
    if (lower.includes('protein') || lower.includes('fuel')) return `Target: ${targetProtein}g whole-food protein floor`;
    if (lower.includes('cardio') || lower.includes('resistance') || lower.includes('movement')) return '30m zone 2 aerobic or strength session';
    if (lower.includes('water') || lower.includes('hydration')) return '2.0L clean hydration checkpoint';
    return `${category.charAt(0).toUpperCase() + category.slice(1)} · Daily consistency`;
  }

  return (
    <div
      id="tour-core-habits"
      className="w-full h-full min-h-0 sm:min-h-[350px] rounded-3xl border border-[#1A3629]/15 bg-[#FFFDF9] p-4 sm:p-6 shadow-[2px_2px_0px_rgba(26,54,41,0.08)] hover:border-[#1A3629]/25 transition-all duration-300 flex flex-col justify-between gap-4 sm:gap-5"
    >
      <div>
        {/* 1. Zero-Modal 3-Stage Daily Stepper Bar */}
        <div className="pb-3.5 border-b border-[#1A3629]/10">
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#FAF8F5] border border-[#1A3629]/12">
            
            {/* Step 1: Morning Boot */}
            <button
              type="button"
              aria-expanded={activeDrawer === 'morning'}
              onClick={() => {
                retroAudio.playBlip();
                setActiveDrawer(activeDrawer === 'morning' ? 'none' : 'morning');
              }}
              className={`p-2 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-0.5 select-none ${
                ritual.morningBootCompleted
                  ? 'bg-[#ECFDF5] border border-[#10B981]/30 text-[#065F46]'
                  : activeDrawer === 'morning'
                  ? 'bg-[#1A3629] text-[#FFFDF9] shadow-2xs'
                  : 'bg-[#FFFDF9] border border-[#1A3629]/10 text-[#1A3629] hover:border-[#1A3629]/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
                  1. Morning
                </span>
                <Sun className="w-3 h-3 shrink-0" />
              </div>
              <span className="font-cabinet font-bold text-xs truncate">
                {ritual.morningBootCompleted ? 'Done ✓' : 'Boot →'}
              </span>
            </button>

            {/* Step 2: Protein Floor */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('tour-fuel-anchor');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className={`p-2 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-0.5 select-none ${
                isProteinMet
                  ? 'bg-[#ECFDF5] border border-[#10B981]/30 text-[#065F46]'
                  : 'bg-[#FFFDF9] border border-[#1A3629]/10 text-[#1A3629] hover:border-[#1A3629]/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
                  2. Protein
                </span>
                <Utensils className="w-3 h-3 shrink-0" />
              </div>
              <span className="font-cabinet font-bold text-xs truncate">
                {isProteinMet ? 'Floor Met ✓' : `${currentProtein}/${targetProtein}g`}
              </span>
            </button>

            {/* Step 3: Evening Wrap */}
            <button
              type="button"
              aria-expanded={activeDrawer === 'evening'}
              onClick={() => {
                retroAudio.playBlip();
                setActiveDrawer(activeDrawer === 'evening' ? 'none' : 'evening');
              }}
              className={`p-2 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-0.5 select-none ${
                ritual.eveningWrapCompleted
                  ? 'bg-[#ECFDF5] border border-[#10B981]/30 text-[#065F46]'
                  : activeDrawer === 'evening'
                  ? 'bg-[#1A3629] text-[#FFFDF9] shadow-2xs'
                  : 'bg-[#FFFDF9] border border-[#1A3629]/10 text-[#1A3629] hover:border-[#1A3629]/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
                  3. Evening
                </span>
                <Moon className="w-3 h-3 shrink-0" />
              </div>
              <span className="font-cabinet font-bold text-xs truncate">
                {ritual.eveningWrapCompleted ? 'Sealed ✓' : 'Wrap →'}
              </span>
            </button>
          </div>

          {/* Inline Expandable Drawer: Morning Boot */}
          {activeDrawer === 'morning' && (
            <div className="mt-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#1A3629]/15 flex flex-col gap-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="font-cabinet font-bold text-xs text-[#1A3629]">
                  Morning Boot Calibration
                </span>
                <button
                  type="button"
                  onClick={() => setActiveDrawer('none')}
                  className="text-xs font-mono text-[#4A5D4E] hover:text-[#1A3629] cursor-pointer"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sleep Hours Pills */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase text-[#4A5D4E]">
                  Last Night Sleep: {morningSleep}h
                </span>
                <div className="grid grid-cols-5 gap-1">
                  {[6, 7, 7.5, 8, 8.5].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setMorningSleep(hrs)}
                      className={`py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        morningSleep === hrs
                          ? 'bg-[#1A3629] text-[#FFFDF9] shadow-2xs'
                          : 'bg-[#FFFDF9] border border-[#1A3629]/10 text-[#1A3629]'
                      }`}
                    >
                      {hrs}h
                    </button>
                  ))}
                </div>
              </div>

              {/* Rested Rating */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase text-[#4A5D4E]">
                  Morning Rested Score (1-5)
                </span>
                <div className="grid grid-cols-5 gap-1">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setMorningRested(score)}
                      className={`py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        morningRested === score
                          ? 'bg-[#1A3629] text-[#FFFDF9] shadow-2xs'
                          : 'bg-[#FFFDF9] border border-[#1A3629]/10 text-[#1A3629]'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sunlight Toggle */}
              <label className="flex items-center gap-2 text-xs font-cabinet text-[#1A3629] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={morningSunlight}
                  onChange={(e) => setMorningSunlight(e.target.checked)}
                  className="rounded border-[#1A3629]/20 text-[#1A3629] accent-[#1A3629]"
                />
                <span>15m Natural Sunlight & Hydration primed</span>
              </label>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleSaveMorningBoot}
                className="w-full py-2 rounded-xl bg-[#1A3629] hover:bg-[#2C4A3B] text-[#FFFDF9] font-cabinet font-bold text-xs transition-all cursor-pointer shadow-2xs"
              >
                Complete Morning Boot (+45 XP)
              </button>
            </div>
          )}

          {/* Inline Expandable Drawer: Evening Wrap */}
          {activeDrawer === 'evening' && (
            <div className="mt-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#1A3629]/15 flex flex-col gap-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="font-cabinet font-bold text-xs text-[#1A3629]">
                  Evening Wrap Seal
                </span>
                <button
                  type="button"
                  onClick={() => setActiveDrawer('none')}
                  className="text-xs font-mono text-[#4A5D4E] hover:text-[#1A3629] cursor-pointer"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Caffeine Cutoff Selector */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase text-[#4A5D4E]">
                  Caffeine Intake
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'none', label: 'Zero' },
                    { id: 'before_cutoff', label: 'Pre-2pm' },
                    { id: 'after_cutoff', label: 'Late' },
                  ].map((caff) => (
                    <button
                      key={caff.id}
                      type="button"
                      onClick={() => setEveningCaffeine(caff.id as any)}
                      className={`py-1 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        eveningCaffeine === caff.id
                          ? 'bg-[#1A3629] text-[#FFFDF9] shadow-2xs'
                          : 'bg-[#FFFDF9] border border-[#1A3629]/10 text-[#1A3629]'
                      }`}
                    >
                      {caff.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Afternoon Slump */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase text-[#4A5D4E]">
                  Afternoon Slump Severity (1=None, 5=Severe)
                </span>
                <div className="grid grid-cols-5 gap-1">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setEveningSlump(score)}
                      className={`py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        eveningSlump === score
                          ? 'bg-[#1A3629] text-[#FFFDF9] shadow-2xs'
                          : 'bg-[#FFFDF9] border border-[#1A3629]/10 text-[#1A3629]'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleSaveEveningWrap}
                className="w-full py-2 rounded-xl bg-[#1A3629] hover:bg-[#2C4A3B] text-[#FFFDF9] font-cabinet font-bold text-xs transition-all cursor-pointer shadow-2xs"
              >
                Seal Evening Wrap (+20 XP)
              </button>
            </div>
          )}
        </div>

        {/* 2. Header: Title + Completion Counter */}
        <div className="flex items-start justify-between gap-3 pt-3 pb-3 border-b border-[#1A3629]/10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-cabinet font-bold text-base sm:text-lg text-[#1A3629] tracking-tight">
                {isDownscaled ? 'Restorative Essentials' : 'Focus Essentials'}
              </h2>
              {isDownscaled && (
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#10B981]/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#10B981]" />
                  <span>Gentle Baseline</span>
                </span>
              )}
            </div>
            <p className="font-sans text-xs text-[#4A5D4E] mt-0.5">
              {isDownscaled
                ? 'Calibrated to 3 micro-habits. Protects your streak on demanding days.'
                : '3 baseline habits calibrated for sustained daytime stamina.'}
            </p>
          </div>

          <span className="font-mono text-xs font-semibold text-[#1A3629]/80 bg-[#FAF8F5] border border-[#1A3629]/10 px-2.5 py-1 rounded-full shrink-0 tabular-nums">
            {completedCount}/{activeHabits.length} done
          </span>
        </div>

        {/* Completion Ribbon */}
        {completedCount === activeHabits.length && (
          <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-[#ECFDF5] border border-[#10B981]/30 text-[#065F46] font-cabinet font-bold text-xs mt-2 animate-in fade-in">
            <span>{isDownscaled ? 'All Re-entry Micro-Habits Complete · Streak Retained' : 'All Core Habits Complete'}</span>
            <span className="font-mono text-[10px]">
              +{isDownscaled ? XP_MATRIX.MINIMUM_VIABLE_REENTRY_DAY : XP_MATRIX.FLAWLESS_HABIT_DAY} XP Earned
            </span>
          </div>
        )}

        {/* Clean, Tactile Habit List with Hotkeys */}
        <div className="flex flex-col divide-y divide-[#1A3629]/8 pt-1">
          {activeHabits.map((habit, idx) => {
            const isDone = !!currentLog.habitsCompleted[habit.id];

            return (
              <button
                key={habit.id}
                type="button"
                onClick={(e) => handleToggle(habit.id, e)}
                className="w-full py-3 px-2 rounded-xl text-left transition-all duration-150 cursor-pointer select-none group flex items-center justify-between gap-3.5 hover:bg-[#FAF8F5] active:scale-[0.98]"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Refined Tactile Checkbox */}
                  <div
                    className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                      isDone
                        ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] shadow-2xs'
                        : 'border-[#1A3629]/25 bg-transparent group-hover:border-[#1A3629]'
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  {/* Habit Details */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span
                      className={`font-cabinet font-semibold text-sm leading-snug transition-colors ${
                        isDone ? 'text-[#1A3629]/50 line-through decoration-[#1A3629]/30' : 'text-[#1A3629]'
                      }`}
                    >
                      {habit.title}
                    </span>
                    <span className="font-sans text-xs text-[#4A5D4E] mt-0.5 leading-tight">
                      {habit.benefit}
                    </span>
                  </div>
                </div>

                {/* Reward & Keyboard Accelerator Badge */}
                <div className="flex items-center gap-2 shrink-0">
                  <kbd className="hidden sm:inline-flex items-center justify-center w-5 h-5 text-[10px] font-mono font-semibold text-[#1A3629]/40 bg-[#FAF8F5] border border-[#1A3629]/15 rounded shadow-2xs group-hover:border-[#1A3629]/30 group-hover:text-[#1A3629]/70 transition-colors">
                    {idx + 1}
                  </kbd>
                  <span
                    className={`font-mono text-xs font-semibold shrink-0 transition-colors ${
                      isDone ? 'text-[#1A3629]/40' : 'text-[#C9A84C]'
                    }`}
                  >
                    {isDone ? '✓' : '+15 XP'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Habits Tray */}
      {secondaryHabits.length > 0 && (
        <div className="pt-3 border-t border-[#1A3629]/8 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              aria-expanded={isTrayOpen}
              onClick={() => setIsTrayOpen(!isTrayOpen)}
              className="text-xs font-cabinet font-bold text-[#4A5D4E] hover:text-[#1A3629] cursor-pointer flex items-center gap-1"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isTrayOpen ? 'rotate-180' : ''}`} />
              <span>{isTrayOpen ? 'Hide secondary habits' : `View ${secondaryHabits.length} more habits`}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-cabinet font-bold text-[#1A3629] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Custom Habit</span>
            </button>
          </div>

          {isTrayOpen && (
            <div className="flex flex-col divide-y divide-[#1A3629]/6 pt-1 animate-in fade-in duration-150">
              {secondaryHabits.map((habit) => {
                const isDone = !!currentLog.habitsCompleted[habit.id];
                return (
                  <button
                    key={habit.id}
                    type="button"
                    onClick={() => handleToggle(habit.id)}
                    className="w-full py-2 px-1 text-left flex items-center justify-between text-xs cursor-pointer transition-colors hover:bg-[#FAF8F5] rounded-lg"
                  >
                    <span
                      className={`font-cabinet font-medium truncate ${
                        isDone ? 'text-[#1A3629]/40 line-through decoration-[#1A3629]/25' : 'text-[#1A3629]'
                      }`}
                    >
                      {habit.title}
                    </span>
                    <span className="font-mono text-[11px] text-[#4A5D4E] font-medium shrink-0 ml-2">
                      {isDone ? '✓' : '+15 XP'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {showAddForm && (
            <form onSubmit={handleAddSubmit} className="flex items-center gap-2 pt-1 animate-in fade-in duration-150">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Habit title (e.g. 10m Box Breathing)"
                className="flex-1 text-xs font-cabinet bg-[#FAF8F5] border border-[#1A3629]/20 rounded-lg p-2 outline-none text-[#1A3629]"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-[#1A3629] text-[#FFFDF9] text-xs font-cabinet font-bold rounded-lg cursor-pointer hover:bg-[#2C4A3B]"
              >
                Add
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
