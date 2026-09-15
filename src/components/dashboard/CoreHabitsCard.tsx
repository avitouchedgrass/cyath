'use client';

import React, { useState, useMemo } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { xpParticleEmitter } from '@/lib/particleEmitter';
import { MorningBootModal } from '@/components/dashboard/MorningBootModal';
import { EveningWrapModal } from '@/components/dashboard/EveningWrapModal';
import { Check, Sun, Moon, ChevronDown, Plus } from 'lucide-react';

export function CoreHabitsCard() {
  const {
    habits,
    currentDate,
    getDailyLog,
    toggleHabit,
    addCustomHabit,
    deskRitualsByDate,
  } = useHabitStore();

  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isMorningOpen, setIsMorningOpen] = useState(false);
  const [isEveningOpen, setIsEveningOpen] = useState(false);

  const currentLog = getDailyLog(currentDate);
  const ritual = deskRitualsByDate[currentDate] || {};

  // Surface the top 3 habits as the core non-negotiables
  const coreHabits = useMemo(() => habits.slice(0, 3), [habits]);
  const secondaryHabits = useMemo(() => habits.slice(3), [habits]);

  const completedCoreCount = useMemo(() => {
    return coreHabits.filter((h) => currentLog.habitsCompleted[h.id]).length;
  }, [coreHabits, currentLog.habitsCompleted]);

  const handleToggle = (habitId: string, event?: React.MouseEvent) => {
    const isDone = !!currentLog.habitsCompleted[habitId];
    if (!isDone) {
      retroAudio.playInspectConfirm();
      if (typeof window !== 'undefined' && event) {
        xpParticleEmitter.emit(event.clientX, event.clientY, 10);
      }
      if (completedCoreCount === 2) {
        retroAudio.playTierUpgrade();
        if (typeof window !== 'undefined') {
          xpParticleEmitter.emit(window.innerWidth / 2, window.innerHeight / 2, 25);
        }
      }
    } else {
      retroAudio.playBlip();
    }
    toggleHabit(habitId, currentDate);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    retroAudio.playInspectConfirm();
    addCustomHabit(newTitle.trim());
    setNewTitle('');
    setShowAddForm(false);
  };

  const getHabitBenefit = (title: string, category: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('sunlight') || lower.includes('light')) return '15m natural morning light & hydration';
    if (lower.includes('protein') || lower.includes('fuel')) return 'Target: 140g whole-food protein floor';
    if (lower.includes('cardio') || lower.includes('resistance') || lower.includes('movement')) return '30m zone 2 aerobic or strength session';
    if (lower.includes('water') || lower.includes('hydration')) return '2.0L clean hydration checkpoint';
    return `${category.charAt(0).toUpperCase() + category.slice(1)} · Daily consistency`;
  };

  return (
    <div
      id="tour-core-habits"
      className="w-full h-full min-h-0 sm:min-h-[350px] rounded-3xl border border-[#1A3629]/10 bg-[#FFFDF9] p-4 sm:p-6 shadow-[0_2px_12px_rgba(26,54,41,0.03)] hover:border-[#1A3629]/20 transition-all duration-300 flex flex-col justify-between gap-4 sm:gap-5"
    >
      {/* Header: Title + Completion Counter */}
      <div>
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#1A3629]/8">
          <div>
            <h2 className="font-cabinet font-bold text-base sm:text-lg text-[#1A3629] tracking-tight">
              Focus Essentials
            </h2>
            <p className="font-sans text-xs text-[#4A5D4E] mt-0.5">
              3 baseline habits calibrated for sustained daytime stamina.
            </p>
          </div>

          <span className="font-mono text-xs font-semibold text-[#1A3629]/80 bg-[#FAF8F5] border border-[#1A3629]/10 px-2.5 py-1 rounded-full shrink-0 tabular-nums">
            {completedCoreCount}/{coreHabits.length} done
          </span>
        </div>

        {/* Flawless Completion Ribbon */}
        {completedCoreCount === coreHabits.length && (
          <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-[#ECFDF5] border border-[#10B981]/30 text-[#065F46] font-cabinet font-bold text-xs mt-2 animate-in fade-in">
            <span>All Core Habits Complete</span>
            <span className="font-mono text-[10px]">+45 XP Earned</span>
          </div>
        )}

        {/* Clean, Tactile Habit List */}
        <div className="flex flex-col divide-y divide-[#1A3629]/8 pt-1">
          {coreHabits.map((habit) => {
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
                      {getHabitBenefit(habit.title, habit.category)}
                    </span>
                  </div>
                </div>

                {/* Quiet Reward */}
                <span
                  className={`font-mono text-xs font-semibold shrink-0 transition-colors ${
                    isDone ? 'text-[#1A3629]/40' : 'text-[#C9A84C]'
                  }`}
                >
                  {isDone ? '✓' : '+15 XP'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desk Rituals: Unified Cohesive Strip */}
      <div className="pt-3 border-t border-[#1A3629]/8 flex flex-col gap-2.5">
        <div className="flex flex-col gap-2">
          {/* Morning Boot Button */}
          <button
            type="button"
            onClick={() => {
              retroAudio.playBlip();
              setIsMorningOpen(true);
            }}
            className="w-full py-2 px-3 rounded-2xl border border-[#1A3629]/10 bg-[#FAF8F5] hover:border-[#1A3629]/25 hover:bg-[#F5F1EA] text-left transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#FFFDF9] border border-[#1A3629]/10 flex items-center justify-center shrink-0">
                <Sun className="w-3.5 h-3.5 text-[#C9A84C]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-cabinet font-bold text-xs text-[#1A3629]">Morning Boot</span>
                <span className="font-sans text-[11px] text-[#4A5D4E]">Light & Sleep Check</span>
              </div>
            </div>
            <span className="font-mono text-[11px] font-semibold text-[#1A3629]/80 bg-[#FFFDF9] border border-[#1A3629]/10 px-2.5 py-0.5 rounded-full shrink-0">
              {ritual.morningBootCompleted ? 'Done' : 'Start →'}
            </span>
          </button>

          {/* Evening Wrap Button */}
          <button
            type="button"
            onClick={() => {
              retroAudio.playBlip();
              setIsEveningOpen(true);
            }}
            className="w-full py-2 px-3 rounded-2xl border border-[#1A3629]/10 bg-[#FAF8F5] hover:border-[#1A3629]/25 hover:bg-[#F5F1EA] text-left transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#FFFDF9] border border-[#1A3629]/10 flex items-center justify-center shrink-0">
                <Moon className="w-3.5 h-3.5 text-[#1A3629]/70" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-cabinet font-bold text-xs text-[#1A3629]">Evening Wrap</span>
                <span className="font-sans text-[11px] text-[#4A5D4E]">Caffeine & Screen Cutoff</span>
              </div>
            </div>
            <span className="font-mono text-[11px] font-semibold text-[#1A3629]/80 bg-[#FFFDF9] border border-[#1A3629]/10 px-2.5 py-0.5 rounded-full shrink-0">
              {ritual.eveningWrapCompleted ? 'Done' : 'Start →'}
            </span>
          </button>
        </div>

        {/* Secondary Habits Disclosure & Add */}
        {secondaryHabits.length > 0 && (
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
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
        )}

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
              className="px-3 py-2 bg-[#1A3629] text-[#FFFDF9] text-xs font-cabinet font-bold rounded-lg cursor-pointer"
            >
              Add
            </button>
          </form>
        )}
      </div>

      {/* Modals */}
      <MorningBootModal
        isOpen={isMorningOpen}
        onClose={() => setIsMorningOpen(false)}
      />
      <EveningWrapModal
        isOpen={isEveningOpen}
        onClose={() => setIsEveningOpen(false)}
      />
    </div>
  );
}
