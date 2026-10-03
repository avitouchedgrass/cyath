/**
 * Metabolic Protein Rebalancing Engine
 * Dynamically adjusts evening/dinner protein recommendations based on earlier meal intake
 * to hit the user's daily floor without guilt or micromanagement.
 */

import { Recipe, RECIPES } from '@/lib/recipes';

export interface RecommendedRecipeMatch {
  recipe: Recipe;
  matchScore: number;
  matchReason: string;
  portionMultiplier: number;
  effectiveProtein: number;
  effectiveCalories: number;
}

export interface ProteinRebalanceResult {
  dailyTarget: number;
  breakfastProtein: number;
  lunchProtein: number;
  dinnerProtein: number;
  totalLogged: number;
  remainingForDinner: number;
  adjustedDinnerTarget: number;
  deficitFromEarlier: number;
  isGoalAchieved: boolean;
  statusType: 'deficit_catchup' | 'on_track' | 'surplus' | 'goal_locked';
  headline: string;
  advice: string;
  recommendedMeals: string[];
  recommendedRecipes: RecommendedRecipeMatch[];
}

export function findMatchingRecipesForDeficit({
  targetProtein,
  userDietType,
  allRecipes = RECIPES,
}: {
  targetProtein: number;
  userDietType?: string;
  allRecipes?: Recipe[];
}): RecommendedRecipeMatch[] {
  // Filter compatible diet types
  const compatible = allRecipes.filter((r) => {
    if (!userDietType || userDietType === 'omnivore') return true;
    if (userDietType === 'vegan') return r.dietType === 'vegan';
    if (userDietType === 'vegetarian') return r.dietType === 'vegetarian' || r.dietType === 'vegan';
    if (userDietType === 'eggetarian') return r.dietType === 'eggetarian' || r.dietType === 'vegetarian' || r.dietType === 'vegan';
    if (userDietType === 'pescatarian') return r.dietType !== 'omnivore';
    return true;
  });

  const pool = compatible.length >= 3 ? compatible : allRecipes;

  // Score each recipe against remaining target
  const scored = pool.map((recipe) => {
    // If goal is already locked / zero target:
    if (targetProtein <= 0) {
      const matchScore = recipe.protein <= 25 ? 90 - recipe.protein : 40;
      return {
        recipe,
        matchScore,
        matchReason: 'Light restorative plate: Gentle nourishment to support overnight cellular recovery.',
        portionMultiplier: 1.0,
        effectiveProtein: recipe.protein,
        effectiveCalories: recipe.calories,
      };
    }

    // Target is positive
    let mult = 1.0;
    if (recipe.protein > 0) {
      const idealMult = targetProtein / recipe.protein;
      if (idealMult >= 0.75 && idealMult <= 1.4) {
        mult = Number(idealMult.toFixed(1));
      }
    }

    const effectiveProtein = Math.round(recipe.protein * mult);
    const effectiveCalories = Math.round(recipe.calories * mult);
    const adjustedDiff = Math.abs(effectiveProtein - targetProtein);

    let matchScore = 100 - adjustedDiff * 2;
    // Category boost
    if (targetProtein >= 35 && (recipe.category === 'High Protein' || recipe.category === 'Post Workout')) {
      matchScore += 15;
    } else if (targetProtein < 25 && (recipe.category === 'Quick Fuel' || recipe.category === 'Keto Clean')) {
      matchScore += 15;
    }

    // Prep time boost
    if (recipe.prepTimeMinutes <= 20) {
      matchScore += 10;
    }

    let matchReason = '';
    if (adjustedDiff <= 4) {
      matchReason = `Exact Macro Match: Covers your remaining ${targetProtein}g protein floor (${mult !== 1.0 ? `${mult}x portion` : '1 standard portion'}).`;
    } else if (effectiveProtein > targetProtein) {
      matchReason = `Power Surplus: Delivers +${effectiveProtein}g protein to comfortably surpass your daily floor.`;
    } else {
      matchReason = `Clean Anchor: Fills ${effectiveProtein}g of your remaining ${targetProtein}g protein requirement.`;
    }

    return {
      recipe,
      matchScore,
      matchReason,
      portionMultiplier: mult,
      effectiveProtein,
      effectiveCalories,
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.matchScore - a.matchScore);

  // Pick top matches ensuring unique dishes
  const result: RecommendedRecipeMatch[] = [];
  const seenNames = new Set<string>();

  for (const item of scored) {
    if (result.length >= 3) break;
    const baseKey = item.recipe.name.split(' ')[0].toLowerCase();
    if (!seenNames.has(baseKey)) {
      seenNames.add(baseKey);
      result.push(item);
    }
  }

  // Fallback if set filtering was too strict
  if (result.length < 3) {
    for (const item of scored) {
      if (result.length >= 3) break;
      if (!result.some((r) => r.recipe.id === item.recipe.id)) {
        result.push(item);
      }
    }
  }

  return result;
}

export function calculateProteinRebalance({
  dailyTarget = 100,
  breakfastProtein = 0,
  lunchProtein = 0,
  dinnerProtein = 0,
  userDietType,
  customRecipes = [],
}: {
  dailyTarget?: number;
  breakfastProtein?: number;
  lunchProtein?: number;
  dinnerProtein?: number;
  userDietType?: string;
  customRecipes?: Recipe[];
}): ProteinRebalanceResult {
  const safeTarget = Math.max(40, dailyTarget);
  
  // Standard healthy human meal distribution (30% breakfast, 35% lunch, 35% dinner)
  const baselineBreakfast = Math.round(safeTarget * 0.3);
  const baselineLunch = Math.round(safeTarget * 0.35);
  const baselineDinner = safeTarget - baselineBreakfast - baselineLunch;

  // Deficits from breakfast and lunch
  const breakfastDeficit = Math.max(0, baselineBreakfast - breakfastProtein);
  const lunchDeficit = Math.max(0, baselineLunch - lunchProtein);
  const totalEarlierDeficit = breakfastDeficit + lunchDeficit;

  const currentTotalWithoutDinner = breakfastProtein + lunchProtein;
  const remainingForDinner = Math.max(0, safeTarget - currentTotalWithoutDinner);
  
  // Adjusted dinner target carries over any shortfalls
  const adjustedDinnerTarget = remainingForDinner;

  const totalLogged = breakfastProtein + lunchProtein + dinnerProtein;
  const isGoalAchieved = totalLogged >= safeTarget;

  let statusType: ProteinRebalanceResult['statusType'] = 'on_track';
  let headline = `Dinner Target: ${adjustedDinnerTarget}g Protein`;
  let advice = `Standard dinner target of ${baselineDinner}g will round out your day nicely.`;

  if (isGoalAchieved) {
    statusType = 'goal_locked';
    headline = `Daily Goal Locked! (${totalLogged}g / ${safeTarget}g)`;
    advice = `You hit your metabolic target for today. Rest easy and allow muscular recovery overnight.`;
  } else if (totalEarlierDeficit > 0 && currentTotalWithoutDinner > 0) {
    statusType = 'deficit_catchup';
    headline = `Dinner Catch-up Target: ${adjustedDinnerTarget}g Protein`;
    advice = `Earlier meals were light (-${totalEarlierDeficit}g total). Cyath reallocated the remaining protein to dinner so your daily goal stays intact.`;
  } else if (currentTotalWithoutDinner > (baselineBreakfast + baselineLunch)) {
    statusType = 'surplus';
    const surplus = currentTotalWithoutDinner - (baselineBreakfast + baselineLunch);
    headline = `Relaxed Dinner Target: ${adjustedDinnerTarget}g Protein`;
    advice = `You crushed breakfast & lunch (+${surplus}g ahead)! You only need a light ${adjustedDinnerTarget}g to finish today's goal.`;
  }

  // Find matching chef recipes
  const allAvailableRecipes = [...customRecipes, ...RECIPES];
  const targetForMatching = isGoalAchieved ? 0 : adjustedDinnerTarget;
  const recommendedRecipes = findMatchingRecipesForDeficit({
    targetProtein: targetForMatching,
    userDietType,
    allRecipes: allAvailableRecipes,
  });

  const recommendedMeals = recommendedRecipes.map(
    (r) => `${r.recipe.name} (${r.effectiveProtein}g protein)`
  );

  return {
    dailyTarget: safeTarget,
    breakfastProtein,
    lunchProtein,
    dinnerProtein,
    totalLogged,
    remainingForDinner,
    adjustedDinnerTarget,
    deficitFromEarlier: totalEarlierDeficit,
    isGoalAchieved,
    statusType,
    headline,
    advice,
    recommendedMeals,
    recommendedRecipes,
  };
}
