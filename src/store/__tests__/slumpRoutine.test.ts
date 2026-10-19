import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useHabitStore } from '../useHabitStore';
import { formatLocalDate } from '@/lib/dateUtils';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: new Error('Network error') }),
          order: async () => ({ data: null, error: new Error('Network error') }),
        }),
      }),
      upsert: async () => ({ error: new Error('Network error') }),
    }),
  },
}));

const storeMap = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storeMap.get(key) ?? null,
  setItem: (key: string, val: string) => storeMap.set(key, val),
  removeItem: (key: string) => storeMap.delete(key),
  clear: () => storeMap.clear(),
};

(globalThis as any).localStorage = localStorageMock;
(globalThis as any).window = globalThis;

describe('Slump Routine and Essentials Stripping', () => {
  const today = formatLocalDate(new Date());

  beforeEach(() => {
    localStorageMock.clear();
    useHabitStore.setState({
      currentDate: today,
      userSession: null,
      userProfile: {
        fullName: 'Test User',
        age: 30,
        sex: 'other',
        heightCm: 175,
        weightKg: 70,
        primaryGoal: 'focus',
        allergies: [],
        dietaryRestrictions: [],
        onboardingCompleted: true,
      },
      logsByDate: {},
      deskRitualsByDate: {},
    });
  });

  it('toggles slump routine state on daily log', () => {
    const store = useHabitStore.getState();
    expect(store.logsByDate[today]?.isSlumpRoutine).toBeFalsy();

    store.setIsSlumpRoutine(today, true);
    expect(useHabitStore.getState().logsByDate[today]?.isSlumpRoutine).toBe(true);
    expect(useHabitStore.getState().logsByDate[today]?.isDownscaled).toBe(true);

    store.setIsSlumpRoutine(today, false);
    expect(useHabitStore.getState().logsByDate[today]?.isSlumpRoutine).toBe(false);
  });

  it('uses default essential habits and baseline targets when not customized', () => {
    const store = useHabitStore.getState();
    const essentials = store.getSlumpEssentials(today);

    expect(essentials.config.essentialHabitIds).toEqual(['sunlight', 'hydration']);
    expect(essentials.config.hydrationTargetLiters).toBe(1.0);
    expect(essentials.config.includeProtein).toBe(false);
    expect(essentials.config.requireOnlyEssentialsForSeal).toBe(true);
    expect(essentials.config.stripSleepMarkers).toBe(true);
    expect(essentials.allEssentialsMet).toBe(false);
  });

  it('evaluates allEssentialsMet based on default sunlight and 1.0L hydration baseline', () => {
    const store = useHabitStore.getState();
    store.setIsSlumpRoutine(today, true);

    store.toggleHabit('sunlight', today);
    let essentials = store.getSlumpEssentials(today);
    expect(essentials.allEssentialsMet).toBe(false);

    store.setHydration(0.5, today);
    essentials = store.getSlumpEssentials(today);
    expect(essentials.allEssentialsMet).toBe(false);

    store.setHydration(1.0, today);
    essentials = store.getSlumpEssentials(today);
    expect(essentials.allEssentialsMet).toBe(true);
  });

  it('persists customized slump routine preferences and validates updated requirements', () => {
    const store = useHabitStore.getState();
    store.setIsSlumpRoutine(today, true);

    store.updateSlumpRoutineConfig({
      essentialHabitIds: ['sunlight', 'movement', 'protein_target'],
      hydrationTargetLiters: 1.5,
      includeProtein: true,
      proteinTargetGrams: 40,
      requireOnlyEssentialsForSeal: true,
    });

    store.toggleHabit('sunlight', today);
    store.setHydration(1.5, today);

    let essentials = store.getSlumpEssentials(today);
    expect(essentials.allEssentialsMet).toBe(false);

    store.toggleHabit('movement', today);
    essentials = store.getSlumpEssentials(today);
    expect(essentials.allEssentialsMet).toBe(false);

    store.setProtein(45, today);
    essentials = store.getSlumpEssentials(today);
    expect(essentials.allEssentialsMet).toBe(true);
  });
});
