import { describe, it, expect, beforeEach } from 'vitest';
import { calculateBiometricXp } from '../biometricXp';
import { ISLAND_SUITES, getIslandTier } from '../progression/config';
import { useHabitStore } from '../../store/useHabitStore';

describe('Punny Island Suites & Biome Names', () => {
  it('contains the newly renamed punny suites', () => {
    expect(ISLAND_SUITES.circadian.name).toBe('The Pillow Fighter');
    expect(ISLAND_SUITES.iron.name).toBe('The Whey Station');
    expect(ISLAND_SUITES.focus.name).toBe('Ctrl+Alt+Defeat');
  });

  it('provides funny punny tier titles for all suites across progression', () => {
    const circadianT1 = getIslandTier(1, 'circadian');
    expect(circadianT1.name).toBe('Bedrock Bottom');

    const ironT1 = getIslandTier(1, 'iron');
    expect(ironT1.name).toBe('The Anvil & Egg');

    const focusT1 = getIslandTier(1, 'focus');
    expect(focusT1.name).toBe('Single Tab Island');

    const circadianT10 = getIslandTier(50, 'circadian');
    expect(circadianT10.name).toBe('The Eden Coma Canopy');

    const ironT10 = getIslandTier(50, 'iron');
    expect(ironT10.name).toBe('The Colossus Anabolic Core');

    const focusT10 = getIslandTier(50, 'focus');
    expect(focusT10.name).toBe('The Aether Zen Citadel');
  });
});

describe('Island Progression XP Balancing', () => {
  it('awards circadian sleep & morning habits balanced XP comparable to nutrition', () => {
    // Perfect Circadian metrics: 8h sleep, morning rested 9, wake anchor, 15m sunlight, bedtime sunset
    const circadianYield = calculateBiometricXp({
      sleepDurationHours: 8,
      sunlightSecured: true,
      sunlightMinutes: 15,
      morningRestedRating: 9,
      wakeConsistencyAnchor: true,
      digitalSunsetSecured: true,
      breakfastDone: null,
      lunchDone: null,
      dinnerDone: null,
      caffeineRespected: null,
      customHabitsCompletedCount: 0,
    });

    const circadianSleepMetricsTotal =
      circadianYield.sleepXp +
      circadianYield.sunlightXp +
      circadianYield.morningRestedXp +
      circadianYield.wakeConsistencyXp +
      circadianYield.digitalSunsetXp;

    // Sleep (45) + Rested (20) + Wake Anchor (20) + Sunlight (30) + Digital Sunset (20) = 135 XP
    expect(circadianSleepMetricsTotal).toBeGreaterThanOrEqual(120);
    expect(circadianSleepMetricsTotal).toBeLessThanOrEqual(160);
  });

  it('balances nutrition metrics without overshadowing circadian or focus potential', () => {
    // Nutrition with breakfast, lunch, and dinner hit
    const nutritionYield = calculateBiometricXp({
      sleepDurationHours: 0,
      sunlightSecured: null,
      breakfastDone: true,
      lunchDone: true,
      dinnerDone: true,
      caffeineRespected: true,
      customHabitsCompletedCount: 0,
    });

    const nutritionTotal =
      nutritionYield.breakfastXp +
      nutritionYield.lunchXp +
      nutritionYield.dinnerXp +
      nutritionYield.caffeineXp;

    // 25 + 25 + 25 + 15 = 90 XP
    expect(nutritionTotal).toBeGreaterThanOrEqual(75);
    expect(nutritionTotal).toBeLessThanOrEqual(110);
  });
});

describe('Partial Debrief Seal & Meal Amendment', () => {
  beforeEach(() => {
    useHabitStore.setState({
      currentDate: '2026-10-04',
      isLedgerSealedByDate: {},
      isLedgerPartiallySealedByDate: {},
      dailyDebriefLog: {},
      totalXp: 100,
    });
  });

  it('allows sealing ledger as partial when meals are pending', () => {
    const store = useHabitStore.getState();
    const sealResult = store.sealDailyLedger('2026-10-04', 50, [], true);

    expect(sealResult.success).toBe(true);
    expect(useHabitStore.getState().isLedgerSealedByDate['2026-10-04']).toBe(true);
    expect(useHabitStore.getState().isLedgerPartiallySealedByDate['2026-10-04']).toBe(true);
  });

  it('amends debrief meals, logs meals, awards XP, and clears partial seal status', () => {
    const store = useHabitStore.getState();
    store.sealDailyLedger('2026-10-04', 50, [], true);

    const amendResult = store.amendDebriefMeals('2026-10-04', {
      lunch: {
        name: 'Grilled Salmon & Quinoa',
        protein: 38,
        calories: 520,
        hitTarget: true,
      },
      dinner: {
        name: 'Steak & Sweet Potato',
        protein: 42,
        calories: 650,
        hitTarget: true,
      },
    });

    expect(amendResult.success).toBe(true);
    // 25 + 25 = 50 XP
    expect(amendResult.xpAwarded).toBe(50);
    expect(useHabitStore.getState().isLedgerPartiallySealedByDate['2026-10-04']).toBe(false);

    const dailyLog = useHabitStore.getState().getDailyLog('2026-10-04');
    expect(dailyLog.loggedMeals?.length).toBe(2);
    expect(dailyLog.totalProteinLogged).toBe(80);
  });
});
