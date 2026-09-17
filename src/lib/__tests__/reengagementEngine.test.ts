import { describe, it, expect } from 'vitest';
import { evaluateUserActivity } from '../notifications/reengagementEngine';
import { DailyLogData } from '@/store/useHabitStore';

describe('reengagementEngine', () => {
  it('detects inactivity when 24h+ has passed since last check-in', () => {
    const logs: Record<string, DailyLogData> = {
      '2026-09-01': {
        habitsCompleted: { sunlight: true },
        totalProteinLogged: 120,
        totalCaloriesLogged: 2000,
        hydrationLiters: 2.5,
        sleepHours: 7.5,
        energyLevel: 8,
        moodScore: 8,
        notes: '',
        loggedRecipeIds: [],
      },
    };

    // Current date is 2 days later (48 hours)
    const result = evaluateUserActivity(logs, '2026-09-03');
    expect(result.isInactivityDetected).toBe(true);
    expect(result.hoursInactive).toBeGreaterThanOrEqual(48);
    expect(result.reentryPrompt).toContain('High-friction period detected');
    expect(result.reentryPrompt).not.toContain('lost');
    expect(result.reentryPrompt).not.toContain('failed');
  });

  it('does not detect inactivity when user logged activity today or yesterday (< 24h)', () => {
    const logs: Record<string, DailyLogData> = {
      '2026-09-02': {
        habitsCompleted: { sunlight: true },
        totalProteinLogged: 100,
        totalCaloriesLogged: 1800,
        hydrationLiters: 2.0,
        sleepHours: 7.0,
        energyLevel: 7,
        moodScore: 7,
        notes: '',
        loggedRecipeIds: [],
      },
    };

    const result = evaluateUserActivity(logs, '2026-09-02');
    expect(result.isInactivityDetected).toBe(false);
    expect(result.hoursInactive).toBe(0);
  });
});
