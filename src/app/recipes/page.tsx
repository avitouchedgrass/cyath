'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'protein' | 'calories' | 'time'>('protein');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1.0);
  const [loggedToast, setLoggedToast] = useState<{ name: string; protein: number; portion: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const { logRecipeToDay, getDailyLog, userSession, setPendingAction } = useHabitStore();
  const todayLog = getDailyLog();

  useEffect(() => {
    setMounted(true);
  }, []);

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

    // Auth Gate: Check if user is authenticated
    if (!userSession) {
      setPendingAction({
        type: 'LOG_RECIPE',
        payload: {
          recipeId: recipe.id,
          recipeName: recipe.name,
          protein: scaledProtein,
          calories: scaledCalories,
          portion: multiplier,
        },
        returnUrl: '/recipes',
      });
      router.push('/login?redirect=/recipes');
      return;
    }

    logRecipeToDay(recipe.id, scaledProtein, scaledCalories);
    setLoggedToast({ name: recipe.name, protein: scaledProtein, portion: multiplier });
    setTimeout(() => setLoggedToast(null), 3000);
  };

  const currentProtein = mounted ? todayLog.totalProteinLogged : 0;
  const proteinProgress = mounted ? Math.min(100, Math.round((todayLog.totalProteinLogged / 130) * 100)) : 0;

  return (
    <div className="min-h-screen bg-[#080808] text-neutral-100 selection:bg-white selection:text-black flex flex-col">
      {/* Ambient subtle glow background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.02) 0%, transparent 60%)
          `,
        }}
      />

      <HeaderNav />

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 lg:px-12 pt-36 sm:pt-40 pb-24">
        
        {/* Navigation & Header Strip */}
        <div className="flex items-center justify-between mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>

          {/* Dashboard Mini-Progress Button */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-3 text-xs font-mono px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 hover:text-white transition-all shadow-sm group"
          >
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-white" />
              <span suppressHydrationWarning>Dashboard ({currentProtein}g / 130g)</span>
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

        {/* Page Header */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
              Whole-Food Catalog
            </span>
          </div>
          <h1 className="font-serif font-medium text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Whole-Food Fuel
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed font-sans max-w-2xl">
            Whole-food meals calibrated for energy retention. One click logs macros directly to your daily protocol.
          </p>
        </div>

        {/* Control Row */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-8">
          
          {/* Category Filter Pills */}
          <div className="overflow-x-auto pb-1 scrollbar-none">
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/10">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-black font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-white'
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-white/30 transition-all font-sans"
              />
              {!searchQuery && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 border border-white/10 px-1 py-0.5 rounded bg-white/5 pointer-events-none">
                  /
                </span>
              )}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Custom Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="px-3.5 py-2 rounded-xl bg-[#121212]/95 border border-white/10 text-xs font-mono text-slate-300 hover:text-white hover:border-white/20 transition-all flex items-center justify-between gap-2.5 shadow-sm cursor-pointer whitespace-nowrap"
                aria-haspopup="listbox"
                aria-expanded={isSortOpen}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-white font-medium">
                  {SORT_OPTIONS.find((opt) => opt.id === sortBy)?.label}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Popup */}
              {isSortOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-[#121212] border border-white/15 backdrop-blur-2xl shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-150 font-mono">
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
                        className={`w-full px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white/10 text-white font-semibold'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
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
        </div>

        {/* Recipe Cards Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-2xl p-8">
            <ChefHat className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="font-cabinet font-semibold text-base text-white">No matching recipes</h3>
            <p className="text-slate-400 text-xs mt-1">Try clearing your search query or selecting a different category filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs cursor-pointer hover:bg-slate-200 transition-colors"
            >
              Reset Filters
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
                  className="group cursor-pointer bg-white/[0.025] border border-white/10 hover:border-white/20 hover:bg-white/[0.035] backdrop-blur-xl rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-[0.99] flex flex-col justify-between"
                >
                  {/* Card Body */}
                  <div>
                    {/* Header Badges & Focus Score */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-mono tracking-widest text-slate-400 bg-white/[0.03] border border-white/10 px-2 py-0.5 rounded-md uppercase">
                        {recipe.category}
                      </span>
                      
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
                        <Sparkles className="w-3 h-3 text-slate-400" />
                        <span>Focus {recipe.focusScore}</span>
                      </span>
                    </div>

                    {/* Pixel Art Dish Presentation */}
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

                    {/* Title & Subtitle in Cabinet Grotesk */}
                    <h3 className="font-cabinet font-bold text-lg sm:text-xl text-white tracking-tight group-hover:text-slate-200 transition-colors leading-snug mb-1">
                      {recipe.name}
                    </h3>
                    <p className="text-slate-400 text-xs font-sans leading-relaxed line-clamp-2 mb-6">
                      {recipe.subtitle}
                    </p>
                  </div>

                  {/* Card Footer & Macro Tag */}
                  <div>
                    {/* Monospace Macro Summary Tag */}
                    <div className="flex items-center justify-center mb-3">
                      <span className="w-full text-center text-xs font-mono font-medium text-slate-300 bg-white/[0.03] py-2 rounded-xl border border-white/5 tracking-wider tabular-nums">
                        [{recipe.protein}G PRO · {recipe.calories} KCAL · {recipe.prepTimeMinutes}M]
                      </span>
                    </div>

                    {/* Log Button */}
                    <button
                      type="button"
                      onClick={(e) => handleQuickLog(recipe, 1.0, e)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isLogged
                          ? 'bg-white/10 text-white border border-white/20 hover:bg-white/15 active:scale-95'
                          : 'bg-white text-black hover:bg-slate-200 active:scale-95 shadow-sm'
                      }`}
                    >
                      {isLogged ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Logged to Today</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Log to Today</span>
                        </>
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
          <div className="px-4 py-3 rounded-xl bg-white text-black font-sans text-xs font-medium shadow-2xl flex items-center gap-2.5 border border-white/20">
            <Check className="w-4 h-4 text-black" />
            <span>
              Added <strong className="font-semibold">{loggedToast.name}</strong> ({loggedToast.portion}x portion · +{loggedToast.protein}g PRO) to today&apos;s log!
            </span>
          </div>
        </div>
      )}

      {/* Refactored Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedRecipe(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0c0c0c] border border-white/15 p-6 sm:p-8 shadow-2xl flex flex-col gap-6 scrollbar-none">
            {/* Close Button */}
            <button
              onClick={() => setSelectedRecipe(null)}
              className="absolute right-6 top-6 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Elevated Visual Anchor: 2x-3x Centered Pixel Art Image */}
            <div className="w-full flex flex-col items-center justify-center pt-2 pb-1">
              <div className="w-48 h-48 sm:w-56 sm:h-56 relative flex items-center justify-center">
                <img
                  src={selectedRecipe.image}
                  alt={selectedRecipe.name}
                  className="w-full h-full object-contain [image-rendering:pixelated] drop-shadow-[0_12px_24px_rgba(255,255,255,0.04)]"
                />
              </div>
            </div>

            {/* Modal Title & Meta in Cabinet Grotesk */}
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-slate-400 mb-2">
                <span className="bg-white/[0.03] border border-white/10 px-2 py-0.5 rounded-md text-[10px] tracking-widest text-slate-300">
                  {selectedRecipe.category}
                </span>
                <span>·</span>
                <span className="text-slate-400 text-xs">{selectedRecipe.prepTimeMinutes} mins prep</span>
                <span>·</span>
                <span className="text-slate-400 text-xs">Focus {selectedRecipe.focusScore}</span>
              </div>
              <h2 className="font-cabinet font-bold text-2xl sm:text-3xl text-white tracking-tight mb-2">
                {selectedRecipe.name}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm font-sans leading-relaxed">
                {selectedRecipe.description}
              </p>
            </div>

            {/* Tactile Portion Segmented Control */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 block">
                  Select Serving Portion
                </span>
                <span className="text-[11px] text-slate-500 font-sans">
                  Scales macros dynamically before logging
                </span>
              </div>

              {/* Wrapped group pill with active/inactive states */}
              <div className="bg-white/[0.02] border border-white/10 p-1 rounded-lg inline-flex gap-1">
                {PORTION_MULTIPLIERS.map((mult) => (
                  <button
                    key={mult}
                    type="button"
                    onClick={() => setPortionMultiplier(mult)}
                    className={`px-3 py-1.5 text-xs font-mono transition-all cursor-pointer ${
                      portionMultiplier === mult
                        ? 'bg-white text-black font-semibold rounded-md shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] rounded-md'
                    }`}
                  >
                    {mult}x
                  </button>
                ))}
              </div>
            </div>

            {/* Scaled Macro Breakdown Bar with strict font-mono */}
            <div className="grid grid-cols-4 gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center font-mono">
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Protein</div>
                <div className="text-xl font-bold text-white tabular-nums mt-0.5">
                  {Math.round(selectedRecipe.protein * portionMultiplier)}g
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Carbs</div>
                <div className="text-xl font-bold text-slate-300 tabular-nums mt-0.5">
                  {Math.round(selectedRecipe.carbs * portionMultiplier)}g
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Fats</div>
                <div className="text-xl font-bold text-slate-300 tabular-nums mt-0.5">
                  {Math.round(selectedRecipe.fats * portionMultiplier)}g
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Calories</div>
                <div className="text-xl font-bold text-white tabular-nums mt-0.5">
                  {Math.round(selectedRecipe.calories * portionMultiplier)}
                </div>
              </div>
            </div>

            {/* Ingredients Checklist with Cabinet Grotesk Header & Monospace Amounts */}
            <div>
              <h3 className="font-cabinet font-bold text-base text-slate-100 mb-3 tracking-tight">
                Ingredients ({portionMultiplier}x portion)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedRecipe.ingredients.map((ing, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs"
                  >
                    <span className="text-slate-200 font-sans">{ing.item}</span>
                    <span className="text-slate-400 font-mono font-medium tabular-nums">{ing.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-Step Instructions with Cabinet Grotesk Header */}
            <div>
              <h3 className="font-cabinet font-bold text-base text-slate-100 mb-3 tracking-tight">
                Method &amp; Preparation
              </h3>
              <ol className="space-y-2.5">
                {selectedRecipe.instructions.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                    <span className="w-5 h-5 rounded-md bg-white/10 text-white font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5 tabular-nums font-semibold">
                      0{idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Sticky / Prominent Primary Action CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  handleQuickLog(selectedRecipe, portionMultiplier);
                  setSelectedRecipe(null);
                }}
                className="w-full py-4 rounded-xl bg-white text-black font-semibold text-sm hover:bg-slate-200 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>
                  Log Portion to Protocol (+{Math.round(selectedRecipe.protein * portionMultiplier)}g PRO · {portionMultiplier}x)
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-medium text-white tracking-tight">Cyath</span>
            <span>— Pixel-Perfect Health</span>
          </div>
          <div>Built with Next.js, Supabase &amp; Tailwind CSS</div>
        </div>
      </footer>
    </div>
  );
}
