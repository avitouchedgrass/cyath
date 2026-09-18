'use client';

import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { useHabitStore, CUSTOM_HABITS_LIBRARY } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { xpParticleEmitter } from '@/lib/particleEmitter';
import { Check, Sun, Droplets, Utensils, Plus, Sparkles, Zap, Battery, BatteryMedium, BatteryLow } from 'lucide-react';

export function CoreHabitsCard() {
  const {
    currentDate,
    getDailyLog,
    toggleHabit,
    userProfile,
    deskRitualsByDate,
    completeEveningWrap,
    setCustomHabitSlot,
  } = useHabitStore();

  const [isSlotPickerOpen, setIsSlotPickerOpen] = useState(false);

  const currentLog = getDailyLog(currentDate);
  const ritual = deskRitualsByDate[currentDate] || {};

  const targetProtein = userProfile?.weightKg ? Math.round(userProfile.weightKg * 2.0) : 140;
  const currentProtein = currentLog.totalProteinLogged || 0;
  const isProteinMet = currentProtein >= targetProtein;

  // Custom 4th habit slot definition
  const customSlotId = userProfile?.customHabitSlot;
  const customDefinition = useMemo(() => {
    return CUSTOM_HABITS_LIBRARY.find((h) => h.id === customSlotId);
  }, [customSlotId]);

  // Core 3 Keystone Habits + Optional 4th
  const displayHabits = useMemo(() => {
    const list = [
      {
        id: 'sunlight',
        keyNumber: 1,
        title: 'Morning Sunlight',
        subtitle: '10–20 mins within wake window',
        icon: Sun,
        isDone: !!currentLog.habitsCompleted?.['sunlight'],
      },
      {
        id: 'hydration',
        keyNumber: 2,
        title: 'Hydration Target',
        subtitle: `${(currentLog.hydrationLiters || 0).toFixed(1)}L / 2.5L logged`,
        icon: Droplets,
        isDone: (currentLog.hydrationLiters || 0) >= 2.5 || !!currentLog.habitsCompleted?.['hydration'],
      },
      {
        id: 'protein_target',
        keyNumber: 3,
        title: 'Whole-Food Protein',
        subtitle: `${currentProtein}g / ${targetProtein}g daily floor`,
        icon: Utensils,
        isDone: isProteinMet || !!currentLog.habitsCompleted?.['protein_target'],
      },
    ];

    if (customDefinition) {
      list.push({
        id: customDefinition.id,
        keyNumber: 4,
        title: customDefinition.title,
        subtitle: 'Custom power lever',
        icon: Zap,
        isDone: !!currentLog.habitsCompleted?.[customDefinition.id],
      });
    }

    return list;
  }, [currentLog, currentProtein, targetProtein, isProteinMet, customDefinition]);

  const completedCount = useMemo(() => {
    return displayHabits.filter((h) => h.isDone).length;
  }, [displayHabits]);

  const handleToggle = useCallback((habitId: string, event?: React.MouseEvent) => {
    const isDone = !!currentLog.habitsCompleted?.[habitId];
    haptics.tap();

    if (!isDone) {
      retroAudio.playInspectConfirm();
      if (typeof window !== 'undefined' && event) {
        xpParticleEmitter.emit(event.clientX, event.clientY, 10);
      }
      if (completedCount === displayHabits.length - 1) {
        retroAudio.playTierUpgrade();
        haptics.success();
        if (typeof window !== 'undefined') {
          xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 25);
        }
      }
    } else {
      retroAudio.playBlip();
    }
    toggleHabit(habitId, currentDate);
  }, [currentLog.habitsCompleted, completedCount, displayHabits.length, toggleHabit, currentDate]);

  // Keyboard Shortcuts: 1, 2, 3, 4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === '1' && displayHabits[0]) {
        e.preventDefault();
        handleToggle(displayHabits[0].id);
      } else if (e.key === '2' && displayHabits[1]) {
        e.preventDefault();
        handleToggle(displayHabits[1].id);
      } else if (e.key === '3' && displayHabits[2]) {
        e.preventDefault();
        handleToggle(displayHabits[2].id);
      } else if (e.key === '4' && displayHabits[3]) {
        e.preventDefault();
        handleToggle(displayHabits[3].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayHabits, handleToggle]);

  // Fast 1-Click Afternoon Slump / Energy Level Check
  const handleEnergyRating = (score: number) => {
    retroAudio.playInspectConfirm();
    haptics.tap();
    completeEveningWrap(
      {
        afternoonSlumpScore: score,
        wholeFoodRating: 8,
      },
      currentDate
    );
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Habits Card Surface */}
      <div className="w-full bg-[#FFFDF9] border-2 border-[#1A3629] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_#1A3629] flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1A3629]/10 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1A3629]" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#4A5D4E]">
                Daily Punch Pad
              </span>
            </div>
            <h3 className="font-cabinet font-extrabold text-lg text-[#1A3629] mt-0.5 tracking-tight">
              Keystone Levers
            </h3>
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#1A3629]/15 font-mono text-xs font-bold text-[#1A3629]">
            <span>{completedCount}</span>
            <span className="opacity-40">/</span>
            <span>{displayHabits.length} Done</span>
          </div>
        </div>

        {/* 1-Tap Habit Buttons */}
        <div className="flex flex-col gap-2.5">
          {displayHabits.map((habit) => {
            const Icon = habit.icon;
            const isDone = habit.isDone;

            return (
              <button
                key={habit.id}
                type="button"
                onClick={(e) => handleToggle(habit.id, e)}
                className={`w-full p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 text-left group active:scale-[0.99] ${
                  isDone
                    ? 'border-[#1A3629] bg-[#FAF8F5] text-[#1A3629] shadow-none'
                    : 'border-[#1A3629]/20 bg-[#FFFDF9] hover:border-[#1A3629] hover:bg-[#FAF6EE] shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                    isDone
                      ? 'bg-[#1A3629] border-[#1A3629] text-[#FFFDF9]'
                      : 'bg-[#FAF8F5] border-[#1A3629]/15 text-[#1A3629]'
                  }`}>
                    {isDone ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className={`font-cabinet font-bold text-xs sm:text-sm tracking-tight truncate ${
                      isDone ? 'line-through text-[#4A5D4E]' : 'text-[#1A3629]'
                    }`}>
                      {habit.title}
                    </span>
                    <span className="text-[11px] font-sans text-[#4A5D4E] truncate">
                      {habit.subtitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-[#1A3629]/20 bg-[#FAF8F5] font-mono text-[10px] font-bold text-[#4A5D4E]">
                    {habit.keyNumber}
                  </kbd>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isDone
                      ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9]'
                      : 'border-[#1A3629]/30 bg-transparent'
                  }`}>
                    {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Add 4th Slot Trigger if not configured */}
          {!customDefinition && (
            <button
              type="button"
              onClick={() => setIsSlotPickerOpen(!isSlotPickerOpen)}
              className="w-full py-2.5 px-3.5 rounded-2xl border border-dashed border-[#1A3629]/25 bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] text-[#1A3629] font-cabinet font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add 4th Custom Power Habit</span>
            </button>
          )}

          {/* Custom Slot Picker Dropdown */}
          {isSlotPickerOpen && !customDefinition && (
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#1A3629]/20 flex flex-col gap-2 animate-in fade-in duration-150">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E]">
                Select 4th Lever
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {CUSTOM_HABITS_LIBRARY.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      retroAudio.playInspectConfirm();
                      haptics.tap();
                      setCustomHabitSlot(item.id);
                      setIsSlotPickerOpen(false);
                    }}
                    className="p-2 rounded-xl border border-[#1A3629]/15 bg-[#FFFDF9] hover:bg-[#1A3629] hover:text-[#FFFDF9] text-xs font-cabinet font-bold text-[#1A3629] transition-all text-left cursor-pointer"
                  >
                    <span>{item.shortLabel}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 1-Tap Afternoon Slump Check */}
        <div className="border-t border-[#1A3629]/10 pt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E]">
              Afternoon Energy Check
            </span>
            <span className="font-mono text-[10px] text-[#1A3629]/70">
              {ritual.afternoonSlumpScore ? `Logged: ${ritual.afternoonSlumpScore}/10` : '1-tap check'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleEnergyRating(2)}
              className={`py-2 px-2 rounded-xl border text-xs font-cabinet font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                ritual.afternoonSlumpScore && ritual.afternoonSlumpScore <= 3
                  ? 'border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9]'
                  : 'border-[#1A3629]/15 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#FAF6EE]'
              }`}
            >
              <BatteryLow className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>Slump</span>
            </button>

            <button
              type="button"
              onClick={() => handleEnergyRating(6)}
              className={`py-2 px-2 rounded-xl border text-xs font-cabinet font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                ritual.afternoonSlumpScore && ritual.afternoonSlumpScore > 3 && ritual.afternoonSlumpScore <= 7
                  ? 'border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9]'
                  : 'border-[#1A3629]/15 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#FAF6EE]'
              }`}
            >
              <BatteryMedium className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Steady</span>
            </button>

            <button
              type="button"
              onClick={() => handleEnergyRating(9)}
              className={`py-2 px-2 rounded-xl border text-xs font-cabinet font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                ritual.afternoonSlumpScore && ritual.afternoonSlumpScore > 7
                  ? 'border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9]'
                  : 'border-[#1A3629]/15 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#FAF6EE]'
              }`}
            >
              <Battery className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Peak</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
