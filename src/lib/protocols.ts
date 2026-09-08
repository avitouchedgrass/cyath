import { HabitItem } from '@/store/useHabitStore';

export interface ProtocolBlueprint {
  id: string;
  name: string;
  shortSummary: string;
  category: 'Morning' | 'Focus' | 'Sleep' | 'Movement';
  icon: 'sun' | 'brain' | 'moon' | 'zap';
  timeframe: string;
  themeColor: {
    badgeBg: string;
    badgeText: string;
    border: string;
    accent: string;
  };
  habits: { title: string; hint: string }[];
  standardHabits: HabitItem[];
  whyItWorks: string;
  simpleHighlights: string[];
}

export const CURATED_PROTOCOLS: ProtocolBlueprint[] = [
  {
    id: 'morning-activation',
    name: 'Morning Sunlight & Energy',
    shortSummary: 'Clears morning grogginess and resets your body clock in 15 minutes.',
    category: 'Morning',
    icon: 'sun',
    timeframe: 'First 30m of day',
    themeColor: {
      badgeBg: 'bg-[#FEF3C7]',
      badgeText: 'text-[#92400E]',
      border: 'border-[#D97706]/40',
      accent: '#D97706',
    },
    habits: [
      { title: '15m outdoor morning sunlight', hint: 'Body clock reset' },
      { title: '500ml water + pinch of sea salt', hint: 'Morning hydration' },
      { title: 'Cold splash or quick rinse', hint: 'Quick alertness boost' },
    ],
    standardHabits: [
      { id: 'sunlight', title: 'Morning Sunlight Exposure (15m)', category: 'morning', targetDaysPerWeek: 7 },
      { id: 'hydration_morning', title: '500ml Water + Electrolytes', category: 'nutrition', targetDaysPerWeek: 7 },
      { id: 'cold_rinse', title: 'Cold Shower or Face Splash', category: 'recovery', targetDaysPerWeek: 6 },
    ],
    whyItWorks: 'Early natural sunlight resets your body clock for the day and sets a natural timer for great sleep 16 hours later.',
    simpleHighlights: [
      'Morning light resets your internal rhythm and stops grogginess faster than coffee.',
      'A tall glass of salted water eliminates overnight dehydration.',
      'Cool water triggers a natural alertness surge without jittery stimulants.',
    ],
  },
  {
    id: 'cognitive-flow',
    name: 'Deep Focus Sprint',
    shortSummary: 'Protects focus and energy for deep creative and analytical work.',
    category: 'Focus',
    icon: 'brain',
    timeframe: 'Morning to Midday',
    themeColor: {
      badgeBg: 'bg-[#EFF6FF]',
      badgeText: 'text-[#1E40AF]',
      border: 'border-[#2563EB]/40',
      accent: '#2563EB',
    },
    habits: [
      { title: 'Zero phone input first 30 mins', hint: 'Protect morning focus' },
      { title: 'High-protein breakfast (35g+)', hint: 'Steady morning energy' },
      { title: '90-min single-task work block', hint: 'Focused work block' },
    ],
    standardHabits: [
      { id: 'zero_phone', title: 'Zero Phone First 30 Mins', category: 'mindset', targetDaysPerWeek: 7 },
      { id: 'protein_breakfast', title: 'High-Protein Breakfast (35g+)', category: 'nutrition', targetDaysPerWeek: 7 },
      { id: 'deep_sprint', title: '90-Min Focus Sprint', category: 'mindset', targetDaysPerWeek: 5 },
    ],
    whyItWorks: 'Avoiding phone notifications early protects your attention, while clean morning protein keeps your energy level for hours.',
    simpleHighlights: [
      'Zero phone notifications in the morning stops reactive stress.',
      'Clean protein prevents the classic 11:00 AM energy crash.',
      '90-minute blocks match your brain’s natural high-focus cycles.',
    ],
  },
  {
    id: 'deep-rem-sleep',
    name: 'Restful Sleep Wind-Down',
    shortSummary: 'Calms your body and mind for deeper, uninterrupted sleep.',
    category: 'Sleep',
    icon: 'moon',
    timeframe: '60 mins prior to bed',
    themeColor: {
      badgeBg: 'bg-[#EEF2FF]',
      badgeText: 'text-[#3730A3]',
      border: 'border-[#4F46E5]/40',
      accent: '#4F46E5',
    },
    habits: [
      { title: 'Screens off 60 mins before bed', hint: 'Better melatonin' },
      { title: 'Cool bedroom temperature (~67°F)', hint: 'Deep sleep trigger' },
      { title: 'Magnesium or herbal chamomile tea', hint: 'Evening relaxation' },
    ],
    standardHabits: [
      { id: 'digital_sunset', title: 'Digital Sunset (Screens Off 60m Prior)', category: 'recovery', targetDaysPerWeek: 7 },
      { id: 'ambient_temp', title: 'Cool Dark Bedroom (67°F)', category: 'recovery', targetDaysPerWeek: 7 },
      { id: 'magnesium_glycine', title: 'Magnesium / Evening Herbal Tea', category: 'recovery', targetDaysPerWeek: 6 },
    ],
    whyItWorks: 'Lowering your core body temperature and dimming screens helps your body produce melatonin naturally.',
    simpleHighlights: [
      'Turning screens off lets your natural sleep hormone ramp up on time.',
      'A cool bedroom signals your body to drop into restorative deep sleep.',
      'A warm herbal tea or magnesium relaxes tension before your head hits the pillow.',
    ],
  },
  {
    id: 'cellular-mobility',
    name: 'Daily Movement & Posture',
    shortSummary: 'Keeps spinal joints supple and reverses the stiffness of long seated sessions.',
    category: 'Movement',
    icon: 'zap',
    timeframe: 'Throughout the day',
    themeColor: {
      badgeBg: 'bg-[#ECFDF5]',
      badgeText: 'text-[#065F46]',
      border: 'border-[#10B981]/40',
      accent: '#059669',
    },
    habits: [
      { title: '10-min post-meal walk', hint: 'Digestive energy' },
      { title: '30-sec spine decompression hang', hint: 'Spine relief' },
      { title: '5-min deep hip opener stretch', hint: 'Hip mobility' },
    ],
    standardHabits: [
      { id: 'post_meal_walk', title: '10-Min Post-Meal Walk', category: 'nutrition', targetDaysPerWeek: 7 },
      { id: 'dead_hang', title: '30-Sec Dead Hang (Spine Relief)', category: 'recovery', targetDaysPerWeek: 6 },
      { id: 'hip_openers', title: '5-Min Hip Mobility Stretch', category: 'recovery', targetDaysPerWeek: 5 },
    ],
    whyItWorks: 'A brief 10-minute walk after eating moderates blood sugar surges and prevents sluggishness.',
    simpleHighlights: [
      'Gentle walking after meals stops post-lunch grogginess immediately.',
      'Hanging decompresses spinal discs compressed by long sitting.',
      'Hip openers restore natural pelvic alignment and lower back comfort.',
    ],
  },
];
