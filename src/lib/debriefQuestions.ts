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
    title: 'Beauty Sleep (Or Coma Protocol)',
    category: 'circadian',
    prompt: 'What time did you crash yesterday & emerge today?',
    type: 'time_range',
    isDefault: true,
    enabled: true,
    xpReward: 35,
    scientificContext: 'Sleep duration regulates growth hormone and prevents you from turning into a caffeine-dependent zombie.',
  },
  {
    id: 'sunlight',
    title: 'Photosynthe-sis (Morning Sunlight)',
    category: 'circadian',
    prompt: 'Did you get 10+ minutes of outdoor sunshine into your retinas?',
    type: 'boolean',
    isDefault: true,
    enabled: true,
    xpReward: 35,
    scientificContext: 'Photons hitting retinal ganglion cells tell your master circadian clock that you are alive and kicking.',
  },
  {
    id: 'breakfast_protein',
    title: 'The Whey Station: Breakfast',
    category: 'fuel',
    prompt: 'Did you secure your breakfast protein floor (30g+)?',
    type: 'boolean_with_fuel',
    isDefault: true,
    enabled: true,
    xpReward: 40,
    scientificContext: 'Morning amino acids stimulate peptide YY and GLP-1, preventing glucose volatility and sudden donut cravings.',
    followUpPromptYes: 'What was your primary fuel?',
    followUpPromptNo: 'What did you have instead?',
    chipsYes: ['Cast-Iron Eggs', 'Avocado Omelet', 'Greek Yogurt Bowl', 'Protein Oats', 'Tofu Scramble', 'Ate My Own'],
    chipsNo: ['Fasted / Coffee only', 'Light snack', 'Carb pastry', 'Skipped breakfast'],
  },
  {
    id: 'lunch_protein',
    title: 'Midday Meat or Greet: Lunch',
    category: 'fuel',
    prompt: 'Did you secure your high-protein lunch (40g+)?',
    type: 'boolean_with_fuel',
    isDefault: true,
    enabled: true,
    xpReward: 40,
    scientificContext: 'Whole-food protein and fiber blunts post-meal glucose spikes, banishing the dreaded 2 PM desk slump.',
    followUpPromptYes: 'What fueled your afternoon?',
    followUpPromptNo: 'What did you eat?',
    chipsYes: ['Herb Grilled Chicken', 'Turkey & Sweet Potato', 'Salmon & Veggies', 'Ancient Grains & Tofu', 'Steak & Quinoa', 'Ate My Own'],
    chipsNo: ['Quick sandwich', 'High-carb takeout', 'Light salad / soup', 'Skipped lunch'],
  },
  {
    id: 'dinner_protein',
    title: 'Nightcap Gains: Dinner',
    category: 'fuel',
    prompt: 'Did you hit your dinner protein anchor (35g+)?',
    type: 'boolean_with_fuel',
    isDefault: true,
    enabled: true,
    xpReward: 40,
    scientificContext: 'Nighttime amino acids feed myofibrillar protein synthesis during deep sleep so you don’t wake up catabolic.',
    followUpPromptYes: 'What was your dinner fuel?',
    followUpPromptNo: 'What did you eat?',
    chipsYes: ['Grilled Salmon & Greens', 'Roast Chicken Breast', 'Grass-Fed Ribeye', 'Steak & Sweet Potato', 'Lentil Stew & Quinoa', 'Ate My Own'],
    chipsNo: ['Light snack', 'Late carb takeout', 'Skipped dinner'],
  },
  {
    id: 'caffeine_cutoff',
    title: 'Decaf or Die (Caffeine Air-Lock)',
    category: 'circadian',
    prompt: 'Did you cut off caffeine 10–12 hours before bed?',
    type: 'boolean_with_time',
    isDefault: true,
    enabled: true,
    xpReward: 35,
    scientificContext: 'Caffeine has a 6-hour half life and blocks adenosine receptors, destroying slow-wave delta sleep even if you pass out instantly.',
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
