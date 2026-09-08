import { DailyLogData, UserProfile } from '@/store/useHabitStore';

export interface DailyCommandProtocol {
  id: string;
  title: string;
  hypothesis: string;
  mechanism: string;
  directive: string;
  category: 'focus' | 'energy' | 'sleep' | 'nutrition' | 'recovery';
  xpReward: number;
  expectedGain: string;
  recipeSlug?: string;
  recipeTitle?: string;
  protocolId?: string;
}

export interface DailyBriefing {
  date: string;
  greeting: string;
  statusBadge: string;
  yesterdayHighlights: string[];
  todayActionTip: string;
  recommendedRecipeSlug?: string;
  recommendedRecipeTitle?: string;
  recommendedProtocolId?: string;
}

const MASTER_PROTOCOLS: DailyCommandProtocol[] = [
  {
    id: 'delay-caffeine-90m',
    title: 'Adenosine Reset: 90-Min Caffeine Delay',
    hypothesis: 'Delaying caffeine by 90 minutes post-waking clears overnight adenosine without blunting natural cortisol, preventing the 2:30 PM crash.',
    mechanism: 'Cortisol naturally spikes 30–45m after waking to trigger biological alertness. Early caffeine blunts this natural peak and binds to adenosine receptors without metabolizing them; when caffeine decays, accumulated adenosine floods receptors, causing severe afternoon grogginess.',
    directive: 'Hydrate with 500ml water and electrolytes upon waking. Postpone your first espresso or coffee until 90 minutes after your feet hit the floor.',
    category: 'focus',
    xpReward: 50,
    expectedGain: '+38% 3 PM Focus',
    recipeSlug: 'cast-iron-skillet-eggs',
    recipeTitle: 'Cast-Iron Skillet Eggs & Greens',
    protocolId: 'morning-activation',
  },
  {
    id: 'post-prandial-walk',
    title: 'Glycemic Shunt: 10-Min Post-Meal Walk',
    hypothesis: 'A gentle 10-minute walk within 30 minutes of eating shunts glucose directly into skeletal muscle via non-insulin GLUT4 translocation.',
    mechanism: 'Light muscle contractions activate GLUT4 glucose transporters independently of insulin, blunting peak post-meal blood sugar spikes by up to 34% and preventing post-lunch cognitive lethargy.',
    directive: 'Immediately following your largest meal today, take an easy 10-minute continuous stroll outdoors or around your building before returning to your desk.',
    category: 'energy',
    xpReward: 50,
    expectedGain: '-34% Post-Lunch Slump',
    recipeSlug: 'herb-grilled-chicken',
    recipeTitle: 'Herb Grilled Chicken & Crispy Greens',
    protocolId: 'cellular-mobility',
  },
  {
    id: 'morning-photon-exposure',
    title: 'Circadian Ignition: 15m Natural Sunlight',
    hypothesis: 'Early outdoor photon exposure to retinal ganglion cells anchors your master circadian clock (SCN) and sets a precise timer for melatonin release 16h later.',
    mechanism: 'Natural outdoor daylight exceeds 10,000–50,000 lux (compared to only 500 lux indoors). This stimulates melanopsin in intrinsically photosensitive retinal ganglion cells, shutting down melatonin and calibrating cortisol timing.',
    directive: 'Within 45 minutes of waking, step outside without sunglasses for 10–15 minutes. Look toward the direction of natural daylight.',
    category: 'energy',
    xpReward: 50,
    expectedGain: '+25% Morning Alertness',
    recipeSlug: 'greek-lemon-salmon',
    recipeTitle: 'Greek Lemon Garlic Salmon',
    protocolId: 'morning-activation',
  },
  {
    id: 'protein-satiety-anchor',
    title: 'Metabolic Anchor: 35g+ Protein Breakfast',
    hypothesis: 'Consuming 35g+ of complete protein in your first meal triggers sustained peptide YY and GLP-1 secretion, stabilizing dopamine and mental stamina through midday.',
    mechanism: 'Adequate branched-chain amino acids provide precursor l-tyrosine for dopamine synthesis while preventing blood glucose volatility associated with high-glycemic carbohydrates.',
    directive: 'Structure your morning meal around at least 35g of bioavailable protein (e.g. eggs, greek yogurt, tofu/paneer, or wild salmon) before your first intense work block.',
    category: 'nutrition',
    xpReward: 50,
    expectedGain: '+40% Satiety & Mental Stamina',
    recipeSlug: 'paneer-tikka-bowl',
    recipeTitle: 'Spiced Paneer Tikka Fuel Bowl',
    protocolId: 'cognitive-flow',
  },
  {
    id: 'digital-sunset-melatonin',
    title: 'Digital Sunset: 60m Blue Light Cutoff',
    hypothesis: 'Eliminating short-wavelength blue light (<480nm) 60 minutes prior to sleep accelerates core body temperature drop and shortens sleep latency.',
    mechanism: 'Blue photons suppress pineal gland melatonin production by over 80%. Dimming screen illumination allows natural melatonin titration, promoting deeper slow-wave restorative delta sleep.',
    directive: '60 minutes before your planned bedtime, shut down work monitors and place phones in do-not-disturb mode across the room. Transition to dim, warm room lighting.',
    category: 'sleep',
    xpReward: 50,
    expectedGain: '+28% Deep Slow-Wave Sleep',
    recipeSlug: 'truffle-tagliatelle-pasta',
    recipeTitle: 'Truffle Tagliatelle & Oyster Mushrooms',
    protocolId: 'deep-rem-sleep',
  },
  {
    id: 'dopamine-single-tasking',
    title: 'Neural Firewall: 90-Min Single-Task Sprint',
    hypothesis: 'A protected 90-minute block without context switching leverages ultradian rhythm biology to maximize prefrontal cortex working memory.',
    mechanism: 'Task-switching induces "attention residue" that takes up to 23 minutes to dissipate. Single-tasking aligns with the brain’s natural 90-minute basic rest-activity cycle (BRAC), driving peak cognitive output.',
    directive: 'Close all communication apps (Slack, email, social) for one dedicated 90-minute sprint this morning. Work on your #1 highest-leverage priority alone.',
    category: 'focus',
    xpReward: 50,
    expectedGain: '2.5x Deep Work Velocity',
    recipeSlug: 'cast-iron-skillet-eggs',
    recipeTitle: 'Cast-Iron Skillet Eggs & Greens',
    protocolId: 'cognitive-flow',
  },
];

/**
 * Deterministically generates today's hypothesized biological lever.
 */
export function getDailyCommandProtocol(
  dateStr: string,
  primaryGoal?: string,
  yesterdayLog?: DailyLogData | null
): DailyCommandProtocol {
  // If yesterday had critically low sleep (<6.5h), prioritize sleep recovery/adenosine
  if (yesterdayLog && yesterdayLog.sleepHours > 0 && yesterdayLog.sleepHours < 6.5) {
    return MASTER_PROTOCOLS[0]; // Adenosine Reset
  }

  // Hash date string to rotate levers predictably per day
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const positiveIndex = Math.abs(hash);

  // Goal-tailored weighting
  if (primaryGoal === 'sleep') {
    const sleepLevers = MASTER_PROTOCOLS.filter((p) => p.category === 'sleep' || p.category === 'recovery');
    return sleepLevers[positiveIndex % sleepLevers.length];
  }

  if (primaryGoal === 'focus') {
    const focusLevers = MASTER_PROTOCOLS.filter((p) => p.category === 'focus' || p.category === 'nutrition');
    return focusLevers[positiveIndex % focusLevers.length];
  }

  return MASTER_PROTOCOLS[positiveIndex % MASTER_PROTOCOLS.length];
}

/**
 * Generates an actionable morning briefing card based on yesterday's bio-metrics.
 */
export function getDailyBriefing(
  dateStr: string,
  userProfile?: UserProfile | null,
  yesterdayLog?: DailyLogData | null
): DailyBriefing {
  let name = 'Explorer';
  if (userProfile?.fullName) {
    const parts = userProfile.fullName.trim().split(/\s+/);
    if (parts.length > 1 && /^(dr\.?|mr\.?|mrs\.?|ms\.?|prof\.?)$/i.test(parts[0])) {
      name = parts[1];
    } else {
      name = parts[0];
    }
  }
  const goal = userProfile?.primaryGoal || 'focus';

  const hour = new Date().getHours();
  let salutation = 'Good morning';
  if (hour >= 12 && hour < 17) {
    salutation = 'Good afternoon';
  } else if (hour >= 17) {
    salutation = 'Good evening';
  }

  const highlights: string[] = [];

  if (yesterdayLog) {
    if (yesterdayLog.sleepHours >= 7.5) {
      highlights.push(`Sleep Foundation: ${yesterdayLog.sleepHours}h restorative rest (+High CNS readiness).`);
    } else if (yesterdayLog.sleepHours > 0) {
      highlights.push(`Sleep Deficit: ${yesterdayLog.sleepHours}h logged (Hold caffeine 90m to clear adenosine).`);
    } else {
      highlights.push(
        hour >= 17
          ? 'Calibration Day: Seal your evening wrap to calibrate your recovery baseline.'
          : 'Calibration Day: Establish your baseline with today’s Morning Boot.'
      );
    }

    if (yesterdayLog.hydrationLiters >= 2.5) {
      highlights.push(`Cellular Hydration: ${yesterdayLog.hydrationLiters}L met yesterday (+Optimal brain perfusion).`);
    } else if (yesterdayLog.totalProteinLogged >= 100) {
      highlights.push(`Whole-Food Fuel: Solid ${yesterdayLog.totalProteinLogged}g protein logged yesterday.`);
    } else {
      highlights.push('Target Lever: Pair today’s focus with whole-food amino acid density.');
    }
  } else {
    highlights.push(`Daily Mission: Calibrate your ${goal} baseline with today’s single protocol.`);
    highlights.push(
      hour >= 17
        ? 'Bio-Engine Status: Standing by for your 15-second Desk Wrap check-in.'
        : 'Bio-Engine Status: Standing by for your 10-second Morning Boot check-in.'
    );
  }

  const todayProtocol = getDailyCommandProtocol(dateStr, goal, yesterdayLog);

  return {
    date: dateStr,
    greeting: `${salutation}, ${name}`,
    statusBadge: 'Bio-Engine Synced',
    yesterdayHighlights: highlights,
    todayActionTip: todayProtocol.directive,
    recommendedRecipeSlug: todayProtocol.recipeSlug,
    recommendedRecipeTitle: todayProtocol.recipeTitle,
    recommendedProtocolId: todayProtocol.protocolId,
  };
}
