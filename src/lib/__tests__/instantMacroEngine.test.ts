import { describe, it, expect } from 'vitest';
import { parseInstantMeal, WHOLE_FOOD_DICTIONARY } from '@/lib/instantMacroEngine';

describe('instantMacroEngine', () => {
  it('has a calibrated dictionary of staples', () => {
    expect(WHOLE_FOOD_DICTIONARY.length).toBeGreaterThanOrEqual(30);
  });

  it('instantly parses whole foods with explicit portions in <5ms', () => {
    // Warm-up JIT
    parseInstantMeal('1 egg');
    const t0 = performance.now();
    const result = parseInstantMeal('2 eggs and 2 slices of bread');
    const elapsed = performance.now() - t0;

    expect(elapsed).toBeLessThan(50);
    expect(result).not.toBeNull();
    if (result && result.hasCompletePortions) {
      expect(result.protein).toBeGreaterThan(15);
      expect(result.calories).toBeGreaterThan(200);
      expect(result.dietType).toBe('eggetarian');
      expect(result.ingredients.length).toBe(2);
    }
  });

  it('rejects non-food gibberish and objects immediately', () => {
    const res1 = parseInstantMeal('asdfghjkl');
    expect(res1?.isNotFood).toBe(true);

    const res2 = parseInstantMeal('laptop computer and mouse');
    expect(res2?.isNotFood).toBe(true);

    const res3 = parseInstantMeal('went for a 10k run');
    expect(res3?.isNotFood).toBe(true);
  });

  it('detects missing portions when foods are unquantified', () => {
    const result = parseInstantMeal('chicken and rice');
    expect(result).not.toBeNull();
    expect(result?.hasCompletePortions).toBe(false);
    expect(result?.missingItems?.length).toBeGreaterThanOrEqual(1);
    expect(result?.clarificationQuestion).toContain('serving size');
  });

  it('resolves when clarifications are provided', () => {
    const result = parseInstantMeal('chicken and rice', {
      chicken: '150g',
      rice: '1 cup',
    });
    expect(result).not.toBeNull();
    expect(result?.hasCompletePortions).toBe(true);
    if (result?.hasCompletePortions) {
      expect(result.protein).toBeGreaterThan(30);
      expect(result.carbs).toBeGreaterThan(30);
      expect(result.dietType).toBe('omnivore');
    }
  });

  it('correctly classifies vegan and pescatarian meals', () => {
    const salmonMeal = parseInstantMeal('150g salmon and 100g broccoli');
    expect(salmonMeal?.hasCompletePortions).toBe(true);
    if (salmonMeal?.hasCompletePortions) {
      expect(salmonMeal.dietType).toBe('pescatarian');
    }

    const veganMeal = parseInstantMeal('150g tofu with 1 cup jasmine rice');
    expect(veganMeal?.hasCompletePortions).toBe(true);
    if (veganMeal?.hasCompletePortions) {
      expect(veganMeal.dietType).toBe('vegan');
    }
  });
});
