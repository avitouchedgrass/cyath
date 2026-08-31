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
import { Recipe } from '@/lib/recipes';

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
  customRecipes: Recipe[];
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
  addCustomRecipe: (recipe: Recipe) => void;
  updateCustomRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteCustomRecipe: (id: string) => void;
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

interface UserLocalProgressData {
  totalXp: number;
  streakCount: number;
  streakFreezeStock: number;
  claimedMilestones: number[];
  completedQuestIdsByDate: Record<string, string[]>;
  xpHistory: XpHistoryItem[];
  logsByDate?: Record<string, DailyLogData>;
  customRecipes?: Recipe[];
  userProfile?: UserProfile | null;
  habits?: HabitItem[];
}

const saveUserLocalProgress = (userId: string, data: Partial<UserLocalProgressData>) => {
  if (typeof window === 'undefined' || !userId || userId.startsWith('guest_')) return;
  try {
    const raw = localStorage.getItem(`cyath_user_progression_${userId}`);
    const existing: Partial<UserLocalProgressData> = raw ? JSON.parse(raw) : {};
    const merged: UserLocalProgressData = {
      totalXp: data.totalXp !== undefined ? data.totalXp : (existing.totalXp ?? 0),
      streakCount: data.streakCount !== undefined ? data.streakCount : (existing.streakCount ?? 0),
      streakFreezeStock: data.streakFreezeStock !== undefined ? data.streakFreezeStock : (existing.streakFreezeStock ?? 1),
      claimedMilestones: data.claimedMilestones !== undefined ? data.claimedMilestones : (existing.claimedMilestones ?? []),
      completedQuestIdsByDate: data.completedQuestIdsByDate !== undefined ? data.completedQuestIdsByDate : (existing.completedQuestIdsByDate ?? {}),
      xpHistory: data.xpHistory !== undefined ? data.xpHistory : (existing.xpHistory ?? []),
      logsByDate: data.logsByDate !== undefined ? data.logsByDate : (existing.logsByDate ?? {}),
      customRecipes: data.customRecipes !== undefined ? data.customRecipes : (existing.customRecipes ?? []),
      userProfile: data.userProfile !== undefined ? data.userProfile : (existing.userProfile ?? null),
      habits: data.habits !== undefined ? data.habits : (existing.habits ?? DEFAULT_HABITS),
    };
    localStorage.setItem(`cyath_user_progression_${userId}`, JSON.stringify(merged));
  } catch {}
};

const getUserLocalProgress = (userId: string): UserLocalProgressData | null => {
  if (typeof window === 'undefined' || !userId || userId.startsWith('guest_')) return null;
  try {
    const raw = localStorage.getItem(`cyath_user_progression_${userId}`);
    return raw ? JSON.parse(raw) : null;
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
          });
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
              ...(cached.logsByDate ? { logsByDate: cached.logsByDate } : {}),
              ...(cached.userProfile ? { userProfile: cached.userProfile } : {}),
            });
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
            logsByDate: { [getTodayString()]: createEmptyDailyLog() },
          });
        }
      },

      reconcileUserSession: async (session) => {
        if (!session || session.id.startsWith('guest_')) return;
        try {
          const cached = getUserLocalProgress(session.id);
          const currentLocalXp = cached?.totalXp ?? get().totalXp;
          const currentLocalStreak = cached?.streakCount ?? get().streakCount;
          const currentLocalFreeze = cached?.streakFreezeStock ?? get().streakFreezeStock;
          const currentLocalProfile = cached?.userProfile ?? get().userProfile;
          const currentLocalRecipes = cached?.customRecipes ?? get().customRecipes;
          const currentLocalHabits = cached?.habits && cached.habits.length > 0 ? cached.habits : get().habits;

          // 1. Fetch remote user profile
          const { data: profile, error: profileErr } = await supabase
            .from('user_profiles')
            .select('total_xp, streak_count, streak_freeze_stock, full_name, age, sex, height_cm, weight_kg, primary_goal, allergies, dietary_restrictions, onboarding_completed')
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

          // Merge daily logs if remote logs exist
          const mergedLogs = { ...get().logsByDate };
          if (remoteLogs && remoteLogs.length > 0) {
            remoteLogs.forEach((l) => {
              mergedLogs[l.log_date] = {
                habitsCompleted: l.habits_completed || {},
                totalProteinLogged: Number(l.total_protein || 0),
                totalCaloriesLogged: Number(l.total_calories || 0),
                hydrationLiters: Number(l.hydration_liters || 0),
                sleepHours: Number(l.sleep_hours || 7.5),
                energyLevel: l.energy_level || 7,
                moodScore: l.mood_score || 7,
                notes: l.notes || '',
                loggedRecipeIds: l.logged_recipes || [],
              };
            });
          }

          if (profile) {
            const remoteXp = profile.total_xp ?? 0;
            const finalXp = Math.max(remoteXp, currentLocalXp);
            const finalStreak = Math.max(profile.streak_count ?? 0, currentLocalStreak);
            const finalFreeze = Math.min(STREAK_FREEZE.maxStock, Math.max(profile.streak_freeze_stock ?? 0, currentLocalFreeze));
            const isOnboardingDone = profile.onboarding_completed || currentLocalProfile?.onboardingCompleted || false;

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
            };

            set({
              totalXp: finalXp,
              streakCount: finalStreak,
              streakFreezeStock: finalFreeze,
              customRecipes: finalRecipes,
              logsByDate: mergedLogs,
              userProfile: finalProfile,
              habits: currentLocalHabits,
            });

            saveUserLocalProgress(session.id, {
              totalXp: finalXp,
              streakCount: finalStreak,
              streakFreezeStock: finalFreeze,
              claimedMilestones: get().claimedMilestones,
              completedQuestIdsByDate: get().completedQuestIdsByDate,
              xpHistory: get().xpHistory,
              logsByDate: mergedLogs,
              customRecipes: finalRecipes,
              userProfile: finalProfile,
              habits: currentLocalHabits,
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
                    full_name: finalProfile.fullName,
                    updated_at: new Date().toISOString(),
                  }, { onConflict: 'user_id' });
              } catch {}
            }
          } else if (!profileErr && (currentLocalXp > 0 || currentLocalProfile?.onboardingCompleted)) {
            // Profile row missing in Supabase, but user has accumulated progress: create it now
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
              customRecipes: finalRecipes,
              userProfile: currentLocalProfile,
              habits: currentLocalHabits,
            });
            saveUserLocalProgress(session.id, {
              customRecipes: finalRecipes,
              userProfile: currentLocalProfile,
              habits: currentLocalHabits,
            });
          } else {
            // If table query returned error (e.g. table not created yet) OR user already has local progress, DO NOT WIPE!
            if (currentLocalProfile || currentLocalXp > 0 || currentLocalRecipes.length > 0 || currentLocalHabits.length > 0) {
              set({
                totalXp: currentLocalXp,
                streakCount: currentLocalStreak,
                streakFreezeStock: currentLocalFreeze,
                customRecipes: finalRecipes,
                userProfile: currentLocalProfile,
                habits: currentLocalHabits,
              });
              saveUserLocalProgress(session.id, {
                customRecipes: finalRecipes,
                userProfile: currentLocalProfile,
                habits: currentLocalHabits,
              });
            } else if (!profileErr) {
              // Only truly fresh account with zero error
              set({
                totalXp: 0,
                streakCount: 0,
                streakFreezeStock: 1,
                claimedMilestones: [],
                completedQuestIdsByDate: {},
                xpHistory: [],
                customRecipes: [],
                habits: DEFAULT_HABITS,
              });
            }
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

        const updated = { ...current, ...profile };
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

        const session = get().userSession;
        if (session && !session.id.startsWith('guest_')) {
          saveUserLocalProgress(session.id, { habits: updatedHabits });
        }
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
        set({ habits: updated });

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

        const hadSleep = prevSleep >= GOALS.sleepHours;
        const nowSleep = hours >= GOALS.sleepHours;

        if (!hadSleep && nowSleep) {
          get().gainXp(XP_AWARDS.sleepGoal, 'Sleep Restoration Goal (7h+)', 'sleep');
        } else if (hadSleep && !nowSleep) {
          get().gainXp(-XP_AWARDS.sleepGoal, 'Sleep Goal Revoked', 'sleep');
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
        const updated = [recipe, ...get().customRecipes.filter((r) => r.id !== recipe.id)];
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

          saveUserLocalProgress(userId, {
            totalXp: get().totalXp,
            streakCount: get().streakCount,
            streakFreezeStock: get().streakFreezeStock,
            claimedMilestones: get().claimedMilestones,
            completedQuestIdsByDate: get().completedQuestIdsByDate,
            xpHistory: get().xpHistory,
            logsByDate: get().logsByDate,
            customRecipes: get().customRecipes,
            userProfile: get().userProfile,
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
        if (userId && !userId.startsWith('guest_')) {
          try {
            await supabase.from('daily_logs').delete().eq('user_id', userId);
            await supabase.from('xp_events').delete().eq('user_id', userId);
            await supabase.from('custom_recipes').delete().eq('user_id', userId);
            await supabase.from('habits').delete().eq('user_id', userId);
            await supabase.from('user_profiles').delete().eq('user_id', userId);
            await supabase.auth.signOut();
          } catch (err) {
            console.error('Failed to clear remote account data:', err);
          }
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem(`cyath_user_progression_${userId}`);
            } catch {}
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
          customRecipes: [],
        });
      },
    }),
    {
      name: 'cyath-habit-store-v2',
      partialize: (state) => {
        if (!state.userSession || state.userSession.id.startsWith('guest_')) {
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
            customRecipes: [],
          };
        }
        return state;
      },
    }
  )
);
