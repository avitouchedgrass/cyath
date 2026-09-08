import { describe, it, expect } from 'vitest';
import { calculateWeeklyReclamation } from '../weeklyReclamationEngine';
import { DailyLogData, DeskRitualData } from '@/store/useHabitStore';

describe('weeklyReclamationEngine', () => {
  it('calculates reclaimed hours and correlation for active week', () => {
    const today = '2026-09-08';
    const logsByDate: Record<string, DailyLogData> = {
      '2026-09-08': {
        habitsCompleted: { sunlight: true },
        totalProteinLogged: 120,
        totalCaloriesLogged: 2000,
        hydrationLiters: 2.5,
        sleepHours: 8,
        energyLevel: 8,
        moodScore: 8,
        notes: '',
        loggedRecipeIds: [],
      },
      '2026-09-07': {
        habitsCompleted: { sunlight: true },
        totalProteinLogged: 140,
        totalCaloriesLogged: 2200,
        hydrationLiters: 3.0,
        sleepHours: 7.5,
        energyLevel: 7,
        moodScore: 7,
        notes: '',
        loggedRecipeIds: [],
      },
      '2026-09-06': {
        habitsCompleted: { sunlight: true },
        totalProteinLogged: 100,
        totalCaloriesLogged: 1900,
        hydrationLiters: 2.0,
        sleepHours: 7,
        energyLevel: 6,
        moodScore: 7,
        notes: '',
        loggedRecipeIds: [],
      },
    };

    const deskRitualsByDate: Record<string, DeskRitualData> = {
      '2026-09-08': {
        morningBootCompleted: true,
        morningRestedRating: 8,
        afternoonSlumpScore: 2,
        eveningWrapCompleted: true,
      },
      '2026-09-07': {
        morningBootCompleted: true,
        morningRestedRating: 7,
        afternoonSlumpScore: 3,
        eveningWrapCompleted: true,
      },
      '2026-09-06': {
        morningBootCompleted: true,
        morningRestedRating: 6,
        afternoonSlumpScore: 5,
        eveningWrapCompleted: false,
      },
    };

    const protocolsAcceptedByDate = {
      '2026-09-08': true,
      '2026-09-07': true,
      '2026-09-06': true,
    };

    const result = calculateWeeklyReclamation({
      currentDate: today,
      logsByDate,
      deskRitualsByDate,
      protocolsAcceptedByDate,
      lookbackDays: 7,
    });

    expect(result.hasEnoughData).toBe(true);
    expect(result.activeDaysCount).toBe(3);
    expect(result.protocolsCommittedCount).toBe(3);
    expect(result.focusHoursReclaimed).toBeGreaterThanOrEqual(4.5);
    expect(result.averageCompliantSlump).toBeLessThanOrEqual(3.5);
    expect(result.slumpReductionPercent).toBeGreaterThan(0);
    expect(result.dailyBreakdown).toHaveLength(7);
  });

  it('handles brand new account with 0 or 1 day of logs gracefully', () => {
    const result = calculateWeeklyReclamation({
      currentDate: '2026-09-08',
      logsByDate: {},
      deskRitualsByDate: {},
    });

    expect(result.hasEnoughData).toBe(false);
    expect(result.activeDaysCount).toBe(0);
    expect(result.focusHoursReclaimed).toBe(0);
    expect(result.consistencyGrade).toBe('C');
    expect(result.dailyBreakdown).toHaveLength(7);
  });
});
