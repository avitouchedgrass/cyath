import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useHabitStore } from '../useHabitStore';
import { Recipe } from '@/lib/recipes';

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

  it('persists custom habits across logout and re-login, avoiding impossible habit counts in Sanctuary', () => {
    const testUserId = 'user_habits_999';

    // 1. Log in
    useHabitStore.getState().setUserSession({ id: testUserId, email: 'habituser@example.com' });
    const initialCount = useHabitStore.getState().habits.length;

    // 2. Add custom habit
    useHabitStore.getState().addCustomHabit('Cold Plunge 3 mins', 'recovery');
    const updatedHabits = useHabitStore.getState().habits;
    expect(updatedHabits.length).toBe(initialCount + 1);

    const customHabit = updatedHabits.find((h) => h.title === 'Cold Plunge 3 mins');
    expect(customHabit).toBeDefined();

    // 3. Mark all habits completed (including the custom habit)
    const today = useHabitStore.getState().currentDate;
    updatedHabits.forEach((h) => {
      useHabitStore.getState().toggleHabit(h.id, today);
    });

    const todayLog = useHabitStore.getState().getDailyLog(today);
    expect(todayLog.habitsCompleted[customHabit!.id]).toBe(true);

    // 4. Log out
    useHabitStore.getState().setUserSession(null);
    expect(useHabitStore.getState().userSession).toBeNull();
    // In logged-out state, habits resets to default
    expect(useHabitStore.getState().habits.length).toBe(initialCount);

    // 5. Log back in with the same account
    useHabitStore.getState().setUserSession({ id: testUserId, email: 'habituser@example.com' });

    // Custom habit MUST be restored!
    const restoredHabits = useHabitStore.getState().habits;
    expect(restoredHabits.length).toBe(initialCount + 1);
    expect(restoredHabits.some((h) => h.title === 'Cold Plunge 3 mins')).toBe(true);

    // Sanctuary count calculation: completed habits strictly filtered by active habits
    const restoredLog = useHabitStore.getState().getDailyLog(today);
    const completedCount = restoredHabits.filter((h) => !!restoredLog.habitsCompleted[h.id]).length;
    const totalCount = restoredHabits.length;

    expect(completedCount).toBe(totalCount);
    expect(completedCount).toBeLessThanOrEqual(totalCount);
  });

  it('does not leak previous account or demo session progress into a new user account', async () => {
    // 1. User 1 logs in and earns XP & habits
    const user1 = 'user_veteran_1';
    useHabitStore.getState().setUserSession({ id: user1, email: 'veteran@example.com' });
    useHabitStore.getState().gainXp(1400, 'Test Veteran XP');
    useHabitStore.getState().addCustomHabit('Advanced Kettlebell Swing', 'movement');
    expect(useHabitStore.getState().totalXp).toBe(1400);

    // 2. User 1 logs out
    useHabitStore.getState().setUserSession(null);
    expect(useHabitStore.getState().totalXp).toBe(0);

    // 3. User 2 (brand new Google sign in) logs in
    const user2 = 'user_newcomer_2';
    useHabitStore.getState().setUserSession({ id: user2, email: 'newcomer@gmail.com' });
    await useHabitStore.getState().reconcileUserSession({ id: user2, email: 'newcomer@gmail.com' });

    // User 2 MUST have 0 XP and clean state!
    expect(useHabitStore.getState().totalXp).toBe(0);
    expect(useHabitStore.getState().streakCount).toBe(0);
    expect(useHabitStore.getState().habits.some((h) => h.title === 'Advanced Kettlebell Swing')).toBe(false);

    // 4. Switching back to User 1 restores User 1's progress
    useHabitStore.getState().setUserSession({ id: user1, email: 'veteran@example.com' });
    expect(useHabitStore.getState().totalXp).toBe(1400);
    expect(useHabitStore.getState().habits.some((h) => h.title === 'Advanced Kettlebell Swing')).toBe(true);
  });

  it('generates unique referral code and awards +250 XP on claiming invite code', async () => {
    const userId = 'user_recruit_1';
    useHabitStore.getState().setUserSession({ id: userId, email: 'recruit@gmail.com' });
    useHabitStore.getState().updateUserProfile({ fullName: 'Ranger Recruit' });

    const profile = useHabitStore.getState().userProfile;
    expect(profile?.referralCode).toBeDefined();
    expect(profile?.referralCode).toMatch(/^RANGE-[A-Z0-9]{4}$/);

    // Claiming a link should fail with explicit error
    const linkClaim = await useHabitStore.getState().claimReferralCode('https://cyath.space/auth?ref=ALEX-8K9L');
    expect(linkClaim.success).toBe(false);
    expect(linkClaim.message).toContain('not a website link');

    // Claiming random garbage with special characters should fail
    const invalidCharClaim = await useHabitStore.getState().claimReferralCode('bad code@123!');
    expect(invalidCharClaim.success).toBe(false);

    // Claiming own code should fail
    const ownClaim = await useHabitStore.getState().claimReferralCode(profile!.referralCode!);
    expect(ownClaim.success).toBe(false);
    expect(ownClaim.message).toMatch(/cannot claim your own/i);

    // Claiming friend's valid code should succeed and grant +250 XP
    const friendCode = 'CYATH-7K9P';
    const validClaim = await useHabitStore.getState().claimReferralCode(friendCode);
    expect(validClaim.success).toBe(true);
    expect(validClaim.xpAwarded).toBe(250);
    expect(useHabitStore.getState().totalXp).toBe(250);
    expect(useHabitStore.getState().userProfile?.claimedReferral).toBe(true);
    expect(useHabitStore.getState().userProfile?.referredBy).toBe(friendCode);

    // Claiming second time should fail
    const duplicateClaim = await useHabitStore.getState().claimReferralCode('CYATH-DIFF');
    expect(duplicateClaim.success).toBe(false);
    expect(duplicateClaim.message).toContain('already claimed');
  });

  it('completes pioneer walkthrough and awards +50 XP calibration quest bonus', () => {
    const userId = 'user_pioneer_1';
    useHabitStore.getState().setUserSession({ id: userId, email: 'pioneer@gmail.com' });
    useHabitStore.getState().updateUserProfile({ fullName: 'Pioneer Scout' });

    expect(useHabitStore.getState().userProfile?.walkthroughCompleted).toBeUndefined();
    expect(useHabitStore.getState().totalXp).toBe(0);

    // Complete walkthrough
    useHabitStore.getState().completeWalkthrough();

    expect(useHabitStore.getState().userProfile?.walkthroughCompleted).toBe(true);
    expect(useHabitStore.getState().totalXp).toBe(50);
    expect(useHabitStore.getState().xpHistory[0].reason).toBe('Pioneer Calibration Complete');
  });
});

