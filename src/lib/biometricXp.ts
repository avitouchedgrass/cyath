export type MealDebriefState = boolean | 'not_yet' | null;

export interface BiometricXpBreakdown {
  sleepXp: number;
  sunlightXp: number;
  breakfastXp: number;
  lunchXp: number;
  dinnerXp: number;
  caffeineXp: number;
  customHabitsXp: number;
  baseSealXp: number;
  totalXp: number;
}

export interface BiometricInputs {
  sleepDurationHours: number;
  sunlightSecured: boolean | null;
  breakfastDone: MealDebriefState;
  lunchDone: MealDebriefState;
  dinnerDone?: MealDebriefState;
  caffeineRespected: boolean | null;
  customHabitsCompletedCount: number;
}

export function calculateBiometricXp(inputs: BiometricInputs): BiometricXpBreakdown {
  const {
    sleepDurationHours,
    sunlightSecured,
    breakfastDone,
    lunchDone,
    dinnerDone,
    caffeineRespected,
    customHabitsCompletedCount,
  } = inputs;

  let sleepXp = 5;
  if (sleepDurationHours >= 7.0 && sleepDurationHours <= 9.0) {
    sleepXp = 40;
  } else if (sleepDurationHours > 9.0 && sleepDurationHours <= 10.0) {
    sleepXp = 30;
  } else if (sleepDurationHours >= 6.0 && sleepDurationHours < 7.0) {
    sleepXp = 25;
  } else if (sleepDurationHours >= 5.0 && sleepDurationHours < 6.0) {
    sleepXp = 15;
  }

  const sunlightXp = sunlightSecured ? 30 : 0;
  const breakfastXp = breakfastDone === true ? 25 : (breakfastDone === false ? 5 : 0);
  const lunchXp = lunchDone === true ? 25 : (lunchDone === false ? 5 : 0);
  const dinnerXp = dinnerDone === true ? 25 : (dinnerDone === false ? 5 : 0);
  const caffeineXp = caffeineRespected ? 25 : 0;
  const customHabitsXp = Math.max(0, customHabitsCompletedCount * 15);
  const baseSealXp = 15;

  const totalXp = sleepXp + sunlightXp + breakfastXp + lunchXp + dinnerXp + caffeineXp + customHabitsXp + baseSealXp;

  return {
    sleepXp,
    sunlightXp,
    breakfastXp,
    lunchXp,
    dinnerXp,
    caffeineXp,
    customHabitsXp,
    baseSealXp,
    totalXp,
  };
}
