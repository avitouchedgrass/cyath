'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RECIPES, Recipe } from '@/lib/recipes';
import { CURATED_PROTOCOLS, ProtocolBlueprint } from '@/lib/protocols';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { ScanRecipeModal } from '@/components/recipes/ScanRecipeModal';
import { CustomRecipeModal } from '@/components/recipes/CustomRecipeModal';
import { PixelSteam } from '@/components/landing/PixelSteam';
import { RecipeNutritionDetail } from '@/components/recipes/RecipeNutritionDetail';
import { Search, Plus, Check, Clock, Zap, Bot, X, Utensils, Activity } from 'lucide-react';

const CATEGORIES = ['All', 'High Protein', 'Steady Carbs', 'Quick Fuel', 'Keto Clean'] as const;
const PROTOCOL_CATEGORIES = ['All', 'Morning', 'Focus', 'Sleep', 'Movement'] as const;
const PORTION_MULTIPLIERS = [0.5, 1.0, 1.5, 2.0] as const;

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

function PlaybookContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'protocols' ? 'protocols' : 'fuel';

  const [activeTab, setActiveTab] = useState<'fuel' | 'protocols'>(initialTab);
  const [mounted, setMounted] = useState(false);

  // Fuel tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [portionMultiplier, setPortionMultiplier] = useState<0.5 | 1.0 | 1.5 | 2.0>(1.0);

  // Protocols tab state
  const [protocolFilter, setProtocolFilter] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
    customRecipes,
    activeProtocolIds,
    activateProtocol,
    addCustomRecipe,
    deleteCustomRecipe,
    logRecipeToDay,
    currentDate,
    getDailyLog,
    userSession,
    setPendingAction,
    gainXp,
  } = useHabitStore();

  const currentLog = getDailyLog(currentDate);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Combined recipes catalog
  const allRecipes = useMemo(() => {
    return [...(customRecipes || []), ...RECIPES];
  }, [customRecipes]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'protocols') setActiveTab('protocols');
    if (tabParam === 'recipes' || tabParam === 'fuel') setActiveTab('fuel');
    const inspectParam = searchParams.get('inspect');
    if (inspectParam) {
      const match = allRecipes.find((r) => r.id === inspectParam);
      if (match) {
        setSelectedRecipe(match);
        setPortionMultiplier(1.0);
        setActiveTab('fuel');
      }
    }
  }, [searchParams, allRecipes]);

  // Filtered recipes
  const filteredRecipes = useMemo(() => {
    return allRecipes.filter((recipe) => {
      const matchesSearch =
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some((ing) => ing.item.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All' ||
        (selectedCategory === 'High Protein' && recipe.protein >= 30) ||
        (selectedCategory === 'Steady Carbs' && recipe.category === 'Steady Carbs') ||
        (selectedCategory === 'Quick Fuel' && recipe.prepTimeMinutes <= 15) ||
        (selectedCategory === 'Keto Clean' && recipe.calories < 450);

      return matchesSearch && matchesCategory;
    });
  }, [allRecipes, searchQuery, selectedCategory]);

  // Filtered protocols
  const filteredProtocols = useMemo(() => {
    return CURATED_PROTOCOLS.filter((proto) => {
      if (protocolFilter === 'All') return true;
      return proto.category === protocolFilter;
    });
  }, [protocolFilter]);

  const handleToggleProtocol = (protocol: ProtocolBlueprint, e: React.MouseEvent) => {
    retroAudio.playInspectConfirm();

    if (!userSession) {
      setPendingAction({
        type: 'ACTIVATE_PROTOCOL',
        payload: { protocolId: protocol.id },
        returnUrl: '/playbook?tab=protocols',
      });
      router.push('/login?redirect=/playbook?tab=protocols');
      return;
    }

    const isAlreadyActive = activeProtocolIds.includes(protocol.id);
    activateProtocol(protocol.id, protocol.standardHabits);

    setToastMessage(
      isAlreadyActive
        ? `Removed ${protocol.name} from Daily Cockpit.`
        : `Added ${protocol.name} to Daily Cockpit (+50 XP)!`
    );

    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogRecipe = (recipe: Recipe, multiplier: number, e?: React.MouseEvent) => {
    retroAudio.playInspectConfirm();
    const scaledProtein = Math.round(recipe.protein * multiplier);
    const scaledCalories = Math.round(recipe.calories * multiplier);
    logRecipeToDay(recipe.id, scaledProtein, scaledCalories, currentDate);
    setToastMessage(`Logged ${recipe.name} (+${scaledProtein}g Protein)`);
    setTimeout(() => setToastMessage(null), 3000);
    setSelectedRecipe(null);
  };

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1A3629] flex flex-col selection:bg-[#1A3629] selection:text-[#FFFDF9]">
      <HeaderNav />

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24 flex flex-col gap-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: 'Playbook' }]} />

        {/* Master Playbook Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A3629]/10 pb-4">
          <div>
            <h1 className="font-cabinet font-extrabold text-3xl md:text-4xl tracking-tight text-[#1A3629]">
              The Desk Worker Playbook
            </h1>
            <p className="font-cabinet text-xs sm:text-sm font-medium text-[#4A5D4E] mt-0.5">
              16-bit pixel art whole foods and focus blueprints calibrated for sustained mental stamina.
            </p>
          </div>

          {/* 2-Segment Pillar Switch */}
          <div 
            role="group" 
            aria-label="Playbook sections"
            className="inline-flex items-center p-1 rounded-full border border-[#1A3629]/15 bg-[#FFFDF9] shadow-2xs"
          >
            <button
              type="button"
              aria-pressed={activeTab === 'fuel'}
              onClick={() => {
                retroAudio.playBlip();
                setActiveTab('fuel');
              }}
              className={`px-4 py-2 rounded-full font-cabinet font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'fuel'
                  ? 'bg-[#1A3629] text-[#FFFDF9] shadow-xs'
                  : 'text-[#1A3629]/70 hover:text-[#1A3629]'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Fuel Catalog ({allRecipes.length})</span>
            </button>

            <button
              type="button"
              aria-pressed={activeTab === 'protocols'}
              onClick={() => {
                retroAudio.playBlip();
                setActiveTab('protocols');
              }}
              className={`px-4 py-2 rounded-full font-cabinet font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'protocols'
                  ? 'bg-[#1A3629] text-[#FFFDF9] shadow-xs'
                  : 'text-[#1A3629]/70 hover:text-[#1A3629]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Focus Protocols ({CURATED_PROTOCOLS.length})</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#1A3629] text-[#FFFDF9] px-4 py-2.5 rounded-full border border-[#1A3629]/15 shadow-2xs font-cabinet text-xs font-bold animate-in fade-in flex items-center gap-2">
            <span>✓</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* TAB 1: FUEL & DESK RECIPES */}
        {activeTab === 'fuel' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Control Bar: Search & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A3629]/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search recipes, ingredients, macros..."
                  className="w-full h-11 pl-10 pr-4 rounded-full border border-[#1A3629]/12 bg-[#FFFDF9] text-[#1A3629] font-cabinet text-xs placeholder:text-[#1A3629]/40 outline-none shadow-2xs focus:border-[#1A3629]/30"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsScanModalOpen(true)}
                  className="px-4 py-2 rounded-full border border-[#1A3629]/12 bg-[#FAF8F5] hover:bg-[#1A3629] hover:text-[#FFFDF9] text-[#1A3629] font-cabinet font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Scan Meal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(true)}
                  className="px-4 py-2 rounded-full border border-[#1A3629]/12 bg-[#FAF8F5] hover:bg-[#1A3629] hover:text-[#FFFDF9] text-[#1A3629] font-cabinet font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Custom</span>
                </button>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    retroAudio.playBlip();
                    setSelectedCategory(cat);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                    selectedCategory === cat
                      ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-2xs'
                      : 'bg-[#FFFDF9] text-[#1A3629]/70 border-[#1A3629]/20 hover:border-[#1A3629]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Recipe Grid Featuring Pixel Art Dishes */}
            {filteredRecipes.length === 0 ? (
              <div className="rounded-3xl border border-[#1A3629]/10 bg-[#FFFDF9] p-8 text-center flex flex-col items-center justify-center gap-3">
                <Utensils className="w-8 h-8 text-[#1A3629]/30" />
                <h3 className="font-cabinet font-bold text-base text-[#1A3629]">
                  No recipes found matching your criteria
                </h3>
                <p className="text-xs text-[#4A5D4E] max-w-sm">
                  Try searching for a different ingredient or reset your category and search filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="px-4 py-2 rounded-full bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs hover:bg-[#2C4A3B] transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => {
                const isLogged = currentLog.loggedRecipeIds?.includes(recipe.id);
                const dietBadge = getDietBadgeDetails(recipe.dietType);

                return (
                  <div
                    key={recipe.id}
                    onClick={() => {
                      setSelectedRecipe(recipe);
                      setPortionMultiplier(1.0);
                    }}
                    className="group cursor-pointer rounded-3xl border border-[#1A3629]/10 bg-[#FFFDF9] p-5 sm:p-6 shadow-[0_2px_12px_rgba(26,54,41,0.03)] hover:border-[#1A3629]/25 hover:shadow-[0_4px_20px_rgba(26,54,41,0.06)] transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Top Badges */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-2 min-h-[26px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider flex items-center gap-1 ${dietBadge.pillStyle}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dietBadge.dotColor}`} />
                            <span>{dietBadge.label}</span>
                          </span>

                          <span className="text-[10px] font-mono font-bold border px-2 py-0.5 rounded-md uppercase border-[#1A3629]/20 bg-[#FAF6EE] text-[#1A3629]">
                            {recipe.isCustom ? `Custom · ${recipe.category}` : recipe.category}
                          </span>
                        </div>

                        <span className="text-xs font-mono font-bold text-[#1A3629] shrink-0">
                          Focus {recipe.focusScore}
                        </span>
                      </div>

                      {/* Continuous Pixel Art Food Presentation */}
                      <div className="w-full flex items-center justify-center py-2 my-auto">
                        <div className="w-44 h-44 sm:w-48 sm:h-48 relative flex items-center justify-center">
                          <img
                            src={recipe.image}
                            alt={`${recipe.name} — ${recipe.protein}g protein whole-food plate`}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (target.src.includes('.webp')) {
                                target.src = target.src.replace('.webp', '.png');
                              } else if (!target.src.endsWith('generic-plate.webp')) {
                                target.src = '/assets/food/generic-plate.webp';
                              }
                            }}
                            className="w-full h-full object-contain [image-rendering:pixelated] drop-shadow-[8px_8px_0px_rgba(26,54,41,0.12)] group-hover:scale-105 transition-transform duration-300 select-none"
                          />
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="flex flex-col gap-1">
                        <h3 className="font-cabinet font-extrabold text-lg text-[#1A3629] group-hover:underline leading-snug">
                          {recipe.name}
                        </h3>
                        <p className="font-cabinet text-xs text-[#4A5D4E] line-clamp-2 leading-relaxed">
                          {recipe.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Macro Ledger & Status */}
                    <div className="pt-4 mt-4 border-t border-[#1A3629]/15 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold">
                        <span className="px-2 py-0.5 rounded bg-[#ECFDF5] text-[#065F46] border border-[#10B981]/30">
                          {recipe.protein}g PRO
                        </span>
                        <span className="text-[#1A3629]/70 tabular-nums">
                          {recipe.calories} kcal
                        </span>
                        <span className="text-[#1A3629]/50">·</span>
                        <span className="text-[#1A3629]/70 flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {recipe.prepTimeMinutes}m
                        </span>
                      </div>

                      <span className="font-mono text-xs font-bold text-[#1A3629] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        {isLogged ? '✓ Logged' : 'Inspect →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}

        {/* TAB 2: FOCUS PROTOCOLS */}
        {activeTab === 'protocols' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {PROTOCOL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    retroAudio.playBlip();
                    setProtocolFilter(cat);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                    protocolFilter === cat
                      ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] shadow-2xs'
                      : 'bg-[#FFFDF9] text-[#1A3629]/70 border-[#1A3629]/20 hover:border-[#1A3629]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {filteredProtocols.length === 0 ? (
              <div className="rounded-3xl border border-[#1A3629]/10 bg-[#FFFDF9] p-8 text-center flex flex-col items-center justify-center gap-3">
                <Activity className="w-8 h-8 text-[#1A3629]/30" />
                <h3 className="font-cabinet font-bold text-base text-[#1A3629]">
                  No protocols found in this category
                </h3>
                <button
                  type="button"
                  onClick={() => setProtocolFilter('All')}
                  className="px-4 py-2 rounded-full bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs hover:bg-[#2C4A3B] transition-colors cursor-pointer"
                >
                  Show All Protocols
                </button>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProtocols.map((proto) => {
                const isActive = activeProtocolIds.includes(proto.id);

                return (
                  <div
                    key={proto.id}
                    className={`rounded-3xl border p-6 transition-all flex flex-col justify-between gap-5 shadow-[0_2px_12px_rgba(26,54,41,0.03)] ${
                      isActive
                        ? 'border-[#1A3629] bg-[#FAF8F5]'
                        : 'border-[#1A3629]/10 bg-[#FFFDF9] hover:border-[#1A3629]/25'
                    }`}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-md border border-[#1A3629]/30 bg-[#FAF6EE] text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A3629]">
                          {proto.category} Protocol
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md border border-[#10B981]/40 bg-[#ECFDF5] text-[10px] font-mono font-bold text-[#065F46]">
                          {proto.timeframe}
                        </span>
                      </div>

                      <h3 className="font-cabinet font-extrabold text-xl text-[#1A3629]">
                        {proto.name}
                      </h3>
                      <p className="font-cabinet text-xs text-[#4A5D4E] leading-relaxed">
                        {proto.shortSummary}
                      </p>

                      <div className="mt-1 flex flex-col gap-2 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#1A3629]/15">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A3629]/60">
                          Included Routine Steps:
                        </span>
                        <div className="flex flex-col gap-1.5">
                          {proto.habits.map((h, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs font-mono text-[#1A3629]">
                              <span className="text-[#10B981] font-bold">✓</span>
                              <span>{h.title}</span>
                              <span className="text-[10px] text-[#4A5D4E] ml-auto">({h.hint})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#1A3629]/15 flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#1A3629]/70">
                        {proto.habits.length} Actions · Steady Focus
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleToggleProtocol(proto, e)}
                        className={`px-4 py-2 rounded-full font-cabinet font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                          isActive
                            ? 'bg-[#1A3629] text-[#FFFDF9]'
                            : 'bg-[#FAF8F5] border border-[#1A3629]/15 text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9]'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Active in Cockpit</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Cockpit</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}

        {/* Floating AI Assistant Action */}
        <div className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={() => {
              retroAudio.playInspectConfirm();
              window.dispatchEvent(new CustomEvent('open-ai-coach'));
            }}
            className="px-4 py-2.5 rounded-full border border-[#1A3629]/15 bg-[#1A3629] hover:bg-[#2C4A3B] text-[#FFFDF9] font-cabinet font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center gap-2 select-none"
          >
            <Bot className="w-4 h-4 text-[#C9A84C]" />
            <span>Ask StoveSage AI</span>
          </button>
        </div>

        {/* Recipe Detail Modal — Spacious Editorial Culinary Spread */}
        {selectedRecipe && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1A3629]/40 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setSelectedRecipe(null)}
          >
            <div 
              className="w-full max-w-5xl bg-[#FFFDF9] border-2 border-[#1A3629] rounded-3xl shadow-[8px_8px_0px_#1A3629] flex flex-col max-h-[92vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A3629]/12 bg-[#FAF8F5]/80 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1A3629] bg-[#FFFDF9] px-3 py-1 rounded-full border border-[#1A3629]/15 shadow-2xs">
                    {selectedRecipe.category}
                  </span>
                  <span className="font-mono text-xs text-[#4A5D4E]">·</span>
                  <span className="font-mono text-xs font-semibold text-[#4A5D4E]">
                    {selectedRecipe.prepTimeMinutes}m prep
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedRecipe(null)}
                  className="w-8 h-8 rounded-full border border-[#1A3629]/20 bg-[#FFFDF9] text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 2-Column Culinary Magazine Spread */}
              <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1 divide-y lg:divide-y-0 lg:divide-x divide-[#1A3629]/12">
                
                {/* LEFT COLUMN: Food Diorama, Macros & Primary CTA */}
                <div className="lg:col-span-5 p-6 sm:p-7 flex flex-col gap-4 bg-[#FAF8F5]/50 overflow-y-auto">
                  
                  {/* Food Plate Showcase */}
                  <div className="w-full aspect-square max-w-[260px] mx-auto relative flex items-center justify-center bg-[#FAF8F5] rounded-2xl border border-[#1A3629]/15 p-4 shadow-[inset_0_2px_8px_rgba(26,54,41,0.06)]">
                    <PixelSteam active={true} intensity={0.9} />
                    <img
                      src={selectedRecipe.portionImages?.[portionMultiplier] || selectedRecipe.image}
                      alt={`${selectedRecipe.name} (${portionMultiplier}x portion)`}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src.includes('.webp')) {
                          target.src = target.src.replace('.webp', '.png');
                        } else if (!target.src.endsWith('generic-plate.webp')) {
                          target.src = '/assets/food/generic-plate.webp';
                        }
                      }}
                      className="w-full h-full object-contain [image-rendering:pixelated] drop-shadow-[8px_8px_0px_rgba(26,54,41,0.16)] select-none pointer-events-none"
                    />
                  </div>

                  {/* Portion Multiplier Pills */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFFDF9] border border-[#1A3629]/12">
                    <span className="font-mono text-xs font-bold text-[#1A3629]">
                      Portion:
                    </span>
                    <div className="inline-flex items-center gap-1 p-0.5 rounded-lg border border-[#1A3629]/20 bg-[#FAF8F5]">
                      {PORTION_MULTIPLIERS.map((mult) => (
                        <button
                          key={mult}
                          type="button"
                          onClick={() => {
                            retroAudio.playBlip();
                            setPortionMultiplier(mult);
                          }}
                          className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                            portionMultiplier === mult
                              ? 'bg-[#1A3629] text-[#FFFDF9] shadow-2xs'
                              : 'text-[#1A3629]/70 hover:text-[#1A3629]'
                          }`}
                        >
                          {mult}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nutrition Breakdown Component */}
                  <RecipeNutritionDetail
                    recipe={selectedRecipe}
                    portionMultiplier={portionMultiplier}
                  />

                  {/* Direct Log CTA */}
                  <div className="flex items-center gap-2 pt-1">
                    {selectedRecipe.isCustom && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete custom recipe "${selectedRecipe.name}"?`)) {
                            deleteCustomRecipe(selectedRecipe.id);
                            setSelectedRecipe(null);
                            setToastMessage(`Deleted "${selectedRecipe.name}"`);
                            setTimeout(() => setToastMessage(null), 3000);
                          }
                        }}
                        className="p-3 rounded-xl border border-red-300 bg-red-50 text-red-700 font-cabinet font-bold text-xs hover:bg-red-100 transition-all cursor-pointer shrink-0"
                        title="Delete custom recipe"
                      >
                        Delete
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleLogRecipe(selectedRecipe, portionMultiplier, e)}
                      className="flex-1 py-3 px-5 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs sm:text-sm hover:bg-[#2C4A3B] shadow-[2px_2px_0px_#3A6B52] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>+ Log Meal to Today</span>
                      <span className="font-mono text-xs opacity-80">
                        (+{Math.round(selectedRecipe.protein * portionMultiplier)}g PRO)
                      </span>
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN: Recipe Header, Ingredients & Preparation */}
                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col gap-6 bg-[#FFFDF9] overflow-y-auto">
                  
                  {/* Title & Description */}
                  <div className="flex flex-col gap-2">
                    <h3 className="font-cabinet font-extrabold text-2xl sm:text-3xl text-[#1A3629] tracking-tight leading-snug">
                      {selectedRecipe.name}
                    </h3>
                    <p className="font-cabinet text-sm text-[#4A5D4E] leading-relaxed">
                      {selectedRecipe.subtitle || selectedRecipe.description}
                    </p>
                  </div>

                  {/* Ingredients Section */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#1A3629]/15">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1A3629]">
                        Ingredients ({selectedRecipe.ingredients.length})
                      </span>
                      <span className="font-mono text-[11px] text-[#4A5D4E]">
                        Scaled to {portionMultiplier}x
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedRecipe.ingredients.map((ing, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#1A3629]/10 text-xs font-mono text-[#1A3629]"
                        >
                          <span className="truncate pr-2 font-medium">{ing.item}</span>
                          <span className="font-bold shrink-0 text-[#065F46] bg-[#FFFDF9] px-2 py-0.5 rounded border border-[#1A3629]/10">
                            {ing.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preparation Steps Section */}
                  <div className="flex flex-col gap-3 pt-1">
                    <div className="pb-1.5 border-b border-[#1A3629]/15">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1A3629]">
                        Preparation Steps
                      </span>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      {selectedRecipe.instructions.map((step, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF8F5]/60 border border-[#1A3629]/8">
                          <span className="w-6 h-6 rounded-lg bg-[#1A3629] text-[#FFFDF9] font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <p className="font-cabinet text-xs sm:text-sm text-[#1A3629] leading-relaxed pt-0.5">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scan Recipe Modal */}
        <ScanRecipeModal
          isOpen={isScanModalOpen}
          onClose={() => setIsScanModalOpen(false)}
          onSaveRecipe={(recipe) => {
            addCustomRecipe(recipe);
            setIsScanModalOpen(false);
            setToastMessage(`Saved recipe "${recipe.name}"!`);
            setTimeout(() => setToastMessage(null), 3000);
          }}
        />

        {/* Custom Recipe Modal */}
        <CustomRecipeModal
          isOpen={isCustomModalOpen}
          onClose={() => setIsCustomModalOpen(false)}
          onSaveRecipe={(recipe) => {
            addCustomRecipe(recipe);
            setIsCustomModalOpen(false);
            setToastMessage(`Created custom recipe "${recipe.name}"!`);
            setTimeout(() => setToastMessage(null), 3000);
          }}
        />
      </main>
    </div>
  );
}

export default function PlaybookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F0EA] flex items-center justify-center font-mono text-xs text-[#1A3629]">
          Loading Playbook...
        </div>
      }
    >
      <PlaybookContent />
    </Suspense>
  );
}
