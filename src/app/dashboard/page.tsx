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
  Flame,
  ArrowRight,
  X,
  Calendar,
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
  const [historyView, setHistoryView] = useState<'heatmap' | 'timeline'>('heatmap');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const todayLog = getDailyLog(currentDate);

  // Completed count calculation
  const completedCount = habits.reduce((acc, h) => (todayLog.habitsCompleted[h.id] ? acc + 1 : acc), 0);
  const completionPercentage = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  // Humanized Daily Routine Window
  const routineWindow = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        title: 'Morning Energy Routine',
        description: 'Get natural sunlight, drink electrolytes, and establish your daily focus baseline.',
        badge: 'Morning Phase',
      };
    }
    if (hour >= 12 && hour < 18) {
      return {
        title: 'Deep Work & Peak Focus',
        description: 'Execute key focus blocks, stay hydrated, and hit your daily protein targets.',
        badge: 'Afternoon Phase',
      };
    }
    if (hour >= 18 && hour < 22) {
      return {
        title: 'Evening Wind-Down',
        description: 'Dim blue lighting, lower screen exposure, and prepare for restorative sleep.',
        badge: 'Evening Phase',
      };
    }
    return {
      title: 'Rest & Deep Recovery',
      description: 'Restorative sleep for physical muscle repair and cognitive renewal.',
      badge: 'Night Phase',
    };
  }, []);

  // 28-Day Behavioral Action Heatmap Matrix
  const heatmapDays = useMemo(() => {
    const today = new Date();
    const days = [];
    const totalDays = 28;

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const log = logsByDate[dateKey];

      let habitsDone = 0;
      let mealsDone = 0;
      let hydrationDone = 0;
      let reflectionDone = 0;

      if (log) {
        if (log.habitsCompleted) {
          habitsDone = Object.values(log.habitsCompleted).filter(Boolean).length;
        }
        if (log.loggedRecipeIds && log.loggedRecipeIds.length > 0) {
          mealsDone = log.loggedRecipeIds.length;
        } else if ((log.totalProteinLogged || 0) > 0) {
          mealsDone = 1;
        }
        if ((log.hydrationLiters || 0) > 0) {
          hydrationDone = 1;
        }
        if ((log.energyLevel || 0) > 0 || (log.moodScore || 0) > 0 || (log.sleepHours || 0) > 0) {
          reflectionDone = 1;
        }
      } else if (i > 0 && !userSession) {
        const seed = [4, 6, 5, 8, 3, 7, 6, 9, 5, 4, 7, 6, 8, 5, 6, 7, 8, 4, 9, 6, 5, 7, 8, 6, 7, 5, 8, 6][i % 28] || 4;
        habitsDone = Math.min(habits.length, Math.max(1, Math.round(seed * 0.4)));
        mealsDone = seed > 5 ? 2 : 1;
        hydrationDone = 1;
        reflectionDone = 1;
      }

      if (dateKey === currentDate) {
        habitsDone = completedCount;
        mealsDone = (todayLog.loggedRecipeIds || []).length || (todayLog.totalProteinLogged > 0 ? 1 : 0);
        hydrationDone = (todayLog.hydrationLiters || 0) > 0 ? 1 : 0;
        reflectionDone = (todayLog.energyLevel || 0) > 0 ? 1 : 0;
      }

      const totalActions = habitsDone + mealsDone + hydrationDone + reflectionDone;

      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (totalActions >= 7) level = 4;
      else if (totalActions >= 5) level = 3;
      else if (totalActions >= 3) level = 2;
      else if (totalActions >= 1) level = 1;

      days.push({
        dateStr: dateKey,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        totalActions,
        habitsDone,
        mealsDone,
        hydrationDone,
        reflectionDone,
        level,
        isToday: dateKey === new Date().toISOString().split('T')[0],
        isSelected: dateKey === currentDate,
      });
    }
    return days;
  }, [logsByDate, habits, currentDate, completedCount, todayLog, userSession]);

  const totalHeatmapActions = useMemo(() => {
    return heatmapDays.reduce((sum, d) => sum + d.totalActions, 0);
  }, [heatmapDays]);

  const avgDailyActions = (totalHeatmapActions / (heatmapDays.length || 1)).toFixed(1);

  // Unified 14-Day Timeline History
  const timelineDays = useMemo(() => {
    const today = new Date();
    const days = [];

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const log = logsByDate[dateKey];
      
      let rate = 0;
      let doneCount = 0;
      if (log && habits.length > 0) {
        doneCount = habits.filter((h) => log.habitsCompleted[h.id]).length;
        rate = doneCount / habits.length;
      } else if (i > 0 && !log) {
        rate = [0.65, 0.8, 1.0, 0.85, 0.7, 1.0, 0.9, 1.0, 0.8, 1.0, 1.0, 0.85, 0.9][13 - i] || 0.5;
        doneCount = Math.round(rate * habits.length);
      }

      if (dateKey === currentDate) {
        rate = completionPercentage / 100;
        doneCount = completedCount;
      }

      days.push({
        dateStr: dateKey,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        rate,
        doneCount,
        isToday: dateKey === new Date().toISOString().split('T')[0],
        isSelected: dateKey === currentDate,
      });
    }
    return days;
  }, [logsByDate, habits, currentDate, completionPercentage, completedCount]);

  // Streak Calculation
  const calculatedStreak = useMemo(() => {
    let streak = 0;
    for (let i = timelineDays.length - 1; i >= 0; i--) {
      if (timelineDays[i].rate >= 0.5) {
        streak++;
      } else {
        break;
      }
    }
    return Math.max(1, streak);
  }, [timelineDays]);

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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center text-slate-400 font-mono text-xs">
        Loading Daily Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-neutral-100 selection:bg-white selection:text-black flex flex-col">
      {/* Subtle Monochrome Ambient Glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.025) 0%, transparent 65%),
            radial-gradient(circle at 85% 85%, rgba(255, 255, 255, 0.015) 0%, transparent 60%)
          `,
        }}
      />

      <HeaderNav />

      {/* Main Container with Clean Header Padding */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 lg:px-10 pt-36 sm:pt-40 pb-24 flex flex-col gap-6">
        
        {/* ========================================================================= */}
        {/* TOP BAR: Dual-Typography Page Header & Monospace Eyebrow Tag */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between gap-4 pb-1">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                DASHBOARD / DAILY OVERVIEW {isSyncing && '· SYNCING...'}
              </span>
            </div>
            <h1 className="font-serif font-medium text-3xl md:text-4xl text-white tracking-tight">
              Daily Performance &amp; Habits
            </h1>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. BEHAVIORAL ACTION HEATMAP & MOMENTUM MATRIX */}
        {/* ========================================================================= */}
        <div className="backdrop-blur-xl bg-white/[0.025] border border-white/10 rounded-2xl p-6 shadow-xl relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                  Behavioral Telemetry
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-white/[0.04] border border-white/10 px-2 py-0.5 rounded-md">
                  28-Day Action Density
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <h2 className="font-cabinet font-semibold text-lg text-slate-100 tracking-tight">
                  Activity Heatmap Matrix
                </h2>
              </div>
            </div>

            {/* View Switcher & Streak Badges */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setHistoryView('heatmap')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    historyView === 'heatmap'
                      ? 'bg-white text-black font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Heatmap Matrix
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryView('timeline')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    historyView === 'timeline'
                      ? 'bg-white text-black font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  14-Day Strip
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono text-white font-medium bg-white/[0.04] border border-white/10 px-3 py-1.5 rounded-xl">
                <Flame className="w-3.5 h-3.5 text-white" />
                <span>{calculatedStreak}D STREAK</span>
              </div>
            </div>
          </div>

          {/* VIEW A: 28-Day Activity Heatmap Grid */}
          {historyView === 'heatmap' ? (
            <div className="space-y-4">
              {/* Heatmap Matrix Grid (4 weeks x 7 days) */}
              <div className="grid grid-cols-7 sm:grid-cols-14 lg:grid-cols-28 gap-2">
                {heatmapDays.map((day) => {
                  const isSelected = day.isSelected;
                  
                  // Strict monochrome level fills
                  const levelClasses = {
                    0: 'bg-white/[0.03] border-white/5 text-slate-500 hover:border-white/20',
                    1: 'bg-white/20 border-white/25 text-slate-300 hover:bg-white/30',
                    2: 'bg-white/45 border-white/50 text-black font-semibold hover:bg-white/55',
                    3: 'bg-white/75 border-white/80 text-black font-bold hover:bg-white/85',
                    4: 'bg-white border-white text-black font-bold shadow-[0_0_12px_rgba(255,255,255,0.4)]',
                  }[day.level];

                  return (
                    <div
                      key={day.dateStr}
                      className="relative group"
                    >
                      <button
                        type="button"
                        onClick={() => setDate(day.dateStr)}
                        className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer border ${levelClasses} ${
                          isSelected
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-105 shadow-xl font-extrabold'
                            : 'hover:scale-105'
                        }`}
                      >
                        <span className="text-[10px] font-mono tabular-nums leading-none">
                          {day.dayNum}
                        </span>
                        <span className="text-[8px] font-mono mt-0.5 opacity-80 uppercase leading-none">
                          {day.dayName.charAt(0)}
                        </span>
                      </button>

                      {/* Floating Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                        <div className="bg-[#121212] border border-white/20 rounded-xl px-3 py-2 text-xs font-mono shadow-2xl backdrop-blur-xl flex flex-col gap-0.5">
                          <div className="text-white font-bold flex items-center gap-1.5">
                            <span>{day.monthName} {day.dayNum}</span>
                            <span className="text-slate-400 font-normal">·</span>
                            <span className="text-white">{day.totalActions} actions</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans">
                            {day.habitsDone} habits · {day.mealsDone} meals {day.hydrationDone ? '· hydration' : ''} {day.reflectionDone ? '· reflection' : ''}
                          </div>
                        </div>
                        <div className="w-2 h-2 bg-[#121212] border-r border-b border-white/20 transform rotate-45 -mt-1" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Heatmap Footer: Activity Density Scale & Aggregate Telemetry */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-3">
                  <span>Total Actions: <strong className="text-white">{totalHeatmapActions}</strong></span>
                  <span>·</span>
                  <span>Daily Velocity: <strong className="text-white">{avgDailyActions}/day</strong></span>
                </div>

                {/* Strict Monochrome Activity Scale */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase text-slate-500">Less</span>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-md bg-white/[0.03] border border-white/5" title="0 actions" />
                    <span className="w-3 h-3 rounded-md bg-white/20 border border-white/25" title="1-2 actions" />
                    <span className="w-3 h-3 rounded-md bg-white/45 border border-white/50" title="3-4 actions" />
                    <span className="w-3 h-3 rounded-md bg-white/75 border border-white/80" title="5-6 actions" />
                    <span className="w-3 h-3 rounded-md bg-white border border-white" title="7+ actions" />
                  </div>
                  <span className="text-[10px] uppercase text-slate-500">More</span>
                </div>
              </div>
            </div>
          ) : (
            /* VIEW B: Interactive 14-Day Timeline Buttons */
            <div className="grid grid-cols-7 sm:grid-cols-14 gap-2">
              {timelineDays.map((day) => {
                const isSelected = day.isSelected;
                const isFull = day.rate >= 0.8;
                const isPartial = day.rate >= 0.4;

                return (
                  <button
                    key={day.dateStr}
                    type="button"
                    onClick={() => setDate(day.dateStr)}
                    className={`py-2.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer border relative ${
                      isSelected
                        ? 'bg-white text-black border-white shadow-lg font-bold ring-2 ring-white/50 scale-[1.02]'
                        : isFull
                        ? 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                        : isPartial
                        ? 'bg-white/[0.04] text-slate-200 border-white/15 hover:bg-white/10'
                        : 'bg-white/[0.02] text-slate-400 border-white/5 hover:border-white/20'
                    }`}
                    title={`${day.monthName} ${day.dayNum}: ${Math.round(day.rate * 100)}% adherence`}
                  >
                    <span className={`text-[10px] font-mono leading-none ${isSelected ? 'text-black font-bold' : 'text-slate-400'}`}>
                      {day.dayName}
                    </span>
                    <span className="text-sm font-mono font-bold tabular-nums mt-1 leading-none">
                      {day.dayNum}
                    </span>
                    
                    {/* Bottom Indicator Dot */}
                    <div className="mt-1.5 flex items-center justify-center">
                      <span
                        className={`h-1 w-3 rounded-full ${
                          isSelected
                            ? 'bg-black'
                            : isFull
                            ? 'bg-white'
                            : isPartial
                            ? 'bg-white/40'
                            : 'bg-white/10'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 2. BALANCED 3-COLUMN DASHBOARD BENTO GRID */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* ======================================================================= */}
          {/* COLUMN 1: Habit Checklist & Daily Score */}
          {/* ======================================================================= */}
          <div className="flex flex-col gap-6">
            
            {/* Daily Adherence Progress Card */}
            <div className="backdrop-blur-xl bg-white/[0.025] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-between text-center relative overflow-hidden">
              <div className="w-full flex items-center justify-between text-xs font-mono text-slate-200 mb-1">
                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">TODAY&apos;S PROGRESS</span>
                <span className="text-white font-mono font-semibold tabular-nums">
                  {completedCount} of {habits.length} Done
                </span>
              </div>

              {/* Symmetrical Semi-Circular SVG Progress Gauge (Monochrome White) */}
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

                {/* Score in Center of Arc */}
                <div className="absolute bottom-1 flex flex-col items-center">
                  <span className="font-mono text-3xl font-bold text-white tracking-tight tabular-nums">
                    {completionPercentage}%
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-medium">
                    {completionPercentage >= 100
                      ? 'Goal Met'
                      : completionPercentage >= 70
                      ? 'Almost There'
                      : completionPercentage > 0
                      ? 'In Progress'
                      : 'Not Started'}
                  </span>
                </div>
              </div>

              <div className="w-full pt-3 border-t border-white/5 text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Current Streak:</span>
                <span className="text-white font-bold">{calculatedStreak} {calculatedStreak === 1 ? 'Day' : 'Days'}</span>
              </div>
            </div>

            {/* Daily Habit Checklist */}
            <div className="backdrop-blur-xl bg-white/[0.025] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                    Protocol Checklist
                  </span>
                  <h2 className="font-cabinet font-semibold text-lg text-slate-100 tracking-tight">
                    Today&apos;s Habits
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddHabit(!showAddHabit)}
                  className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer flex items-center gap-1 text-xs font-mono font-medium"
                  aria-label="Add habit"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Add Custom Habit Form */}
              {showAddHabit && (
                <form onSubmit={handleAddHabitSubmit} className="flex gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <input
                    type="text"
                    placeholder="E.g., 20 Min Morning Walk..."
                    value={newHabitTitle}
                    onChange={(e) => setNewHabitTitle(e.target.value)}
                    className="flex-1 bg-transparent text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-white text-black text-xs font-mono rounded-lg font-semibold hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                </form>
              )}

              {/* Habit Checklist Items with Strictly Fixed 24px Container & 12px Gap */}
              <div className="flex flex-col gap-2.5">
                {habits.map((habit) => {
                  const isDone = !!todayLog.habitsCompleted[habit.id];
                  return (
                    <div
                      key={habit.id}
                      onClick={() => handleToggleHabit(habit.id)}
                      className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                        isDone
                          ? 'bg-white/[0.05] border-white/20 text-white shadow-sm'
                          : 'bg-white/[0.02] border-white/10 hover:border-white/20 text-slate-200'
                      }`}
                    >
                      {/* Fixed 24px container with 12px gap to text */}
                      <div className="flex items-center gap-[12px] min-w-0 flex-1">
                        <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                              isDone
                                ? 'bg-white text-black border-white'
                                : 'border-white/30 group-hover:border-white/60'
                            }`}
                          >
                            {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                        <span className={`text-xs font-sans truncate ${isDone ? 'line-through text-slate-400 font-normal' : 'font-medium text-white'}`}>
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
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 transition-opacity cursor-pointer ml-2"
                          aria-label="Delete habit"
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
          {/* COLUMN 2: Coherent 2-Part Central Workspace */}
          {/* ======================================================================= */}
          <div className="flex flex-col gap-6">
            
            {/* Part A: Daily Focus State (Phase + Notes) */}
            <div className="backdrop-blur-xl bg-white/[0.025] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                    Circadian State
                  </span>
                  <h2 className="font-cabinet font-semibold text-lg text-slate-100 tracking-tight">
                    Daily Focus State
                  </h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="bg-white/[0.04] border border-white/10 text-white font-mono text-xs px-2.5 py-1 rounded-full">
                    {routineWindow.badge}
                  </span>
                  <span className="bg-white/[0.04] border border-white/10 text-white font-mono text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Flame className="w-3 h-3 text-white" />
                    <span>{calculatedStreak}D</span>
                  </span>
                </div>
              </div>

              {/* Routine Window Details */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <h3 className="font-cabinet font-semibold text-base text-white tracking-tight">
                  {routineWindow.title}
                </h3>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  {routineWindow.description}
                </p>
              </div>

              {/* Integrated Daily Reflection Notes */}
              <div className="flex flex-col gap-2 pt-1 border-t border-white/5">
                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                  Daily Observations &amp; Triggers
                </span>
                <textarea
                  value={todayLog.notes || ''}
                  onChange={(e) => setNotes(e.target.value, currentDate)}
                  placeholder="Log daily focus triggers, fasting notes, or workout reflections..."
                  rows={3}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-3.5 text-xs font-sans text-neutral-100 placeholder:text-slate-500 focus:border-white/30 focus:outline-none resize-none transition-colors"
                />
              </div>

            </div>

            {/* Part B: Logged Whole-Food Fuel (Empty & Active High-Fidelity States) */}
            <div className="backdrop-blur-xl bg-white/[0.025] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                    Nutrition Intake
                  </span>
                  <h2 className="font-cabinet font-semibold text-lg text-slate-100 tracking-tight">
                    Logged Whole-Food Fuel
                  </h2>
                </div>
                <Link href="/recipes" className="text-xs font-mono text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                  <span>Browse Catalog</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {todayLog.loggedRecipeIds && todayLog.loggedRecipeIds.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {todayLog.loggedRecipeIds.map((rId) => {
                    const recipe = RECIPES.find((r) => r.id === rId);
                    if (!recipe) return null;
                    return (
                      <div
                        key={rId}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/10 gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* 16-bit pixel art recipe container */}
                          <div className="w-12 h-12 rounded-lg bg-white/[0.03] border border-white/10 shrink-0 overflow-hidden flex items-center justify-center p-1">
                            <img
                              src={recipe.image}
                              alt={recipe.name}
                              className="w-full h-full object-contain [image-rendering:pixelated]"
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-medium text-white truncate">{recipe.name}</span>
                            <span className="text-[11px] font-mono text-slate-400 mt-0.5 tabular-nums">
                              [{recipe.protein}g PRO | {recipe.calories} KCAL]
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveRecipe(recipe.id, recipe.protein, recipe.calories)}
                          className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer shrink-0"
                          aria-label="Remove meal"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Faint 16-bit Dotted Ghost Outline & Clickable Ghost Trigger */
                <div className="p-6 text-center rounded-xl bg-white/[0.01] border border-dashed border-white/10 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center overflow-hidden">
                    <img
                      src="/assets/food/grilled-chicken.png"
                      alt="Meal placeholder"
                      className="w-10 h-10 object-contain opacity-20 grayscale [image-rendering:pixelated]"
                    />
                  </div>
                  <p className="text-xs font-mono text-slate-400">
                    No whole-food meals logged yet today.
                  </p>
                  <Link
                    href="/recipes"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Log Today&apos;s Meal</span>
                  </Link>
                </div>
              )}
            </div>

          </div>

          {/* ======================================================================= */}
          {/* COLUMN 3: Nutrition & Telemetry Visualizations */}
          {/* ======================================================================= */}
          <div className="flex flex-col gap-6">
            
            {/* Nutrition & Water Tracker */}
            <div className="backdrop-blur-xl bg-white/[0.025] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                  Daily Targets
                </span>
                <h2 className="font-cabinet font-semibold text-lg text-slate-100 tracking-tight">
                  Nutrition &amp; Water
                </h2>
              </div>

              {/* Protein Target with Strict Monochrome Fill Bar */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 uppercase text-[10px] tracking-wider">Protein Target</span>
                  <span className="text-white font-semibold tabular-nums">
                    {todayLog.totalProteinLogged}g <span className="text-slate-500 font-normal">/ 160g</span>
                  </span>
                </div>
                
                {/* Monochrome Progress Bar */}
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (todayLog.totalProteinLogged / 160) * 100)}%` }}
                  />
                </div>

                {/* Tactile Macro Quick-Add Buttons */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {[15, 30, 45].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSetProtein(todayLog.totalProteinLogged + amt)}
                      className="border border-white/10 bg-white/[0.03] hover:bg-white/10 active:scale-95 transition-all text-xs font-mono px-3 py-1.5 rounded-lg text-slate-200 font-medium cursor-pointer"
                    >
                      +{amt}g
                    </button>
                  ))}
                </div>
              </div>

              {/* Hydration with Strict Monochrome Fill Bar */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 uppercase text-[10px] tracking-wider">Hydration Intake</span>
                  <span className="text-white font-semibold tabular-nums">
                    {todayLog.hydrationLiters.toFixed(1)}L <span className="text-slate-500 font-normal">/ 3.5L</span>
                  </span>
                </div>

                {/* Monochrome Water Fill Bar */}
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (todayLog.hydrationLiters / 3.5) * 100)}%` }}
                  />
                </div>

                {/* Tactile Water Quick-Add Buttons */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {[0.25, 0.5, 1.0].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSetHydration(Number((todayLog.hydrationLiters + amt).toFixed(2)))}
                      className="border border-white/10 bg-white/[0.03] hover:bg-white/10 active:scale-95 transition-all text-xs font-mono px-3 py-1.5 rounded-lg text-slate-200 font-medium cursor-pointer"
                    >
                      +{amt}L
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Energy & Focus Card - Strict Monochrome Hierarchy */}
            <div className="backdrop-blur-xl bg-white/[0.025] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                  Subjective Telemetry
                </span>
                <h2 className="font-cabinet font-semibold text-lg text-slate-100 tracking-tight">
                  Energy &amp; Focus
                </h2>
              </div>

              {/* Energy Rating */}
              <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-300 font-medium">Energy Level</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm font-bold text-white tabular-nums">
                      {todayLog.energyLevel} / 10
                    </span>
                    <span className="text-[10px] font-mono text-white bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/10 uppercase tracking-wider font-medium">
                      {todayLog.energyLevel >= 8 ? 'Peak Flow' : todayLog.energyLevel >= 5 ? 'Steady' : 'Low'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center h-4 py-1">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={todayLog.energyLevel}
                    onChange={(e) => handleSetEnergy(Number(e.target.value))}
                    className="w-full accent-white h-1.5 bg-white/10 rounded-full cursor-pointer appearance-none"
                    aria-label="Energy Level Rating"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  <span>1 · Low</span>
                  <span>10 · High</span>
                </div>
              </div>

              {/* Executive Focus */}
              <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-300 font-medium">Executive Focus</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm font-bold text-white tabular-nums">
                      {todayLog.moodScore} / 10
                    </span>
                    <span className="text-[10px] font-mono text-white bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/10 uppercase tracking-wider font-medium">
                      {todayLog.moodScore >= 8 ? 'Deep Flow' : todayLog.moodScore >= 5 ? 'Balanced' : 'Scattered'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center h-4 py-1">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={todayLog.moodScore}
                    onChange={(e) => handleSetMood(Number(e.target.value))}
                    className="w-full accent-white h-1.5 bg-white/10 rounded-full cursor-pointer appearance-none"
                    aria-label="Executive Focus Rating"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  <span>1 · Scattered</span>
                  <span>10 · Laser Focus</span>
                </div>
              </div>

              {/* Sleep Duration */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-300 font-medium">Sleep Duration</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-sm font-bold text-white tabular-nums">
                      {todayLog.sleepHours} hrs
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetSleep(Math.max(0, todayLog.sleepHours - 0.5))}
                    className="flex-1 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/10 active:scale-95 transition-all text-xs font-mono text-slate-200 font-medium cursor-pointer"
                  >
                    -0.5h
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetSleep(todayLog.sleepHours + 0.5)}
                    className="flex-1 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/10 active:scale-95 transition-all text-xs font-mono text-slate-200 font-medium cursor-pointer"
                  >
                    +0.5h
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
