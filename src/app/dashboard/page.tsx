'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeaderNav } from '@/components/landing/HeaderNav';
import { useHabitStore } from '@/store/useHabitStore';
import { RECIPES } from '@/lib/recipes';
import { retroAudio } from '@/lib/retroAudio';
import { XpHud } from '@/components/progression/XpHud';
import { xpParticleEmitter } from '@/lib/particleEmitter';
import { Gift, Copy, Check, Share2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [historyRange, setHistoryRange] = useState<7 | 28>(7);
  const [copiedInvite, setCopiedInvite] = useState(false);

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
    customRecipes,
    userProfile,
  } = useHabitStore();

  const isAuthenticated = !!userSession && !userSession.id.startsWith('guest_');
  const allRecipes = useMemo(() => {
    if (!isAuthenticated) return RECIPES;
    return [...(customRecipes || []), ...RECIPES];
  }, [isAuthenticated, customRecipes]);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated && (!userProfile || !userProfile.onboardingCompleted)) {
      router.push('/onboarding');
    }
  }, [isAuthenticated, userProfile, router]);

  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const isViewingToday = currentDate === todayDateStr;
  const todayLog = getDailyLog(currentDate);

  const userReferralCode = userProfile?.referralCode || 'CYATH-JOIN';
  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/auth?ref=${userReferralCode}`
    : `https://cyath.space/auth?ref=${userReferralCode}`;

  const handleCopyInviteLink = async () => {
    retroAudio.playInspectConfirm();
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2500);
    } catch {
      // Fallback
    }
  };

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
        badge: 'MORNING',
        title: 'Morning Jumpstart',
        description: 'Drink 500ml water, natural sunlight, and bioavailable protein.',
      };
    } else if (hour < 17) {
      return {
        badge: 'AFTERNOON',
        title: 'Deep Focus Block',
        description: 'Single-task priority goals, hydrate, and take a walking break.',
      };
    } else {
      return {
        badge: 'EVENING',
        title: 'Restful Wind-Down',
        description: 'Dim bright screens, enjoy warm herbal tea, and cool down the room.',
      };
    }
  }, []);

  // Heatmap Days: Toggle-able between 7 and 28 days (default 7 days)
  const heatmapDays = useMemo(() => {
    const today = new Date();
    const days = [];
    const count = historyRange;

    for (let i = count - 1; i >= 0; i--) {
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
        isToday: dateKey === todayDateStr,
        isSelected: dateKey === currentDate,
      });
    }
    return days;
  }, [historyRange, logsByDate, habits, currentDate, completedCount, todayLog, todayDateStr]);

  const totalHeatmapActions = useMemo(() => {
    return heatmapDays.reduce((sum, d) => sum + d.totalActions, 0);
  }, [heatmapDays]);

  const avgDailyActions = (totalHeatmapActions / (heatmapDays.length || 1)).toFixed(1);

  // Handlers - guarded strictly to today's date so past days are read-only
  const handleToggleHabit = (habitId: string, e?: React.MouseEvent) => {
    if (!isViewingToday) return;
    retroAudio.playBlip();
    if (e && !todayLog.habitsCompleted[habitId]) {
      xpParticleEmitter.emit(e.clientX, e.clientY, 4);
    }
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

  const handleSetProtein = (amount: number, e?: React.MouseEvent) => {
    if (!isViewingToday) return;
    retroAudio.playBlip();
    if (e) {
      xpParticleEmitter.emit(e.clientX, e.clientY, 4);
    }
    if (!userSession) {
      router.push('/login?redirect=/dashboard');
      return;
    }
    setProtein(amount, currentDate);
  };

  const handleSetHydration = (amount: number, e?: React.MouseEvent) => {
    if (!isViewingToday) return;
    retroAudio.playBlip();
    if (e) {
      xpParticleEmitter.emit(e.clientX, e.clientY, 4);
    }
    if (!userSession) {
      router.push('/login?redirect=/dashboard');
      return;
    }
    setHydration(amount, currentDate);
  };

  const handleSetEnergy = (val: number) => {
    if (!isViewingToday) return;
    if (!userSession) {
      router.push('/login?redirect=/dashboard');
      return;
    }
    setEnergy(val, currentDate);
  };

  const handleSetSleep = (hours: number) => {
    if (!isViewingToday) return;
    retroAudio.playBlip();
    if (!userSession) {
      router.push('/login?redirect=/dashboard');
      return;
    }
    setSleep(hours, currentDate);
  };

  const handleRemoveRecipe = (recipeId: string, protein: number, calories: number) => {
    if (!isViewingToday) return;
    retroAudio.playBlip();
    removeRecipeFromDay(recipeId, protein, calories, currentDate);
  };

  const handleSetNotes = (notes: string) => {
    if (!isViewingToday) return;
    setNotes(notes, currentDate);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F4F0EA] flex items-center justify-center text-[#1A3629] font-mono text-xs">
        Loading Daily Planner...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1A3629] transition-colors duration-300 flex flex-col selection:bg-[#1A3629] selection:text-[#FFFDF9]">
      <HeaderNav />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-10 pt-24 pb-20 flex flex-col gap-6">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#1A3629]/15 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase tracking-wider bg-[#FFFDF9] border-[#1A3629] text-[#1A3629]">
                {currentDate} {isSyncing && '· Syncing...'}
              </span>
              {!isViewingToday ? (
                <span className="px-2.5 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase tracking-wider bg-[#FEF3C7] border-[#D97706]/40 text-[#92400E]">
                  Viewing Past Day · Read-Only
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase tracking-wider bg-[#ECFDF5] border-[#10B981]/40 text-[#065F46]">
                  Today · Active Log
                </span>
              )}
            </div>
            <h1 className="font-fraunces font-black text-3xl md:text-4xl tracking-tight text-[#1A3629]">
              Daily Planner
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {!isViewingToday && (
              <button
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  setDate(todayDateStr);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 bg-[#1A3629] border-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
              >
                <span>Return to Today →</span>
              </button>
            )}
            <Link
              href="/sanctuary"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 bg-[#FFFDF9] border-[#1A3629] text-[#1A3629] font-cabinet font-bold text-xs shadow-[2px_2px_0px_#1A3629] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              <span>Visit Sanctuary →</span>
            </Link>
          </div>
        </div>

        {/* Progression HUD Bridge */}
        <XpHud />

        {/* 1. Habit Check-in History (Toggle-able between 7 and 28 days) */}
        <div className="border-2 border-[#1A3629] bg-[#FFFDF9] rounded-2xl p-5 sm:p-6 shadow-[3px_3px_0px_#1A3629]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1A3629]/60 block mb-0.5">
                {historyRange}-Day Consistency Matrix
              </span>
              <h2 className="font-fraunces font-bold text-lg text-[#1A3629]">
                Habit Check-in History
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* 7 Days vs 28 Days Toggle */}
              <div 
                role="group" 
                aria-label="Habit check-in history duration"
                className="inline-flex items-center p-0.5 rounded-lg border-2 border-[#1A3629] bg-[#F4F0EA]"
              >
                <button
                  type="button"
                  aria-pressed={historyRange === 7}
                  onClick={() => {
                    retroAudio.playBlip();
                    setHistoryRange(7);
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                    historyRange === 7
                      ? 'bg-[#1A3629] text-[#FFFDF9] shadow-xs'
                      : 'text-[#1A3629]/70 hover:text-[#1A3629]'
                  }`}
                >
                  7 Days
                </button>
                <button
                  type="button"
                  aria-pressed={historyRange === 28}
                  onClick={() => {
                    retroAudio.playBlip();
                    setHistoryRange(28);
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                    historyRange === 28
                      ? 'bg-[#1A3629] text-[#FFFDF9] shadow-xs'
                      : 'text-[#1A3629]/70 hover:text-[#1A3629]'
                  }`}
                >
                  28 Days
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1A3629]/70 tabular-nums border-l border-[#1A3629]/20 pl-3">
                <span>Actions: <strong className="text-[#1A3629]">{totalHeatmapActions}</strong></span>
                <span>·</span>
                <span>Pace: <strong className="text-[#1A3629]">{avgDailyActions}/day</strong></span>
              </div>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className={`grid gap-1.5 ${
            historyRange === 7
              ? 'grid-cols-7'
              : 'grid-cols-7 sm:grid-cols-14 lg:grid-cols-28'
          }`}>
            {heatmapDays.map((day) => {
              const isSelected = day.isSelected;
              const levelClasses = {
                0: 'bg-transparent border border-transparent text-[#1A3629]/40 hover:bg-black/5',
                1: 'bg-[#E8E0D2] border border-[#1A3629]/30 text-[#1A3629]',
                2: 'bg-[#C2D7C7] border border-[#1A3629]/60 text-[#1A3629] font-bold',
                3: 'bg-[#6D9F80] border border-[#1A3629] text-[#FFFDF9] font-bold',
                4: 'bg-[#1A3629] border border-[#1A3629] text-[#FFFDF9] font-black',
              }[day.level];

              return (
                <button
                  key={day.dateStr}
                  type="button"
                  onClick={() => {
                    retroAudio.playBlip();
                    setDate(day.dateStr);
                  }}
                  className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${levelClasses} ${
                    isSelected ? 'ring-2 ring-[#1A3629] scale-105 font-bold shadow-xs' : 'hover:scale-105'
                  }`}
                  title={`${day.dateStr}: ${day.totalActions} actions ${day.isToday ? '(Today)' : '(Read-only)'}`}
                >
                  <span className="text-[10px] font-mono tabular-nums leading-none font-bold">
                    {day.dayNum}
                  </span>
                  <span className="text-[8px] font-mono mt-0.5 uppercase leading-none opacity-80">
                    {day.dayName.charAt(0)}
                  </span>
                </button>
              );
            })}
          </div>

          {!isViewingToday && (
            <div className="mt-3 pt-3 border-t border-[#1A3629]/15 flex items-center justify-between text-xs font-mono text-[#92400E] bg-[#FEF3C7]/60 px-3 py-2 rounded-lg border border-[#D97706]/30">
              <span>Viewing past log for {currentDate}. Checkbox toggles and progress edits are restricted to the current day.</span>
              <button
                type="button"
                onClick={() => {
                  retroAudio.playBlip();
                  setDate(todayDateStr);
                }}
                className="underline font-bold text-[#1A3629] hover:text-[#000] ml-2 shrink-0 cursor-pointer"
              >
                Jump to Today
              </button>
            </div>
          )}
        </div>

        {/* 2. Distilled 3-Column Daily Action Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* COLUMN 1: Today's Habits (Distilled with Integrated Progress) */}
          <div className="border-2 border-[#1A3629] bg-[#FFFDF9] rounded-2xl p-5 sm:p-6 shadow-[3px_3px_0px_#1A3629] flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#1A3629]/15 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1A3629]/60 block mb-0.5">
                  Core Routine
                </span>
                <h2 className="font-fraunces font-bold text-lg text-[#1A3629]">
                  Today&apos;s Habits
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowAddHabit(!showAddHabit)}
                className="px-3 py-1 rounded-lg border-2 border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] text-xs font-cabinet font-bold shadow-[2px_2px_0px_#3A6B52] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
              >
                + Add Habit
              </button>
            </div>

            {/* Integrated Sleek Progress Track */}
            <div className="flex flex-col gap-1.5 bg-[#FAF6EE] p-3 rounded-xl border border-[#1A3629]/15">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#1A3629]">Completion</span>
                <span className="font-bold text-[#10B981] tabular-nums">
                  {completedCount}/{habits.length} Done ({completionPercentage}%)
                </span>
              </div>
              <div className="w-full h-2 bg-[#EAE3D2] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#10B981] rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Add Custom Habit Form */}
            {showAddHabit && (
              <form onSubmit={handleAddHabitSubmit} className="flex gap-2 p-2 rounded-xl border-2 border-[#1A3629] bg-[#FAF6EE]">
                <input
                  type="text"
                  placeholder="Habit title (e.g. 15m walk)..."
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  className="flex-1 bg-transparent text-xs font-cabinet font-bold focus:outline-none placeholder-[#1A3629]/40 text-[#1A3629] px-2"
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

            {/* 100% Habit Completion Celebration Banner */}
            {completedCount === habits.length && habits.length > 0 && (
              <div className="p-3 rounded-xl border-2 border-[#10B981] bg-[#ECFDF5] text-[#065F46] flex items-center justify-between shadow-xs animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black text-[#10B981]">★</span>
                  <span className="text-xs font-cabinet font-bold">All habits checked! Daily routine calibrated.</span>
                </div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#10B981] bg-[#FFFDF9] px-2 py-0.5 rounded border border-[#10B981]/30 shrink-0">
                  100% Mastery
                </span>
              </div>
            )}

            {/* Habits Checklist */}
            <div className="flex flex-col gap-1">
              {habits.map((habit) => {
                const isDone = !!todayLog.habitsCompleted[habit.id];
                return (
                  <div
                    key={habit.id}
                    onClick={(e) => handleToggleHabit(habit.id, e)}
                    className={`group flex items-center justify-between py-2 px-2.5 rounded-xl transition-all ${
                      !isViewingToday
                        ? 'opacity-70 cursor-not-allowed'
                        : 'hover:bg-[#FAF6EE] cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center font-mono text-xs font-black transition-all ${
                        isDone
                          ? 'bg-[#1A3629] text-[#FFFDF9] border-[#1A3629] scale-105 shadow-xs'
                          : !isViewingToday
                          ? 'border-[#1A3629]/20 bg-gray-100'
                          : 'border-[#1A3629]/40 bg-[#FFFDF9] group-hover:border-[#1A3629] group-hover:scale-105'
                      }`}>
                        {isDone ? '✓' : ''}
                      </div>
                      <span className={`text-xs font-cabinet font-bold truncate text-[#1A3629] transition-opacity ${
                        isDone ? 'line-through opacity-50' : ''
                      }`}>
                        {habit.title}
                      </span>
                    </div>

                    {habit.category === 'custom' && isViewingToday && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHabit(habit.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 text-[9px] font-mono font-bold text-red-600 hover:text-red-800 transition-opacity cursor-pointer border border-red-600/30 rounded"
                      >
                        DEL
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMN 2: Routine Focus & Food Log */}
          <div className="flex flex-col gap-6">
            
            {/* Daily Phase & Quick Notes */}
            <div className="border-2 border-[#1A3629] bg-[#FFFDF9] rounded-2xl p-5 sm:p-6 shadow-[3px_3px_0px_#1A3629] flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-[#1A3629]/15 pb-2">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1A3629]/60 block">
                    Phase Focus
                  </span>
                  <h2 className="font-fraunces font-bold text-base text-[#1A3629]">
                    {routineWindow.title}
                  </h2>
                </div>
                <span className="px-2 py-0.5 rounded-full border border-[#1A3629]/20 bg-[#FAF6EE] text-[9px] font-mono font-bold uppercase text-[#1A3629]">
                  {routineWindow.badge}
                </span>
              </div>

              <p className="text-xs font-cabinet font-medium leading-relaxed text-[#2C4A3B]">
                {routineWindow.description}
              </p>

              <div className="relative">
                <textarea
                  value={todayLog.notes || ''}
                  onChange={(e) => handleSetNotes(e.target.value)}
                  disabled={!isViewingToday}
                  placeholder={isViewingToday ? "Quick observations, energy reflections, or workout notes..." : "Read-only notes for past day."}
                  rows={2}
                  className={`w-full p-2.5 rounded-xl border text-xs font-cabinet font-medium focus:outline-none focus:ring-2 focus:ring-[#1A3629]/10 resize-none text-[#1A3629] transition-all ${
                    !isViewingToday 
                      ? 'bg-gray-100/70 border-[#1A3629]/15 cursor-not-allowed opacity-80' 
                      : 'bg-[#FFFDF9] border-[#1A3629]/25 placeholder-[#4A5D4E]/60 focus:border-[#1A3629]'
                  }`}
                />
                {isViewingToday && todayLog.notes && (
                  <span className="absolute right-2.5 bottom-2 text-[9px] font-mono font-bold text-[#4A5D4E] select-none pointer-events-none">
                    ● Saved
                  </span>
                )}
              </div>
            </div>

            {/* Logged Whole-Food Meals */}
            <div className="border-2 border-[#1A3629] bg-[#FFFDF9] rounded-2xl p-5 sm:p-6 shadow-[3px_3px_0px_#1A3629] flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-[#1A3629]/15 pb-2">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1A3629]/60 block">
                    Nutrition
                  </span>
                  <h2 className="font-fraunces font-bold text-base text-[#1A3629]">
                    Logged Whole Foods
                  </h2>
                </div>
                {isViewingToday && (
                  <Link 
                    href="/recipes" 
                    className="text-xs font-mono font-bold text-[#10B981] hover:underline"
                  >
                    + Add Meal →
                  </Link>
                )}
              </div>

              {todayLog.loggedRecipeIds && todayLog.loggedRecipeIds.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {todayLog.loggedRecipeIds.map((rId, index) => {
                    const recipe = allRecipes.find((r) => r.id === rId);
                    if (!recipe || (!isAuthenticated && recipe.isCustom)) return null;
                    return (
                      <div
                        key={`${rId}-${index}`}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-[#1A3629]/15 bg-[#FAF6EE]/50 gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={recipe.image}
                            alt={recipe.name}
                            className="w-8 h-8 rounded-md object-contain [image-rendering:pixelated] shrink-0"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-cabinet font-bold truncate text-[#1A3629]">{recipe.name}</span>
                            <span className="text-[10px] font-mono font-bold text-[#2C4A3B]">
                              {recipe.protein}g PRO · {recipe.calories} KCAL
                            </span>
                          </div>
                        </div>

                        {isViewingToday && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRecipe(recipe.id, recipe.protein, recipe.calories)}
                            className="text-xs font-mono font-bold opacity-60 hover:opacity-100 hover:text-red-600 cursor-pointer p-1"
                            aria-label="Remove meal"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-4 text-center text-xs font-cabinet font-medium text-[#4A5D4E] bg-[#FAF6EE]/30 rounded-xl border border-dashed border-[#1A3629]/15">
                  {isViewingToday ? (
                    <>
                      No meals logged yet today.{' '}
                      <Link href="/recipes" className="font-bold text-[#1A3629] underline">
                        Browse recipes
                      </Link>
                    </>
                  ) : (
                    'No meals logged on this day.'
                  )}
                </div>
              )}
            </div>

          </div>

          {/* COLUMN 3: Distilled Biometrics & Telemetry (Consolidated into 1 Card) */}
          <div className="border-2 border-[#1A3629] bg-[#FFFDF9] rounded-2xl p-5 sm:p-6 shadow-[3px_3px_0px_#1A3629] flex flex-col gap-4">
            <div className="border-b border-[#1A3629]/15 pb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1A3629]/60 block mb-0.5">
                Daily Check-in
              </span>
              <h2 className="font-fraunces font-bold text-lg text-[#1A3629]">
                Biometrics &amp; Energy
              </h2>
            </div>

            {/* Protein Target */}
            <div className="p-3 rounded-xl bg-[#FAF6EE]/70 border border-[#1A3629]/15 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#1A3629]">Protein</span>
                <span className="tabular-nums font-bold text-[#10B981]">
                  {todayLog.totalProteinLogged}g <span className="text-[#4A5D4E] font-medium">/ 160g</span>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[15, 30, 45].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    disabled={!isViewingToday}
                    onClick={(e) => handleSetProtein(todayLog.totalProteinLogged + amt, e)}
                    className={`border rounded-lg py-1 text-xs font-mono font-bold transition-colors ${
                      !isViewingToday
                        ? 'border-[#1A3629]/10 bg-gray-100 text-[#1A3629]/40 cursor-not-allowed'
                        : 'border-[#1A3629]/25 hover:bg-[#1A3629] hover:text-[#FFFDF9] bg-white text-[#1A3629] cursor-pointer'
                    }`}
                  >
                    +{amt}g
                  </button>
                ))}
              </div>
            </div>

            {/* Hydration */}
            <div className="p-3 rounded-xl bg-[#FAF6EE]/70 border border-[#1A3629]/15 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#1A3629]">Water Intake</span>
                <span className="tabular-nums font-bold text-[#2563EB]">
                  {todayLog.hydrationLiters.toFixed(1)}L <span className="text-[#4A5D4E] font-medium">/ 3.0L</span>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[0.25, 0.5, 1.0].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    disabled={!isViewingToday}
                    onClick={(e) => handleSetHydration(Number((todayLog.hydrationLiters + amt).toFixed(2)), e)}
                    className={`border rounded-lg py-1 text-xs font-mono font-bold transition-colors ${
                      !isViewingToday
                        ? 'border-[#1A3629]/10 bg-gray-100 text-[#1A3629]/40 cursor-not-allowed'
                        : 'border-[#1A3629]/25 hover:bg-[#1A3629] hover:text-[#FFFDF9] bg-white text-[#1A3629] cursor-pointer'
                    }`}
                  >
                    +{amt}L
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Rating Slider */}
            <div className="p-3 rounded-xl bg-[#FAF6EE]/70 border border-[#1A3629]/15 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#1A3629]">Energy Rating</span>
                <span className="font-bold text-[#D97706] tabular-nums">{todayLog.energyLevel}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={todayLog.energyLevel}
                disabled={!isViewingToday}
                onChange={(e) => handleSetEnergy(Number(e.target.value))}
                className={`w-full accent-[#1A3629] h-1.5 rounded-full ${
                  !isViewingToday ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              />
            </div>

            {/* Sleep Hours Stepper */}
            <div className="p-3 rounded-xl bg-[#FAF6EE]/70 border border-[#1A3629]/15 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#1A3629]">Sleep Duration</span>
                <span className="tabular-nums font-bold text-[#1A3629]">{todayLog.sleepHours} hrs</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!isViewingToday}
                  onClick={() => handleSetSleep(Math.max(0, todayLog.sleepHours - 0.5))}
                  className={`flex-1 py-1 rounded-lg border text-xs font-mono font-bold transition-colors ${
                    !isViewingToday
                      ? 'border-[#1A3629]/10 bg-gray-100 text-[#1A3629]/40 cursor-not-allowed'
                      : 'border-[#1A3629]/25 hover:bg-[#1A3629] hover:text-[#FFFDF9] bg-white text-[#1A3629] cursor-pointer'
                  }`}
                >
                  -0.5h
                </button>
                <button
                  type="button"
                  disabled={!isViewingToday}
                  onClick={() => handleSetSleep(todayLog.sleepHours + 0.5)}
                  className={`flex-1 py-1 rounded-lg border text-xs font-mono font-bold transition-colors ${
                    !isViewingToday
                      ? 'border-[#1A3629]/10 bg-gray-100 text-[#1A3629]/40 cursor-not-allowed'
                      : 'border-[#1A3629]/25 hover:bg-[#1A3629] hover:text-[#FFFDF9] bg-white text-[#1A3629] cursor-pointer'
                  }`}
                >
                  +0.5h
                </button>
              </div>
            </div>

            {/* Strategic Referral Guild Card in Column 3 */}
            <div className="p-3.5 rounded-xl border-2 border-[#10B981] bg-[#ECFDF5] flex flex-col gap-2.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#10B981]/25 pb-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase text-[#065F46]">
                  <Gift className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Guild Pact (+250 XP)</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-white text-[9px] font-mono font-bold text-[#065F46] border border-[#10B981]/30">
                  Dual Reward
                </span>
              </div>

              <p className="text-[11px] font-cabinet font-medium text-[#1A3629] leading-snug">
                Recruit a companion. You both earn <strong>+250 XP</strong> on activation!
              </p>

              <div className="flex items-center gap-1.5">
                <div className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#10B981]/40 bg-white font-mono font-black text-xs text-[#1A3629] select-all truncate">
                  {userReferralCode}
                </div>
                <button
                  type="button"
                  onClick={handleCopyInviteLink}
                  className="px-3 py-1.5 rounded-lg border border-[#1A3629] bg-[#1A3629] text-[#FFFDF9] font-cabinet font-bold text-[11px] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-xs"
                >
                  {copiedInvite ? (
                    <>
                      <Check className="w-3 h-3 text-[#34D399]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`I'm leveling up my metabolic habits on Cyath! Join my guild with code ${userReferralCode} for +250 Starter XP: ${inviteUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => retroAudio.playInspectConfirm()}
                  className="p-1.5 rounded-lg border border-[#1A3629] bg-white hover:bg-[#FAF6EE] text-[#1A3629] cursor-pointer flex items-center justify-center shrink-0 shadow-xs"
                  title="Share to WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#1A3629]" />
                </a>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
