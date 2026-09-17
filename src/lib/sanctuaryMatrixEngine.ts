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
    hearthStatusTier = 'RESTORATIVE SLEEP';
    hearthColor = 'emerald';
    hearthMechanism =
      'Slow-wave delta sleep consolidated. Cerebral spinal fluid cleared metabolic waste; adenosine baseline reset.';
    hearthAction = { label: 'Recovery Locked', actionType: 'NONE' };
  } else if (hearthScore >= 65) {
    hearthStatusTier = 'MILD SLEEP DEBT';
    hearthColor = 'amber';
    hearthMechanism =
      'Partial deep sleep architecture. Minor residual adenosine detected, risking an earlier mid-afternoon focus dip.';
    hearthAction = { label: 'Review Evening Wrap', actionType: 'OPEN_EVENING_WRAP' };
  } else {
    hearthStatusTier = 'CHRONIC RECOVERY DEFICIT';
    hearthColor = 'rust';
    hearthMechanism =
      'Restricted sleep duration impairing prefrontal executive cortex and glucose tolerance. Immediate recovery prioritized.';
    hearthAction = { label: 'Seal Shutdown Ritual', actionType: 'OPEN_EVENING_WRAP' };
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
    canopyStatusTier = 'ANABOLIC & HYDRATED';
    canopyColor = 'emerald';
    canopyMechanism =
      'Leucine satiety trigger satisfied. Osmotic intracellular hydration supports maximal cognitive processing speed.';
    canopyAction = { label: 'Fuel Synthesized', actionType: 'NONE' };
  } else if (canopyScore >= 60) {
    canopyStatusTier = 'METABOLIC MAINTENANCE';
    canopyColor = 'amber';
    canopyMechanism =
      'Nutritional baseline adequate but below optimal threshold for muscle protein synthesis and glucose stabilization.';
    canopyAction = { label: 'Quick Add +25g Protein', actionType: 'LOG_PROTEIN', payload: { amount: 25 } };
  } else {
    canopyStatusTier = 'CELLULAR DEFICIT';
    canopyColor = 'rust';
    canopyMechanism =
      'Negative nitrogen balance and intracellular hypohydration. Fatigue likely compounded by delayed amino acid delivery.';
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
    atmosphereStatusTier = 'SYNCHRONIZED ENTRAINMENT';
    atmosphereColor = 'emerald';
    atmosphereMechanism =
      'Photonic lux anchored central clock genes. Circadian cortisol curve optimal; nocturnal melatonin scheduled naturally.';
    atmosphereAction = { label: 'Circadian Aligned', actionType: 'NONE' };
  } else if (atmosphereScore >= 55) {
    atmosphereStatusTier = 'CIRCADIAN DRIFT';
    atmosphereColor = 'amber';
    atmosphereMechanism =
      'Partial zeitgeber alignment. Missing morning lux or delayed protocol commitment creates vulnerability to afternoon slump.';
    atmosphereAction = !input.protocolAccepted
      ? { label: 'Lock Protocol Directive', actionType: 'ACCEPT_PROTOCOL' }
      : { label: 'Open Daily Planner', actionType: 'NAV_DASHBOARD' };
  } else {
    atmosphereStatusTier = 'DESYNCHRONIZED PHASE';
    atmosphereColor = 'rust';
    atmosphereMechanism =
      'Circadian rhythm desynchronized. Blue light exposure and erratic timing fragments diurnal focus cycles.';
    atmosphereAction = !input.protocolAccepted
      ? { label: 'Lock Protocol Directive', actionType: 'ACCEPT_PROTOCOL' }
      : { label: 'Open Daily Planner', actionType: 'NAV_DASHBOARD' };
  }

  const atmosphere: PillarTelemetry = {
    score: atmosphereScore,
    statusTier: atmosphereStatusTier,
    statusColor: atmosphereColor,
    primaryMetric: input.sunlightDone ? 'Morning Lux Anchored' : 'Morning Lux Pending',
    secondaryMetric: input.protocolAccepted ? 'Daily Directive Locked' : 'Directive Uncommitted',
    clinicalMechanism: atmosphereMechanism,
    prescriptiveAction: atmosphereAction,
  };

  // 4. Unified Ecosystem Vitality (1 - 10 scale)
  // Incorporates biological limiting factor (Liebig's Law of the Minimum)
  const weightedMean = hearthScore * 0.35 + canopyScore * 0.35 + atmosphereScore * 0.30;
  let ecosystemVitalityLevel = Math.max(1, Math.min(10, Math.round(weightedMean / 10)));
  
  // Cap vitality if any critical physiological pillar is in severe deficit (<50)
  if (hearthScore < 50 || canopyScore < 50 || atmosphereScore < 50) {
    ecosystemVitalityLevel = Math.min(6, ecosystemVitalityLevel);
  }

  let vitalitySummary: string;
  if (ecosystemVitalityLevel >= 8) {
    vitalitySummary =
      'Flourishing biological harmony. Cellular repair, slow-wave recovery, and circadian rhythms are synchronized.';
  } else if (ecosystemVitalityLevel >= 5) {
    vitalitySummary =
      'Stable baseline with localized deficits. Review lagging biome levers below to prevent compounding fatigue.';
  } else {
    vitalitySummary =
      'Compounding physiological stress. Prioritize deep recovery and whole-food fueling to revitalize the sanctuary.';
  }

  return {
    hearth,
    canopy,
    atmosphere,
    ecosystemVitalityLevel,
    vitalitySummary,
  };
}
