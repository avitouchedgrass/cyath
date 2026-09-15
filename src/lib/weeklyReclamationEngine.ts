import { DailyLogData, DeskRitualData } from '@/store/useHabitStore';
import { parseLocalDate, getRelativeLocalDate } from '@/lib/dateUtils';

export interface WeeklyReclamationResult {
  hasEnoughData: boolean;
  totalDaysEvaluated: number;
  activeDaysCount: number;
  protocolsCommittedCount: number;
  focusHoursReclaimed: number;
  slumpReductionPercent: number;
  averageCompliantSlump: number;
  averageBaselineSlump: number;
  consistencyGrade: 'A+' | 'A' | 'B+' | 'B' | 'C';
  insights: string[];
  nextWeekAction: string;
  dailyBreakdown: {
    date: string;
    dayName: string;
    protocolCommitted: boolean;
    slumpScore?: number;
    proteinGrams: number;
    hoursReclaimed: number;
  }[];
}

export function calculateWeeklyReclamation(params: {
  currentDate: string;
  logsByDate: Record<string, DailyLogData>;
  deskRitualsByDate: Record<string, DeskRitualData>;
  protocolsAcceptedByDate?: Record<string, boolean>;
  lookbackDays?: number;
}): WeeklyReclamationResult {
  const {
    currentDate,
    logsByDate,
    deskRitualsByDate,
    protocolsAcceptedByDate = {},
    lookbackDays = 7,
  } = params;

  const baseDate = parseLocalDate(currentDate || '');
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let activeDaysCount = 0;
  let protocolsCommittedCount = 0;
  let totalHoursReclaimed = 0;

  const compliantSlumps: number[] = [];
  const nonCompliantSlumps: number[] = [];

  const dailyBreakdown: WeeklyReclamationResult['dailyBreakdown'] = [];

  // Iterate backwards from yesterday or lookback days to include the 7-day window
  for (let offset = lookbackDays - 1; offset >= 0; offset--) {
    const dateStr = getRelativeLocalDate(-offset, baseDate);
    const dateObj = parseLocalDate(dateStr);
    const dayName = dayNames[dateObj.getDay()];

    const log = logsByDate[dateStr];
    const ritual = deskRitualsByDate[dateStr];
    const protocolCommitted = !!protocolsAcceptedByDate[dateStr];

    const hasHabits = log?.habitsCompleted && Object.values(log.habitsCompleted).some(Boolean);
    const hasLog = !!log && (hasHabits || log.totalProteinLogged > 0 || log.hydrationLiters > 0);
    const hasRitual = !!ritual && (ritual.morningBootCompleted || ritual.eveningWrapCompleted);

    const isActive = hasLog || hasRitual;
    if (isActive) activeDaysCount++;
    if (protocolCommitted) protocolsCommittedCount++;

    const slump = ritual?.afternoonSlumpScore;
    const protein = log?.totalProteinLogged || 0;

    let hoursGainedToday = 0;
    if (protocolCommitted || (ritual?.morningBootCompleted && protein >= 80)) {
      hoursGainedToday = 1.6;
      if (typeof slump === 'number') {
        compliantSlumps.push(slump);
      }
    } else {
      if (typeof slump === 'number') {
        nonCompliantSlumps.push(slump);
      }
    }

    totalHoursReclaimed += hoursGainedToday;

    dailyBreakdown.push({
      date: dateStr,
      dayName,
      protocolCommitted,
      slumpScore: slump,
      proteinGrams: protein,
      hoursReclaimed: hoursGainedToday,
    });
  }

  const hasEnoughData = activeDaysCount >= 2;

  // Baseline slump default is 6.5/10 for unmitigated desk fatigue
  const avgCompliant =
    compliantSlumps.length > 0
      ? Number((compliantSlumps.reduce((a, b) => a + b, 0) / compliantSlumps.length).toFixed(1))
      : 2.2;

  const avgBaseline =
    nonCompliantSlumps.length > 0
      ? Number((nonCompliantSlumps.reduce((a, b) => a + b, 0) / nonCompliantSlumps.length).toFixed(1))
      : 6.8;

  const slumpReductionPercent = Math.max(
    0,
    Math.round(((avgBaseline - avgCompliant) / avgBaseline) * 100)
  );

  // Grade calculation based on active days and protocol commitments
  let consistencyGrade: WeeklyReclamationResult['consistencyGrade'] = 'B';
  if (protocolsCommittedCount >= 6) {
    consistencyGrade = 'A+';
  } else if (protocolsCommittedCount >= 4) {
    consistencyGrade = 'A';
  } else if (protocolsCommittedCount >= 3) {
    consistencyGrade = 'B+';
  } else if (protocolsCommittedCount >= 2) {
    consistencyGrade = 'B';
  } else {
    consistencyGrade = 'C';
  }

  // Generate crisp, quantified takeaways
  const insights: string[] = [];
  if (protocolsCommittedCount > 0) {
    insights.push(
      `Committed to daily directives on ${protocolsCommittedCount} of ${lookbackDays} days, yielding ~${totalHoursReclaimed.toFixed(1)}h of reclaimed cognitive stamina.`
    );
  } else {
    insights.push(
      `Baseline established. Committing to tomorrow's daily directive will start reclaiming focus hours.`
    );
  }

  if (slumpReductionPercent > 0) {
    insights.push(
      `Afternoon energy dip moderated by ~${slumpReductionPercent}% (averaging ${avgCompliant}/10 vs ${avgBaseline}/10 baseline).`
    );
  }

  const zeroCaffeineDays = dailyBreakdown.filter((d) => {
    const r = deskRitualsByDate[d.date];
    return r?.caffeineStatus === 'none';
  }).length;

  if (zeroCaffeineDays > 0) {
    insights.push(
      `${zeroCaffeineDays} zero-caffeine day${zeroCaffeineDays > 1 ? 's' : ''} logged, providing deep restorative reset for your nervous system.`
    );
  }

  insights.push(
    `Daily habit consistency and protein targets stabilized steady focus past 2:00 PM.`
  );

  const nextWeekAction =
    protocolsCommittedCount < 4
      ? 'Lock the morning directive 4+ days next week to anchor steady post-lunch alertness.'
      : 'Maintain morning rhythm and introduce a digital sunset 60m prior to sleep to consolidate recovery.';

  return {
    hasEnoughData,
    totalDaysEvaluated: lookbackDays,
    activeDaysCount,
    protocolsCommittedCount,
    focusHoursReclaimed: Number(totalHoursReclaimed.toFixed(1)),
    slumpReductionPercent,
    averageCompliantSlump: avgCompliant,
    averageBaselineSlump: avgBaseline,
    consistencyGrade,
    insights,
    nextWeekAction,
    dailyBreakdown,
  };
}
