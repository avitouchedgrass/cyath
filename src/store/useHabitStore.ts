import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { calculateProteinRebalance, ProteinRebalanceResult } from '@/lib/metabolicRebalancer';
import {
  XP_AWARDS,
  GOALS,
  STREAK_FREEZE,
  getIslandTier,
} from '@/lib/progression/config';
import {
  calculateLevel,
  calculateStreakStatus,
  getDailyQuests,
} from '@/lib/progression/engine';
import { progressionEvents } from '@/lib/progression/events';
import { retroAudio } from '@/lib/retroAudio';
import { Recipe, RECIPES } from '@/lib/recipes';
import { validateReferralCodeInput, KNOWN_SEED_CODES, extractReferralCode } from '@/lib/referralUtils';
import { formatLocalDate, getLocalWeekKey } from '@/lib/dateUtils';
import { XP_MATRIX } from '@/lib/constants/xpMatrix';

export interface HabitItem {
  id: string;
  title: string;
  category: 'morning' | 'nutrition' | 'movement' | 'recovery' | 'mindset' | 'lifestyle' | 'life' | 'misc' | 'custom' | 'circadian' | 'fuel';
  targetDaysPerWeek: number;
}

export interface LoggedMealEntry {
  id: string;
  name: string;
  protein: number;
  calories: number;
  carbs?: number;
  fats?: number;
  dietType?: 'vegetarian' | 'vegan' | 'eggetarian' | 'pescatarian' | 'omnivore';
  isVegetarian?: boolean;
  category?: 'High Protein' | 'Steady Carbs' | 'Quick Fuel' | 'Keto Clean' | 'Post Workout';
  ingredients?: Array<{ item: string; amount: string }>;
  suggestedSprite?: string;
  loggedAt: string;
  recipeId?: string;
  savedAsRecipe?: boolean;
  mealSlot?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface DailyLogData {
  habitsCompleted: Record<string, boolean>;
  totalProteinLogged: number;
  totalCaloriesLogged: number;
  hydrationLiters: number;
  sleepHours: number;
  energyLevel: number;
  moodScore: number;
  notes: string;
  loggedRecipeIds: string[];
  loggedMeals?: LoggedMealEntry[];
  isDownscaled?: boolean;
  quickPlateType?: string | null;
  retentionCohortDay?: number;
  isForgedReentry?: boolean;
}

export interface DeskRitualData {
  morningBootCompleted?: boolean;
  eveningWrapCompleted?: boolean;
  morningRestedRating?: number;
  wakeTime?: string;
  afternoonSlumpScore?: number;
  targetFocusHours?: number;
  caffeineCutoffRespected?: boolean;
  caffeineStatus?: 'none' | 'before_cutoff' | 'after_cutoff';
  wholeFoodRating?: number;
}

export interface PendingUserAction {
  type: 'LOG_RECIPE' | 'TOGGLE_HABIT' | 'ACTIVATE_PROTOCOL';
  payload: any;
  returnUrl?: string;
}

export interface UserProfile {
  fullName: string;
  age: number;
  sex: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  heightCm: number;
  weightKg: number;
  primaryGoal: 'focus' | 'muscle' | 'sleep' | 'longevity' | 'fat_loss';
  allergies: string[];
  dietaryRestrictions: string[];
  onboardingCompleted: boolean;
  walkthroughCompleted?: boolean;
  wakeTime?: string;
  bedTime?: string;
  customHabitSlot?: string;
  referralCode?: string;
  referredBy?: string;
  referralCount?: number;
  claimedReferral?: boolean;
  unlockedDecorations?: string[];
  keystoneProtocolId?: string;
  targetProteinGrams?: number;
  energyAudit?: {
    hoursLostPerDay: number;
    daysLostPerYear: number;
    enduranceDeficitPercent: number;
    primaryLeverTitle: string;
    protocolId: string;
  };
  archetype?: 'circadian' | 'iron' | 'focus';
  selectedIslandSuite?: 'circadian' | 'iron' | 'focus';
  circadianScheduleXpClaimed?: boolean;
}

export interface CustomHabitDefinition {
  id: string;
  title: string;
  shortLabel: string;
  category: 'fuel' | 'movement' | 'recovery' | 'circadian' | 'lifestyle' | 'life' | 'misc';
}

export const CUSTOM_HABITS_LIBRARY: CustomHabitDefinition[] = [
  { id: 'gratitude_journal', title: 'Daily Gratitude & Reflection', shortLabel: 'Gratitude', category: 'life' },
  { id: 'mindful_walk', title: 'Mindful Outdoor Reset (15m)', shortLabel: 'Mindful Walk', category: 'life' },
  { id: 'reading_20m', title: 'Deep Non-Screen Reading (20m)', shortLabel: 'Deep Reading', category: 'life' },
  { id: 'journaling', title: 'Archival Journal & Log', shortLabel: 'Journal', category: 'life' },
  { id: 'breathwork', title: 'Box Breathing / Physiological Sigh', shortLabel: 'Breathwork', category: 'life' },
  { id: 'creatine', title: 'Creatine Monohydrate (5g)', shortLabel: 'Creatine', category: 'fuel' },
  { id: 'steps_10k', title: '10,000 Daily Walking Steps', shortLabel: '10k Steps', category: 'movement' },
  { id: 'zone2_walk', title: 'Zone 2 Brisk Walk (20m)', shortLabel: 'Zone 2', category: 'movement' },
  { id: 'cold_shower', title: 'Cold Shower / Cold Plunge', shortLabel: 'Cold Plunge', category: 'recovery' },
  { id: 'screens_off', title: 'Screens Off 60m Pre-Bed', shortLabel: 'Screens Off', category: 'circadian' },
  { id: 'outdoor_walk', title: 'Daily Outdoor Walk', shortLabel: 'Outdoor Life', category: 'misc' },
];

export interface TrophyDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  isShame: boolean;
  spriteUrl: string;
  unlockCondition: string;
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'Celestial' | 'Shame';
  category?: 'sanctuary' | 'seals' | 'biometrics' | 'fuel' | 'streaks' | 'shame';
}

export const TROPHIES_ROSTER: TrophyDefinition[] = [
  // 1. Sanctuary Biome Ascensions
  {
    id: 'island_sprout',
    title: 'Pioneer Anchor',
    subtitle: 'The Awakening Rock',
    description: 'Awoke your living floating island sanctuary in the morning sky at Tier 1.',
    isShame: false,
    spriteUrl: '/assets/trophies/flame_normal.png',
    unlockCondition: 'Reach Island Biome Tier 1',
    tier: 'Bronze',
    category: 'sanctuary',
  },
  {
    id: 'island_cabin',
    title: 'Hearthside Builder',
    subtitle: 'The Woodcutter Cabin',
    description: 'Ascended your living sanctuary to Tier 3 through steady habit execution.',
    isShame: false,
    spriteUrl: '/assets/trophies/flame_normal.png',
    unlockCondition: 'Reach Island Biome Tier 3',
    tier: 'Silver',
    category: 'sanctuary',
  },
  {
    id: 'island_homestead',
    title: 'Watermill Sovereign',
    subtitle: 'The Mountain Homestead',
    description: 'Evolved living sanctuary to Tier 5 with flowing mountain stream and wheel.',
    isShame: false,
    spriteUrl: '/assets/trophies/flame_iron.png',
    unlockCondition: 'Reach Island Biome Tier 5',
    tier: 'Gold',
    category: 'sanctuary',
  },
  {
    id: 'island_observatory',
    title: 'Starlight Astronomer',
    subtitle: 'The Celestial Spire',
    description: 'Reached Tier 8 with brass spires and hanging lanterns touching the stars.',
    isShame: false,
    spriteUrl: '/assets/trophies/flame_iron.png',
    unlockCondition: 'Reach Island Biome Tier 8',
    tier: 'Gold',
    category: 'sanctuary',
  },
  {
    id: 'island_eden',
    title: 'The Eden Canopy',
    subtitle: 'Ascendant Sky Temple',
    description: 'Attained Tier 10: The Sovereign Sky Temple, fully blooming in the clouds.',
    isShame: false,
    spriteUrl: '/assets/trophies/flame_normal.png',
    unlockCondition: 'Attain Island Biome Tier 10',
    tier: 'Celestial',
    category: 'sanctuary',
  },

  // 2. Daily Check-in & Receipts
  {
    id: 'first_seal',
    title: 'The First Brass Seal',
    subtitle: 'First Check-in',
    description: 'Completed your first evening check-in and saved your daily summary.',
    isShame: false,
    spriteUrl: '/assets/trophies/flame_normal.png',
    unlockCondition: 'Complete first daily check-in',
    tier: 'Bronze',
    category: 'seals',
  },
  {
    id: 'seal_streak_7',
    title: 'Weekly Consistency',
    subtitle: '7 Saved Receipts',
    description: 'Completed your daily check-in 7 days in a row.',
    isShame: false,
    spriteUrl: '/assets/trophies/flame_normal.png',
    unlockCondition: '7-day check-in streak achieved',
    tier: 'Silver',
    category: 'seals',
  },
  {
    id: 'seal_streak_30',
    title: 'The Unbroken Month',
    subtitle: 'Consistency Champion',
    description: 'Completed 30 consecutive days of verified evening check-ins.',
    isShame: false,
    spriteUrl: '/assets/trophies/flame_normal.png',
    unlockCondition: '30-day check-in streak achieved',
    tier: 'Celestial',
    category: 'seals',
  },
  {
    id: 'flawless_biometrics',
    title: 'Perfect Day',
    subtitle: 'All Targets Hit',
    description: 'Hit all daily targets: 7-9h sleep + morning sunlight + protein target + caffeine cutoff.',
    isShame: false,
    spriteUrl: '/assets/trophies/solar_vanguard.png',
    unlockCondition: 'Hit all daily targets on a check-in',
    tier: 'Gold',
    category: 'seals',
  },
  {
    id: 'thermal_receipt',
    title: 'Daily Receipt',
    subtitle: 'Saved Summary',
    description: 'Downloaded or shared your daily receipt card.',
    isShame: false,
    spriteUrl: '/assets/trophies/trophy_lock.png',
    unlockCondition: 'Export or share a receipt card',
    tier: 'Bronze',
    category: 'seals',
  },

  // 3. Circadian & Biological Anchor
  {
    id: 'solar_vanguard',
    title: 'The Solar Vanguard',
    subtitle: 'Circadian Eye Master',
    description: 'Logged morning sunlight within your wake window 3 days in a row.',
    isShame: false,
    spriteUrl: '/assets/trophies/solar_vanguard.png',
    unlockCondition: '3-day morning light streak',
    tier: 'Gold',
    category: 'biometrics',
  },
  {
    id: 'first_light',
    title: 'First Light Sentry',
    subtitle: 'Dawn Pioneer',
    description: 'Logged morning sunlight within 30 minutes of waking.',
    isShame: false,
    spriteUrl: '/assets/trophies/solar_vanguard.png',
    unlockCondition: 'Sunlight logged within wake window',
    tier: 'Bronze',
    category: 'biometrics',
  },
  {
    id: 'deep_recovery_7h',
    title: 'The Dream Sanctuary',
    subtitle: 'Restorative Sleep',
    description: 'Achieved 7.5+ hours of sleep across 5 logged days.',
    isShame: false,
    spriteUrl: '/assets/trophies/hydration_alchemist.png',
    unlockCondition: '7.5+ hours sleep logged on 5 days',
    tier: 'Gold',
    category: 'biometrics',
  },
  {
    id: 'caffeine_gate',
    title: 'Adenosine Sentinel',
    subtitle: 'Cutoff Respected',
    description: 'Zero caffeine consumed past your afternoon cutoff across 5 days.',
    isShame: false,
    spriteUrl: '/assets/trophies/midnight_gambler.png',
    unlockCondition: '5 days respecting caffeine cutoff',
    tier: 'Silver',
    category: 'biometrics',
  },
  {
    id: 'zero_slump',
    title: 'The Slumpless Horizon',
    subtitle: 'Unshakable Focus',
    description: 'Recorded Peak energy ratings across 3 consecutive afternoons.',
    isShame: false,
    spriteUrl: '/assets/trophies/solar_vanguard.png',
    unlockCondition: '3 consecutive Peak energy ratings',
    tier: 'Gold',
    category: 'biometrics',
  },

  // 4. Fuel & Nutrition
  {
    id: 'iron_anchor',
    title: 'Iron Protein Anchor',
    subtitle: 'Nutrition Goal',
    description: 'Hit your personalized daily protein target.',
    isShame: false,
    spriteUrl: '/assets/trophies/iron_anchor.png',
    unlockCondition: 'Daily protein target reached',
    tier: 'Gold',
    category: 'fuel',
  },
  {
    id: 'protein_streak',
    title: 'Whole-Food Sentinel',
    subtitle: 'Daily Protein',
    description: 'Hit your daily protein target 5 days in a row.',
    isShame: false,
    spriteUrl: '/assets/trophies/iron_anchor.png',
    unlockCondition: '5-day protein target streak',
    tier: 'Silver',
    category: 'fuel',
  },
  {
    id: 'clean_plate',
    title: 'High-Protein Chef',
    subtitle: 'Balanced Meals',
    description: 'Logged 3 healthy meals in a single day.',
    isShame: false,
    spriteUrl: '/assets/trophies/iron_anchor.png',
    unlockCondition: '3 healthy meals logged in a day',
    tier: 'Bronze',
    category: 'fuel',
  },
  {
    id: 'hydration_alchemist',
    title: 'Hydration Alchemist',
    subtitle: 'Daily Water Goal',
    description: 'Reached 2.5L+ hydration before mid-afternoon.',
    isShame: false,
    spriteUrl: '/assets/trophies/hydration_alchemist.png',
    unlockCondition: '2.5L water logged',
    tier: 'Silver',
    category: 'fuel',
  },
  {
    id: 'cellular_surge',
    title: 'Deep Hydration Crown',
    subtitle: 'Water Intake',
    description: 'Logged 3.0 liters of water in a single day.',
    isShame: false,
    spriteUrl: '/assets/trophies/hydration_alchemist.png',
    unlockCondition: '3.0L water logged in a single day',
    tier: 'Gold',
    category: 'fuel',
  },

  // 5. Streaks & Protocols
  {
    id: 'streak_7d',
    title: 'The 7-Day Monolith',
    subtitle: 'Consistency',
    description: 'Maintained a 7-day habit streak.',
    isShame: false,
    spriteUrl: '/assets/trophies/flame_normal.png',
    unlockCondition: '7-day habit streak reached',
    tier: 'Silver',
    category: 'streaks',
  },
  {
    id: 'streak_30d',
    title: 'The 30-Day Solstice',
    subtitle: 'Consistency Champion',
    description: 'Completed 30 consecutive days of habit consistency.',
    isShame: false,
    spriteUrl: '/assets/trophies/flame_normal.png',
    unlockCondition: '30-day habit streak achieved',
    tier: 'Celestial',
    category: 'streaks',
  },
  {
    id: 'forged_reentry',
    title: 'Forged Fire Heart',
    subtitle: 'Back On Track',
    description: 'Restarted a habit streak after a break.',
    isShame: false,
    spriteUrl: '/assets/trophies/flame_iron.png',
    unlockCondition: 'Restart habit streak',
    tier: 'Gold',
    category: 'streaks',
  },

  // 6. Retro Humorous Anti-Achievements
  {
    id: 'desk_goblin',
    title: 'The 3 PM Desk Goblin',
    subtitle: 'Trophy of Slump & Sloth',
    description: 'Experienced a sub-3/10 afternoon energy crash after skipping morning light or wholesome fuel.',
    isShame: true,
    spriteUrl: '/assets/trophies/desk_goblin.png',
    unlockCondition: 'Afternoon energy slump rating <= 3',
    tier: 'Shame',
    category: 'shame',
  },
  {
    id: 'midnight_gambler',
    title: 'Caffeine Midnight Gambler',
    subtitle: 'Trophy of Jittery Regret',
    description: 'Logged caffeine consumed after your calculated evening caffeine cutoff.',
    isShame: true,
    spriteUrl: '/assets/trophies/midnight_gambler.png',
    unlockCondition: 'Caffeine logged past cutoff window',
    tier: 'Shame',
    category: 'shame',
  },
];

export function generateReferralCode(identifier?: string): string {
  const clean = (identifier || 'CYATH')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 5) || 'CYATH';
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${clean}-${randomSuffix}`;
}

export interface XpHistoryItem {
  id: string;
  amount: number;
  reason: string;
  timestamp: string;
}

export const DEFAULT_HABITS: HabitItem[] = [
  { id: 'sunlight', title: 'Photosynthe-sis (Morning Light & Salts)', category: 'morning', targetDaysPerWeek: 7 },
  { id: 'protein_target', title: 'The Whey of the Warrior (Hit Protein Target)', category: 'nutrition', targetDaysPerWeek: 7 },
  { id: 'movement', title: 'Lift Heavy or Run (Resistance / Zone 2)', category: 'movement', targetDaysPerWeek: 5 },
  { id: 'hydration', title: 'Water You Doing? (2.5L+ Pure Hydration)', category: 'nutrition', targetDaysPerWeek: 7 },
  { id: 'digital_sunset', title: 'Bedtime Air-Lock (Screens Off & Dark Sleep)', category: 'recovery', targetDaysPerWeek: 7 },
  { id: 'mobility', title: 'Un-Desk Your Spine (Thoracic Mobility & Cold Splash)', category: 'recovery', targetDaysPerWeek: 6 },
];

export interface WeightEntry {
  id: string;
  date: string;
  timestamp: number;
  weightKg: number;
  trend: 'down' | 'up' | 'stable';
  deltaKg: number;
  note?: string;
}

export interface SocialQuestPlatformState {
  status: 'unclaimed' | 'pending_verification' | 'verified';
  handle?: string;
  claimedAt?: number;
  verificationCode?: string;
}

export interface SocialQuestsState {
  linkedin: SocialQuestPlatformState;
  instagram: SocialQuestPlatformState;
}

export interface HabitStoreState {
  currentDate: string;
  habits: HabitItem[];
  logsByDate: Record<string, DailyLogData>;
  totalXp: number;
  streakCount: number;
  streakFreezeStock: number;
  claimedMilestones: number[];
  completedQuestIdsByDate: Record<string, string[]>;
  xpHistory: XpHistoryItem[];
  isSyncing: boolean;
  activeProtocolIds: string[];
  customRecipes: Recipe[];
  userSession: { id: string; email?: string } | null;
  userProfile: UserProfile | null;
  pendingAction: PendingUserAction | null;
  dailyProtocolsAcceptedByDate: Record<string, boolean>;
  dailyProtocolsCompletedByDate: Record<string, boolean>;
  sleepGoalAwardedByDate: Record<string, boolean>;
  deskRitualsByDate: Record<string, DeskRitualData>;
  claimedDossiersByWeek: Record<string, boolean>;
  weightHistory: WeightEntry[];
  socialQuests: SocialQuestsState;

  setDate: (date: string) => void;
  setUserSession: (session: { id: string; email?: string } | null) => void;
  reconcileUserSession: (session: { id: string; email?: string } | null) => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  setPendingAction: (action: PendingUserAction | null) => void;
  clearPendingAction: () => void;
  executePendingAction: () => { success: boolean; executedAction: PendingUserAction | null };
  activateProtocol: (protocolId: string, habitsToAdd?: HabitItem[]) => void;
  toggleHabit: (habitId: string, date?: string) => void;
  addCustomHabit: (title: string, category?: HabitItem['category']) => void;
  deleteHabit: (habitId: string) => void;
  setProtein: (amount: number, date?: string) => void;
  setCalories: (amount: number, date?: string) => void;
  setHydration: (liters: number, date?: string) => void;
  setSleep: (hours: number, date?: string) => void;
  setEnergy: (level: number, date?: string) => void;
  setMood: (score: number, date?: string) => void;
  setNotes: (notes: string, date?: string) => void;
  addCustomRecipe: (recipe: Recipe) => void;
  updateCustomRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteCustomRecipe: (id: string) => void;
  logRecipeToDay: (recipeId: string, protein: number, calories: number, date?: string) => void;
  removeRecipeFromDay: (recipeId: string, protein: number, calories: number, date?: string) => void;
  logMealToDay: (meal: Omit<LoggedMealEntry, 'id' | 'loggedAt'> & { id?: string; loggedAt?: string }, date?: string) => LoggedMealEntry;
  removeMealFromDay: (mealId: string, date?: string) => void;
  markMealSavedAsRecipe: (mealId: string, date?: string) => void;
  suiteXp: {
    circadian: number;
    iron: number;
    focus: number;
  };
  gainXp: (amount: number, reason: string, source?: string, suiteId?: 'circadian' | 'iron' | 'focus') => { oldLevel: number; newLevel: number; leveledUp: boolean };
  claimQuest: (questId: string, date?: string) => void;
  claimReferralCode: (code: string) => Promise<{ success: boolean; message: string; xpAwarded: number }>;
  claimWeeklyDossier: (weekKey?: string) => { success: boolean; xpAwarded: number };
  getDailyLog: (date?: string) => DailyLogData;
  syncWithSupabase: (date?: string) => Promise<void>;
  initDemoSession: () => void;
  deleteAccountData: () => Promise<void>;
  resetUserProgress: () => Promise<void>;
  completeWalkthrough: () => void;
  acceptDailyProtocol: (date?: string) => void;
  completeDailyProtocol: (date?: string) => void;
  completeMorningBoot: (data: { sleepHours: number; restedRating: number; sunlightDone: boolean; targetFocusHours: number }, date?: string) => void;
  completeEveningWrap: (data: { caffeineCutoffRespected?: boolean; caffeineStatus?: 'none' | 'before_cutoff' | 'after_cutoff'; wholeFoodRating: number; afternoonSlumpScore: number }, date?: string) => void;
  commitDebriefTelemetry: (date?: string, telemetry?: { sleepHours?: number; sunlightDone?: boolean; proteinGrams?: number; caffeineCutoffRespected?: boolean; caffeineStatus?: 'none' | 'before_cutoff' | 'after_cutoff'; debriefData?: Record<string, unknown> }) => void;
  logWeight: (weightKg: number, note?: string, date?: string) => { success: boolean; deltaKg: number; trend: 'down' | 'up' | 'stable'; xpAwarded: number };
  claimSocialFollow: (platform: 'linkedin' | 'instagram', handle: string) => { success: boolean; message: string; xpAwarded: number };
  setIsDownscaled: (date: string, isDownscaled: boolean) => void;
  unlockDecoration: (decorationId: string) => void;
  setKeystoneProtocol: (protocolId: string) => void;

  isForgedStreak: boolean;
  isReentryAvailable: boolean;
  isLedgerSealedByDate: Record<string, boolean>;
  isLedgerPartiallySealedByDate: Record<string, boolean>;
  dailyDebriefLog: Record<string, Record<string, unknown>>;
  claimedProtocolIds: string[];
  unlockedTrophies: string[];
  trophyCounts: Record<string, number>;
  pendingTrophyUnlock: TrophyDefinition | null;

  setCircadianSchedule: (wakeTime: string, bedTime: string) => void;
  setCustomHabitSlot: (habitId: string, customTitle?: string, category?: HabitItem['category']) => void;
  sealDailyLedger: (
    date?: string,
    xpAwarded?: number,
    items?: Array<{ amount: number; reason: string; suite: 'circadian' | 'iron' | 'focus' }>,
    isPartial?: boolean
  ) => { success: boolean; xpAwarded: number };
  amendDebriefMeals: (
    date: string,
    meals: {
      lunch?: { name: string; protein: number; calories: number; hitTarget: boolean };
      dinner?: { name: string; protein: number; calories: number; hitTarget: boolean };
    }
  ) => { success: boolean; xpAwarded: number };
  activateReentryProtocol: (date?: string) => { success: boolean; message: string };
  unlockTrophy: (trophyId: string) => boolean;
  incrementTrophyCount: (trophyId: string) => void;
  dismissPendingTrophy: () => void;
  evaluateTrophies: (date?: string) => void;
  getProteinRebalance: (date?: string) => ProteinRebalanceResult;
}

export type TrophyMastery = 'standard' | 'silver' | 'gold';

export function getTrophyMastery(count: number): {
  tier: TrophyMastery;
  multiplier: number;
  label: string;
  nextThreshold: number | null;
  progressToNext: number;
} {
  const safeCount = Math.max(1, count || 1);
  if (safeCount >= 20) {
    return {
      tier: 'gold',
      multiplier: 20,
      label: 'Gold Mastery (20x)',
      nextThreshold: null,
      progressToNext: 100,
    };
  }
  if (safeCount >= 5) {
    return {
      tier: 'silver',
      multiplier: 5,
      label: 'Silver Mastery (5x)',
      nextThreshold: 20,
      progressToNext: Math.round(((safeCount - 5) / 15) * 100),
    };
  }
  return {
    tier: 'standard',
    multiplier: 1,
    label: 'Standard Tier (1x)',
    nextThreshold: 5,
    progressToNext: Math.round((safeCount / 5) * 100),
  };
}

const getTodayString = () => formatLocalDate();

const createEmptyDailyLog = (): DailyLogData => ({
  habitsCompleted: {},
  totalProteinLogged: 0,
  totalCaloriesLogged: 0,
  hydrationLiters: 0,
  sleepHours: 7.5,
  energyLevel: 7,
  moodScore: 8,
  notes: '',
  loggedRecipeIds: [],
  loggedMeals: [],
  isDownscaled: false,
  quickPlateType: null,
  retentionCohortDay: 0,
});


interface UserLocalProgressData {
  totalXp: number;
  streakCount: number;
  streakFreezeStock: number;
  claimedMilestones: number[];
  claimedProtocolIds?: string[];
  completedQuestIdsByDate: Record<string, string[]>;
  xpHistory: XpHistoryItem[];
  logsByDate?: Record<string, DailyLogData>;
  customRecipes?: Recipe[];
  userProfile?: UserProfile | null;
  habits?: HabitItem[];
  claimedDossiersByWeek?: Record<string, boolean>;
  weightHistory?: WeightEntry[];
  socialQuests?: SocialQuestsState;
  isForgedStreak?: boolean;
  isLedgerSealedByDate?: Record<string, boolean>;
  unlockedTrophies?: string[];
  trophyCounts?: Record<string, number>;
  suiteXp?: { circadian: number; iron: number; focus: number };
}

const DEFAULT_SOCIAL_QUESTS: SocialQuestsState = {
  linkedin: { status: 'unclaimed' },
  instagram: { status: 'unclaimed' },
};

const saveUserLocalProgress = (userId: string, data: Partial<UserLocalProgressData>) => {
  if (typeof window === 'undefined' || !userId || userId.startsWith('guest_')) return;
  try {
    const raw = localStorage.getItem(`cyath_user_progression_${userId}`);
    const existing: Partial<UserLocalProgressData> = raw ? JSON.parse(raw) : {};
    const safeTotalXp = typeof data.totalXp === 'number' && Number.isFinite(data.totalXp)
      ? Math.max(0, data.totalXp)
      : Math.max(0, existing.totalXp ?? 0);
    const safeStreakCount = typeof data.streakCount === 'number' && Number.isFinite(data.streakCount)
      ? Math.max(0, data.streakCount)
      : Math.max(0, existing.streakCount ?? 0);
    const safeStreakFreeze = typeof data.streakFreezeStock === 'number' && Number.isFinite(data.streakFreezeStock)
      ? Math.max(0, data.streakFreezeStock)
      : Math.max(0, existing.streakFreezeStock ?? 1);

    const merged: UserLocalProgressData = {
      totalXp: safeTotalXp,
      streakCount: safeStreakCount,
      streakFreezeStock: safeStreakFreeze,
      claimedMilestones: Array.isArray(data.claimedMilestones) ? data.claimedMilestones : (existing.claimedMilestones ?? []),
      claimedProtocolIds: Array.isArray(data.claimedProtocolIds) ? data.claimedProtocolIds : (existing.claimedProtocolIds ?? []),
      completedQuestIdsByDate: data.completedQuestIdsByDate && typeof data.completedQuestIdsByDate === 'object' ? data.completedQuestIdsByDate : (existing.completedQuestIdsByDate ?? {}),
      xpHistory: Array.isArray(data.xpHistory) ? data.xpHistory : (existing.xpHistory ?? []),
      logsByDate: data.logsByDate && typeof data.logsByDate === 'object' ? data.logsByDate : (existing.logsByDate ?? {}),
      customRecipes: Array.isArray(data.customRecipes) ? data.customRecipes : (existing.customRecipes ?? []),
      userProfile: data.userProfile !== undefined ? data.userProfile : (existing.userProfile ?? null),
      habits: Array.isArray(data.habits) && data.habits.length > 0 ? data.habits : (existing.habits ?? DEFAULT_HABITS),
      claimedDossiersByWeek: data.claimedDossiersByWeek && typeof data.claimedDossiersByWeek === 'object' ? data.claimedDossiersByWeek : (existing.claimedDossiersByWeek ?? {}),
      weightHistory: Array.isArray(data.weightHistory) ? data.weightHistory : (existing.weightHistory ?? []),
      socialQuests: data.socialQuests && typeof data.socialQuests === 'object' ? data.socialQuests : (existing.socialQuests ?? DEFAULT_SOCIAL_QUESTS),
      isForgedStreak: typeof data.isForgedStreak === 'boolean' ? data.isForgedStreak : (existing.isForgedStreak ?? false),
      isLedgerSealedByDate: data.isLedgerSealedByDate && typeof data.isLedgerSealedByDate === 'object' ? data.isLedgerSealedByDate : (existing.isLedgerSealedByDate ?? {}),
      unlockedTrophies: Array.isArray(data.unlockedTrophies) ? data.unlockedTrophies : (existing.unlockedTrophies ?? []),
      trophyCounts: data.trophyCounts && typeof data.trophyCounts === 'object' ? data.trophyCounts : (existing.trophyCounts ?? {}),
      suiteXp: data.suiteXp || existing.suiteXp || { circadian: 0, iron: 0, focus: 0 },
    };
    localStorage.setItem(`cyath_user_progression_${userId}`, JSON.stringify(merged));
  } catch {}
};

const getUserLocalProgress = (userId: string): UserLocalProgressData | null => {
  if (typeof window === 'undefined' || !userId || userId.startsWith('guest_')) return null;
  try {
    const raw = localStorage.getItem(`cyath_user_progression_${userId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      totalXp: typeof parsed.totalXp === 'number' && Number.isFinite(parsed.totalXp) ? Math.max(0, parsed.totalXp) : 0,
      streakCount: typeof parsed.streakCount === 'number' && Number.isFinite(parsed.streakCount) ? Math.max(0, parsed.streakCount) : 0,
      streakFreezeStock: typeof parsed.streakFreezeStock === 'number' && Number.isFinite(parsed.streakFreezeStock) ? Math.max(0, parsed.streakFreezeStock) : 1,
      claimedMilestones: Array.isArray(parsed.claimedMilestones) ? parsed.claimedMilestones : [],
      claimedProtocolIds: Array.isArray(parsed.claimedProtocolIds) ? parsed.claimedProtocolIds : [],
      completedQuestIdsByDate: parsed.completedQuestIdsByDate && typeof parsed.completedQuestIdsByDate === 'object' ? parsed.completedQuestIdsByDate : {},
      xpHistory: Array.isArray(parsed.xpHistory) ? parsed.xpHistory : [],
      logsByDate: parsed.logsByDate && typeof parsed.logsByDate === 'object' ? parsed.logsByDate : {},
      customRecipes: Array.isArray(parsed.customRecipes) ? parsed.customRecipes : [],
      userProfile: parsed.userProfile !== undefined ? parsed.userProfile : null,
      habits: Array.isArray(parsed.habits) && parsed.habits.length > 0 ? parsed.habits : DEFAULT_HABITS,
      claimedDossiersByWeek: parsed.claimedDossiersByWeek && typeof parsed.claimedDossiersByWeek === 'object' ? parsed.claimedDossiersByWeek : {},
      weightHistory: Array.isArray(parsed.weightHistory) ? parsed.weightHistory : [],
      socialQuests: parsed.socialQuests && typeof parsed.socialQuests === 'object' ? parsed.socialQuests : DEFAULT_SOCIAL_QUESTS,
      isForgedStreak: typeof parsed.isForgedStreak === 'boolean' ? parsed.isForgedStreak : false,
      isLedgerSealedByDate: parsed.isLedgerSealedByDate && typeof parsed.isLedgerSealedByDate === 'object' ? parsed.isLedgerSealedByDate : {},
      unlockedTrophies: Array.isArray(parsed.unlockedTrophies) ? parsed.unlockedTrophies : [],
      trophyCounts: parsed.trophyCounts && typeof parsed.trophyCounts === 'object' ? parsed.trophyCounts : {},
      suiteXp: parsed.suiteXp || { circadian: 0, iron: 0, focus: 0 },
    };
  } catch {
    return null;
  }
};

export const useHabitStore = create<HabitStoreState>()(
  persist(
    (set, get) => ({
      currentDate: getTodayString(),
      habits: DEFAULT_HABITS,
      logsByDate: {
        [getTodayString()]: createEmptyDailyLog(),
      },
      totalXp: 0,
      suiteXp: {
        circadian: 0,
        iron: 0,
        focus: 0,
      },
      streakCount: 0,
      streakFreezeStock: 0,
      claimedMilestones: [],
      completedQuestIdsByDate: {},
      xpHistory: [],
      isSyncing: false,
      activeProtocolIds: ['morning-activation', 'deep-rem-sleep'],
      customRecipes: [],
      userSession: null,
      userProfile: null,
      pendingAction: null,
      dailyProtocolsAcceptedByDate: {},
      dailyProtocolsCompletedByDate: {},
      deskRitualsByDate: {},
      claimedDossiersByWeek: {},
      weightHistory: [],
      socialQuests: DEFAULT_SOCIAL_QUESTS,
      isForgedStreak: false,
      isReentryAvailable: false,
      isLedgerSealedByDate: {},
      isLedgerPartiallySealedByDate: {},
      dailyDebriefLog: {},
      claimedProtocolIds: [],
      sleepGoalAwardedByDate: {},
      unlockedTrophies: [],
      trophyCounts: {},
      pendingTrophyUnlock: null,

      setDate: (date) => set({ currentDate: date }),

      setUserSession: (session) => {
        const prevSession = get().userSession;
        if (prevSession && !prevSession.id.startsWith('guest_')) {
          saveUserLocalProgress(prevSession.id, {
            totalXp: get().totalXp,
            streakCount: get().streakCount,
            streakFreezeStock: get().streakFreezeStock,
            claimedMilestones: get().claimedMilestones,
            completedQuestIdsByDate: get().completedQuestIdsByDate,
            xpHistory: get().xpHistory,
            logsByDate: get().logsByDate,
            customRecipes: get().customRecipes,
            userProfile: get().userProfile,
            habits: get().habits,
            weightHistory: get().weightHistory,
            socialQuests: get().socialQuests,
            isLedgerSealedByDate: get().isLedgerSealedByDate,
          });
        }

        // If session is unchanged, preserve existing in-memory state and avoid wiping with cached data
        if (prevSession && session && prevSession.id === session.id) {
          set({ userSession: session });
          return;
        }

        set({ userSession: session });

        if (session && !session.id.startsWith('guest_')) {
          const cached = getUserLocalProgress(session.id);
          if (cached) {
            set({
              totalXp: cached.totalXp ?? 0,
              streakCount: cached.streakCount ?? 0,
              streakFreezeStock: cached.streakFreezeStock ?? 1,
              claimedMilestones: cached.claimedMilestones ?? [],
              completedQuestIdsByDate: cached.completedQuestIdsByDate ?? {},
              xpHistory: cached.xpHistory ?? [],
              customRecipes: cached.customRecipes ?? [],
              habits: cached.habits && cached.habits.length > 0 ? cached.habits : DEFAULT_HABITS,
              logsByDate: cached.logsByDate ?? { [getTodayString()]: createEmptyDailyLog() },
              isLedgerSealedByDate: cached.isLedgerSealedByDate ?? {},
              userProfile: cached.userProfile ?? null,
              weightHistory: cached.weightHistory ?? [],
              socialQuests: cached.socialQuests ?? DEFAULT_SOCIAL_QUESTS,
            });
          } else {
            // Check if upgrading from an in-memory guest session
            const isUpgradingFromGuest = prevSession && prevSession.id.startsWith('guest_');
            if (isUpgradingFromGuest && (get().totalXp > 0 || Object.keys(get().logsByDate).length > 0)) {
              const bonusXp = 50;
              const migratedXp = (get().totalXp || 0) + bonusXp;
              const migratedHistory: XpHistoryItem[] = [
                {
                  id: `upgrade_${Date.now()}`,
                  amount: bonusXp,
                  reason: 'Pioneer Account Linked (+50 XP)',
                  timestamp: new Date().toISOString(),
                },
                ...(get().xpHistory || []),
              ];
              const upgradedProgress = {
                totalXp: migratedXp,
                streakCount: get().streakCount ?? 0,
                streakFreezeStock: get().streakFreezeStock ?? 1,
                claimedMilestones: get().claimedMilestones ?? [],
                completedQuestIdsByDate: get().completedQuestIdsByDate ?? {},
                xpHistory: migratedHistory,
                customRecipes: get().customRecipes ?? [],
                habits: get().habits && get().habits.length > 0 ? get().habits : DEFAULT_HABITS,
                logsByDate: get().logsByDate ?? { [getTodayString()]: createEmptyDailyLog() },
                isLedgerSealedByDate: get().isLedgerSealedByDate ?? {},
                userProfile: get().userProfile ?? null,
                weightHistory: get().weightHistory ?? [],
                socialQuests: get().socialQuests ?? DEFAULT_SOCIAL_QUESTS,
              };
              saveUserLocalProgress(session.id, upgradedProgress);
              set(upgradedProgress);
            } else {
              // Completely fresh session for this user ID on this browser
              set({
                totalXp: 0,
                streakCount: 0,
                streakFreezeStock: 1,
                claimedMilestones: [],
                completedQuestIdsByDate: {},
                xpHistory: [],
                customRecipes: [],
                habits: DEFAULT_HABITS,
                logsByDate: { [getTodayString()]: createEmptyDailyLog() },
                isLedgerSealedByDate: {},
                userProfile: null,
                weightHistory: [],
                socialQuests: DEFAULT_SOCIAL_QUESTS,
              });
            }
          }
          get().reconcileUserSession(session);
        } else if (!session) {
          set({
            totalXp: 0,
            streakCount: 0,
            streakFreezeStock: 0,
            claimedMilestones: [],
            completedQuestIdsByDate: {},
            xpHistory: [],
            userProfile: null,
            customRecipes: [],
            habits: DEFAULT_HABITS,
            isLedgerSealedByDate: {},
            logsByDate: { [getTodayString()]: createEmptyDailyLog() },
          });
        }
      },

      reconcileUserSession: async (session) => {
        if (!session || session.id.startsWith('guest_')) return;
        try {
          const cached = getUserLocalProgress(session.id);
          const currentLocalXp = cached ? (cached.totalXp ?? 0) : 0;
          const currentLocalStreak = cached ? (cached.streakCount ?? 0) : 0;
          const currentLocalFreeze = cached ? (cached.streakFreezeStock ?? 1) : 1;
          const currentLocalProfile = cached ? (cached.userProfile ?? null) : null;
          const currentLocalRecipes = cached ? (cached.customRecipes ?? []) : [];
          const currentLocalHabits = cached?.habits && cached.habits.length > 0 ? cached.habits : DEFAULT_HABITS;

          // 1. Fetch remote user profile
          const { data: profile, error: profileErr } = await supabase
            .from('user_profiles')
            .select('total_xp, streak_count, streak_freeze_stock, full_name, age, sex, height_cm, weight_kg, primary_goal, allergies, dietary_restrictions, onboarding_completed, walkthrough_completed')
            .eq('user_id', session.id)
            .maybeSingle();

          // 2. Fetch remote custom recipes
          const { data: remoteRecipes, error: recipeErr } = await supabase
            .from('custom_recipes')
            .select('*')
            .eq('user_id', session.id);

          // 3. Fetch remote daily logs
          const { data: remoteLogs } = await supabase
            .from('daily_logs')
            .select('*')
            .eq('user_id', session.id);

          // If the user changed or logged out while remote fetch was in flight, abort applying to store
          if (get().userSession?.id !== session.id) {
            return;
          }

          // Merge custom recipes safely
          let finalRecipes = [...currentLocalRecipes];
          if (remoteRecipes && remoteRecipes.length > 0) {
            const remoteMapped: Recipe[] = remoteRecipes.map((r) => ({
              id: r.id,
              name: r.name,
              subtitle: r.subtitle || '',
              image: r.image,
              rawImage: r.raw_image || undefined,
              calories: r.calories,
              protein: Number(r.protein),
              carbs: Number(r.carbs),
              fats: Number(r.fats),
              prepTimeMinutes: r.prep_time_minutes,
              category: r.category,
              dietType: r.diet_type,
              tags: r.tags || [],
              focusScore: r.focus_score || '9.0/10',
              description: r.description || '',
              ingredients: r.ingredients || [],
              instructions: r.instructions || [],
              isCustom: true,
              reasoningSteps: r.reasoning_steps || [],
            }));

            const recipeMap = new Map<string, Recipe>();
            remoteMapped.forEach((r) => recipeMap.set(r.id, r));
            currentLocalRecipes.forEach((r) => recipeMap.set(r.id, r));
            finalRecipes = Array.from(recipeMap.values());
          }

          // If local has custom recipes not yet in remote, upload them
          if (currentLocalRecipes.length > 0 && !recipeErr) {
            for (const r of currentLocalRecipes) {
              try {
                await supabase.from('custom_recipes').upsert({
                  id: r.id,
                  user_id: session.id,
                  name: r.name,
                  subtitle: r.subtitle || '',
                  image: r.image,
                  raw_image: r.rawImage || null,
                  calories: r.calories,
                  protein: r.protein,
                  carbs: r.carbs,
                  fats: r.fats,
                  prep_time_minutes: r.prepTimeMinutes,
                  category: r.category,
                  diet_type: r.dietType,
                  tags: r.tags || [],
                  focus_score: r.focusScore || '9.0/10',
                  description: r.description || '',
                  ingredients: r.ingredients || [],
                  instructions: r.instructions || [],
                  reasoning_steps: r.reasoningSteps || [],
                  updated_at: new Date().toISOString(),
                }, { onConflict: 'id' });
              } catch {}
            }
          }

          // Merge daily logs if remote logs exist, preserving in-memory logged meals and local recipe entries
          const mergedLogs = { ...get().logsByDate };
          const remoteSeals = { ...get().isLedgerSealedByDate };
          const mergedDeskRituals = { ...get().deskRitualsByDate };
          if (remoteLogs && remoteLogs.length > 0) {
            remoteLogs.forEach((l) => {
              if (l.habits_completed && (l.habits_completed.__ledger_sealed || l.habits_completed._sealed)) {
                remoteSeals[l.log_date] = true;
              }
              const currentLocalLog = mergedLogs[l.log_date] || get().logsByDate[l.log_date];
              const remoteRecipeIds = l.logged_recipes || [];
              const localRecipeIds = currentLocalLog?.loggedRecipeIds || [];
              const mergedRecipeIds = Array.from(new Set([...remoteRecipeIds, ...localRecipeIds]));

              // Cross-Device Sync: merge remote logged meals with local meals by id
              const remoteMeals: LoggedMealEntry[] = (l.habits_completed?.__logged_meals as LoggedMealEntry[]) || [];
              const localMeals: LoggedMealEntry[] = currentLocalLog?.loggedMeals || [];
              const mealMap = new Map<string, LoggedMealEntry>();
              remoteMeals.forEach((m) => { if (m && m.id) mealMap.set(m.id, m); });
              localMeals.forEach((m) => { if (m && m.id) mealMap.set(m.id, m); });
              const mergedLoggedMeals = Array.from(mealMap.values());

              // Cross-Device Sync: merge debrief telemetry
              if (l.habits_completed?.__debrief_data) {
                mergedDeskRituals[l.log_date] = {
                  ...(mergedDeskRituals[l.log_date] || {}),
                  ...l.habits_completed.__debrief_data,
                };
              }

              mergedLogs[l.log_date] = {
                habitsCompleted: { ...(currentLocalLog?.habitsCompleted || {}), ...(l.habits_completed || {}) },
                totalProteinLogged: Math.max(Number(l.total_protein || 0), currentLocalLog?.totalProteinLogged || 0),
                totalCaloriesLogged: Math.max(Number(l.total_calories || 0), currentLocalLog?.totalCaloriesLogged || 0),
                hydrationLiters: Math.max(Number(l.hydration_liters || 0), currentLocalLog?.hydrationLiters || 0),
                sleepHours: Number(l.sleep_hours || currentLocalLog?.sleepHours || 7.5),
                energyLevel: l.energy_level || currentLocalLog?.energyLevel || 7,
                moodScore: l.mood_score || currentLocalLog?.moodScore || 7,
                notes: l.notes || currentLocalLog?.notes || '',
                loggedRecipeIds: mergedRecipeIds,
                loggedMeals: mergedLoggedMeals,
              };
            });
          }

          if (profile) {
            const remoteXp = profile.total_xp ?? 0;
            const finalXp = Math.max(remoteXp, currentLocalXp);
            const finalStreak = Math.max(profile.streak_count ?? 0, currentLocalStreak);
            const finalFreeze = Math.min(STREAK_FREEZE.maxStock, Math.max(profile.streak_freeze_stock ?? 0, currentLocalFreeze));
            const isOnboardingDone = profile.onboarding_completed || currentLocalProfile?.onboardingCompleted || false;

            const finalReferralCode = (profile as any)?.referral_code || currentLocalProfile?.referralCode || generateReferralCode(profile.full_name || currentLocalProfile?.fullName || session.email);

            const finalProfile: UserProfile = {
              fullName: profile.full_name || currentLocalProfile?.fullName || '',
              age: profile.age || currentLocalProfile?.age || 25,
              sex: profile.sex || currentLocalProfile?.sex || 'other',
              heightCm: profile.height_cm || currentLocalProfile?.heightCm || 175,
              weightKg: profile.weight_kg || currentLocalProfile?.weightKg || 70,
              primaryGoal: profile.primary_goal || currentLocalProfile?.primaryGoal || 'focus',
              allergies: profile.allergies?.length ? profile.allergies : (currentLocalProfile?.allergies || []),
              dietaryRestrictions: profile.dietary_restrictions?.length ? profile.dietary_restrictions : (currentLocalProfile?.dietaryRestrictions || []),
              onboardingCompleted: isOnboardingDone,
              walkthroughCompleted: !!((profile as any)?.walkthrough_completed || currentLocalProfile?.walkthroughCompleted),
              referralCode: finalReferralCode,
              referredBy: extractReferralCode((profile as any)?.referred_by || currentLocalProfile?.referredBy) || ((profile as any)?.referred_by || currentLocalProfile?.referredBy),
              claimedReferral: !!((profile as any)?.referred_by || currentLocalProfile?.claimedReferral),
            };

            set({
              totalXp: finalXp,
              streakCount: finalStreak,
              streakFreezeStock: finalFreeze,
              customRecipes: finalRecipes,
              logsByDate: mergedLogs,
              deskRitualsByDate: mergedDeskRituals,
              isLedgerSealedByDate: remoteSeals,
              userProfile: finalProfile,
              habits: currentLocalHabits,
            });

            saveUserLocalProgress(session.id, {
              totalXp: finalXp,
              streakCount: finalStreak,
              streakFreezeStock: finalFreeze,
              claimedMilestones: get().claimedMilestones,
              claimedProtocolIds: get().claimedProtocolIds,
              completedQuestIdsByDate: get().completedQuestIdsByDate,
              xpHistory: get().xpHistory,
              logsByDate: mergedLogs,
              customRecipes: finalRecipes,
              userProfile: finalProfile,
              habits: currentLocalHabits,
              isLedgerSealedByDate: remoteSeals,
            });

            if (finalXp > remoteXp || finalStreak > (profile.streak_count ?? 0) || (isOnboardingDone && !profile.onboarding_completed)) {
              try {
                await supabase
                  .from('user_profiles')
                  .upsert({
                    user_id: session.id,
                    total_xp: finalXp,
                    streak_count: finalStreak,
                    streak_freeze_stock: finalFreeze,
                    onboarding_completed: isOnboardingDone,
                    walkthrough_completed: finalProfile.walkthroughCompleted,
                    full_name: finalProfile.fullName,
                    age: finalProfile.age,
                    sex: finalProfile.sex,
                    height_cm: finalProfile.heightCm,
                    weight_kg: finalProfile.weightKg,
                    primary_goal: finalProfile.primaryGoal,
                    allergies: finalProfile.allergies,
                    dietary_restrictions: finalProfile.dietaryRestrictions,
                    updated_at: new Date().toISOString(),
                  }, { onConflict: 'user_id' });
              } catch {}
            }
          } else if (cached && (currentLocalXp > 0 || currentLocalProfile?.onboardingCompleted || (cached.logsByDate && Object.keys(cached.logsByDate).length > 0))) {
            // User had cached local progress on this machine: upload/persist it
            try {
              await supabase
                .from('user_profiles')
                .upsert({
                  user_id: session.id,
                  total_xp: currentLocalXp,
                  streak_count: currentLocalStreak,
                  streak_freeze_stock: currentLocalFreeze,
                  onboarding_completed: currentLocalProfile?.onboardingCompleted ?? false,
                  full_name: currentLocalProfile?.fullName ?? '',
                  age: currentLocalProfile?.age ?? 25,
                  sex: currentLocalProfile?.sex ?? 'other',
                  height_cm: currentLocalProfile?.heightCm ?? 175,
                  weight_kg: currentLocalProfile?.weightKg ?? 70,
                  primary_goal: currentLocalProfile?.primaryGoal ?? 'focus',
                  allergies: currentLocalProfile?.allergies ?? [],
                  dietary_restrictions: currentLocalProfile?.dietaryRestrictions ?? [],
                  updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' });
            } catch {}

            set({
              totalXp: currentLocalXp,
              streakCount: currentLocalStreak,
              streakFreezeStock: currentLocalFreeze,
              customRecipes: finalRecipes,
              logsByDate: mergedLogs,
              userProfile: currentLocalProfile,
              habits: currentLocalHabits,
            });
            saveUserLocalProgress(session.id, {
              totalXp: currentLocalXp,
              streakCount: currentLocalStreak,
              streakFreezeStock: currentLocalFreeze,
              customRecipes: finalRecipes,
              logsByDate: mergedLogs,
              userProfile: currentLocalProfile,
              habits: currentLocalHabits,
            });
          } else {
            // Brand new account or session with active in-memory progress: preserve mergedLogs and local progress
            const finalXp = Math.max(currentLocalXp, get().totalXp);
            const finalProfile = currentLocalProfile || get().userProfile;
            const finalStreak = Math.max(currentLocalStreak, get().streakCount);

            set({
              totalXp: finalXp,
              streakCount: finalStreak,
              streakFreezeStock: get().streakFreezeStock || 1,
              claimedMilestones: get().claimedMilestones || [],
              completedQuestIdsByDate: get().completedQuestIdsByDate || {},
              xpHistory: get().xpHistory || [],
              customRecipes: finalRecipes,
              habits: currentLocalHabits,
              logsByDate: mergedLogs,
              userProfile: finalProfile,
            });
            saveUserLocalProgress(session.id, {
              totalXp: finalXp,
              streakCount: finalStreak,
              streakFreezeStock: get().streakFreezeStock || 1,
              customRecipes: finalRecipes,
              logsByDate: mergedLogs,
              userProfile: finalProfile,
              habits: currentLocalHabits,
            });
          }
        } catch (err) {
          console.warn('Reconcile session error:', err);
        }
      },

      updateUserProfile: (profile) => {
        const current = get().userProfile || {
          fullName: '',
          age: 25,
          sex: 'other',
          heightCm: 175,
          weightKg: 70,
          primaryGoal: 'focus',
          allergies: [],
          dietaryRestrictions: [],
          onboardingCompleted: false,
        };

        const finalReferralCode = profile.referralCode || current.referralCode || generateReferralCode(profile.fullName || current.fullName || get().userSession?.email);
        const updated: UserProfile = {
          ...current,
          ...profile,
          referralCode: finalReferralCode,
        };
        set({ userProfile: updated });

        const userId = get().userSession?.id;
        if (userId && !userId.startsWith('guest_')) {
          saveUserLocalProgress(userId, { userProfile: updated });
          (async () => {
            try {
              await supabase.from('user_profiles').upsert({
                user_id: userId,
                full_name: updated.fullName,
                age: updated.age,
                sex: updated.sex,
                height_cm: updated.heightCm,
                weight_kg: updated.weightKg,
                primary_goal: updated.primaryGoal,
                allergies: updated.allergies,
                dietary_restrictions: updated.dietaryRestrictions,
                onboarding_completed: updated.onboardingCompleted,
                walkthrough_completed: updated.walkthroughCompleted ?? false,
                referral_code: updated.referralCode,
                referred_by: updated.referredBy || null,
                total_xp: get().totalXp,
                streak_count: get().streakCount,
                streak_freeze_stock: get().streakFreezeStock,
                updated_at: new Date().toISOString(),
              }, { onConflict: 'user_id' });
            } catch {
              // Local fallback
            }
          })();
        }
      },

      setPendingAction: (action) => set({ pendingAction: action }),
      clearPendingAction: () => set({ pendingAction: null }),

      executePendingAction: () => {
        const action = get().pendingAction;
        if (!action) return { success: false, executedAction: null };

        if (action.type === 'LOG_RECIPE') {
          const { recipeId, protein, calories, date } = action.payload;
          get().logRecipeToDay(recipeId, protein, calories, date);
        } else if (action.type === 'TOGGLE_HABIT') {
          const { habitId, date } = action.payload;
          get().toggleHabit(habitId, date);
        } else if (action.type === 'ACTIVATE_PROTOCOL') {
          const { protocolId, habitsToAdd } = action.payload;
          get().activateProtocol(protocolId, habitsToAdd);
        }

        set({ pendingAction: null });
        return { success: true, executedAction: action };
      },

      activateProtocol: (protocolId, habitsToAdd) => {
        const currentActive = get().activeProtocolIds;
        const isAlreadyActive = currentActive.includes(protocolId);
        
        const newActive = isAlreadyActive
          ? currentActive.filter((id) => id !== protocolId)
          : [...currentActive, protocolId];

        let updatedHabits = [...get().habits];
        if (!isAlreadyActive && habitsToAdd && habitsToAdd.length > 0) {
          habitsToAdd.forEach((h) => {
            if (!updatedHabits.some((existing) => existing.id === h.id || existing.title.toLowerCase() === h.title.toLowerCase())) {
              updatedHabits.push(h);
            }
          });
        }

        set({
          activeProtocolIds: newActive,
          habits: updatedHabits,
        });

        // Award protocol anchor bonus strictly once per protocol ID across account lifetime
        const currentClaimed = get().claimedProtocolIds || [];
        if (!isAlreadyActive && !currentClaimed.includes(protocolId)) {
          const updatedClaimed = [...currentClaimed, protocolId];
          set({ claimedProtocolIds: updatedClaimed });
          get().gainXp(50, `Focus Protocol Anchored: ${protocolId}`, 'protocol');
        }

        const session = get().userSession;
        if (session && !session.id.startsWith('guest_')) {
          saveUserLocalProgress(session.id, {
            habits: updatedHabits,
            claimedProtocolIds: get().claimedProtocolIds,
          });
        }
      },

      getDailyLog: (date) => {
        const targetDate = date || get().currentDate;
        const rawLog = get().logsByDate[targetDate];
        if (!rawLog) return createEmptyDailyLog();
        return {
          habitsCompleted: rawLog.habitsCompleted && typeof rawLog.habitsCompleted === 'object' ? rawLog.habitsCompleted : {},
          totalProteinLogged: typeof rawLog.totalProteinLogged === 'number' && Number.isFinite(rawLog.totalProteinLogged) ? Math.max(0, rawLog.totalProteinLogged) : 0,
          totalCaloriesLogged: typeof rawLog.totalCaloriesLogged === 'number' && Number.isFinite(rawLog.totalCaloriesLogged) ? Math.max(0, rawLog.totalCaloriesLogged) : 0,
          hydrationLiters: typeof rawLog.hydrationLiters === 'number' && Number.isFinite(rawLog.hydrationLiters) ? Math.max(0, rawLog.hydrationLiters) : 0,
          sleepHours: typeof rawLog.sleepHours === 'number' && Number.isFinite(rawLog.sleepHours) ? Math.max(0, rawLog.sleepHours) : 7.5,
          energyLevel: typeof rawLog.energyLevel === 'number' && Number.isFinite(rawLog.energyLevel) ? rawLog.energyLevel : 7,
          moodScore: typeof rawLog.moodScore === 'number' && Number.isFinite(rawLog.moodScore) ? rawLog.moodScore : 8,
          notes: typeof rawLog.notes === 'string' ? rawLog.notes : '',
          loggedRecipeIds: Array.isArray(rawLog.loggedRecipeIds) ? rawLog.loggedRecipeIds : [],
          loggedMeals: Array.isArray(rawLog.loggedMeals) ? rawLog.loggedMeals : [],
          isDownscaled: !!rawLog.isDownscaled,
          quickPlateType: rawLog.quickPlateType || null,
          retentionCohortDay: typeof rawLog.retentionCohortDay === 'number' ? rawLog.retentionCohortDay : 0,
        };
      },


      gainXp: (amount, reason, source = 'app', suiteId) => {
        const safeAmount = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0;
        const currentXp = typeof get().totalXp === 'number' && Number.isFinite(get().totalXp) ? get().totalXp : 0;
        const newXp = Math.max(0, currentXp + safeAmount);
        const oldLevelInfo = calculateLevel(currentXp);
        const newLevelInfo = calculateLevel(newXp);
        const leveledUp = newLevelInfo.level > oldLevelInfo.level;

        let targetSuite: 'circadian' | 'iron' | 'focus';
        if (suiteId) {
          targetSuite = suiteId;
        } else if (
          ['sleep', 'sunlight', 'circadian', 'evening', 'morning', 'ritual', 'rested', 'wake', 'sunset', 'winddown'].includes(source) ||
          /sleep|sun|circadian|dawn|wake|bed|rested|sunset|pillow|nap|slumber/i.test(reason)
        ) {
          targetSuite = 'circadian';
        } else if (
          ['nutrition', 'protein', 'recipe', 'fuel', 'weight_log', 'movement'].includes(source) ||
          /protein|recipe|meal|dish|fuel|dinner|lunch|breakfast|food|whey|lift|workout|resistance/i.test(reason)
        ) {
          targetSuite = 'iron';
        } else if (
          ['hydration', 'energy', 'mood', 'caffeine', 'focus', 'desk_ritual', 'flow'].includes(source) ||
          /hydration|water|caffeine|energy|mood|focus|ctrl|tab|inbox|flow|slump/i.test(reason)
        ) {
          targetSuite = 'focus';
        } else {
          targetSuite = (get().userProfile?.selectedIslandSuite || get().userProfile?.archetype || 'circadian') as 'circadian' | 'iron' | 'focus';
        }

        const prevSuiteXp = get().suiteXp || { circadian: 0, iron: 0, focus: 0 };
        const updatedSuiteXp = {
          ...prevSuiteXp,
          [targetSuite]: Math.max(0, (prevSuiteXp[targetSuite] ?? 0) + safeAmount),
        };

        const newHistoryItem: XpHistoryItem = {
          id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          amount: safeAmount,
          reason,
          timestamp: new Date().toISOString(),
        };

        const updatedHistory = [newHistoryItem, ...get().xpHistory].slice(0, 25);

        set({
          totalXp: newXp,
          suiteXp: updatedSuiteXp,
          xpHistory: updatedHistory,
        });

        progressionEvents.emit('xp:gained', {
          amount,
          reason,
          totalXp: newXp,
          suite: targetSuite,
        });

        if (leveledUp) {
          retroAudio.playTierUpgrade();
          progressionEvents.emit('level:up', {
            oldLevel: oldLevelInfo.level,
            newLevel: newLevelInfo.level,
            title: newLevelInfo.title,
            unlockedTitle: newLevelInfo.title !== oldLevelInfo.title ? newLevelInfo.title : undefined,
          });

          const oldIsland = getIslandTier(oldLevelInfo.level, targetSuite);
          const newIsland = getIslandTier(newLevelInfo.level, targetSuite);
          progressionEvents.emit('island:evolve', {
            oldTier: oldIsland.tier,
            newTier: newIsland.tier,
            level: newLevelInfo.level,
            suite: targetSuite,
            oldIsland: { name: oldIsland.name, image: oldIsland.image, pngImage: oldIsland.pngImage },
            newIsland: { name: newIsland.name, image: newIsland.image, pngImage: newIsland.pngImage, description: (newIsland as any).description },
          });
        }

        const userId = get().userSession?.id;
        if (userId && !userId.startsWith('guest_')) {
          saveUserLocalProgress(userId, {
            totalXp: newXp,
            streakCount: get().streakCount,
            streakFreezeStock: get().streakFreezeStock,
            claimedMilestones: get().claimedMilestones,
            completedQuestIdsByDate: get().completedQuestIdsByDate,
            xpHistory: updatedHistory,
            logsByDate: get().logsByDate,
          });

          (async () => {
            try {
              await supabase.from('user_profiles').upsert({
                user_id: userId,
                total_xp: newXp,
                streak_count: get().streakCount,
                streak_freeze_stock: get().streakFreezeStock,
                updated_at: new Date().toISOString(),
              }, { onConflict: 'user_id' });

              await supabase.from('xp_events').insert({
                user_id: userId,
                amount,
                reason,
                source,
              });
            } catch {
              // Graceful local degradation
            }
          })();
        }

        return {
          oldLevel: oldLevelInfo.level,
          newLevel: newLevelInfo.level,
          leveledUp,
        };
      },

      claimQuest: (questId, date) => {
        const targetDate = date || get().currentDate;
        const currentClaimed = get().completedQuestIdsByDate[targetDate] || [];
        if (currentClaimed.includes(questId)) return;

        const log = get().getDailyLog(targetDate);
        const quests = getDailyQuests(targetDate, log, get().habits);
        const quest = quests.find((q) => q.id === questId);

        if (quest && quest.completed) {
          set((state) => ({
            completedQuestIdsByDate: {
              ...state.completedQuestIdsByDate,
              [targetDate]: [...currentClaimed, questId],
            },
          }));

          retroAudio.playTierUpgrade();
          get().gainXp(quest.xpAward, `Quest: ${quest.title}`, 'quest');
          progressionEvents.emit('quest:completed', {
            questId,
            title: quest.title,
            xpAwarded: quest.xpAward,
          });
        }
      },

      claimReferralCode: async (code: string) => {
        // 1. Strict format and link validation
        const validation = validateReferralCodeInput(code);
        if (!validation.valid || !validation.cleanCode) {
          return {
            success: false,
            message: validation.error || 'Please enter a valid referral code.',
            xpAwarded: 0,
          };
        }

        const cleanCode = validation.cleanCode;
        const currentProfile = get().userProfile;

        // 2. Already claimed check
        if (currentProfile?.claimedReferral) {
          return {
            success: false,
            message: 'You have already claimed a referral bonus on this account.',
            xpAwarded: 0,
          };
        }

        // 3. Self-referral check
        if (currentProfile?.referralCode === cleanCode) {
          return {
            success: false,
            message: 'You cannot claim your own referral code.',
            xpAwarded: 0,
          };
        }

        // 4. Verify code against server registry & database
        let verified = false;
        let serverMessage = `Guild Pact activated! +250 Starter XP awarded for joining via ${cleanCode}.`;

        try {
          if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
            const res = await fetch('/api/referrals/claim', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                referralCode: cleanCode,
                recruitUserId: get().userSession?.id,
                recruitEmail: get().userSession?.email,
              }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok || data.error) {
              return {
                success: false,
                message: data.error || `Referral code "${cleanCode}" was not found.`,
                xpAwarded: 0,
              };
            }

            if (data.success) {
              verified = true;
              if (data.message) serverMessage = data.message;
            }
          } else {
            // Environment without fetch (e.g. unit tests): verify against known seed codes or generated pattern
            if (KNOWN_SEED_CODES.has(cleanCode) || /^[A-Z0-9]{3,10}-[A-Z0-9]{3,10}$/.test(cleanCode)) {
              verified = true;
            }
          }
        } catch {
          // Fallback for offline / network timeout if code is a known seed code
          if (KNOWN_SEED_CODES.has(cleanCode)) {
            verified = true;
          } else {
            return {
              success: false,
              message: 'Unable to verify referral code. Please check your connection and try again.',
              xpAwarded: 0,
            };
          }
        }

        if (!verified) {
          return {
            success: false,
            message: `Referral code "${cleanCode}" does not exist.`,
            xpAwarded: 0,
          };
        }

        // 5. Award +50 XP to the new recruit + unlock exclusive Vanguard Lantern decoration
        get().gainXp(XP_MATRIX.GUILD_REFERRAL_REWARD, `Guild Recruit Bonus (${cleanCode})`, 'referral');
        retroAudio.playTierUpgrade();

        const currentDecorations = currentProfile?.unlockedDecorations || [];
        const updatedDecorations = Array.from(new Set([...currentDecorations, 'vanguard_lantern']));

        const updatedProfile: UserProfile = {
          ...(currentProfile || {
            fullName: '',
            age: 25,
            sex: 'other',
            heightCm: 175,
            weightKg: 70,
            primaryGoal: 'focus',
            allergies: [],
            dietaryRestrictions: [],
            onboardingCompleted: false,
          }),
          claimedReferral: true,
          referredBy: cleanCode,
          unlockedDecorations: updatedDecorations,
          referralCode:
            currentProfile?.referralCode ||
            generateReferralCode(currentProfile?.fullName || get().userSession?.email),
        };

        get().updateUserProfile(updatedProfile);

        return {
          success: true,
          message: serverMessage,
          xpAwarded: XP_MATRIX.GUILD_REFERRAL_REWARD,
        };
      },


      claimWeeklyDossier: (weekKey) => {
        const targetKey = weekKey || getLocalWeekKey(get().currentDate);
        const currentClaimed = get().claimedDossiersByWeek || {};
        if (currentClaimed[targetKey]) {
          return { success: false, xpAwarded: 0 };
        }

        const updatedClaimed = {
          ...currentClaimed,
          [targetKey]: true,
        };

        set({
          claimedDossiersByWeek: updatedClaimed,
        });

        get().gainXp(100, 'Weekly Energy Dossier Reviewed', 'dossier');

        const session = get().userSession;
        if (session && !session.id.startsWith('guest_')) {
          saveUserLocalProgress(session.id, {
            claimedDossiersByWeek: updatedClaimed,
          });
        }

        return { success: true, xpAwarded: 100 };
      },

      acceptDailyProtocol: (date) => {
        const targetDate = date || get().currentDate;
        if (get().dailyProtocolsAcceptedByDate[targetDate]) return;

        set((state) => ({
          dailyProtocolsAcceptedByDate: {
            ...state.dailyProtocolsAcceptedByDate,
            [targetDate]: true,
          },
        }));

        get().gainXp(15, 'Committed to Daily Protocol', 'protocol');
        retroAudio.playTierUpgrade();
      },

      completeDailyProtocol: (date) => {
        const targetDate = date || get().currentDate;
        if (get().dailyProtocolsCompletedByDate[targetDate]) return;

        set((state) => ({
          dailyProtocolsCompletedByDate: {
            ...state.dailyProtocolsCompletedByDate,
            [targetDate]: true,
          },
        }));

        get().gainXp(25, 'Mastered Daily Protocol', 'protocol');
        retroAudio.playTierUpgrade();
      },

      completeMorningBoot: (data, date) => {
        const targetDate = date || get().currentDate;
        const currentRituals = get().deskRitualsByDate[targetDate] || {};

        if (data.sleepHours > 0) {
          get().setSleep(data.sleepHours, targetDate);
        }

        if (data.sunlightDone) {
          const habits = get().habits;
          const sunHabit = habits.find((h) => h.id === 'sunlight' || h.title.toLowerCase().includes('sunlight'));
          if (sunHabit) {
            const dailyLog = get().getDailyLog(targetDate);
            if (!dailyLog.habitsCompleted[sunHabit.id]) {
              get().toggleHabit(sunHabit.id, targetDate);
            }
          }
        }

        set((state) => ({
          deskRitualsByDate: {
            ...state.deskRitualsByDate,
            [targetDate]: {
              ...currentRituals,
              morningBootCompleted: true,
              morningRestedRating: data.restedRating,
              targetFocusHours: data.targetFocusHours,
            },
          },
        }));

        if (!currentRituals.morningBootCompleted) {
          const award = data.sunlightDone
            ? XP_MATRIX.MORNING_BOOT_SUNLIGHT_COMBINED
            : XP_MATRIX.MORNING_BOOT_BASE;
          get().gainXp(award, data.sunlightDone ? 'Morning Boot & Sunlight Primed' : 'Morning Boot Primed', 'ritual');
          retroAudio.playTierUpgrade();
        }
      },


      completeEveningWrap: (data, date) => {
        const targetDate = date || get().currentDate;
        const currentRituals = get().deskRitualsByDate[targetDate] || {};

        const caffeineStatus = data.caffeineStatus || (data.caffeineCutoffRespected ? 'before_cutoff' : 'after_cutoff');
        const cutoffRespected = caffeineStatus === 'none' || caffeineStatus === 'before_cutoff';

        if (cutoffRespected) {
          const habits = get().habits;
          const sunsetHabit = habits.find((h) => h.id === 'digital_sunset' || h.title.toLowerCase().includes('sunset'));
          if (sunsetHabit) {
            const dailyLog = get().getDailyLog(targetDate);
            if (!dailyLog.habitsCompleted[sunsetHabit.id]) {
              get().toggleHabit(sunsetHabit.id, targetDate);
            }
          }
        }

        set((state) => ({
          deskRitualsByDate: {
            ...state.deskRitualsByDate,
            [targetDate]: {
              ...currentRituals,
              eveningWrapCompleted: true,
              afternoonSlumpScore: data.afternoonSlumpScore,
              caffeineCutoffRespected: cutoffRespected,
              caffeineStatus,
              wholeFoodRating: data.wholeFoodRating,
            },
          },
        }));

        if (!currentRituals.eveningWrapCompleted) {
          const xpAward = caffeineStatus === 'none' ? 20 : cutoffRespected ? 15 : 5;
          const label = caffeineStatus === 'none' ? 'Evening Wrap Sealed (Zero Caffeine Bonus)' : 'Evening Wrap Sealed';
          get().gainXp(xpAward, label, 'ritual');
          retroAudio.playTierUpgrade();
        }
      },

      commitDebriefTelemetry: (date, telemetry = {}) => {
        const targetDate = date || get().currentDate;
        const currentLog = get().logsByDate[targetDate] || createEmptyDailyLog();
        const currentRituals = get().deskRitualsByDate[targetDate] || {};

        const updatedHabits = { ...currentLog.habitsCompleted };
        if (telemetry.sunlightDone !== undefined) {
          updatedHabits.sunlight = telemetry.sunlightDone;
        }

        const safeProtein = typeof telemetry.proteinGrams === 'number'
          ? Math.max(currentLog.totalProteinLogged || 0, telemetry.proteinGrams)
          : currentLog.totalProteinLogged;

        const safeSleep = typeof telemetry.sleepHours === 'number' && telemetry.sleepHours > 0
          ? telemetry.sleepHours
          : currentLog.sleepHours;

        const caffeineStatus = telemetry.caffeineStatus || (telemetry.caffeineCutoffRespected ? 'before_cutoff' : 'after_cutoff');

        set((state) => ({
          logsByDate: {
            ...state.logsByDate,
            [targetDate]: {
              ...currentLog,
              sleepHours: safeSleep,
              totalProteinLogged: safeProtein,
              habitsCompleted: updatedHabits,
            },
          },
          deskRitualsByDate: {
            ...state.deskRitualsByDate,
            [targetDate]: {
              ...currentRituals,
              eveningWrapCompleted: true,
              caffeineCutoffRespected: !!telemetry.caffeineCutoffRespected,
              caffeineStatus,
              ...(telemetry.debriefData || {}),
            },
          },
        }));

        get().syncWithSupabase(targetDate);
      },

      toggleHabit: (habitId, date) => {
        const todayStr = getTodayString();
        const targetDate = date || get().currentDate;
        // Strict guard: users can only check boxes or toggle progress for the current day
        if (targetDate !== todayStr) {
          return;
        }

        const currentLog = get().logsByDate[targetDate] || createEmptyDailyLog();
        const wasDone = !!currentLog.habitsCompleted[habitId];
        const willBeDone = !wasDone;
        const updatedHabits = {
          ...currentLog.habitsCompleted,
          [habitId]: willBeDone,
        };

        const updatedLogs = {
          ...get().logsByDate,
          [targetDate]: {
            ...currentLog,
            habitsCompleted: updatedHabits,
          },
        };

        const streakStatus = calculateStreakStatus(
          updatedLogs,
          targetDate,
          get().streakFreezeStock
        );

        set({
          logsByDate: updatedLogs,
          streakCount: streakStatus.currentStreak,
          streakFreezeStock: streakStatus.freezeStock,
        });

        const hadPerfectDay = get().habits.length > 0 && get().habits.every((h) => !!currentLog.habitsCompleted[h.id]);
        const nowPerfectDay = get().habits.length > 0 && get().habits.every((h) => !!updatedHabits[h.id]);

        if (willBeDone) {
          get().gainXp(XP_AWARDS.habitComplete, 'Habit Completed', 'habit');

          if (!hadPerfectDay && nowPerfectDay) {
            get().gainXp(XP_AWARDS.perfectDay, 'Flawless Execution (All Habits)', 'perfect_day');
          }

          if (streakStatus.milestoneAchievedToday) {
            const milestone = streakStatus.milestoneAchievedToday;
            const claimed = get().claimedMilestones;
            if (!claimed.includes(milestone.days)) {
              set({ claimedMilestones: [...claimed, milestone.days] });
              get().gainXp(milestone.xp, `Streak Milestone: ${milestone.name} (${milestone.days} Days)`, 'streak');
              progressionEvents.emit('streak:milestone', {
                days: milestone.days,
                milestoneName: milestone.name,
                xpAwarded: milestone.xp,
              });
            }
          }
        } else {
          // Deselecting habit: deduct the awarded XP to prevent infinite spam farming
          get().gainXp(-XP_AWARDS.habitComplete, 'Habit Deselected', 'habit');

          if (hadPerfectDay && !nowPerfectDay) {
            get().gainXp(-XP_AWARDS.perfectDay, 'Flawless Execution Revoked', 'perfect_day');
          }
        }

        get().syncWithSupabase(targetDate);
      },

      addCustomHabit: (title, category = 'custom') => {
        const newHabit: HabitItem = {
          id: `custom_${Date.now()}`,
          title,
          category,
          targetDaysPerWeek: 7,
        };
        const updated = [...get().habits, newHabit];
        set({ habits: updated });

        const session = get().userSession;
        if (session && !session.id.startsWith('guest_')) {
          saveUserLocalProgress(session.id, { habits: updated });
        }
      },

      deleteHabit: (habitId) => {
        const updated = get().habits.filter((h) => h.id !== habitId);
        const currentDate = get().currentDate;
        const currentLog = get().getDailyLog(currentDate);

        // If this custom habit was completed today, revoke the awarded XP to prevent add-complete-delete farming
        if (currentLog.habitsCompleted[habitId]) {
          get().gainXp(-XP_AWARDS.habitComplete, 'Custom Habit Deleted', 'habit');
          const updatedHabitsCompleted = { ...currentLog.habitsCompleted };
          delete updatedHabitsCompleted[habitId];

          set((state) => ({
            habits: updated,
            logsByDate: {
              ...state.logsByDate,
              [currentDate]: {
                ...currentLog,
                habitsCompleted: updatedHabitsCompleted,
              },
            },
          }));
        } else {
          set({ habits: updated });
        }

        const session = get().userSession;
        if (session && !session.id.startsWith('guest_')) {
          saveUserLocalProgress(session.id, { habits: updated });
        }
      },

      setProtein: (amount, date) => {
        const targetDate = date || get().currentDate;
        const currentLog = get().logsByDate[targetDate] || createEmptyDailyLog();
        const prevProtein = currentLog.totalProteinLogged || 0;
        const safeAmount = Math.max(0, amount);

        set((state) => ({
          logsByDate: {
            ...state.logsByDate,
            [targetDate]: { ...currentLog, totalProteinLogged: safeAmount },
          },
        }));

        const hadFull = prevProtein >= GOALS.proteinGrams;
        const hadHalf = prevProtein >= GOALS.proteinGrams / 2 && !hadFull;
        const nowFull = safeAmount >= GOALS.proteinGrams;
        const nowHalf = safeAmount >= GOALS.proteinGrams / 2 && !nowFull;

        if (!hadFull && nowFull) {
          const delta = hadHalf ? (XP_AWARDS.proteinGoal - XP_AWARDS.proteinPartial) : XP_AWARDS.proteinGoal;
          get().gainXp(delta, 'Protein Target Reached (120g+)', 'nutrition');
        } else if (hadFull && !nowFull) {
          const delta = nowHalf ? (XP_AWARDS.proteinGoal - XP_AWARDS.proteinPartial) : XP_AWARDS.proteinGoal;
          get().gainXp(-delta, 'Protein Target Revoked', 'nutrition');
        } else if (!hadHalf && nowHalf && !hadFull) {
          get().gainXp(XP_AWARDS.proteinPartial, 'Protein Milestone (60g+)', 'nutrition');
        } else if (hadHalf && !nowHalf && !nowFull) {
          get().gainXp(-XP_AWARDS.proteinPartial, 'Protein Milestone Revoked', 'nutrition');
        }

        get().syncWithSupabase(targetDate);
      },

      setCalories: (amount, date) => {
        const targetDate = date || get().currentDate;
        const currentLog = get().logsByDate[targetDate] || createEmptyDailyLog();
        set((state) => ({
          logsByDate: {
            ...state.logsByDate,
            [targetDate]: { ...currentLog, totalCaloriesLogged: Math.max(0, amount) },
          },
        }));
        get().syncWithSupabase(targetDate);
      },

      setHydration: (liters, date) => {
        const targetDate = date || get().currentDate;
        const currentLog = get().logsByDate[targetDate] || createEmptyDailyLog();
        const prevHydration = currentLog.hydrationLiters || 0;
        const safeLiters = Math.max(0, Math.round(liters * 100) / 100);

        set((state) => ({
          logsByDate: {
            ...state.logsByDate,
            [targetDate]: { ...currentLog, hydrationLiters: safeLiters },
          },
        }));

        const hadHydration = prevHydration >= GOALS.hydrationLiters;
        const nowHydration = safeLiters >= GOALS.hydrationLiters;

        if (!hadHydration && nowHydration) {
          get().gainXp(XP_AWARDS.hydrationGoal, 'Hydration Target Achieved (2.0L+)', 'hydration');
        } else if (hadHydration && !nowHydration) {
          get().gainXp(-XP_AWARDS.hydrationGoal, 'Hydration Target Revoked', 'hydration');
        }

        get().syncWithSupabase(targetDate);
      },

      setSleep: (hours, date) => {
        const targetDate = date || get().currentDate;
        const currentLog = get().logsByDate[targetDate] || createEmptyDailyLog();
        const prevSleep = currentLog.sleepHours || 0;

        set((state) => ({
          logsByDate: {
            ...state.logsByDate,
            [targetDate]: { ...currentLog, sleepHours: hours },
          },
        }));

        // Award XP on logging sleep telemetry — first log only
        if (prevSleep === 0 && hours > 0) {
          get().gainXp(25, 'Sleep Telemetry Logged', 'sleep');
        }

        // One-time sleep goal bonus per day — cannot be farmed by toggling across the 7h mark
        const nowSleep = hours >= GOALS.sleepHours;
        const alreadyAwarded = !!get().sleepGoalAwardedByDate?.[targetDate];
        if (nowSleep && !alreadyAwarded) {
          set((state) => ({
            sleepGoalAwardedByDate: {
              ...state.sleepGoalAwardedByDate,
              [targetDate]: true,
            },
          }));
          get().gainXp(XP_AWARDS.sleepGoal, 'Sleep Restoration Goal (7h+)', 'sleep');
        }

        get().syncWithSupabase(targetDate);
      },

      setEnergy: (level, date) => {
        const targetDate = date || get().currentDate;
        const currentLog = get().logsByDate[targetDate] || createEmptyDailyLog();
        const firstLog = !currentLog.energyLevel;

        set((state) => ({
          logsByDate: {
            ...state.logsByDate,
            [targetDate]: { ...currentLog, energyLevel: level },
          },
        }));

        if (firstLog) {
          get().gainXp(XP_AWARDS.energyLog, 'Daily Energy Calibration', 'energy');
        }

        get().syncWithSupabase(targetDate);
      },

      setMood: (score, date) => {
        const targetDate = date || get().currentDate;
        const currentLog = get().logsByDate[targetDate] || createEmptyDailyLog();
        const firstLog = !currentLog.moodScore;

        set((state) => ({
          logsByDate: {
            ...state.logsByDate,
            [targetDate]: { ...currentLog, moodScore: score },
          },
        }));

        if (firstLog) {
          get().gainXp(XP_AWARDS.moodLog, 'Daily Mindset Reflection', 'mood');
        }

        get().syncWithSupabase(targetDate);
      },

      setNotes: (notes, date) => {
        const targetDate = date || get().currentDate;
        const currentLog = get().logsByDate[targetDate] || createEmptyDailyLog();
        set((state) => ({
          logsByDate: {
            ...state.logsByDate,
            [targetDate]: { ...currentLog, notes },
          },
        }));
        get().syncWithSupabase(targetDate);
      },

      addCustomRecipe: (recipe) => {
        const normalizedName = recipe.name.toLowerCase().trim();
        const updated = [
          recipe,
          ...get().customRecipes.filter(
            (r) => r.id !== recipe.id && r.name.toLowerCase().trim() !== normalizedName
          ),
        ];
        set({ customRecipes: updated });

        const userId = get().userSession?.id;
        if (userId && !userId.startsWith('guest_')) {
          saveUserLocalProgress(userId, { customRecipes: updated });
          (async () => {
            try {
              await supabase.from('custom_recipes').upsert({
                id: recipe.id,
                user_id: userId,
                name: recipe.name,
                subtitle: recipe.subtitle || '',
                image: recipe.image,
                raw_image: recipe.rawImage || null,
                calories: recipe.calories,
                protein: recipe.protein,
                carbs: recipe.carbs,
                fats: recipe.fats,
                prep_time_minutes: recipe.prepTimeMinutes,
                category: recipe.category,
                diet_type: recipe.dietType,
                tags: recipe.tags || [],
                focus_score: recipe.focusScore || '9.0/10',
                description: recipe.description || '',
                ingredients: recipe.ingredients || [],
                instructions: recipe.instructions || [],
                reasoning_steps: recipe.reasoningSteps || [],
                updated_at: new Date().toISOString(),
              }, { onConflict: 'id' });
            } catch (err) {
              console.warn('Failed to sync custom recipe to Supabase:', err);
            }
          })();
        }
      },

      updateCustomRecipe: (id, updates) => {
        const updated = get().customRecipes.map((r) => (r.id === id ? { ...r, ...updates } : r));
        set({ customRecipes: updated });

        const userId = get().userSession?.id;
        if (userId && !userId.startsWith('guest_')) {
          saveUserLocalProgress(userId, { customRecipes: updated });
          const target = updated.find((r) => r.id === id);
          if (target) {
            (async () => {
              try {
                await supabase.from('custom_recipes').upsert({
                  id: target.id,
                  user_id: userId,
                  name: target.name,
                  subtitle: target.subtitle || '',
                  image: target.image,
                  raw_image: target.rawImage || null,
                  calories: target.calories,
                  protein: target.protein,
                  carbs: target.carbs,
                  fats: target.fats,
                  prep_time_minutes: target.prepTimeMinutes,
                  category: target.category,
                  diet_type: target.dietType,
                  tags: target.tags || [],
                  focus_score: target.focusScore || '9.0/10',
                  description: target.description || '',
                  ingredients: target.ingredients || [],
                  instructions: target.instructions || [],
                  reasoning_steps: target.reasoningSteps || [],
                  updated_at: new Date().toISOString(),
                }, { onConflict: 'id' });
              } catch (err) {
                console.warn('Failed to update custom recipe in Supabase:', err);
              }
            })();
          }
        }
      },

      deleteCustomRecipe: (id) => {
        const updated = get().customRecipes.filter((r) => r.id !== id);
        set({ customRecipes: updated });

        const userId = get().userSession?.id;
        if (userId && !userId.startsWith('guest_')) {
          saveUserLocalProgress(userId, { customRecipes: updated });
          (async () => {
            try {
              await supabase.from('custom_recipes').delete().eq('id', id).eq('user_id', userId);
            } catch (err) {
              console.warn('Failed to delete custom recipe from Supabase:', err);
            }
          })();
        }
      },

      logRecipeToDay: (recipeId, protein, calories, date) => {
        const targetDate = date || get().currentDate;
        const currentLog = get().logsByDate[targetDate] || createEmptyDailyLog();
        const existingMeals = currentLog.loggedMeals || [];
        const alreadyLoggedCount = existingMeals.length + currentLog.loggedRecipeIds.length;
        const updatedRecipes = [...currentLog.loggedRecipeIds, recipeId];

        const allRecipes = [...get().customRecipes, ...RECIPES];
        const matched = allRecipes.find((r) => r.id === recipeId);

        const newMealEntry: LoggedMealEntry = {
          id: `recipe_log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: matched?.name || 'Logged Dish',
          protein,
          calories,
          carbs: matched?.carbs,
          fats: matched?.fats,
          dietType: matched?.dietType,
          isVegetarian: matched?.dietType === 'vegetarian' || matched?.dietType === 'vegan',
          ingredients: matched?.ingredients,
          suggestedSprite: matched?.image,
          loggedAt: new Date().toISOString(),
          recipeId,
          savedAsRecipe: true,
        };

        set((state) => ({
          logsByDate: {
            ...state.logsByDate,
            [targetDate]: {
              ...currentLog,
              totalProteinLogged: currentLog.totalProteinLogged + protein,
              totalCaloriesLogged: currentLog.totalCaloriesLogged + calories,
              loggedRecipeIds: updatedRecipes,
              loggedMeals: [...existingMeals, newMealEntry],
            },
          },
        }));

        // Cap recipe XP at 3 meals per day (max 60 XP/day) to prevent infinite spam farming
        if (alreadyLoggedCount < 3) {
          get().gainXp(XP_AWARDS.recipeLogged, 'Whole Food Dish Prepared', 'recipe');
        }
        get().syncWithSupabase(targetDate);
      },

      removeRecipeFromDay: (recipeId, protein, calories, date) => {
        const targetDate = date || get().currentDate;
        const currentLog = get().logsByDate[targetDate] || createEmptyDailyLog();
        const index = currentLog.loggedRecipeIds.indexOf(recipeId);
        if (index === -1) return;

        const updatedRecipes = [...currentLog.loggedRecipeIds];
        updatedRecipes.splice(index, 1);

        const existingMeals = currentLog.loggedMeals || [];
        const mealIndex = existingMeals.findIndex((m) => m.recipeId === recipeId);
        const updatedMeals = mealIndex !== -1 
          ? existingMeals.filter((_, i) => i !== mealIndex)
          : existingMeals;

        set((state) => ({
          logsByDate: {
            ...state.logsByDate,
            [targetDate]: {
              ...currentLog,
              totalProteinLogged: Math.max(0, currentLog.totalProteinLogged - protein),
              totalCaloriesLogged: Math.max(0, currentLog.totalCaloriesLogged - calories),
              loggedRecipeIds: updatedRecipes,
              loggedMeals: updatedMeals,
            },
          },
        }));

        // Deduct recipe XP if the removed recipe was within the daily XP reward cap (<= 3 meals)
        if (currentLog.loggedRecipeIds.length <= 3) {
          get().gainXp(-XP_AWARDS.recipeLogged, 'Whole Food Dish Removed', 'recipe');
        }
        get().syncWithSupabase(targetDate);
      },

      logMealToDay: (meal, date) => {
        const targetDate = date || get().currentDate;
        const currentLog = get().logsByDate[targetDate] || createEmptyDailyLog();
        const existingMeals = currentLog.loggedMeals || [];
        const prevProtein = currentLog.totalProteinLogged || 0;
        const addedProtein = Math.max(0, meal.protein || 0);
        const newProtein = prevProtein + addedProtein;

        const newMealEntry: LoggedMealEntry = {
          ...meal,
          id: meal.id || `meal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          loggedAt: meal.loggedAt || new Date().toISOString(),
          savedAsRecipe: meal.savedAsRecipe ?? false,
        };

        const updatedMeals = [...existingMeals, newMealEntry];
        const updatedRecipes = meal.recipeId 
          ? [...currentLog.loggedRecipeIds, meal.recipeId]
          : currentLog.loggedRecipeIds;

        const profile = get().userProfile;
        const targetProtein = profile?.targetProteinGrams || (profile?.weightKg ? Math.round(profile.weightKg * 1.6) : GOALS.proteinGrams);
        const isTargetMet = newProtein >= targetProtein;
        const updatedHabitsCompleted = {
          ...(currentLog.habitsCompleted || {}),
          ...(isTargetMet ? { protein_target: true } : {}),
        };

        set((state) => ({
          logsByDate: {
            ...state.logsByDate,
            [targetDate]: {
              ...currentLog,
              totalProteinLogged: newProtein,
              totalCaloriesLogged: currentLog.totalCaloriesLogged + (meal.calories || 0),
              loggedMeals: updatedMeals,
              loggedRecipeIds: updatedRecipes,
              habitsCompleted: updatedHabitsCompleted,
            },
          },
        }));

        // Award meal XP: Always award XP for first 5 meals of the day (including catch-up meals)
        if (existingMeals.length < 5) {
          get().gainXp(XP_AWARDS.recipeLogged, `Whole Food Meal Logged (+${addedProtein}g Protein)`, 'recipe');
        }

        // Award Protein Target progression if this meal pushes past milestone/target thresholds
        const hadFull = prevProtein >= targetProtein;
        const hadHalf = prevProtein >= targetProtein / 2 && !hadFull;
        const nowFull = newProtein >= targetProtein;
        const nowHalf = newProtein >= targetProtein / 2 && !nowFull;

        if (!hadFull && nowFull) {
          const delta = hadHalf ? (XP_AWARDS.proteinGoal - XP_AWARDS.proteinPartial) : XP_AWARDS.proteinGoal;
          get().gainXp(delta, `Protein Target Reached (${newProtein}g / ${targetProtein}g)`, 'nutrition');
        } else if (!hadHalf && nowHalf && !nowFull) {
          get().gainXp(XP_AWARDS.proteinPartial, `Protein Milestone Reached (${newProtein}g)`, 'nutrition');
        }

        get().syncWithSupabase(targetDate);
        return newMealEntry;
      },

      removeMealFromDay: (mealId, date) => {
        const targetDate = date || get().currentDate;
        const currentLog = get().logsByDate[targetDate] || createEmptyDailyLog();
        const existingMeals = currentLog.loggedMeals || [];
        const mealIndex = existingMeals.findIndex((m) => m.id === mealId);
        if (mealIndex === -1) return;

        const meal = existingMeals[mealIndex];
        const updatedMeals = existingMeals.filter((m) => m.id !== mealId);

        let updatedRecipes = [...currentLog.loggedRecipeIds];
        if (meal.recipeId) {
          const rIndex = updatedRecipes.indexOf(meal.recipeId);
          if (rIndex !== -1) {
            updatedRecipes.splice(rIndex, 1);
          }
        }

        set((state) => ({
          logsByDate: {
            ...state.logsByDate,
            [targetDate]: {
              ...currentLog,
              totalProteinLogged: Math.max(0, currentLog.totalProteinLogged - (meal.protein || 0)),
              totalCaloriesLogged: Math.max(0, currentLog.totalCaloriesLogged - (meal.calories || 0)),
              loggedMeals: updatedMeals,
              loggedRecipeIds: updatedRecipes,
            },
          },
        }));
        get().syncWithSupabase(targetDate);
      },

      markMealSavedAsRecipe: (mealId, date) => {
        const targetDate = date || get().currentDate;
        const currentLog = get().logsByDate[targetDate] || createEmptyDailyLog();
        const existingMeals = currentLog.loggedMeals || [];
        const updatedMeals = existingMeals.map((m) => 
          m.id === mealId ? { ...m, savedAsRecipe: true } : m
        );

        set((state) => ({
          logsByDate: {
            ...state.logsByDate,
            [targetDate]: {
              ...currentLog,
              loggedMeals: updatedMeals,
            },
          },
        }));
        get().syncWithSupabase(targetDate);
      },

      syncWithSupabase: async (date) => {
        const targetDate = date || get().currentDate;
        const log = get().logsByDate[targetDate];
        if (!log) return;

        const currentSession = get().userSession;
        if (!currentSession || currentSession.id.startsWith('guest_')) {
          return;
        }

        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            set({ userSession: { id: session.user.id, email: session.user.email } });
          } else {
            return;
          }

          const userId = session.user.id;
          set({ isSyncing: true });
          
          await supabase.from('daily_logs').upsert({
            user_id: userId,
            log_date: targetDate,
            habits_completed: {
              ...log.habitsCompleted,
              __ledger_sealed: !!get().isLedgerSealedByDate[targetDate],
              __logged_meals: log.loggedMeals || [],
              __debrief_data: get().deskRitualsByDate[targetDate] || {},
            },
            total_protein: log.totalProteinLogged,
            total_calories: log.totalCaloriesLogged,
            hydration_liters: log.hydrationLiters,
            sleep_hours: log.sleepHours,
            energy_level: log.energyLevel,
            mood_score: log.moodScore,
            notes: log.notes,
            logged_recipes: log.loggedRecipeIds,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,log_date' });

          await supabase.from('user_profiles').upsert({
            user_id: userId,
            total_xp: get().totalXp,
            streak_count: get().streakCount,
            streak_freeze_stock: get().streakFreezeStock,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

          saveUserLocalProgress(userId, {
            totalXp: get().totalXp,
            streakCount: get().streakCount,
            streakFreezeStock: get().streakFreezeStock,
            claimedMilestones: get().claimedMilestones,
            claimedProtocolIds: get().claimedProtocolIds,
            completedQuestIdsByDate: get().completedQuestIdsByDate,
            xpHistory: get().xpHistory,
            logsByDate: get().logsByDate,
            customRecipes: get().customRecipes,
            userProfile: get().userProfile,
            habits: get().habits,
            isLedgerSealedByDate: get().isLedgerSealedByDate,
          });
        } catch {
          // Graceful fallback to local persistence
        } finally {
          set({ isSyncing: false });
        }
      },

      initDemoSession: () => {
        const today = getTodayString();
        set({
          userSession: { id: `guest_${Date.now()}`, email: 'demo.user@cyath.health' },
          userProfile: {
            fullName: 'demo-user',
            age: 19,
            sex: 'male',
            heightCm: 178,
            weightKg: 70,
            primaryGoal: 'focus',
            allergies: [],
            dietaryRestrictions: ['High-Protein Omnivore'],
            onboardingCompleted: true,
          },
          habits: DEFAULT_HABITS,
          totalXp: 0,
          streakCount: 0,
          streakFreezeStock: 0,
          claimedMilestones: [],
          completedQuestIdsByDate: {},
          xpHistory: [],
          activeProtocolIds: ['morning-activation', 'deep-rem-sleep'],
          logsByDate: {
            [today]: {
              habitsCompleted: {
                sunlight: true,
                protein_target: false,
                movement: true,
                hydration: false,
                digital_sunset: false,
                mobility: false,
              },
              totalProteinLogged: 45,
              totalCaloriesLogged: 620,
              hydrationLiters: 1.2,
              sleepHours: 8.0,
              energyLevel: 8,
              moodScore: 8,
              notes: 'Demo sandbox session initialized.',
              loggedRecipeIds: ['herb-grilled-chicken'],
            },
          },
          pendingAction: null,
        });
      },

      deleteAccountData: async () => {
        const userId = get().userSession?.id;

        // 1. Call server API to delete account telemetry
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            await fetch('/api/auth/delete-account', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
              },
            });
          }
        } catch (err) {
          console.warn('Backend delete-account call warning:', err);
        }

        // 2. Direct client-side cleanup on Supabase tables as fallback
        if (userId && !userId.startsWith('guest_')) {
          try {
            await Promise.allSettled([
              supabase.from('daily_logs').delete().eq('user_id', userId),
              supabase.from('xp_events').delete().eq('user_id', userId),
              supabase.from('custom_recipes').delete().eq('user_id', userId),
              supabase.from('habits').delete().eq('user_id', userId),
              supabase.from('user_profiles').delete().eq('user_id', userId),
            ]);
            await supabase.from('user_profiles').upsert({
              user_id: userId,
              total_xp: 0,
              streak_count: 0,
              streak_freeze_stock: 1,
              onboarding_completed: false,
              full_name: '',
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
          } catch (err) {
            console.error('Failed to clear remote account data:', err);
          }
        }

        // 3. Clear all browser local storage cache keys
        if (typeof window !== 'undefined') {
          try {
            if (userId) {
              localStorage.removeItem(`cyath_user_progression_${userId}`);
            }
            Object.keys(localStorage).forEach((key) => {
              if (key.startsWith('cyath_user_progression_') || key === 'cyath-habit-store-v2') {
                localStorage.removeItem(key);
              }
            });
          } catch {}
        }

        // 4. Sign out from Supabase global session
        try {
          await supabase.auth.signOut({ scope: 'global' });
        } catch {}

        // 5. Reset in-memory store completely
        set({
          userSession: null,
          userProfile: null,
          totalXp: 0,
          streakCount: 0,
          streakFreezeStock: 1,
          claimedMilestones: [],
          completedQuestIdsByDate: {},
          xpHistory: [],
          logsByDate: { [getTodayString()]: createEmptyDailyLog() },
          habits: DEFAULT_HABITS,
          activeProtocolIds: ['morning-activation', 'deep-rem-sleep'],
          pendingAction: null,
          customRecipes: [],
          isLedgerSealedByDate: {},
          unlockedTrophies: [],
          trophyCounts: {},
        });
      },

      completeWalkthrough: () => {
        const profile = get().userProfile;
        const userId = get().userSession?.id || 'guest';
        
        // Save persistent user-scoped local flag
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`cyath_walkthrough_completed_${userId}`, 'true');
            // Clean up legacy global flags that blocked other accounts
            localStorage.removeItem('cyath_walkthrough_global_completed');
            localStorage.removeItem('cyath_walkthrough_completed');
          } catch {}
        }

        // Strictly prevent multiple XP exploits: only award calibration quest bonus once
        if (profile?.walkthroughCompleted) {
          return;
        }
        const updated: UserProfile = {
          ...(profile || {
            fullName: '',
            age: 25,
            sex: 'other',
            heightCm: 175,
            weightKg: 70,
            primaryGoal: 'focus',
            allergies: [],
            dietaryRestrictions: [],
            onboardingCompleted: false,
          }),
          walkthroughCompleted: true,
        };
        get().updateUserProfile(updated);
        get().gainXp(25, 'Pioneer Calibration Complete');
      },

      logWeight: (weightKg: number, note?: string, date?: string) => {
        const targetDate = date || get().currentDate;
        const currentHistory = get().weightHistory || [];
        const prevEntry = currentHistory.length > 0 ? currentHistory[0] : null;
        const prevWeight = prevEntry ? prevEntry.weightKg : (get().userProfile?.weightKg || weightKg);
        const deltaKg = Math.round((weightKg - prevWeight) * 10) / 10;

        let trend: 'down' | 'up' | 'stable' = 'stable';
        if (deltaKg < -0.1) {
          trend = 'down';
        } else if (deltaKg > 0.1) {
          trend = 'up';
        }

        const newEntry: WeightEntry = {
          id: `weight_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          date: targetDate,
          timestamp: Date.now(),
          weightKg: Math.round(weightKg * 10) / 10,
          trend,
          deltaKg,
          note: note?.trim() || undefined,
        };

        const updatedHistory = [newEntry, ...currentHistory.filter((e) => e.date !== targetDate || Math.abs(e.timestamp - newEntry.timestamp) > 3600000)].slice(0, 60);

        // Update profile weightKg and recalibrate protein targets
        const currentProfile = get().userProfile;
        let newProteinTarget = Math.round(newEntry.weightKg * 2.0);
        if (currentProfile?.targetProteinGrams && currentProfile?.weightKg) {
          const ratio = currentProfile.targetProteinGrams / currentProfile.weightKg;
          if (ratio >= 1.2 && ratio <= 3.0) {
            newProteinTarget = Math.round(newEntry.weightKg * ratio);
          }
        }
        if (currentProfile) {
          get().updateUserProfile({ weightKg: newEntry.weightKg, targetProteinGrams: newProteinTarget });
        }

        // Award XP on a weekly cadence (at most once every 7 days)
        const targetMs = new Date(targetDate).getTime() || Date.now();
        const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
        const hasWeighedInLastWeek = currentHistory.some((e) => {
          const entryTime = e.date ? new Date(e.date).getTime() : e.timestamp;
          return Math.abs(targetMs - entryTime) < ONE_WEEK_MS;
        });

        let xpAwarded = 0;
        if (!hasWeighedInLastWeek) {
          get().gainXp(15, 'Weekly Weight Logged', 'weight_log');
          xpAwarded = 15;
          retroAudio.playTierUpgrade();
        } else {
          retroAudio.playInspectConfirm();
        }

        set({ weightHistory: updatedHistory });

        const session = get().userSession;
        if (session && !session.id.startsWith('guest_')) {
          saveUserLocalProgress(session.id, {
            weightHistory: updatedHistory,
            userProfile: get().userProfile,
          });
        }

        return { success: true, deltaKg, trend, xpAwarded };
      },

      claimSocialFollow: (platform: 'linkedin' | 'instagram', handle: string) => {
        const cleanHandle = handle.trim()
          .replace(/^@/, '')
          .replace(/^(https?:\/\/)?(www\.)?(linkedin\.com\/(in\/|company\/)?|instagram\.com\/)/i, '')
          .replace(/^in\//i, '')
          .replace(/\/$/, '');
        if (!cleanHandle) {
          return { success: false, message: 'Please provide a valid account handle or profile link.', xpAwarded: 0 };
        }

        const currentSocial = get().socialQuests || DEFAULT_SOCIAL_QUESTS;
        const existingStatus = currentSocial[platform]?.status;
        const userId = get().userSession?.id || 'guest';

        // 1. Check in-memory store state
        if (existingStatus === 'verified') {
          return { success: false, message: `You have already claimed the ${platform === 'linkedin' ? 'LinkedIn' : 'Instagram'} follow bonus.`, xpAwarded: 0 };
        }

        // 2. Multi-layer anti-repeat check in localStorage
        if (typeof window !== 'undefined') {
          try {
            // User-level key
            const userClaimed = localStorage.getItem(`cyath_social_${platform}_claimed_${userId}`);
            if (userClaimed === 'true') {
              return { success: false, message: `Reward already claimed for this account.`, xpAwarded: 0 };
            }

            // Global device-level registry of handles
            const rawClaims = localStorage.getItem('cyath_global_social_claims');
            const claimsMap: Record<string, string> = rawClaims ? JSON.parse(rawClaims) : {};
            const claimKey = `${platform}:${cleanHandle.toLowerCase()}`;
            if (claimsMap[claimKey]) {
              return { success: false, message: `This account handle has already claimed the reward on this device.`, xpAwarded: 0 };
            }

            // Record into device claims map
            claimsMap[claimKey] = userId;
            localStorage.setItem('cyath_global_social_claims', JSON.stringify(claimsMap));
            localStorage.setItem(`cyath_social_${platform}_claimed_${userId}`, 'true');
            localStorage.setItem(`cyath_social_${platform}_claimed_global`, 'true');
          } catch {}
        }

        const verificationToken = `CYATH-${platform.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
        const updatedSocial: SocialQuestsState = {
          ...currentSocial,
          [platform]: {
            status: 'verified',
            handle: cleanHandle,
            claimedAt: Date.now(),
            verificationCode: verificationToken,
          },
        };

        set({ socialQuests: updatedSocial });

        // Award +15 XP + Vanguard Badge
        get().gainXp(XP_MATRIX.SOCIAL_QUEST_FOLLOW, `Vanguard Follower: Connected Cyath on ${platform === 'linkedin' ? 'LinkedIn' : 'Instagram'}`, 'social_quest');
        retroAudio.playTierUpgrade();

        const currentProfile = get().userProfile;
        const currentDecorations = currentProfile?.unlockedDecorations || [];
        const updatedDecorations = Array.from(new Set([...currentDecorations, 'vanguard_follower_badge']));
        if (currentProfile) {
          get().updateUserProfile({
            ...currentProfile,
            unlockedDecorations: updatedDecorations,
          });
        }

        // Persist to user local progress
        if (userId && !userId.startsWith('guest_')) {
          saveUserLocalProgress(userId, {
            socialQuests: updatedSocial,
          });
        }

        return {
          success: true,
          message: `Verified successfully! +${XP_MATRIX.SOCIAL_QUEST_FOLLOW} XP awarded & Vanguard Badge unlocked.`,
          xpAwarded: XP_MATRIX.SOCIAL_QUEST_FOLLOW,
        };
      },

      setIsDownscaled: (date: string, isDownscaled: boolean) => {
        const targetDate = date || get().currentDate;
        const currentLog = get().logsByDate[targetDate] || createEmptyDailyLog();
        set((state) => ({
          logsByDate: {
            ...state.logsByDate,
            [targetDate]: {
              ...currentLog,
              isDownscaled,
            },
          },
        }));
      },

      unlockDecoration: (decorationId: string) => {
        const currentProfile = get().userProfile;
        if (!currentProfile) return;
        const current = currentProfile.unlockedDecorations || [];
        if (!current.includes(decorationId)) {
          get().updateUserProfile({
            ...currentProfile,
            unlockedDecorations: [...current, decorationId],
          });
          retroAudio.playTierUpgrade();
        }
      },

      setKeystoneProtocol: (protocolId: string) => {
        const currentProfile = get().userProfile;
        if (!currentProfile) {
          get().updateUserProfile({
            id: get().userSession?.id || 'guest_user',
            fullName: 'Explorer',
            keystoneProtocolId: protocolId,
          } as any);
        } else {
          get().updateUserProfile({
            ...currentProfile,
            keystoneProtocolId: protocolId,
          });
        }
      },

      resetUserProgress: async () => {

        const userId = get().userSession?.id;
        if (userId && !userId.startsWith('guest_')) {
          try {
            await Promise.allSettled([
              supabase.from('daily_logs').delete().eq('user_id', userId),
              supabase.from('xp_events').delete().eq('user_id', userId),
              supabase.from('custom_recipes').delete().eq('user_id', userId),
              supabase.from('user_profiles').update({
                total_xp: 0,
                streak_count: 0,
                streak_freeze_stock: 1,
                onboarding_completed: false,
                full_name: '',
                updated_at: new Date().toISOString(),
              }).eq('user_id', userId),
            ]);
            saveUserLocalProgress(userId, {
              totalXp: 0,
              streakCount: 0,
              streakFreezeStock: 1,
              claimedMilestones: [],
              completedQuestIdsByDate: {},
              xpHistory: [],
              customRecipes: [],
              habits: DEFAULT_HABITS,
              logsByDate: { [getTodayString()]: createEmptyDailyLog() },
              userProfile: null,
              weightHistory: [],
              socialQuests: DEFAULT_SOCIAL_QUESTS,
            });
          } catch (err) {
            console.error('Failed to reset user progress:', err);
          }
        }
        if (typeof window !== 'undefined') {
          try {
            if (userId) {
              localStorage.removeItem(`cyath_user_progression_${userId}`);
            }
            localStorage.removeItem('cyath-habit-store-v2');
          } catch {}
        }
        set({
          totalXp: 0,
          streakCount: 0,
          streakFreezeStock: 1,
          claimedMilestones: [],
          completedQuestIdsByDate: {},
          xpHistory: [],
          logsByDate: { [getTodayString()]: createEmptyDailyLog() },
          habits: DEFAULT_HABITS,
          activeProtocolIds: ['morning-activation', 'deep-rem-sleep'],
          pendingAction: null,
          customRecipes: [],
          userProfile: null,
          weightHistory: [],
          socialQuests: DEFAULT_SOCIAL_QUESTS,
        });
      },

      setCircadianSchedule: (wakeTime: string, bedTime: string) => {
        const currentProfile = get().userProfile || {
          fullName: 'Cyath Explorer',
          age: 26,
          sex: 'other' as const,
          heightCm: 178,
          weightKg: 74,
          primaryGoal: 'focus' as const,
          allergies: [],
          dietaryRestrictions: [],
          onboardingCompleted: true,
        };
        const hasClaimed = !!currentProfile.circadianScheduleXpClaimed;
        get().updateUserProfile({
          ...currentProfile,
          wakeTime,
          bedTime,
          circadianScheduleXpClaimed: true,
        });
        if (!hasClaimed) {
          get().gainXp(25, 'Circadian Rhythm Schedule Set', 'circadian');
        }
      },

      setCustomHabitSlot: (habitId: string, customTitle?: string, category: HabitItem['category'] = 'lifestyle') => {
        const definition = CUSTOM_HABITS_LIBRARY.find((h) => h.id === habitId);
        const title = customTitle || definition?.title || habitId;
        const habitCategory = definition?.category || category;
        const currentProfile = get().userProfile;
        if (currentProfile) {
          get().updateUserProfile({ ...currentProfile, customHabitSlot: habitId });
        }
        const currentHabits = get().habits;
        if (!currentHabits.some((h) => h.id === habitId)) {
          set({
            habits: [
              ...currentHabits,
              {
                id: habitId,
                title,
                category: habitCategory as any,
                targetDaysPerWeek: 7,
              },
            ],
          });
        }
      },

      sealDailyLedger: (
        date?: string,
        xpAwarded?: number,
        items?: Array<{ amount: number; reason: string; suite: 'circadian' | 'iron' | 'focus' }>,
        isPartial: boolean = false
      ) => {
        const targetDate = date || get().currentDate;
        const isAlreadySealed = get().isLedgerSealedByDate[targetDate];
        const isAlreadyPartial = get().isLedgerPartiallySealedByDate?.[targetDate];
        if (isAlreadySealed && !isAlreadyPartial) {
          return { success: false, xpAwarded: 0 };
        }
        const updatedSeals = {
          ...get().isLedgerSealedByDate,
          [targetDate]: true,
        };
        const updatedPartials = {
          ...(get().isLedgerPartiallySealedByDate || {}),
          [targetDate]: isPartial,
        };
        set({
          isLedgerSealedByDate: updatedSeals,
          isLedgerPartiallySealedByDate: updatedPartials,
          isForgedStreak: false,
          isReentryAvailable: false,
        });

        let finalXp = 0;
        if (items && items.length > 0) {
          for (const item of items) {
            get().gainXp(item.amount, item.reason, 'ledger_seal', item.suite);
            finalXp += item.amount;
          }
        } else if (typeof xpAwarded === 'number' && xpAwarded > 0) {
          finalXp = xpAwarded;
          get().gainXp(finalXp, isPartial ? 'Daily Log Saved (Pending Meals)' : 'Daily Log Saved', 'ledger_seal');
        } else if (xpAwarded === undefined) {
          finalXp = 50;
          get().gainXp(finalXp, isPartial ? 'Daily Log Saved (Pending Meals)' : 'Daily Log Saved', 'ledger_seal');
        }

        const currentLog = get().getDailyLog(targetDate);
        set({
          logsByDate: {
            ...get().logsByDate,
            [targetDate]: {
              ...currentLog,
              habitsCompleted: {
                ...currentLog.habitsCompleted,
                __ledger_sealed: true,
                __ledger_partial: isPartial,
              },
            },
          },
        });
        get().syncWithSupabase(targetDate);

        const sealedCount = Object.values(updatedSeals).filter(Boolean).length;
        if (sealedCount > 0 && sealedCount % 5 === 0 && get().streakFreezeStock < 3) {
          set({ streakFreezeStock: get().streakFreezeStock + 1 });
        }

        get().evaluateTrophies(targetDate);
        return { success: true, xpAwarded: finalXp };
      },

      amendDebriefMeals: (
        date: string,
        meals: {
          lunch?: { name: string; protein: number; calories: number; hitTarget: boolean };
          dinner?: { name: string; protein: number; calories: number; hitTarget: boolean };
        }
      ) => {
        const targetDate = date || get().currentDate;
        const currentDebrief = (get().dailyDebriefLog && get().dailyDebriefLog[targetDate]) || {};
        let addedXp = 0;

        if (meals.lunch) {
          get().logMealToDay(
            {
              name: meals.lunch.name,
              protein: meals.lunch.protein,
              calories: meals.lunch.calories,
              mealSlot: 'lunch',
            },
            targetDate
          );
          const award = meals.lunch.hitTarget ? 25 : 15;
          addedXp += award;
          get().gainXp(award, `Lunch Logged (${meals.lunch.name})`, 'ledger_seal', 'iron');
        }

        if (meals.dinner) {
          get().logMealToDay(
            {
              name: meals.dinner.name,
              protein: meals.dinner.protein,
              calories: meals.dinner.calories,
              mealSlot: 'dinner',
            },
            targetDate
          );
          const award = meals.dinner.hitTarget ? 25 : 15;
          addedXp += award;
          get().gainXp(award, `Dinner Logged (${meals.dinner.name})`, 'ledger_seal', 'iron');
        }

        const updatedPartials = {
          ...(get().isLedgerPartiallySealedByDate || {}),
          [targetDate]: false,
        };

        const updatedDebrief = {
          ...currentDebrief,
          lunchFuel: meals.lunch ? meals.lunch.name : currentDebrief.lunchFuel,
          dinnerFuel: meals.dinner ? meals.dinner.name : currentDebrief.dinnerFuel,
        };

        set({
          dailyDebriefLog: {
            ...get().dailyDebriefLog,
            [targetDate]: updatedDebrief,
          },
          isLedgerPartiallySealedByDate: updatedPartials,
        });

        get().syncWithSupabase(targetDate);
        get().evaluateTrophies(targetDate);
        retroAudio.playTierUpgrade();
        return { success: true, xpAwarded: addedXp };
      },

      getProteinRebalance: (date?: string) => {
        const targetDate = date || get().currentDate;
        const log = get().getDailyLog(targetDate);
        const profile = get().userProfile;
        const target = profile?.targetProteinGrams || (profile?.weightKg ? Math.round(profile.weightKg * 1.6) : 100);

        let bProtein = 0;
        let lProtein = 0;
        let dProtein = 0;

        if (log.loggedMeals && log.loggedMeals.length > 0) {
          log.loggedMeals.forEach((m) => {
            const lower = (m.name + ' ' + (m.category || '')).toLowerCase();
            if (lower.includes('breakfast') || lower.includes('egg') || lower.includes('morning') || lower.includes('oat') || lower.includes('yogurt')) {
              bProtein += m.protein || 0;
            } else if (lower.includes('lunch') || lower.includes('midday') || lower.includes('sandwich')) {
              lProtein += m.protein || 0;
            } else if (lower.includes('dinner') || lower.includes('evening') || lower.includes('steak') || lower.includes('night')) {
              dProtein += m.protein || 0;
            } else {
              lProtein += m.protein || 0;
            }
          });
        } else {
          bProtein = log.habitsCompleted?.['breakfast_protein'] ? 30 : 0;
          lProtein = log.habitsCompleted?.['lunch_protein'] ? 35 : 0;
          dProtein = Math.max(0, log.totalProteinLogged - bProtein - lProtein);
        }

        const dietPref = profile?.dietaryRestrictions?.find((d) =>
          ['vegan', 'vegetarian', 'eggetarian', 'pescatarian', 'omnivore'].includes(d.toLowerCase())
        );

        return calculateProteinRebalance({
          dailyTarget: target,
          breakfastProtein: bProtein,
          lunchProtein: lProtein,
          dinnerProtein: dProtein,
          userDietType: dietPref,
          customRecipes: get().customRecipes,
        });
      },

      activateReentryProtocol: (date?: string) => {
        const targetDate = date || get().currentDate;
        const currentStreak = get().streakCount;
        const restoredStreak = Math.max(2, currentStreak + 1);
        set({
          isForgedStreak: true,
          isReentryAvailable: false,
          streakCount: restoredStreak,
        });
        get().gainXp(50, 'Grace Re-entry: Forged Streak Activated', 'streak');
        return { success: true, message: `Forged Streak Activated! ${restoredStreak}-day streak restored.` };
      },

      unlockTrophy: (trophyId: string) => {
        const currentUnlocked = get().unlockedTrophies;
        const currentCounts = get().trophyCounts || {};
        const trophy = TROPHIES_ROSTER.find((t) => t.id === trophyId);
        if (!trophy) return false;

        const isNewUnlock = !currentUnlocked.includes(trophyId);
        const newCount = (currentCounts[trophyId] || (isNewUnlock ? 0 : 1)) + 1;
        const updatedCounts = { ...currentCounts, [trophyId]: newCount };
        const updatedUnlocked = isNewUnlock ? [...currentUnlocked, trophyId] : currentUnlocked;

        set({
          unlockedTrophies: updatedUnlocked,
          trophyCounts: updatedCounts,
          pendingTrophyUnlock: isNewUnlock ? trophy : get().pendingTrophyUnlock,
        });

        if (isNewUnlock) {
          get().gainXp(50, `Trophy Unlocked: ${trophy.title}`, 'trophy');
        } else if (newCount === 5) {
          get().gainXp(150, `Silver Mastery (5x Multiplier): ${trophy.title}`, 'trophy');
        } else if (newCount === 20) {
          get().gainXp(500, `Gold Mastery (20x Multiplier): ${trophy.title}`, 'trophy');
        }
        return isNewUnlock;
      },

      incrementTrophyCount: (trophyId: string) => {
        const currentCounts = get().trophyCounts || {};
        const currentUnlocked = get().unlockedTrophies;
        const trophy = TROPHIES_ROSTER.find((t) => t.id === trophyId);
        if (!trophy) return;

        const isNewUnlock = !currentUnlocked.includes(trophyId);
        const newCount = (currentCounts[trophyId] || (isNewUnlock ? 0 : 1)) + 1;
        const updatedCounts = { ...currentCounts, [trophyId]: newCount };
        const updatedUnlocked = isNewUnlock ? [...currentUnlocked, trophyId] : currentUnlocked;

        set({
          unlockedTrophies: updatedUnlocked,
          trophyCounts: updatedCounts,
        });

        if (isNewUnlock) {
          get().gainXp(50, `Trophy Unlocked: ${trophy.title}`, 'trophy');
        } else if (newCount === 5) {
          get().gainXp(150, `Silver Mastery (5x Multiplier): ${trophy.title}`, 'trophy');
        } else if (newCount === 20) {
          get().gainXp(500, `Gold Mastery (20x Multiplier): ${trophy.title}`, 'trophy');
        }
      },

      dismissPendingTrophy: () => {
        set({ pendingTrophyUnlock: null });
      },

      evaluateTrophies: (date?: string) => {
        const targetDate = date || get().currentDate;
        const log = get().getDailyLog(targetDate);
        const profile = get().userProfile;
        const targetProtein = profile?.weightKg ? Math.round(profile.weightKg * 2.0) : 140;

        // 1. Sanctuary Biome Tier Ascensions
        const currentLevelInfo = calculateLevel(get().totalXp);
        const currentIslandTier = getIslandTier(currentLevelInfo.level, profile?.selectedIslandSuite || profile?.archetype);
        if (currentIslandTier.tier >= 1) get().unlockTrophy('island_sprout');
        if (currentIslandTier.tier >= 3) get().unlockTrophy('island_cabin');
        if (currentIslandTier.tier >= 5) get().unlockTrophy('island_homestead');
        if (currentIslandTier.tier >= 8) get().unlockTrophy('island_observatory');
        if (currentIslandTier.tier >= 10) get().unlockTrophy('island_eden');

        // 2. Daily Seal Ceremony & Corkboard Receipts
        const sealedDates = Object.keys(get().isLedgerSealedByDate).filter((d) => get().isLedgerSealedByDate[d]);
        if (sealedDates.length >= 1) {
          get().unlockTrophy('first_seal');
          get().unlockTrophy('evening_seal_master');
        }
        if (sealedDates.length >= 7) {
          get().unlockTrophy('seal_streak_7');
        }
        if (sealedDates.length >= 30) {
          get().unlockTrophy('seal_streak_30');
        }

        // 3. Solar Vanguard: 3 days in a row of sunlight
        const logs = get().logsByDate;
        const recentDates = Object.keys(logs).sort().slice(-3);
        const has3DaySun = recentDates.length >= 3 && recentDates.every((d) => logs[d]?.habitsCompleted?.['sunlight']);
        if (has3DaySun) get().unlockTrophy('solar_vanguard');

        // 4. Iron Anchor: hit protein target
        if (log.totalProteinLogged >= targetProtein && targetProtein > 0) {
          get().unlockTrophy('iron_anchor');
        }

        // 5. Hydration Alchemist: 2.5L+
        if (log.hydrationLiters >= 2.5) {
          get().unlockTrophy('hydration_alchemist');
        }

        // 6. Desk Goblin: afternoon slump <= 3
        const ritual = get().deskRitualsByDate[targetDate];
        if (ritual?.afternoonSlumpScore && ritual.afternoonSlumpScore <= 3) {
          get().unlockTrophy('desk_goblin');
        }

        // 7. Midnight Gambler: caffeine after cutoff
        if (ritual?.caffeineStatus === 'after_cutoff') {
          get().unlockTrophy('midnight_gambler');
        }

        // 8. First Light Sentry: logged sunlight today
        if (log.habitsCompleted?.['sunlight']) {
          get().unlockTrophy('first_light');
        }

        // 9. Forged Fire Heart: restored via grace re-entry
        if (get().isForgedStreak) {
          get().unlockTrophy('forged_reentry');
        }

        // 10. The 7-Day Monolith
        if (get().streakCount >= 7) {
          get().unlockTrophy('streak_7d');
        }

        // 11. The 30-Day Solstice
        if (get().streakCount >= 30) {
          get().unlockTrophy('streak_30d');
        }

        // 12. High-Protein Chef (clean_plate): 3 meals logged
        const mealsCount = (log.loggedMeals?.length || 0) + (log.loggedRecipeIds?.length || 0);
        if (mealsCount >= 3) {
          get().unlockTrophy('clean_plate');
        }

        // 13. Deep Hydration Crown: 3.0L+
        if (log.hydrationLiters >= 3.0) {
          get().unlockTrophy('cellular_surge');
        }

        // 14. Flawless Biometrics on Seal (sleep 7-9.5h + sun + protein hit + caffeine cutoff clean)
        const isSleepOptimal = log.sleepHours >= 7.0 && log.sleepHours <= 9.5;
        const isSunDone = !!log.habitsCompleted?.['sunlight'];
        const isProteinHit = log.totalProteinLogged >= targetProtein && targetProtein > 0;
        const isCaffeineClean = ritual?.caffeineStatus === 'none' || ritual?.caffeineStatus === 'before_cutoff' || !!ritual?.caffeineCutoffRespected;
        if (isSleepOptimal && isSunDone && isProteinHit && isCaffeineClean && get().isLedgerSealedByDate[targetDate]) {
          get().unlockTrophy('flawless_biometrics');
        }

        // 15. Deep Recovery Sleep (7.5h+ across 5 logs)
        const deepSleepCount = Object.values(logs).filter((l) => (l.sleepHours || 0) >= 7.5).length;
        if (deepSleepCount >= 5) {
          get().unlockTrophy('deep_recovery_7h');
        }

        // 16. Adenosine Sentinel (Caffeine cutoff respected across 5 days)
        const cleanCaffeineCount = Object.values(get().deskRitualsByDate).filter(
          (r) => r.caffeineCutoffRespected || r.caffeineStatus === 'none' || r.caffeineStatus === 'before_cutoff'
        ).length;
        if (cleanCaffeineCount >= 5) {
          get().unlockTrophy('caffeine_gate');
        }

        // 17. Movement / Custom Levers
        if (profile?.customHabitSlot && log.habitsCompleted?.[profile.customHabitSlot]) {
          if (profile.customHabitSlot === 'steps_10k' || profile.customHabitSlot === 'zone2_walk') {
            get().unlockTrophy('zone2_pathfinder');
          } else if (profile.customHabitSlot === 'cold_shower') {
            get().unlockTrophy('cold_plunge_glaze');
          } else if (profile.customHabitSlot === 'screens_off') {
            get().unlockTrophy('screens_off_sentry');
          }
        }
      },
    }),
    {
      name: 'cyath-habit-store-v2',
      partialize: (state) => {
        if (!state.userSession || state.userSession.id.startsWith('guest_')) {
          return {
            userSession: state.userSession,
            userProfile: state.userProfile,
            habits: state.habits,
            activeProtocolIds: state.activeProtocolIds,
            logsByDate: state.logsByDate,
            streakCount: state.streakCount,
            streakFreezeStock: state.streakFreezeStock,
            claimedMilestones: state.claimedMilestones,
            totalXp: state.totalXp,
            xpHistory: state.xpHistory,
            completedQuestIdsByDate: state.completedQuestIdsByDate,
            pendingAction: state.pendingAction,
            currentDate: state.currentDate,
            customRecipes: state.customRecipes,
            weightHistory: state.weightHistory,
            socialQuests: state.socialQuests,
            isForgedStreak: state.isForgedStreak,
            isLedgerSealedByDate: state.isLedgerSealedByDate,
            unlockedTrophies: state.unlockedTrophies,
            trophyCounts: state.trophyCounts,
            suiteXp: state.suiteXp,
          };
        }
        return state;
      },
    }
  )
);
