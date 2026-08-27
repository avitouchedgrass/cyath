'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { useHabitStore } from '@/store/useHabitStore';
import { RECIPES } from '@/lib/recipes';
import { retroAudio } from '@/lib/retroAudio';
import { XpHud } from '@/components/progression/XpHud';
import { QuestPanel } from '@/components/progression/QuestPanel';


export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');

  const {
    habits,
    currentDate,
    logsByDate,
    getDailyLog,
    toggleHabit,
    addCustomHabit,
    deleteHabit,
    setProtein,
    setHydration,
    setEnergy,
    setMood,
    setSleep,
    setNotes,
    setDate,
    removeRecipeFromDay,
    userSession,
    setPendingAction,
    isSyncing,
  } = useHabitStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const todayLog = getDailyLog(currentDate);

  // Calculate stats
  const completedCount = useMemo(() => {
    return habits.filter((h) => todayLog.habitsCompleted[h.id]).length;
  }, [habits, todayLog.habitsCompleted]);

  const completionPercentage = useMemo(() => {
    if (habits.length === 0) return 0;
    return Math.round((completedCount / habits.length) * 100);
  }, [completedCount, habits.length]);

  // Routine time window based on current hour
  const routineWindow = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 11) {
      return {
        badge: 'MORNING PHASE',
        title: 'Morning Jumpstart',
        description: 'Drink 500ml water, get 15m natural sunlight, and have a high-protein breakfast.',
      };
    } else if (hour < 17) {
      return {
        badge: 'AFTERNOON PHASE',
        title: 'Deep Focus Block',
        description: 'Single-task on priority goals, stay hydrated, and take a brisk walking break.',
      };
    } else {
      return {
        badge: 'EVENING PHASE',
        title: 'Restful Wind-Down',
        description: 'Dim bright screens, enjoy a warm herbal tea, and cool down your bedroom.',
      };
    }
  }, []);

  // 28-Day Heatmap Days
  const heatmapDays = useMemo(() => {
    const today = new Date();
    const days = [];

    for (let i = 27; i >= 0; i--) {
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

  // Streak Calculation
  const calculatedStreak = useMemo(() => {
    let streak = 0;
    for (let i = heatmapDays.length - 1; i >= 0; i--) {
      if (heatmapDays[i].totalActions >= 3) {
        streak++;
      } else {
        break;
      }
    }
    return Math.max(1, streak);
  }, [heatmapDays]);

  // Handlers
  const handleToggleHabit = (habitId: string) => {
    retroAudio.playBlip();
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
    retroAudio.playInspectConfirm();
    addCustomHabit(newHabitTitle.trim());
    setNewHabitTitle('');
    setShowAddHabit(false);
  };

  const handleSetProtein = (amount: number) => {
    retroAudio.playBlip();
    if (!userSession) {
      router.push('/login?redirect=/dashboard');
      return;
    }
    setProtein(amount, currentDate);
  };

  const handleSetHydration = (amount: number) => {
    retroAudio.playBlip();
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
    retroAudio.playBlip();
    if (!userSession) {
      router.push('/login?redirect=/dashboard');
      return;
    }
    setSleep(val, currentDate);
  };

  const handleRemoveRecipe = (recipeId: string, protein: number, calories: number) => {
    retroAudio.playBlip();
    if (!userSession) {
      router.push('/login?redirect=/dashboard');
      return;
    }
    removeRecipeFromDay(recipeId, protein, calories, currentDate);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F4F0EA] flex items-center justify-center text-[#1A3629] font-mono text-xs">
        Loading Daily Planner...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1A3629] transition-colors duration-300 flex flex-col">
      <HeaderNav />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 lg:px-10 pt-28 pb-24 flex flex-col gap-8">
        
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase tracking-wider bg-[#FFFDF9] border-[#1A3629] text-[#1A3629]">
                Daily Planner · {currentDate} {isSyncing && '· Syncing...'}
              </span>
            </div>
            <h1 className="font-fraunces font-black text-3xl md:text-4xl tracking-tight text-[#1A3629]">
              Your Daily Planner &amp; Habits
            </h1>
          </div>

          {/* Reserved Tactile Shadow for Top Streak Badge */}
          <div className="self-start sm:self-auto px-4 py-1.5 rounded-full border-2 border-[#1A3629] bg-[#FFFDF9] text-[#1A3629] font-mono font-bold text-xs flex items-center gap-2 shadow-[3px_3px_0px_#1A3629]">
            <span className="text-sm">★</span>
            <span>{calculatedStreak} Day Streak</span>
          </div>
        </div>

        {/* Progression HUD */}
        <XpHud />

        {/* 1. 28-Day Consistency Matrix (Flat Bento Box, 2px border, No Shadow) */}
        <div className="border-2 border-[#1A3629] bg-[#FFFDF9] rounded-2xl p-6 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1A3629]/60 block mb-1">
                28-Day Consistency Matrix
              </span>
              <h2 className="font-fraunces font-bold text-xl tracking-tight text-[#1A3629]">
                Daily Check-in Activity
              </h2>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono font-bold text-[#1A3629]/70">
              <span>Total Actions: <strong className="text-[#1A3629]">{totalHeatmapActions}</strong></span>
              <span>·</span>
              <span>Daily Pace: <strong className="text-[#1A3629]">{avgDailyActions}/day</strong></span>
            </div>
          </div>

          {/* Heatmap Grid - Inactive Days Unbordered & Subtly Muted */}
          <div className="grid grid-cols-7 sm:grid-cols-14 lg:grid-cols-28 gap-2">
            {heatmapDays.map((day) => {
              const isSelected = day.isSelected;
              
              // Only active/completed days get borders/fills. Inactive = no borders/backgrounds
              const levelClasses = {
                0: 'bg-transparent border border-transparent text-[#1A3629]/40 hover:bg-black/5',
                1: 'bg-[#E8E0D2] border border-[#1A3629]/30 text-[#1A3629]',
                2: 'bg-[#C2D7C7] border border-[#1A3629]/60 text-[#1A3629] font-bold',
                3: 'bg-[#6D9F80] border border-[#1A3629] text-[#FFFDF9] font-bold',
                4: 'bg-[#1A3629] border border-[#1A3629] text-[#FFFDF9] font-black',
              }[day.level];

              return (
                <div key={day.dateStr} className="relative group">
                  <button
                    type="button"
                    onClick={() => {
                      retroAudio.playBlip();
                      setDate(day.dateStr);
                    }}
                    className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${levelClasses} ${
                      isSelected
                        ? 'ring-2 ring-[#1A3629] scale-105 font-bold'
                        : 'hover:scale-105'
                    }`}
                  >
                    <span className="text-[10px] font-mono tabular-nums leading-none font-bold">
                      {day.dayNum}
                    </span>
                    <span className="text-[8px] font-mono mt-0.5 uppercase leading-none opacity-80">
                      {day.dayName.charAt(0)}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. 3-Column Dashboard Bento (Flat Bento Boxes, 2px border, No Shadows) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* COLUMN 1: Habit Checklist */}
          <div className="flex flex-col gap-6">
            
            {/* Daily Progress Arc (Calibrated Technical Dial) */}
            <div className="border-2 border-[#1A3629] bg-[#FFFDF9] rounded-2xl p-6 text-center transition-all flex flex-col items-center">
              <div className="w-full flex items-center justify-between text-xs font-mono font-bold mb-3">
                <span className="text-[10px] uppercase tracking-widest text-[#1A3629]/60">DAILY PROGRESS</span>
                <span>{completedCount} / {habits.length} DONE</span>
              </div>

              {/* Thinned 50% Calibrated Progress Gauge (strokeWidth 4) */}
              <div className="relative w-40 h-24 flex items-end justify-center my-1">
                <svg className="w-40 h-24" viewBox="0 0 120 70">
                  <path
                    d="M 15,60 A 45,45 0 0,1 105,60"
                    fill="none"
                    stroke="currentColor"
                    className="text-[#1A3629]/15"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 15,60 A 45,45 0 0,1 105,60"
                    fill="none"
                    stroke="#1A3629"
                    strokeWidth="4"
                    strokeDasharray="141.37"
                    strokeDashoffset={141.37 - (141.37 * completionPercentage) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                <div className="absolute bottom-1 flex flex-col items-center">
                  <span className="font-mono text-3xl font-bold tabular-nums text-[#1A3629]">
                    {completionPercentage}%
                  </span>
                </div>
              </div>
            </div>

            {/* Habit Checklist (Flat Bento Box) */}
            <div className="border-2 border-[#1A3629] bg-[#FFFDF9] rounded-2xl p-6 flex flex-col gap-4 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1A3629]/60 block">
                    Routine Checklist
                  </span>
                  <h2 className="font-fraunces font-bold text-lg text-[#1A3629]">
                    Today&apos;s Habits
                  </h2>
                </div>

                {/* Primary CTA (+ Add) with Tactile Shadow & Active Click Depression */}
                <button
                  type="button"
                  onClick={() => setShowAddHabit(!showAddHabit)}
                  className="px-3.5 py-1.5 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] text-xs font-mono font-bold flex items-center gap-1 shadow-[3px_3px_0px_#3A6B52] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#3A6B52] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none transition-all cursor-pointer"
                >
                  <span>+ Add</span>
                </button>
              </div>

              {/* Add Custom Habit Form */}
              {showAddHabit && (
                <form onSubmit={handleAddHabitSubmit} className="flex gap-2 p-2.5 rounded-xl border border-[#1A3629]/20 bg-[#F4F0EA]/60">
                  <input
                    type="text"
                    placeholder="E.g., 20 Min Morning Walk..."
                    value={newHabitTitle}
                    onChange={(e) => setNewHabitTitle(e.target.value)}
                    className="flex-1 bg-transparent text-xs font-cabinet font-bold focus:outline-none placeholder-[#1A3629]/40 text-[#1A3629]"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg border border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] text-xs font-mono font-bold cursor-pointer"
                  >
                    Save
                  </button>
                </form>
              )}

              {/* Flat Habit Items with Subtle Background Hover */}
              <div className="flex flex-col gap-1">
                {habits.map((habit) => {
                  const isDone = !!todayLog.habitsCompleted[habit.id];
                  return (
                    <div
                      key={habit.id}
                      onClick={() => handleToggleHabit(habit.id)}
                      className="group flex items-center justify-between py-2.5 px-3 rounded-lg bg-transparent hover:bg-black/5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center font-mono text-xs font-bold transition-all ${
                          isDone
                            ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629]'
                            : 'border-[#1A3629]/40 group-hover:border-[#1A3629]'
                        }`}>
                          {isDone && '✓'}
                        </div>
                        <span className={`text-xs font-cabinet font-bold truncate text-[#1A3629] ${
                          isDone ? 'line-through opacity-50' : ''
                        }`}>
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
                          className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-red-600 hover:text-red-800 transition-opacity cursor-pointer ml-2 border border-red-600/30 rounded"
                        >
                          DEL
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* COLUMN 2: Daily Focus & Food Journal */}
          <div className="flex flex-col gap-6">
            
            {/* Daily Phase (Flat Bento Box, 2px border, No Shadow) */}
            <div className="border-2 border-[#1A3629] bg-[#FFFDF9] rounded-2xl p-6 flex flex-col gap-4 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1A3629]/60 block">
                    Routine Stage
                  </span>
                  <h2 className="font-fraunces font-bold text-lg text-[#1A3629]">
                    {routineWindow.title}
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full border border-[#1A3629]/20 bg-[#F4F0EA]/80 text-[10px] font-mono font-bold uppercase text-[#1A3629]">
                  {routineWindow.badge}
                </span>
              </div>

              <p className="text-xs font-cabinet font-medium leading-relaxed text-[#2C4A3B]">
                {routineWindow.description}
              </p>

              {/* Reflection Notes */}
              <div className="pt-2 border-t border-[#1A3629]/10 flex flex-col gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1A3629]/60">
                  Daily Notes &amp; Observations
                </span>
                <textarea
                  value={todayLog.notes || ''}
                  onChange={(e) => setNotes(e.target.value, currentDate)}
                  placeholder="Note energy peaks, workout notes, or meals..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-[#1A3629]/20 bg-[#F4F0EA]/50 text-xs font-cabinet font-medium focus:outline-none resize-none placeholder-[#1A3629]/40 text-[#1A3629]"
                />
              </div>
            </div>

            {/* Logged Whole-Food Meals (Flat Bento Box, 2px border, No Shadow) */}
            <div className="border-2 border-[#1A3629] bg-[#FFFDF9] rounded-2xl p-6 flex flex-col gap-4 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1A3629]/60 block">
                    Nutrition Fuel
                  </span>
                  <h2 className="font-fraunces font-bold text-lg text-[#1A3629]">
                    Logged Whole Foods
                  </h2>
                </div>
                <Link 
                  href="/recipes" 
                  className="text-xs font-mono font-bold hover:underline flex items-center gap-1 text-[#1A3629]"
                >
                  <span>Catalog →</span>
                </Link>
              </div>

              {todayLog.loggedRecipeIds && todayLog.loggedRecipeIds.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {todayLog.loggedRecipeIds.map((rId) => {
                    const recipe = RECIPES.find((r) => r.id === rId);
                    if (!recipe) return null;
                    return (
                      <div
                        key={rId}
                        className="flex items-center justify-between p-3 rounded-xl border border-[#1A3629]/15 bg-[#F4F0EA]/40 gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg shrink-0 overflow-hidden flex items-center justify-center p-1">
                            <img
                              src={recipe.image}
                              alt={recipe.name}
                              className="w-full h-full object-contain [image-rendering:pixelated]"
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-cabinet font-bold truncate text-[#1A3629]">{recipe.name}</span>
                            <span className="text-[11px] font-mono font-bold opacity-75 mt-0.5 text-[#2C4A3B]">
                              [{recipe.protein}g PRO · {recipe.calories} KCAL]
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveRecipe(recipe.id, recipe.protein, recipe.calories)}
                          className="px-2 py-1 rounded text-xs font-mono font-bold opacity-70 hover:opacity-100 hover:text-red-600 transition-colors cursor-pointer"
                          aria-label="Remove meal"
                        >
                          [x]
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center rounded-xl border border-dashed border-[#1A3629]/20 bg-[#F4F0EA]/30 flex flex-col items-center justify-center gap-3">
                  <p className="text-xs font-cabinet font-medium text-[#2C4A3B]">
                    No whole-food meals logged yet today.
                  </p>
                  
                  {/* Primary CTA */}
                  <Link
                    href="/recipes"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] text-xs font-cabinet font-bold shadow-[3px_3px_0px_#3A6B52] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#3A6B52] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none transition-all cursor-pointer"
                  >
                    <span>Browse Recipe Catalog →</span>
                  </Link>
                </div>
              )}
            </div>

          </div>

          {/* COLUMN 3: Daily Metrics & Telemetry */}
          <div className="flex flex-col gap-6">
            
            {/* Nutrition & Water Card */}
            <div className="border-2 border-[#1A3629] bg-[#FFFDF9] rounded-2xl p-6 flex flex-col gap-5 transition-all">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1A3629]/60 block">
                  Daily Fuel
                </span>
                <h2 className="font-fraunces font-bold text-lg text-[#1A3629]">
                  Protein &amp; Hydration
                </h2>
              </div>

              {/* Protein Steppers */}
              <div className="p-4 rounded-xl border border-[#1A3629]/15 bg-[#F4F0EA]/40 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span className="uppercase text-[10px] text-[#1A3629]/60">Protein Target</span>
                  <span>
                    {todayLog.totalProteinLogged}g <span className="opacity-50">/ 160g</span>
                  </span>
                </div>

                {/* Flat Secondary Action Pills */}
                <div className="grid grid-cols-3 gap-2">
                  {[15, 30, 45].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSetProtein(todayLog.totalProteinLogged + amt)}
                      className="border border-[#1A3629]/30 hover:bg-[#1A3629]/10 rounded-lg py-1.5 text-xs font-mono font-bold text-[#1A3629] transition-colors cursor-pointer"
                    >
                      +{amt}g
                    </button>
                  ))}
                </div>
              </div>

              {/* Hydration Steppers */}
              <div className="p-4 rounded-xl border border-[#1A3629]/15 bg-[#F4F0EA]/40 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span className="uppercase text-[10px] text-[#1A3629]/60">Water Intake</span>
                  <span>
                    {todayLog.hydrationLiters.toFixed(1)}L <span className="opacity-50">/ 3.5L</span>
                  </span>
                </div>

                {/* Flat Secondary Action Pills */}
                <div className="grid grid-cols-3 gap-2">
                  {[0.25, 0.5, 1.0].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSetHydration(Number((todayLog.hydrationLiters + amt).toFixed(2)))}
                      className="border border-[#1A3629]/30 hover:bg-[#1A3629]/10 rounded-lg py-1.5 text-xs font-mono font-bold text-[#1A3629] transition-colors cursor-pointer"
                    >
                      +{amt}L
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Energy & Focus Dials */}
            <div className="border-2 border-[#1A3629] bg-[#FFFDF9] rounded-2xl p-6 flex flex-col gap-5 transition-all">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1A3629]/60 block">
                  Daily Check-in
                </span>
                <h2 className="font-fraunces font-bold text-lg text-[#1A3629]">
                  Energy &amp; Sleep
                </h2>
              </div>

              {/* Energy Level */}
              <div className="p-4 rounded-xl border border-[#1A3629]/15 bg-[#F4F0EA]/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span>Energy Rating</span>
                  <span>{todayLog.energyLevel} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={todayLog.energyLevel}
                  onChange={(e) => handleSetEnergy(Number(e.target.value))}
                  className="w-full accent-[#1A3629] h-1.5 rounded-full cursor-pointer"
                />
              </div>

              {/* Sleep Duration */}
              <div className="p-4 rounded-xl border border-[#1A3629]/15 bg-[#F4F0EA]/40 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span>Sleep Duration</span>
                  <span>{todayLog.sleepHours} hrs</span>
                </div>

                {/* Flat Secondary Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetSleep(Math.max(0, todayLog.sleepHours - 0.5))}
                    className="flex-1 py-1.5 rounded-lg border border-[#1A3629]/30 hover:bg-[#1A3629]/10 text-xs font-mono font-bold text-[#1A3629] transition-colors cursor-pointer"
                  >
                    -0.5h
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetSleep(todayLog.sleepHours + 0.5)}
                    className="flex-1 py-1.5 rounded-lg border border-[#1A3629]/30 hover:bg-[#1A3629]/10 text-xs font-mono font-bold text-[#1A3629] transition-colors cursor-pointer"
                  >
                    +0.5h
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Active Daily Quests & Weekly Challenge */}
        <QuestPanel />

      </main>
    </div>
  );
}
