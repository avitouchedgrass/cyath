import { describe, it, expect, vi } from 'vitest';
import {
  xpToReachLevel,
  TITLE_RANKS,
  STREAK_MILESTONES,
  MAX_LEVEL,
} from '../config';
import {
  calculateLevel,
  getDailyQuests,
  calculateStreakStatus,
} from '../engine';
import { progressionEvents } from '../events';
import type { DailyLogData, HabitItem } from '@/store/useHabitStore';

describe('Progression Math & Levels', () => {
  it('starts at level 1 with 0 XP', () => {
    const p = calculateLevel(0);
    expect(p.level).toBe(1);
    expect(p.title).toBe('Wanderer');
    expect(p.currentLevelXp).toBe(0);
    expect(p.progressPercent).toBe(0);
    expect(p.isMaxLevel).toBe(false);
  });

  it('correctly calculates progression between levels', () => {
    const lvl2Xp = xpToReachLevel(2);
    const lvl3Xp = xpToReachLevel(3);
    const halfway = lvl2Xp + Math.round((lvl3Xp - lvl2Xp) / 2);

    const progress = calculateLevel(halfway);
    expect(progress.level).toBe(2);
    expect(progress.progressPercent).toBeGreaterThanOrEqual(48);
    expect(progress.progressPercent).toBeLessThanOrEqual(52);
  });

  it('caps at MAX_LEVEL 50 with Mythic of the Wild title', () => {
    const lvl50Xp = xpToReachLevel(MAX_LEVEL);
    const maxProgress = calculateLevel(lvl50Xp + 5000);

    expect(maxProgress.level).toBe(MAX_LEVEL);
    expect(maxProgress.title).toBe('Mythic of the Wild');
    expect(maxProgress.progressPercent).toBe(100);
    expect(maxProgress.isMaxLevel).toBe(true);
  });

  it('assigns correct title ranks according to minLevel', () => {
    for (const rank of TITLE_RANKS) {
      const xp = xpToReachLevel(rank.minLevel);
      const progress = calculateLevel(xp);
      expect(progress.title).toBe(rank.name);
    }
  });
});

describe('Daily Quests Engine', () => {
  const dummyHabits: HabitItem[] = [
    { id: 'sunlight', title: 'Sunlight', category: 'morning', targetDaysPerWeek: 7 },
    { id: 'protein', title: 'Protein', category: 'nutrition', targetDaysPerWeek: 7 },
  ];

  const emptyLog: DailyLogData = {
    habitsCompleted: {},
    totalProteinLogged: 0,
    totalCaloriesLogged: 0,
    hydrationLiters: 0,
    sleepHours: 0,
    energyLevel: 0,
    moodScore: 0,
    notes: '',
    loggedRecipeIds: [],
  };

  it('returns deterministic 3 quests for a given date', () => {
    const questsDay1 = getDailyQuests('2026-08-27', emptyLog, dummyHabits);
    const questsDay1Repeat = getDailyQuests('2026-08-27', emptyLog, dummyHabits);

    expect(questsDay1.length).toBe(3);
    expect(questsDay1.map((q) => q.id)).toEqual(questsDay1Repeat.map((q) => q.id));
  });

  it('evaluates progress correctly based on daily logs', () => {
    const activeLog: DailyLogData = {
      ...emptyLog,
      habitsCompleted: { sunlight: true },
      totalProteinLogged: 130,
      hydrationLiters: 2.5,
      sleepHours: 8,
      loggedRecipeIds: ['herb-grilled-chicken'],
    };

    const quests = getDailyQuests('2026-08-27', activeLog, dummyHabits);
    for (const quest of quests) {
      if (quest.id === 'morning_activation') {
        expect(quest.completed).toBe(true);
        expect(quest.progress).toBe(1);
      }
      if (quest.id === 'protein_target') {
        expect(quest.completed).toBe(true);
        expect(quest.progress).toBe(120);
      }
    }
  });
});

describe('Streak Calculation & Freeze Protection', () => {
  it('calculates continuous streak of active days', () => {
    const logs: Record<string, DailyLogData> = {
      '2026-08-27': {
        habitsCompleted: { sunlight: true },
        totalProteinLogged: 50,
        totalCaloriesLogged: 500,
        hydrationLiters: 1.5,
        sleepHours: 7,
        energyLevel: 8,
        moodScore: 8,
        notes: '',
        loggedRecipeIds: [],
      },
      '2026-08-26': {
        habitsCompleted: { sunlight: true },
        totalProteinLogged: 50,
        totalCaloriesLogged: 500,
        hydrationLiters: 1.5,
        sleepHours: 7,
        energyLevel: 8,
        moodScore: 8,
        notes: '',
        loggedRecipeIds: [],
      },
      '2026-08-25': {
        habitsCompleted: { sunlight: true },
        totalProteinLogged: 50,
        totalCaloriesLogged: 500,
        hydrationLiters: 1.5,
        sleepHours: 7,
        energyLevel: 8,
        moodScore: 8,
        notes: '',
        loggedRecipeIds: [],
      },
    };

    const status = calculateStreakStatus(logs, '2026-08-27', 1);
    expect(status.currentStreak).toBe(3);
    expect(status.milestoneAchievedToday?.name).toBe('Kindling');
  });

  it('uses streak freeze when a day is missed', () => {
    const logs: Record<string, DailyLogData> = {
      '2026-08-27': {
        habitsCompleted: { sunlight: true },
        totalProteinLogged: 50,
        totalCaloriesLogged: 500,
        hydrationLiters: 1.5,
        sleepHours: 7,
        energyLevel: 8,
        moodScore: 8,
        notes: '',
        loggedRecipeIds: [],
      },
      // 2026-08-26 missed!
      '2026-08-25': {
        habitsCompleted: { sunlight: true },
        totalProteinLogged: 50,
        totalCaloriesLogged: 500,
        hydrationLiters: 1.5,
        sleepHours: 7,
        energyLevel: 8,
        moodScore: 8,
        notes: '',
        loggedRecipeIds: [],
      },
    };

    const statusWithFreeze = calculateStreakStatus(logs, '2026-08-27', 1);
    expect(statusWithFreeze.currentStreak).toBe(3);
    expect(statusWithFreeze.freezeUsedYesterday).toBe(true);
    expect(statusWithFreeze.freezeStock).toBe(0);

    const statusWithoutFreeze = calculateStreakStatus(logs, '2026-08-27', 0);
    expect(statusWithoutFreeze.currentStreak).toBe(1);
    expect(statusWithoutFreeze.freezeUsedYesterday).toBe(false);
  });
});

describe('Progression Event Bus', () => {
  it('subscribes and emits events, and cleans up on unsubscribe', () => {
    const xpHandler = vi.fn();
    const unsub = progressionEvents.on('xp:gained', xpHandler);

    progressionEvents.emit('xp:gained', {
      amount: 25,
      reason: 'Dawn Ignition Quest',
      totalXp: 150,
    });

    expect(xpHandler).toHaveBeenCalledTimes(1);
    expect(xpHandler).toHaveBeenCalledWith({
      amount: 25,
      reason: 'Dawn Ignition Quest',
      totalXp: 150,
    });

    unsub();
    progressionEvents.emit('xp:gained', {
      amount: 15,
      reason: 'Habit Completed',
      totalXp: 165,
    });

    expect(xpHandler).toHaveBeenCalledTimes(1);
  });
});
