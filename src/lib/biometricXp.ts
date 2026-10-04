export type MealDebriefState = boolean | 'not_yet' | null;

export interface BiometricXpBreakdown {
  sleepXp: number;
  sleepEfficacyLabel: string;
  sunlightXp: number;
  sunlightEfficacyLabel: string;
  breakfastXp: number;
  lunchXp: number;
  dinnerXp: number;
  caffeineXp: number;
  customHabitsXp: number;
  baseSealXp: number;
  wakeConsistencyXp: number;
  morningRestedXp: number;
  digitalSunsetXp: number;
  hydrationXp: number;
  focusXp: number;
  totalXp: number;
}

export interface BiometricInputs {
  sleepDurationHours: number;
  sunlightSecured: boolean | null;
  sunlightMinutes?: number;
  breakfastDone: MealDebriefState;
  lunchDone: MealDebriefState;
  dinnerDone?: MealDebriefState;
  caffeineRespected: boolean | null;
  customHabitsCompletedCount: number;
  morningRestedRating?: number;
  wakeConsistencyAnchor?: boolean;
  digitalSunsetSecured?: boolean;
  hydrationLiters?: number;
  focusBlocksCompleted?: number;
}

export function calculateBiometricXp(inputs: BiometricInputs): BiometricXpBreakdown {
  const {
    sleepDurationHours,
    sunlightSecured,
    sunlightMinutes = 15,
    breakfastDone,
    lunchDone,
    dinnerDone,
    caffeineRespected,
    customHabitsCompletedCount,
    morningRestedRating,
    wakeConsistencyAnchor,
    digitalSunsetSecured,
    hydrationLiters = 0,
    focusBlocksCompleted = 0,
  } = inputs;

  // Graduated sleep XP curve based on physiological efficacy
  let sleepXp = 0;
  let sleepEfficacyLabel = 'Sleep Deprived (<4.5h)';
  if (sleepDurationHours >= 7.3 && sleepDurationHours <= 8.5) {
    sleepXp = 45;
    sleepEfficacyLabel = 'Golden Restorative Sleep (7.3h - 8.5h)';
  } else if (sleepDurationHours >= 6.5 && sleepDurationHours < 7.3) {
    sleepXp = 32;
    sleepEfficacyLabel = 'Solid Sleep Cadence (6.5h - 7.2h)';
  } else if (sleepDurationHours > 8.5 && sleepDurationHours <= 9.5) {
    sleepXp = 35;
    sleepEfficacyLabel = 'Deep Recovery Window (8.6h - 9.5h)';
  } else if (sleepDurationHours >= 5.5 && sleepDurationHours < 6.5) {
    sleepXp = 18;
    sleepEfficacyLabel = 'Sub-optimal Sleep (5.5h - 6.4h)';
  } else if (sleepDurationHours >= 4.5 && sleepDurationHours < 5.5) {
    sleepXp = 8;
    sleepEfficacyLabel = 'Compromised Sleep (4.5h - 5.4h)';
  } else if (sleepDurationHours > 9.5) {
    sleepXp = 20;
    sleepEfficacyLabel = 'Hypersomnia Rebound (>9.5h)';
  } else {
    sleepXp = 0;
    sleepEfficacyLabel = 'Severe Deprivation (<4.5h)';
  }

  // Morning Rested Quality XP (Circadian recovery touchpoint)
  let morningRestedXp = 0;
  if (typeof morningRestedRating === 'number') {
    if (morningRestedRating >= 8) morningRestedXp = 20;
    else if (morningRestedRating >= 6) morningRestedXp = 12;
    else if (morningRestedRating >= 4) morningRestedXp = 6;
  }

  // Wake Schedule Consistency XP (Anchor Circadian Clock within ±30m)
  const wakeConsistencyXp = wakeConsistencyAnchor ? 20 : 0;

  // Digital Sunset / Screens Off Routine
  const digitalSunsetXp = digitalSunsetSecured ? 20 : 0;

  // Graduated sunlight XP based on outdoor lux exposure
  let sunlightXp = 0;
  let sunlightEfficacyLabel = 'Stayed Indoors';
  if (sunlightSecured) {
    if (sunlightMinutes >= 20) {
      sunlightXp = 30;
      sunlightEfficacyLabel = 'Peak Lux Anchored (20m+)';
    } else if (sunlightMinutes >= 10) {
      sunlightXp = 25;
      sunlightEfficacyLabel = 'Optimal Circadian Light (10-19m)';
    } else {
      sunlightXp = 15;
      sunlightEfficacyLabel = 'Light Priming (5-9m)';
    }
  }

  // Meals efficacy: Hit target = 25 XP, Fasting = 15 XP, Light = 8 XP, Skipped = 0 XP
  const calcMealXp = (state?: MealDebriefState) => {
    if (state === true) return 25;
    if (state === 'not_yet') return 15;
    if (state === false) return 8;
    return 0;
  };

  const breakfastXp = calcMealXp(breakfastDone);
  const lunchXp = calcMealXp(lunchDone);
  const dinnerXp = calcMealXp(dinnerDone);
  const caffeineXp = caffeineRespected ? 25 : 0;

  // Hydration Touchpoint for Focus Pillar
  let hydrationXp = 0;
  if (hydrationLiters >= 2.5) hydrationXp = 25;
  else if (hydrationLiters >= 1.5) hydrationXp = 15;

  // Uninterrupted Focus Blocks Touchpoint
  const focusXp = Math.min(40, (focusBlocksCompleted || 0) * 20);

  const customHabitsXp = Math.max(0, customHabitsCompletedCount * 15);
  const baseSealXp = 15;

  const totalXp =
    sleepXp +
    morningRestedXp +
    wakeConsistencyXp +
    digitalSunsetXp +
    sunlightXp +
    breakfastXp +
    lunchXp +
    dinnerXp +
    caffeineXp +
    hydrationXp +
    focusXp +
    customHabitsXp +
    baseSealXp;

  return {
    sleepXp,
    sleepEfficacyLabel,
    sunlightXp,
    sunlightEfficacyLabel,
    breakfastXp,
    lunchXp,
    dinnerXp,
    caffeineXp,
    customHabitsXp,
    baseSealXp,
    wakeConsistencyXp,
    morningRestedXp,
    digitalSunsetXp,
    hydrationXp,
    focusXp,
    totalXp,
  };
}
