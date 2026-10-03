import { describe, it, expect } from 'vitest';
import { calculateProteinRebalance, findMatchingRecipesForDeficit } from '@/lib/metabolicRebalancer';
import { RECIPES } from '@/lib/recipes';

describe('metabolicRebalancer & Recipe Matching Engine', () => {
  it('correctly calculates evening catchup deficit when earlier meals were light', () => {
    const result = calculateProteinRebalance({
      dailyTarget: 140,
      breakfastProtein: 15,
      lunchProtein: 20,
      dinnerProtein: 0,
    });

    expect(result.isGoalAchieved).toBe(false);
    expect(result.statusType).toBe('deficit_catchup');
    expect(result.totalLogged).toBe(35);
    expect(result.adjustedDinnerTarget).toBe(105);
    expect(result.recommendedRecipes.length).toBeGreaterThanOrEqual(1);
  });

  it('detects goal_locked status when user reaches or exceeds target', () => {
    const result = calculateProteinRebalance({
      dailyTarget: 120,
      breakfastProtein: 40,
      lunchProtein: 50,
      dinnerProtein: 35,
    });

    expect(result.isGoalAchieved).toBe(true);
    expect(result.statusType).toBe('goal_locked');
    expect(result.recommendedRecipes.length).toBeGreaterThanOrEqual(1);
    expect(result.recommendedRecipes[0].matchReason).toContain('restorative');
  });

  it('identifies surplus status when earlier meals exceeded pace', () => {
    const result = calculateProteinRebalance({
      dailyTarget: 100,
      breakfastProtein: 45,
      lunchProtein: 45,
      dinnerProtein: 0,
    });

    expect(result.statusType).toBe('surplus');
    expect(result.adjustedDinnerTarget).toBe(10);
  });

  it('matches recipes with high protein content for substantial targets', () => {
    const matches = findMatchingRecipesForDeficit({
      targetProtein: 45,
      allRecipes: RECIPES,
    });

    expect(matches.length).toBeGreaterThanOrEqual(2);
    // At least one match should have effective protein >= 35g
    expect(matches.some((m) => m.effectiveProtein >= 35)).toBe(true);
    expect(matches[0].matchReason).toBeDefined();
  });

  it('strictly respects vegan dietary preference in recipe recommendations', () => {
    const matches = findMatchingRecipesForDeficit({
      targetProtein: 30,
      userDietType: 'vegan',
      allRecipes: RECIPES,
    });

    expect(matches.length).toBeGreaterThanOrEqual(1);
    for (const match of matches) {
      expect(match.recipe.dietType).toBe('vegan');
    }
  });
});
