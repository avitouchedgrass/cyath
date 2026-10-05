export interface DebriefQuestion {
  id: string;
  title: string;
  category: 'circadian' | 'fuel' | 'movement' | 'recovery' | 'life' | 'lifestyle' | 'custom';
  prompt: string;
  type: 'time_range' | 'boolean' | 'boolean_with_fuel' | 'boolean_with_time';
  isDefault: boolean;
  enabled: boolean;
  xpReward: number;
  scientificContext: string;
  chipsYes?: string[];
  chipsNo?: string[];
  followUpPromptYes?: string;
  followUpPromptNo?: string;
  aiCompliment?: string;
}

export const DEFAULT_DEBRIEF_QUESTIONS: DebriefQuestion[] = [
  {
    id: 'sleep_wake',
    title: 'Sleep & Wake Time',
    category: 'circadian',
    prompt: 'What time did you sleep yesterday & wake up today?',
    type: 'time_range',
    isDefault: true,
    enabled: true,
    xpReward: 35,
    scientificContext: 'Consistent sleep duration restores daily mental clarity and stabilizes morning energy levels.',
  },
  {
    id: 'sunlight',
    title: 'Morning Sunlight',
    category: 'circadian',
    prompt: 'Did you get 10+ minutes of outdoor morning sunlight?',
    type: 'boolean',
    isDefault: true,
    enabled: true,
    xpReward: 35,
    scientificContext: 'Morning light resets your internal body clock and triggers natural daytime alertness.',
  },
  {
    id: 'breakfast_protein',
    title: 'Breakfast Protein',
    category: 'fuel',
    prompt: 'Did you hit your breakfast protein target (30g+)?',
    type: 'boolean_with_fuel',
    isDefault: true,
    enabled: true,
    xpReward: 40,
    scientificContext: 'Morning protein balances blood sugar and prevents sudden mid-morning energy crashes.',
    followUpPromptYes: 'What did you eat?',
    followUpPromptNo: 'What did you have instead?',
    chipsYes: ['Cast-Iron Eggs', 'Avocado Omelet', 'Greek Yogurt Bowl', 'Protein Oats', 'Tofu Scramble', 'Ate My Own'],
    chipsNo: ['Fasted / Coffee only', 'Light snack', 'Carb pastry', 'Skipped breakfast'],
  },
  {
    id: 'lunch_protein',
    title: 'Lunch Protein',
    category: 'fuel',
    prompt: 'Did you have a high-protein lunch (40g+)?',
    type: 'boolean_with_fuel',
    isDefault: true,
    enabled: true,
    xpReward: 40,
    scientificContext: 'Protein and fiber at lunch stabilize glucose levels and eliminate the 2 PM afternoon slump.',
    followUpPromptYes: 'What did you eat?',
    followUpPromptNo: 'What did you have instead?',
    chipsYes: ['Herb Grilled Chicken', 'Turkey & Sweet Potato', 'Salmon & Veggies', 'Ancient Grains & Tofu', 'Steak & Quinoa', 'Ate My Own'],
    chipsNo: ['Quick sandwich', 'Fast food / Takeout', 'Light salad / soup', 'Skipped lunch'],
  },
  {
    id: 'dinner_protein',
    title: 'Dinner Protein',
    category: 'fuel',
    prompt: 'Did you hit your dinner protein target (35g+)?',
    type: 'boolean_with_fuel',
    isDefault: true,
    enabled: true,
    xpReward: 40,
    scientificContext: 'Evening protein supports overnight muscle recovery and stabilizes blood sugar through the night.',
    followUpPromptYes: 'What did you eat for dinner?',
    followUpPromptNo: 'What did you have instead?',
    chipsYes: ['Grilled Salmon & Greens', 'Roast Chicken Breast', 'Grass-Fed Ribeye', 'Steak & Sweet Potato', 'Lentil Stew & Quinoa', 'Ate My Own'],
    chipsNo: ['Light snack', 'Late takeout', 'Skipped dinner'],
  },
  {
    id: 'caffeine_cutoff',
    title: 'Caffeine Cutoff',
    category: 'circadian',
    prompt: 'Did you cut off caffeine 10–12 hours before bed?',
    type: 'boolean_with_time',
    isDefault: true,
    enabled: true,
    xpReward: 35,
    scientificContext: 'Caffeine stays in your system for hours and disrupts deep sleep even if you fall asleep easily.',
    followUpPromptYes: 'When was your last sip?',
    chipsYes: ['Before 12:00 PM', 'Around 01:00 PM', 'Around 02:00 PM', 'No caffeine today'],
  },
];

const STORAGE_KEY = 'cyath_debrief_questions_v1';

export function loadDebriefQuestions(): DebriefQuestion[] {
  if (typeof window === 'undefined') return DEFAULT_DEBRIEF_QUESTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DEBRIEF_QUESTIONS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      if (!parsed.some((q: DebriefQuestion) => q.id === 'dinner_protein')) {
        const dinnerDef = DEFAULT_DEBRIEF_QUESTIONS.find((q) => q.id === 'dinner_protein');
        if (dinnerDef) {
          const lunchIdx = parsed.findIndex((q: DebriefQuestion) => q.id === 'lunch_protein');
          if (lunchIdx !== -1) {
            parsed.splice(lunchIdx + 1, 0, dinnerDef);
          } else {
            parsed.push(dinnerDef);
          }
        }
      }
      return parsed;
    }
  } catch {}
  return DEFAULT_DEBRIEF_QUESTIONS;
}

export function saveDebriefQuestions(questions: DebriefQuestion[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  } catch {}
}
