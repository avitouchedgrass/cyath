'use client';

import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { useHabitStore, CUSTOM_HABITS_LIBRARY } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { xpParticleEmitter } from '@/lib/particleEmitter';
import { Check, Battery, BatteryMedium, BatteryLow, Droplets } from 'lucide-react';

export interface CoreHabitsCardProps {
  onOpenSchedule?: () => void;
}

export function CoreHabitsCard({ onOpenSchedule }: CoreHabitsCardProps = {}) {
  const {
    currentDate,
    getDailyLog,
    toggleHabit,
    setHydration,
    userProfile,
    deskRitualsByDate,
    completeEveningWrap,
    setCustomHabitSlot,
  } = useHabitStore();

  const [isSlotPickerOpen, setIsSlotPickerOpen] = useState(false);
  const [undoToast, setUndoToast] = useState<{ habitId: string; title: string; timer: ReturnType<typeof setTimeout> } | null>(null);

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
        title: 'Morning Light',
        subtitle: '10 to 20 mins outside (wake up your eyes)',
        isDone: !!currentLog.habitsCompleted?.['sunlight'],
        statusLabel: !!currentLog.habitsCompleted?.['sunlight'] ? 'Completed' : 'Pending',
      },
      {
        id: 'hydration',
        keyNumber: 2,
        title: 'Hydration Target',
        subtitle: `${(currentLog.hydrationLiters || 0).toFixed(1)}L of 2.5L logged (sip up!)`,
        isDone: (currentLog.hydrationLiters || 0) >= 2.5 || !!currentLog.habitsCompleted?.['hydration'],
        statusLabel: (currentLog.hydrationLiters || 0) >= 2.5 || !!currentLog.habitsCompleted?.['hydration'] ? 'Completed' : 'Pending',
      },
      {
        id: 'protein_target',
        keyNumber: 3,
        title: 'Whole-Food Protein',
        subtitle: isProteinMet
          ? `${currentProtein}g of ${targetProtein}g daily target (floor secured)`
          : `${currentProtein}g of ${targetProtein}g daily target (${targetProtein - currentProtein}g to floor)`,
        isDone: isProteinMet,
        statusLabel: isProteinMet ? 'Completed' : currentProtein > 0 ? `${currentProtein}g Logged` : 'Pending',
      },
    ];

    if (customDefinition) {
      list.push({
        id: customDefinition.id,
        keyNumber: 4,
        title: customDefinition.title,
        subtitle: 'Custom power lever',
        isDone: !!currentLog.habitsCompleted?.[customDefinition.id],
        statusLabel: !!currentLog.habitsCompleted?.[customDefinition.id] ? 'Completed' : 'Pending',
      });
    }

    return list;
  }, [currentLog, currentProtein, targetProtein, isProteinMet, customDefinition]);

  const completedCount = useMemo(() => {
    return displayHabits.filter((h) => h.isDone).length;
  }, [displayHabits]);

  const handleToggle = useCallback((habitId: string, event?: React.MouseEvent) => {
    if (habitId === 'protein_target' && !isProteinMet) {
      haptics.tap();
      retroAudio.playBlip();
      const input = document.getElementById('natural-meal-input');
      if (input) {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

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

      if (undoToast) clearTimeout(undoToast.timer);
      const habitTitle = displayHabits.find(h => h.id === habitId)?.title || habitId;
      const timer = setTimeout(() => setUndoToast(null), 4000);
      setUndoToast({ habitId, title: habitTitle, timer });
    } else {
      retroAudio.playBlip();
      if (undoToast?.habitId === habitId) {
        clearTimeout(undoToast.timer);
        setUndoToast(null);
      }
    }
    toggleHabit(habitId, currentDate);
  }, [currentLog.habitsCompleted, completedCount, displayHabits, toggleHabit, currentDate, isProteinMet, undoToast]);

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
    <div className="w-full bg-[#FFFDF9] border border-[#1A3629]/15 rounded-3xl p-5 sm:p-6 shadow-[0_8px_32px_rgba(26,54,41,0.04)] flex flex-col gap-4 animate-[slideInLeftSpring_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards]">
      {/* Card Header & Circadian Schedule */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#1A3629]/10">
        <div className="flex flex-col min-w-0">
          <h3 className="font-cabinet font-extrabold text-base text-[#1A3629] tracking-tight">
            Daily Ritual Anchors
          </h3>
          {onOpenSchedule ? (
            <button
              type="button"
              onClick={onOpenSchedule}
              className="mt-0.5 text-left cursor-pointer transition-colors group"
              title="Click to calibrate wake and sleep schedule (+25 XP)"
            >
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-[#4A5D4E] group-hover:text-[#1A3629]">
                  {userProfile?.wakeTime || '07:30'} to {userProfile?.bedTime || '23:30'}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#1A3629]/8 group-hover:bg-[#1A3629] text-[#1A3629] group-hover:text-[#FFFDF9] text-[9px] font-cabinet font-bold uppercase tracking-wider transition-colors">
                  Edit
                </span>
              </div>
            </button>
          ) : (
            <span className="font-mono text-[10px] text-[#4A5D4E] mt-0.5">
              {userProfile?.wakeTime || '07:30'} to {userProfile?.bedTime || '23:30'}
            </span>
          )}
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#1A3629]/12 font-mono text-xs font-bold text-[#1A3629] shrink-0">
          <span className="text-[#10B981]">{completedCount}</span>
          <span className="opacity-30">/</span>
          <span>{displayHabits.length} Secured</span>
        </div>
      </div>

      {/* 1-Tap Habit Buttons */}
      <div className="flex flex-col gap-2">
        {displayHabits.map((habit) => {
          const isDone = habit.isDone;

          return (
            <button
              key={habit.id}
              type="button"
              onClick={(e) => handleToggle(habit.id, e)}
              className={`w-full p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center gap-3 text-left group active:scale-[0.99] ${
                isDone
                  ? 'border-emerald-600/30 bg-[#FAF8F5]'
                  : 'border-[#1A3629]/12 bg-[#FFFDF9] hover:border-[#1A3629]/30 hover:bg-[#FAF8F5]'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg border transition-all duration-200 flex items-center justify-center shrink-0 shadow-2xs ${
                isDone
                  ? 'border-emerald-700 bg-emerald-700 text-[#FFFDF9]'
                  : 'border-[#1A3629]/20 bg-[#FAF8F5] text-[#1A3629] group-hover:border-[#1A3629]'
              }`}>
                {isDone ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <span className="font-mono text-xs font-bold">{habit.keyNumber}</span>
                )}
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-cabinet font-extrabold text-xs sm:text-sm tracking-tight text-[#1A3629] leading-tight">
                  {habit.title}
                </span>
                <span className="text-[11px] font-sans text-[#4A5D4E] leading-snug mt-0.5">
                  {habit.subtitle}
                </span>
              </div>

              {isDone ? (
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-emerald-700 font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                  Secured
                </span>
              ) : (
                <span className="shrink-0 font-mono text-[10px] text-[#4A5D4E]/70 group-hover:text-[#1A3629] font-medium">
                  Press {habit.keyNumber}
                </span>
              )}
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
            <span>+ Add 4th Custom Power Habit</span>
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

      {/* Interactive Hydration Flask Punch Strip */}
      <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#1A3629]/12 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-cabinet font-bold text-xs text-[#1A3629]">
            <Droplets className="w-3.5 h-3.5 text-blue-600" />
            <span>Hydration Flask Gauge</span>
          </div>
          <span className="font-mono text-xs font-bold text-[#1A3629]">
            {(currentLog.hydrationLiters || 0).toFixed(1)} / 2.5 L
          </span>
        </div>

        <div className="w-full h-2 bg-[#FFFDF9] border border-[#1A3629]/10 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.round(((currentLog.hydrationLiters || 0) / 2.5) * 100))}%` }}
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              const next = Number(((currentLog.hydrationLiters || 0) + 0.5).toFixed(1));
              setHydration(next, currentDate);
              retroAudio.playInspectConfirm();
              haptics.tap();
            }}
            className="flex-1 py-1.5 px-2 rounded-xl border border-[#1A3629]/15 bg-[#FFFDF9] hover:bg-[#1A3629] hover:text-[#FFFDF9] text-[#1A3629] font-mono text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 shadow-2xs"
            title="Log 0.5 Liters of water (Hotkey 2)"
          >
            <span>+0.5L</span>
            <kbd className="px-1.5 py-px text-[9px] bg-black/5 rounded">2</kbd>
          </button>

          <button
            type="button"
            onClick={() => {
              const next = Number(((currentLog.hydrationLiters || 0) + 1.0).toFixed(1));
              setHydration(next, currentDate);
              retroAudio.playInspectConfirm();
              haptics.tap();
            }}
            className="flex-1 py-1.5 px-2 rounded-xl border border-[#1A3629]/15 bg-[#FFFDF9] hover:bg-[#1A3629] hover:text-[#FFFDF9] text-[#1A3629] font-mono text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 active:scale-98 shadow-2xs"
            title="Log 1.0 Liter of water"
          >
            <span>+1.0L</span>
          </button>
        </div>
      </div>

      {/* Undo toast */}
      {undoToast && (
        <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-[#1A3629] text-[#FFFDF9] text-[11px] font-mono animate-in fade-in slide-in-from-bottom-2 duration-200 shadow-md">
          <span className="font-bold truncate">✓ {undoToast.title}</span>
          <button
            type="button"
            onClick={() => {
              clearTimeout(undoToast.timer);
              setUndoToast(null);
              retroAudio.playBlip();
              haptics.tap();
              toggleHabit(undoToast.habitId, currentDate);
            }}
            className="shrink-0 font-cabinet font-bold text-[10px] uppercase tracking-wide text-[#FFFDF9]/80 hover:text-[#FFFDF9] transition-colors cursor-pointer"
          >
            Undo
          </button>
        </div>
      )}

      {/* 1-Tap Afternoon Slump Check */}
      <div className="border-t border-[#1A3629]/10 pt-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-cabinet font-bold text-[10px] uppercase tracking-wide text-[#4A5D4E]">
            Energy Level Check
          </span>
          {ritual.afternoonSlumpScore && (
            <span className="font-mono text-[10px] text-[#10B981] font-bold">
              {ritual.afternoonSlumpScore}/10 Recorded
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            title="Low energy: feeling slow, foggy, or dragging"
            onClick={() => handleEnergyRating(2)}
            className={`py-2 px-2 rounded-xl border text-[11px] font-cabinet font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-2xs active:scale-98 ${
              ritual.afternoonSlumpScore && ritual.afternoonSlumpScore <= 3
                ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9]'
                : 'border-[#1A3629]/12 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#FAF6EE]'
            }`}
          >
            <BatteryLow className="w-3.5 h-3.5 text-[#DC2626]" />
            Slump
          </button>

          <button
            type="button"
            title="Steady energy: manageable, no crash"
            onClick={() => handleEnergyRating(6)}
            className={`py-2 px-2 rounded-xl border text-[11px] font-cabinet font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-2xs active:scale-98 ${
              ritual.afternoonSlumpScore && ritual.afternoonSlumpScore > 3 && ritual.afternoonSlumpScore <= 7
                ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9]'
                : 'border-[#1A3629]/12 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#FAF6EE]'
            }`}
          >
            <BatteryMedium className="w-3.5 h-3.5 text-[#D97706]" />
            Steady
          </button>

          <button
            type="button"
            title="Peak energy: sharp, strong, firing on all cylinders"
            onClick={() => handleEnergyRating(9)}
            className={`py-2 px-2 rounded-xl border text-[11px] font-cabinet font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-2xs active:scale-98 ${
              ritual.afternoonSlumpScore && ritual.afternoonSlumpScore > 7
                ? 'border-[#1A3629] bg-[#1A3629] text-[#FFFDF9]'
                : 'border-[#1A3629]/12 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#FAF6EE]'
            }`}
          >
            <Battery className="w-3.5 h-3.5 text-[#10B981]" />
            Peak
          </button>
        </div>
      </div>
    </div>
  );
}
