'use client';

import React, { useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { Utensils, ArrowRight, Plus, Check, Scale, Loader2, Sparkles } from 'lucide-react';

interface DailyFuelCardProps {
  currentProtein: number;
  targetProtein: number;
  currentDate: string;
}

const PRESET_MEALS = [
  { label: 'Balanced Plate', protein: 35, calories: 520, desc: 'Protein + Veg + Carb' },
  { label: 'High Protein Anchor', protein: 50, calories: 460, desc: 'Steak / Chicken breast' },
  { label: 'Light Quick Fuel', protein: 20, calories: 240, desc: 'Eggs / Greek yogurt' },
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
    haptics.tap();
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
    setFeedback(`+${preset.protein}g ${preset.label} logged`);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Ambient Natural Language Food Logging (Primary Hero Input)
  const handleAmbientMealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = ambientMealText.trim();
    if (!text || isSubmittingMeal) return;

    setIsSubmittingMeal(true);
    haptics.tap();

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
        haptics.success();
        setFeedback(`Logged "${data.mealName || text}" (+${protein}g protein)`);
      } else {
        throw new Error('API parse error');
      }
    } catch {
      // Offline smart fallback
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
      haptics.success();
      setFeedback(`Logged "${text}" (+25g protein estimated)`);
    } finally {
      setIsSubmittingMeal(false);
      setAmbientMealText('');
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  // Weight check-in
  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (!isNaN(val) && val > 30 && val < 300) {
      retroAudio.playInspectConfirm();
      haptics.tap();
      logWeight(val, undefined, currentDate);
      setIsEditingWeight(false);
      setFeedback(`Weight updated: ${val.toFixed(1)} kg`);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="w-full bg-[#FFFDF9] border-2 border-[#1A3629] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_#1A3629] flex flex-col gap-5">
      
      {/* Header & Target Summary */}
      <div className="flex items-center justify-between border-b border-[#1A3629]/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#1A3629]/15 flex items-center justify-center text-[#1A3629]">
            <Utensils className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-cabinet font-extrabold text-base sm:text-lg text-[#1A3629] tracking-tight leading-tight">
              Daily Fuel &amp; Protein Floor
            </h3>
            <span className="font-sans text-xs text-[#4A5D4E]">
              Whole-food calibrated nutrition
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-baseline gap-1 font-mono">
            <span className="font-cabinet font-extrabold text-xl text-[#1A3629] tabular-nums">
              {currentProtein}
            </span>
            <span className="text-xs text-[#4A5D4E]">/ {targetProtein}g</span>
          </div>
          <span className="text-[10px] font-mono text-[#4A5D4E]">
            {remaining > 0 ? `${remaining}g remaining` : 'Target Secured'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex flex-col gap-1.5">
        <div className="w-full h-2 bg-[#FAF8F5] border border-[#1A3629]/15 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1A3629] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex items-center justify-between font-mono text-[10px] text-[#4A5D4E]">
          <span>{percent}% of daily floor</span>
          <span>{loggedMealsCount} items logged today</span>
        </div>
      </div>

      {/* HERO FOOD INPUT: Natural Language First */}
      <form onSubmit={handleAmbientMealSubmit} className="flex flex-col gap-2">
        <label htmlFor="natural-meal-input" className="font-cabinet font-bold text-xs uppercase tracking-wider text-[#1A3629] flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#1A3629]" />
          <span>Natural Language Meal Log</span>
        </label>
        
        <div className="flex items-center gap-2">
          <input
            id="natural-meal-input"
            type="text"
            value={ambientMealText}
            onChange={(e) => setAmbientMealText(e.target.value)}
            placeholder="e.g. 3 scrambled eggs with sourdough"
            disabled={isSubmittingMeal}
            className="flex-1 px-3.5 py-2.5 rounded-xl border-2 border-[#1A3629]/20 bg-[#FAF8F5] text-xs font-cabinet font-bold text-[#1A3629] placeholder:text-[#4A5D4E]/60 focus:outline-none focus:border-[#1A3629]"
          />
          <button
            type="submit"
            disabled={!ambientMealText.trim() || isSubmittingMeal}
            className="px-4 py-2.5 rounded-xl bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs hover:bg-[#2C4A3B] transition-colors cursor-pointer disabled:opacity-40 flex items-center justify-center shrink-0 shadow-2xs"
          >
            {isSubmittingMeal ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <span>Calculate</span>
            )}
          </button>
        </div>

        {feedback && (
          <div className="font-mono text-[11px] font-bold text-[#065F46] bg-[#ECFDF5] border border-[#10B981]/30 px-3 py-1.5 rounded-xl animate-in fade-in">
            {feedback}
          </div>
        )}
      </form>

      {/* 1-Tap Quick Plates (Fast Estimation Below) */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E]">
          1-Tap Quick Plates
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PRESET_MEALS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleLogPreset(preset)}
              className="p-2.5 rounded-xl border border-[#1A3629]/15 bg-[#FAF8F5] hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-all cursor-pointer flex flex-col text-left group shadow-2xs"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-cabinet font-bold text-xs text-[#1A3629] group-hover:text-[#FFFDF9]">
                  {preset.label}
                </span>
                <span className="font-mono text-[10px] font-bold text-[#065F46] bg-[#ECFDF5] group-hover:bg-[#FFFDF9] group-hover:text-[#1A3629] px-1.5 py-0.5 rounded">
                  +{preset.protein}g
                </span>
              </div>
              <span className="text-[10px] font-sans text-[#4A5D4E] group-hover:text-[#FFFDF9]/80 mt-0.5">
                {preset.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Weight Check-In Strip */}
      <div className="border-t border-[#1A3629]/10 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#4A5D4E]" />
          <span className="font-mono text-xs text-[#4A5D4E]">Current Weight:</span>
          {isEditingWeight ? (
            <form onSubmit={handleSaveWeight} className="flex items-center gap-1.5">
              <input
                type="number"
                step="0.1"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="w-16 px-2 py-0.5 rounded-lg border border-[#1A3629]/30 bg-[#FFFDF9] font-mono text-xs font-bold text-[#1A3629] text-center focus:outline-none"
                autoFocus
              />
              <span className="text-xs font-mono text-[#4A5D4E]">kg</span>
              <button
                type="submit"
                className="px-2 py-0.5 rounded-lg bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-[10px]"
              >
                Save
              </button>
            </form>
          ) : (
            <span className="font-mono text-xs font-bold text-[#1A3629]">
              {userProfile?.weightKg ? `${userProfile.weightKg} kg` : 'Not recorded'}
            </span>
          )}
        </div>

        {!isEditingWeight && (
          <button
            type="button"
            onClick={() => setIsEditingWeight(true)}
            className="text-[11px] font-cabinet font-bold text-[#1A3629] hover:underline cursor-pointer"
          >
            Update
          </button>
        )}
      </div>
    </div>
  );
}
