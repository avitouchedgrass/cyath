export interface PillarTelemetry {
  score: number;
  statusTier: string;
  statusColor: 'emerald' | 'amber' | 'rust';
  primaryMetric: string;
  secondaryMetric: string;
  clinicalMechanism: string;
  prescriptiveAction: {
    label: string;
    actionType: 'OPEN_EVENING_WRAP' | 'LOG_PROTEIN' | 'ACCEPT_PROTOCOL' | 'NAV_DASHBOARD' | 'NONE';
    payload?: any;
  };
}

export interface SanctuaryMatrixInput {
  sleepHours: number;
  restedRating?: number;
  energyLevel?: number;
  totalProteinLogged: number;
  targetProtein: number;
  hydrationLiters: number;
  targetHydration: number;
  protocolAccepted: boolean;
  sunlightDone: boolean;
  caffeineCutoffRespected?: boolean;
  slumpScore?: number;
  wholeFoodScore?: number;
}


export interface SanctuaryMatrixResult {
  hearth: PillarTelemetry;
  canopy: PillarTelemetry;
  atmosphere: PillarTelemetry;
  ecosystemVitalityLevel: number;
  vitalitySummary: string;
}

export function calculateSanctuaryMatrix(input: SanctuaryMatrixInput): SanctuaryMatrixResult {
  // 1. Calculate Hearth Score (Sleep & Restorative Recovery)
  let sleepScore = 0;
  if (input.sleepHours >= 7.5 && input.sleepHours <= 9.0) {
    sleepScore = 100;
  } else if (input.sleepHours >= 7.0) {
    sleepScore = 85;
  } else if (input.sleepHours >= 6.0) {
    sleepScore = 65;
  } else if (input.sleepHours >= 5.0) {
    sleepScore = 45;
  } else {
    sleepScore = 30;
  }

  const restedRating = input.restedRating ?? input.energyLevel ?? 7;
  const qualityScore = Math.min(100, Math.max(20, restedRating * 10));
  const hearthScore = Math.round(sleepScore * 0.7 + qualityScore * 0.3);

  let hearthStatusTier: string;
  let hearthColor: 'emerald' | 'amber' | 'rust';
  let hearthMechanism: string;
  let hearthAction: PillarTelemetry['prescriptiveAction'];

  if (hearthScore >= 85) {
    hearthStatusTier = 'GREAT SLEEP';
    hearthColor = 'emerald';
    hearthMechanism =
      'Optimal sleep recorded. Your body and mind have had full time to recover.';
    hearthAction = { label: 'Recovery On Track', actionType: 'NONE' };
  } else if (hearthScore >= 65) {
    hearthStatusTier = 'MILD SLEEP DEFICIT';
    hearthColor = 'amber';
    hearthMechanism =
      'Slightly lower rest than optimal. Watch for a mid-afternoon dip in energy.';
    hearthAction = { label: 'Review Evening Log', actionType: 'OPEN_EVENING_WRAP' };
  } else {
    hearthStatusTier = 'HIGH SLEEP DEFICIT';
    hearthColor = 'rust';
    hearthMechanism =
      'Short sleep duration recorded. Prioritize getting to bed early tonight to recharge.';
    hearthAction = { label: 'Evening Check-in', actionType: 'OPEN_EVENING_WRAP' };
  }

  const hearth: PillarTelemetry = {
    score: hearthScore,
    statusTier: hearthStatusTier,
    statusColor: hearthColor,
    primaryMetric: `${input.sleepHours}h Sleep Recorded`,
    secondaryMetric: `${restedRating}/10 Rested Score`,
    clinicalMechanism: hearthMechanism,
    prescriptiveAction: hearthAction,
  };

  // 2. Calculate Canopy Score (Cellular Synthesis & Hydration)
  const targetProtein = input.targetProtein > 0 ? input.targetProtein : 140;
  const targetHydration = input.targetHydration > 0 ? input.targetHydration : 2.5;

  const proteinPct = Math.min(1.15, input.totalProteinLogged / targetProtein);
  const hydrationPct = Math.min(1.15, input.hydrationLiters / targetHydration);

  const wholeFoodMultiplier = typeof input.wholeFoodScore === 'number'
    ? 0.85 + 0.15 * (Math.max(0, Math.min(100, input.wholeFoodScore)) / 100)
    : 1.0;

  const canopyScore = Math.round(
    Math.min(100, Math.max(10, (proteinPct * 0.55 + hydrationPct * 0.45) * 100 * wholeFoodMultiplier))
  );


  let canopyStatusTier: string;
  let canopyColor: 'emerald' | 'amber' | 'rust';
  let canopyMechanism: string;
  let canopyAction: PillarTelemetry['prescriptiveAction'];

  if (canopyScore >= 85) {
    canopyStatusTier = 'WELL NOURISHED';
    canopyColor = 'emerald';
    canopyMechanism =
      'Protein and hydration targets are on track, supporting energy and muscle recovery.';
    canopyAction = { label: 'Nutrition On Track', actionType: 'NONE' };
  } else if (canopyScore >= 60) {
    canopyStatusTier = 'ON TRACK';
    canopyColor = 'amber';
    canopyMechanism =
      'Good start, but you could use a bit more protein or water to hit your daily goals.';
    canopyAction = { label: 'Quick Add +25g Protein', actionType: 'LOG_PROTEIN', payload: { amount: 25 } };
  } else {
    canopyStatusTier = 'BEHIND TARGET';
    canopyColor = 'rust';
    canopyMechanism =
      'Low protein or water intake so far today. Try having a protein-rich snack and a glass of water.';
    canopyAction = { label: 'Quick Add +25g Protein', actionType: 'LOG_PROTEIN', payload: { amount: 25 } };
  }

  const canopy: PillarTelemetry = {
    score: canopyScore,
    statusTier: canopyStatusTier,
    statusColor: canopyColor,
    primaryMetric: `${input.totalProteinLogged}g / ${targetProtein}g Protein`,
    secondaryMetric: `${input.hydrationLiters}L / ${targetHydration}L Water`,
    clinicalMechanism: canopyMechanism,
    prescriptiveAction: canopyAction,
  };

  // 3. Calculate Atmosphere Score (Circadian & Focus Entrainment)
  let atmosphereScore = 30; // baseline
  if (input.protocolAccepted) atmosphereScore += 35;
  if (input.sunlightDone) atmosphereScore += 25;
  if (input.caffeineCutoffRespected) atmosphereScore += 10;
  if (input.slumpScore !== undefined && input.slumpScore <= 3) atmosphereScore += 10;
  atmosphereScore = Math.min(100, atmosphereScore);

  let atmosphereStatusTier: string;
  let atmosphereColor: 'emerald' | 'amber' | 'rust';
  let atmosphereMechanism: string;
  let atmosphereAction: PillarTelemetry['prescriptiveAction'];

  if (atmosphereScore >= 80) {
    atmosphereStatusTier = 'HABITS ON TRACK';
    atmosphereColor = 'emerald';
    atmosphereMechanism =
      'Morning sunlight and daily habits completed, keeping your natural schedule in sync.';
    atmosphereAction = { label: 'Habits Aligned', actionType: 'NONE' };
  } else if (atmosphereScore >= 55) {
    atmosphereStatusTier = 'NEEDS ATTENTION';
    atmosphereColor = 'amber';
    atmosphereMechanism =
      'A few habits missed today. Complete today\'s focus action to stay on track.';
    atmosphereAction = !input.protocolAccepted
      ? { label: 'Accept Daily Action', actionType: 'ACCEPT_PROTOCOL' }
      : { label: 'Open Daily Habits', actionType: 'NAV_DASHBOARD' };
  } else {
    atmosphereStatusTier = 'OFF TRACK';
    atmosphereColor = 'rust';
    atmosphereMechanism =
      'Daily routines are off schedule today. Focus on getting sunlight and completing your daily action.';
    atmosphereAction = !input.protocolAccepted
      ? { label: 'Accept Daily Action', actionType: 'ACCEPT_PROTOCOL' }
      : { label: 'Open Daily Habits', actionType: 'NAV_DASHBOARD' };
  }

  const atmosphere: PillarTelemetry = {
    score: atmosphereScore,
    statusTier: atmosphereStatusTier,
    statusColor: atmosphereColor,
    primaryMetric: input.sunlightDone ? 'Morning Sunlight Done' : 'Morning Sunlight Pending',
    secondaryMetric: input.protocolAccepted ? 'Daily Action Accepted' : 'Action Pending',
    clinicalMechanism: atmosphereMechanism,
    prescriptiveAction: atmosphereAction,
  };

  // 4. Unified Ecosystem Vitality (1 - 10 scale)
  const weightedMean = hearthScore * 0.35 + canopyScore * 0.35 + atmosphereScore * 0.30;
  let ecosystemVitalityLevel = Math.max(1, Math.min(10, Math.round(weightedMean / 10)));
  
  // Cap vitality if any critical physiological pillar is in severe deficit (<50)
  if (hearthScore < 50 || canopyScore < 50 || atmosphereScore < 50) {
    ecosystemVitalityLevel = Math.min(6, ecosystemVitalityLevel);
  }

  let vitalitySummary: string;
  if (ecosystemVitalityLevel >= 8) {
    vitalitySummary =
      'Great overall balance. Sleep, nutrition, and daily routines are aligned.';
  } else if (ecosystemVitalityLevel >= 5) {
    vitalitySummary =
      'Good progress today. Check the areas below to stay on track with your goals.';
  } else {
    vitalitySummary =
      'Running low on energy today. Prioritize rest, water, and good meals.';
  }

  return {
    hearth,
    canopy,
    atmosphere,
    ecosystemVitalityLevel,
    vitalitySummary,
  };
}
