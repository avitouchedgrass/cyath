import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useHabitStore } from '../useHabitStore';
import { Recipe } from '@/lib/recipes';

const storeMap = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storeMap.get(key) ?? null,
  setItem: (key: string, val: string) => storeMap.set(key, val),
  removeItem: (key: string) => storeMap.delete(key),
  clear: () => storeMap.clear(),
};

(globalThis as any).localStorage = localStorageMock;
(globalThis as any).window = globalThis;

describe('useHabitStore session, profile, and custom recipe persistence', () => {
  beforeEach(() => {
    localStorageMock.clear();
    useHabitStore.setState({
      userSession: null,
      userProfile: null,
      customRecipes: [],
      totalXp: 0,
      streakCount: 0,
    });
  });

  it('persists userProfile and customRecipes across session logout and re-login', () => {
    const testUserId = 'user_abc_123';

    // 1. Log in
    useHabitStore.getState().setUserSession({ id: testUserId, email: 'alex@example.com' });

    // 2. Complete onboarding
    useHabitStore.getState().updateUserProfile({
      fullName: 'Alex Vance',
      age: 28,
      sex: 'female',
      heightCm: 172,
      weightKg: 65,
      primaryGoal: 'muscle',
      allergies: ['Peanuts'],
      dietaryRestrictions: ['High-Protein Omnivore'],
      onboardingCompleted: true,
    });

    // 3. Add custom recipe
    const customDish: Recipe = {
      id: 'custom-egg-bowl',
      name: 'Power Protein Egg Bowl',
      subtitle: 'Soft boiled eggs over brown rice and avocado',
      image: '/assets/food/egg-bowl.png',
      calories: 520,
      protein: 36,
      carbs: 48,
      fats: 18,
      prepTimeMinutes: 15,
      category: 'High Protein',
      dietType: 'omnivore',
      tags: ['Eggs', 'Quick Fuel'],
      focusScore: '9.4/10',
      description: 'Quick morning fuel',
      ingredients: [{ item: 'Eggs', amount: '3' }],
      instructions: ['Boil eggs', 'Assemble bowl'],
      isCustom: true,
    };

    useHabitStore.getState().addCustomRecipe(customDish);

    expect(useHabitStore.getState().userProfile?.onboardingCompleted).toBe(true);
    expect(useHabitStore.getState().customRecipes.length).toBe(1);

    // 4. Log out
    useHabitStore.getState().setUserSession(null);

    expect(useHabitStore.getState().userSession).toBeNull();
    expect(useHabitStore.getState().userProfile).toBeNull();
    expect(useHabitStore.getState().customRecipes).toEqual([]);

    // 5. Log back in with the same user account
    useHabitStore.getState().setUserSession({ id: testUserId, email: 'alex@example.com' });

    // Verify profile and custom recipes were successfully restored from local cached progress!
    const restoredProfile = useHabitStore.getState().userProfile;
    expect(restoredProfile).not.toBeNull();
    expect(restoredProfile?.fullName).toBe('Alex Vance');
    expect(restoredProfile?.onboardingCompleted).toBe(true);

    const restoredRecipes = useHabitStore.getState().customRecipes;
    expect(restoredRecipes.length).toBe(1);
    expect(restoredRecipes[0].id).toBe('custom-egg-bowl');
    expect(restoredRecipes[0].name).toBe('Power Protein Egg Bowl');
  });

  it('preserves existing local progress even if remote database queries error out', async () => {
    const testUserId = 'user_xyz_789';

    // Seed local cache directly
    const cachedData = {
      totalXp: 450,
      streakCount: 5,
      streakFreezeStock: 2,
      claimedMilestones: [1],
      completedQuestIdsByDate: {},
      xpHistory: [],
      userProfile: {
        fullName: 'Dev Tester',
        age: 25,
        sex: 'other' as const,
        heightCm: 175,
        weightKg: 70,
        primaryGoal: 'focus' as const,
        allergies: [],
        dietaryRestrictions: [],
        onboardingCompleted: true,
      },
      customRecipes: [],
    };
    localStorage.setItem(`cyath_user_progression_${testUserId}`, JSON.stringify(cachedData));

    // Log in
    useHabitStore.getState().setUserSession({ id: testUserId, email: 'test@example.com' });

    // Progress and profile should be immediately active from cache
    expect(useHabitStore.getState().totalXp).toBe(450);
    expect(useHabitStore.getState().streakCount).toBe(5);
    expect(useHabitStore.getState().userProfile?.onboardingCompleted).toBe(true);

    // Run reconcileUserSession (simulating missing tables or network error)
    await useHabitStore.getState().reconcileUserSession({ id: testUserId, email: 'test@example.com' });

    // Progress must NOT be wiped to 0
    expect(useHabitStore.getState().totalXp).toBe(450);
    expect(useHabitStore.getState().streakCount).toBe(5);
    expect(useHabitStore.getState().userProfile?.onboardingCompleted).toBe(true);
  });
});
