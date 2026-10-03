export interface DebriefQuestion {
  id: string;
  title: string;
  category: 'circadian' | 'fuel' | 'movement' | 'recovery' | 'custom';
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
    title: 'Sleep & Wake Timing',
    category: 'circadian',
    prompt: 'What time did you sleep yesterday & wake up today?',
    type: 'time_range',
    isDefault: true,
    enabled: true,
    xpReward: 30,
    scientificContext: 'Sleep duration and consistency directly regulate cortisol, growth hormone, and prefrontal mental stamina.',
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
    scientificContext: 'Photon stimulation of retinal ganglion cells sets the master circadian clock and triggers melatonin 16h later.',
  },
  {
    id: 'breakfast_protein',
    title: 'Breakfast Protein Floor',
    category: 'fuel',
    prompt: 'Did you hit your breakfast protein target (30g+)?',
    type: 'boolean_with_fuel',
    isDefault: true,
    enabled: true,
    xpReward: 40,
    scientificContext: 'Morning amino acids stimulate peptide YY and GLP-1, preventing glucose volatility and midday brain fog.',
    followUpPromptYes: 'What was your primary fuel?',
    followUpPromptNo: 'What did you have instead?',
    chipsYes: ['Cast-Iron Eggs', 'Paneer Bhurji', 'Greek Yogurt Bowl', 'Protein Oats', 'Tofu Scramble', 'Ate My Own'],
    chipsNo: ['Fasted / Coffee only', 'Light snack', 'Carb pastry', 'Skipped breakfast'],
  },
  {
    id: 'lunch_protein',
    title: 'Lunch Protein Anchor',
    category: 'fuel',
    prompt: 'Did you secure your high-protein lunch (40g+)?',
    type: 'boolean_with_fuel',
    isDefault: true,
    enabled: true,
    xpReward: 40,
    scientificContext: 'Whole-food protein and fiber blunts post-prandial glycemic excursions, eliminating the 2 PM desk slump.',
    followUpPromptYes: 'What fueled your afternoon?',
    followUpPromptNo: 'What did you eat?',
    chipsYes: ['Herb Grilled Chicken', 'Tawa Paneer Bowl', 'Salmon & Veggies', 'Ancient Grains & Tofu', 'Soya / Dal Bowl', 'Ate My Own'],
    chipsNo: ['Quick sandwich', 'High-carb takeout', 'Light salad / soup', 'Skipped lunch'],
  },
  {
    id: 'dinner_protein',
    title: 'Dinner Protein Floor',
    category: 'fuel',
    prompt: 'Did you hit your dinner protein anchor (35g+)?',
    type: 'boolean_with_fuel',
    isDefault: true,
    enabled: true,
    xpReward: 40,
    scientificContext: 'Nighttime amino acids support myofibrillar protein synthesis during slow-wave sleep and stabilize overnight blood glucose.',
    followUpPromptYes: 'What was your dinner fuel?',
    followUpPromptNo: 'What did you eat?',
    chipsYes: ['Grilled Salmon & Greens', 'Roast Chicken Breast', 'Paneer Tikka Bowl', 'Steak & Sweet Potato', 'Lentil Stew & Quinoa', 'Ate My Own'],
    chipsNo: ['Light snack', 'Late carb takeout', 'Skipped dinner'],
  },
  {
    id: 'caffeine_cutoff',
    title: 'Caffeine Air-Lock',
    category: 'circadian',
    prompt: 'Did you cut off caffeine 10–12 hours before bed?',
    type: 'boolean_with_time',
    isDefault: true,
    enabled: true,
    xpReward: 35,
    scientificContext: 'Caffeine has a 5-7 hour half-life and blocks adenosine receptors, destroying slow-wave delta sleep even if you fall asleep easily.',
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
