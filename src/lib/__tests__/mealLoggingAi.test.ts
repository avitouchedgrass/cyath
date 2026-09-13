import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useHabitStore, LoggedMealEntry } from '@/store/useHabitStore';
import { fallbackHeuristicParse } from '@/app/api/ai/parse-meal/route';

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

describe('AI Meal Logging & Store Decoupling', () => {
  beforeEach(() => {
    localStorageMock.clear();
    useHabitStore.setState({
      customRecipes: [],
      logsByDate: {},
      totalXp: 0,
    });
  });

  describe('useHabitStore.logMealToDay', () => {
    it('logs a meal to the daily ledger and updates protein/calories without adding to customRecipes', () => {
      const today = useHabitStore.getState().currentDate;
      const initialCustomRecipesCount = useHabitStore.getState().customRecipes.length;

      const meal: LoggedMealEntry = {
        id: 'test_meal_1',
        name: 'Grilled Salmon Bowl',
        protein: 42,
        calories: 520,
        carbs: 45,
        fats: 14,
        isVegetarian: false,
        dietType: 'pescatarian',
        category: 'High Protein',
        ingredients: [
          { item: 'Salmon', amount: '180g' },
          { item: 'Brown Rice', amount: '1 cup' },
        ],
        suggestedSprite: '/assets/food/grilled-fish-1.0.png',
        loggedAt: new Date().toISOString(),
      };

      useHabitStore.getState().logMealToDay(meal, today);

      const dailyLog = useHabitStore.getState().getDailyLog(today);
      expect(dailyLog.totalProteinLogged).toBe(42);
      expect(dailyLog.totalCaloriesLogged).toBe(520);
      expect(dailyLog.loggedMeals).toHaveLength(1);
      expect(dailyLog.loggedMeals?.[0]?.name).toBe('Grilled Salmon Bowl');
      expect(dailyLog.loggedMeals?.[0]?.protein).toBe(42);

      // Verify customRecipes catalog was NOT polluted
      expect(useHabitStore.getState().customRecipes.length).toBe(initialCustomRecipesCount);
    });

    it('removes a logged meal and decrements daily protein and calories accurately', () => {
      const today = useHabitStore.getState().currentDate;

      const meal1: LoggedMealEntry = {
        id: 'meal_abc_1',
        name: 'Tofu Stir Fry',
        protein: 28,
        calories: 360,
        loggedAt: new Date().toISOString(),
      };
      const meal2: LoggedMealEntry = {
        id: 'meal_abc_2',
        name: 'Protein Shake',
        protein: 30,
        calories: 180,
        loggedAt: new Date().toISOString(),
      };

      useHabitStore.getState().logMealToDay(meal1, today);
      useHabitStore.getState().logMealToDay(meal2, today);

      let dailyLog = useHabitStore.getState().getDailyLog(today);
      expect(dailyLog.totalProteinLogged).toBe(58);
      expect(dailyLog.totalCaloriesLogged).toBe(540);
      expect(dailyLog.loggedMeals).toHaveLength(2);

      // Remove meal1
      useHabitStore.getState().removeMealFromDay('meal_abc_1', today);

      dailyLog = useHabitStore.getState().getDailyLog(today);
      expect(dailyLog.totalProteinLogged).toBe(30);
      expect(dailyLog.totalCaloriesLogged).toBe(180);
      expect(dailyLog.loggedMeals).toHaveLength(1);
      expect(dailyLog.loggedMeals?.[0]?.id).toBe('meal_abc_2');
    });

    it('marks a logged meal as saved when promoted to a permanent recipe', () => {
      const today = useHabitStore.getState().currentDate;
      const meal: LoggedMealEntry = {
        id: 'meal_promoted_1',
        name: 'High Protein Oats',
        protein: 35,
        calories: 450,
        loggedAt: new Date().toISOString(),
      };

      useHabitStore.getState().logMealToDay(meal, today);
      expect(useHabitStore.getState().getDailyLog(today).loggedMeals?.[0]?.savedAsRecipe).toBeFalsy();

      useHabitStore.getState().markMealSavedAsRecipe('meal_promoted_1', today);
      expect(useHabitStore.getState().getDailyLog(today).loggedMeals?.[0]?.savedAsRecipe).toBe(true);
    });
  });

  describe('fallbackHeuristicParse (AI Serving Size & Criteria Engine)', () => {
    it('detects missing portion sizes and prompts the user with suggested portion options', () => {
      const result = fallbackHeuristicParse('chicken and rice');
      expect(result.hasCompletePortions).toBe(false);

      if (!result.hasCompletePortions) {
        expect(result.missingItems.length).toBeGreaterThanOrEqual(1);
        const itemNames = result.missingItems.map((m) => m.name.toLowerCase());
        expect(itemNames.some((n) => n.includes('chicken') || n.includes('rice'))).toBe(true);
        expect(result.missingItems[0].suggestedOptions.length).toBeGreaterThan(0);
      }
    });

    it('accepts complete portions and calculates macros, dietType, and vegetarian criteria', () => {
      const result = fallbackHeuristicParse('200g chicken breast and 1 cup cooked white rice');
      expect(result.hasCompletePortions).toBe(true);

      if (result.hasCompletePortions) {
        expect(result.protein).toBeGreaterThanOrEqual(30);
        expect(result.calories).toBeGreaterThan(300);
        expect(result.isVegetarian).toBe(false);
        expect(result.dietType).toBe('omnivore');
        expect(result.ingredients.length).toBeGreaterThanOrEqual(1);
        expect(result.suggestedSprite).toBeTruthy();
      }
    });

    it('resolves missing portions when user clarifications are supplied', () => {
      const initial = fallbackHeuristicParse('paneer and roti');
      expect(initial.hasCompletePortions).toBe(false);

      const clarified = fallbackHeuristicParse('paneer and roti', {
        paneer: '150g',
        roti: '2 rotis',
      });
      expect(clarified.hasCompletePortions).toBe(true);

      if (clarified.hasCompletePortions) {
        expect(clarified.isVegetarian).toBe(true);
        expect(clarified.dietType).toBe('vegetarian');
        expect(clarified.protein).toBeGreaterThanOrEqual(20);
      }
    });

    it('classifies vegan meals accurately (e.g. tofu and rice)', () => {
      const result = fallbackHeuristicParse('180g tofu with 1 cup jasmine rice');
      expect(result.hasCompletePortions).toBe(true);

      if (result.hasCompletePortions) {
        expect(result.isVegetarian).toBe(true);
        expect(result.dietType).toBe('vegan');
      }
    });

    it('classifies eggetarian meals accurately (e.g. 3 boiled eggs and toast)', () => {
      const result = fallbackHeuristicParse('3 whole eggs and 2 slices toast');
      expect(result.hasCompletePortions).toBe(true);

      if (result.hasCompletePortions) {
        expect(result.dietType).toBe('eggetarian');
        expect(result.protein).toBeGreaterThanOrEqual(20);
      }
    });
  });
});
