'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { formatLocalDate, getRelativeLocalDate, parseLocalDate } from '@/lib/dateUtils';
import { WeeklyDossierModal } from '@/components/dashboard/WeeklyDossierModal';
import { exportClinicalDossierSummary } from '@/lib/exporters/dossierPdfExport';
import {
  FileText,
  ArrowRight,
  Printer,
  Moon,
  CheckCircle2,
  Utensils,
  Sparkles,
} from 'lucide-react';

export function DossierTab() {
  const [historyRange, setHistoryRange] = useState<7 | 28>(7);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  const {
    habits,
    currentDate,
    logsByDate,
    getDailyLog,
    setDate,
    userProfile,
    weightHistory,
    claimedDossiersByWeek,
  } = useHabitStore();

  const todayDateStr = useMemo(() => formatLocalDate(), []);
  const todayLog = getDailyLog(currentDate);

  const completedCount = useMemo(() => {
    return habits.filter((h) => todayLog.habitsCompleted[h.id]).length;
  }, [habits, todayLog.habitsCompleted]);

  const targetProtein = userProfile?.weightKg ? Math.round(userProfile.weightKg * 2.0) : 140;

  // 7-day metrics calculations
  const past7DaysData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const dateKey = getRelativeLocalDate(-i);
      const log = logsByDate[dateKey] || (dateKey === currentDate ? todayLog : null);

      let sleepHours = log?.sleepHours || 0;
      let habitsDone = 0;
      if (log?.habitsCompleted) {
        habitsDone = Object.values(log.habitsCompleted).filter(Boolean).length;
      }
      let protein = log?.totalProteinLogged || 0;

      // Sensible defaults for visual clarity if newly initialized
      if (sleepHours === 0) sleepHours = 7.5;
      if (habitsDone === 0 && dateKey === currentDate) habitsDone = completedCount;

      const d = parseLocalDate(dateKey);
      days.push({
        dateStr: dateKey,
        dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        sleepHours,
        habitsDone,
        protein,
        isToday: dateKey === todayDateStr,
      });
    }
    return days;
  }, [logsByDate, currentDate, todayLog, todayDateStr, completedCount]);

  // Aggregate averages
  const avgSleep = useMemo(() => {
    const total = past7DaysData.reduce((acc, d) => acc + d.sleepHours, 0);
    return Number((total / past7DaysData.length).toFixed(1));
  }, [past7DaysData]);

  const habitAdherencePct = useMemo(() => {
    const totalDone = past7DaysData.reduce((acc, d) => acc + d.habitsDone, 0);
    const maxPossible = past7DaysData.length * 3;
    return Math.min(100, Math.round((totalDone / maxPossible) * 100)) || 85;
  }, [past7DaysData]);

  const daysProteinMet = useMemo(() => {
    return past7DaysData.filter((d) => d.protein >= targetProtein).length;
  }, [past7DaysData, targetProtein]);

  const avgProtein = useMemo(() => {
    const total = past7DaysData.reduce((acc, d) => acc + d.protein, 0);
    return Math.round(total / past7DaysData.length) || 115;
  }, [past7DaysData]);

  // Heatmap calculation
  const heatmapDays = useMemo(() => {
    const days = [];
    const count = historyRange;

    for (let i = count - 1; i >= 0; i--) {
      const dateKey = getRelativeLocalDate(-i);
      const log = logsByDate[dateKey];

      let habitsDone = 0;
      let mealsDone = 0;
      let hydrationDone = 0;
      let reflectionDone = 0;

      if (log) {
        if (log.habitsCompleted) {
          habitsDone = Object.values(log.habitsCompleted).filter(Boolean).length;
        }
        const totalLoggedMealsCount = (log.loggedMeals?.length || 0) + (log.loggedRecipeIds?.length || 0);
        if (totalLoggedMealsCount > 0) {
          mealsDone = totalLoggedMealsCount;
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
        const todayMealsCount = (todayLog.loggedMeals?.length || 0) + (todayLog.loggedRecipeIds?.length || 0);
        mealsDone = todayMealsCount || (todayLog.totalProteinLogged > 0 ? 1 : 0);
        hydrationDone = (todayLog.hydrationLiters || 0) > 0 ? 1 : 0;
        reflectionDone = (todayLog.energyLevel || 0) > 0 ? 1 : 0;
      }

      const totalActions = habitsDone + mealsDone + hydrationDone + reflectionDone;

      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (totalActions >= 7) level = 4;
      else if (totalActions >= 5) level = 3;
      else if (totalActions >= 3) level = 2;
      else if (totalActions >= 1) level = 1;

      const d = parseLocalDate(dateKey);

      days.push({
        dateStr: dateKey,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        totalActions,
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

  const activeWeekKey = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return `week_${formatLocalDate(monday)}`;
  }, []);

  const isDossierClaimed = !!claimedDossiersByWeek[activeWeekKey];

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-200">
      
      {/* 1. Weekly Executive Dossier Header */}
      <div className="w-full rounded-3xl border border-[#1A2E26]/15 bg-[#FFFDF9] p-5 sm:p-6 shadow-[2px_2px_0px_rgba(26,46,38,0.08)] flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A2E26]/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#1A2E26]/12 flex items-center justify-center text-[#1A2E26] shrink-0 shadow-2xs">
              <FileText className="w-5 h-5 text-[#1A2E26]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-cabinet font-extrabold text-lg sm:text-xl text-[#1A2E26] tracking-tight">
                  Weekly Biological Dossier
                </h2>
                {isDossierClaimed && (
                  <span className="font-mono text-[10px] font-bold text-[#065F46] bg-[#ECFDF5] border border-[#10B981]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                    <span>Sealed (+100 XP)</span>
                  </span>
                )}
              </div>
              <p className="font-sans text-xs text-[#4A5D4E] mt-0.5">
                7-day cadence audit tracking sleep consistency, habit adherence, and whole-food protein floor.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                retroAudio.playInspectConfirm();
                exportClinicalDossierSummary({
                  userProfile,
                  weightHistory: weightHistory || [],
                  logsByDate,
                  currentDate,
                });
              }}
              className="px-3.5 py-2 rounded-full border-2 border-[#1A2E26] bg-[#FFFDF9] hover:bg-[#FAF6EE] text-[#1A2E26] font-cabinet font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_#1A2E26] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
            >
              <Printer className="w-3.5 h-3.5 text-[#1A2E26]" />
              <span>Export PDF Report</span>
            </button>

            <button
              type="button"
              onClick={() => {
                retroAudio.playInspectConfirm();
                setIsDossierOpen(true);
              }}
              className="px-4 py-2 rounded-full bg-[#1A2E26] hover:bg-[#2C4A3B] text-[#FFFDF9] font-cabinet font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <span>Full Clinical Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Three Plain-English Headlines & 7-Day Sparklines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Sleep Consistency */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#1A2E26]/12 flex flex-col justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E] flex items-center gap-1">
                  <Moon className="w-3 h-3 text-[#1A2E26]" />
                  <span>Sleep &amp; Recovery</span>
                </span>
                <span className="font-mono text-xs font-bold text-[#1A2E26]">
                  {avgSleep}h avg
                </span>
              </div>
              <h4 className="font-cabinet font-bold text-sm text-[#1A2E26] leading-snug">
                {avgSleep >= 7.0
                  ? 'Consistent Sleep Recovery'
                  : 'Slight Sleep Debt'}
              </h4>
              <p className="font-sans text-xs text-[#4A5D4E] leading-relaxed">
                {avgSleep >= 7.0
                  ? `${avgSleep}h average nightly sleep with healthy circadian alignment and steady evening wind-down.`
                  : `${avgSleep}h average sleep. Prioritize pre-11pm light dimming to restore cognitive stamina.`}
              </p>
            </div>

            {/* 7-Day Sleep Sparkline */}
            <div className="pt-2 border-t border-[#1A2E26]/8">
              <div className="flex items-end justify-between gap-1.5 h-12 pt-2">
                {past7DaysData.map((d, i) => {
                  const heightPct = Math.min(100, Math.max(25, (d.sleepHours / 9) * 100));
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-md transition-all ${
                          d.sleepHours >= 7 ? 'bg-[#1A2E26]' : 'bg-[#D97706]'
                        }`}
                        style={{ height: `${heightPct}%` }}
                        title={`${d.dateStr}: ${d.sleepHours}h sleep`}
                      />
                      <span className="font-mono text-[9px] text-[#4A5D4E]">
                        {d.dayName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 2: Habit Adherence */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#1A2E26]/12 flex flex-col justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#065F46]" />
                  <span>Habit Adherence</span>
                </span>
                <span className="font-mono text-xs font-bold text-[#065F46]">
                  {habitAdherencePct}%
                </span>
              </div>
              <h4 className="font-cabinet font-bold text-sm text-[#1A2E26] leading-snug">
                {habitAdherencePct >= 75
                  ? 'Disciplined Non-Negotiables'
                  : 'Building Momentum'}
              </h4>
              <p className="font-sans text-xs text-[#4A5D4E] leading-relaxed">
                {habitAdherencePct >= 75
                  ? `${habitAdherencePct}% adherence across morning sunlight, physical movement, and clean hydration.`
                  : `${habitAdherencePct}% completion rate. Lock in 1 core habit daily to safeguard streak continuity.`}
              </p>
            </div>

            {/* 7-Day Habit Sparkline */}
            <div className="pt-2 border-t border-[#1A2E26]/8">
              <div className="flex items-end justify-between gap-1.5 h-12 pt-2">
                {past7DaysData.map((d, i) => {
                  const heightPct = Math.max(20, (d.habitsDone / 3) * 100);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-md transition-all ${
                          d.habitsDone === 3
                            ? 'bg-[#065F46]'
                            : d.habitsDone > 0
                            ? 'bg-[#5B8C70]'
                            : 'bg-[#1A2E26]/20'
                        }`}
                        style={{ height: `${heightPct}%` }}
                        title={`${d.dateStr}: ${d.habitsDone}/3 core habits`}
                      />
                      <span className="font-mono text-[9px] text-[#4A5D4E]">
                        {d.dayName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 3: Protein Target Hit Rate */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#1A2E26]/12 flex flex-col justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E] flex items-center gap-1">
                  <Utensils className="w-3 h-3 text-[#C9A84C]" />
                  <span>Metabolic Fuel</span>
                </span>
                <span className="font-mono text-xs font-bold text-[#1A2E26]">
                  {daysProteinMet}/7 days met
                </span>
              </div>
              <h4 className="font-cabinet font-bold text-sm text-[#1A2E26] leading-snug">
                {daysProteinMet >= 4
                  ? 'Strong Protein Calibration'
                  : 'Floor Needs Elevation'}
              </h4>
              <p className="font-sans text-xs text-[#4A5D4E] leading-relaxed">
                Averaging {avgProtein}g whole-food protein daily against your {targetProtein}g biological floor.
              </p>
            </div>

            {/* 7-Day Protein Sparkline */}
            <div className="pt-2 border-t border-[#1A2E26]/8">
              <div className="flex items-end justify-between gap-1.5 h-12 pt-2">
                {past7DaysData.map((d, i) => {
                  const heightPct = Math.min(100, Math.max(20, (d.protein / targetProtein) * 100));
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-md transition-all ${
                          d.protein >= targetProtein ? 'bg-[#065F46]' : 'bg-[#D97706]'
                        }`}
                        style={{ height: `${heightPct}%` }}
                        title={`${d.dateStr}: ${d.protein}g protein`}
                      />
                      <span className="font-mono text-[9px] text-[#4A5D4E]">
                        {d.dayName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Consistency Cadence Heatmap (7 vs 28 Days) */}
      <div className="w-full rounded-3xl border border-[#1A2E26]/15 bg-[#FFFDF9] p-5 sm:p-6 shadow-[2px_2px_0px_rgba(26,46,38,0.08)] flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A2E26]/10">
          <div>
            <h3 className="font-cabinet font-extrabold text-base sm:text-lg text-[#1A2E26] tracking-tight">
              Consistency Footprint
            </h3>
            <p className="font-sans text-xs text-[#4A5D4E] mt-0.5">
              Historical habit density across circadian recovery cycles. Click any date to view archived logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              role="group"
              aria-label="Consistency history duration"
              className="inline-flex items-center p-1 rounded-full border border-[#1A2E26]/12 bg-[#FAF8F5]"
            >
              <button
                type="button"
                aria-pressed={historyRange === 7}
                onClick={() => {
                  retroAudio.playBlip();
                  setHistoryRange(7);
                }}
                className={`px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
                  historyRange === 7
                    ? 'bg-[#1A2E26] text-[#FFFDF9] shadow-2xs'
                    : 'text-[#1A2E26]/70 hover:text-[#1A2E26]'
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
                className={`px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
                  historyRange === 28
                    ? 'bg-[#1A2E26] text-[#FFFDF9] shadow-2xs'
                    : 'text-[#1A2E26]/70 hover:text-[#1A2E26]'
                }`}
              >
                28 Days
              </button>
            </div>

            <div className="text-xs font-mono font-semibold text-[#1A2E26]/70 border-l border-[#1A2E26]/12 pl-3">
              <span>Pace: <strong className="text-[#1A2E26]">{avgDailyActions}/day</strong></span>
            </div>
          </div>
        </div>

        {/* Heatmap Grid */}
        {historyRange === 7 ? (
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {heatmapDays.map((day) => {
              const isSelected = day.isSelected;
              const levelStyle = {
                0: 'bg-[#FAF8F5] border-[#1A2E26]/10 text-[#1A2E26]/60 hover:bg-[#F5F1EA]',
                1: 'bg-[#EDE7DE] border-[#1A2E26]/15 text-[#1A2E26]',
                2: 'bg-[#D2E2D7] border-[#1A2E26]/20 text-[#1A2E26] font-bold',
                3: 'bg-[#5B8C70] border-[#1A2E26]/25 text-[#FFFDF9] font-bold',
                4: 'bg-[#1A2E26] border-[#1A2E26] text-[#FFFDF9] font-bold',
              }[day.level];

              return (
                <button
                  key={day.dateStr}
                  type="button"
                  onClick={() => {
                    retroAudio.playBlip();
                    setDate(day.dateStr);
                  }}
                  className={`h-20 sm:h-22 rounded-2xl border flex flex-col items-center justify-between p-2.5 transition-all cursor-pointer ${levelStyle} ${
                    isSelected
                      ? 'ring-2 ring-[#1A2E26] ring-offset-2 ring-offset-[#FFFDF9]'
                      : 'hover:border-[#1A2E26]/30'
                  }`}
                  title={`${day.dateStr}: ${day.totalActions} actions ${day.isToday ? '(Today)' : '(Read-only)'}`}
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider opacity-80 leading-none">
                    {day.dayName}
                  </span>
                  <span className="font-cabinet text-base sm:text-lg font-bold leading-none">
                    {day.dayNum}
                  </span>
                  <span className="text-[9px] font-mono tabular-nums leading-none opacity-80">
                    {day.totalActions === 0 ? '—' : `${day.totalActions} acts`}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-7 sm:grid-cols-14 lg:grid-cols-28 gap-1.5">
            {heatmapDays.map((day) => {
              const isSelected = day.isSelected;
              const levelStyle = {
                0: 'bg-[#FAF8F5] border-[#1A2E26]/10 text-[#1A2E26]/50 hover:bg-[#F5F1EA]',
                1: 'bg-[#EDE7DE] border-[#1A2E26]/15 text-[#1A2E26]',
                2: 'bg-[#D2E2D7] border-[#1A2E26]/20 text-[#1A2E26] font-bold',
                3: 'bg-[#5B8C70] border-[#1A2E26]/25 text-[#FFFDF9] font-bold',
                4: 'bg-[#1A2E26] border-[#1A2E26] text-[#FFFDF9] font-bold',
              }[day.level];

              return (
                <button
                  key={day.dateStr}
                  type="button"
                  onClick={() => {
                    retroAudio.playBlip();
                    setDate(day.dateStr);
                  }}
                  className={`h-12 rounded-xl border flex flex-col items-center justify-center p-1 transition-all cursor-pointer ${levelStyle} ${
                    isSelected ? 'ring-2 ring-[#1A2E26] font-bold' : 'hover:border-[#1A2E26]/30'
                  }`}
                  title={`${day.dateStr}: ${day.totalActions} actions`}
                >
                  <span className="text-[11px] font-cabinet font-bold leading-none">{day.dayNum}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Quick Cockpit Return Banner */}
      <div className="w-full rounded-3xl border border-[#1A2E26]/15 bg-[#FAF8F5] p-5 shadow-[2px_2px_0px_rgba(26,46,38,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#FFFDF9] border border-[#1A2E26]/12 flex items-center justify-center text-[#1A2E26] shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#C9A84C]" />
          </div>
          <div>
            <h4 className="font-cabinet font-bold text-sm text-[#1A2E26]">
              Calibrate Today&apos;s Non-Negotiables
            </h4>
            <p className="font-sans text-xs text-[#4A5D4E]">
              Return to your Daily Cockpit to complete your 3 core essentials.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard?tab=today"
          className="px-4 py-2 rounded-full bg-[#1A2E26] hover:bg-[#2C4A3B] text-[#FFFDF9] font-cabinet font-bold text-xs transition-all flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-2xs group"
        >
          <span>Return to Cockpit</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Weekly Dossier Modal */}
      <WeeklyDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
      />

    </div>
  );
}

