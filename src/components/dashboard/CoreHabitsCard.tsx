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
      <div className="w-full bg-[#FFFDF9]/90 backdrop-blur-md border border-[#1A3629]/12 rounded-2xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(26,54,41,0.04)] flex flex-col gap-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1A3629]/10 pb-4">
          <div className="flex flex-col">
            <h3 className="font-cabinet font-extrabold text-xl text-[#1A3629] tracking-tight">
              Keystone Levers
            </h3>
            <span className="font-sans text-xs text-[#4A5D4E] mt-0.5">
              Daily foundational anchors
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#1A3629]/12 font-mono text-xs font-bold text-[#1A3629]">
            <span className="text-[#10B981]">{completedCount}</span>
            <span className="opacity-30">/</span>
            <span>{displayHabits.length} Complete</span>
          </div>
        </div>

        {/* 1-Tap Habit Buttons */}
        <div className="flex flex-col gap-2">
          {displayHabits.map((habit) => {
            const Icon = habit.icon;
            const isDone = habit.isDone;

            return (
              <button
                key={habit.id}
                type="button"
                onClick={(e) => handleToggle(habit.id, e)}
                className={`w-full p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 text-left group active:scale-[0.99] ${
                  isDone
                    ? 'border-[#1A3629]/15 bg-[#FAF8F5]/80 text-[#1A3629]'
                    : 'border-[#1A3629]/10 bg-[#FFFDF9] hover:border-[#1A3629]/30 hover:bg-[#FAF8F5] shadow-[0_2px_8px_rgba(26,54,41,0.02)]'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-200 ${
                    isDone
                      ? 'bg-[#1A3629] border-[#1A3629] text-[#FFFDF9]'
                      : 'bg-[#FAF8F5] border-[#1A3629]/12 text-[#1A3629] group-hover:bg-[#1A3629] group-hover:text-[#FFFDF9]'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className={`font-cabinet font-bold text-sm tracking-tight truncate ${
                      isDone ? 'line-through text-[#4A5D4E]/80' : 'text-[#1A3629]'
                    }`}>
                      {habit.title}
                    </span>
                    <span className="text-xs font-sans text-[#4A5D4E] truncate">
                      {habit.subtitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-[#1A3629]/15 bg-[#FAF8F5] font-mono text-[10px] font-bold text-[#4A5D4E]">
                    {habit.keyNumber}
                  </kbd>
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 ${
                    isDone
                      ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9]'
                      : 'border-[#1A3629]/25 bg-transparent group-hover:border-[#1A3629]/50'
                  }`}>
                    {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
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
              className="w-full py-2.5 px-3.5 rounded-xl border border-dashed border-[#1A3629]/20 bg-[#FAF8F5]/40 hover:bg-[#FAF8F5] text-[#1A3629] font-cabinet font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-[#4A5D4E]" />
              <span>Add 4th Custom Power Habit</span>
            </button>
          )}

          {/* Custom Slot Picker Dropdown */}
          {isSlotPickerOpen && !customDefinition && (
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#1A3629]/15 flex flex-col gap-2 animate-in fade-in duration-150">
              <span className="font-cabinet font-bold text-xs text-[#1A3629]">
                Choose 4th Habit Lever
              </span>
              <div className="grid grid-cols-2 gap-2">
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
                    className="p-2.5 rounded-lg border border-[#1A3629]/12 bg-[#FFFDF9] hover:bg-[#1A3629] hover:text-[#FFFDF9] text-xs font-cabinet font-bold text-[#1A3629] transition-all text-left cursor-pointer"
                  >
                    <span>{item.shortLabel}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 1-Tap Afternoon Slump Check */}
        <div className="border-t border-[#1A3629]/10 pt-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-cabinet font-bold text-xs text-[#1A3629]">
              Afternoon Energy Cadence
            </span>
            <span className="font-mono text-[11px] text-[#4A5D4E]">
              {ritual.afternoonSlumpScore ? `Logged ${ritual.afternoonSlumpScore}/10` : '1-tap check'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleEnergyRating(2)}
              className={`py-2.5 px-3 rounded-xl border text-xs font-cabinet font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                ritual.afternoonSlumpScore && ritual.afternoonSlumpScore <= 3
                  ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9]'
                  : 'border-[#1A3629]/12 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#FAF6EE]'
              }`}
            >
              <BatteryLow className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>Slump</span>
            </button>

            <button
              type="button"
              onClick={() => handleEnergyRating(6)}
              className={`py-2.5 px-3 rounded-xl border text-xs font-cabinet font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                ritual.afternoonSlumpScore && ritual.afternoonSlumpScore > 3 && ritual.afternoonSlumpScore <= 7
                  ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9]'
                  : 'border-[#1A3629]/12 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#FAF6EE]'
              }`}
            >
              <BatteryMedium className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Steady</span>
            </button>

            <button
              type="button"
              onClick={() => handleEnergyRating(9)}
              className={`py-2.5 px-3 rounded-xl border text-xs font-cabinet font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                ritual.afternoonSlumpScore && ritual.afternoonSlumpScore > 7
                  ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9]'
                  : 'border-[#1A3629]/12 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#FAF6EE]'
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
