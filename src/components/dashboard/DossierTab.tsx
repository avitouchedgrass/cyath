'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useHabitStore } from '@/store/useHabitStore';
import { retroAudio } from '@/lib/retroAudio';
import { formatLocalDate, getRelativeLocalDate, parseLocalDate } from '@/lib/dateUtils';
import { WeeklyDossierModal } from '@/components/dashboard/WeeklyDossierModal';
import {
  FileText,
  ArrowRight,
  Sparkles,
  CheckCircle2,
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
    claimedDossiersByWeek,
  } = useHabitStore();

  const todayDateStr = useMemo(() => formatLocalDate(), []);
  const todayLog = getDailyLog(currentDate);

  const completedCount = useMemo(() => {
    return habits.filter((h) => todayLog.habitsCompleted[h.id]).length;
  }, [habits, todayLog.habitsCompleted]);

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
      
      {/* 1. 7-Day Energy Reclamation Dossier Hero Card */}
      <div className="w-full rounded-3xl border border-[#1A3629]/10 bg-[#FFFDF9] p-5 sm:p-6 shadow-[0_2px_12px_rgba(26,54,41,0.03)] flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A3629]/8">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#FAF8F5] border border-[#1A3629]/10 flex items-center justify-center text-[#1A3629] shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-cabinet font-extrabold text-lg sm:text-xl text-[#1A3629] tracking-tight">
                  7-Day Energy Reclamation Dossier
                </h2>
                {isDossierClaimed && (
                  <span className="font-mono text-[10px] font-semibold text-[#1A3629] bg-[#FAF8F5] border border-[#1A3629]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#1A3629]" />
                    <span>Sealed (+100 XP)</span>
                  </span>
                )}
              </div>
              <p className="font-sans text-xs text-[#4A5D4E] mt-0.5">
                Quantified biological audit measuring cognitive stamina and focus hours.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              retroAudio.playInspectConfirm();
              setIsDossierOpen(true);
            }}
            className="px-4 py-2 rounded-full bg-[#1A3629] hover:bg-[#2C4A3B] text-[#FFFDF9] font-cabinet font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto shadow-2xs"
          >
            <span>Open Clinical Dossier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Metric High-Impact Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#1A3629]/10 flex flex-col gap-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E]">
              Reclaimed Focus Hours
            </span>
            <span className="font-cabinet font-extrabold text-2xl text-[#1A3629]">
              {userProfile?.energyAudit?.hoursLostPerDay ? (userProfile.energyAudit.hoursLostPerDay * 5.2).toFixed(1) : '14.5'} hrs
            </span>
            <span className="font-sans text-[11px] text-[#1A3629] font-medium">
              ↑ 22% vs baseline cycle
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#1A3629]/10 flex flex-col gap-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E]">
              Afternoon Slump Reduction
            </span>
            <span className="font-cabinet font-extrabold text-2xl text-[#1A3629]">
              -64%
            </span>
            <span className="font-sans text-[11px] text-[#4A5D4E] font-medium">
              Driven by 90m caffeine delay
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#1A3629]/10 flex flex-col gap-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E]">
              Consistency Density
            </span>
            <span className="font-cabinet font-extrabold text-2xl text-[#1A3629]">
              {totalHeatmapActions} actions
            </span>
            <span className="font-sans text-[11px] text-[#4A5D4E] font-medium">
              {avgDailyActions} daily pace
            </span>
          </div>
        </div>
      </div>

      {/* 2. Consistency Cadence Heatmap (7 vs 28 Days) */}
      <div className="w-full rounded-3xl border border-[#1A3629]/10 bg-[#FFFDF9] p-5 sm:p-6 shadow-[0_2px_12px_rgba(26,54,41,0.03)] flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A3629]/8">
          <div>
            <h3 className="font-cabinet font-extrabold text-base sm:text-lg text-[#1A3629] tracking-tight">
              Consistency Footprint
            </h3>
            <p className="font-sans text-xs text-[#4A5D4E] mt-0.5">
              Historical habit density across circadian recovery cycles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              role="group"
              aria-label="Consistency history duration"
              className="inline-flex items-center p-1 rounded-full border border-[#1A3629]/10 bg-[#FAF8F5]"
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
                    ? 'bg-[#1A3629] text-[#FFFDF9] shadow-2xs'
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
                className={`px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
                  historyRange === 28
                    ? 'bg-[#1A3629] text-[#FFFDF9] shadow-2xs'
                    : 'text-[#1A3629]/70 hover:text-[#1A3629]'
                }`}
              >
                28 Days
              </button>
            </div>

            <div className="text-xs font-mono font-semibold text-[#1A3629]/70 border-l border-[#1A3629]/10 pl-3">
              <span>Pace: <strong className="text-[#1A3629]">{avgDailyActions}/day</strong></span>
            </div>
          </div>
        </div>

        {/* Heatmap Grid */}
        {historyRange === 7 ? (
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {heatmapDays.map((day) => {
              const isSelected = day.isSelected;
              const levelStyle = {
                0: 'bg-[#FAF8F5] border-[#1A3629]/10 text-[#1A3629]/60 hover:bg-[#F5F1EA]',
                1: 'bg-[#EDE7DE] border-[#1A3629]/15 text-[#1A3629]',
                2: 'bg-[#D2E2D7] border-[#1A3629]/20 text-[#1A3629] font-bold',
                3: 'bg-[#5B8C70] border-[#1A3629]/25 text-[#FFFDF9] font-bold',
                4: 'bg-[#1A3629] border-[#1A3629] text-[#FFFDF9] font-bold',
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
                      ? 'ring-2 ring-[#1A3629] ring-offset-2 ring-offset-[#FFFDF9]'
                      : 'hover:border-[#1A3629]/30'
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
                0: 'bg-[#FAF8F5] border-[#1A3629]/10 text-[#1A3629]/50 hover:bg-[#F5F1EA]',
                1: 'bg-[#EDE7DE] border-[#1A3629]/15 text-[#1A3629]',
                2: 'bg-[#D2E2D7] border-[#1A3629]/20 text-[#1A3629] font-bold',
                3: 'bg-[#5B8C70] border-[#1A3629]/25 text-[#FFFDF9] font-bold',
                4: 'bg-[#1A3629] border-[#1A3629] text-[#FFFDF9] font-bold',
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
                    isSelected ? 'ring-2 ring-[#1A3629] font-bold' : 'hover:border-[#1A3629]/30'
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

      {/* 3. Pattern Correlation Teaser Card */}
      <div className="w-full rounded-3xl border border-[#1A3629]/10 bg-[#FFFDF9] p-5 shadow-[0_2px_12px_rgba(26,54,41,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#FAF8F5] border border-[#1A3629]/10 flex items-center justify-center text-[#1A3629] shrink-0">
            <Sparkles className="w-4 h-4 text-[#C9A84C]" />
          </div>
          <div>
            <h4 className="font-cabinet font-bold text-sm text-[#1A3629]">
              Biological Pattern Correlation Matrix
            </h4>
            <p className="font-sans text-xs text-[#4A5D4E]">
              Discover how whole-food protein and circadian light directly calibrate daytime stamina.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard?tab=today"
          className="px-4 py-1.5 rounded-full border border-[#1A3629]/15 bg-[#FAF8F5] hover:bg-[#1A3629] hover:text-[#FFFDF9] text-[#1A3629] font-cabinet font-bold text-xs transition-all flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-2xs"
        >
          <span>Return to Cockpit →</span>
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
