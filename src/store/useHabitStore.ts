import { create } from 'zustand';

interface HabitState {
  date: string;
  habitsCompleted: Record<string, boolean>;
  totalProteinLogged: number;
  sleepHours: number;
  energyLevel: number;
  moodScore: number;
  
  toggleHabit: (habitId: string) => void;
  setProtein: (amount: number) => void;
  setSleep: (hours: number) => void;
  setEnergy: (level: number) => void;
  setMood: (score: number) => void;
}

export const useHabitStore = create<HabitState>((set) => ({
  date: new Date().toISOString().split('T')[0],
  habitsCompleted: {},
  totalProteinLogged: 0,
  sleepHours: 0,
  energyLevel: 5,
  moodScore: 5,

  toggleHabit: (habitId) => set((state) => ({
    habitsCompleted: {
      ...state.habitsCompleted,
      [habitId]: !state.habitsCompleted[habitId]
    }
  })),
  setProtein: (amount) => set({ totalProteinLogged: amount }),
  setSleep: (hours) => set({ sleepHours: hours }),
  setEnergy: (level) => set({ energyLevel: level }),
  setMood: (score) => set({ moodScore: score }),
}));
