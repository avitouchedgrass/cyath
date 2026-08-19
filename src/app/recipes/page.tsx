'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { PixelContainer } from '@/components/ui/PixelContainer';
import { RECIPES, Recipe } from '@/lib/recipes';
import { useHabitStore } from '@/store/useHabitStore';
import {
  Search,
  SlidersHorizontal,
  Flame,
  Clock,
  Sparkles,
  Check,
  Plus,
  ArrowLeft,
  X,
  ChefHat,
  Zap,
} from 'lucide-react';

const CATEGORIES = ['All', 'High Protein', 'Steady Carbs', 'Quick Fuel', 'Keto Clean', 'Post Workout'] as const;

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'protein' | 'calories' | 'time'>('protein');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loggedToast, setLoggedToast] = useState<{ name: string; protein: number } | null>(null);

  const { logRecipeToDay, getDailyLog } = useHabitStore();
  const todayLog = getDailyLog();

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

  const handleQuickLog = (recipe: Recipe, e?: React.MouseEvent) => {
    e?.stopPropagation();
    logRecipeToDay(recipe.id, recipe.protein, recipe.calories);
    setLoggedToast({ name: recipe.name, protein: recipe.protein });
    setTimeout(() => setLoggedToast(null), 3000);
  };

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

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-mono px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-neutral-300 hover:text-white transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-neutral-400" />
            <span>Open Dashboard ({todayLog.totalProteinLogged}g PRO Logged)</span>
          </Link>
        </div>

        {/* Hero Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs font-mono text-neutral-400 mb-4">
            <ChefHat className="w-3.5 h-3.5 text-white" />
            <span>Macro-Calibrated Engine</span>
          </div>
          <h1 className="font-cabinet font-bold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Pixel-Calibrated Fuel
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base mt-3 leading-relaxed font-sans max-w-2xl">
            Whole-food, high-bioavailability recipes designed for metabolic consistency and mental clarity. One click logs macros directly to your daily protocol.
          </p>
        </div>

        {/* Filter, Search & Sort Control Bar */}
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-4 sm:p-5 mb-10 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes, ingredients, or tags..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-white/30 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selection */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <SlidersHorizontal className="w-4 h-4 text-neutral-400" />
            <span className="text-xs font-mono text-neutral-400 hidden sm:inline-block">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-neutral-200 text-xs font-mono focus:outline-none focus:border-white/30 cursor-pointer"
            >
              <option value="protein" className="bg-[#121212] text-white">Highest Protein</option>
              <option value="calories" className="bg-[#121212] text-white">Lowest Calories</option>
              <option value="time" className="bg-[#121212] text-white">Quickest Prep</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-black font-semibold shadow-md'
                    : 'bg-white/[0.02] border border-white/10 text-neutral-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {cat}
              </button>
            );
          })}
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
                  onClick={() => setSelectedRecipe(recipe)}
                  className="group cursor-pointer backdrop-blur-xl bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.04] rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between shadow-xl relative overflow-hidden"
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
                      <span className="flex items-center gap-1 text-[11px] font-mono font-medium text-neutral-300">
                        <Sparkles className="w-3 h-3 text-neutral-400" />
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
                          className="w-full h-full"
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

                  {/* Macro Telemetry Grid */}
                  <div>
                    <div className="grid grid-cols-4 gap-2 py-3 px-3.5 rounded-2xl bg-white/[0.02] border border-white/5 font-mono mb-4 text-center">
                      <div>
                        <div className="text-[10px] text-neutral-500 uppercase">PRO</div>
                        <div className="text-sm font-bold text-white tracking-tight">{recipe.protein}g</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-500 uppercase">CARB</div>
                        <div className="text-sm font-bold text-neutral-300 tracking-tight">{recipe.carbs}g</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-500 uppercase">FAT</div>
                        <div className="text-sm font-bold text-neutral-300 tracking-tight">{recipe.fats}g</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-500 uppercase">KCAL</div>
                        <div className="text-sm font-bold text-white tracking-tight">{recipe.calories}</div>
                      </div>
                    </div>

                    {/* Actions: Log Button & Inspect */}
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => handleQuickLog(recipe, e)}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isLogged
                            ? 'bg-white/10 text-white border border-white/20 hover:bg-white/15'
                            : 'bg-white text-black hover:bg-neutral-200 active:scale-[0.98]'
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
                            <span>Log to Today (+{recipe.protein}g)</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1 text-xs font-mono text-neutral-500 px-2 py-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{recipe.prepTimeMinutes}m</span>
                      </div>
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
              Added <strong className="font-semibold">{loggedToast.name}</strong> (+{loggedToast.protein}g protein) to today&apos;s log!
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

            {/* Macro Breakdown Bar */}
            <div className="grid grid-cols-4 gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center font-mono">
              <div>
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Protein</div>
                <div className="text-lg font-bold text-white">{selectedRecipe.protein}g</div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Carbs</div>
                <div className="text-lg font-bold text-neutral-300">{selectedRecipe.carbs}g</div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Fats</div>
                <div className="text-lg font-bold text-neutral-300">{selectedRecipe.fats}g</div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Calories</div>
                <div className="text-lg font-bold text-white">{selectedRecipe.calories}</div>
              </div>
            </div>

            {/* Ingredients Checklist */}
            <div>
              <h3 className="font-cabinet font-bold text-base text-white mb-3">
                Calibrated Ingredients
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

            {/* Modal Bottom Log Action */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
              <span className="text-xs font-mono text-neutral-400 hidden sm:inline-block">
                Focus Telemetry: {selectedRecipe.focusScore}
              </span>
              <button
                type="button"
                onClick={() => {
                  handleQuickLog(selectedRecipe);
                  setSelectedRecipe(null);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Log to Today&apos;s Protocol (+{selectedRecipe.protein}g PRO)</span>
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
