'use client';

import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { RECIPES, Recipe } from '@/lib/recipes';
import { PixelSteam } from '@/components/landing/PixelSteam';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';

const CATEGORIES = ['All', 'High Protein', 'Steady Carbs', 'Quick Fuel', 'Keto Clean', 'Post Workout'] as const;
const PORTION_MULTIPLIERS = [0.5, 1.0, 1.5, 2.0] as const;

const DIET_FILTERS = [
  { id: 'All', label: 'All Diets' },
  { id: 'Vegetarian', label: 'Vegetarian' },
  { id: 'Vegan', label: 'Vegan' },
  { id: 'Pescatarian', label: 'Pescatarian' },
  { id: 'Omnivore', label: 'Omnivore' },
] as const;

const SORT_OPTIONS: { id: 'protein' | 'calories' | 'time'; label: string }[] = [
  { id: 'protein', label: 'Highest Protein' },
  { id: 'calories', label: 'Lowest Calories' },
  { id: 'time', label: 'Quickest Prep' },
];

function RecipesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inspectParam = searchParams.get('inspect') || searchParams.get('recipe');

  const { logRecipeToDay, getDailyLog, userSession, setPendingAction, userProfile } = useHabitStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDietFilter, setSelectedDietFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'protein' | 'calories' | 'time'>('protein');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1.0);
  const [loggedToast, setLoggedToast] = useState<{ name: string; protein: number; portion: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const todayKey = new Date().toISOString().split('T')[0];
  const todayLog = getDailyLog(todayKey);

  // Auto open recipe modal if URL param is present
  useEffect(() => {
    if (inspectParam) {
      const match = RECIPES.find((r) => r.id === inspectParam);
      if (match) {
        setSelectedRecipe(match);
        setPortionMultiplier(1.0);
      }
    }
  }, [inspectParam]);

  // Keyboard shortcut to focus search with '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setSelectedRecipe(null);
        setIsSortOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter and sort recipes
  const filteredRecipes = useMemo(() => {
    return RECIPES.filter((r) => {
      const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
      const matchesDiet =
        selectedDietFilter === 'All' ||
        (selectedDietFilter === 'Vegetarian' && (r.dietType === 'vegetarian' || r.dietType === 'vegan')) ||
        (selectedDietFilter === 'Vegan' && r.dietType === 'vegan') ||
        (selectedDietFilter === 'Pescatarian' && (r.dietType === 'pescatarian' || r.dietType === 'vegetarian' || r.dietType === 'vegan')) ||
        (selectedDietFilter === 'Omnivore' && true);

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        r.name.toLowerCase().includes(query) ||
        r.subtitle.toLowerCase().includes(query) ||
        r.category.toLowerCase().includes(query) ||
        r.ingredients.some((ing) => ing.item.toLowerCase().includes(query));

      return matchesCategory && matchesDiet && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'protein') return b.protein - a.protein;
      if (sortBy === 'calories') return a.calories - b.calories;
      if (sortBy === 'time') return a.prepTimeMinutes - b.prepTimeMinutes;
      return 0;
    });
  }, [selectedCategory, selectedDietFilter, searchQuery, sortBy]);

  const openRecipeModal = (recipe: Recipe) => {
    retroAudio.playBlip();
    setSelectedRecipe(recipe);
    setPortionMultiplier(1.0);
  };

  const handleQuickLog = (recipe: Recipe, multiplier: number = 1.0, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    retroAudio.playInspectConfirm();

    if (!userSession && (!userProfile || !userProfile.onboardingCompleted)) {
      setPendingAction({
        type: 'LOG_RECIPE',
        payload: {
          recipeId: recipe.id,
          protein: Math.round(recipe.protein * multiplier),
          calories: Math.round(recipe.calories * multiplier),
        },
        returnUrl: `/recipes?inspect=${encodeURIComponent(recipe.id)}`,
      });
      router.push(`/auth?redirect=${encodeURIComponent(`/recipes?inspect=${recipe.id}`)}`);
      return;
    }

    const scaledProtein = Math.round(recipe.protein * multiplier);
    const scaledCalories = Math.round(recipe.calories * multiplier);
    logRecipeToDay(recipe.id, scaledProtein, scaledCalories);

    setLoggedToast({
      name: recipe.name,
      protein: scaledProtein,
      portion: multiplier,
    });

    setTimeout(() => {
      setLoggedToast(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1A3629] transition-colors duration-300 flex flex-col">
      {/* Navigation Header */}
      <HeaderNav />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 lg:px-12 pt-28 pb-20">
        
        {/* Header Title Section */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 mb-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-cabinet font-bold px-4 py-1.5 rounded-full border-2 bg-[#1A3629] border-[#1A3629] text-[#FFFDF9] shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            >
              <span>← Back to Home</span>
            </Link>
            <span className="px-3 py-1 rounded-full border-2 text-[10px] font-mono font-bold uppercase tracking-widest bg-[#FFFDF9] border-[#1A3629] text-[#1A3629]">
              16-Bit Fuel Catalog
            </span>
          </div>

          <h1 className="font-fraunces font-black text-3xl sm:text-5xl tracking-tight text-[#1A3629]">
            Whole-Food Fuel Recipes
          </h1>
          <p className="text-base sm:text-lg font-cabinet font-medium mt-3 max-w-2xl leading-relaxed text-[#2C4A3B]">
            Hearty whole foods illustrated in clean retro pixel art. Simple to make, packed with clean protein, and ready to log in one tap.
          </p>
        </div>

        {/* Control Row: Categories + Search + Sort */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Category Filter Pills */}
            <div className="overflow-x-auto pb-1 scrollbar-none">
              <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl border-2 bg-[#FFFDF9] border-[#1A3629]">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        retroAudio.playBlip();
                        setSelectedCategory(cat);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1A3629] text-[#FFFDF9] shadow-[2px_2px_0px_#3A6B52]'
                          : 'text-[#2C4A3B] hover:text-[#1A3629]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Bar & Custom Sort Dropdown */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search recipes..."
                  className="w-full px-4 py-2.5 rounded-xl border-2 text-xs font-cabinet font-bold focus:outline-none transition-all bg-[#FFFDF9] border-[#1A3629] text-[#1A3629] placeholder-[#2C4A3B]/60 shadow-[2px_2px_0px_#1A3629]"
                />
                {!searchQuery && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold border border-[#1A3629]/40 text-[#1A3629] px-1.5 py-0.5 rounded pointer-events-none">
                    /
                  </span>
                )}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold opacity-70 hover:opacity-100 cursor-pointer"
                  >
                    [x]
                  </button>
                )}
              </div>

              {/* Custom Retro Sort Dropdown */}
              <div className="relative" ref={sortDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="px-4 py-2.5 rounded-xl border-2 font-cabinet font-bold text-xs flex items-center gap-2 cursor-pointer bg-[#FFFDF9] border-[#1A3629] text-[#1A3629] shadow-[2px_2px_0px_#1A3629] hover:bg-[#F4F0EA]"
                >
                  <span>{SORT_OPTIONS.find((o) => o.id === sortBy)?.label}</span>
                  <span className="text-[10px] font-mono font-bold">↓</span>
                </button>

                {isSortOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border-2 shadow-2xl z-30 p-1.5 font-cabinet font-bold text-xs bg-[#FFFDF9] border-[#1A3629]">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          retroAudio.playBlip();
                          setSortBy(opt.id);
                          setIsSortOpen(false);
                        }}
                        className={`w-full px-3 py-2 rounded-lg text-left flex items-center justify-between cursor-pointer ${
                          sortBy === opt.id
                            ? 'bg-[#1A3629] text-[#FFFDF9]'
                            : 'text-[#1A3629] hover:bg-black/5'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {sortBy === opt.id && <span className="font-mono text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Secondary Sub-Filter Row: Diet Types */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1A3629] opacity-80 shrink-0">
              Diet Filter:
            </span>
            <div className="inline-flex items-center gap-1.5 p-1 rounded-xl border-2 bg-[#FFFDF9] border-[#1A3629]/30">
              {DIET_FILTERS.map((d) => {
                const isSelected = selectedDietFilter === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      retroAudio.playBlip();
                      setSelectedDietFilter(d.id);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1A3629] text-[#FFFDF9] shadow-[2px_2px_0px_#3A6B52]'
                        : 'text-[#2C4A3B] hover:text-[#1A3629]'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recipe Cards Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-20 border-3 border-[#1A3629] bg-[#FFFDF9] rounded-2xl p-8">
            <h3 className="font-fraunces font-bold text-xl">No matching recipes</h3>
            <p className="text-sm font-cabinet font-medium mt-1 opacity-80">Try clearing your search query or adjusting your filter.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedDietFilter('All');
              }}
              className="mt-4 px-5 py-2.5 rounded-xl border-2 bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] font-cabinet font-bold text-xs cursor-pointer transition-all"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => {
              const isLogged = mounted && todayLog.loggedRecipeIds.includes(recipe.id);

              return (
                <div
                  key={recipe.id}
                  onClick={() => openRecipeModal(recipe)}
                  className="group cursor-pointer border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[5px_5px_0px_#1A3629] rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex flex-col justify-between"
                >
                  {/* Card Body */}
                  <div>
                    {/* Header Badges & Focus Score */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-mono font-bold tracking-wider border-2 border-[#1A3629] bg-[#F4F0EA] text-[#1A3629] px-2.5 py-0.5 rounded-full uppercase">
                        {recipe.category}
                      </span>
                      
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#1A3629]">
                        <span>Focus {recipe.focusScore}</span>
                      </span>
                    </div>

                    {/* Standardized Continuous Plate Presentation */}
                    <div className="w-full flex items-center justify-center py-2 mb-4">
                      <div className="w-48 h-48 sm:w-52 sm:h-52 relative flex items-center justify-center">
                        <img
                          src={recipe.image}
                          alt={recipe.name}
                          className="w-full h-full object-contain [image-rendering:pixelated] drop-shadow-[10px_10px_0px_rgba(26,54,41,0.14)] group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>

                    {/* Title & Subtitle in Cabinet Grotesk */}
                    <h3 className="font-cabinet font-bold text-xl tracking-tight leading-snug mb-1 text-[#1A3629]">
                      {recipe.name}
                    </h3>
                    <p className="text-xs font-cabinet font-medium leading-relaxed line-clamp-2 mb-6 text-[#2C4A3B]">
                      {recipe.subtitle}
                    </p>
                  </div>

                  {/* Card Footer & Macro Tag */}
                  <div>
                    {/* Monospace Macro Summary Tag */}
                    <div className="flex items-center justify-center mb-3">
                      <span className="w-full text-center text-xs font-mono font-bold py-2 rounded-xl border-2 tracking-wider tabular-nums bg-[#F4F0EA] border-[#1A3629]/20 text-[#1A3629]">
                        [{recipe.protein}G PRO · {recipe.calories} KCAL · {recipe.prepTimeMinutes}M]
                      </span>
                    </div>

                    {/* Log Button */}
                    <button
                      type="button"
                      onClick={(e) => handleQuickLog(recipe, 1.0, e)}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-cabinet font-bold flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                        isLogged
                          ? 'bg-[#E8DECF] text-[#1A3629] border-[#1A3629]'
                          : 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-[3px_3px_0px_#3A6B52] hover:-translate-y-0.5'
                      }`}
                    >
                      {isLogged ? (
                        <span>✓ Logged to Today</span>
                      ) : (
                        <span>+ Log to Today</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Toast Notification when logged */}
      {loggedToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="px-5 py-3.5 rounded-xl border-3 border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] font-cabinet font-bold text-xs shadow-2xl flex items-center gap-3">
            <span className="font-mono font-bold">✓</span>
            <span>
              Added <strong>{loggedToast.name}</strong> ({loggedToast.portion}x portion · +{loggedToast.protein}g PRO) to today&apos;s log!
            </span>
          </div>
        </div>
      )}

      {/* Retro Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedRecipe(null)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-4 border-[#1A3629] bg-[#FFFDF9] p-6 sm:p-8 shadow-2xl flex flex-col gap-6 scrollbar-none">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedRecipe(null)}
              className="absolute right-6 top-6 rounded-full px-3 py-1 border-2 border-[#1A3629] bg-[#F4F0EA] text-[#1A3629] font-mono font-bold text-xs transition-all cursor-pointer hover:bg-[#1A3629] hover:text-[#FFFDF9]"
              aria-label="Close details"
            >
              [ESC]
            </button>

            {/* Pixel Art Image Anchor with Dynamic Portion Calibration */}
            <div className="w-full flex flex-col items-center justify-center pt-2 pb-1">
              <div className="w-48 h-48 sm:w-56 sm:h-56 relative flex items-center justify-center transition-all duration-300">
                <PixelSteam active={true} intensity={1.3} />
                <img
                  key={`${selectedRecipe.id}-${portionMultiplier}`}
                  src={
                    selectedRecipe.portionImages?.[portionMultiplier as 0.5 | 1.0 | 1.5 | 2.0] ||
                    selectedRecipe.image
                  }
                  alt={`${selectedRecipe.name} (${portionMultiplier}x portion)`}
                  style={{
                    viewTransitionName: 'active-dish-plate',
                    transform: !selectedRecipe.portionImages?.[portionMultiplier as 0.5 | 1.0 | 1.5 | 2.0]
                      ? portionMultiplier === 0.5
                        ? 'scale(0.86)'
                        : portionMultiplier === 1.5
                        ? 'scale(1.10)'
                        : portionMultiplier === 2.0
                        ? 'scale(1.22)'
                        : 'scale(1)'
                      : 'scale(1)',
                  }}
                  className="w-full h-full object-contain [image-rendering:pixelated] drop-shadow-[15px_15px_0px_rgba(26,54,41,0.18)] transition-transform duration-300 ease-out z-10"
                />
              </div>
              <div className="mt-2 text-[10px] font-mono font-bold px-3 py-1 rounded-full border-2 border-[#1A3629]/30 bg-[#F4F0EA] text-[#1A3629] tracking-wider uppercase">
                {portionMultiplier === 0.5
                  ? '0.5x · Light Snack Serving'
                  : portionMultiplier === 1.0
                  ? '1.0x · Standard Calibration'
                  : portionMultiplier === 1.5
                  ? '1.5x · Hearty Training Portion'
                  : '2.0x · Double Protein Feast'}
              </div>
            </div>

            {/* Modal Title & Meta in Fraunces / Cabinet Grotesk */}
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase font-bold mb-2">
                <span className="border-2 border-[#1A3629] bg-[#F4F0EA] text-[#1A3629] px-2.5 py-0.5 rounded-md text-[10px] tracking-widest">
                  {selectedRecipe.category}
                </span>
                <span>·</span>
                <span>{selectedRecipe.prepTimeMinutes} mins prep</span>
                <span>·</span>
                <span>Focus {selectedRecipe.focusScore}</span>
              </div>
              <h2 className="font-fraunces font-black text-2xl sm:text-3xl tracking-tight leading-tight text-[#1A3629]">
                {selectedRecipe.name}
              </h2>
              <p className="text-sm font-cabinet font-medium mt-1 leading-relaxed text-[#2C4A3B]">
                {selectedRecipe.subtitle}
              </p>
            </div>

            {/* Portion Controller */}
            <div className="p-4 rounded-xl border-2 border-[#1A3629]/20 bg-[#F4F0EA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase block mb-0.5">
                  Portion Size
                </span>
                <span className="text-xs font-cabinet font-medium">Adjust nutrient amount for this meal</span>
              </div>

              <div className="inline-flex items-center gap-1.5 p-1 rounded-xl border-2 border-[#1A3629] bg-[#FFFDF9]">
                {PORTION_MULTIPLIERS.map((multiplier) => {
                  const isSelected = portionMultiplier === multiplier;
                  return (
                    <button
                      key={multiplier}
                      type="button"
                      onClick={() => {
                        retroAudio.playBlip();
                        setPortionMultiplier(multiplier);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1A3629] text-[#FFFDF9]'
                          : 'text-[#2C4A3B]'
                      }`}
                    >
                      {multiplier}x
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scaled Macro Breakdown Card */}
            <div className="grid grid-cols-4 gap-2.5 text-center">
              <div className="p-3.5 rounded-xl border-2 border-[#1A3629]/20 bg-[#F4F0EA]">
                <span className="text-[10px] font-mono font-bold block mb-1">PROTEIN</span>
                <span className="font-mono text-base sm:text-lg font-bold tabular-nums">
                  {Math.round(selectedRecipe.protein * portionMultiplier)}g
                </span>
              </div>
              <div className="p-3.5 rounded-xl border-2 border-[#1A3629]/20 bg-[#F4F0EA]">
                <span className="text-[10px] font-mono font-bold block mb-1">CALORIES</span>
                <span className="font-mono text-base sm:text-lg font-bold tabular-nums">
                  {Math.round(selectedRecipe.calories * portionMultiplier)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border-2 border-[#1A3629]/20 bg-[#F4F0EA]">
                <span className="text-[10px] font-mono font-bold block mb-1">CARBS</span>
                <span className="font-mono text-base sm:text-lg font-bold tabular-nums">
                  {Math.round(selectedRecipe.carbs * portionMultiplier)}g
                </span>
              </div>
              <div className="p-3.5 rounded-xl border-2 border-[#1A3629]/20 bg-[#F4F0EA]">
                <span className="text-[10px] font-mono font-bold block mb-1">FATS</span>
                <span className="font-mono text-base sm:text-lg font-bold tabular-nums">
                  {Math.round(selectedRecipe.fats * portionMultiplier)}g
                </span>
              </div>
            </div>

            {/* Ingredients & Method Sections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Ingredients */}
              <div className="space-y-3">
                <h4 className="font-cabinet font-bold text-sm tracking-tight text-[#1A3629]">
                  Ingredients
                </h4>
                <ul className="space-y-2">
                  {selectedRecipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start justify-between gap-2 text-xs border-b border-[#1A3629]/15 pb-1.5 font-cabinet font-medium">
                      <span>{ing.item}</span>
                      <span className="font-mono font-bold shrink-0">{ing.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <h4 className="font-cabinet font-bold text-sm tracking-tight text-[#1A3629]">
                  Instructions
                </h4>
                <ol className="space-y-2.5">
                  {selectedRecipe.instructions.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs leading-relaxed font-cabinet font-medium">
                      <span className="font-mono text-[11px] font-bold shrink-0 mt-0.5">
                        {String(i + 1).padStart(2, '0')}.
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Prominent Action Button */}
            <div className="sticky bottom-0 pt-4">
              <button
                type="button"
                onClick={() => {
                  handleQuickLog(selectedRecipe, portionMultiplier);
                  setSelectedRecipe(null);
                }}
                className="w-full py-4 px-6 rounded-xl border-3 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-sm transition-all shadow-[4px_4px_0px_#3A6B52] hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  + Log Meal to Today (+{Math.round(selectedRecipe.protein * portionMultiplier)}g PRO · {portionMultiplier}x)
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function RecipesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F0EA] flex items-center justify-center text-[#1A3629] font-mono text-xs">
          Loading recipes catalog...
        </div>
      }
    >
      <RecipesContent />
    </Suspense>
  );
}
