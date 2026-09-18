'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { Utensils, ArrowRight, Plus, Check, Scale, Loader2 } from 'lucide-react';

interface DailyFuelCardProps {
  currentProtein: number;
  targetProtein: number;
  currentDate: string;
}

const PRESET_MEALS = [
  { label: 'Breakfast', protein: 30, calories: 350, desc: 'Eggs & Toast' },
  { label: 'Lunch', protein: 40, calories: 460, desc: 'Meat / Fish' },
  { label: 'Dinner', protein: 40, calories: 480, desc: 'Whole Foods' },
  { label: 'Quick Fuel', protein: 20, calories: 160, desc: 'Protein Shake' },
] as const;

export function DailyFuelCard({
  currentProtein,
  targetProtein,
  currentDate,
}: DailyFuelCardProps) {
  const {
    logMealToDay,
    logWeight,
    userProfile,
    getDailyLog,
  } = useHabitStore();

  const [ambientMealText, setAmbientMealText] = useState('');
  const [isSubmittingMeal, setIsSubmittingMeal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Weight check-in state
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [weightInput, setWeightInput] = useState(userProfile?.weightKg ? String(userProfile.weightKg) : '');

  const currentLog = getDailyLog(currentDate);
  const loggedMealsCount = (currentLog.loggedMeals?.length || 0) + (currentLog.loggedRecipeIds?.length || 0);

  const percent = Math.min(100, Math.round((currentProtein / targetProtein) * 100));
  const remaining = Math.max(0, targetProtein - currentProtein);

  // 1-Tap Preset Logging
  const handleLogPreset = (preset: typeof PRESET_MEALS[number]) => {
    retroAudio.playInspectConfirm();
    logMealToDay(
      {
        name: `${preset.label} (${preset.desc})`,
        protein: preset.protein,
        calories: preset.calories,
        ingredients: [{ item: preset.desc, amount: '1 serving' }],
        suggestedSprite: '/assets/food/generic-plate.webp',
      },
      currentDate
    );
    setFeedback(`+${preset.protein}g ${preset.label} logged!`);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Ambient 1-Line AI Meal Input
  const handleAmbientMealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = ambientMealText.trim();
    if (!text || isSubmittingMeal) return;

    setIsSubmittingMeal(true);
    try {
      const res = await fetch('/api/ai/parse-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const data = await res.json();
        const protein = Number(data.protein) || 25;
        const calories = Number(data.calories) || 350;
        logMealToDay(
          {
            name: data.mealName || text,
            protein,
            calories,
            carbs: data.carbs,
            fats: data.fats,
            ingredients: data.ingredients || [{ item: text, amount: '1 serving' }],
            suggestedSprite: data.suggestedSprite || '/assets/food/generic-plate.webp',
          },
          currentDate
        );
        retroAudio.playInspectConfirm();
        setFeedback(`Logged "${data.mealName || text}" (+${protein}g PRO)`);
      } else {
        throw new Error('API parse error');
      }
    } catch {
      // Offline fallback: log baseline 25g
      logMealToDay(
        {
          name: text,
          protein: 25,
          calories: 320,
          ingredients: [{ item: text, amount: '1 serving' }],
          suggestedSprite: '/assets/food/generic-plate.webp',
        },
        currentDate
      );
      retroAudio.playInspectConfirm();
      setFeedback(`Logged "${text}" (+25g PRO)`);
    } finally {
      setIsSubmittingMeal(false);
      setAmbientMealText('');
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  // Inline Weight Check-in
  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(weightInput);
    if (isNaN(parsed) || parsed <= 0 || parsed > 300) return;

    const result = logWeight(parsed, 'cockpit check-in', currentDate);
    retroAudio.playInspectConfirm();
    setIsEditingWeight(false);
    if (result.xpAwarded > 0) {
      setFeedback(`Weighed ${parsed} kg (+${result.xpAwarded} XP)`);
    } else {
      setFeedback(`Updated weight: ${parsed} kg`);
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div
      id="tour-fuel-anchor"
      className="w-full rounded-3xl border border-[#1A3629]/15 bg-[#FFFDF9] p-4 sm:p-5 shadow-[2px_2px_0px_rgba(26,54,41,0.08)] hover:border-[#1A3629]/25 transition-all duration-200 flex flex-col gap-4"
    >
      {/* Complication Header: Title + Ratio Readout */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#1A3629]/10">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-[#FAF8F5] border border-[#1A3629]/10 flex items-center justify-center text-[#1A3629] shrink-0">
            <Utensils className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-cabinet font-bold text-sm text-[#1A3629] tracking-tight truncate">
            Daily Fuel Anchor
          </h3>
        </div>

        <span className="font-mono text-xs font-semibold text-[#1A3629] bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#1A3629]/10 tabular-nums shrink-0">
          {currentProtein}g / {targetProtein}g
        </span>
      </div>

      {/* Progress Bar & Status */}
      <div className="flex flex-col gap-1.5">
        <div className="w-full h-2 bg-[#1A3629]/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1A3629] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs pt-0.5">
          <span className="font-sans text-[#4A5D4E] text-xs font-medium">
            {remaining === 0 ? 'Daily protein target met ✓' : `${remaining}g protein remaining`}
          </span>
          <span className="font-mono text-xs font-semibold text-[#1A3629]">
            {percent}%
          </span>
        </div>
      </div>

      {/* Unified Fast Fuel Logging Section */}
      <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#1A3629]/10 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#4A5D4E]">
            Quick Meal Presets
          </span>
          <span className="text-[10px] font-mono text-[#4A5D4E]">
            1-tap log
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {PRESET_MEALS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleLogPreset(preset)}
              className="p-2 rounded-xl border border-[#1A3629]/12 bg-[#FFFDF9] hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-all text-left cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold leading-none">
                  +{preset.protein}g
                </span>
                <Plus className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </div>
              <div className="font-sans text-[10px] text-[#4A5D4E] group-hover:text-[#FFFDF9]/80 mt-1 truncate">
                {preset.label}
              </div>
            </button>
          ))}
        </div>

        {/* 1-Line Ambient AI Meal Input */}
        <form onSubmit={handleAmbientMealSubmit} className="flex items-center gap-2 bg-[#FFFDF9] border border-[#1A3629]/12 rounded-xl p-1 focus-within:border-[#1A3629]/30 transition-all">
          <input
            type="text"
            value={ambientMealText}
            onChange={(e) => setAmbientMealText(e.target.value)}
            placeholder="Log meal: e.g. 2 eggs + sourdough"
            disabled={isSubmittingMeal}
            className="flex-1 bg-transparent text-xs font-cabinet text-[#1A3629] placeholder:text-[#1A3629]/40 outline-none px-2"
          />
          <button
            type="submit"
            disabled={!ambientMealText.trim() || isSubmittingMeal}
            className={`px-3 py-1 rounded-lg font-cabinet font-bold text-xs transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
              ambientMealText.trim() && !isSubmittingMeal
                ? 'bg-[#1A3629] text-[#FFFDF9] hover:bg-[#2C4A3B] shadow-2xs'
                : 'bg-[#1A3629]/20 text-[#FFFDF9]/60 cursor-not-allowed'
            }`}
          >
            {isSubmittingMeal ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <span>Log</span>
            )}
          </button>
        </form>
      </div>

      {/* Feedback Toast Banner */}
      {feedback && (
        <div className="py-1.5 px-2.5 rounded-xl bg-[#ECFDF5] border border-[#10B981]/30 text-[#065F46] font-cabinet font-bold text-xs flex items-center gap-1.5 animate-in fade-in duration-150">
          <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
          <span className="truncate">{feedback}</span>
        </div>
      )}

      {/* Inline Weight Check-in Strip */}
      <div className="py-2 px-3 rounded-xl bg-[#FAF8F5]/70 border border-[#1A3629]/8 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[#1A3629]">
          <Scale className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0" />
          <span className="font-mono text-xs font-medium text-[#4A5D4E]">
            Weight:
          </span>
          <span className="font-cabinet font-bold text-xs text-[#1A3629]">
            {userProfile?.weightKg ? `${userProfile.weightKg} kg` : 'Not recorded'}
          </span>
        </div>

        {isEditingWeight ? (
          <form onSubmit={handleWeightSubmit} className="flex items-center gap-1">
            <input
              type="number"
              step="0.1"
              min="30"
              max="300"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="kg"
              className="w-16 px-1.5 py-0.5 text-xs font-mono bg-[#FFFDF9] border border-[#1A3629]/20 rounded outline-none text-[#1A3629]"
              autoFocus
            />
            <button
              type="submit"
              className="px-2 py-0.5 bg-[#1A3629] text-[#FFFDF9] text-[11px] font-cabinet font-bold rounded cursor-pointer hover:bg-[#2C4A3B]"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditingWeight(false)}
              className="text-[11px] font-mono text-[#4A5D4E] hover:text-[#1A3629] px-1 cursor-pointer"
            >
              ✕
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              setWeightInput(userProfile?.weightKg ? String(userProfile.weightKg) : '');
              setIsEditingWeight(true);
            }}
            className="text-[11px] font-cabinet font-bold text-[#1A3629] hover:underline cursor-pointer"
          >
            {userProfile?.weightKg ? 'Update' : '+ Check-in'}
          </button>
        )}
      </div>

      {/* Full Eating Ledger Navigation Link */}
      <div className="pt-1 border-t border-[#1A3629]/8 flex items-center justify-between">
        <span className="text-[11px] font-mono text-[#4A5D4E]">
          {loggedMealsCount} meal{loggedMealsCount === 1 ? '' : 's'} logged today
        </span>
        <Link
          href="/dashboard?tab=log"
          className="inline-flex items-center gap-1 text-xs font-cabinet font-bold text-[#1A3629] hover:underline cursor-pointer group"
        >
          <span>Eating Ledger</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

