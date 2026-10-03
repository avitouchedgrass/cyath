'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { xpParticleEmitter } from '@/lib/particleEmitter';
import { Recipe } from '@/lib/recipes';
import { RecommendedRecipeMatch } from '@/lib/metabolicRebalancer';
import {
  PixelFlame,
  PixelClock,
  PixelChefHat,
  PixelCheck,
  PixelX,
  PixelSparkles,
  PixelAlert,
  PixelSpinner,
  PixelTarget,
} from '@/components/common/PixelIcons';
import { PixelMealPlate } from '@/components/dashboard/PixelMealPlate';

interface MetabolicDinnerRebalancerProps {
  className?: string;
  onCookRecipe?: (recipe: Recipe, protein: number, calories: number) => void;
}

export function MetabolicDinnerRebalancer({
  className = '',
  onCookRecipe,
}: MetabolicDinnerRebalancerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    currentDate,
    getDailyLog,
    getProteinRebalance,
    logMealToDay,
  } = useHabitStore();

  const [activeModalRecipe, setActiveModalRecipe] = useState<Recipe | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [cookingRecipeId, setCookingRecipeId] = useState<string | null>(null);

  const rebalance = getProteinRebalance(currentDate);
  const dailyLog = getDailyLog(currentDate);

  const totalLogged = dailyLog.totalProteinLogged || 0;
  const target = rebalance.dailyTarget;
  const progressPct = Math.min(100, Math.round((totalLogged / target) * 100));

  const handleCookAndLog = (match: RecommendedRecipeMatch, e: React.MouseEvent) => {
    e.stopPropagation();
    retroAudio.playInspectConfirm();
    haptics.success();
    xpParticleEmitter.emit(e.clientX, e.clientY, 12);

    setCookingRecipeId(match.recipe.id);

    logMealToDay(
      {
        name: match.recipe.name,
        protein: match.effectiveProtein,
        calories: match.effectiveCalories,
        ingredients: match.recipe.ingredients || [{ item: match.recipe.name, amount: '1 portion' }],
        suggestedSprite: match.recipe.image || '/assets/food/generic-plate.webp',
        recipeId: match.recipe.id,
      },
      currentDate
    );

    if (onCookRecipe) {
      onCookRecipe(match.recipe, match.effectiveProtein, match.effectiveCalories);
    }

    setFeedback(`Logged "${match.recipe.name}" (+${match.effectiveProtein}g protein)! Floor updated.`);
    setTimeout(() => {
      setCookingRecipeId(null);
      setFeedback(null);
    }, 3500);
  };

  const getStatusBadge = () => {
    switch (rebalance.statusType) {
      case 'goal_locked':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono text-xs font-bold flex items-center gap-1.5">
            <PixelCheck size={12} color="#065F46" />
            Goal Locked ({totalLogged}g / {target}g)
          </span>
        );
      case 'deficit_catchup':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono text-xs font-bold flex items-center gap-1.5 animate-pulse">
            <PixelAlert size={12} color="#92400E" />
            Deficit Catch-up (+{rebalance.adjustedDinnerTarget}g needed)
          </span>
        );
      case 'surplus':
        return (
          <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-300 font-mono text-xs font-bold flex items-center gap-1.5">
            <PixelSparkles size={12} color="#0369A1" />
            Ahead of Pace (Light {rebalance.adjustedDinnerTarget}g dinner)
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-[#1A3629]/10 text-[#1A3629] border border-[#1A3629]/20 font-mono text-xs font-bold flex items-center gap-1.5">
            <PixelTarget size={12} color="#1A3629" />
            Target: {rebalance.adjustedDinnerTarget}g Dinner
          </span>
        );
    }
  };

  if (!mounted) {
    return (
      <section
        id="tour-metabolic-rebalancer"
        className={`w-full bg-[#FFFDF9] border-2 border-[#1A3629] rounded-3xl p-6 sm:p-7 shadow-[4px_4px_0px_#1A3629] flex flex-col gap-6 ${className}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#1A3629]/15">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1A3629]" />
              <h2 className="font-cabinet font-extrabold text-xl sm:text-2xl text-[#1A3629] tracking-tight">
                Metabolic Dinner Rebalancer
              </h2>
            </div>
            <p className="font-sans text-xs sm:text-sm text-[#4A5D4E]">
              Calibrating your personalized evening metabolic target...
            </p>
          </div>
          <div className="shrink-0">
            <span className="px-3 py-1 rounded-full bg-[#1A3629]/10 text-[#1A3629] border border-[#1A3629]/20 font-mono text-xs font-bold flex items-center gap-1.5">
              <PixelTarget size={12} color="#1A3629" />
              Target: Calibrating...
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#1A3629]/20 flex flex-col gap-3">
          <div className="flex items-center justify-between font-mono text-xs text-[#1A3629]">
            <span className="font-bold">Daily Floor Progress</span>
            <span className="font-bold tabular-nums">-- / --</span>
          </div>
          <div className="w-full h-3 rounded-full bg-[#EAE3D2] overflow-hidden border border-[#1A3629]/20">
            <div className="h-full bg-[#1A3629]/30 rounded-full w-1/3 animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="tour-metabolic-rebalancer"
      className={`w-full bg-[#FFFDF9] border-2 border-[#1A3629] rounded-3xl p-6 sm:p-7 shadow-[4px_4px_0px_#1A3629] flex flex-col gap-6 ${className}`}
    >
      {/* 1. Header & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#1A3629]/15">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1A3629]" />
            <h2 className="font-cabinet font-extrabold text-xl sm:text-2xl text-[#1A3629] tracking-tight">
              Metabolic Dinner Rebalancer
            </h2>
          </div>
          <p suppressHydrationWarning className="font-sans text-xs sm:text-sm text-[#4A5D4E]">
            {rebalance.advice}
          </p>
        </div>

        <div className="shrink-0" suppressHydrationWarning>{getStatusBadge()}</div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-cabinet font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <PixelCheck size={14} color="#065F46" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 2. Today's Metabolic Fuel Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#1A3629]/20 flex flex-col gap-3">
        <div className="flex items-center justify-between font-mono text-xs text-[#1A3629]">
          <span className="font-bold">Daily Floor Progress</span>
          <span className="font-bold tabular-nums">
            {totalLogged}g / {target}g ({progressPct}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 rounded-full bg-[#EAE3D2] overflow-hidden border border-[#1A3629]/20 relative">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              rebalance.isGoalAchieved ? 'bg-emerald-600' : 'bg-[#1A3629]'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Meal Breakdown Pills */}
        <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px] text-center">
          <div className="p-2 rounded-xl bg-[#FFFDF9] border border-[#1A3629]/10">
            <span className="text-[10px] text-[#4A5D4E] uppercase block">Breakfast</span>
            <span className="font-bold text-[#1A3629]">+{rebalance.breakfastProtein}g</span>
          </div>
          <div className="p-2 rounded-xl bg-[#FFFDF9] border border-[#1A3629]/10">
            <span className="text-[10px] text-[#4A5D4E] uppercase block">Lunch</span>
            <span className="font-bold text-[#1A3629]">+{rebalance.lunchProtein}g</span>
          </div>
          <div className="p-2 rounded-xl bg-[#FFFDF9] border border-[#1A3629]/10">
            <span className="text-[10px] text-[#4A5D4E] uppercase block">Dinner Target</span>
            <span className={`font-bold ${rebalance.isGoalAchieved ? 'text-emerald-700' : 'text-amber-800'}`}>
              {rebalance.isGoalAchieved ? 'Locked' : `${rebalance.adjustedDinnerTarget}g`}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Recommended Chef Matches */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PixelChefHat size={16} color="#1A3629" />
            <h3 className="font-cabinet font-extrabold text-base sm:text-lg text-[#1A3629]">
              {rebalance.isGoalAchieved
                ? 'Light Restorative Recommendations'
                : `Chef Dishes Calibrated to Hit Your Remaining ${rebalance.adjustedDinnerTarget}g`}
            </h3>
          </div>
          <span className="font-mono text-xs text-[#4A5D4E] hidden sm:inline">
            1-tap cooking &amp; ledger sync
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rebalance.recommendedRecipes.map((match) => {
            const isCooking = cookingRecipeId === match.recipe.id;
            return (
              <div
                key={match.recipe.id}
                onClick={() => {
                  retroAudio.playBlip();
                  setActiveModalRecipe(match.recipe);
                }}
                className="bg-[#FFFDF9] border-2 border-[#1A3629] rounded-2xl p-4 shadow-[3px_3px_0px_#1A3629] hover:shadow-[4px_4px_0px_#1A3629] hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between gap-3 group"
              >
                {/* Recipe Header & Image */}
                <div className="flex flex-col gap-3">
                  <div className="relative w-full h-48 sm:h-52 rounded-xl overflow-hidden bg-gradient-to-b from-[#FAF8F5] to-[#F5EFE4] border border-[#1A3629]/15 flex items-center justify-center shrink-0">
                    {match.recipe.image ? (
                      <Image
                        src={match.recipe.image}
                        alt={match.recipe.name}
                        fill
                        className="object-contain p-2.5 sm:p-3 group-hover:scale-105 transition-transform duration-300 [image-rendering:pixelated] drop-shadow-md"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <PixelMealPlate mealName={match.recipe.name} size={72} className="opacity-70" />
                    )}

                    {/* Macro Badge on top of image */}
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-[#1A3629] text-[#FFFDF9] font-mono text-xs font-bold shadow-xs">
                      +{match.effectiveProtein}g Protein
                    </div>
                  </div>

                  <div>
                    <h4 className="font-cabinet font-bold text-sm text-[#1A3629] leading-snug line-clamp-1 h-5">
                      {match.recipe.name}
                    </h4>
                    <p className="font-sans text-[11px] text-[#4A5D4E] mt-0.5 line-clamp-2 h-8 leading-4">
                      {match.recipe.subtitle || match.recipe.description}
                    </p>
                  </div>
                </div>

                {/* Match Reasoning & Details */}
                <div className="flex flex-col gap-2.5 pt-2 border-t border-[#1A3629]/10">
                  <div className="px-2.5 py-1 rounded-lg bg-amber-50/80 border border-amber-200/80 text-[10px] font-sans text-amber-900 leading-tight h-8 flex items-center overflow-hidden">
                    <span className="line-clamp-2">{match.matchReason}</span>
                  </div>

                  <div className="flex items-center justify-between font-mono text-[11px] text-[#4A5D4E] h-5">
                    <span className="flex items-center gap-1.5">
                      <PixelFlame size={12} color="#EA580C" />
                      {match.effectiveCalories} kcal
                    </span>
                    <span className="flex items-center gap-1.5">
                      <PixelClock size={12} color="#4A5D4E" />
                      {match.recipe.prepTimeMinutes}m prep
                    </span>
                  </div>

                  {/* 1-Tap Cook & Log Button */}
                  <button
                    type="button"
                    disabled={isCooking}
                    onClick={(e) => handleCookAndLog(match, e)}
                    className="w-full h-10 px-3 rounded-xl bg-[#1A3629] hover:bg-[#2C4A3B] text-[#FFFDF9] font-cabinet font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[2px_2px_0px_#2C5E43] active:translate-y-0.5 cursor-pointer disabled:opacity-50"
                  >
                    {isCooking ? (
                      <PixelSpinner size={14} color="#FFFDF9" />
                    ) : (
                      <>
                        <PixelChefHat size={14} color="#FFFDF9" />
                        <span>Cook &amp; Log (+{match.effectiveProtein}g)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Recipe Detail & Cooking Steps Modal */}
      {activeModalRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-[#FFFDF9] border-2 border-[#1A3629] rounded-3xl p-6 shadow-[8px_8px_0px_#1A3629] flex flex-col gap-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#1A3629]/15 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  {activeModalRecipe.category} · {activeModalRecipe.dietType}
                </span>
                <h3 className="font-cabinet font-extrabold text-xl text-[#1A3629] mt-0.5">
                  {activeModalRecipe.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalRecipe(null)}
                className="p-2 rounded-xl border border-[#1A3629]/20 hover:bg-[#1A3629]/5 text-[#1A3629] cursor-pointer"
                aria-label="Close modal"
              >
                <PixelX size={14} color="#1A3629" />
              </button>
            </div>

            {/* Macros Grid */}
            <div className="grid grid-cols-4 gap-2 font-mono text-center">
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#1A3629]/15">
                <span className="text-[10px] text-[#4A5D4E] uppercase block">Protein</span>
                <span className="font-bold text-sm text-emerald-700">{activeModalRecipe.protein}g</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#1A3629]/15">
                <span className="text-[10px] text-[#4A5D4E] uppercase block">Calories</span>
                <span className="font-bold text-sm text-[#1A3629]">{activeModalRecipe.calories}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#1A3629]/15">
                <span className="text-[10px] text-[#4A5D4E] uppercase block">Carbs</span>
                <span className="font-bold text-sm text-[#1A3629]">{activeModalRecipe.carbs}g</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#1A3629]/15">
                <span className="text-[10px] text-[#4A5D4E] uppercase block">Fats</span>
                <span className="font-bold text-sm text-[#1A3629]">{activeModalRecipe.fats}g</span>
              </div>
            </div>

            {/* Ingredients */}
            <div className="flex flex-col gap-2">
              <h4 className="font-cabinet font-bold text-sm text-[#1A3629]">
                Ingredients ({activeModalRecipe.ingredients.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {activeModalRecipe.ingredients.map((ing, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-xl bg-[#FAF8F5] border border-[#1A3629]/10 text-xs font-sans flex items-center justify-between"
                  >
                    <span className="text-[#1A3629] font-medium">{ing.item}</span>
                    <span className="text-[#4A5D4E] font-mono text-[11px]">{ing.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cooking Instructions */}
            {activeModalRecipe.instructions && activeModalRecipe.instructions.length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="font-cabinet font-bold text-sm text-[#1A3629]">
                  Preparation Steps ({activeModalRecipe.instructions.length})
                </h4>
                <div className="flex flex-col gap-2">
                  {activeModalRecipe.instructions.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#FAF8F5] border border-[#1A3629]/10 text-xs font-sans text-[#1A3629] flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#1A3629] text-[#FFFDF9] font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  retroAudio.playInspectConfirm();
                  haptics.success();
                  xpParticleEmitter.emit(e.clientX, e.clientY, 12);
                  logMealToDay(
                    {
                      name: activeModalRecipe.name,
                      protein: activeModalRecipe.protein,
                      calories: activeModalRecipe.calories,
                      ingredients: activeModalRecipe.ingredients,
                      suggestedSprite: activeModalRecipe.image || '/assets/food/generic-plate.webp',
                      recipeId: activeModalRecipe.id,
                    },
                    currentDate
                  );
                  setActiveModalRecipe(null);
                  setFeedback(`Logged "${activeModalRecipe.name}" (+${activeModalRecipe.protein}g protein)!`);
                  setTimeout(() => setFeedback(null), 3500);
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#1A3629] hover:bg-[#2C4A3B] text-[#FFFDF9] font-cabinet font-bold text-xs flex items-center justify-center gap-2 shadow-[2px_2px_0px_#2C5E43] cursor-pointer"
              >
                <PixelChefHat size={16} color="#FFFDF9" />
                <span>Cook &amp; Log (+{activeModalRecipe.protein}g)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalRecipe(null)}
                className="py-3 px-5 rounded-2xl border border-[#1A3629]/20 text-[#1A3629] font-cabinet font-bold text-xs hover:bg-[#1A3629]/5 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
