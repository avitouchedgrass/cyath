import {
  MAX_LEVEL,
  xpToReachLevel,
  TITLE_RANKS,
  STREAK_MILESTONES,
  STREAK_FREEZE,
  DAILY_QUEST_POOL,
  StreakMilestone,
} from './config';
import type { DailyLogData, HabitItem } from '@/store/useHabitStore';

export interface LevelProgress {
  level: number;
  currentLevelXp: number;
  xpForNextLevel: number;
  totalXp: number;
  progressPercent: number;
  title: string;
  nextTitle?: string;
  isMaxLevel: boolean;
}

export function calculateLevel(totalXp: number): LevelProgress {
  const safeXp = Math.max(0, Math.round(totalXp));

  let currentLevel = 1;
  for (let lvl = 1; lvl <= MAX_LEVEL; lvl++) {
    if (safeXp >= xpToReachLevel(lvl)) {
      currentLevel = lvl;
    } else {
      break;
    }
  }

  const currentRank = TITLE_RANKS.find((r) => currentLevel >= r.minLevel) ?? TITLE_RANKS[TITLE_RANKS.length - 1];
  const higherRanks = TITLE_RANKS.filter((r) => r.minLevel > currentLevel).sort((a, b) => a.minLevel - b.minLevel);
  const nextRank = higherRanks[0];

  if (currentLevel >= MAX_LEVEL) {
    const levelFloor = xpToReachLevel(MAX_LEVEL);
    return {
      level: MAX_LEVEL,
      currentLevelXp: safeXp - levelFloor,
      xpForNextLevel: 0,
      totalXp: safeXp,
      progressPercent: 100,
      title: currentRank.name,
      nextTitle: undefined,
      isMaxLevel: true,
    };
  }

  const currentFloor = xpToReachLevel(currentLevel);
  const nextFloor = xpToReachLevel(currentLevel + 1);
  const xpNeeded = nextFloor - currentFloor;
  const xpIntoLevel = safeXp - currentFloor;
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpIntoLevel / xpNeeded) * 100)));

  return {
    level: currentLevel,
    currentLevelXp: xpIntoLevel,
    xpForNextLevel: xpNeeded,
    totalXp: safeXp,
    progressPercent,
    title: currentRank.name,
    nextTitle: nextRank?.name,
    isMaxLevel: false,
  };
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  xpAward: number;
  category: 'nutrition' | 'habits' | 'recovery' | 'activity';
  progress: number;
  target: number;
  unit: string;
  completed: boolean;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getDailyQuests(
  dateStr: string,
  log?: DailyLogData,
  habits?: HabitItem[]
): DailyQuest[] {
  const seed = hashString(dateStr);
  const total = DAILY_QUEST_POOL.length;
  
  const idx1 = seed % total;
  const idx2 = (seed + 2) % total;
  const idx3 = (seed + 5) % total;

  const chosenIndices = Array.from(new Set([idx1, idx2, idx3]));
  while (chosenIndices.length < 3) {
    const fallback = (chosenIndices[chosenIndices.length - 1] + 1) % total;
    if (!chosenIndices.includes(fallback)) chosenIndices.push(fallback);
  }

  return chosenIndices.map((idx) => {
    const template = DAILY_QUEST_POOL[idx];
    let progress = 0;

    if (template.id === 'morning_activation') {
      progress = log?.habitsCompleted['sunlight'] ? 1 : 0;
    } else if (template.id === 'protein_target') {
      progress = Math.min(template.target, log?.totalProteinLogged ?? 0);
    } else if (template.id === 'hydration_flow') {
      progress = Math.min(template.target, log?.hydrationLiters ?? 0);
    } else if (template.id === 'sleep_restoration') {
      progress = Math.min(template.target, log?.sleepHours ?? 0);
    } else if (template.id === 'habit_trio') {
      progress = Math.min(template.target, Object.values(log?.habitsCompleted ?? {}).filter(Boolean).length);
    } else if (template.id === 'recipe_craft') {
      progress = Math.min(template.target, log?.loggedRecipeIds?.length ?? 0);
    } else if (template.id === 'flawless_habits') {
      const allDone = Boolean(habits && habits.length > 0 && habits.every((h) => log?.habitsCompleted[h.id]));
      progress = allDone ? 1 : 0;
    }

    return {
      ...template,
      progress,
      completed: progress >= template.target,
    };
  });
}

export interface StreakStatus {
  currentStreak: number;
  freezeStock: number;
  freezeUsedYesterday: boolean;
  nextMilestone: StreakMilestone | null;
  daysToNextMilestone: number;
  milestoneAchievedToday: StreakMilestone | null;
}

export function calculateStreakStatus(
  logsByDate: Record<string, DailyLogData>,
  todayStr: string,
  currentFreezeStock: number
): StreakStatus {
  let streak = 0;
  let freezeStock = Math.min(STREAK_FREEZE.maxStock, Math.max(0, currentFreezeStock));
  let freezeUsedYesterday = false;

  const today = new Date(todayStr);
  const isActionTaken = (log?: DailyLogData): boolean => {
    if (!log) return false;
    const habitsCount = Object.values(log.habitsCompleted ?? {}).filter(Boolean).length;
    return habitsCount > 0 || (log.totalProteinLogged ?? 0) > 0 || (log.hydrationLiters ?? 0) > 0;
  };

  const todayLog = logsByDate[todayStr];
  const activeToday = isActionTaken(todayLog);

  let checkDate = new Date(today);
  if (!activeToday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  let streakAlive = true;
  let dayOffset = 0;

  while (streakAlive && dayOffset < 365) {
    const d = new Date(checkDate);
    d.setDate(d.getDate() - dayOffset);
    const dateKey = d.toISOString().split('T')[0];
    const log = logsByDate[dateKey];

    if (isActionTaken(log)) {
      streak++;
    } else {
      const dayBefore = new Date(d);
      dayBefore.setDate(dayBefore.getDate() - 1);
      const dayBeforeKey = dayBefore.toISOString().split('T')[0];
      const hadActivityBefore = isActionTaken(logsByDate[dayBeforeKey]);

      if (hadActivityBefore && freezeStock > 0 && !freezeUsedYesterday) {
        freezeStock--;
        freezeUsedYesterday = true;
        streak++;
      } else {
        streakAlive = false;
      }
    }
    dayOffset++;
  }

  const nextMilestone = STREAK_MILESTONES.find((m) => m.days > streak) ?? null;
  const daysToNextMilestone = nextMilestone ? nextMilestone.days - streak : 0;
  const milestoneAchievedToday = STREAK_MILESTONES.find((m) => m.days === streak) ?? null;

  return {
    currentStreak: streak,
    freezeStock,
    freezeUsedYesterday,
    nextMilestone,
    daysToNextMilestone,
    milestoneAchievedToday,
  };
}
