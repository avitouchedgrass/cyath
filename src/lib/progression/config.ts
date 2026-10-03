export const XP_AWARDS = {
  habitComplete: 15,
  perfectDay: 60,
  proteinGoal: 20,
  proteinPartial: 10,
  hydrationGoal: 15,
  sleepGoal: 15,
  energyLog: 5,
  moodLog: 5,
  recipeLogged: 20,
} as const;

export const GOALS = {
  proteinGrams: 120,
  hydrationLiters: 2,
  sleepHours: 7,
} as const;

export const MAX_LEVEL = 50;

export function xpToReachLevel(level: number): number {
  if (level <= 1) return 0;
  // Calibrated progression curve for 3 parallel island suites:
  // - Day 1: Level 2 (~40 XP)
  // - Day 2: Level 3 (~94 XP) -> First Island Evolution to Tier 2 Shanty!
  // - Week 1: Level 6 (~353 XP) -> Tier 3 Hearth / Cabin
  // - Day 16: Level 10 (~926 XP) -> Tier 4 Workshop / Cottage
  // - Month 1: Level 15 (~2,019 XP) -> Tier 5 Homestead / Station
  // - Year 1: Level 50 (~21,029 XP) -> Tier 10 Sovereign Sky Temple / Core
  return Math.round(32 * (level - 1) + 7.5 * Math.pow(level - 1, 2.02));
}

export interface TitleRank {
  minLevel: number;
  name: string;
}

export const TITLE_RANKS: TitleRank[] = [
  { minLevel: 50, name: 'Level 50' },
  { minLevel: 42, name: 'Level 42' },
  { minLevel: 35, name: 'Level 35' },
  { minLevel: 28, name: 'Level 28' },
  { minLevel: 21, name: 'Level 21' },
  { minLevel: 15, name: 'Level 15' },
  { minLevel: 10, name: 'Level 10' },
  { minLevel: 6, name: 'Level 6' },
  { minLevel: 3, name: 'Level 3' },
  { minLevel: 2, name: 'Level 2' },
  { minLevel: 1, name: 'Level 1' },
];

export type IslandSuiteId = 'circadian' | 'iron' | 'focus';

export interface IslandTier {
  tier: number;
  minLevel: number;
  name: string;
  image: string;
  svgImage: string;
  pngImage: string;
  description: string;
}

export interface IslandSuiteMeta {
  id: IslandSuiteId;
  name: string;
  tagline: string;
  themeColor: string;
  badge: string;
  tiers: IslandTier[];
}

export const CIRCADIAN_MASTER_TIERS: IslandTier[] = [
  { tier: 1, minLevel: 1, name: 'The Awakening Rock', image: '/islands/r1.png', svgImage: '/islands/r1.png', pngImage: '/islands/r1.png', description: 'A nascent floating bedrock in the quiet morning sky.' },
  { tier: 2, minLevel: 3, name: 'The Timber Shanty', image: '/islands/r2.png', svgImage: '/islands/r2.png', pngImage: '/islands/r2.png', description: 'Early roots take hold with a humble wooden shelter.' },
  { tier: 3, minLevel: 6, name: 'The Woodcutter Cabin', image: '/islands/r3.png', svgImage: '/islands/r3.png', pngImage: '/islands/r3.png', description: 'A sturdy stone and timber hearth amidst growing greenery.' },
  { tier: 4, minLevel: 10, name: 'The Hearthside Cottage', image: '/islands/r4.png', svgImage: '/islands/r4.png', pngImage: '/islands/r4.png', description: 'A blossoming cottage with stone chimney and garden.' },
  { tier: 5, minLevel: 15, name: 'The Watermill Homestead', image: '/islands/r5.png', svgImage: '/islands/r5.png', pngImage: '/islands/r5.png', description: 'Fresh mountain water flows as habits settle into steady rhythm.' },
  { tier: 6, minLevel: 21, name: 'The Windmill Grove', image: '/islands/r6.png', svgImage: '/islands/r6.png', pngImage: '/islands/r6.png', description: 'Catching sky currents with thriving crops and stone paved paths.' },
  { tier: 7, minLevel: 28, name: 'The Forest Haven', image: '/islands/r7.png', svgImage: '/islands/r7.png', pngImage: '/islands/r7.png', description: 'An expansive woodland island of verified daily discipline.' },
  { tier: 8, minLevel: 35, name: 'The Celestial Observatory', image: '/islands/r8.png', svgImage: '/islands/r8.png', pngImage: '/islands/r8.png', description: 'Reaching into the stars with brass spires and hanging lanterns.' },
  { tier: 9, minLevel: 42, name: 'The Skylands Estate', image: '/islands/r9.png', svgImage: '/islands/r9.png', pngImage: '/islands/r9.png', description: 'A grand multi-tier sky estate overlooking the morning clouds.' },
  { tier: 10, minLevel: 50, name: 'The Eden Canopy', image: '/islands/r10.png', svgImage: '/islands/r10.png', pngImage: '/islands/r10.png', description: 'The canopy sanctuary, vibrant and blooming.' },
];

export const IRON_ANCHOR_TIERS: IslandTier[] = [
  { tier: 1, minLevel: 1, name: 'The Smoldering Anvil', image: '/islands/iron_1.png', svgImage: '/islands/iron_1.png', pngImage: '/islands/iron_1.png', description: 'An isolated basalt bedrock with a solitary iron anvil and glowing coals.' },
  { tier: 2, minLevel: 3, name: 'The Iron Shanty', image: '/islands/iron_2.png', svgImage: '/islands/iron_2.png', pngImage: '/islands/iron_2.png', description: 'A rough-hewn stone forge with corrugated timber roof and quenching barrel.' },
  { tier: 3, minLevel: 6, name: 'The Foundry Hearth', image: '/islands/iron_3.png', svgImage: '/islands/iron_3.png', pngImage: '/islands/iron_3.png', description: 'A sturdy stone smithy with leather bellows, blast furnace, and forged ingots.' },
  { tier: 4, minLevel: 10, name: 'The Piston Workshop', image: '/islands/iron_4.png', svgImage: '/islands/iron_4.png', pngImage: '/islands/iron_4.png', description: 'Enclosed stone workshop with brass steam exhaust and mechanical trip hammer.' },
  { tier: 5, minLevel: 15, name: 'The Steam Forge Homestead', image: '/islands/iron_5.png', svgImage: '/islands/iron_5.png', pngImage: '/islands/iron_5.png', description: 'A two-story facility with copper steam boiler and rotating iron gear wheel.' },
  { tier: 6, minLevel: 21, name: 'The Ironclad Mill', image: '/islands/iron_6.png', svgImage: '/islands/iron_6.png', pngImage: '/islands/iron_6.png', description: 'Heavy blast smelting kiln with crane pulley and flowing molten slag channel.' },
  { tier: 7, minLevel: 28, name: 'The Great Foundry Citadel', image: '/islands/iron_7.png', svgImage: '/islands/iron_7.png', pngImage: '/islands/iron_7.png', description: 'Fortified stone ramparts with suspension catwalks and towering chimney flues.' },
  { tier: 8, minLevel: 35, name: 'The Mechanical Bastion', image: '/islands/iron_8.png', svgImage: '/islands/iron_8.png', pngImage: '/islands/iron_8.png', description: 'Massive rotating brass clockwork gears and twin molten crucible vats.' },
  { tier: 9, minLevel: 42, name: 'The Dreadnought Forge', image: '/islands/iron_9.png', svgImage: '/islands/iron_9.png', pngImage: '/islands/iron_9.png', description: 'A monumental industrial fortress with molten bronze falls cascading into the void.' },
  { tier: 10, minLevel: 50, name: 'The Colossus Foundry Core', image: '/islands/iron_10.png', svgImage: '/islands/iron_10.png', pngImage: '/islands/iron_10.png', description: 'The mythical sovereign sky-forge with a levitating core of white-hot fire.' },
];

export const DEEP_WORKER_TIERS: IslandTier[] = [
  { tier: 1, minLevel: 1, name: 'The Submerged Obelisk', image: '/islands/worker_1.png', svgImage: '/islands/worker_1.png', pngImage: '/islands/worker_1.png', description: 'Ancient carved runic obelisk on dark sea-stone with glowing cyan kelp.' },
  { tier: 2, minLevel: 3, name: 'The Tide Shanty', image: '/islands/worker_2.png', svgImage: '/islands/worker_2.png', pngImage: '/islands/worker_2.png', description: 'Weathered driftwood research post with azure glass lanterns and tide pool basin.' },
  { tier: 3, minLevel: 6, name: 'The Abyssal Outpost', image: '/islands/worker_3.png', svgImage: '/islands/worker_3.png', pngImage: '/islands/worker_3.png', description: 'Marine stone station with brass diving bell crane and bubbling glass alembics.' },
  { tier: 4, minLevel: 10, name: 'The Oceanic Laboratory', image: '/islands/worker_4.png', svgImage: '/islands/worker_4.png', pngImage: '/islands/worker_4.png', description: 'Teal slate cabin with glowing portholes and bioluminescent specimen tanks.' },
  { tier: 5, minLevel: 15, name: 'The Hydro-Current Station', image: '/islands/worker_5.png', svgImage: '/islands/worker_5.png', pngImage: '/islands/worker_5.png', description: 'Deep water research mill with turquoise falls and glowing crystal gardens.' },
  { tier: 6, minLevel: 21, name: 'The Luminescent Conservatory', image: '/islands/worker_6.png', svgImage: '/islands/worker_6.png', pngImage: '/islands/worker_6.png', description: 'Geodesic marine greenhouse with floating spore clouds and observation terrace.' },
  { tier: 7, minLevel: 28, name: 'The Crystal Trench Haven', image: '/islands/worker_7.png', svgImage: '/islands/worker_7.png', pngImage: '/islands/worker_7.png', description: 'Clustered resonance crystals with elevated wooden catwalks and tide pools.' },
  { tier: 8, minLevel: 35, name: 'The Deep Sea Observatory', image: '/islands/worker_8.png', svgImage: '/islands/worker_8.png', pngImage: '/islands/worker_8.png', description: 'Spherical astrolabe observatory tower with pulsing azure energy conduits.' },
  { tier: 9, minLevel: 42, name: 'The Leviathan Sanctuary', image: '/islands/worker_9.png', svgImage: '/islands/worker_9.png', pngImage: '/islands/worker_9.png', description: 'Majestic oceanic sky-estate with arched aqueducts and floating flora.' },
  { tier: 10, minLevel: 50, name: 'The Abyssal Aether Citadel', image: '/islands/worker_10.png', svgImage: '/islands/worker_10.png', pngImage: '/islands/worker_10.png', description: 'Mythical iridescent pearl citadel anchored around a colossal glowing azure crystal.' },
];

export const ISLAND_SUITES: Record<IslandSuiteId, IslandSuiteMeta> = {
  circadian: {
    id: 'circadian',
    name: 'The Circadian Master',
    tagline: 'Sunlight timing, caffeine cutoff discipline & restorative slow-wave sleep.',
    themeColor: '#059669',
    badge: 'Forest & Light',
    tiers: CIRCADIAN_MASTER_TIERS,
  },
  iron: {
    id: 'iron',
    name: 'The Iron Anchor',
    tagline: 'Strength, muscle preservation & calibrated metabolic protein floor.',
    themeColor: '#EA580C',
    badge: 'Basalt & Forge',
    tiers: IRON_ANCHOR_TIERS,
  },
  focus: {
    id: 'focus',
    name: 'The Deep Worker',
    tagline: 'Cognitive dopamine protection, blood-sugar stability & uninterrupted flow.',
    themeColor: '#0284C7',
    badge: 'Abyssal & Neon',
    tiers: DEEP_WORKER_TIERS,
  },
};

/** Default active suite (backward compatible with all legacy imports) */
export const ISLAND_TIERS: IslandTier[] = CIRCADIAN_MASTER_TIERS;

export function getSuiteTiers(suiteId?: string | null): IslandTier[] {
  if (suiteId && suiteId in ISLAND_SUITES) {
    return ISLAND_SUITES[suiteId as IslandSuiteId].tiers;
  }
  return CIRCADIAN_MASTER_TIERS;
}

export function getIslandTier(level: number, suiteId?: string | null): IslandTier {
  const tiers = getSuiteTiers(suiteId);
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (level >= tiers[i].minLevel) {
      return tiers[i];
    }
  }
  return tiers[0];
}

export function getNextIslandTier(level: number, suiteId?: string | null): IslandTier | null {
  const tiers = getSuiteTiers(suiteId);
  for (let i = 0; i < tiers.length; i++) {
    if (tiers[i].minLevel > level) {
      return tiers[i];
    }
  }
  return null;
}

export interface StreakMilestone {
  days: number;
  xp: number;
  name: string;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, xp: 50, name: '3 Day Streak' },
  { days: 7, xp: 100, name: '1 Week Streak' },
  { days: 14, xp: 200, name: '2 Week Streak' },
  { days: 30, xp: 400, name: '1 Month Streak' },
  { days: 60, xp: 600, name: '2 Month Streak' },
  { days: 100, xp: 1000, name: '100 Day Streak' },
];

export const STREAK_FREEZE = {
  earnEveryDays: 7,
  maxStock: 2,
} as const;

export const WEEKLY_CHALLENGE_XP = 150;

export interface QuestTemplate {
  id: string;
  title: string;
  description: string;
  xpAward: number;
  category: 'nutrition' | 'hydration' | 'habits' | 'recovery' | 'activity';
  target: number;
  unit: string;
}

export type Quest = QuestTemplate;

export const DAILY_QUEST_POOL: QuestTemplate[] = [
  {
    id: 'morning_activation',
    title: 'Morning Sun & Water',
    description: 'Get morning sunlight and hydrate within 30 minutes of waking.',
    xpAward: 25,
    category: 'habits',
    target: 1,
    unit: 'action',
  },
  {
    id: 'protein_target',
    title: 'Protein Target',
    description: 'Hit 120g+ of dietary protein today.',
    xpAward: 30,
    category: 'nutrition',
    target: 120,
    unit: 'g',
  },
  {
    id: 'hydration_flow',
    title: 'Hydration Target',
    description: 'Drink at least 2.0L of water today.',
    xpAward: 25,
    category: 'hydration',
    target: 2.0,
    unit: 'L',
  },
  {
    id: 'sleep_restoration',
    title: 'Quality Sleep',
    description: 'Log 7+ hours of quality sleep.',
    xpAward: 25,
    category: 'recovery',
    target: 7,
    unit: 'hrs',
  },
  {
    id: 'habit_trio',
    title: 'Habit Trio',
    description: 'Complete at least 3 distinct habits today.',
    xpAward: 35,
    category: 'habits',
    target: 3,
    unit: 'habits',
  },
  {
    id: 'recipe_craft',
    title: 'Daily Meal Log',
    description: 'Cook or log a nutrient-dense whole-food recipe.',
    xpAward: 30,
    category: 'nutrition',
    target: 1,
    unit: 'dish',
  },
  {
    id: 'flawless_habits',
    title: 'Perfect Day',
    description: 'Complete every scheduled habit on your list.',
    xpAward: 50,
    category: 'habits',
    target: 1,
    unit: 'day',
  },
];

export const DAILY_QUESTS = DAILY_QUEST_POOL;
