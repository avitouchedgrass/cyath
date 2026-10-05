'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PhotoMealScannerModal } from '@/components/dashboard/PhotoMealScannerModal';
import { MetabolicDinnerRebalancer } from '@/components/fuel/MetabolicDinnerRebalancer';
import { RECIPES, Recipe } from '@/lib/recipes';
import { retroAudio } from '@/lib/retroAudio';
import { haptics } from '@/lib/haptics';
import { xpParticleEmitter } from '@/lib/particleEmitter';
import { useHabitStore } from '@/store/useHabitStore';
import {
  PixelCamera,
  PixelSearch,
  PixelAlert,
  PixelFlame,
  PixelCheck,
  PixelChefHat,
  PixelClock,
  PixelX,
  PixelSparkles,
  PixelSpinner,
} from '@/components/common/PixelIcons';
import { PixelSpark } from '@/components/common/PixelSpark';
import { PixelMealPlate } from '@/components/dashboard/PixelMealPlate';
import { parseInstantMeal } from '@/lib/instantMacroEngine';

export default function FuelPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    currentDate,
    getProteinRebalance,
    logMealToDay,
    getDailyLog,
  } = useHabitStore();

  const currentLog = getDailyLog(currentDate);
  const loggedMeals = currentLog.loggedMeals || [];
  const hasEatenBreakfast = loggedMeals.some((m) => m.mealSlot === 'breakfast');
  const hasEatenLunch = loggedMeals.some((m) => m.mealSlot === 'lunch');
  const hasEatenDinner = loggedMeals.some((m) => m.mealSlot === 'dinner');

  const [mealInput, setMealInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [isPhotoScannerOpen, setIsPhotoScannerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState<Recipe | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const rebalance = getProteinRebalance(currentDate);

  const handleLogToSlot = (slot: 'breakfast' | 'lunch' | 'dinner') => {
    if (!parsedResult) return;
    retroAudio.playInspectConfirm();
    logMealToDay(
      {
        name: parsedResult.mealName || mealInput,
        protein: parsedResult.protein,
        calories: parsedResult.calories,
        carbs: parsedResult.carbs,
        fats: parsedResult.fats,
        dietType: parsedResult.dietType,
        category: parsedResult.category,
        ingredients: parsedResult.ingredients,
        suggestedSprite: parsedResult.suggestedSprite || '/assets/food/generic-plate.png',
        mealSlot: slot,
      },
      currentDate
    );
    setFeedback(`Logged ${parsedResult.mealName} as ${slot.toUpperCase()} (+${parsedResult.protein}g protein)!`);
    setMealInput('');
    setParsedResult(null);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleAnalyzeText = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = mealInput.trim();
    if (!text || isAnalyzing) return;

    setIsAnalyzing(true);
    setErrorMessage(null);
    setParsedResult(null);
    retroAudio.playBlip();

    try {
      const res = await fetch('/api/ai/parse-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Unable to analyze food. Please describe what you ate.');
        retroAudio.playBlip();
        return;
      }

      if (data.isNotFood) {
        setErrorMessage(data.error);
        retroAudio.playBlip();
        return;
      }

      setParsedResult(data);
      retroAudio.playTierUpgrade();
      haptics.tap();
    } catch {
      // Graceful offline fallback to instant local engine
      const instant = parseInstantMeal(text);
      if (instant) {
        if (instant.isNotFood) {
          setErrorMessage(instant.error || 'This does not appear to be food. Please enter what you actually ate.');
        } else {
          setParsedResult(instant);
          retroAudio.playTierUpgrade();
          haptics.tap();
        }
      } else {
        setErrorMessage('Network error analyzing meal. Please check connection.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCookFromCatalog = (recipe: Recipe, e: React.MouseEvent) => {
    e.stopPropagation();
    retroAudio.playInspectConfirm();
    haptics.success();
    xpParticleEmitter.emit(e.clientX, e.clientY, 12);

    logMealToDay(
      {
        name: recipe.name,
        protein: recipe.protein,
        calories: recipe.calories,
        ingredients: recipe.ingredients,
        suggestedSprite: recipe.image || '/assets/food/generic-plate.webp',
        recipeId: recipe.id,
      },
      currentDate
    );

    setFeedback(`Cooked & Logged "${recipe.name}" (+${recipe.protein}g protein)!`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const filteredRecipes = RECIPES.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ingredients.some((i) => i.item.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Hits Floor') {
      const targetRem = rebalance.adjustedDinnerTarget;
      return targetRem > 0 && Math.abs(r.protein - targetRem) <= 14;
    }
    return r.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1A3629] flex flex-col selection:bg-[#1A3629] selection:text-[#FFFDF9]">
      <HeaderNav />

      <main className="relative z-10 flex-1 max-w-7xl 2xl:max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-48 flex flex-col gap-8">
        <Breadcrumbs items={[{ label: 'Meals & Nutrition' }]} />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A3629]/10 pb-4">
          <div>
            <h1 className="font-cabinet font-extrabold text-3xl md:text-4xl tracking-tight text-[#1A3629]">
              Meals &amp; Nutrition
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#4A5D4E] mt-0.5">
              Smart Dinner Rebalancer, instant food calculator, and 31+ healthy recipes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              retroAudio.playInspectConfirm();
              haptics.tap();
              setIsPhotoScannerOpen(true);
            }}
            className="h-11 px-5 rounded-2xl bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs hover:bg-[#2C4A3B] transition-all cursor-pointer shadow-[3px_3px_0px_#2C5E43] flex items-center gap-2 shrink-0 select-none"
          >
            <PixelCamera size={16} color="#FFFDF9" />
            <span>Scan Dish with Camera</span>
          </button>
        </div>

        {/* Global Feedback Toast */}
        {feedback && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-cabinet font-bold flex items-center gap-2.5 animate-in fade-in duration-200">
            <PixelCheck size={14} color="#065F46" />
            <span>{feedback}</span>
          </div>
        )}

        {/* SECTION 1: Metabolic Dinner Rebalancer / Smart Macro Filler */}
        <MetabolicDinnerRebalancer />

        {/* SECTION 2: Natural Language AI Food & Macro Analyzer */}
        <section className="w-full bg-[#FFFDF9] border-2 border-[#1A3629] rounded-3xl p-6 sm:p-7 shadow-[4px_4px_0px_#1A3629] flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1A3629]" />
              <h2 className="font-cabinet font-extrabold text-xl text-[#1A3629] tracking-tight">
                Instant Food &amp; Macro Calculator
              </h2>
            </div>
          </div>

          <form onSubmit={handleAnalyzeText} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={mealInput}
              onChange={(e) => setMealInput(e.target.value)}
              placeholder="e.g. 3 scrambled eggs with 1 slice sourdough and half an avocado..."
              className="flex-1 h-12 px-4 rounded-2xl border-2 border-[#1A3629] bg-[#FAF8F5] text-xs sm:text-sm font-cabinet font-bold text-[#1A3629] focus:outline-none focus:bg-[#FFFDF9] transition-all"
            />
            <button
              type="submit"
              disabled={isAnalyzing || !mealInput.trim()}
              className="h-12 px-6 rounded-2xl bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs hover:bg-[#2C4A3B] transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-[2px_2px_0px_#2C5E43]"
            >
              {isAnalyzing ? (
                <PixelSpinner size={16} color="#FFFDF9" />
              ) : (
                <>
                  <PixelSpark size={16} />
                  <span>Calculate Macros</span>
                </>
              )}
            </button>
          </form>

          {/* Error / Non-Food Rejection Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
              <PixelAlert size={16} color="#B45309" />
              <span className="font-sans font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Parsed Result Display */}
          {parsedResult && parsedResult.hasCompletePortions && (
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#1A3629]/20 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1A3629]/15 pb-3">
                <span className="font-cabinet font-extrabold text-lg text-[#1A3629]">
                  {parsedResult.mealName}
                </span>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-[#1A3629] text-[#FFFDF9]">
                  {parsedResult.category}
                </span>
              </div>

              {/* Macro Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
                <div className="p-3 bg-[#FFFDF9] rounded-xl border border-[#1A3629]/15">
                  <span className="text-[10px] text-[#4A5D4E] uppercase block">Protein</span>
                  <span className="text-xl font-bold text-emerald-700">{parsedResult.protein}g</span>
                </div>
                <div className="p-3 bg-[#FFFDF9] rounded-xl border border-[#1A3629]/15">
                  <span className="text-[10px] text-[#4A5D4E] uppercase block">Calories</span>
                  <span className="text-xl font-bold text-[#1A3629]">{parsedResult.calories} kcal</span>
                </div>
                <div className="p-3 bg-[#FFFDF9] rounded-xl border border-[#1A3629]/15">
                  <span className="text-[10px] text-[#4A5D4E] uppercase block">Carbs</span>
                  <span className="text-xl font-bold text-[#1A3629]">{parsedResult.carbs}g</span>
                </div>
                <div className="p-3 bg-[#FFFDF9] rounded-xl border border-[#1A3629]/15">
                  <span className="text-[10px] text-[#4A5D4E] uppercase block">Fats</span>
                  <span className="text-xl font-bold text-[#1A3629]">{parsedResult.fats}g</span>
                </div>
              </div>

              {/* Ingredients List */}
              {parsedResult.ingredients?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {parsedResult.ingredients.map((ing: any, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-[#FFFDF9] border border-[#1A3629]/15 text-xs font-sans text-[#1A3629]"
                    >
                      {ing.item} ({ing.amount})
                    </span>
                  ))}
                </div>
              )}

              {/* Meal Slot Destination Selection: Breakfast, Lunch, Dinner */}
              <div className="pt-3 border-t border-[#1A3629]/15 flex flex-col gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E]">
                  Log to today's ledger:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={hasEatenBreakfast}
                    onClick={() => handleLogToSlot('breakfast')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-cabinet font-bold flex items-center justify-between cursor-pointer transition-all ${
                      hasEatenBreakfast
                        ? 'border-[#1A3629]/10 bg-[#FAF8F5] text-[#1A3629]/40 cursor-not-allowed'
                        : 'border-[#1A3629]/20 bg-[#FFFDF9] hover:bg-[#1A3629] hover:text-[#FFFDF9] text-[#1A3629]'
                    }`}
                  >
                    <span>Breakfast</span>
                    <span className="font-mono text-[10px]">{hasEatenBreakfast ? 'Eaten' : `+${parsedResult.protein}g`}</span>
                  </button>

                  <button
                    type="button"
                    disabled={hasEatenLunch}
                    onClick={() => handleLogToSlot('lunch')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-cabinet font-bold flex items-center justify-between cursor-pointer transition-all ${
                      hasEatenLunch
                        ? 'border-[#1A3629]/10 bg-[#FAF8F5] text-[#1A3629]/40 cursor-not-allowed'
                        : 'border-[#1A3629]/20 bg-[#FFFDF9] hover:bg-[#1A3629] hover:text-[#FFFDF9] text-[#1A3629]'
                    }`}
                  >
                    <span>Lunch</span>
                    <span className="font-mono text-[10px]">{hasEatenLunch ? 'Eaten' : `+${parsedResult.protein}g`}</span>
                  </button>

                  <button
                    type="button"
                    disabled={hasEatenDinner}
                    onClick={() => handleLogToSlot('dinner')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-cabinet font-bold flex items-center justify-between cursor-pointer transition-all ${
                      hasEatenDinner
                        ? 'border-[#1A3629]/10 bg-[#FAF8F5] text-[#1A3629]/40 cursor-not-allowed'
                        : 'border-[#1A3629]/20 bg-[#FFFDF9] hover:bg-[#1A3629] hover:text-[#FFFDF9] text-[#1A3629]'
                    }`}
                  >
                    <span>Dinner</span>
                    <span className="font-mono text-[10px]">{hasEatenDinner ? 'Eaten' : `+${parsedResult.protein}g`}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Missing portion clarification */}
          {parsedResult && !parsedResult.hasCompletePortions && (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col gap-2">
              <span className="font-cabinet font-bold text-sm">Please Specify Portions</span>
              <p className="font-sans">{parsedResult.clarificationQuestion}</p>
            </div>
          )}
        </section>

        {/* SECTION 3: Curated Chef Recipes Catalog with 1-Tap Cooking */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-cabinet font-extrabold text-2xl text-[#1A3629] tracking-tight">
                High-Protein Meals
              </h2>
              <p className="font-sans text-xs sm:text-sm text-[#4A5D4E] mt-0.5">
                Whole-food protein meals. Tap any dish to view ingredients or log directly to your daily summary.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72 shrink-0">
              <PixelSearch size={14} color="#1A3629" className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ingredients..."
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-[#1A3629]/20 bg-[#FFFDF9] text-xs font-cabinet font-bold text-[#1A3629] focus:outline-none focus:border-[#1A3629] shadow-xs"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['All', 'Hits Floor', 'High Protein', 'Steady Carbs', 'Quick Fuel', 'Keto Clean'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  setSelectedCategory(cat);
                }}
                className={`h-8 px-4 rounded-full font-cabinet font-bold text-xs cursor-pointer whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-[#1A3629] text-[#FFFDF9] shadow-[2px_2px_0px_#2C5E43]'
                    : 'bg-[#FFFDF9] border border-[#1A3629]/15 text-[#1A3629] hover:bg-[#FAF8F5]'
                }`}
              >
                {cat === 'Hits Floor' ? (
                  <>
                    <PixelSparkles size={12} color={selectedCategory === cat ? '#FEF08A' : '#D97706'} />
                    <span suppressHydrationWarning>Hits Target ({mounted ? rebalance.adjustedDinnerTarget : 35}g)</span>
                  </>
                ) : (
                  <span>{cat}</span>
                )}
              </button>
            ))}
          </div>

          {/* Recipe Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.slice(0, 18).map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => {
                  retroAudio.playBlip();
                  setSelectedRecipeDetail(recipe);
                }}
                className="bg-[#FFFDF9] border-2 border-[#1A3629] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#1A3629] hover:shadow-[5px_5px_0px_#1A3629] hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between gap-3.5 group h-full"
              >
                <div className="flex flex-col gap-3">
                  <div className="relative w-full h-52 sm:h-60 rounded-xl overflow-hidden bg-gradient-to-b from-[#FAF8F5] to-[#F5EFE4] border border-[#1A3629]/15 flex items-center justify-center shrink-0">
                    {recipe.image ? (
                      <Image
                        src={recipe.image}
                        alt={recipe.name}
                        fill
                        className="object-contain p-3 group-hover:scale-105 transition-transform duration-300 [image-rendering:pixelated] drop-shadow-md"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <PixelMealPlate mealName={recipe.name} size={72} className="opacity-70" />
                    )}

                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-[#1A3629] text-[#FFFDF9] font-mono text-[11px] font-bold shadow-xs">
                      +{recipe.protein}g Protein
                    </div>
                  </div>

                  <div>
                    <h3 className="font-cabinet font-bold text-base sm:text-lg text-[#1A3629] leading-snug line-clamp-1 h-6">
                      {recipe.name}
                    </h3>
                    <p className="font-sans text-xs text-[#4A5D4E] mt-0.5 line-clamp-2 h-8 leading-4">
                      {recipe.subtitle || recipe.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2.5 border-t border-[#1A3629]/10">
                  <div className="flex items-center justify-between font-mono text-xs text-[#4A5D4E] h-5">
                    <span className="flex items-center gap-1.5">
                      <PixelFlame size={12} color="#EA580C" />
                      {recipe.calories} kcal
                    </span>
                    <span className="flex items-center gap-1.5">
                      <PixelClock size={12} color="#4A5D4E" />
                      {recipe.prepTimeMinutes}m prep
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleCookFromCatalog(recipe, e)}
                    className="w-full h-10 px-3 rounded-xl bg-[#1A3629] hover:bg-[#2C4A3B] text-[#FFFDF9] font-cabinet font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[2px_2px_0px_#2C5E43] active:translate-y-0.5 cursor-pointer"
                  >
                    <PixelChefHat size={14} color="#FFFDF9" />
                    <span>Cook &amp; Log (+{recipe.protein}g)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Recipe Detail Modal */}
      {selectedRecipeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-[#FFFDF9] border-2 border-[#1A3629] rounded-3xl p-6 shadow-[8px_8px_0px_#1A3629] flex flex-col gap-5">
            <div className="flex items-start justify-between gap-3 border-b border-[#1A3629]/15 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  {selectedRecipeDetail.category} · {selectedRecipeDetail.dietType}
                </span>
                <h3 className="font-cabinet font-extrabold text-xl text-[#1A3629] mt-0.5">
                  {selectedRecipeDetail.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecipeDetail(null)}
                className="p-2 rounded-xl border border-[#1A3629]/20 hover:bg-[#1A3629]/5 text-[#1A3629] cursor-pointer"
                aria-label="Close recipe details"
              >
                <PixelX size={14} color="#1A3629" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 font-mono text-center">
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#1A3629]/15">
                <span className="text-[10px] text-[#4A5D4E] uppercase block">Protein</span>
                <span className="font-bold text-sm text-emerald-700">{selectedRecipeDetail.protein}g</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#1A3629]/15">
                <span className="text-[10px] text-[#4A5D4E] uppercase block">Calories</span>
                <span className="font-bold text-sm text-[#1A3629]">{selectedRecipeDetail.calories}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#1A3629]/15">
                <span className="text-[10px] text-[#4A5D4E] uppercase block">Carbs</span>
                <span className="font-bold text-sm text-[#1A3629]">{selectedRecipeDetail.carbs}g</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#1A3629]/15">
                <span className="text-[10px] text-[#4A5D4E] uppercase block">Fats</span>
                <span className="font-bold text-sm text-[#1A3629]">{selectedRecipeDetail.fats}g</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="font-cabinet font-bold text-sm text-[#1A3629]">
                Ingredients ({selectedRecipeDetail.ingredients.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {selectedRecipeDetail.ingredients.map((ing, i) => (
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

            {selectedRecipeDetail.instructions && selectedRecipeDetail.instructions.length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="font-cabinet font-bold text-sm text-[#1A3629]">
                  Preparation Steps ({selectedRecipeDetail.instructions.length})
                </h4>
                <div className="flex flex-col gap-2">
                  {selectedRecipeDetail.instructions.map((step, idx) => (
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

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  handleCookFromCatalog(selectedRecipeDetail, e);
                  setSelectedRecipeDetail(null);
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#1A3629] hover:bg-[#2C4A3B] text-[#FFFDF9] font-cabinet font-bold text-xs flex items-center justify-center gap-2 shadow-[2px_2px_0px_#2C5E43] cursor-pointer"
              >
                <PixelChefHat size={16} color="#FFFDF9" />
                <span>Cook &amp; Log to Daily Ledger (+{selectedRecipeDetail.protein}g)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRecipeDetail(null)}
                className="py-3 px-5 rounded-2xl border border-[#1A3629]/20 text-[#1A3629] font-cabinet font-bold text-xs hover:bg-[#1A3629]/5 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Meal Scanner Modal */}
      <PhotoMealScannerModal
        isOpen={isPhotoScannerOpen}
        onClose={() => setIsPhotoScannerOpen(false)}
      />
    </div>
  );
}
