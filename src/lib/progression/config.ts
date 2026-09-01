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
  // Calibrated exponential curve: balanced pacing, cutting progression time in half for responsive reward loop
  return Math.round(20 * Math.pow(level - 1, 2.12));
}

export interface TitleRank {
  minLevel: number;
  name: string;
}

export const TITLE_RANKS: TitleRank[] = [
  { minLevel: 50, name: 'Mythic of the Wild' },
  { minLevel: 42, name: 'Starwarden' },
  { minLevel: 35, name: 'Mythweaver' },
  { minLevel: 28, name: 'Eldergrove Guardian' },
  { minLevel: 21, name: 'Beastwarden' },
  { minLevel: 15, name: 'Froststrider' },
  { minLevel: 10, name: 'Grovecaller' },
  { minLevel: 6, name: 'Emberwarden' },
  { minLevel: 3, name: 'Trailkeeper' },
  { minLevel: 2, name: 'Forager' },
  { minLevel: 1, name: 'Wanderer' },
];

export interface IslandTier {
  tier: number;
  minLevel: number;
  name: string;
  image: string;
  description: string;
}

export const ISLAND_TIERS: IslandTier[] = [
  { tier: 1, minLevel: 1, name: 'The Awakening Rock', image: '/islands/r1.webp', description: 'A nascent floating bedrock in the quiet morning sky.' },
  { tier: 2, minLevel: 3, name: 'The Timber Shanty', image: '/islands/r2.webp', description: 'Early roots take hold with a humble wooden shelter.' },
  { tier: 3, minLevel: 6, name: 'The Woodcutter Cabin', image: '/islands/r3.webp', description: 'A sturdy stone and timber hearth amidst growing greenery.' },
  { tier: 4, minLevel: 10, name: 'The Hearthside Cottage', image: '/islands/r4.webp', description: 'A blossoming cottage with stone chimney and garden.' },
  { tier: 5, minLevel: 15, name: 'The Watermill Homestead', image: '/islands/r5.webp', description: 'Fresh mountain water flows as habits settle into steady rhythm.' },
  { tier: 6, minLevel: 21, name: 'The Windmill Grove', image: '/islands/r6.webp', description: 'Catching sky currents with thriving crops and stone paved paths.' },
  { tier: 7, minLevel: 28, name: 'The Forest Haven', image: '/islands/r7.webp', description: 'An expansive woodland island of verified daily discipline.' },
  { tier: 8, minLevel: 35, name: 'The Celestial Observatory', image: '/islands/r8.webp', description: 'Reaching into the stars with brass spires and hanging lanterns.' },
  { tier: 9, minLevel: 42, name: 'The Skylands Estate', image: '/islands/r9.webp', description: 'A grand multi-tier sky estate overlooking the morning clouds.' },
  { tier: 10, minLevel: 50, name: 'The Eden Canopy', image: '/islands/r10.webp', description: 'The pinnacle sky haven, vibrant and blooming.' },
];

export function getIslandTier(level: number): IslandTier {
  for (let i = ISLAND_TIERS.length - 1; i >= 0; i--) {
    if (level >= ISLAND_TIERS[i].minLevel) {
      return ISLAND_TIERS[i];
    }
  }
  return ISLAND_TIERS[0];
}

export function getNextIslandTier(level: number): IslandTier | null {
  for (let i = 0; i < ISLAND_TIERS.length; i++) {
    if (ISLAND_TIERS[i].minLevel > level) {
      return ISLAND_TIERS[i];
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
