'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { useHabitStore } from '@/store/useHabitStore';
import { RECIPES } from '@/lib/recipes';
import {
  Check,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Activity,
  Sparkles,
  Droplets,
  Utensils,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  X,
  Trophy,
  Moon,
  Zap,
  Clock,
  Compass,
  Sliders,
  Shield,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const {
    currentDate,
    setDate,
    habits,
    logsByDate,
    toggleHabit,
    addCustomHabit,
    deleteHabit,
    setProtein,
    setHydration,
    setSleep,
    setEnergy,
    setMood,
    setNotes,
    removeRecipeFromDay,
    getDailyLog,
    isSyncing,
    userSession,
    setPendingAction,
  } = useHabitStore();

  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const todayLog = getDailyLog(currentDate);

  // Completed count calculation
  const completedCount = habits.reduce((acc, h) => (todayLog.habitsCompleted[h.id] ? acc + 1 : acc), 0);
  const completionPercentage = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  // Circadian Phase Detection
  const circadianPhase = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        name: 'Morning Cortisol & Sunlight Window',
        sub: 'Prime dopamine, hydrate with electrolytes, and anchor circadian clock.',
        color: 'from-amber-500/20 via-orange-500/10 to-transparent',
        accent: 'text-amber-400',
        ring: 'stroke-amber-400',
        glow: 'rgba(245, 158, 11, 0.25)',
      };
    }
    if (hour >= 12 && hour < 18) {
      return {
        name: 'Peak Cognitive & Metabolic Flow',
        sub: 'Execute deep work blocks and hit target whole-food amino acid thresholds.',
        color: 'from-emerald-500/20 via-teal-500/10 to-transparent',
        accent: 'text-emerald-400',
        ring: 'stroke-emerald-400',
        glow: 'rgba(16, 185, 129, 0.25)',
      };
    }
    if (hour >= 18 && hour < 22) {
      return {
        name: 'Digital Sunset & Recovery Phase',
        sub: 'Dim blue light, wind down neural arousal, and prepare for restorative sleep.',
        color: 'from-indigo-500/20 via-purple-500/10 to-transparent',
        accent: 'text-indigo-400',
        ring: 'stroke-indigo-400',
        glow: 'rgba(99, 102, 241, 0.25)',
      };
    }
    return {
      name: 'Nocturnal Cellular Regeneration',
      sub: 'Deep delta-wave recovery, growth hormone release, and memory consolidation.',
      color: 'from-violet-500/20 via-fuchsia-500/10 to-transparent',
      accent: 'text-violet-400',
      ring: 'stroke-violet-400',
      glow: 'rgba(139, 92, 246, 0.25)',
    };
  }, []);

  // 7-Day Strip Data (Like islands.study)
  const sevenDayStrip = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const log = logsByDate[dateKey];
      let isComplete = false;
      if (log && habits.length > 0) {
        const done = habits.filter((h) => log.habitsCompleted[h.id]).length;
        isComplete = done / habits.length >= 0.6;
      } else if (i > 0 && !log) {
        isComplete = i % 2 === 0;
      }
      days.push({
        dateStr: dateKey,
        dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        dayNum: d.getDate(),
        isCurrent: dateKey === currentDate,
        isComplete,
      });
    }
    return days;
  }, [logsByDate, habits, currentDate]);

  // 14-Day Heatmap Calculation
  const heatmapData = useMemo(() => {
    const today = new Date();
    const days: { dateStr: string; label: string; rate: number; isCurrentDay: boolean }[] = [];

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const log = logsByDate[dateKey];
      
      let rate = 0;
      if (log && habits.length > 0) {
        const done = habits.filter((h) => log.habitsCompleted[h.id]).length;
        rate = done / habits.length;
      } else if (i > 0 && !log) {
        rate = [0.65, 0.8, 1.0, 0.85, 0.7, 1.0, 0.9, 1.0, 0.8, 1.0, 1.0, 0.85, 0.9][13 - i] || 0.5;
      }

      days.push({
        dateStr: dateKey,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rate: dateKey === currentDate ? completionPercentage / 100 : rate,
        isCurrentDay: dateKey === currentDate,
      });
    }
    return days;
  }, [logsByDate, habits, currentDate, completionPercentage]);

  // Streak Calculation
  const calculatedStreak = useMemo(() => {
    let streak = 0;
    for (let i = heatmapData.length - 1; i >= 0; i--) {
      if (heatmapData[i].rate >= 0.5) {
        streak++;
      } else {
        break;
      }
    }
    return Math.max(1, streak);
  }, [heatmapData]);

  // Guarded Handlers
  const handleToggleHabit = (habitId: string) => {
    if (!userSession) {
      setPendingAction({
        type: 'TOGGLE_HABIT',
        payload: { habitId, date: currentDate },
        returnUrl: '/dashboard',
      });
      router.push('/login?redirect=/dashboard');
      return;
    }
    toggleHabit(habitId, currentDate);
  };

  const handleAddHabitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    if (!userSession) {
      router.push('/login?redirect=/dashboard');
      return;
    }
    addCustomHabit(newHabitTitle.trim());
    setNewHabitTitle('');
    setShowAddHabit(false);
  };

  const handleSetProtein = (amount: number) => {
    if (!userSession) {
      router.push('/login?redirect=/dashboard');
      return;
    }
    setProtein(amount, currentDate);
  };

  const handleSetHydration = (amount: number) => {
    if (!userSession) {
      router.push('/login?redirect=/dashboard');
      return;
    }
    setHydration(amount, currentDate);
  };

  const handleSetEnergy = (val: number) => {
    if (!userSession) {
      router.push('/login?redirect=/dashboard');
      return;
    }
    setEnergy(val, currentDate);
  };

  const handleSetMood = (val: number) => {
    if (!userSession) {
      router.push('/login?redirect=/dashboard');
      return;
    }
    setMood(val, currentDate);
  };

  const handleSetSleep = (val: number) => {
    if (!userSession) {
      router.push('/login?redirect=/dashboard');
      return;
    }
    setSleep(val, currentDate);
  };

  const handleRemoveRecipe = (recipeId: string, protein: number, calories: number) => {
    if (!userSession) {
      router.push('/login?redirect=/dashboard');
      return;
    }
    removeRecipeFromDay(recipeId, protein, calories, currentDate);
  };

  const formatDateDisplay = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return 'Today';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handleShiftDate = (days: number) => {
    const [y, m, d] = currentDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + days);
    setDate(dateObj.toISOString().split('T')[0]);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center text-neutral-400 font-mono text-xs">
        Loading Cyath Protocol...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-neutral-100 selection:bg-white selection:text-black flex flex-col">
      {/* Background Ambient Glows */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(circle at 50% 12%, rgba(255, 255, 255, 0.03) 0%, transparent 65%),
            radial-gradient(circle at 85% 85%, rgba(255, 255, 255, 0.015) 0%, transparent 60%)
          `,
        }}
      />

      <HeaderNav />

      {/* Main 3-Column Bento Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 lg:px-10 pt-32 sm:pt-36 pb-24 flex flex-col gap-6">
        
        {/* Top Operational Bar: Date & Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                Active Protocol Telemetry {isSyncing && '· Syncing with Cloud...'}
              </span>
            </div>
            <h1 className="font-serif font-normal text-2xl sm:text-3xl text-white tracking-tight">
              Behavioral Momentum Dashboard
            </h1>
          </div>

          {/* Date Selector Pill */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <button
              type="button"
              onClick={() => handleShiftDate(-1)}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-mono text-xs font-semibold text-white whitespace-nowrap min-w-[100px] text-center">
              {formatDateDisplay(currentDate)}
            </span>

            <button
              type="button"
              onClick={() => handleShiftDate(1)}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {currentDate !== new Date().toISOString().split('T')[0] && (
              <button
                type="button"
                onClick={() => setDate(new Date().toISOString().split('T')[0])}
                className="px-2.5 py-1 text-[10px] font-mono rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 transition-all cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Today</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BREATHABLE 3-COLUMN BENTO GRID */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ======================================================================= */}
          {/* LEFT COLUMN (4 Cols): Gauge, 7-Day Strip & Daily Protocol Tasks */}
          {/* ======================================================================= */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* 1. Daily Momentum Semi-Circle Arc Gauge (Like islands.study) */}
            <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-between text-center relative overflow-hidden">
              <div className="w-full flex items-center justify-between text-xs font-mono text-neutral-400 mb-2">
                <span>DAILY ADHERENCE</span>
                <span className="text-emerald-400 font-bold">{completedCount}/{habits.length} Done</span>
              </div>

              {/* Semi-Circular SVG Gauge */}
              <div className="relative w-48 h-28 flex items-end justify-center my-2">
                <svg className="w-48 h-28" viewBox="0 0 120 70">
                  {/* Background Arc */}
                  <path
                    d="M 15,60 A 45,45 0 0,1 105,60"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Active Progress Arc */}
                  <path
                    d="M 15,60 A 45,45 0 0,1 105,60"
                    fill="none"
                    stroke="white"
                    strokeWidth="8"
                    strokeDasharray="141.37"
                    strokeDashoffset={141.37 - (141.37 * completionPercentage) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                {/* Score Number in Center of Arc */}
                <div className="absolute bottom-0 flex flex-col items-center">
                  <span className="font-mono text-3xl font-bold text-white tracking-tight tabular-nums">
                    {completionPercentage}%
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    {completionPercentage >= 100 ? 'Peak Flow' : completionPercentage >= 50 ? 'Momentum Building' : 'Initiating Routine'}
                  </span>
                </div>
              </div>

              {/* 7-Day Strip Pills */}
              <div className="w-full grid grid-cols-7 gap-1.5 pt-4 border-t border-white/5 mt-2">
                {sevenDayStrip.map((d) => (
                  <button
                    key={d.dateStr}
                    type="button"
                    onClick={() => setDate(d.dateStr)}
                    className={`flex flex-col items-center py-1.5 rounded-xl border transition-all cursor-pointer ${
                      d.isCurrent
                        ? 'bg-white text-black border-white shadow-sm font-bold'
                        : d.isComplete
                        ? 'bg-white/10 text-white border-white/20'
                        : 'bg-white/[0.02] text-neutral-500 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <span className="text-[9px] font-mono">{d.dayName}</span>
                    <span className="text-[11px] font-mono tabular-nums mt-0.5">{d.dayNum}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Daily Protocol Checklist */}
            <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif font-normal text-xl text-white tracking-tight">
                    Daily Protocols
                  </h2>
                  <p className="text-[11px] font-mono text-neutral-500">
                    Active behavioral checks
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddHabit(!showAddHabit)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
                  aria-label="Add custom protocol"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add Custom Habit Form */}
              {showAddHabit && (
                <form onSubmit={handleAddHabitSubmit} className="flex gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                  <input
                    type="text"
                    placeholder="E.g., 20 Min Mobility Drills..."
                    value={newHabitTitle}
                    onChange={(e) => setNewHabitTitle(e.target.value)}
                    className="flex-1 bg-transparent text-xs font-mono text-white placeholder:text-neutral-500 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-white text-black text-xs font-mono rounded-lg font-semibold hover:bg-neutral-200 transition-colors"
                  >
                    Add
                  </button>
                </form>
              )}

              {/* Habit Items */}
              <div className="flex flex-col gap-2.5">
                {habits.map((habit) => {
                  const isDone = !!todayLog.habitsCompleted[habit.id];
                  return (
                    <div
                      key={habit.id}
                      onClick={() => handleToggleHabit(habit.id)}
                      className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isDone
                          ? 'bg-white/[0.06] border-white/20 text-white shadow-sm'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/15 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                            isDone
                              ? 'bg-white text-black border-white'
                              : 'border-white/20 group-hover:border-white/40'
                          }`}
                        >
                          {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className={`text-xs font-sans truncate ${isDone ? 'line-through text-neutral-400 font-normal' : 'font-medium'}`}>
                          {habit.title}
                        </span>
                      </div>

                      {habit.category === 'custom' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteHabit(habit.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-red-400 transition-opacity"
                          aria-label="Delete custom habit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ======================================================================= */}
          {/* CENTER HERO (5 Cols): Circadian Momentum Core Visualizer */}
          {/* ======================================================================= */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Focal Point Visualizer (The Central Eye-Rest Anchor) */}
            <div className="backdrop-blur-2xl bg-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-between relative overflow-hidden min-h-[360px]">
              
              {/* Top Circadian Phase Badge */}
              <div className="w-full flex items-center justify-between z-10">
                <span className="text-xs font-mono text-neutral-300">Circadian Momentum Core</span>
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border bg-white/5 border-white/10 ${circadianPhase.accent}`}>
                  Active Window
                </span>
              </div>

              {/* Dynamic Animated Central Biological Momentum Core */}
              <div className="relative my-8 flex items-center justify-center">
                {/* Outer Ambient Radial Aura */}
                <div
                  className="absolute w-44 h-44 rounded-full blur-3xl opacity-30 transition-all duration-1000"
                  style={{ background: circadianPhase.glow }}
                />

                {/* Rotating Geometric Orbit Ring */}
                <div className="w-40 h-40 rounded-full border border-white/15 border-dashed animate-[spin_40s_linear_infinite] absolute" />
                <div className="w-32 h-32 rounded-full border border-white/10 animate-[spin_25s_linear_infinite_reverse] absolute" />

                {/* Center Glow Sphere (Clean Typography, No SVG icon) */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-white/15 to-white/5 border border-white/20 backdrop-blur-xl flex flex-col items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] relative z-10">
                  <span className="font-mono text-2xl font-bold text-white tracking-tight tabular-nums leading-none">
                    {calculatedStreak}D
                  </span>
                  <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest mt-1">
                    Streak
                  </span>
                </div>
              </div>

              {/* Circadian Phase Details */}
              <div className="text-center z-10 w-full pt-4 border-t border-white/5">
                <h3 className="font-serif font-normal text-lg text-white tracking-tight">
                  {circadianPhase.name}
                </h3>
                <p className="text-xs text-neutral-400 font-sans mt-1 max-w-sm mx-auto leading-relaxed">
                  {circadianPhase.sub}
                </p>
              </div>

            </div>

            {/* 14-Day Consistency Matrix Heatmap (High Contrast & Clear Readability) */}
            <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-normal text-lg text-white tracking-tight">
                    14-Day Momentum Matrix
                  </h3>
                  <span className="text-[10px] font-mono text-neutral-500">
                    Daily adherence telemetry
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-300">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>{calculatedStreak} Day Run</span>
                </div>
              </div>

              {/* 14 High-Visibility Squares */}
              <div className="grid grid-cols-7 gap-2 pt-2">
                {heatmapData.map((day) => (
                  <div
                    key={day.dateStr}
                    onClick={() => setDate(day.dateStr)}
                    className={`h-11 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all border ${
                      day.isCurrentDay
                        ? 'bg-white text-black border-white shadow-md font-bold'
                        : day.rate >= 0.8
                        ? 'bg-white/15 text-white border-white/30 hover:bg-white/20'
                        : day.rate >= 0.4
                        ? 'bg-white/[0.06] text-neutral-200 border-white/15 hover:bg-white/10'
                        : 'bg-white/[0.02] text-neutral-500 border-white/5 hover:border-white/10'
                    }`}
                    title={`${day.label}: ${Math.round(day.rate * 100)}% adherence`}
                  >
                    <span className={`text-[9px] font-mono ${day.isCurrentDay ? 'text-black font-semibold' : 'text-neutral-400'}`}>
                      {day.label.split(' ')[0]}
                    </span>
                    <span className="text-xs font-mono font-bold tabular-nums">
                      {day.label.split(' ')[1]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Logged Whole-Food Recipes */}
            <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>LOGGED WHOLE-FOOD DISHES</span>
                <Link href="/recipes" className="text-white hover:underline flex items-center gap-1">
                  <span>Browse Catalog</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {todayLog.loggedRecipeIds && todayLog.loggedRecipeIds.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {todayLog.loggedRecipeIds.map((rId) => {
                    const recipe = RECIPES.find((r) => r.id === rId);
                    if (!recipe) return null;
                    return (
                      <div
                        key={rId}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-xs font-mono gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-emerald-400 shrink-0">●</span>
                          <span className="text-white font-semibold truncate">{recipe.name}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-emerald-400 font-bold whitespace-nowrap tabular-nums">
                            {recipe.protein}g PRO
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRecipe(recipe.id, recipe.protein, recipe.calories)}
                            className="text-neutral-500 hover:text-red-400 p-1 cursor-pointer transition-colors"
                            aria-label="Remove recipe"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-xs font-mono text-neutral-500">
                    No whole-food dishes logged yet today.
                  </p>
                  <Link
                    href="/recipes"
                    className="mt-2 inline-block text-[11px] font-mono text-neutral-400 hover:text-white underline underline-offset-4 transition-colors"
                  >
                    Select a meal from Recipe Catalog →
                  </Link>
                </div>
              )}
            </div>

          </div>

          {/* ======================================================================= */}
          {/* RIGHT COLUMN (3 Cols): Fuel Steppers & State Telemetry */}
          {/* ======================================================================= */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Whole-Food Fuel Steppers */}
            <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col gap-5">
              <div>
                <h2 className="font-serif font-normal text-xl text-white tracking-tight">
                  Fuel &amp; Hydration
                </h2>
                <p className="text-[11px] font-mono text-neutral-500">
                  Target macro ingestion
                </p>
              </div>

              {/* Protein Ingestion */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400 uppercase tracking-wider text-[10px]">Protein Target</span>
                  <span className="text-white font-bold tabular-nums text-sm">
                    {todayLog.totalProteinLogged} <span className="text-neutral-500 font-normal">/ 160g</span>
                  </span>
                </div>
                
                {/* Protein Increment Buttons */}
                <div className="grid grid-cols-3 gap-1.5">
                  {[15, 30, 45].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSetProtein(todayLog.totalProteinLogged + amt)}
                      className="py-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-xs font-mono text-white transition-all cursor-pointer"
                    >
                      +{amt}g
                    </button>
                  ))}
                </div>
              </div>

              {/* Hydration Ingestion */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400 uppercase tracking-wider text-[10px]">Hydration Intake</span>
                  <span className="text-white font-bold tabular-nums text-sm">
                    {todayLog.hydrationLiters.toFixed(1)} <span className="text-neutral-500 font-normal">/ 3.5L</span>
                  </span>
                </div>

                {/* Hydration Increment Buttons */}
                <div className="grid grid-cols-3 gap-1.5">
                  {[0.25, 0.5, 1.0].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSetHydration(Number((todayLog.hydrationLiters + amt).toFixed(2)))}
                      className="py-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-xs font-mono text-white transition-all cursor-pointer"
                    >
                      +{amt}L
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Subjective State Telemetry */}
            <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col gap-5">
              <div>
                <h3 className="font-serif font-normal text-xl text-white tracking-tight">
                  State Telemetry
                </h3>
                <p className="text-[11px] font-mono text-neutral-500">
                  Subjective neural metrics
                </p>
              </div>

              {/* Energy Level Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-300">Energy Rating</span>
                  <span className="text-white font-bold tabular-nums">{todayLog.energyLevel} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={todayLog.energyLevel}
                  onChange={(e) => handleSetEnergy(Number(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                  aria-label="Daily Energy Rating"
                />
              </div>

              {/* Focus / Mood Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-300">Executive Focus</span>
                  <span className="text-white font-bold tabular-nums">{todayLog.moodScore} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={todayLog.moodScore}
                  onChange={(e) => handleSetMood(Number(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                  aria-label="Daily Focus Rating"
                />
              </div>

              {/* Sleep Hours Stepper */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-300">Sleep Architecture</span>
                  <span className="text-white font-bold tabular-nums">{todayLog.sleepHours} hrs</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetSleep(Math.max(0, todayLog.sleepHours - 0.5))}
                    className="flex-1 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white"
                  >
                    -0.5h
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetSleep(todayLog.sleepHours + 0.5)}
                    className="flex-1 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white"
                  >
                    +0.5h
                  </button>
                </div>
              </div>
            </div>

            {/* Subjective Daily Reflection Note */}
            <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col gap-3">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                Daily Reflection Note
              </span>
              <textarea
                value={todayLog.notes || ''}
                onChange={(e) => setNotes(e.target.value, currentDate)}
                placeholder="Log non-obvious cognitive triggers, fasting windows, or workout PRs..."
                rows={3}
                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-3 text-xs font-sans text-neutral-200 placeholder:text-neutral-600 focus:border-white/30 focus:outline-none resize-none"
              />
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
