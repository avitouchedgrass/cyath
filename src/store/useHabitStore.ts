import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import {
  XP_AWARDS,
  GOALS,
  STREAK_FREEZE,
} from '@/lib/progression/config';
import {
  calculateLevel,
  calculateStreakStatus,
  getDailyQuests,
} from '@/lib/progression/engine';
import { progressionEvents } from '@/lib/progression/events';
import { retroAudio } from '@/lib/retroAudio';

export interface HabitItem {
  id: string;
  title: string;
  category: 'morning' | 'nutrition' | 'movement' | 'recovery' | 'mindset' | 'custom';
  targetDaysPerWeek: number;
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
}

export interface XpHistoryItem {
  id: string;
  amount: number;
  reason: string;
  timestamp: string;
}

export const DEFAULT_HABITS: HabitItem[] = [
  { id: 'sunlight', title: 'Morning Sunlight & Electrolytes (15m)', category: 'morning', targetDaysPerWeek: 7 },
  { id: 'protein_target', title: 'Hit Daily Protein Target (120g+)', category: 'nutrition', targetDaysPerWeek: 7 },
  { id: 'movement', title: 'Zone 2 Cardio or Heavy Resistance', category: 'movement', targetDaysPerWeek: 5 },
  { id: 'hydration', title: 'Hydration Target (2.5L+ Pure Water)', category: 'nutrition', targetDaysPerWeek: 7 },
  { id: 'digital_sunset', title: 'Digital Sunset & 8h Dark Sleep', category: 'recovery', targetDaysPerWeek: 7 },
  { id: 'mobility', title: 'Thoracic Mobility & Cold Shower', category: 'recovery', targetDaysPerWeek: 6 },
];

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
  userSession: { id: string; email?: string } | null;
  userProfile: UserProfile | null;
  pendingAction: PendingUserAction | null;

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
  logRecipeToDay: (recipeId: string, protein: number, calories: number, date?: string) => void;
  removeRecipeFromDay: (recipeId: string, protein: number, calories: number, date?: string) => void;
  gainXp: (amount: number, reason: string, source?: string) => { oldLevel: number; newLevel: number; leveledUp: boolean };
  claimQuest: (questId: string, date?: string) => void;
  getDailyLog: (date?: string) => DailyLogData;
  syncWithSupabase: (date?: string) => Promise<void>;
  initDemoSession: () => void;
  deleteAccountData: () => Promise<void>;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

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
});

export const useHabitStore = create<HabitStoreState>()(
  persist(
    (set, get) => ({
      currentDate: getTodayString(),
      habits: DEFAULT_HABITS,
      logsByDate: {
        [getTodayString()]: createEmptyDailyLog(),
      },
      totalXp: 180,
      streakCount: 5,
      streakFreezeStock: 1,
      claimedMilestones: [3],
      completedQuestIdsByDate: {},
      xpHistory: [
        { id: 'initial_1', amount: 15, reason: 'Habit Completed', timestamp: new Date().toISOString() },
        { id: 'initial_2', amount: 25, reason: 'Dawn Ignition Quest', timestamp: new Date().toISOString() },
      ],
      isSyncing: false,
      activeProtocolIds: ['morning-activation', 'deep-rem-sleep'],
      userSession: null,
      userProfile: null,
      pendingAction: null,

      setDate: (date) => set({ currentDate: date }),

      setUserSession: (session) => {
        set({ userSession: session });
        if (session && !session.id.startsWith('guest_')) {
          get().reconcileUserSession(session);
        }
      },

      reconcileUserSession: async (session) => {
        if (!session || session.id.startsWith('guest_')) return;
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('total_xp, streak_count, streak_freeze_stock, full_name, age, sex, height_cm, weight_kg, primary_goal, allergies, dietary_restrictions, onboarding_completed')
            .eq('user_id', session.id)
            .maybeSingle();

          if (profile) {
            const remoteXp = profile.total_xp ?? 0;
            const currentLocalXp = get().totalXp;
            const finalXp = Math.max(remoteXp, currentLocalXp);

            set({
              totalXp: finalXp,
              streakCount: Math.max(profile.streak_count ?? 0, get().streakCount),
              streakFreezeStock: Math.min(STREAK_FREEZE.maxStock, profile.streak_freeze_stock ?? get().streakFreezeStock),
              userProfile: {
                fullName: profile.full_name ?? '',
                age: profile.age ?? 25,
                sex: profile.sex ?? 'other',
                heightCm: profile.height_cm ?? 175,
                weightKg: profile.weight_kg ?? 70,
                primaryGoal: profile.primary_goal ?? 'focus',
                allergies: profile.allergies ?? [],
                dietaryRestrictions: profile.dietary_restrictions ?? [],
                onboardingCompleted: profile.onboarding_completed ?? false,
              },
            });

            if (finalXp > remoteXp) {
              await supabase
                .from('user_profiles')
                .update({ total_xp: finalXp })
                .eq('user_id', session.id);
            }
          }
        } catch {
          // Graceful fallback to local state
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

        const updated = { ...current, ...profile };
        set({ userProfile: updated });

        const userId = get().userSession?.id;
        if (userId && !userId.startsWith('guest_')) {
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
      },

      getDailyLog: (date) => {
        const targetDate = date || get().currentDate;
        return get().logsByDate[targetDate] || createEmptyDailyLog();
      },

      gainXp: (amount, reason, source = 'app') => {
        const currentXp = get().totalXp;
        const newXp = Math.max(0, currentXp + amount);
        const oldLevelInfo = calculateLevel(currentXp);
        const newLevelInfo = calculateLevel(newXp);
        const leveledUp = newLevelInfo.level > oldLevelInfo.level;

        const newHistoryItem: XpHistoryItem = {
          id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          amount,
          reason,
          timestamp: new Date().toISOString(),
        };

        const updatedHistory = [newHistoryItem, ...get().xpHistory].slice(0, 25);

        set({
          totalXp: newXp,
          xpHistory: updatedHistory,
        });

        progressionEvents.emit('xp:gained', {
          amount,
          reason,
          totalXp: newXp,
        });

        if (leveledUp) {
          retroAudio.playTierUpgrade();
          progressionEvents.emit('level:up', {
            oldLevel: oldLevelInfo.level,
            newLevel: newLevelInfo.level,
            title: newLevelInfo.title,
            unlockedTitle: newLevelInfo.title !== oldLevelInfo.title ? newLevelInfo.title : undefined,
          });
        }

        const userId = get().userSession?.id;
        if (userId && !userId.startsWith('guest_')) {
          (async () => {
            try {
              await supabase.from('user_profiles').update({
                total_xp: newXp,
                updated_at: new Date().toISOString(),
              }).eq('user_id', userId);

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

      toggleHabit: (habitId, date) => {
        const targetDate = date || get().currentDate;
        const currentLog = get().logsByDate[targetDate] || createEmptyDailyLog();
        const willBeDone = !currentLog.habitsCompleted[habitId];
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

        if (willBeDone) {
          get().gainXp(XP_AWARDS.habitComplete, 'Habit Completed', 'habit');

          const allDone = get().habits.length > 0 && get().habits.every((h) => updatedHabits[h.id]);
          if (allDone) {
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
        set((state) => ({
          habits: [...state.habits, newHabit],
        }));
      },

      deleteHabit: (habitId) => {
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== habitId),
        }));
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

        if (prevProtein < GOALS.proteinGrams && safeAmount >= GOALS.proteinGrams) {
          get().gainXp(XP_AWARDS.proteinGoal, 'Protein Target Reached (120g+)', 'nutrition');
        } else if (prevProtein < GOALS.proteinGrams / 2 && safeAmount >= GOALS.proteinGrams / 2 && safeAmount < GOALS.proteinGrams) {
          get().gainXp(XP_AWARDS.proteinPartial, 'Protein Milestone (60g+)', 'nutrition');
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

        if (prevHydration < GOALS.hydrationLiters && safeLiters >= GOALS.hydrationLiters) {
          get().gainXp(XP_AWARDS.hydrationGoal, 'Hydration Target Achieved (2.0L+)', 'hydration');
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

        if (prevSleep < GOALS.sleepHours && hours >= GOALS.sleepHours) {
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

      logRecipeToDay: (recipeId, protein, calories, date) => {
        const targetDate = date || get().currentDate;
        const currentLog = get().logsByDate[targetDate] || createEmptyDailyLog();
        const updatedRecipes = [...currentLog.loggedRecipeIds, recipeId];

        set((state) => ({
          logsByDate: {
            ...state.logsByDate,
            [targetDate]: {
              ...currentLog,
              totalProteinLogged: currentLog.totalProteinLogged + protein,
              totalCaloriesLogged: currentLog.totalCaloriesLogged + calories,
              loggedRecipeIds: updatedRecipes,
            },
          },
        }));

        get().gainXp(XP_AWARDS.recipeLogged, 'Whole Food Dish Prepared', 'recipe');
        get().syncWithSupabase(targetDate);
      },

      removeRecipeFromDay: (recipeId, protein, calories, date) => {
        const targetDate = date || get().currentDate;
        const currentLog = get().logsByDate[targetDate] || createEmptyDailyLog();
        const index = currentLog.loggedRecipeIds.indexOf(recipeId);
        if (index === -1) return;

        const updatedRecipes = [...currentLog.loggedRecipeIds];
        updatedRecipes.splice(index, 1);

        set((state) => ({
          logsByDate: {
            ...state.logsByDate,
            [targetDate]: {
              ...currentLog,
              totalProteinLogged: Math.max(0, currentLog.totalProteinLogged - protein),
              totalCaloriesLogged: Math.max(0, currentLog.totalCaloriesLogged - calories),
              loggedRecipeIds: updatedRecipes,
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
            habits_completed: log.habitsCompleted,
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
          totalXp: 1450,
          streakCount: 5,
          streakFreezeStock: 1,
          claimedMilestones: [3],
          completedQuestIdsByDate: {},
          xpHistory: [
            { id: 'd1', amount: 50, reason: 'Streak Milestone: Kindling', timestamp: new Date().toISOString() },
            { id: 'd2', amount: 30, reason: 'Quest: Structural Synthesis', timestamp: new Date().toISOString() },
            { id: 'd3', amount: 20, reason: 'Whole Food Dish Prepared', timestamp: new Date().toISOString() },
          ],
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
              loggedRecipeIds: ['steak-eggs-skillet'],
            },
          },
          pendingAction: null,
        });
      },

      deleteAccountData: async () => {
        const userId = get().userSession?.id;
        if (userId && !userId.startsWith('guest_')) {
          try {
            await supabase.from('daily_logs').delete().eq('user_id', userId);
            await supabase.from('xp_events').delete().eq('user_id', userId);
            await supabase.from('user_profiles').delete().eq('user_id', userId);
            await supabase.auth.signOut();
          } catch (err) {
            console.error('Failed to clear remote account data:', err);
          }
        }
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
        });
      },
    }),
    {
      name: 'cyath-habit-store-v2',
      partialize: (state) => {
        if (state.userSession?.id.startsWith('guest_')) {
          return {
            userSession: null,
            userProfile: null,
            habits: DEFAULT_HABITS,
            activeProtocolIds: ['morning-activation', 'deep-rem-sleep'],
            logsByDate: { [getTodayString()]: createEmptyDailyLog() },
            streakCount: 0,
            streakFreezeStock: 1,
            claimedMilestones: [],
            totalXp: 0,
            xpHistory: [],
            completedQuestIdsByDate: {},
            pendingAction: null,
            currentDate: state.currentDate,
          };
        }
        return state;
      },
    }
  )
);
