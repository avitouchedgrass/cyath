import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

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
  energyLevel: number; // 1 - 10
  moodScore: number;   // 1 - 10
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

export const DEFAULT_HABITS: HabitItem[] = [
  { id: 'sunlight', title: 'Morning Sunlight & Electrolytes (15m)', category: 'morning', targetDaysPerWeek: 7 },
  { id: 'protein_target', title: 'Hit Daily Protein Target (120g+)', category: 'nutrition', targetDaysPerWeek: 7 },
  { id: 'movement', title: 'Zone 2 Cardio or Heavy Resistance', category: 'movement', targetDaysPerWeek: 5 },
  { id: 'hydration', title: 'Hydration Target (2.5L+ Pure Water)', category: 'nutrition', targetDaysPerWeek: 7 },
  { id: 'digital_sunset', title: 'Digital Sunset & 8h Dark Sleep', category: 'recovery', targetDaysPerWeek: 7 },
  { id: 'mobility', title: 'Thoracic Mobility & Cold Shower', category: 'recovery', targetDaysPerWeek: 6 },
];

export interface HabitStoreState {
  currentDate: string; // YYYY-MM-DD
  habits: HabitItem[];
  logsByDate: Record<string, DailyLogData>;
  streakCount: number;
  isSyncing: boolean;
  activeProtocolIds: string[];
  userSession: { id: string; email?: string } | null;
  userProfile: UserProfile | null;
  pendingAction: PendingUserAction | null;

  // Actions
  setDate: (date: string) => void;
  setUserSession: (session: { id: string; email?: string } | null) => void;
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
  getDailyLog: (date?: string) => DailyLogData;
  syncWithSupabase: (date?: string) => Promise<void>;
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
      streakCount: 5,
      isSyncing: false,
      activeProtocolIds: ['morning-activation', 'deep-rem-sleep'],
      userSession: null,
      userProfile: null,
      pendingAction: null,

      setDate: (date) => set({ currentDate: date }),

      setUserSession: (session) => set({ userSession: session }),

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

        // Sync with Supabase user_profiles if user is signed in
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

        // If activating and habits are provided, merge any missing habits
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

      toggleHabit: (habitId, date) => {
        const targetDate = date || get().currentDate;
        const currentLog = get().logsByDate[targetDate] || createEmptyDailyLog();
        const updatedHabits = {
          ...currentLog.habitsCompleted,
          [habitId]: !currentLog.habitsCompleted[habitId],
        };

        set((state) => ({
          logsByDate: {
            ...state.logsByDate,
            [targetDate]: {
              ...currentLog,
              habitsCompleted: updatedHabits,
            },
          },
        }));

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
        set((state) => ({
          logsByDate: {
            ...state.logsByDate,
            [targetDate]: { ...currentLog, totalProteinLogged: Math.max(0, amount) },
          },
        }));
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
        set((state) => ({
          logsByDate: {
            ...state.logsByDate,
            [targetDate]: { ...currentLog, hydrationLiters: Math.max(0, Math.round(liters * 100) / 100) },
          },
        }));
        get().syncWithSupabase(targetDate);
      },

      setSleep: (hours, date) => {
        const targetDate = date || get().currentDate;
        const currentLog = get().logsByDate[targetDate] || createEmptyDailyLog();
        set((state) => ({
          logsByDate: {
            ...state.logsByDate,
            [targetDate]: { ...currentLog, sleepHours: hours },
          },
        }));
        get().syncWithSupabase(targetDate);
      },

      setEnergy: (level, date) => {
        const targetDate = date || get().currentDate;
        const currentLog = get().logsByDate[targetDate] || createEmptyDailyLog();
        set((state) => ({
          logsByDate: {
            ...state.logsByDate,
            [targetDate]: { ...currentLog, energyLevel: level },
          },
        }));
        get().syncWithSupabase(targetDate);
      },

      setMood: (score, date) => {
        const targetDate = date || get().currentDate;
        const currentLog = get().logsByDate[targetDate] || createEmptyDailyLog();
        set((state) => ({
          logsByDate: {
            ...state.logsByDate,
            [targetDate]: { ...currentLog, moodScore: score },
          },
        }));
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

        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            set({ userSession: { id: session.user.id, email: session.user.email } });
          } else if (!get().userSession) {
            return;
          }

          const userId = session?.user?.id || get().userSession?.id;
          if (!userId) return;

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
        } catch {
          // Graceful fallback to local persistence
        } finally {
          set({ isSyncing: false });
        }
      },

      deleteAccountData: async () => {
        const userId = get().userSession?.id;
        if (userId && !userId.startsWith('guest_')) {
          try {
            await supabase.from('daily_logs').delete().eq('user_id', userId);
            await supabase.from('user_profiles').delete().eq('user_id', userId);
            await supabase.auth.signOut();
          } catch (err) {
            console.error('Failed to clear remote account data:', err);
          }
        }
        set({
          userSession: null,
          userProfile: null,
          logsByDate: { [getTodayString()]: createEmptyDailyLog() },
          habits: DEFAULT_HABITS,
          activeProtocolIds: ['morning-activation', 'deep-rem-sleep'],
          streakCount: 0,
          pendingAction: null,
        });
      },
    }),
    {
      name: 'cyath-habit-store-v2',
    }
  )
);
