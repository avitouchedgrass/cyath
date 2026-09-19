'use client';

import React, { useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { Loader2, X, Camera } from 'lucide-react';
import { PixelMealPlate } from '@/components/dashboard/PixelMealPlate';
import { PhotoMealScannerModal } from '@/components/dashboard/PhotoMealScannerModal';

interface DailyFuelCardProps {
  currentProtein: number;
  targetProtein: number;
  currentDate: string;
}

const PRESET_MEALS = [
  { label: 'Balanced Plate', protein: 35, calories: 520, desc: 'Protein + Veg + Carb' },
  { label: 'High Protein Anchor', protein: 50, calories: 460, desc: 'Steak / Chicken breast' },
  { label: 'Light Quick Fuel', protein: 20, calories: 240, desc: 'Eggs / Greek yogurt' },
  { label: 'Refuel Shake', protein: 30, calories: 260, desc: 'Greek yogurt & whey' },
] as const;

export function DailyFuelCard({
  currentProtein,
  targetProtein,
  currentDate,
}: DailyFuelCardProps) {
  const {
    logMealToDay,
    removeMealFromDay,
    logWeight,
    userProfile,
    getDailyLog,
  } = useHabitStore();

  const [ambientMealText, setAmbientMealText] = useState('');
  const [isSubmittingMeal, setIsSubmittingMeal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [weightError, setWeightError] = useState<string | null>(null);
  const [isMealsExpanded, setIsMealsExpanded] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

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
        suggestedSprite: '/assets/food/generic-plate.png',
      },
      currentDate
    );
    setFeedback(`+${preset.protein}g ${preset.label} logged`);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Ambient Natural Language Food Logging
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
            ingredients: [{ item: text, amount: '1 portion' }],
            suggestedSprite: '/assets/food/generic-plate.png',
          },
          currentDate
        );
        retroAudio.playInspectConfirm();
        haptics.success();
        setAmbientMealText('');
        setFeedback(`Logged: ${data.mealName || text} (+${protein}g protein)`);
        setTimeout(() => setFeedback(null), 3500);
      } else {
        throw new Error('API parse error');
      }
    } catch {
      logMealToDay(
        {
          name: text,
          protein: 25,
          calories: 350,
          ingredients: [{ item: text, amount: '1 portion' }],
          suggestedSprite: '/assets/food/generic-plate.png',
        },
        currentDate
      );
      retroAudio.playInspectConfirm();
      haptics.success();
      setFeedback(`Estimated: ${text} (+25g protein)`);
      setTimeout(() => setFeedback(null), 3500);
    } finally {
      setIsSubmittingMeal(false);
    }
  };

  // Weight Check-in
  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (!isNaN(val) && val > 30 && val < 300) {
      retroAudio.playInspectConfirm();
      haptics.tap();
      logWeight(val, undefined, currentDate);
      setIsEditingWeight(false);
      setWeightError(null);
      setFeedback(`Weight updated: ${val.toFixed(1)} kg`);
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setWeightError('Enter a value between 30 and 300 kg');
    }
  };

  return (
    <div
      id="tour-fuel-anchor"
      className="w-full bg-[#FFFDF9] border border-[#1A3629]/15 rounded-3xl p-5 sm:p-6 shadow-[0_8px_32px_rgba(26,54,41,0.04)] flex flex-col gap-4"
    >
      
      {/* 1. Title & Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2.5">
          <h3 className="font-cabinet font-extrabold text-base text-[#1A3629] tracking-tight">
            Log Food
          </h3>
          <button
            type="button"
            onClick={() => {
              retroAudio.playBlip();
              haptics.tap();
              setIsPhotoModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#1A3629]/15 bg-[#FAF6EE] hover:bg-[#1A3629] hover:text-[#FFFDF9] text-[#1A3629] text-[11px] font-cabinet font-bold transition-all cursor-pointer shadow-2xs group select-none"
            title="Scan whole-food plate with camera photo"
            aria-label="Scan meal photo"
          >
            <Camera className="w-3.5 h-3.5 text-[#059669] group-hover:text-[#FFFDF9] transition-colors" />
            <span>Scan Photo</span>
          </button>
        </div>
        <span className="font-mono text-xs font-bold text-[#1A3629]">
          {percent}% Target
        </span>
      </div>

      {/* 2. Progress Bar immediately below title */}
      <div className="flex flex-col gap-1.5">
        <div
          role="progressbar"
          aria-label="Daily protein progress"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="w-full h-2.5 bg-[#1A3629]/10 rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-[#1A3629] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Amount logged stated below progress bar */}
        <div className="flex items-center justify-between font-mono text-xs text-[#4A5D4E]">
          <span className="font-semibold text-[#1A3629]">{currentProtein}g logged of {targetProtein}g floor</span>
          <span>{remaining > 0 ? `${remaining}g to floor` : 'Floor Secured'}</span>
        </div>
      </div>

      {/* 3. Highlighted Contrast Meal Input */}
      <form onSubmit={handleAmbientMealSubmit} className="flex flex-col gap-1.5">
        <label htmlFor="natural-meal-input" className="sr-only">
          Describe whole-food meal or fuel to log
        </label>
        <div className="relative flex items-center">
          <input
            id="natural-meal-input"
            type="text"
            value={ambientMealText}
            onChange={(e) => setAmbientMealText(e.target.value)}
            placeholder="e.g. 200g ribeye steak with sweet potato"
            disabled={isSubmittingMeal}
            maxLength={200}
            aria-label="Describe whole-food meal or fuel to log"
            className="w-full pl-3.5 pr-26 py-3 rounded-xl border-2 border-[#1A3629] bg-[#FFFDF9] text-xs font-cabinet font-bold text-[#1A3629] placeholder:text-[#4A5D4E]/70 focus:outline-none focus:ring-3 focus:ring-[#1A3629]/15 shadow-xs transition-all duration-200"
          />
          <button
            type="submit"
            disabled={!ambientMealText.trim() || isSubmittingMeal}
            className="absolute right-1.5 px-4 py-2 rounded-lg bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs hover:bg-[#2C4A3B] transition-colors cursor-pointer disabled:opacity-30 flex items-center justify-center shrink-0 shadow-2xs active:scale-98"
          >
            {isSubmittingMeal ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <span>Log Meal</span>
            )}
          </button>
        </div>

        {feedback && (
          <div
            role="status"
            aria-live="polite"
            className="font-mono text-[11px] font-bold text-[#065F46] bg-[#ECFDF5] border border-[#10B981]/30 px-3 py-1.5 rounded-xl animate-in fade-in"
          >
            {feedback}
          </div>
        )}
      </form>

      {/* 4. 4 Boxes of Quick Calibrated Plates */}
      <div className="flex flex-col gap-1.5">
        <span className="font-cabinet font-bold text-xs text-[#1A3629]">
          Quick Calibrated
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_MEALS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleLogPreset(preset)}
              className="p-2.5 rounded-xl border border-[#1A3629]/15 bg-[#FAF8F5] hover:bg-[#1A3629] hover:text-[#FFFDF9] text-[#1A3629] transition-all duration-200 cursor-pointer flex flex-col items-center text-center gap-1.5 group shadow-2xs active:scale-98"
              title={preset.desc}
            >
              <PixelMealPlate mealName={preset.desc} size={28} />
              <span className="font-cabinet font-bold text-[11px] leading-tight group-hover:text-[#FFFDF9]">
                {preset.label}
              </span>
              <span className="font-mono text-[10px] font-bold text-[#065F46] bg-[#ECFDF5] group-hover:bg-white/15 group-hover:text-white px-1.5 py-0.5 rounded border border-[#10B981]/20 group-hover:border-white/20">
                +{preset.protein}g
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Subtle Arrow Accordion for Today's Logged Meals */}
      <div className="pt-2 border-t border-[#1A3629]/10 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            retroAudio.playBlip();
            haptics.tap();
            setIsMealsExpanded((prev) => !prev);
          }}
          className="w-full py-2 px-3 rounded-xl border border-[#1A3629]/12 bg-[#FAF8F5] hover:bg-[#1A3629]/5 text-[#1A3629] transition-all flex items-center justify-between cursor-pointer group"
          aria-expanded={isMealsExpanded}
        >
          <span className="font-cabinet font-bold text-xs text-[#1A3629]">
            Today's Logged Meals ({loggedMealsCount})
          </span>
          <div className="flex items-center gap-1 font-mono text-[11px] text-[#4A5D4E] group-hover:text-[#1A3629]">
            <span>{isMealsExpanded ? 'Collapse' : 'Inspect'}</span>
            <span className={`transition-transform duration-200 font-bold ${isMealsExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
        </button>

        {isMealsExpanded && (
          <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1 animate-in fade-in duration-200">
            {currentLog.loggedMeals && currentLog.loggedMeals.length > 0 ? (
              currentLog.loggedMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl border border-[#1A3629]/10 bg-[#FAF8F5] text-xs transition-colors hover:border-[#1A3629]/20"
                >
                  <PixelMealPlate mealName={meal.name} size={32} />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-cabinet font-bold text-[#1A3629] truncate">
                      {meal.name}
                    </span>
                    <div className="flex items-center gap-2 font-mono text-[10px] text-[#4A5D4E]">
                      <span className="text-[#065F46] font-bold">+{meal.protein}g protein</span>
                      <span>/</span>
                      <span>{meal.calories} kcal</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      retroAudio.playBlip();
                      haptics.tap();
                      removeMealFromDay(meal.id, currentDate);
                    }}
                    className="w-6 h-6 rounded-md hover:bg-[#DC2626]/10 text-[#4A5D4E] hover:text-[#DC2626] transition-colors flex items-center justify-center cursor-pointer shrink-0"
                    title="Remove meal entry"
                    aria-label={`Remove ${meal.name}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-3 px-3 rounded-xl border border-dashed border-[#1A3629]/15 bg-[#FAF8F5]/80 text-center font-sans text-xs text-[#2B3A2F] font-medium">
                No meals logged yet today. Type a meal above or choose a Quick Calibrated plate.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Weight Check-In Strip */}
      <div className="border-t border-[#1A3629]/10 pt-3.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="font-sans text-xs text-[#4A5D4E]">Current Weight:</span>
          {isEditingWeight ? (
            <form onSubmit={handleSaveWeight} className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="300"
                  aria-label="Current body weight in kilograms"
                  value={weightInput}
                  onChange={(e) => { setWeightInput(e.target.value); setWeightError(null); }}
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
              </div>
              {weightError && (
                <span className="font-mono text-[10px] text-[#DC2626]">{weightError}</span>
              )}
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
            className="py-1 px-2.5 rounded-lg border border-[#1A3629]/15 hover:bg-[#FAF8F5] text-xs font-cabinet font-bold text-[#1A3629] transition-colors cursor-pointer shadow-2xs relative before:absolute before:-inset-2 before:content-['']"
          >
            Update
          </button>
        )}
      </div>

      {/* Photo Meal Scanner Modal */}
      <PhotoMealScannerModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
      />
    </div>
  );
}
