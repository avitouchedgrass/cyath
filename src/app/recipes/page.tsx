'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { PixelContainer } from '@/components/ui/PixelContainer';
import { RECIPES, Recipe } from '@/lib/recipes';
import { useHabitStore } from '@/store/useHabitStore';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Check,
  Plus,
  ArrowLeft,
  X,
  ChefHat,
  Zap,
} from 'lucide-react';

const CATEGORIES = ['All', 'High Protein', 'Steady Carbs', 'Quick Fuel', 'Keto Clean', 'Post Workout'] as const;
const PORTION_MULTIPLIERS = [0.5, 1.0, 1.5, 2.0] as const;

const SORT_OPTIONS: { id: 'protein' | 'calories' | 'time'; label: string }[] = [
  { id: 'protein', label: 'Highest Protein' },
  { id: 'calories', label: 'Lowest Calories' },
  { id: 'time', label: 'Quickest Prep' },
];

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'protein' | 'calories' | 'time'>('protein');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1.0);
  const [loggedToast, setLoggedToast] = useState<{ name: string; protein: number; portion: number } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const { logRecipeToDay, getDailyLog } = useHabitStore();
  const todayLog = getDailyLog();

  // Close custom dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut listener: Press '/' to focus search, 'Escape' to dismiss modals/dropdowns
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        if (selectedRecipe) setSelectedRecipe(null);
        if (isSortOpen) setIsSortOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRecipe, isSortOpen]);

  const openRecipeModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setPortionMultiplier(1.0);
  };

  const filteredRecipes = useMemo(() => {
    return RECIPES.filter((recipe) => {
      const matchesSearch =
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        recipe.ingredients.some((i) => i.item.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All' || recipe.category === selectedCategory;

      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (sortBy === 'protein') return b.protein - a.protein;
      if (sortBy === 'calories') return a.calories - b.calories;
      if (sortBy === 'time') return a.prepTimeMinutes - b.prepTimeMinutes;
      return 0;
    });
  }, [searchQuery, selectedCategory, sortBy]);

  const handleQuickLog = (recipe: Recipe, multiplier: number = 1.0, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const scaledProtein = Math.round(recipe.protein * multiplier);
    const scaledCalories = Math.round(recipe.calories * multiplier);

    logRecipeToDay(recipe.id, scaledProtein, scaledCalories);
    setLoggedToast({ name: recipe.name, protein: scaledProtein, portion: multiplier });
    setTimeout(() => setLoggedToast(null), 3000);
  };

  const proteinProgress = Math.min(100, Math.round((todayLog.totalProteinLogged / 130) * 100));

  return (
    <div className="min-h-screen bg-[#080808] text-neutral-100 selection:bg-white selection:text-black flex flex-col">
      {/* Background Ambient Radial Highlights */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.03) 0%, transparent 65%),
            radial-gradient(circle at 85% 85%, rgba(255, 255, 255, 0.015) 0%, transparent 60%)
          `,
        }}
      />

      <HeaderNav />

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 lg:px-12 pt-28 sm:pt-32 pb-24">
        
        {/* Breadcrumb & Navigation Link */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>

          {/* Dashboard Mini-Progress Button */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-3 text-xs font-mono px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-neutral-300 hover:text-white transition-all shadow-md group"
          >
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-white" />
              <span>Dashboard ({todayLog.totalProteinLogged}g / 130g)</span>
            </div>

            {/* Mini Progress Bar */}
            <div className="w-14 h-1.5 rounded-full bg-white/10 overflow-hidden hidden sm:block">
              <div
                className="h-full bg-white transition-all duration-500 rounded-full"
                style={{ width: `${proteinProgress}%` }}
              />
            </div>
          </Link>
        </div>

        {/* Hero Section Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs font-mono text-neutral-400 mb-4">
            <ChefHat className="w-3.5 h-3.5 text-white" />
            <span>Macro-Calibrated Engine</span>
          </div>
          <h1 className="font-cabinet font-bold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Pixel-Calibrated Fuel
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base mt-3 leading-relaxed font-sans max-w-2xl">
            Whole-food meals calibrated for energy retention. One click logs macros directly to your daily protocol.
          </p>
        </div>

        {/* Control Bar: Search Input & Bespoke Dark Frosted-Glass Dropdown */}
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-3.5 sm:p-4 mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between z-20 relative">
          
          {/* Search Bar with '/' keyboard accelerator */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes, ingredients, or tags..."
              className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-white/30 transition-all font-sans"
            />
            {!searchQuery && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-500 border border-white/10 px-1.5 py-0.5 rounded bg-white/5 pointer-events-none">
                /
              </span>
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 1. Bespoke Dark Frosted-Glass Custom Dropdown Menu */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-[#111622] border border-white/10 text-xs font-mono text-neutral-300 hover:text-white hover:border-white/20 transition-all flex items-center justify-between gap-3 shadow-lg cursor-pointer"
              aria-haspopup="listbox"
              aria-expanded={isSortOpen}
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-neutral-400">Sort:</span>
                <span className="text-white font-medium">
                  {SORT_OPTIONS.find((opt) => opt.id === sortBy)?.label}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Popup */}
            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#111622] border border-white/15 backdrop-blur-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 font-mono">
                {SORT_OPTIONS.map((option) => {
                  const isSelected = sortBy === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setSortBy(option.id);
                        setIsSortOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white/10 text-white font-semibold'
                          : 'text-neutral-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 5. Single Segmented Monospace Pill Filter Bar */}
        <div className="mb-10 overflow-x-auto pb-2 scrollbar-none">
          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-black font-bold shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recipe Cards Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-20 backdrop-blur-xl bg-white/[0.02] border border-white/5 rounded-3xl p-8">
            <ChefHat className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="font-cabinet font-bold text-lg text-white">No matching recipes found</h3>
            <p className="text-neutral-400 text-xs mt-1">Try clearing your search query or selecting a different category filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs cursor-pointer hover:bg-neutral-200 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => {
              const isLogged = todayLog.loggedRecipeIds.includes(recipe.id);

              return (
                <div
                  key={recipe.id}
                  onClick={() => openRecipeModal(recipe)}
                  className="group cursor-pointer backdrop-blur-xl bg-white/[0.02] border border-white/10 hover:border-white/25 hover:bg-white/[0.04] rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] active:scale-[0.99] flex flex-col justify-between shadow-xl relative overflow-hidden"
                >
                  {/* Top Subtle Specular Line */}
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

                  {/* Card Body */}
                  <div>
                    {/* Header Badges & Focus Telemetry */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-wider text-neutral-300">
                        {recipe.category}
                      </span>
                      
                      {/* Focus Score with info trigger */}
                      <div className="relative group/focus">
                        <span className="flex items-center gap-1 text-[11px] font-mono font-medium text-neutral-300 hover:text-white transition-colors">
                          <Sparkles className="w-3 h-3 text-neutral-400" />
                          <span>Focus {recipe.focusScore}</span>
                        </span>
                      </div>
                    </div>

                    {/* 2 & 4. Unique Pixel Art Dish with Smooth Image Scale Hover */}
                    <div className="w-full flex items-center justify-center py-4 mb-4">
                      <div className="w-44 h-44 relative flex items-center justify-center">
                        <PixelContainer
                          src={recipe.image}
                          alt={recipe.name}
                          width={170}
                          height={170}
                          withGlow
                          className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-cabinet font-bold text-xl text-white tracking-tight group-hover:text-neutral-200 transition-colors leading-snug mb-1">
                      {recipe.name}
                    </h3>
                    <p className="text-neutral-400 text-xs font-sans leading-relaxed line-clamp-2 mb-5">
                      {recipe.subtitle}
                    </p>
                  </div>

                  {/* 4. Monospace Telemetry Row & Footer */}
                  <div>
                    {/* Itemized Macro Telemetry Grid */}
                    <div className="grid grid-cols-4 gap-2 py-2.5 px-3 rounded-2xl bg-white/[0.02] border border-white/5 font-mono mb-3 text-center">
                      <div>
                        <div className="text-[10px] text-neutral-500 uppercase">PRO</div>
                        <div className="text-xs sm:text-sm font-bold text-white tracking-tight">{recipe.protein}g</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-500 uppercase">CARB</div>
                        <div className="text-xs sm:text-sm font-bold text-neutral-300 tracking-tight">{recipe.carbs}g</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-500 uppercase">FAT</div>
                        <div className="text-xs sm:text-sm font-bold text-neutral-300 tracking-tight">{recipe.fats}g</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-500 uppercase">KCAL</div>
                        <div className="text-xs sm:text-sm font-bold text-white tracking-tight">{recipe.calories}</div>
                      </div>
                    </div>

                    {/* Monospace Telemetry Summary Tag `[48g PRO | 520 KCAL | 20M]` */}
                    <div className="flex items-center justify-center py-1 mb-3">
                      <span className="text-[11px] font-mono font-medium text-neutral-400 bg-white/[0.02] px-3 py-1 rounded-full border border-white/5 tracking-wider">
                        [{recipe.protein}G PRO | {recipe.calories} KCAL | {recipe.prepTimeMinutes}M]
                      </span>
                    </div>

                    {/* Actions: Log Button */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleQuickLog(recipe, 1.0, e)}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isLogged
                            ? 'bg-white/10 text-white border border-white/20 hover:bg-white/15 active:scale-95'
                            : 'bg-white text-black hover:bg-neutral-200 active:scale-95 shadow-md'
                        }`}
                      >
                        {isLogged ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Logged to Today</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Log (+{recipe.protein}g PRO)</span>
                          </>
                        )}
                      </button>
                    </div>
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
          <div className="px-4 py-3 rounded-2xl bg-white text-black font-sans text-xs font-medium shadow-2xl flex items-center gap-2.5 border border-white/20">
            <Check className="w-4 h-4 text-black" />
            <span>
              Added <strong className="font-semibold">{loggedToast.name}</strong> ({loggedToast.portion}x portion · +{loggedToast.protein}g PRO) to today&apos;s log!
            </span>
          </div>
        </div>
      )}

      {/* Recipe Detail Modal Inspector */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedRecipe(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#080808] border border-white/15 p-6 sm:p-8 shadow-2xl flex flex-col gap-6 scrollbar-none">
            {/* Close Button */}
            <button
              onClick={() => setSelectedRecipe(null)}
              className="absolute right-6 top-6 rounded-full p-2 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/10">
              <div className="w-36 h-36 relative flex-shrink-0 flex items-center justify-center bg-white/[0.02] border border-white/10 rounded-2xl p-2">
                <PixelContainer
                  src={selectedRecipe.image}
                  alt={selectedRecipe.name}
                  width={140}
                  height={140}
                  withGlow
                />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase text-neutral-300 mb-2">
                  <span>{selectedRecipe.category}</span>
                  <span>·</span>
                  <span>{selectedRecipe.prepTimeMinutes} mins prep</span>
                </div>
                <h2 className="font-cabinet font-bold text-2xl sm:text-3xl text-white tracking-tight mb-2">
                  {selectedRecipe.name}
                </h2>
                <p className="text-neutral-400 text-xs sm:text-sm font-sans leading-relaxed">
                  {selectedRecipe.description}
                </p>
              </div>
            </div>

            {/* Portion Size Multiplier Stepper */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-300 block">
                  Select Serving Portion
                </span>
                <span className="text-[11px] text-neutral-500 font-sans">
                  Scales macros dynamically before logging
                </span>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
                {PORTION_MULTIPLIERS.map((mult) => (
                  <button
                    key={mult}
                    type="button"
                    onClick={() => setPortionMultiplier(mult)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      portionMultiplier === mult
                        ? 'bg-white text-black font-bold shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {mult}x
                  </button>
                ))}
              </div>
            </div>

            {/* Scaled Macro Breakdown Bar */}
            <div className="grid grid-cols-4 gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center font-mono">
              <div>
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Protein</div>
                <div className="text-lg font-bold text-white">
                  {Math.round(selectedRecipe.protein * portionMultiplier)}g
                </div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Carbs</div>
                <div className="text-lg font-bold text-neutral-300">
                  {Math.round(selectedRecipe.carbs * portionMultiplier)}g
                </div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Fats</div>
                <div className="text-lg font-bold text-neutral-300">
                  {Math.round(selectedRecipe.fats * portionMultiplier)}g
                </div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Calories</div>
                <div className="text-lg font-bold text-white">
                  {Math.round(selectedRecipe.calories * portionMultiplier)}
                </div>
              </div>
            </div>

            {/* Ingredients Checklist */}
            <div>
              <h3 className="font-cabinet font-bold text-base text-white mb-3">
                Calibrated Ingredients ({portionMultiplier}x portion)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedRecipe.ingredients.map((ing, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs"
                  >
                    <span className="text-neutral-200 font-sans">{ing.item}</span>
                    <span className="text-neutral-400 font-mono font-medium">{ing.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div>
              <h3 className="font-cabinet font-bold text-base text-white mb-3">
                Culinary Protocol Steps
              </h3>
              <ol className="space-y-2.5">
                {selectedRecipe.instructions.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white font-mono text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Focus Score Explainer Box */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3 text-xs font-sans text-neutral-400">
              <Sparkles className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-white font-semibold font-mono">Cognitive Bioavailability ({selectedRecipe.focusScore}): </span>
                Calibrated based on steady amino-acid plasma release, low glycemic index fluctuations, and dietary choline for maximum sustained mental output.
              </div>
            </div>

            {/* Modal Bottom Log Action */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
              <span className="text-xs font-mono text-neutral-400 hidden sm:inline-block">
                Portion: {portionMultiplier}x serving
              </span>
              <button
                type="button"
                onClick={() => {
                  handleQuickLog(selectedRecipe, portionMultiplier);
                  setSelectedRecipe(null);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>
                  Log to Protocol (+{Math.round(selectedRecipe.protein * portionMultiplier)}g PRO · {portionMultiplier}x)
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-6 text-center text-xs text-neutral-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-cabinet font-bold text-white tracking-tight">Cyath</span>
            <span>— Pixel-Perfect Health</span>
          </div>
          <div>Built with Next.js, Supabase & Tailwind CSS</div>
        </div>
      </footer>
    </div>
  );
}
