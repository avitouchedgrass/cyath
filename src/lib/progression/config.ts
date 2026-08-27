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
  return Math.round(60 * Math.pow(level, 1.5));
}

export interface TitleRank {
  minLevel: number;
  name: string;
}

export const TITLE_RANKS: TitleRank[] = [
  { minLevel: 50, name: 'Mythic of the Wild' },
  { minLevel: 45, name: 'Starwarden' },
  { minLevel: 40, name: 'Mythweaver' },
  { minLevel: 35, name: 'Eldergrove Guardian' },
  { minLevel: 30, name: 'Beastwarden' },
  { minLevel: 25, name: 'Froststrider' },
  { minLevel: 20, name: 'Grovecaller' },
  { minLevel: 15, name: 'Emberwarden' },
  { minLevel: 10, name: 'Trailkeeper' },
  { minLevel: 5, name: 'Forager' },
  { minLevel: 1, name: 'Wanderer' },
];

export interface StreakMilestone {
  days: number;
  xp: number;
  name: string;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, xp: 50, name: 'Kindling' },
  { days: 7, xp: 100, name: 'Steady Burn' },
  { days: 14, xp: 200, name: 'Hearthkeeper' },
  { days: 30, xp: 400, name: 'Moonwatch' },
  { days: 60, xp: 600, name: 'Old Growth' },
  { days: 100, xp: 1000, name: 'Eternal Flame' },
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
  category: 'nutrition' | 'habits' | 'recovery' | 'activity';
  target: number;
  unit: string;
}

export const DAILY_QUEST_POOL: QuestTemplate[] = [
  {
    id: 'morning_activation',
    title: 'Dawn Ignition',
    description: 'Catch early sunlight & hydrate within 30 minutes of waking.',
    xpAward: 25,
    category: 'habits',
    target: 1,
    unit: 'action',
  },
  {
    id: 'protein_target',
    title: 'Structural Synthesis',
    description: 'Hit 120g+ of bioavailable daily protein.',
    xpAward: 30,
    category: 'nutrition',
    target: 120,
    unit: 'g',
  },
  {
    id: 'hydration_flow',
    title: 'Artesian Flow',
    description: 'Consume at least 2.0L of pure water & minerals.',
    xpAward: 25,
    category: 'nutrition',
    target: 2.0,
    unit: 'L',
  },
  {
    id: 'sleep_restoration',
    title: 'Deep Reconstitution',
    description: 'Log 7+ hours of uninterrupted sleep.',
    xpAward: 25,
    category: 'recovery',
    target: 7,
    unit: 'hrs',
  },
  {
    id: 'habit_trio',
    title: 'The Triumvirate',
    description: 'Complete at least 3 distinct habits today.',
    xpAward: 35,
    category: 'habits',
    target: 3,
    unit: 'habits',
  },
  {
    id: 'recipe_craft',
    title: 'Alchemical Fuel',
    description: 'Cook or log a nutrient-dense whole-food recipe.',
    xpAward: 30,
    category: 'nutrition',
    target: 1,
    unit: 'dish',
  },
  {
    id: 'flawless_habits',
    title: 'Absolute Alignment',
    description: 'Complete every single scheduled habit on your list.',
    xpAward: 50,
    category: 'habits',
    target: 1,
    unit: 'day',
  },
];
