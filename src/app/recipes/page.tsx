'use client';

import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { RECIPES, Recipe } from '@/lib/recipes';
import { PixelSteam } from '@/components/landing/PixelSteam';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { ScanRecipeModal } from '@/components/recipes/ScanRecipeModal';
import { CustomRecipeModal } from '@/components/recipes/CustomRecipeModal';
import { xpParticleEmitter } from '@/lib/particleEmitter';
import { formatLocalDate } from '@/lib/dateUtils';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SingleRecipeJsonLd } from '@/components/seo/JsonLd';

const CATEGORIES = ['All', 'Custom', 'High Protein', 'Steady Carbs', 'Quick Fuel', 'Keto Clean', 'Post Workout'] as const;
const PORTION_MULTIPLIERS = [0.5, 1.0, 1.5, 2.0] as const;

const DIET_FILTERS = [
  { id: 'All', label: 'All Diets' },
  { id: 'Vegetarian', label: 'Vegetarian' },
  { id: 'Eggetarian', label: 'Eggetarian' },
  { id: 'Vegan', label: 'Vegan' },
  { id: 'Pescatarian', label: 'Pescatarian' },
  { id: 'Omnivore', label: 'Omnivore' },
] as const;

const SORT_OPTIONS: { id: 'protein' | 'calories' | 'time'; label: string }[] = [
  { id: 'protein', label: 'Highest Protein' },
  { id: 'calories', label: 'Lowest Calories' },
  { id: 'time', label: 'Quickest Prep' },
];

function getDietBadgeDetails(dietType?: string) {
  switch (dietType?.toLowerCase()) {
    case 'vegan':
      return {
        label: 'Vegan',
        dotColor: 'bg-[#10B981]',
        pillStyle: 'bg-[#ECFDF5] text-[#065F46] border-[#10B981]/60',
      };
    case 'eggetarian':
      return {
        label: 'Eggetarian',
        dotColor: 'bg-[#EAB308]',
        pillStyle: 'bg-[#FEFCE8] text-[#854D0E] border-[#EAB308]/60',
      };
    case 'vegetarian':
      return {
        label: 'Vegetarian',
        dotColor: 'bg-[#059669]',
        pillStyle: 'bg-[#F0FDF4] text-[#166534] border-[#22C55E]/60',
      };
    case 'pescatarian':
      return {
        label: 'Pescatarian',
        dotColor: 'bg-[#2563EB]',
        pillStyle: 'bg-[#EFF6FF] text-[#1E40AF] border-[#3B82F6]/60',
      };
    case 'omnivore':
    default:
      return {
        label: 'Omnivore',
        dotColor: 'bg-[#D97706]',
        pillStyle: 'bg-[#FFFBEB] text-[#92400E] border-[#F59E0B]/60',
      };
  }
}

function RecipesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inspectParam = searchParams.get('inspect') || searchParams.get('recipe');

  const {
    logRecipeToDay,
    getDailyLog,
    userSession,
    setPendingAction,
    userProfile,
    currentDate,
    customRecipes,
    addCustomRecipe,
    deleteCustomRecipe,
  } = useHabitStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDietFilter, setSelectedDietFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'protein' | 'calories' | 'time'>('protein');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1.0);
  const [loggedToast, setLoggedToast] = useState<{ name: string; protein: number; portion: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showingRawPhoto, setShowingRawPhoto] = useState(false);

  // Modals for scanning & custom entry
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthenticated = !!userSession && !userSession.id.startsWith('guest_');
  const todayKey = formatLocalDate();
  const todayLog = getDailyLog(currentDate || todayKey);

  const allRecipes = useMemo(() => {
    if (!isAuthenticated) return RECIPES;
    return [...(customRecipes || []), ...RECIPES];
  }, [isAuthenticated, customRecipes]);

  const visibleCategories = useMemo(() => {
    if (!isAuthenticated) {
      return CATEGORIES.filter((c) => c !== 'Custom');
    }
    return CATEGORIES;
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated && selectedCategory === 'Custom') {
      setSelectedCategory('All');
    }
  }, [isAuthenticated, selectedCategory]);

  const closeRecipeModal = () => {
    retroAudio.playBlip();
    setSelectedRecipe(null);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('inspect') || params.has('recipe')) {
        params.delete('inspect');
        params.delete('recipe');
        const query = params.toString();
        window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
      }
    }
  };

  // Auto open recipe modal if URL param is present
  useEffect(() => {
    if (inspectParam) {
      const match = allRecipes.find((r) => r.id === inspectParam);
      if (match) {
        if (!isAuthenticated && match.isCustom) {
          router.push(`/auth?redirect=${encodeURIComponent(`/recipes?inspect=${inspectParam}`)}`);
          return;
        }
        setSelectedRecipe((prev) => {
          if (prev?.id === match.id) return prev;
          setPortionMultiplier(1.0);
          setShowingRawPhoto(false);
          return match;
        });
      }
    } else {
      setSelectedRecipe((prev) => (prev ? null : null));
    }
  }, [inspectParam, allRecipes, isAuthenticated, router]);

  // Keyboard shortcut to focus search with '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        closeRecipeModal();
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
    return allRecipes.filter((r) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        (selectedCategory === 'Custom' ? r.isCustom : r.category === selectedCategory);

      const matchesDiet =
        selectedDietFilter === 'All' ||
        (selectedDietFilter === 'Vegetarian' && (r.dietType === 'vegetarian' || r.dietType === 'vegan')) ||
        (selectedDietFilter === 'Eggetarian' && r.dietType === 'eggetarian') ||
        (selectedDietFilter === 'Vegan' && r.dietType === 'vegan') ||
        (selectedDietFilter === 'Pescatarian' && r.dietType === 'pescatarian') ||
        (selectedDietFilter === 'Omnivore' && r.dietType === 'omnivore');

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
  }, [allRecipes, selectedCategory, selectedDietFilter, searchQuery, sortBy]);

  const openRecipeModal = (recipe: Recipe) => {
    retroAudio.playBlip();
    setSelectedRecipe(recipe);
    setPortionMultiplier(1.0);
    setShowingRawPhoto(false);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('inspect', recipe.id);
      params.delete('recipe');
      window.history.replaceState(null, '', `?${params.toString()}`);
    }
  };

  const handleQuickLog = (recipe: Recipe, multiplier: number = 1.0, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      xpParticleEmitter.emit(e.clientX, e.clientY, 4);
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
      {selectedRecipe && <SingleRecipeJsonLd recipe={selectedRecipe} />}
      {/* Navigation Header */}
      <HeaderNav />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 lg:px-12 pt-28 pb-20">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <Breadcrumbs items={[{ label: 'Fuel Recipes' }]} />
        </div>

        {/* Header Title Section & Action Bar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-[#1A3629]/15 pb-5">
          <div>
            <h1 className="font-fraunces font-black text-3xl sm:text-4xl tracking-tight text-[#1A3629]">
              Whole-Food Recipes
            </h1>
            <p className="text-sm sm:text-base font-cabinet font-medium mt-1 leading-relaxed text-[#2C4A3B]">
              Nutrient-dense whole foods illustrated in 16-bit pixel art. One-tap macro logging.
            </p>
          </div>

          {/* Action Buttons for Custom Recipe & AI Vision Scan */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                retroAudio.playBlip();
                if (!isAuthenticated) {
                  router.push('/auth?redirect=/recipes');
                  return;
                }
                setIsScanModalOpen(true);
              }}
              className="inline-flex items-center gap-2 text-xs font-cabinet font-bold px-4 py-2 rounded-full border-2 bg-[#10B981] border-[#1A3629] text-[#FFFDF9] shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              <span>Scan Meal with AI</span>
            </button>

            <button
              type="button"
              onClick={() => {
                retroAudio.playBlip();
                if (!isAuthenticated) {
                  router.push('/auth?redirect=/recipes');
                  return;
                }
                setIsManualModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-cabinet font-bold px-4 py-2 rounded-full border-2 bg-[#FFFDF9] border-[#1A3629] text-[#1A3629] shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              <span>+ Custom Recipe</span>
            </button>
          </div>
        </div>

        {/* Distilled Discovery & Filtering Console */}
        <div className="flex flex-col gap-3.5 mb-8 p-4 sm:p-5 rounded-2xl border-3 border-[#1A3629] bg-[#FAF6EE] shadow-[4px_4px_0px_#1A3629]">
          {/* Row 1: Search Bar + Dish Counter + Sort Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes, ingredients, macros..."
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border-2 text-xs font-cabinet font-bold focus:outline-none transition-all bg-[#FFFDF9] border-[#1A3629] text-[#1A3629] placeholder-[#2C4A3B]/60 shadow-[2px_2px_0px_#1A3629]"
              />
              {!searchQuery ? (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold border border-[#1A3629]/40 text-[#1A3629] px-1.5 py-0.5 rounded pointer-events-none">
                  /
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold opacity-70 hover:opacity-100 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Counter Pill + Custom Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0 justify-between sm:justify-end">
              <div className="px-3 py-2 rounded-xl border-2 border-[#1A3629]/25 bg-[#FFFDF9] text-xs font-mono font-bold text-[#1A3629] whitespace-nowrap shadow-xs">
                {filteredRecipes.length} {filteredRecipes.length === 1 ? 'Dish' : 'Dishes'}
              </div>

              <div className="relative" ref={sortDropdownRef}>
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={isSortOpen}
                  aria-label={`Sort recipes by ${SORT_OPTIONS.find((o) => o.id === sortBy)?.label}`}
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="px-3.5 py-2 rounded-xl border-2 font-cabinet font-bold text-xs flex items-center gap-1.5 cursor-pointer bg-[#FFFDF9] border-[#1A3629] text-[#1A3629] shadow-[2px_2px_0px_#1A3629] hover:bg-[#F4EDE0]"
                >
                  <span className="text-[#4A5D4E] text-[11px]">Sort:</span>
                  <span>{SORT_OPTIONS.find((o) => o.id === sortBy)?.label}</span>
                  <span className="text-[10px] font-mono font-bold">↓</span>
                </button>

                {isSortOpen && (
                  <div 
                    role="listbox" 
                    aria-label="Sort options"
                    className="absolute right-0 mt-2 w-48 rounded-xl border-2 shadow-2xl z-30 p-1.5 font-cabinet font-bold text-xs bg-[#FFFDF9] border-[#1A3629]"
                  >
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

          {/* Row 2: Two Distinct, Dedicated Filter Rows (Diet on top, Category below) */}
          <div className="pt-3 border-t-2 border-[#1A3629]/15 flex flex-col gap-2.5">
            {/* 1. Diet Filter (Prominent & Color-coded) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1A3629] shrink-0 w-16">
                Diet:
              </span>
              <div className="flex items-center gap-1.5">
                {DIET_FILTERS.map((d) => {
                  const isSelected = selectedDietFilter === d.id;
                  const badge = getDietBadgeDetails(d.id.toLowerCase());
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        retroAudio.playBlip();
                        setSelectedDietFilter(d.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer border-2 flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-[2px_2px_0px_#3A6B52] -translate-y-0.5'
                          : 'bg-[#FFFDF9] text-[#1A3629] border-[#1A3629]/30 hover:border-[#1A3629]'
                      }`}
                    >
                      {d.id !== 'All' && (
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-[#10B981]' : badge.dotColor}`} />
                      )}
                      <span>{d.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Fuel / Macro Category (Secondary Filter) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none pt-1.5 border-t border-[#1A3629]/10">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#4A5D4E] shrink-0 w-16">
                Type:
              </span>
              <div className="flex items-center gap-1.5">
                {visibleCategories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        retroAudio.playBlip();
                        setSelectedCategory(cat);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-[1px_1px_0px_#3A6B52]'
                          : 'bg-[#FFFDF9] text-[#2C4A3B] border-[#1A3629]/20 hover:border-[#1A3629]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recipe Cards Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-20 border-3 border-[#1A3629] bg-[#FFFDF9] rounded-3xl p-8 shadow-[5px_5px_0px_#1A3629]">
            <h3 className="font-fraunces font-bold text-2xl text-[#1A3629]">No matching fuel recipes</h3>
            <p className="text-sm font-cabinet font-medium mt-2 text-[#2C4A3B]">
              No dishes match your active search and dietary filter combinations.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedDietFilter('All');
              }}
              className="mt-5 px-6 py-2.5 rounded-full border-2 bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] font-cabinet font-bold text-xs cursor-pointer shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 transition-all"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => {
              const isLogged = mounted && todayLog.loggedRecipeIds.includes(recipe.id);
              const dietBadge = getDietBadgeDetails(recipe.dietType);

              return (
                <div
                  key={recipe.id}
                  onClick={() => openRecipeModal(recipe)}
                  className="group cursor-pointer border-3 border-[#1A3629] bg-[#FFFDF9] shadow-[5px_5px_0px_#1A3629] rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex flex-col justify-between"
                >
                  {/* Card Body */}
                  <div className="flex flex-col flex-1">
                    {/* Header Badges & Focus Score */}
                    <div className="flex items-center justify-between mb-3 gap-2 min-h-[28px]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Prominent Diet Badge */}
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border-2 uppercase tracking-wider flex items-center gap-1 shrink-0 ${dietBadge.pillStyle}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dietBadge.dotColor}`} />
                          <span>{dietBadge.label}</span>
                        </span>

                        {/* Category Badge */}
                        <span
                          className={`text-[10px] font-mono font-bold tracking-wider border-2 px-2 py-0.5 rounded-md uppercase whitespace-nowrap ${
                            recipe.isCustom
                              ? 'border-[#10B981] bg-[#ECFDF5] text-[#065F46]'
                              : 'border-[#1A3629]/30 bg-[#F4F0EA] text-[#1A3629]'
                          }`}
                        >
                          {recipe.isCustom ? `Custom · ${recipe.category}` : recipe.category}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#1A3629] shrink-0 whitespace-nowrap">
                        <span>Focus {recipe.focusScore}</span>
                      </span>
                    </div>

                    {/* Standardized Continuous Plate Presentation */}
                    <div className="w-full flex items-center justify-center py-2 my-auto">
                      <div className="w-48 h-48 sm:w-52 sm:h-52 relative flex items-center justify-center">
                        <img
                          src={recipe.image}
                          alt={`${recipe.name} — ${recipe.protein}g protein whole-food plate`}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src.includes('.webp')) {
                              target.src = target.src.replace('.webp', '.png');
                            }
                          }}
                          className="w-full h-full object-contain [image-rendering:pixelated] drop-shadow-[10px_10px_0px_rgba(26,54,41,0.14)] group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>

                    {/* Title & Subtitle with fixed vertical envelope for aligned baselines */}
                    <div className="flex flex-col justify-start mb-4 min-h-[4.25rem]">
                      <h3 className="font-cabinet font-bold text-xl tracking-tight leading-snug text-[#1A3629] line-clamp-1">
                        {recipe.name}
                      </h3>
                      <p className="text-xs font-cabinet font-medium leading-relaxed line-clamp-2 mt-1 text-[#2C4A3B]">
                        {recipe.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Structured Macro Grid Strip + Action Button */}
                  <div className="mt-auto pt-2">
                    {/* 3-Column Macro Strip with Crisp Dividers */}
                    <div className="grid grid-cols-3 divide-x-2 divide-[#1A3629]/15 border-2 border-[#1A3629]/20 bg-[#F4F0EA] rounded-xl py-2 px-1 mb-3 text-center shadow-inner">
                      <div className="px-1">
                        <span className="block text-[9px] font-mono font-bold uppercase tracking-wider text-[#4A5D4E]">PROTEIN</span>
                        <span className="font-mono text-xs font-bold text-[#1A3629] tabular-nums">{recipe.protein}g</span>
                      </div>
                      <div className="px-1">
                        <span className="block text-[9px] font-mono font-bold uppercase tracking-wider text-[#4A5D4E]">CALORIES</span>
                        <span className="font-mono text-xs font-bold text-[#1A3629] tabular-nums">{recipe.calories}</span>
                      </div>
                      <div className="px-1">
                        <span className="block text-[9px] font-mono font-bold uppercase tracking-wider text-[#4A5D4E]">PREP TIME</span>
                        <span className="font-mono text-xs font-bold text-[#1A3629] tabular-nums">{recipe.prepTimeMinutes}m</span>
                      </div>
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
            onClick={closeRecipeModal}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-4 border-[#1A3629] bg-[#FFFDF9] p-6 sm:p-8 shadow-2xl flex flex-col gap-6 scrollbar-none">
            {/* Modal Header Controls */}
            <div className="absolute right-6 top-6 flex items-center gap-2 z-20">
              {selectedRecipe.isCustom && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete custom recipe "${selectedRecipe.name}"? This action cannot be undone.`)) {
                      deleteCustomRecipe(selectedRecipe.id);
                      closeRecipeModal();
                      setLoggedToast({
                        name: `${selectedRecipe.name} (Deleted)`,
                        protein: 0,
                        portion: 1.0,
                      });
                      setTimeout(() => setLoggedToast(null), 3000);
                    }
                  }}
                  className="rounded-full px-3 py-1 border-2 border-red-500 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-mono font-bold text-xs transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                  title="Delete this custom recipe"
                >
                  <span>Delete Recipe</span>
                </button>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={closeRecipeModal}
                className="rounded-full px-3 py-1 border-2 border-[#1A3629] bg-[#F4F0EA] text-[#1A3629] font-mono font-bold text-xs transition-all cursor-pointer hover:bg-[#1A3629] hover:text-[#FFFDF9]"
                aria-label="Close details"
              >
                [ESC]
              </button>
            </div>

            {/* Pixel Art Image Anchor with Dynamic Portion Calibration */}
            <div className="w-full flex flex-col items-center justify-center pt-2 pb-1">
              <div className="w-48 h-48 sm:w-56 sm:h-56 relative flex items-center justify-center transition-all duration-300">
                <PixelSteam active={true} intensity={1.3} />
                <img
                  key={`${selectedRecipe.id}-${portionMultiplier}-${showingRawPhoto}`}
                  src={
                    showingRawPhoto && selectedRecipe.rawImage
                      ? selectedRecipe.rawImage
                      : selectedRecipe.portionImages?.[portionMultiplier as 0.5 | 1.0 | 1.5 | 2.0] ||
                        selectedRecipe.image
                  }
                  alt={`${selectedRecipe.name} (${portionMultiplier}x portion)`}
                  style={{
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
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src.includes('.webp')) {
                      target.src = target.src.replace('.webp', '.png');
                    }
                  }}
                  className={`w-full h-full object-contain drop-shadow-[15px_15px_0px_rgba(26,54,41,0.18)] transition-transform duration-300 ease-out z-10 ${
                    showingRawPhoto ? 'rounded-2xl' : '[image-rendering:pixelated]'
                  }`}
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <div className="text-[10px] font-mono font-bold px-3 py-1 rounded-full border-2 border-[#1A3629]/30 bg-[#F4F0EA] text-[#1A3629] tracking-wider uppercase">
                  {portionMultiplier === 0.5
                    ? '0.5x · Light Snack Serving'
                    : portionMultiplier === 1.0
                    ? '1.0x · Standard Calibration'
                    : portionMultiplier === 1.5
                    ? '1.5x · Hearty Training Portion'
                    : '2.0x · Double Protein Feast'}
                </div>

                {selectedRecipe.rawImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowingRawPhoto(!showingRawPhoto);
                      retroAudio.playBlip();
                    }}
                    className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border-2 border-[#1A3629]/30 bg-[#FFFDF9] hover:bg-[#FAF6EE] text-[#1A3629] tracking-wider uppercase cursor-pointer transition-all flex items-center gap-1"
                  >
                    <span>{showingRawPhoto ? 'Retro Plate' : 'Original Photo'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Modal Title & Meta in Fraunces / Cabinet Grotesk */}
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase font-bold mb-2 flex-wrap">
                {(() => {
                  const dietBadge = getDietBadgeDetails(selectedRecipe.dietType);
                  return (
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-md border-2 uppercase font-bold flex items-center gap-1 ${dietBadge.pillStyle}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dietBadge.dotColor}`} />
                      <span>{dietBadge.label}</span>
                    </span>
                  );
                })()}
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

            {/* AI Computer Vision Reasoning Trace */}
            {selectedRecipe.reasoningSteps && selectedRecipe.reasoningSteps.length > 0 && (
              <div className="p-4 rounded-xl border-2 border-[#10B981]/40 bg-[#ECFDF5]/60 flex flex-col gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#065F46] flex items-center gap-1.5">
                  <span>AI Computer Vision Reasoning Trace</span>
                </span>
                <ul className="flex flex-col gap-1.5">
                  {selectedRecipe.reasoningSteps.map((step, idx) => (
                    <li key={idx} className="text-xs font-cabinet text-[#1A3629] leading-relaxed flex items-start gap-1.5">
                      <span className="text-[#10B981] font-mono font-bold">↳</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

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

            {/* Prominent Action Buttons - Flush Docked Sticky Bar */}
            <div className="sticky -bottom-6 sm:-bottom-8 -mx-6 sm:-mx-8 pt-4 pb-6 sm:pb-8 px-6 sm:px-8 bg-[#FFFDF9]/95 backdrop-blur-md border-t-2 border-[#1A3629]/15 flex items-center gap-3 mt-4 z-20">
              {selectedRecipe.isCustom && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete custom recipe "${selectedRecipe.name}"? This action cannot be undone.`)) {
                      deleteCustomRecipe(selectedRecipe.id);
                      closeRecipeModal();
                      setLoggedToast({
                        name: `${selectedRecipe.name} (Deleted)`,
                        protein: 0,
                        portion: 1.0,
                      });
                      setTimeout(() => setLoggedToast(null), 3000);
                    }
                  }}
                  className="py-3.5 px-4 rounded-xl border-2 border-red-500 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white font-cabinet font-bold text-xs transition-all shadow-[2px_2px_0px_rgba(239,68,68,0.4)] hover:-translate-y-0.5 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  title="Delete this custom recipe"
                >
                  <span>Delete</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  handleQuickLog(selectedRecipe, portionMultiplier);
                  closeRecipeModal();
                }}
                className="flex-1 py-3.5 px-6 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs sm:text-sm transition-all shadow-[3px_3px_0px_#3A6B52] hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  + Log Meal to Today (+{Math.round(selectedRecipe.protein * portionMultiplier)}g PRO · {portionMultiplier}x)
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* AI Computer Vision Scanner Modal */}
      <ScanRecipeModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onSaveRecipe={(newRecipe) => {
          addCustomRecipe(newRecipe);
          setLoggedToast({
            name: newRecipe.name,
            protein: newRecipe.protein,
            portion: 1.0,
          });
          setTimeout(() => setLoggedToast(null), 4000);
        }}
      />

      {/* Manual Custom Recipe Creation Modal */}
      <CustomRecipeModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSaveRecipe={(newRecipe) => {
          addCustomRecipe(newRecipe);
          setLoggedToast({
            name: newRecipe.name,
            protein: newRecipe.protein,
            portion: 1.0,
          });
          setTimeout(() => setLoggedToast(null), 4000);
        }}
      />
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
