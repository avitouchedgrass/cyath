import { describe, it, expect, beforeEach } from 'vitest';
import { useHabitStore, CUSTOM_HABITS_LIBRARY, TROPHIES_ROSTER } from '@/store/useHabitStore';

describe('Cyath 10/10 Transformation Store Logic', () => {
  beforeEach(() => {
    useHabitStore.setState({
      currentDate: '2026-09-18',
      habits: [
        { id: 'sunlight', title: 'Morning Sunlight', category: 'morning', targetDaysPerWeek: 7 },
        { id: 'hydration', title: 'Hydration Target', category: 'nutrition', targetDaysPerWeek: 7 },
        { id: 'protein_target', title: 'Whole-Food Protein', category: 'nutrition', targetDaysPerWeek: 7 },
      ],
      logsByDate: {
        '2026-09-18': {
          habitsCompleted: {},
          totalProteinLogged: 0,
          totalCaloriesLogged: 0,
          hydrationLiters: 0,
          sleepHours: 7.5,
          energyLevel: 7,
          moodScore: 8,
          notes: '',
          loggedRecipeIds: [],
          loggedMeals: [],
          isDownscaled: false,
          quickPlateType: null,
          retentionCohortDay: 0,
        },
      },
      streakCount: 0,
      streakFreezeStock: 1,
      isForgedStreak: false,
      isReentryAvailable: false,
      isLedgerSealedByDate: {},
      unlockedTrophies: [],
      pendingTrophyUnlock: null,
      userProfile: {
        fullName: 'Sol Operator',
        age: 28,
        sex: 'other',
        heightCm: 180,
        weightKg: 75,
        wakeTime: '07:30',
        bedTime: '23:30',
        primaryGoal: 'focus',
        allergies: [],
        dietaryRestrictions: [],
        onboardingCompleted: true,
      },
    });
  });

  it('updates circadian schedule with personalized wake and sleep times', () => {
    const { setCircadianSchedule } = useHabitStore.getState();
    setCircadianSchedule('06:00', '22:00');

    const profile = useHabitStore.getState().userProfile;
    expect(profile?.wakeTime).toBe('06:00');
    expect(profile?.bedTime).toBe('22:00');
  });

  it('adds 4th custom power habit slot seamlessly', () => {
    const { setCustomHabitSlot } = useHabitStore.getState();
    setCustomHabitSlot('creatine');

    const state = useHabitStore.getState();
    expect(state.userProfile?.customHabitSlot).toBe('creatine');
    expect(state.habits.some((h) => h.id === 'creatine')).toBe(true);
  });

  it('seals daily ledger, awards +50 XP and marks date as sealed', () => {
    const { sealDailyLedger } = useHabitStore.getState();
    const result = sealDailyLedger('2026-09-18');

    expect(result.success).toBe(true);
    expect(result.xpAwarded).toBe(50);
    expect(useHabitStore.getState().isLedgerSealedByDate['2026-09-18']).toBe(true);

    // Idempotent: cannot seal twice
    const secondTry = sealDailyLedger('2026-09-18');
    expect(secondTry.success).toBe(false);
  });

  it('activates Grace Re-entry Protocol restoring broken streak as Forged Streak', () => {
    const { activateReentryProtocol } = useHabitStore.getState();
    const result = activateReentryProtocol('2026-09-18');

    expect(result.success).toBe(true);
    expect(useHabitStore.getState().isForgedStreak).toBe(true);
    expect(useHabitStore.getState().streakCount).toBeGreaterThanOrEqual(2);
  });

  it('unlocks trophy and sets pending unlock celebration banner', () => {
    const { unlockTrophy, dismissPendingTrophy } = useHabitStore.getState();
    const unlocked = unlockTrophy('iron_anchor');

    expect(unlocked).toBe(true);
    expect(useHabitStore.getState().unlockedTrophies).toContain('iron_anchor');
    expect(useHabitStore.getState().pendingTrophyUnlock?.id).toBe('iron_anchor');

    dismissPendingTrophy();
    expect(useHabitStore.getState().pendingTrophyUnlock).toBeNull();
  });
});
