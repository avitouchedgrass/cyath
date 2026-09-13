'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useHabitStore, LoggedMealEntry } from '@/store/useHabitStore';
import { RECIPES, Recipe } from '@/lib/recipes';
import { CustomRecipeModal } from '@/components/recipes/CustomRecipeModal';
import { retroAudio } from '@/lib/retroAudio';
import {
  Utensils,
  Plus,
  Check,
  Camera,
  Trash2,
  Droplet,
  Search,
  Award,
  Sparkles,
  Loader2,
  BookmarkPlus,
  AlertCircle,
} from 'lucide-react';

interface MissingPortionItem {
  name: string;
  prompt: string;
  suggestedOptions: string[];
}

export function FuelTab() {
  const {
    currentDate,
    getDailyLog,
    userProfile,
    setHydration,
    logRecipeToDay,
    removeRecipeFromDay,
    logMealToDay,
    removeMealFromDay,
    markMealSavedAsRecipe,
    customRecipes,
    addCustomRecipe,
  } = useHabitStore();

  const currentLog = getDailyLog(currentDate);

  const targetProtein = userProfile?.weightKg ? Math.round(userProfile.weightKg * 2.0) : 140;
  const targetHydration = userProfile?.weightKg ? Number((userProfile.weightKg * 0.04).toFixed(1)) : 2.5;

  const currentProtein = currentLog.totalProteinLogged || 0;
  const currentHydration = currentLog.hydrationLiters || 0;

  const proteinPct = Math.min(100, Math.round((currentProtein / targetProtein) * 100));
  const hydrationPct = Math.min(100, Math.round((currentHydration / targetHydration) * 100));

  const [mealText, setMealText] = useState('');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [missingItems, setMissingItems] = useState<MissingPortionItem[] | null>(null);
  const [clarifications, setClarifications] = useState<Record<string, string>>({});
  const [searchFilter, setSearchFilter] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Permanent recipe conversion modal state
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [initialRecipeToSave, setInitialRecipeToSave] = useState<Recipe | null>(null);
  const [savingMealId, setSavingMealId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleAiParseAndLog = async (overrideClarifications?: Record<string, string>) => {
    if (!mealText.trim()) return;
    setIsAiAnalyzing(true);
    const activeClarifications = overrideClarifications || clarifications;

    try {
      const res = await fetch('/api/ai/parse-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: mealText.trim(),
          clarifications: activeClarifications,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to analyze meal');
      }

      const data = await res.json();

      if (!data.hasCompletePortions) {
        // Serving sizes are missing for some ingredients!
        setMissingItems(data.missingItems || []);
        retroAudio.playBlip();
      } else {
        // Serving sizes are complete for everything!
        // Directly log to daily log WITHOUT creating a permanent recipe
        logMealToDay({
          name: data.mealName || mealText.trim(),
          protein: Number(data.protein) || 25,
          calories: Number(data.calories) || 350,
          carbs: Number(data.carbs) || 30,
          fats: Number(data.fats) || 12,
          dietType: data.dietType || 'omnivore',
          isVegetarian: !!data.isVegetarian,
          ingredients: data.ingredients || [{ item: mealText.trim(), amount: '1 serving' }],
          suggestedSprite: data.suggestedSprite || '/assets/food/generic-plate.webp',
        }, currentDate);

        retroAudio.playInspectConfirm();

        const dietBadge = data.dietType ? data.dietType.charAt(0).toUpperCase() + data.dietType.slice(1) : 'Logged';
        setFeedback(`✓ Logged "${data.mealName}" (+${data.protein}g Protein · ${dietBadge} · +20 XP)`);
        setMealText('');
        setMissingItems(null);
        setClarifications({});

        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err) {
      console.warn('AI meal parse fallback error:', err);
      // Fallback: log a simple baseline entry
      const fallbackName = mealText.trim();
      logMealToDay({
        name: fallbackName,
        protein: 30,
        calories: 450,
        ingredients: [{ item: fallbackName, amount: '1 serving' }],
        suggestedSprite: '/assets/food/generic-plate.webp',
      }, currentDate);

      retroAudio.playInspectConfirm();
      setFeedback(`✓ Logged "${fallbackName}" (+30g Protein)`);
      setMealText('');
      setMissingItems(null);
      setClarifications({});
      setTimeout(() => setFeedback(null), 3500);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleClarificationSelect = (itemName: string, portionOption: string) => {
    retroAudio.playBlip();
    const updated = { ...clarifications, [itemName]: portionOption };
    setClarifications(updated);

    // If all missing items have been answered, auto-confirm
    if (missingItems && missingItems.every((item) => updated[item.name])) {
      handleAiParseAndLog(updated);
    }
  };

  const handleAddWater = (liters: number) => {
    retroAudio.playBlip();
    const newTotal = Number((currentHydration + liters).toFixed(2));
    setHydration(newTotal, currentDate);
  };

  const handleLogCatalogRecipe = (recipe: Recipe) => {
    retroAudio.playInspectConfirm();
    logRecipeToDay(recipe.id, recipe.protein, recipe.calories, currentDate);
    setFeedback(`Prepared "${recipe.name}" (+${recipe.protein}g Protein · +25 XP Bonus)`);
    setTimeout(() => setFeedback(null), 3500);
  };

  // Open CustomRecipeModal prefilled with the AI-parsed meal data
  const handleOpenSaveAsRecipe = (meal: LoggedMealEntry) => {
    retroAudio.playBlip();
    setSavingMealId(meal.id);

    const initialRecipe: Recipe = {
      id: `custom-${Date.now()}`,
      name: meal.name,
      subtitle: `${meal.protein}g Protein · Whole Food Creation`,
      image: meal.suggestedSprite || '/assets/food/grilled-chicken-1.0.png',
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs || Math.round(meal.calories * 0.08),
      fats: meal.fats || Math.round(meal.calories * 0.04),
      prepTimeMinutes: 20,
      category: (meal.protein >= 30 ? 'High Protein' : 'Steady Carbs') as Recipe['category'],
      dietType: (meal.dietType || (meal.isVegetarian ? 'vegetarian' : 'omnivore')) as Recipe['dietType'],
      tags: ['Custom Recipe', meal.isVegetarian ? 'Vegetarian' : 'High Protein'],
      focusScore: '9.2/10',
      description: `Custom whole-food dish with ${meal.protein}g protein.`,
      ingredients: meal.ingredients && meal.ingredients.length > 0
        ? meal.ingredients
        : [{ item: meal.name, amount: '1 serving' }],
      instructions: ['Cook and assemble whole-food ingredients carefully.', 'Serve warm and enjoy.'],
      isCustom: true,
    };

    setInitialRecipeToSave(initialRecipe);
    setIsRecipeModalOpen(true);
  };

  const handleSaveRecipeConfirm = (savedRecipe: Recipe) => {
    addCustomRecipe(savedRecipe);
    if (savingMealId) {
      markMealSavedAsRecipe(savingMealId, currentDate);
    }
    setIsRecipeModalOpen(false);
    setSavingMealId(null);
    setInitialRecipeToSave(null);
    setFeedback(`Saved "${savedRecipe.name}" to your permanent recipes!`);
    setTimeout(() => setFeedback(null), 3500);
  };

  // Combined list of today's logged meals (direct AI logs + recipe logs)
  const allLoggedMeals = useMemo(() => {
    const directMeals = currentLog.loggedMeals || [];
    const recipeMap = new Map<string, Recipe>();
    [...customRecipes, ...RECIPES].forEach((r) => recipeMap.set(r.id, r));

    // Count how many times each recipeId is already represented in directMeals
    const directRecipeCounts = new Map<string, number>();
    directMeals.forEach((m) => {
      if (m.recipeId) {
        directRecipeCounts.set(m.recipeId, (directRecipeCounts.get(m.recipeId) || 0) + 1);
      }
    });

    const syntheticMeals: LoggedMealEntry[] = [];
    const synthesizedCounts = new Map<string, number>();

    currentLog.loggedRecipeIds.forEach((id, index) => {
      const alreadyInDirect = directRecipeCounts.get(id) || 0;
      const alreadySynthesized = synthesizedCounts.get(id) || 0;
      const totalAccountedFor = alreadyInDirect + alreadySynthesized;
      const totalNeeded = currentLog.loggedRecipeIds.filter((rid) => rid === id).length;

      if (totalAccountedFor < totalNeeded) {
        synthesizedCounts.set(id, alreadySynthesized + 1);
        const recipe = recipeMap.get(id);
        syntheticMeals.push({
          id: `legacy_${id}_${index}`,
          name: recipe?.name || 'Logged Dish',
          protein: recipe?.protein || 25,
          calories: recipe?.calories || 350,
          carbs: recipe?.carbs,
          fats: recipe?.fats,
          dietType: recipe?.dietType,
          isVegetarian: recipe?.dietType === 'vegetarian' || recipe?.dietType === 'vegan',
          ingredients: recipe?.ingredients || [{ item: recipe?.name || 'Whole food portion', amount: '1 serving' }],
          suggestedSprite: recipe?.image || '/assets/food/generic-plate.webp',
          loggedAt: new Date().toISOString(),
          recipeId: id,
          savedAsRecipe: true,
        });
      }
    });

    return [...directMeals, ...syntheticMeals];
  }, [currentLog.loggedMeals, currentLog.loggedRecipeIds, customRecipes]);

  const allAvailableRecipes = useMemo(() => {
    const combined = [...customRecipes, ...RECIPES];
    return combined.filter((r) => {
      const matchesSearch = r.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        r.tags.some((t) => t.toLowerCase().includes(searchFilter.toLowerCase()));
      return matchesSearch;
    });
  }, [customRecipes, searchFilter]);

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-200">
      
      {/* 1. Smart AI Natural Language Meal Input Card */}
      <div className="w-full rounded-3xl border border-[#1A3629]/10 bg-[#FFFDF9] p-5 sm:p-6 shadow-[0_2px_12px_rgba(26,54,41,0.03)] hover:border-[#1A3629]/20 transition-all flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1A3629]/8">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-cabinet font-extrabold text-lg sm:text-xl text-[#1A3629] tracking-tight">
                AI Nutrition Logger
              </h2>
            </div>
            <p className="font-sans text-xs text-[#4A5D4E] mt-0.5">
              Enter your meal naturally. AI checks ingredient serving sizes and calculates your exact macros.
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-ai-coach'))}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#1A3629]/12 bg-[#FAF8F5] text-[#1A3629] font-cabinet text-xs font-bold hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-all cursor-pointer self-start sm:self-auto shadow-2xs"
            title="Scan meal photo with AI Coach"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>AI Photo Scan</span>
          </button>
        </div>

        {/* Natural Language Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAiParseAndLog();
          }}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center gap-2 bg-[#FAF8F5] rounded-2xl p-2 border border-[#1A3629]/12 focus-within:border-[#1A3629]/30 transition-all">
            <Utensils className="w-4 h-4 text-[#1A3629]/50 ml-2 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={mealText}
              onChange={(e) => {
                setMealText(e.target.value);
                if (missingItems) {
                  setMissingItems(null);
                  setClarifications({});
                }
              }}
              placeholder="e.g. 200g chicken breast with 1 cup jasmine rice and steamed broccoli"
              className="flex-1 bg-transparent text-sm font-cabinet font-medium text-[#1A3629] placeholder:text-[#1A3629]/40 outline-none px-2"
              disabled={isAiAnalyzing}
            />
            <button
              type="submit"
              disabled={!mealText.trim() || isAiAnalyzing}
              className={`px-4 py-2 rounded-full font-cabinet font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                mealText.trim() && !isAiAnalyzing
                  ? 'bg-[#1A3629] text-[#FFFDF9] hover:bg-[#2C4A3B] shadow-2xs active:scale-[0.99]'
                  : 'bg-[#1A3629]/20 text-[#FFFDF9]/60 cursor-not-allowed'
              }`}
            >
              {isAiAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <span>Log Meal</span>
                  <Plus className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* AI Serving Size Clarification Card: Displays when portion is missing */}
          {missingItems && missingItems.length > 0 && (
            <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#C9A84C]/40 flex flex-col gap-3 animate-in fade-in duration-150 shadow-2xs">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#C9A84C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-cabinet font-bold text-xs sm:text-sm text-[#1A3629]">
                    Specify Serving Sizes for All Items
                  </h4>
                  <p className="font-sans text-xs text-[#4A5D4E] mt-0.5">
                    To calculate accurate protein and energy, select or type the portion for each item:
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-1">
                {missingItems.map((item) => {
                  const currentAnswer = clarifications[item.name] || '';
                  return (
                    <div key={item.name} className="p-3 rounded-xl bg-[#FFFDF9] border border-[#1A3629]/10 flex flex-col gap-2">
                      <span className="font-cabinet font-bold text-xs text-[#1A3629]">
                        {item.prompt}
                      </span>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.suggestedOptions.map((opt) => {
                          const isSelected = currentAnswer === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleClarificationSelect(item.name, opt)}
                              className={`px-3 py-1.5 rounded-full text-xs font-cabinet font-bold transition-all cursor-pointer border ${
                                isSelected
                                  ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-2xs'
                                  : 'bg-[#FAF8F5] text-[#1A3629] border-[#1A3629]/15 hover:border-[#1A3629]/40'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom input for exact custom portions */}
                      <input
                        type="text"
                        value={currentAnswer}
                        onChange={(e) => setClarifications({ ...clarifications, [item.name]: e.target.value })}
                        placeholder="Or type custom portion (e.g. 175g)"
                        className="px-3 py-1 text-xs font-cabinet bg-[#FAF8F5] border border-[#1A3629]/10 rounded-lg text-[#1A3629] outline-none"
                      />
                    </div>
                  );
                })}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMissingItems(null);
                      setClarifications({});
                    }}
                    className="px-3.5 py-1.5 rounded-full font-cabinet font-bold text-xs text-[#1A3629]/70 hover:text-[#1A3629] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAiParseAndLog()}
                    disabled={isAiAnalyzing}
                    className="px-5 py-2 rounded-full bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs hover:bg-[#2C4A3B] transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                  >
                    {isAiAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Calculate &amp; Log Meal →</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* User Feedback Notification */}
          {feedback && (
            <div className="p-3 rounded-2xl bg-[#ECFDF5] border border-[#10B981]/30 text-[#065F46] font-cabinet font-bold text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <Check className="w-4 h-4 text-[#10B981] shrink-0" />
              <span>{feedback}</span>
            </div>
          )}
        </form>
      </div>

      {/* 2. Today's Fuel Gauges (Protein & Hydration) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Protein Target Bar */}
        <div className="rounded-3xl border border-[#1A3629]/10 bg-[#FFFDF9] p-5 sm:p-6 shadow-[0_2px_12px_rgba(26,54,41,0.03)] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1A3629]" />
              <span className="font-cabinet font-bold text-sm text-[#1A3629]">Daily Protein Floor</span>
            </div>
            <span className="font-mono text-xs font-semibold text-[#1A3629] tabular-nums bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#1A3629]/10">
              {currentProtein}g / {targetProtein}g
            </span>
          </div>

          <div className="w-full h-2 bg-[#1A3629]/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1A3629] transition-all duration-500 rounded-full"
              style={{ width: `${proteinPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-sans text-[#4A5D4E] pt-0.5">
            <span>Threshold floor: {Math.round(targetProtein * 0.75)}g</span>
            <span className="font-mono font-semibold text-[#1A3629]">
              {proteinPct >= 100 ? 'Target Met ✓' : `${targetProtein - currentProtein}g remaining`}
            </span>
          </div>
        </div>

        {/* Cellular Hydration Bar */}
        <div className="rounded-3xl border border-[#1A3629]/10 bg-[#FFFDF9] p-5 sm:p-6 shadow-[0_2px_12px_rgba(26,54,41,0.03)] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplet className="w-3.5 h-3.5 text-[#1A3629]" />
              <span className="font-cabinet font-bold text-sm text-[#1A3629]">Cellular Hydration</span>
            </div>
            <span className="font-mono text-xs font-semibold text-[#1A3629] tabular-nums bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#1A3629]/10">
              {currentHydration}L / {targetHydration}L
            </span>
          </div>

          <div className="w-full h-2 bg-[#1A3629]/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1A3629] transition-all duration-500 rounded-full"
              style={{ width: `${hydrationPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <span className="text-xs font-sans text-[#4A5D4E]">Daily benchmark: {targetHydration}L</span>
            <button
              type="button"
              onClick={() => handleAddWater(0.5)}
              className="px-3.5 py-1 rounded-full border border-[#1A3629]/15 bg-[#FAF8F5] text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] font-mono text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <span>+0.5L Water</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Today's Logged Meals Ledger */}
      {allLoggedMeals.length > 0 && (
        <div className="w-full rounded-3xl border border-[#1A3629]/10 bg-[#FFFDF9] p-5 sm:p-6 shadow-[0_2px_12px_rgba(26,54,41,0.03)] flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A3629]/8">
            <div>
              <h3 className="font-cabinet font-bold text-sm sm:text-base text-[#1A3629]">
                Today&apos;s Logged Meals ({allLoggedMeals.length})
              </h3>
              <p className="font-sans text-xs text-[#4A5D4E] mt-0.5">
                Meals recorded in your daily ledger. You can save any meal as a permanent recipe.
              </p>
            </div>
            <span className="font-mono text-xs text-[#4A5D4E] font-semibold bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#1A3629]/10">
              Total: {currentProtein}g Pro · {currentLog.totalCaloriesLogged || 0} kcal
            </span>
          </div>

          <div className="flex flex-col divide-y divide-[#1A3629]/6">
            {allLoggedMeals.map((meal) => (
              <div
                key={meal.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 px-1 gap-3 hover:bg-[#FAF8F5]/60 rounded-xl transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* 16-Bit Food Sprite Thumbnail */}
                  <div className="w-11 h-11 rounded-xl border border-[#1A3629]/10 bg-[#FAF8F5] flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs">
                    <img
                      src={meal.suggestedSprite || '/assets/food/generic-plate.webp'}
                      alt={meal.name}
                      className="w-full h-full object-contain [image-rendering:pixelated]"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.endsWith('generic-plate.webp')) {
                          target.src = '/assets/food/generic-plate.webp';
                        }
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-cabinet font-bold text-sm text-[#1A3629]">
                        {meal.name}
                      </span>
                      {meal.dietType && (
                        <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                          meal.dietType === 'vegetarian' || meal.dietType === 'vegan'
                            ? 'bg-[#ECFDF5] text-[#065F46] border-[#10B981]/30'
                            : meal.dietType === 'eggetarian'
                            ? 'bg-[#FEFCE8] text-[#854D0E] border-[#EAB308]/40'
                            : 'bg-[#FAF8F5] text-[#1A3629]/70 border-[#1A3629]/15'
                        }`}>
                          {meal.dietType}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-[#4A5D4E]">
                      <span className="font-bold text-[#1A3629]">{meal.protein}g Protein</span>
                      <span>·</span>
                      <span>{meal.calories} kcal</span>
                      {meal.carbs ? (
                        <>
                          <span>·</span>
                          <span>{meal.carbs}g Carbs</span>
                        </>
                      ) : null}
                      {meal.fats ? (
                        <>
                          <span>·</span>
                          <span>{meal.fats}g Fats</span>
                        </>
                      ) : null}
                    </div>

                    {/* Decomposed Ingredients List */}
                    {meal.ingredients && meal.ingredients.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        {meal.ingredients.map((ing, idx) => (
                          <span
                            key={idx}
                            className="font-mono text-[10px] text-[#4A5D4E] bg-[#FFFDF9] px-2 py-0.5 rounded-md border border-[#1A3629]/10"
                          >
                            {ing.item}: <strong className="text-[#1A3629]">{ing.amount}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Save as Permanent Recipe Button */}
                  {!meal.savedAsRecipe ? (
                    <button
                      type="button"
                      onClick={() => handleOpenSaveAsRecipe(meal)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#1A3629]/15 bg-[#FFFDF9] hover:bg-[#1A3629] hover:text-[#FFFDF9] text-[#1A3629] font-cabinet text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      title="Save as permanent recipe in catalog"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>Save as Recipe</span>
                    </button>
                  ) : (
                    <span className="font-cabinet text-xs font-bold text-[#065F46] bg-[#ECFDF5] border border-[#10B981]/30 px-3 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>In Recipes</span>
                    </span>
                  )}

                  {/* Remove Meal Button */}
                  <button
                    type="button"
                    onClick={() => {
                      retroAudio.playBlip();
                      if (meal.recipeId) {
                        removeRecipeFromDay(meal.recipeId, meal.protein, meal.calories, currentDate);
                      } else {
                        removeMealFromDay(meal.id, currentDate);
                      }
                    }}
                    className="p-1.5 rounded-lg text-[#1A3629]/40 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Remove this meal from today"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Curated Whole-Food Recipe Catalog */}
      <div className="w-full rounded-3xl border border-[#1A3629]/10 bg-[#FFFDF9] p-5 sm:p-6 shadow-[0_2px_12px_rgba(26,54,41,0.03)] flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A3629]/8">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-cabinet font-extrabold text-lg text-[#1A3629]">
                Whole-Food Recipe Catalog
              </h3>
              <span className="font-mono text-[10px] font-semibold text-[#1A3629] bg-[#FAF8F5] border border-[#1A3629]/12 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Award className="w-3 h-3 text-[#C9A84C]" />
                <span>+25 XP Bonus</span>
              </span>
            </div>
            <p className="font-sans text-xs text-[#4A5D4E] mt-0.5">
              Science-calibrated recipes designed for sustained metabolic endurance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#1A3629]/10 rounded-full px-3 py-1.5">
              <Search className="w-3.5 h-3.5 text-[#1A3629]/40" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter dishes..."
                className="bg-transparent text-xs font-cabinet text-[#1A3629] placeholder:text-[#1A3629]/40 outline-none w-28 sm:w-36"
              />
            </div>
          </div>
        </div>

        {/* Recipe Cards Grid */}
        {allAvailableRecipes.length === 0 ? (
          <div className="rounded-2xl border border-[#1A3629]/10 bg-[#FAF8F5] p-6 text-center flex flex-col items-center justify-center gap-2">
            <Utensils className="w-6 h-6 text-[#1A3629]/30" />
            <h4 className="font-cabinet font-bold text-sm text-[#1A3629]">
              No dishes found matching &quot;{searchFilter}&quot;
            </h4>
            <p className="font-sans text-xs text-[#4A5D4E]">
              Try a different keyword or reset your filter to browse the catalog.
            </p>
            <button
              type="button"
              onClick={() => setSearchFilter('')}
              className="mt-1 px-3 py-1 rounded-full bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs hover:bg-[#2C4A3B] transition-colors cursor-pointer"
            >
              Clear Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allAvailableRecipes.slice(0, 9).map((recipe) => (
              <div
                key={recipe.id}
                className="rounded-2xl border border-[#1A3629]/10 bg-[#FAF8F5] overflow-hidden flex flex-col justify-between hover:border-[#1A3629]/25 transition-all group"
              >
                <div className="p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-cabinet font-bold text-sm text-[#1A3629] leading-tight">
                      {recipe.name}
                    </h4>
                    <span className="font-mono text-xs font-semibold text-[#1A3629] shrink-0 bg-[#FFFDF9] px-2 py-0.5 rounded-full border border-[#1A3629]/10">
                      {recipe.protein}g
                    </span>
                  </div>
                  <p className="font-sans text-xs text-[#4A5D4E] line-clamp-2 leading-relaxed">
                    {recipe.subtitle}
                  </p>
                </div>

                <div className="p-3 border-t border-[#1A3629]/8 bg-[#FFFDF9] flex items-center justify-between">
                  <span className="font-mono text-[11px] text-[#4A5D4E]">
                    {recipe.calories} kcal · {recipe.prepTimeMinutes}m
                  </span>

                  <button
                    type="button"
                    onClick={() => handleLogCatalogRecipe(recipe)}
                    className="px-3.5 py-1.5 rounded-full bg-[#1A3629] hover:bg-[#2C4A3B] text-[#FFFDF9] font-cabinet font-bold text-xs transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Log (+25 XP)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Custom Recipe Creation / Permanent Save Modal */}
      <CustomRecipeModal
        isOpen={isRecipeModalOpen}
        onClose={() => {
          setIsRecipeModalOpen(false);
          setInitialRecipeToSave(null);
          setSavingMealId(null);
        }}
        onSaveRecipe={handleSaveRecipeConfirm}
        initialRecipe={initialRecipeToSave}
      />

    </div>
  );
}
